import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const STORE = join(here, "..", "..", ".data", "metrics.json");

export const EVENTS = ["view", "resume", "chat"] as const;
export type EventName = (typeof EVENTS)[number];

type Day = Record<EventName, number>;
type Store = { since: string; days: Record<string, Day> };

/** Two months of buckets so a 30-day window always has history behind it. */
const KEEP_DAYS = 60;
const WINDOW_DAYS = 30;

const emptyDay = (): Day => ({ view: 0, resume: 0, chat: 0 });
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/**
 * What this stores, exhaustively: three counters per calendar day.
 *
 * No IP addresses, no user agents, no identifiers, no per-visitor rows —
 * there is deliberately nothing here that could be traced to a person, which
 * is what lets the panel be public and needs no cookie banner.
 */
function load(): Store {
  try {
    const raw = JSON.parse(readFileSync(STORE, "utf8")) as Store;
    if (raw?.since && raw.days) return raw;
  } catch {
    // first boot, or the file was lost with the container
  }
  return { since: new Date().toISOString(), days: {} };
}

const store = load();
let dirty = false;

function prune() {
  const cutoff = dayKey(new Date(Date.now() - KEEP_DAYS * 86_400_000));
  for (const key of Object.keys(store.days)) {
    if (key < cutoff) delete store.days[key];
  }
}

function flush() {
  if (!dirty) return;
  try {
    mkdirSync(dirname(STORE), { recursive: true });
    writeFileSync(STORE, JSON.stringify(store));
    dirty = false;
  } catch (err) {
    // A read-only or full filesystem must not take the API down; the counters
    // simply stay in memory until the process ends.
    console.error("metrics: could not persist", err);
  }
}

// Batched rather than written on every event: this is a counter file, and a
// hit of disk I/O per page view is a silly cost for data nobody reads in real
// time.
const timer = setInterval(flush, 30_000);
timer.unref?.();
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    flush();
    process.exit(0);
  });
}

export function record(event: EventName) {
  const key = dayKey(new Date());
  store.days[key] ??= emptyDay();
  store.days[key][event] += 1;
  dirty = true;
  prune();
}

/**
 * Response latency, sampled in memory.
 *
 * A ring of recent durations rather than a persisted series: p95 is only
 * meaningful about recent traffic, and keeping it in memory means a restart
 * costs nothing worth having.
 */
const LATENCY_SAMPLES = 500;
const latencies: number[] = [];

export function observeLatency(ms: number) {
  latencies.push(ms);
  if (latencies.length > LATENCY_SAMPLES) latencies.shift();
}

function p95() {
  if (!latencies.length) return null;
  const sorted = [...latencies].sort((a, b) => a - b);
  return Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? sorted.at(-1) ?? 0);
}

export function snapshot() {
  const today = new Date();
  const series: { day: string; views: number }[] = [];
  const totals = emptyDay();

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const key = dayKey(new Date(today.getTime() - i * 86_400_000));
    const day = store.days[key] ?? emptyDay();
    series.push({ day: key, views: day.view });
    for (const name of EVENTS) totals[name] += day[name];
  }

  return {
    // The panel labels itself from this rather than claiming "last 30 days"
    // outright — on a free tier the store is younger than the window more
    // often than not, and a window that overstates its own history is exactly
    // the kind of number this panel exists not to print.
    since: store.since,
    windowDays: WINDOW_DAYS,
    totals,
    series,
    latencyP95: p95(),
    uptimeSeconds: Math.round(process.uptime()),
  };
}

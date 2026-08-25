import { EVENTS, type EventName, dayKey, emptyDay, store } from "./metricsStore.js";

export { EVENTS, durable } from "./metricsStore.js";
export type { EventName } from "./metricsStore.js";

/** The window the panel reports on. */
const WINDOW_DAYS = 30;

/**
 * What this stores, exhaustively: three counters per calendar day.
 *
 * No IP addresses, no user agents, no identifiers, no per-visitor rows — there
 * is deliberately nothing here that could be traced to a person, which is what
 * lets the panel be public and needs no cookie banner.
 */
export function record(event: EventName) {
  store.record(event);
}

/**
 * Response latency, sampled in memory.
 *
 * A ring of recent durations rather than a persisted series: p95 is only
 * meaningful about recent traffic, so a restart costs nothing worth having.
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

export async function snapshot() {
  const today = new Date();
  const days = Array.from({ length: WINDOW_DAYS }, (_, i) =>
    dayKey(new Date(today.getTime() - (WINDOW_DAYS - 1 - i) * 86_400_000)),
  );

  const stored = await store.read(days);
  const totals = emptyDay();
  const series = days.map((day) => {
    const bucket = stored.days[day] ?? emptyDay();
    for (const name of EVENTS) totals[name] += bucket[name];
    return { day, views: bucket.view };
  });

  return {
    // The panel labels itself from this rather than claiming "last 30 days"
    // outright: a window that overstates its own history is exactly the kind
    // of number this panel exists not to print.
    since: stored.since,
    windowDays: WINDOW_DAYS,
    totals,
    series,
    latencyP95: p95(),
    uptimeSeconds: Math.round(process.uptime()),
    store: store.health(),
  };
}

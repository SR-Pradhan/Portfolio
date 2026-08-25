/**
 * Where the counters live.
 *
 * Two drivers behind one interface. On Render's free tier the filesystem is
 * ephemeral — a deploy or a spin-down after fifteen idle minutes hands the
 * process a fresh container — so a file-backed counter on a low-traffic site
 * reads zero most of the time, which is worse than showing nothing. When
 * Upstash credentials are present the counters go to Redis over HTTP and
 * survive both; without them the file driver keeps local development working
 * with nothing to configure.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FILE = join(here, "..", "..", ".data", "metrics.json");

export const EVENTS = ["view", "resume", "chat"] as const;
export type EventName = (typeof EVENTS)[number];
export type Day = Record<EventName, number>;
export type Snapshot = { since: string; days: Record<string, Day> };

export const emptyDay = (): Day => ({ view: 0, resume: 0, chat: 0 });
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Two months of history, so a 30-day window always has room behind it. */
const KEEP_DAYS = 60;
const TTL_SECONDS = KEEP_DAYS * 24 * 60 * 60;

export type Health = { driver: "upstash" | "file"; ok: boolean; lastError: string | null };

export interface Store {
  record(event: EventName): void;
  read(days: string[]): Promise<Snapshot>;
  /**
   * Why the panel is showing what it is showing.
   *
   * A counter store that fails silently is the worst version of this feature:
   * the page prints zeros, which reads as "nobody visits" rather than "the
   * database is misconfigured". Status codes only — never anything from the
   * credentials.
   */
  health(): Health;
}

/* ── File driver ──────────────────────────────────────────────────────── */

class FileStore implements Store {
  private data: Snapshot;
  private dirty = false;

  constructor() {
    this.data = this.load();
    // Batched rather than written per event: this is a counter file, and a hit
    // of disk I/O per page view is a silly cost for data nobody reads live.
    const timer = setInterval(() => this.flush(), 30_000);
    timer.unref?.();
    for (const signal of ["SIGTERM", "SIGINT"] as const) {
      process.once(signal, () => {
        this.flush();
        process.exit(0);
      });
    }
  }

  private load(): Snapshot {
    try {
      const raw = JSON.parse(readFileSync(FILE, "utf8")) as Snapshot;
      if (raw?.since && raw.days) return raw;
    } catch {
      // first boot, or the file went with the container
    }
    return { since: new Date().toISOString(), days: {} };
  }

  private flush() {
    if (!this.dirty) return;
    try {
      mkdirSync(dirname(FILE), { recursive: true });
      writeFileSync(FILE, JSON.stringify(this.data));
      this.dirty = false;
    } catch (err) {
      // A read-only or full disk must not take the API down; the counters just
      // stay in memory until the process ends.
      console.error("metrics: could not persist", err);
    }
  }

  record(event: EventName) {
    const key = dayKey(new Date());
    this.data.days[key] ??= emptyDay();
    this.data.days[key][event] += 1;
    this.dirty = true;

    const cutoff = dayKey(new Date(Date.now() - KEEP_DAYS * 86_400_000));
    for (const day of Object.keys(this.data.days)) {
      if (day < cutoff) delete this.data.days[day];
    }
  }

  async read(): Promise<Snapshot> {
    return this.data;
  }

  health(): Health {
    return { driver: "file", ok: true, lastError: null };
  }
}

/**
 * Strips anything credential-shaped out of a message bound for the public
 * health field: URLs, and `user:password@host` pairs.
 */
function redact(message: string) {
  return message
    .replace(/[a-z]+:\/\/[^\s]+/gi, "<url>")
    .replace(/[^\s:]+:[^\s@]+@[^\s]+/g, "<credentials>")
    .slice(0, 120);
}

/* ── Upstash driver ───────────────────────────────────────────────────── */

/**
 * Upstash's REST API, which is why this works from Render at all: a plain
 * HTTPS POST per pipeline, no TCP connection to hold open and nothing to
 * reconnect after the instance sleeps.
 */
class UpstashStore implements Store {
  private cache: { at: number; data: Snapshot } | null = null;
  private lastError: string | null = null;
  /** Counted here too, so the panel reflects a visit that just happened. */
  private pending: Record<string, Day> = {};

  constructor(
    private url: string,
    private token: string,
  ) {}

  private async pipeline(commands: (string | number)[][]): Promise<{ result: unknown }[]> {
    let res: Response;
    try {
      res = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
      });
    } catch {
      // Never let the underlying error through: fetch puts the URL it tried
      // into its message, and if someone has pasted a redis:// connection
      // string into the env var, that URL contains the password. This message
      // is reported publicly by /api/metrics.
      throw new Error("unreachable — check UPSTASH_REDIS_REST_URL");
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { result: unknown; error?: string }[];
    // Upstash answers 200 with a per-command `error` when a command itself is
    // rejected — a read-only token failing a write looks exactly like this, so
    // the status code alone would report success.
    const failed = body.find((r) => r.error);
    if (failed) throw new Error(redact(failed.error ?? "command rejected"));
    return body;
  }

  record(event: EventName) {
    const day = dayKey(new Date());
    this.pending[day] ??= emptyDay();
    this.pending[day][event] += 1;

    // Fire and forget: a visitor's page must never wait on a counter, and a
    // dropped increment is an acceptable loss for a number like this.
    void this.pipeline([
      ["HINCRBY", `metrics:${day}`, event, 1],
      ["EXPIRE", `metrics:${day}`, TTL_SECONDS],
      // NX: only the first write ever sets it, so "since" is when counting
      // actually began rather than when this container booted.
      ["SET", "metrics:since", new Date().toISOString(), "NX"],
    ])
      .then(() => {
        this.lastError = null;
      })
      .catch((err: Error) => {
        this.lastError = redact(`write: ${err.message}`);
        console.error("metrics: upstash write failed", err.message);
      });
  }

  async read(days: string[]): Promise<Snapshot> {
    // One round trip per five minutes at most.
    //
    // Each read is 31 commands (a GET plus one HGETALL per day in the window),
    // and Upstash's free tier is metered per command — at a 30-second cache a
    // busy day could spend the monthly allowance by itself. Writes are still
    // immediate, and the local overlay means a visitor's own view shows up at
    // once regardless.
    if (this.cache && Date.now() - this.cache.at < 300_000) return this.merged(this.cache.data);

    try {
      const results = await this.pipeline([
        ["GET", "metrics:since"],
        ...days.map((d) => ["HGETALL", `metrics:${d}`]),
      ]);

      const since = (results[0]?.result as string) || new Date().toISOString();
      const parsed: Record<string, Day> = {};
      days.forEach((day, i) => {
        // HGETALL comes back as a flat [field, value, field, value] array.
        const flat = (results[i + 1]?.result as string[]) ?? [];
        const bucket = emptyDay();
        for (let j = 0; j < flat.length; j += 2) {
          const field = flat[j] as EventName;
          if (EVENTS.includes(field)) bucket[field] = Number(flat[j + 1]) || 0;
        }
        parsed[day] = bucket;
      });

      this.cache = { at: Date.now(), data: { since, days: parsed } };
      // Everything written before this read is now in the response, so the
      // local overlay has done its job. An increment fired during the round
      // trip may miss this snapshot and appear in the next one — a display
      // counter can afford that; double-counting it would be worse.
      this.pending = {};
      this.lastError = null;
      return this.cache.data;
    } catch (err) {
      this.lastError = redact(`read: ${(err as Error).message}`);
      console.error("metrics: upstash read failed", (err as Error).message);
      // Serve the last good snapshot, or at minimum what this instance has
      // counted itself. Dropping `pending` here was wrong: a store outage
      // turned real visits into zeros rather than into a smaller number.
      return this.merged(this.cache?.data ?? { since: new Date().toISOString(), days: {} });
    }
  }

  health(): Health {
    return { driver: "upstash", ok: this.lastError === null, lastError: this.lastError };
  }

  /** Folds writes made since the last read on top of the cached snapshot. */
  private merged(base: Snapshot): Snapshot {
    const days: Record<string, Day> = {};
    for (const [day, counts] of Object.entries(base.days)) days[day] = { ...counts };
    for (const [day, counts] of Object.entries(this.pending)) {
      days[day] ??= emptyDay();
      for (const event of EVENTS) days[day][event] += counts[event];
    }
    return { since: base.since, days };
  }
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const store: Store = url && token ? new UpstashStore(url, token) : new FileStore();
export const durable = Boolean(url && token);

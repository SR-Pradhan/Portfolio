import { Router } from "express";
import { z } from "zod";
import { EVENTS, record, snapshot } from "../lib/metrics.js";

const router = Router();

const EventSchema = z.object({ event: z.enum(EVENTS) });

/** Crude in-memory rate limit: 60 events per IP per hour. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 60;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/**
 * The counters behind the "this site" panel.
 *
 * Public because everything in it is aggregate — see lib/metrics.ts for what
 * is actually stored, which is three integers a day and nothing else.
 */
router.get("/", async (_req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.json({ ok: true, ...(await snapshot()) });
});

/**
 * One event, by name from a fixed list. The body cannot carry a path, an id or
 * any free text, so there is nothing a caller could smuggle into the store.
 *
 * A 429 returns 204 rather than an error: this is fire-and-forget telemetry,
 * and the browser has nothing useful to do with a failure.
 */
router.post("/event", (req, res) => {
  if (rateLimited(req.ip ?? "unknown")) return res.status(204).end();

  const parsed = EventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });

  record(parsed.data.event);
  res.status(204).end();
});

export default router;

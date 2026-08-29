import { createHash, randomUUID } from "node:crypto";
import { Router, type Response } from "express";

const router = Router();

/**
 * Who is reading, right now.
 *
 * A Server-Sent Events stream that holds the connection open and pushes the
 * current reader count whenever it changes. The count is derived from the open
 * connections themselves, so it needs no storage and no polling: a reader
 * appears when their stream opens and disappears when the socket closes, which
 * the browser does for them on navigation, tab close and sleep.
 *
 * Nothing about a visitor is stored. Addresses are hashed with a salt generated
 * fresh at boot, held only for as long as the connection is open, and never
 * written anywhere — the hash exists solely so that one person with four tabs
 * counts once rather than four times. A restart makes every previous hash
 * meaningless, which is the point.
 */
const SALT = randomUUID();
const readers = new Map<string, Set<Response>>();

const fingerprint = (ip: string) =>
  createHash("sha256").update(SALT).update(ip).digest("hex").slice(0, 16);

const count = () => readers.size;

function broadcast() {
  const payload = `event: presence\ndata: ${JSON.stringify({ count: count() })}\n\n`;
  for (const streams of readers.values()) {
    for (const stream of streams) stream.write(payload);
  }
}

/**
 * Proxies and load balancers close a connection that says nothing. A comment
 * frame every 25s keeps it open without being an event the client has to
 * handle — SSE ignores lines starting with a colon.
 */
const heartbeat = setInterval(() => {
  for (const streams of readers.values()) {
    for (const stream of streams) stream.write(": ping\n\n");
  }
}, 25_000);
heartbeat.unref?.();

router.get("/", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Render and most reverse proxies buffer responses by default, which holds
    // every event until the stream ends — exactly wrong for SSE.
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const id = fingerprint(req.ip ?? "unknown");
  const existing = readers.get(id);
  const isNewReader = !existing;

  if (existing) existing.add(res);
  else readers.set(id, new Set([res]));

  // A new reader moves the number, so the broadcast already reaches this
  // stream — sending a snapshot as well would deliver the same frame twice.
  // A second tab from a reader already counted changes nothing for anyone
  // else, so that one gets the snapshot alone.
  if (isNewReader) broadcast();
  else res.write(`event: presence\ndata: ${JSON.stringify({ count: count() })}\n\n`);

  res.on("close", () => {
    const streams = readers.get(id);
    if (!streams) return;
    streams.delete(res);
    if (streams.size === 0) {
      readers.delete(id);
      broadcast();
    }
    res.end();
  });
});

export default router;

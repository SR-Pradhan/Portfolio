import { Router, type Response } from "express";

const router = Router();

/**
 * Who is reading, right now.
 *
 * A Server-Sent Events stream that holds the connection open and pushes the
 * current count whenever it changes. The count is derived from the open
 * connections themselves, so it needs no storage and no polling: a reader
 * appears when their stream opens and disappears when the socket closes, which
 * the browser does for them on navigation, tab close and sleep.
 *
 * One open page is one reader. An earlier version deduplicated by hashed IP so
 * that several tabs counted once — which was wrong in the case that actually
 * matters: two people behind the same router, or one person in two browser
 * profiles, share an address and collapsed into a single reader. Counting
 * connections is both closer to the truth and simpler to explain, and it means
 * nothing about a visitor is derived at all, not even transiently.
 */
const streams = new Set<Response>();

function broadcast() {
  const payload = `event: presence\ndata: ${JSON.stringify({ count: streams.size })}\n\n`;
  for (const stream of streams) stream.write(payload);
}

/**
 * Proxies and load balancers close a connection that says nothing. A comment
 * frame every 25s keeps it open without being an event the client has to
 * handle — SSE ignores lines starting with a colon.
 */
const heartbeat = setInterval(() => {
  for (const stream of streams) stream.write(": ping\n\n");
}, 25_000);
heartbeat.unref?.();

router.get("/", (_req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Render and most reverse proxies buffer responses by default, which holds
    // every event until the stream ends — exactly wrong for SSE.
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  streams.add(res);
  // The new stream is already in the set, so the broadcast reaches it too;
  // sending a snapshot as well would deliver the same frame twice.
  broadcast();

  res.on("close", () => {
    streams.delete(res);
    broadcast();
    res.end();
  });
});

export default router;

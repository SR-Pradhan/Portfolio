import { Router } from "express";
import { z } from "zod";
import { chatEnabled, streamReply, type ChatMessage } from "../lib/chat.js";

const router = Router();

/**
 * History comes from the browser, so treat it as untrusted input: only the two
 * roles are accepted (no injected system turns), lengths are capped, and the
 * transcript is trimmed server-side so a long session can't inflate cost.
 */
const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(40),
});

/** 30 messages per IP per hour — generous for a visitor, useless for a scraper. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

router.post("/", async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (rateLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, error: "Too many messages. Try again later." });
  }

  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "Invalid message." });
  }

  // keep only the recent turns — older context adds cost without adding much
  const messages = parsed.data.messages.slice(-12) as ChatMessage[];

  // Server-Sent Events: one `data:` line per text delta, then a done marker.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (payload: object) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  if (!chatEnabled) {
    send({
      text:
        "The chat assistant isn't configured on this deployment yet. " +
        "You can reach Sruti directly at pradhansr2003@gmail.com.",
    });
    send({ done: true });
    return res.end();
  }

  // stop generating if the visitor closes the tab mid-answer
  let aborted = false;
  req.on("close", () => {
    aborted = true;
  });

  try {
    for await (const delta of streamReply(messages)) {
      if (aborted) break;
      send({ text: delta });
    }
    send({ done: true });
  } catch (err) {
    console.error("Chat failed:", err);
    send({ error: "Something went wrong. Please try again." });
  } finally {
    res.end();
  }
});

export default router;

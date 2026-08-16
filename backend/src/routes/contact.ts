import { Router } from "express";
import { z } from "zod";
import { sendContactEmail } from "../lib/mailer.js";

const router = Router();

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  /** Honeypot — real users never fill this; bots usually do. */
  website: z.string().max(0).optional(),
});

/** Crude in-memory rate limit: 5 messages per IP per hour. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

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

  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Please check the form fields.",
      issues: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Honeypot tripped — pretend it worked so the bot doesn't retry.
  if (parsed.data.website) {
    return res.json({ ok: true });
  }

  try {
    await sendContactEmail(parsed.data);
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to send contact email:", err);
    res.status(500).json({ ok: false, error: "Could not send message." });
  }
});

export default router;

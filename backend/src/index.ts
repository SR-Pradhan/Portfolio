import "dotenv/config";
import cors from "cors";
import express from "express";
import chatRouter from "./routes/chat.js";
import contactRouter from "./routes/contact.js";
import { observeLatency } from "./lib/metrics.js";
import githubRouter from "./routes/github.js";
import metricsRouter from "./routes/metrics.js";
import presenceRouter from "./routes/presence.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// Only the portfolio frontend may call this API.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // no Origin header = curl / server-to-server, allow it
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin not allowed: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "16kb" }));

/**
 * Times every request so the metrics panel can report a real p95 rather than a
 * number measured from the browser, which would mostly be describing the
 * visitor's own connection.
 */
app.use((req, res, next) => {
  const started = process.hrtime.bigint();
  res.on("finish", () => {
    // the metrics endpoints themselves would only measure themselves
    if (req.path.startsWith("/api/metrics")) return;
    observeLatency(Number(process.hrtime.bigint() - started) / 1e6);
  });
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);
app.use("/api/github", githubRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/presence", presenceRouter);

// Fallback error handler — keeps stack traces out of responses.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});

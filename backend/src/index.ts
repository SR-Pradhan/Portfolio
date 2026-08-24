import "dotenv/config";
import cors from "cors";
import express from "express";
import chatRouter from "./routes/chat.js";
import contactRouter from "./routes/contact.js";
import githubRouter from "./routes/github.js";

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

app.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);
app.use("/api/github", githubRouter);

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

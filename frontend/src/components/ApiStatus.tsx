"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Anything slower than this is a container waking up, not a slow response. */
const COLD_MS = 2500;

type State =
  | { kind: "checking" }
  | { kind: "waking" }
  | { kind: "up"; ms: number }
  | { kind: "down" };

/**
 * Live reachability and round-trip time for the API behind the chat and the
 * contact form.
 *
 * The honest version of a status badge: the backend runs on a free tier that
 * sleeps after fifteen minutes idle, so a visitor's first message can take the
 * best part of a minute. Saying so — and showing the real number once it is
 * awake — is worth more than a green dot that is always green, and it is the
 * same instrumentation the loading curtain reports at the top of the page.
 */
export default function ApiStatus() {
  const [state, setState] = useState<State>({ kind: "checking" });

  useEffect(() => {
    const abort = new AbortController();
    const started = performance.now();

    // Flip to "waking" while the request is still open, rather than after it
    // resolves — a cold start is precisely the case where nothing resolves for
    // a long time, so it has to be reported from a timer.
    const slow = setTimeout(() => {
      setState((s) => (s.kind === "checking" ? { kind: "waking" } : s));
    }, COLD_MS);

    fetch(`${API_URL}/health`, { signal: abort.signal, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        setState({ kind: "up", ms: Math.round(performance.now() - started) });
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ kind: "down" });
      })
      .finally(() => clearTimeout(slow));

    return () => {
      clearTimeout(slow);
      abort.abort();
    };
  }, []);

  const dot =
    state.kind === "up"
      ? "bg-emerald-400"
      : state.kind === "down"
        ? "bg-muted"
        : "bg-amber-400";

  const label = {
    checking: "Checking API…",
    waking: "API waking from idle…",
    up: "API operational",
    down: "API unreachable",
  }[state.kind];

  return (
    <p
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
      role="status"
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={`size-1.5 rounded-full ${dot} ${
            state.kind === "checking" || state.kind === "waking" ? "animate-pulse" : ""
          }`}
        />
        {label}
      </span>

      {state.kind === "up" && (
        <>
          <span aria-hidden className="text-border">
            /
          </span>
          <span className="text-foreground">{state.ms}ms round trip</span>
        </>
      )}

      {state.kind === "waking" && (
        <>
          <span aria-hidden className="text-border">
            /
          </span>
          <span className="normal-case tracking-normal text-muted/80">
            free tier, first request is slow
          </span>
        </>
      )}
    </p>
  );
}

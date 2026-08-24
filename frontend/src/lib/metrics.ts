"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type SiteMetrics = {
  since: string;
  windowDays: number;
  totals: { view: number; resume: number; chat: number };
  series: { day: string; views: number }[];
  latencyP95: number | null;
  uptimeSeconds: number;
};

/**
 * Fire-and-forget event ping.
 *
 * `keepalive` so a click that navigates away (the résumé opening in a new tab,
 * for instance) still gets counted, and every failure is swallowed: telemetry
 * must never be able to interrupt what the visitor was doing.
 */
export function track(event: "view" | "resume" | "chat") {
  try {
    void fetch(`${API_URL}/api/metrics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no network, blocked by an extension, API asleep — all fine
  }
}

/**
 * A view is one visit, not one render.
 *
 * Counted once per tab session, so a visitor bouncing between sections or
 * reloading doesn't inflate the number the panel prints. The same reason the
 * loading curtain only plays once per tab.
 */
export function trackView() {
  try {
    if (sessionStorage.getItem("counted-view")) return;
    sessionStorage.setItem("counted-view", "1");
  } catch {
    // storage blocked: counting the view is better than dropping it
  }
  track("view");
}

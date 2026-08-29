"use client";

import { useEffect, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { usePresence } from "@/hooks/usePresence";
import { type SiteMetrics as Metrics, trackView } from "@/lib/metrics";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Views per day across the window, as one 30-point line. */
function Sparkline({ series }: { series: { day: string; views: number }[] }) {
  const peak = Math.max(...series.map((d) => d.views), 1);
  const w = 100;
  const h = 24;
  const step = series.length > 1 ? w / (series.length - 1) : w;
  const points = series.map((d, i) => `${i * step},${h - (d.views / peak) * h}`);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      {/* area first, then the line over it, so the stroke stays crisp */}
      <polygon
        points={`0,${h} ${points.join(" ")} ${w},${h}`}
        fill="currentColor"
        className="text-accent/15"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className="text-accent"
      />
    </svg>
  );
}

/**
 * How much history the counters actually have.
 *
 * Read here rather than during render: the clock is not a pure value, and a
 * component that reads it while rendering can print one thing and re-render
 * into another.
 */
function windowLabel(d: Metrics) {
  const days = Math.max(1, Math.round((Date.now() - new Date(d.since).getTime()) / 86_400_000));
  return days >= d.windowDays
    ? `last ${d.windowDays} days`
    : `${days} day${days > 1 ? "s" : ""}`;
}

function Stat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const { ref, value: shown } = useCountUp(value);
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p
        ref={ref as React.Ref<HTMLParagraphElement>}
        className="mt-1 font-mono text-xl tabular-nums text-foreground"
      >
        {shown.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
}

/**
 * The site reporting on itself.
 *
 * Every other number on this page describes work done elsewhere; these describe
 * the page you are currently on, which is the one claim a visitor can check by
 * being here. It is also the honest version of a "10k visitors" badge: the
 * window is labelled from when counting actually started, so a freshly deployed
 * backend says "since today" rather than implying a month of history it
 * doesn't have.
 *
 * Renders nothing at all if the API is unreachable — an empty analytics panel
 * is worse than no analytics panel.
 */
export default function SiteMetrics() {
  const [data, setData] = useState<(Metrics & { window: string }) | null>(null);
  const here = usePresence();

  useEffect(() => {
    trackView();

    const abort = new AbortController();
    fetch(`${API_URL}/api/metrics`, { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Metrics | null) => d && setData({ ...d, window: windowLabel(d) }))
      .catch(() => {});

    return () => abort.abort();
  }, []);

  if (!data) return null;

  return (
    <section aria-label="Site metrics" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            This site · {data.window}
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">
            {/* Only shown when someone is actually there. A hardcoded "1" that
                is always the reader themselves would be theatre, and a "0" is
                impossible by definition — you are here to read it. */}
            {here !== null && here > 0 && (
              <>
                <span className="flex items-center gap-2 text-accent">
                  <span className="relative flex size-1.5">
                    <span className="live-ping absolute inline-flex size-full rounded-full bg-accent" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                  </span>
                  <span className="text-foreground">{here}</span> reading now
                </span>
                <span aria-hidden className="text-border">
                  ·
                </span>
              </>
            )}
            aggregate only · no cookies · no personal data
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Views" value={data.totals.view} />
          <Stat label="Résumé opens" value={data.totals.resume} />
          <Stat label="Questions asked" value={data.totals.chat} />
          <Stat label="API p95" value={data.latencyP95 ?? 0} suffix="ms" />
        </div>

        <div className="mt-6 text-accent">
          <Sparkline series={data.series} />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">
            <span>{data.series[0]?.day}</span>
            <span>views per day</span>
            <span>today</span>
          </div>
        </div>
      </div>
    </section>
  );
}

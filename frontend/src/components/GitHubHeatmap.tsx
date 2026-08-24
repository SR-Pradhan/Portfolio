"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Day = { date: string; count: number; level: number };
type Contributions = {
  total: number;
  streak: { current: number; longest: number };
  weeks: { days: Day[] }[];
};

/** Level 0 is a track, not a colour — everything above it is one accent ramp. */
const LEVEL_CLASS = [
  "bg-foreground/[0.07]",
  "bg-accent/25",
  "bg-accent/45",
  "bg-accent/70",
  "bg-accent",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Month labels, placed above the first week that actually starts a month.
 *
 * Spacing them evenly would drift out of step with the grid, because months
 * are not a whole number of weeks long.
 */
function monthLabels(weeks: { days: Day[] }[]) {
  const labels: { index: number; label: string }[] = [];
  let last = -1;
  weeks.forEach((week, i) => {
    const first = week.days[0];
    if (!first) return;
    const month = new Date(first.date).getUTCMonth();
    if (month !== last && i < weeks.length - 1) {
      labels.push({ index: i, label: MONTHS[month] });
      last = month;
    }
  });
  return labels;
}

/**
 * A year of GitHub contributions.
 *
 * The GitHub icon in the hero proves the account exists and the project cards
 * prove one repo was pushed recently; neither shows consistency over a year,
 * which is the single thing this grid communicates in about half a second.
 *
 * Renders nothing when the backend has no GITHUB_TOKEN configured — the
 * calendar is GraphQL-only, and an empty grid would read as "never commits"
 * rather than "not configured".
 */
export default function GitHubHeatmap() {
  const [data, setData] = useState<Contributions | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    /**
     * One fetch is not enough against a free tier that sleeps.
     *
     * A cold Render instance can take the better part of a minute to answer
     * its first request, and the calendar is fetched exactly once on mount —
     * so a single failure used to hide this section for the whole visit, with
     * nothing on screen to say why. Three tries, backing off, covers a cold
     * start without hammering a backend that is genuinely down.
     */
    const load = (attempt = 0) => {
      fetch(`${API_URL}/api/github/contributions`, { signal: abort.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { enabled?: boolean; contributions?: Contributions } | null) => {
          if (d?.enabled && d.contributions) return setData(d.contributions);
          // `enabled: false` is a settled answer (no token) — don't retry it.
          if (d && d.enabled === false) return;
          throw new Error("no contributions in response");
        })
        .catch(() => {
          if (abort.signal.aborted || attempt >= 2) return;
          timer = setTimeout(() => load(attempt + 1), 4000 * (attempt + 1));
        });
    };
    load();

    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, []);

  if (!data) return null;

  const labels = monthLabels(data.weeks);

  return (
    <section aria-label="GitHub contributions" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            GitHub activity · last 12 months
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <span className="text-foreground">{data.total.toLocaleString()}</span> contributions
            {data.streak.current > 0 && (
              <>
                <span aria-hidden className="mx-2 text-border">
                  /
                </span>
                <span className="text-foreground">{data.streak.current}</span> day streak
              </>
            )}
          </p>
        </div>

        {/* Scrolls rather than shrinking: below about 700px the year cannot fit
            at a legible cell size, and a heatmap of 4px dots says nothing. */}
        <div className="mt-5 overflow-x-auto pb-1">
          <div className="min-w-max">
            <div className="mb-1.5 flex gap-[3px] font-mono text-[9px] uppercase tracking-wider text-muted/70">
              {data.weeks.map((_, i) => {
                const label = labels.find((l) => l.index === i);
                return (
                  <span key={i} className="w-[11px] shrink-0">
                    {label?.label ?? ""}
                  </span>
                );
              })}
            </div>

            <div
              className="flex gap-[3px]"
              role="img"
              aria-label={`${data.total} contributions in the last year on GitHub, longest streak ${data.streak.longest} days`}
            >
              {data.weeks.map((week, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {week.days.map((day) => (
                    <span
                      key={day.date}
                      title={`${day.count} on ${day.date}`}
                      className={`size-[11px] rounded-[2px] ${LEVEL_CLASS[day.level] ?? LEVEL_CLASS[0]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-accent"
          >
            github.com/{site.socials.github.split("/").pop()}
          </a>
          <span className="flex items-center gap-1.5">
            Less
            {LEVEL_CLASS.map((cls) => (
              <span key={cls} className={`size-[11px] rounded-[2px] ${cls}`} />
            ))}
            More
          </span>
        </div>
      </div>
    </section>
  );
}

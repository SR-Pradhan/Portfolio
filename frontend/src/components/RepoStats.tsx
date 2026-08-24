"use client";

import { GitFork, Star } from "lucide-react";
import type { RepoStats as Stats } from "@/hooks/useRepoStats";

/** "4 days ago" — coarse on purpose; the exact hour of a push means nothing. */
function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

/**
 * The language split, as one bar.
 *
 * Tints of the accent rather than GitHub's language colours: six unrelated
 * hues would be the loudest thing on a card whose own palette is two colours.
 * Order carries the ranking, so the tints only have to be distinguishable from
 * each other, not meaningful on their own.
 */
const TINTS = ["bg-accent", "bg-accent/55", "bg-accent/30"];

/**
 * Live repository facts under a project card — last push, language split, and
 * stars or forks when there are any.
 *
 * Stars are hidden at zero deliberately. A personal project having none is
 * normal; printing "★ 0" turns a non-fact into a visible negative, while the
 * push date is the number that actually says the work is alive.
 */
export default function RepoStats({ stats }: { stats: Stats }) {
  const pushed = ago(stats.pushedAt);
  const hasLangs = stats.languages.length > 0;
  if (!pushed && !hasLangs) return null;

  return (
    <div className="relative z-10 mt-5 space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted">
        {pushed && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-accent"
              // a live dot only means something if it is recent
              style={{ opacity: pushed.includes("year") ? 0.35 : 1 }}
            />
            pushed {pushed}
          </span>
        )}
        {stats.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} /> {stats.stars}
          </span>
        )}
        {stats.forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={11} /> {stats.forks}
          </span>
        )}
      </div>

      {hasLangs && (
        <div>
          <div className="flex h-1 overflow-hidden rounded-full bg-border">
            {stats.languages.map((l, i) => (
              <span
                key={l.name}
                className={TINTS[i] ?? "bg-accent/20"}
                style={{ width: `${l.share}%` }}
              />
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-muted/80">
            {stats.languages.map((l) => `${l.name} ${l.share}%`).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

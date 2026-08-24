"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

/** What the status line reads at each stage, keyed by the progress floor. */
const STAGES = [
  { at: 0, label: "Booting" },
  { at: 35, label: "Fetching assets" },
  { at: 70, label: "Building view" },
  { at: 100, label: "Ready" },
];

/**
 * The line under the name. Deliberately not a job title — the hero already
 * cycles those, and a title on the curtain dates the moment the roles change.
 * A neutral label reads as the shell the work is served from.
 */
const LABEL = "Portfolio";

/**
 * First-paint curtain.
 *
 * Rendered on the server so it is in the HTML before any JavaScript runs —
 * that is the whole point: the visitor sees the monogram, not a blank page,
 * while fonts and the starfield are still coming down the wire.
 *
 * The percentage is not theatre. It tracks three real signals — the document
 * becoming interactive, webfonts resolving, and `window.load` — and eases
 * toward whichever of them has landed, so it can never sit at 100% while the
 * page is still assembling, or hold at 40% on a fast connection.
 *
 * Two safety nets, because a stuck curtain is worse than no curtain:
 * the inline script in `layout.tsx` hides it outright after a hard timeout or
 * on a repeat visit within the session, and the CSS keeps it non-interactive
 * once dismissed.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    // A repeat visit in the same tab: the inline script already hid it, so
    // don't animate a curtain nobody can see — and don't lock the scroll.
    if (root.classList.contains("preloaded")) {
      setGone(true);
      return;
    }

    root.classList.add("preloading");

    // Each resolved signal raises the ceiling the bar is allowed to ease to.
    // Without a ceiling the bar would race to 100% and then wait, which is
    // exactly the "fake progress" feel we're avoiding.
    let ceiling = 20;
    const raise = (to: number) => {
      ceiling = Math.max(ceiling, to);
    };

    if (document.readyState !== "loading") raise(45);
    const onReady = () => raise(45);
    document.addEventListener("DOMContentLoaded", onReady);

    document.fonts?.ready.then(() => raise(75));

    if (document.readyState === "complete") raise(100);
    const onLoad = () => raise(100);
    window.addEventListener("load", onLoad);

    // A floor on total display time. Under 700ms a curtain reads as a flicker
    // or a rendering fault; the reveal needs long enough to register as one.
    const start = performance.now();
    const MIN_MS = 700;

    let current = 0;
    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const elapsed = performance.now() - start;
      const allowed = ceiling === 100 && elapsed < MIN_MS ? 99 : ceiling;

      // Ease toward the ceiling: fast while far away, slow as it closes in,
      // so the bar always keeps moving instead of stepping between signals.
      current += Math.max((allowed - current) * 0.08, allowed > current ? 0.25 : 0);
      if (current > allowed) current = allowed;

      const shown = Math.min(100, Math.round(current));
      setProgress(shown);

      if (shown >= 100) {
        setLeaving(true);
        root.classList.remove("preloading");
        root.classList.add("preloaded");
        // Matches the exit transition in globals.css; unmounting any sooner
        // cuts the wipe off mid-way.
        exitTimer = setTimeout(() => setGone(true), 800);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      document.removeEventListener("DOMContentLoaded", onReady);
      window.removeEventListener("load", onLoad);
      root.classList.remove("preloading");
    };
  }, []);

  if (gone) return null;

  const stage = STAGES.reduce((acc, s) => (progress >= s.at ? s.label : acc), STAGES[0].label);

  return (
    <div
      id="preloader"
      className={leaving ? "is-leaving" : undefined}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* Splits so the two halves part like a curtain on exit. */}
      <div className="preloader-panel preloader-panel-top" />
      <div className="preloader-panel preloader-panel-bottom" />

      <div className="preloader-content">
        <div className="preloader-mark">
          <span className="preloader-ring" aria-hidden="true" />
          <span className="preloader-initials">{site.initials}</span>
        </div>

        <p className="preloader-name">{site.name}</p>
        <p className="preloader-role">{LABEL}</p>

        <div className="preloader-bar" aria-hidden="true">
          <span className="preloader-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="preloader-meta">
          <span>{stage}</span>
          <span className="preloader-percent">
            {String(progress).padStart(3, "0")}%
          </span>
        </div>
      </div>
    </div>
  );
}

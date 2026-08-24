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

/** Circumference of the r=46 progress ring, so the dash maths stays readable. */
const RING = 2 * Math.PI * 46;

/** Placeholder the server renders, so hydration has nothing to disagree with. */
const PENDING = "···";

type LogLine = { id: string; text: string; ms: number };

/**
 * First-paint curtain.
 *
 * Rendered on the server so it is in the HTML before any JavaScript runs —
 * that is the whole point: the visitor sees the monogram, not a blank page,
 * while fonts and the starfield are still coming down the wire.
 *
 * Everything on it is measured, not staged. The ring and the percentage track
 * three real signals — the document becoming interactive, webfonts resolving,
 * and `window.load` — so the bar can never sit at 100% while the page is still
 * assembling, or hold at 40% on a fast connection. The corner readouts and the
 * boot log come off the Performance API: real TTFB, real resource count, real
 * bytes over the wire. A curtain that lies about the load is decoration; one
 * that reports it is instrumentation.
 *
 * Two safety nets, because a stuck curtain is worse than no curtain: the
 * inline script in `layout.tsx` hides it outright after a hard timeout or on a
 * repeat visit within the session, and the CSS keeps it non-interactive once
 * dismissed.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [ttfb, setTtfb] = useState<string>(PENDING);
  const [viewport, setViewport] = useState<string>(PENDING);
  const [assets, setAssets] = useState<string>(PENDING);
  const [logs, setLogs] = useState<LogLine[]>([]);

  useEffect(() => {
    const root = document.documentElement;

    // A repeat visit in the same tab: the inline script already hid it, so
    // don't animate a curtain nobody can see — and don't lock the scroll.
    if (root.classList.contains("preloaded")) {
      setGone(true);
      return;
    }

    root.classList.add("preloading");

    const since = () => Math.round(performance.now());
    const push = (id: string, text: string) =>
      setLogs((prev) =>
        prev.some((l) => l.id === id) ? prev : [...prev, { id, text, ms: since() }],
      );

    setViewport(`${window.innerWidth}×${window.innerHeight}`);

    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      setTtfb(`${Math.round(nav.responseStart)}ms`);
      push("net", "connection established");
    }

    /** Resource count and bytes actually transferred, straight off the timeline. */
    const sampleAssets = () => {
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const kb = res.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024;
      setAssets(`${res.length} · ${kb < 1 ? "0" : Math.round(kb)}KB`);
    };
    sampleAssets();
    const sampler = setInterval(sampleAssets, 120);

    // Each resolved signal raises the ceiling the bar is allowed to ease to.
    // Without a ceiling the bar would race to 100% and then wait, which is
    // exactly the "fake progress" feel we're avoiding.
    let ceiling = 20;
    const raise = (to: number) => {
      ceiling = Math.max(ceiling, to);
    };

    const markInteractive = () => {
      raise(45);
      push("dom", "document interactive");
    };
    if (document.readyState !== "loading") markInteractive();
    document.addEventListener("DOMContentLoaded", markInteractive);

    document.fonts?.ready.then(() => {
      raise(75);
      push("fonts", "typefaces resolved");
    });

    const markLoaded = () => {
      raise(100);
      sampleAssets();
      push("load", "assets settled");
    };
    if (document.readyState === "complete") markLoaded();
    window.addEventListener("load", markLoaded);

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
        exitTimer = setTimeout(() => setGone(true), 950);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearInterval(sampler);
      document.removeEventListener("DOMContentLoaded", markInteractive);
      window.removeEventListener("load", markLoaded);
      root.classList.remove("preloading");
    };
  }, []);

  if (gone) return null;

  const stage = STAGES.reduce((acc, s) => (progress >= s.at ? s.label : acc), STAGES[0].label);
  const letters = [...site.name];

  return (
    <div
      id="preloader"
      className={leaving ? "is-leaving" : undefined}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* The curtain itself, skewed so it leaves on a diagonal, with a glowing
          seam riding its trailing edge. */}
      <div className="preloader-panel" aria-hidden="true" />
      <div className="preloader-seam" aria-hidden="true" />

      <div className="preloader-grid" aria-hidden="true" />

      {/* Corner readouts — real numbers, so they read as instrumentation. */}
      <div className="preloader-hud preloader-hud-tl" aria-hidden="true">
        <span className="preloader-hud-key">TTFB</span> {ttfb}
      </div>
      <div className="preloader-hud preloader-hud-tr" aria-hidden="true">
        <span className="preloader-hud-key">VIEWPORT</span> {viewport}
      </div>
      <div className="preloader-hud preloader-hud-bl" aria-hidden="true">
        <span className="preloader-hud-key">ASSETS</span> {assets}
      </div>
      <div className="preloader-hud preloader-hud-br" aria-hidden="true">
        <span className="preloader-hud-stage">{stage}</span>{" "}
        <span className="preloader-percent">{String(progress).padStart(3, "0")}%</span>
      </div>

      <div className="preloader-content">
        <div className="preloader-mark">
          {/* The ring IS the progress bar: one arc, drawn to the same number
              the readout shows, rather than a spinner running beside it. */}
          <svg className="preloader-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="preloader-ring-track" cx="50" cy="50" r="46" />
            <circle
              className="preloader-ring-arc"
              cx="50"
              cy="50"
              r="46"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - progress / 100)}
            />
          </svg>
          <span className="preloader-initials">{site.initials}</span>
        </div>

        {/* Letters stagger in on a pure-CSS delay, so the animation is already
            running in the server HTML — no wait for hydration. */}
        <p className="preloader-name" aria-label={site.name}>
          {letters.map((char, i) => (
            <span
              key={`${char}-${i}`}
              className="preloader-letter"
              style={{ animationDelay: `${i * 28}ms` }}
              aria-hidden="true"
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </p>
        <p className="preloader-role">{LABEL}</p>

        <ul className="preloader-log" aria-hidden="true">
          {/* Signals often resolve in the same frame on a warm cache, which
              would drop the whole log in at once. The per-index delay keeps it
              cascading without misreporting any of the timings. */}
          {logs.map((line, i) => (
            <li key={line.id} style={{ animationDelay: `${i * 90}ms` }}>
              <span className="preloader-log-mark">▸</span>
              <span className="preloader-log-text">{line.text}</span>
              <span className="preloader-log-ms">{line.ms}ms</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

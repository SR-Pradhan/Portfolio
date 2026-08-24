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

/** Placeholder the server renders, so hydration has nothing to disagree with. */
const PENDING = "···";

type LogLine = { id: string; text: string; ms: number };

/**
 * The Network Information API, which TypeScript's DOM library doesn't declare
 * because it is not on a standards track. Narrowed to the two fields used here
 * and read defensively — Safari and Firefox don't implement it at all.
 */
type Connection = { effectiveType?: string; downlink?: number; rtt?: number };

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
  const [link, setLink] = useState<string>(PENDING);
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

    /**
     * Each line reports when its own milestone happened, not when the log line
     * was appended.
     *
     * On a warm load every signal resolves inside the same frame, so stamping
     * `performance.now()` at append time printed the same number four times —
     * which reads as decoration however real it actually is. The navigation
     * entry already holds the true moment for each one.
     */
    const push = (id: string, text: string, ms: number) =>
      setLogs((prev) =>
        prev.some((l) => l.id === id)
          ? prev
          : [...prev, { id, text, ms: Math.max(0, Math.round(ms)) }],
      );

    setViewport(`${window.innerWidth}×${window.innerHeight}`);

    // Connection class, where the browser will say. Not decoration: it is the
    // context that makes every other number on this curtain mean something —
    // a 400ms TTFB says one thing on 4g and quite another on a fast link.
    const conn = (navigator as Navigator & { connection?: Connection }).connection;
    if (conn?.effectiveType) {
      const rtt = conn.rtt ? ` · ${conn.rtt}ms rtt` : "";
      setLink(`${conn.effectiveType}${rtt}`);
    }

    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      setTtfb(`${Math.round(nav.responseStart)}ms`);
      // Time to first byte: DNS, TLS and the server's own thinking time.
      push("net", "connection established", nav.responseStart);
    }

    /**
     * Resource count and weight, straight off the timeline.
     *
     * `transferSize` is 0 for anything served from cache, so a warm reload used
     * to report "0KB" — technically true about the network and useless to
     * read. When nothing crossed the wire the decoded size is shown instead and
     * the row says so, which is the more interesting fact anyway: the second
     * visit costs nothing.
     */
    const sampleAssets = () => {
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const wire = res.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const decoded = res.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0);
      const bytes = wire > 0 ? wire : decoded;
      const kb = Math.round(bytes / 1024);
      const suffix = wire > 0 ? `${kb}KB` : decoded > 0 ? `${kb}KB cached` : "—";
      setAssets(`${res.length} · ${suffix}`);
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
      push("dom", "document interactive", nav?.domInteractive || performance.now());
    };
    if (document.readyState !== "loading") markInteractive();
    document.addEventListener("DOMContentLoaded", markInteractive);

    document.fonts?.ready.then(() => {
      raise(75);
      // No navigation-timing field for webfonts, so this one is genuinely
      // measured at the moment the promise settles.
      push("fonts", "typefaces resolved", performance.now());
    });

    const markLoaded = () => {
      raise(100);
      sampleAssets();
      push("load", "assets settled", nav?.loadEventStart || performance.now());
    };
    if (document.readyState === "complete") markLoaded();
    window.addEventListener("load", markLoaded);

    // A floor on total display time. On a warm cache every signal lands inside
    // a couple of hundred milliseconds, and a curtain that fast reads as a
    // flicker — the monogram, the log and the wipe are gone before the eye
    // resolves any of them. This is the minimum the sequence needs to be read
    // as a deliberate intro rather than a rendering fault.
    const start = performance.now();
    const MIN_MS = 2400;

    let current = 0;
    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const elapsed = performance.now() - start;

      // Two ceilings, and the lower one wins. `ceiling` is what the load has
      // actually achieved; the pace cap is how far the display is allowed to
      // have travelled by now. Capping on time rather than parking the bar at
      // 99% keeps the ring visibly drawing for the whole run instead of
      // snapping full and waiting out the floor.
      const paced = 100 * Math.min(1, elapsed / MIN_MS);
      const allowed = Math.min(ceiling, paced);

      // Ease toward the ceiling: fast while far away, slow as it closes in,
      // so the bar always keeps moving instead of stepping between signals.
      current += Math.max((allowed - current) * 0.12, allowed > current ? 0.15 : 0);
      if (current > allowed) current = allowed;

      const shown = Math.min(100, Math.round(current));
      setProgress(shown);

      if (shown >= 100) {
        // The last thing the log says is the only number that matters to a
        // visitor: how long they actually waited.
        push("ready", "ready", nav?.loadEventEnd || performance.now());
        root.classList.remove("preloading");
        root.classList.add("preloaded");

        // A beat before the wipe. Leaving on the same frame as the final line
        // means it fades out as it fades in — the closing number would be
        // written and destroyed too fast for anyone to read it.
        holdTimer = setTimeout(() => {
          setLeaving(true);
          // Matches the exit transition in globals.css; unmounting any sooner
          // cuts the wipe off mid-way.
          exitTimer = setTimeout(() => setGone(true), 950);
        }, 500);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(holdTimer);
      clearInterval(sampler);
      document.removeEventListener("DOMContentLoaded", markInteractive);
      window.removeEventListener("load", markLoaded);
      root.classList.remove("preloading");
    };
  }, []);

  if (gone) return null;

  const stage = STAGES.reduce((acc, s) => (progress >= s.at ? s.label : acc), STAGES[0].label);
  // Set as three stacked lines, so the name can run at display size without
  // wrapping at an arbitrary point decided by the viewport.
  const lines = site.name.split(" ");
  let letterIndex = 0;

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

      <div className="preloader-shell">
        {/* Top rule: the wordmark, and the two readouts that describe the
            connection this page arrived over. */}
        <header className="preloader-top" aria-hidden="true">
          <span className="preloader-mark">
            {site.initials}
            <span className="preloader-dot">.</span>
          </span>
          <span className="preloader-meta">
            <span className="preloader-meta-key">TTFB</span> {ttfb}
            <span className="preloader-sep">/</span>
            {link === PENDING ? (
              <>
                <span className="preloader-meta-key">VIEWPORT</span> {viewport}
              </>
            ) : (
              <>
                <span className="preloader-meta-key">LINK</span> {link}
              </>
            )}
          </span>
        </header>

        <div className="preloader-main">
          {/* The name is the artwork here — display size, left aligned, one
              word per line. Letters stagger in on a pure-CSS delay, so the
              entrance is already playing in the server HTML. */}
          <h1 className="preloader-name" aria-label={site.name}>
            {lines.map((word, w) => (
              <span className="preloader-line" key={word} aria-hidden="true">
                {[...word].map((char, i) => (
                  <span
                    key={`${char}-${i}`}
                    className="preloader-letter"
                    style={{ animationDelay: `${letterIndex++ * 26}ms` }}
                  >
                    {char}
                  </span>
                ))}
                {/* Rides the end of the last word rather than sitting on a line
                    of its own, where it reads as a stray block instead of a
                    cursor waiting at the end of the name. */}
                {w === lines.length - 1 && <span className="preloader-caret" />}
              </span>
            ))}
          </h1>

          <div className="preloader-side">
            <p className="preloader-role">{LABEL}</p>
            <ul className="preloader-log" aria-hidden="true">
              {/* Signals often resolve in the same frame on a warm cache, which
                  would drop the whole log in at once. The per-index delay keeps
                  it cascading without misreporting any of the timings. */}
              {logs.map((line, i) => (
                <li key={line.id} style={{ animationDelay: `${i * 220}ms` }}>
                  <span className="preloader-log-mark">▸</span>
                  <span className="preloader-log-text">{line.text}</span>
                  <span className="preloader-log-ms">{line.ms}ms</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom rail: the progress is the full width of the screen, and the
            number is large enough to be the second thing you read. */}
        <footer className="preloader-rail" aria-hidden="true">
          <span className="preloader-stage">{stage}</span>
          <span className="preloader-assets">{assets}</span>
          <div className="preloader-track">
            <span className="preloader-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="preloader-count">{String(progress).padStart(2, "0")}</span>
        </footer>
      </div>
    </div>
  );
}

import { site } from "@/data/site";
import TechIcon from "./TechIcon";

type Ring = {
  /** simple-icons slugs, spaced evenly around the ring */
  icons: string[];
  radius: number;
  seconds: number;
  reverse?: boolean;
};

/**
 * Outer ring turns slowly; inner ring turns faster the other way.
 * Mirrors the Skills section: AI and backend on the outside where they read
 * first, language and data foundations on the inside.
 */
const RINGS: Ring[] = [
  {
    icons: ["python", "langchain", "huggingface", "fastapi", "springboot", "react"],
    radius: 148,
    seconds: 34,
  },
  {
    icons: ["java", "postgresql", "opencv"],
    radius: 88,
    seconds: 22,
    reverse: true,
  },
];

/**
 * The hero's right-hand visual: the actual stack orbiting a core.
 *
 * Positioning, precisely — getting this wrong scatters the icons off their
 * tracks:
 *
 *  1. The ring is a full-size box spinning about the container's centre.
 *  2. Each icon's placement element is ZERO-SIZE and pinned at that same
 *     centre, then transformed `rotate(θ) translateY(-r) rotate(-θ)`. The
 *     trailing `rotate(-θ)` cancels the placement rotation for its children,
 *     so they aren't tilted by where they sit on the ring.
 *  3. Only the innermost box is centred on its point (-50%, -50%) and given
 *     the counter-spin. It rotates about its own centre, so it re-orients
 *     without moving.
 *
 * Any wrapper that has a size AND a rotation will shift its child, because it
 * rotates about its own centre rather than the ring's. Keep the wrappers
 * zero-size.
 *
 * All CSS animation — no JS, no canvas, renders on the server.
 */
export default function TechOrbit() {
  return (
    <div
      aria-hidden
      className="relative hidden aspect-square w-full max-w-[360px] items-center justify-center md:flex"
    >
      {/* soft bloom behind the whole thing */}
      <span className="absolute size-56 rounded-full bg-accent/20 blur-[90px]" />

      {RINGS.map(({ icons, radius, seconds, reverse }) => (
        <div
          key={radius}
          style={{ "--orbit-duration": `${seconds}s` } as React.CSSProperties}
          className={`absolute inset-0 ${reverse ? "orbit-ring-reverse" : "orbit-ring"}`}
        >
          {/* the visible track */}
          <span
            className="absolute left-1/2 top-1/2 rounded-full border border-border/70"
            style={{
              width: radius * 2,
              height: radius * 2,
              transform: "translate(-50%, -50%)",
            }}
          />

          {icons.map((slug, i) => {
            const angle = (360 / icons.length) * i;
            return (
              <span
                key={slug}
                className="absolute left-1/2 top-1/2 block size-0"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`,
                }}
              >
                {/* size-11 is 44px, so -22px margins centre it on the ring
                    point. Negative margins rather than a translate, so
                    nothing competes with the counter-spin's transform. */}
                <span
                  style={{ "--orbit-duration": `${seconds}s` } as React.CSSProperties}
                  className={`absolute -ml-[22px] -mt-[22px] grid size-11 place-items-center rounded-xl border border-border bg-surface shadow-lg ${
                    reverse ? "orbit-counter-reverse" : "orbit-counter"
                  }`}
                >
                  <TechIcon slug={slug} size={20} />
                </span>
              </span>
            );
          })}
        </div>
      ))}

      {/* core uses initials, not the full name — the circle is 96px wide.
          No accent dot: the nav logo already carries the wordmark. */}
      <span className="relative grid size-24 place-items-center rounded-full border border-accent/40 bg-surface/80 backdrop-blur">
        <span className="font-mono text-2xl font-bold tracking-tight">
          {site.initials}
        </span>
      </span>
    </div>
  );
}

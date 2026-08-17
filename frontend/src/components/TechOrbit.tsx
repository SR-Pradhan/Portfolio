import { site } from "@/data/site";
import TechIcon from "./TechIcon";

type Ring = {
  /** simple-icons slugs, spaced evenly around the ring */
  icons: string[];
  radius: number;
  seconds: number;
  reverse?: boolean;
};

/** Outer ring turns slowly; inner ring turns faster the other way. */
const RINGS: Ring[] = [
  {
    icons: ["react", "nextdotjs", "typescript", "nodedotjs", "tailwindcss", "docker"],
    radius: 150,
    seconds: 34,
  },
  {
    icons: ["python", "postgresql", "git"],
    radius: 92,
    seconds: 22,
    reverse: true,
  },
];

/**
 * The hero's right-hand visual: the actual stack orbiting a core.
 *
 * Each ring rotates as a whole; every icon carries a counter-rotation of the
 * same duration so it stays upright rather than tumbling. All CSS animation —
 * no JS, no canvas, and it renders on the server.
 */
export default function TechOrbit() {
  return (
    <div
      aria-hidden
      className="relative hidden aspect-square w-full max-w-[380px] items-center justify-center md:flex"
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
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70"
            style={{ width: radius * 2, height: radius * 2 }}
          />

          {icons.map((slug, i) => {
            const angle = (360 / icons.length) * i;
            return (
              <span
                key={slug}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                }}
              >
                {/* undo the placement rotation... */}
                <span className="block" style={{ transform: `rotate(${-angle}deg)` }}>
                  {/* ...then undo the ring's spin, so icons stay upright */}
                  <span
                    style={{ "--orbit-duration": `${seconds}s` } as React.CSSProperties}
                    className={`grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-border bg-surface shadow-lg ${
                      reverse ? "orbit-counter-reverse" : "orbit-counter"
                    }`}
                  >
                    <TechIcon slug={slug} size={20} />
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      ))}

      {/* core */}
      <span className="relative grid size-24 place-items-center rounded-full border border-accent/40 bg-surface/80 backdrop-blur">
        <span className="font-mono text-2xl font-bold tracking-tight">
          {site.shortName}
          <span className="text-accent">.</span>
        </span>
      </span>
    </div>
  );
}

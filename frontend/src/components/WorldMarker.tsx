"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { WORLD_BOUNDS, WORLD_DOTS, WORLD_STEP } from "@/data/worldMap";

/** Equirectangular: longitude and latitude map straight onto x and y. */
const VIEW_W = 360;
const VIEW_H = WORLD_BOUNDS.latMax - WORLD_BOUNDS.latMin;

const project = (lng: number, lat: number) => ({
  x: lng + 180,
  y: WORLD_BOUNDS.latMax - lat,
});

/**
 * What the clock says where he is, whatever it says where you are.
 *
 * Subscribed rather than held in state: the clock genuinely is an external
 * source, and this keeps the read out of an effect body. The snapshot is the
 * current half-minute rather than the timestamp, so it is stable between ticks
 * and React re-renders only when the displayed minute can actually change. The
 * server snapshot is null, which renders nothing — the server has no business
 * guessing what time the visitor's browser thinks it is.
 */
const TICK = 30_000;

function useLocalTime() {
  const tick = useSyncExternalStore(
    (onChange) => {
      const timer = setInterval(onChange, TICK);
      return () => clearInterval(timer);
    },
    () => Math.floor(Date.now() / TICK),
    () => null,
  );

  if (tick === null) return null;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: site.timezone,
  }).format(new Date());
}

/**
 * Where he is, and what time it is there.
 *
 * A panel rather than a loose graphic. The first version was a full-width field
 * of grey dots that restated the "Gurugram, India" line directly above it at ten
 * times the size and became the loudest thing in a section whose job is a form.
 * Bordered, compact and captioned, it reads as a deliberate piece of UI.
 *
 * The clock is what earns it a place: someone deciding whether to call right now
 * needs the answer in local terms, and "it is 11pm there" is the one thing the
 * address line cannot tell them. Rendered after mount, so the server and the
 * browser never disagree about the time.
 *
 * Land comes from Natural Earth 110m sampled onto a grid at build time
 * (`scripts/build-world-map.mjs`), so this ships an array of small integers
 * rather than a projection library and a 55KB topology.
 */
export default function WorldMarker() {
  const me = project(site.coords.lng, site.coords.lat);
  const time = useLocalTime();

  return (
    <div className="max-w-sm rounded-2xl border border-border bg-surface/50 p-5">
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label={`World map with a marker on ${site.location}`}
        >
          {/* The land, quiet enough to read as a backdrop for one bright dot. */}
          <g fill="currentColor" className="text-foreground/[0.14]">
            {WORLD_DOTS.map(([lng, lat], i) => {
              const { x, y } = project(lng, lat);
              return <circle key={i} cx={x} cy={y} r={WORLD_STEP * 0.26} />;
            })}
          </g>

          {/* Ping under the dot, so the dot stays the sharpest thing on the map. */}
          <circle cx={me.x} cy={me.y} r={3} className="fill-accent/30 world-ping" />
          <circle cx={me.x} cy={me.y} r={2.2} className="fill-accent" />
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {site.location}
        </span>
        {/* Empty until the clock has been read on the client. */}
        <span className="text-foreground">{time ? `${time} local` : ""}</span>
      </div>
    </div>
  );
}

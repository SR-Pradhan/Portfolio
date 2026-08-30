"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { WORLD_BOUNDS, WORLD_DOT, WORLD_PATH } from "@/data/worldMap";

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
 * Deliberately not a card. Full width it shouted, and boxed it framed its own
 * empty space — both read as a widget bolted onto a section whose job is a
 * form. Masked at the edges and captioned in the same mono as the details above
 * it, the map sits on the page as texture with one bright point on it.
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
    <figure className="w-full max-w-sm">
      {/* No card. A border around a small map frames empty space and turns a
          background graphic into a widget; masked at the edges the dots fade
          into the page instead of ending on a rectangle. */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="world-map w-full overflow-visible"
        role="img"
        aria-label={`World map with a marker on ${site.location}`}
      >
        {/* One path for all 9,176 points: each is a zero-length
            subpath, and a round line cap turns it into a dot. Nine thousand
            circles would be nine thousand DOM nodes for a background. */}
        <path
          d={WORLD_PATH}
          stroke="currentColor"
          strokeWidth={WORLD_DOT}
          strokeLinecap="round"
          fill="none"
          className="text-foreground/[0.17]"
        />

        {/* A soft halo, then the ping, then the dot: three layers so the marker
            reads as lit rather than merely coloured. */}
        <circle cx={me.x} cy={me.y} r={9} className="fill-accent/10" />
        <circle cx={me.x} cy={me.y} r={3} className="fill-accent/30 world-ping" />
        <circle cx={me.x} cy={me.y} r={2.2} className="fill-accent" />
      </svg>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {site.location}
        </span>
        {time && (
          <>
            <span aria-hidden className="text-border">
              ·
            </span>
            {/* Empty until the clock has been read on the client. */}
            <span className="text-foreground">{time} local</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}

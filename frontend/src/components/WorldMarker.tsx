"use client";

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
 * Where he is, as a dot on a dotted world.
 *
 * The land comes from Natural Earth 110m sampled onto a grid at build time
 * (`scripts/build-world-map.mjs`), so this ships an array of small integers
 * rather than a projection library and a 55KB topology. Equirectangular keeps
 * the projection to one subtraction per axis, which is the whole reason the
 * marker can be positioned from `site.coords` with no maths worth testing.
 *
 * Deliberately not an interactive map: a pannable tile map on a contact section
 * invites fiddling, costs a script and a tile budget, and answers a question
 * nobody asked. This answers the only one that matters — which part of the
 * world am I working from — and stops.
 */
export default function WorldMarker() {
  const me = project(site.coords.lng, site.coords.lat);

  return (
    <figure className="relative w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`World map with a marker on ${site.location}`}
      >
        <g fill="currentColor" className="text-foreground/[0.18]">
          {WORLD_DOTS.map(([lng, lat], i) => {
            const { x, y } = project(lng, lat);
            return <circle key={i} cx={x} cy={y} r={WORLD_STEP * 0.28} />;
          })}
        </g>

        {/* Ping first so it sits under the dot rather than washing it out. */}
        <circle cx={me.x} cy={me.y} r={2.5} className="fill-accent/25 world-ping" />
        <circle cx={me.x} cy={me.y} r={1.9} className="fill-accent" />
      </svg>

      {/* The label is HTML, not SVG text: it inherits the page's type scale and
          stays legible at any map width, where SVG text would scale with the
          viewBox and end up either tiny or enormous. */}
      <figcaption
        className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground shadow-lg"
        style={{ left: `${(me.x / VIEW_W) * 100}%`, top: `${(me.y / VIEW_H) * 100 - 4}%` }}
      >
        {site.location}
      </figcaption>
    </figure>
  );
}

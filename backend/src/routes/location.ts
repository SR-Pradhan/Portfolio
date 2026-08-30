import { Router } from "express";

const router = Router();

/**
 * Where he is, so it can be changed without touching code.
 *
 * Served from the API rather than baked into the frontend on purpose: a
 * `NEXT_PUBLIC_*` value is inlined at build time, so moving city would mean a
 * Vercel rebuild. Read here, it takes effect on the next request after the
 * Render environment is saved.
 *
 * Every field is optional. Anything missing or malformed comes back null and
 * the page keeps the coordinates in `site.ts`, so a typo in the dashboard
 * cannot put the marker in the sea.
 */
function coordinate(value: string | undefined, limit: number) {
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

/** A zone the runtime doesn't recognise would throw when the clock formats. */
function timezone(value: string | undefined) {
  if (!value) return null;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return value;
  } catch {
    return null;
  }
}

router.get("/", (_req, res) => {
  const lat = coordinate(process.env.LOCATION_LAT, 90);
  const lng = coordinate(process.env.LOCATION_LNG, 180);

  res.set("Cache-Control", "public, max-age=300");
  res.json({
    ok: true,
    location: {
      city: process.env.LOCATION_CITY?.trim() || null,
      // Both or neither: half a coordinate is worse than none.
      lat: lat !== null && lng !== null ? lat : null,
      lng: lat !== null && lng !== null ? lng : null,
      timezone: timezone(process.env.LOCATION_TZ),
    },
  });
});

export default router;

import { Router } from "express";
import { getContributions, getRepoStats } from "../lib/github.js";

const router = Router();

/**
 * Live repository stats for the project cards.
 *
 * No parameters by design — the repo list comes from the site's own content,
 * so this cannot be pointed at an arbitrary URL. Responses are cached upstream
 * in the lib; the header lets the browser and any CDN in front of this share
 * that cache too.
 */
router.get("/", async (_req, res) => {
  const repos = await getRepoStats();
  res.set("Cache-Control", "public, max-age=900, stale-while-revalidate=3600");
  res.json({ ok: true, repos });
});

/**
 * The contribution calendar, when a GITHUB_TOKEN is configured.
 *
 * `enabled: false` rather than a 404 or an empty array: the frontend has to be
 * able to tell "not configured" apart from "nothing to show", because the
 * first means hide the section and the second would mean render an empty grid.
 */
router.get("/contributions", async (_req, res) => {
  const contributions = await getContributions();
  res.set("Cache-Control", "public, max-age=1800, stale-while-revalidate=3600");
  res.json({ ok: true, enabled: Boolean(contributions), contributions });
});

export default router;

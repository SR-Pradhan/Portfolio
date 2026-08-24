import { Router } from "express";
import { getRepoStats } from "../lib/github.js";

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

export default router;

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export type RepoStats = {
  repo: string;
  stars: number;
  forks: number;
  pushedAt: string;
  /** Byte counts per language, biggest first, as a share of the total. */
  languages: { name: string; share: number }[];
};

/**
 * Which repositories this endpoint is willing to talk about.
 *
 * Derived from the same generated context the chatbot uses, so it tracks
 * site.ts and needs no second list to maintain. It is also the security
 * boundary: the route takes no repo parameter at all, so there is nothing for
 * a caller to point at an arbitrary URL.
 */
function allowedRepos(): string[] {
  try {
    const raw = readFileSync(join(here, "..", "data", "portfolio-context.json"), "utf8");
    const ctx = JSON.parse(raw) as { projects?: { code?: string }[] };
    return (ctx.projects ?? [])
      .map((p) => p.code ?? "")
      .map((url) => url.match(/github\.com\/([^/]+\/[^/#?]+)/)?.[1] ?? "")
      .map((slug) => slug.replace(/\.git$/, ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

const REPOS = allowedRepos();

/**
 * GitHub allows 60 unauthenticated requests per hour per IP, and each repo
 * costs two (metadata + languages). A token raises that to 5,000 but is
 * deliberately optional — same as GROQ_API_KEY and RESEND_API_KEY, the site
 * runs without it.
 */
function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-backend",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/**
 * One shared cache for every visitor, not one per client.
 *
 * The numbers change a few times a week at most, so a long TTL costs nothing
 * in freshness and is the difference between a handful of upstream calls an
 * hour and one per page view — which on a free tier is the difference between
 * working and being rate-limited by lunchtime.
 */
const TTL_MS = 30 * 60 * 1000;
let cache: { at: number; data: RepoStats[] } | null = null;
let inFlight: Promise<RepoStats[]> | null = null;

async function fetchRepo(slug: string): Promise<RepoStats | null> {
  try {
    const [metaRes, langRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${slug}`, { headers: headers() }),
      fetch(`https://api.github.com/repos/${slug}/languages`, { headers: headers() }),
    ]);
    if (!metaRes.ok) return null;

    const meta = (await metaRes.json()) as {
      stargazers_count?: number;
      forks_count?: number;
      pushed_at?: string;
    };
    const langs = langRes.ok ? ((await langRes.json()) as Record<string, number>) : {};

    const total = Object.values(langs).reduce((a, b) => a + b, 0);
    const languages = Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, bytes]) => ({
        name,
        share: total ? Math.round((bytes / total) * 100) : 0,
      }));

    return {
      repo: slug,
      stars: meta.stargazers_count ?? 0,
      forks: meta.forks_count ?? 0,
      pushedAt: meta.pushed_at ?? "",
      languages,
    };
  } catch {
    // network failure or a repo that has since been renamed: this card simply
    // renders without stats
    return null;
  }
}

export async function getRepoStats(): Promise<RepoStats[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  // Collapse a stampede: several visitors arriving on a cold cache should
  // produce one upstream fetch between them, not one each.
  if (!inFlight) {
    inFlight = (async () => {
      const results = await Promise.all(REPOS.map(fetchRepo));
      const data = results.filter((r): r is RepoStats => r !== null);
      // Never overwrite good data with an empty result — a transient GitHub
      // outage should leave the last known numbers on the cards.
      if (data.length || !cache) cache = { at: Date.now(), data };
      inFlight = null;
      return cache.data;
    })();
  }
  return inFlight;
}

"use client";

import { useEffect, useState } from "react";

export type RepoStats = {
  repo: string;
  stars: number;
  forks: number;
  pushedAt: string;
  languages: { name: string; share: number }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Live repository stats, keyed by `owner/name`.
 *
 * Fetched on the client rather than at build time on purpose: the point of the
 * numbers is that they are current, and a static build would freeze them at
 * whatever they were on the last deploy. The backend caches upstream, so this
 * costs one cheap request per visitor.
 *
 * Every failure path returns an empty map, and the cards render exactly as
 * they did before this existed — the API being asleep must never cost a
 * visitor the project list.
 */
export function useRepoStats() {
  const [stats, setStats] = useState<Map<string, RepoStats>>(new Map());

  useEffect(() => {
    const abort = new AbortController();

    fetch(`${API_URL}/api/github`, { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { repos?: RepoStats[] } | null) => {
        if (!data?.repos?.length) return;
        setStats(new Map(data.repos.map((r) => [r.repo.toLowerCase(), r])));
      })
      .catch(() => {
        // offline, CORS, or a cold backend: the cards stay static
      });

    return () => abort.abort();
  }, []);

  return stats;
}

/** `https://github.com/owner/name` → `owner/name`, lowercased for lookup. */
export function repoSlug(url?: string) {
  return url?.match(/github\.com\/([^/#?]+\/[^/#?]+)/)?.[1].replace(/\.git$/, "").toLowerCase();
}

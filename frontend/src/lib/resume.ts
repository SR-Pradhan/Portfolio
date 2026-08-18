import { statSync } from "node:fs";
import path from "node:path";

/**
 * Whether public/resume.pdf actually exists, checked on the server at
 * render time.
 *
 * Deliberately not a boolean in site.ts: a flag has to be remembered, and the
 * failure mode is a Resume button that 404s on a live portfolio, which is the
 * worst possible link to have broken. Dropping the file in and rebuilding is
 * the entire deploy step.
 */
export type ResumeInfo =
  | { available: true; sizeKB: number; updated: string }
  | { available: false };

export function getResume(): ResumeInfo {
  try {
    const stats = statSync(path.join(process.cwd(), "public", "resume.pdf"));
    return {
      available: true,
      sizeKB: Math.round(stats.size / 1024),
      // formatted here because this crosses into a client component, where a
      // Date would need serialising anyway
      updated: stats.mtime.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      }),
    };
  } catch {
    return { available: false };
  }
}

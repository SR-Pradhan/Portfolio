/**
 * Import achievement proof photos.
 *
 *   node scripts/add-proof.mjs nexify ~/Desktop/pitch.jpg ~/Desktop/team.jpg
 *
 * Converts each photo to WebP and writes it to public/proof/<slug>/ numbered in
 * the order given — 1.webp, 2.webp, 3.webp. Order matters: 1 is the card on top
 * of the fan, so pass the strongest shot first.
 *
 * Uses sharp (already a Next dependency) rather than `sips`. macOS sips can
 * READ WebP but cannot WRITE it — `sips -s format webp` fails with
 * "Can't write format: org.webmproject.webp".
 *
 * Originals are never touched. Phone photos are 3-5 MB each; the panel is never
 * wider than ~400px on screen, so the long edge is capped at 1280px.
 */

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [slug, ...sources] = process.argv.slice(2);

if (!slug || sources.length === 0) {
  console.error("usage: node scripts/add-proof.mjs <slug> <photo> [photo...]");
  console.error("  slug: nexify | syntaxsprint | paycheck | python-workshop");
  process.exit(1);
}

if (sources.length > 3) {
  console.error(
    `${sources.length} photos given; the fan only shows 3. Drop the weakest.`,
  );
  process.exit(1);
}

const dest = path.join(process.cwd(), "public", "proof", slug);
await mkdir(dest, { recursive: true });

// check every source before writing anything, so a typo in the last argument
// doesn't leave a half-renumbered folder behind
for (const src of sources) {
  try {
    await stat(src);
  } catch {
    console.error(`missing: ${src}`);
    process.exit(1);
  }
}

const written = [];
for (const [i, src] of sources.entries()) {
  const out = path.join(dest, `${i + 1}.webp`);
  const info = await sharp(src)
    .rotate() // honour EXIF orientation, or phone shots land sideways
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(
    `  /proof/${slug}/${i + 1}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`,
  );
  written.push(`"/proof/${slug}/${i + 1}.webp"`);
}

console.log("\nNow set this in src/data/site.ts:");
console.log(`  photos: [${written.join(", ")}],`);

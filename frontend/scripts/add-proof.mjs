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
 *
 * Output names carry a content hash — `1-a3f9c2d1.webp`. Next's image optimizer
 * rejects query strings (`?v=2` returns 400), so the filename is the only thing
 * that can change when a photo is replaced. Without the hash, swapping a photo
 * leaves every browser that already loaded the old one showing it indefinitely,
 * which is exactly the bug this caused during development.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [slug, ...sources] = process.argv.slice(2);

if (!slug || sources.length === 0) {
  console.error("usage: node scripts/add-proof.mjs <slug> <photo> [photo...]");
  console.error("  slug: an achievement slug (nexify), or a path under public/ (certificates/c-language)");
  process.exit(1);
}

if (sources.length > 3) {
  console.error(
    `${sources.length} photos given; the fan only shows 3. Drop the weakest.`,
  );
  process.exit(1);
}

// A bare name is an achievement slug; anything containing a slash is a path
// under public/, so the same hashing works for certificates.
const dest = slug.includes("/")
  ? path.join(process.cwd(), "public", slug)
  : path.join(process.cwd(), "public", "proof", slug);
const urlBase = slug.includes("/") ? `/${slug}` : `/proof/${slug}`;
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

const existing = await readdir(dest).catch(() => []);
const written = [];

for (const [i, src] of sources.entries()) {
  const { data, info } = await sharp(src)
    .rotate() // honour EXIF orientation, or phone shots land sideways
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const hash = createHash("sha1").update(data).digest("hex").slice(0, 8);
  const name = `${i + 1}-${hash}.webp`;
  await writeFile(path.join(dest, name), data);

  // drop any previous file in this slot, so the folder never accumulates
  // orphaned hashes
  for (const old of existing) {
    if (old.startsWith(`${i + 1}-`) && old !== name) {
      await unlink(path.join(dest, old)).catch(() => {});
    }
  }

  console.log(
    `  ${urlBase}/${name}  ${info.width}x${info.height}  ${Math.round(data.length / 1024)}KB`,
  );
  written.push(`"${urlBase}/${name}"`);
}

console.log("\nNow set this in src/data/site.ts:");
console.log(`  photos: [${written.join(", ")}],`);

#!/usr/bin/env bash
#
# Import achievement proof photos.
#
#   ./scripts/add-proof.sh nexify ~/Desktop/pitch.jpg ~/Desktop/team.jpg
#
# Converts each photo to WebP and drops it into public/proof/<slug>/ numbered in
# the order given — 1.webp, 2.webp, 3.webp. Order matters: 1 is the card on top
# of the fan, so pass the strongest shot first.
#
# Phone photos are 3-5 MB each and three of them on one hover effect is a
# 15 MB download, hence the conversion. Long edge is capped at 1280px because
# the panel is never wider than ~400px on screen.

set -euo pipefail

SLUG="${1:-}"
shift || true

if [[ -z "$SLUG" || $# -eq 0 ]]; then
  echo "usage: $0 <slug> <photo> [photo...]" >&2
  echo "  slug: nexify | syntaxsprint | paycheck (or a new one)" >&2
  exit 1
fi

DEST="$(cd "$(dirname "$0")/.." && pwd)/public/proof/$SLUG"
mkdir -p "$DEST"

i=0
for src in "$@"; do
  i=$((i + 1))
  if [[ ! -f "$src" ]]; then
    echo "missing: $src" >&2
    exit 1
  fi
  sips -s format webp -Z 1280 "$src" --out "$DEST/$i.webp" >/dev/null
  printf '  /proof/%s/%s.webp  %s\n' "$SLUG" "$i" "$(du -h "$DEST/$i.webp" | cut -f1)"
done

echo
echo "Now set this in src/data/site.ts:"
printf '  photos: ['
for n in $(seq 1 $i); do
  printf '"/proof/%s/%s.webp"' "$SLUG" "$n"
  [[ $n -lt $i ]] && printf ', '
done
printf ']\n'

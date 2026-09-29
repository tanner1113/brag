#!/usr/bin/env bash
# Usage: bash prep-assets.sh /path/to/restoration-assets.tar.gz
#
# Extracts the client asset bundle and writes the display-ready crops the composition
# loads from composition/assets/. That folder is gitignored: this repo is public and the
# job photos belong to the client.
#
# Every before/after half is cropped to the same window as its partner (so the slider
# compares like with like), avoiding the baked-in logo badge, BEFORE/AFTER labels and
# CompanyCam watermark. Both halves get identical scaling and sharpening; no color changes.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tarball="${1:-}"
if [[ -z "$tarball" || ! -f "$tarball" ]]; then
  echo "usage: bash prep-assets.sh /path/to/restoration-assets.tar.gz" >&2
  exit 1
fi

src="$here/brag-output/work/src"
out="$here/composition/assets"
rm -rf "$src" "$out"
mkdir -p "$src" "$out/photos" "$out/brand"
tar -xzf "$tarball" -C "$src"
P="$src/photos"
B="$src/brand"

# crop W H X Y -> scale to OW x OH (lanczos, light unsharp), PNG to avoid a second JPEG pass
cut() {
  local in="$1" name="$2" w="$3" h="$4" x="$5" y="$6" ow="$7" oh="$8"
  ffmpeg -v error -y -i "$in" \
    -vf "crop=${w}:${h}:${x}:${y},scale=${ow}:${oh}:flags=lanczos,unsharp=5:5:0.35:5:5:0.0,format=rgb24" \
    "$out/photos/${name}.png"
}

# Side-by-side composites (1440x1440): halves are 720 wide. Rows 245-1045 clear the
# badge (y<=240) and labels/watermark (y>=1055). Shown at 1.5x -> 1080x1200.
for id in 07 08 09; do
  f=$(ls "$P"/${id}_*.jpg)
  cut "$f" "${id}_before" 720 800 0   245 1080 1200
  cut "$f" "${id}_after"  720 800 720 245 1080 1200
done

# Stacked composites (1440x1440): halves are 720 tall. Rows 0-560 of each half clear the
# labels/watermark (y>=569 within a half); x starts right of the badge (x<=264).
# Shown at 1.35x -> 1080x756.
stacked() {
  local id="$1" x="$2"
  local f
  f=$(ls "$P"/${id}_*.jpg)
  cut "$f" "${id}_before" 800 560 "$x" 0   1080 756
  cut "$f" "${id}_after"  800 560 "$x" 720 1080 756
}
stacked 01 300
stacked 06 340

# Hook: the whole overgrown BEFORE half of 11 (x>=280 clears the badge; the BEFORE label
# starts at x=1094). Shown at 1.35x -> 1080x972.
cut "$(ls "$P"/11_*.jpg)" "11_before_tall" 800 720 280 0 1080 972

# Native verticals (1440x1920) are used at 1:1; the composition crops and pans them.
for id in 02 03; do
  f=$(ls "$P"/${id}_*.jpg)
  ffmpeg -v error -y -i "$f" -vf "format=rgb24" "$out/photos/${id}.png"
done

# Logos: trim transparent padding, then scale to the exact sizes the composition draws.
python3 "$here/trim-logo.py" "$B/DERIVED_logo-w-name_WHITE_trimmed.png" "$out/brand/logo-white-header.png" 232
python3 "$here/trim-logo.py" "$B/drive_Logo-w-name_transparent_grey-layer-style.png" "$out/brand/logo-silver-endcard.png" 560

echo "assets ready in $out"
ls -1 "$out/photos" "$out/brand"

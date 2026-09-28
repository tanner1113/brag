#!/usr/bin/env bash
# Critique images for one rendered video. CRITIQUE.md explains how to read them.
#
#   bash critique.sh VIDEO [--strips 3.0,8.15,16.25] [--round N] [--out DIR] [--font FILE]
#
# Writes review/<video-name>/round-<N>/ (N defaults to the next unused round):
#   contact_2fps_NN.png  the whole video at 2 fps, tiled, with timestamps
#   strip_<t>.png        8 consecutive frames from 4 frames before each fast action
#                        (--strips from the shot list; default: detected cuts)
#   phone_360.mp4        the video at 360 px wide, plus phone_360_NN.png sheets at 1 fps
#   loop_seam.png/.txt   last frame | first frame | difference, their SSIM, audio level at both ends
#   probe.txt            streams, duration and loudness (integrated LUFS, true peak)
# Needs ffmpeg and ffprobe on PATH. Runs in bash 3.2+ (macOS), Linux, and Git Bash on Windows.
set -euo pipefail

usage() { sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

video="" strips="" round="" out="" font="${CRITIQUE_FONT:-}"
while [ $# -gt 0 ]; do
  case "$1" in
    --strips) strips="$2"; shift 2 ;;
    --round) round="$2"; shift 2 ;;
    --out) out="$2"; shift 2 ;;
    --font) font="$2"; shift 2 ;;
    -h|--help) usage 0 ;;
    -*) echo "critique.sh: unknown option $1" >&2; usage 1 ;;
    *) video="$1"; shift ;;
  esac
done
[ -n "$video" ] || usage 1
[ -f "$video" ] || { echo "critique.sh: $video not found" >&2; exit 1; }
for tool in ffmpeg ffprobe; do
  command -v "$tool" >/dev/null || { echo "critique.sh: $tool is not on PATH (see INSTALL.md)" >&2; exit 1; }
done

name=$(basename "$video"); name="${name%.*}"
if [ -z "$out" ]; then
  if [ -z "$round" ]; then round=1; while [ -d "review/$name/round-$round" ]; do round=$((round + 1)); done; fi
  out="review/$name/round-$round"
fi
mkdir -p "$out"

val() { ffprobe -v error -select_streams "$1" -show_entries "$2" -of default=nw=1:nk=1 "$video" | awk 'NR == 1'; }
W=$(val v:0 stream=width); H=$(val v:0 stream=height)
FPS=$(val v:0 stream=r_frame_rate | awk -F/ '{ printf "%.6f", ($2 ? $1 / $2 : $1) }')
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$video")
AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$video" | awk 'NR == 1')

# Timestamps need a font file on some ffmpeg builds (Windows). Find one, or leave them off.
if [ -z "$font" ]; then
  for f in "$(fc-match -f '%{file}' 'DejaVu Sans' 2>/dev/null || true)" \
    /System/Library/Fonts/Supplemental/Arial.ttf /Library/Fonts/Arial.ttf \
    /c/Windows/Fonts/arial.ttf /mnt/c/Windows/Fonts/arial.ttf /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf; do
    if [ -n "$f" ] && [ -f "$f" ]; then font="$f"; break; fi
  done
fi
if [ -n "$font" ] && command -v cygpath >/dev/null; then font=$(cygpath -m "$font"); fi
stamp() {  # "drawtext=...," showing each frame's time at size $1, or nothing without a font
  [ -n "$font" ] || return 0
  printf "drawtext=fontfile='%s':text='%%{pts\\\\:hms}':x=6:y=6:fontsize=%s:fontcolor=yellow:box=1:boxcolor=black@0.6," \
    "$(printf '%s' "$font" | sed 's/:/\\:/g')" "$1"
}

# Tile sizes by shape: sheets stay about 1500 px wide.
if [ "$H" -gt "$W" ]; then cols=8 th=320 sh=360
elif [ "$H" -eq "$W" ]; then cols=6 th=240 sh=270
else cols=5 th=180 sh=180; fi

# 1. Contact sheet at 2 fps.
rm -f "$out"/contact_2fps_*.png
ffmpeg -v error -y -i "$video" \
  -vf "fps=2,scale=-2:$th,$(stamp 16)tile=${cols}x5:padding=4:color=0x222222" "$out/contact_2fps_%02d.png"

# 2. Frame strips around fast actions. Default: detected cuts at least 1 s apart (up to 8),
#    or the quarter points if nothing cuts.
if [ -z "$strips" ]; then
  strips=$(ffmpeg -v info -i "$video" -an -vf "select='gt(scene,0.25)',showinfo" -f null - 2>&1 \
    | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 \
    | awk 'BEGIN { last = -10 } $1 - last >= 1 && n < 8 { printf "%s%s", (n++ ? "," : ""), $1; last = $1 }' || true)
  [ -n "$strips" ] || strips=$(awk -v d="$DUR" 'BEGIN { printf "%.2f,%.2f,%.2f", d / 4, d / 2, 3 * d / 4 }')
fi
rm -f "$out"/strip_*.png
for t in ${strips//,/ }; do
  start=$(awk -v t="$t" -v f="$FPS" 'BEGIN { s = t - 4.5 / f; printf "%.3f", (s < 0 ? 0 : s) }')
  tag=$(awk -v t="$t" 'BEGIN { printf "%06.2f", t }')
  ffmpeg -v error -y -ss "$start" -copyts -i "$video" -frames:v 1 \
    -vf "select='lt(n\,8)',scale=-2:$sh,$(stamp 14)tile=8x1:padding=2:color=0x222222" "$out/strip_$tag.png"
done

# 3. Phone test: the whole video at 360 px wide, and 1 fps sheets at that size.
ffmpeg -v error -y -i "$video" -vf "scale=360:-2:flags=area" -c:v libx264 -preset veryfast -crf 23 \
  -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "$out/phone_360.mp4"
rm -f "$out"/phone_360_*.png
ffmpeg -v error -y -i "$video" \
  -vf "fps=1,scale=360:-2:flags=area,$(stamp 12)tile=6x2:padding=4:color=0x222222" "$out/phone_360_%02d.png"

# 4. Loop seam: last frame | first frame | 4x-amplified difference, SSIM, and audio level at both ends.
ffmpeg -v error -y -i "$video" -frames:v 1 "$out/first.png"
ffmpeg -v error -y -sseof -0.5 -i "$video" -update 1 "$out/last.png"
ssim=$(ffmpeg -i "$out/last.png" -i "$out/first.png" -lavfi "[0][1]ssim" -f null - 2>&1 \
  | grep -o 'All:[0-9.]*' | tail -n1 | awk -F: '{ printf "%.3f", $2 }' || true)
ffmpeg -v error -y -i "$out/last.png" -i "$out/first.png" -filter_complex \
  "[0]format=gbrp,split[a][a2];[1]format=gbrp,split[b][b2];[a2][b2]blend=all_mode=difference,lutrgb=r='min(val*4\,255)':g='min(val*4\,255)':b='min(val*4\,255)'[d];[a]scale=-2:360[x];[b]scale=-2:360[y];[d]scale=-2:360[z];[x][y][z]hstack=inputs=3" \
  "$out/loop_seam.png"
rms() {
  ffmpeg "$@" -vn -af astats -f null - 2>&1 | grep 'RMS level dB' | tail -n1 \
    | awk '{ v = $NF; if (v ~ /inf/) print "-inf"; else printf "%.1f", v }' || true
}
a_start="n/a" a_end="n/a"
if [ -n "$AUDIO" ]; then a_start=$(rms -t 0.05 -i "$video"); a_end=$(rms -sseof -0.05 -i "$video"); fi
cat > "$out/loop_seam.txt" <<EOF
loop_seam.png: last frame | first frame | difference (amplified 4x)
SSIM, last vs first frame: ${ssim:-n/a}   (1.0 = identical; a seamless loop needs about 0.9 or more)
audio RMS, first 50 ms: $a_start dB   last 50 ms: $a_end dB
Looping piece: the last frame should flow into the first, and neither end should be loud (a click at the seam).
One-shot piece: the first frame is the poster, and the last 50 ms should be near silence (below about -40 dB)
so the ending doesn't cut a sound off.
EOF

# 5. Probe: streams, duration, loudness.
{
  echo "file: $video"
  ffprobe -v error -show_entries \
    format=duration,size,bit_rate:stream=codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,color_space,sample_rate,channels \
    -of default=nw=1 "$video"
  if [ -n "$AUDIO" ]; then
    echo "loudness (EBU R128, target about -14 LUFS, true peak at or below -1 dBTP):"
    ffmpeg -nostats -hide_banner -i "$video" -vn -af ebur128=peak=true -f null - 2>&1 \
      | awk '/Summary:/ { s = 1 } s' | grep -E 'I:|LRA:|Peak:' | sed 's/^ */  /'
  fi
} > "$out/probe.txt"

sheets=$(ls "$out"/contact_2fps_*.png | wc -l | tr -d ' ')
loud=$(grep -E ' I:' "$out/probe.txt" | awk '{ print $2, $3 }' || true)
echo "critique: $out"
echo "  ${W}x${H} at $(awk -v f="$FPS" 'BEGIN { printf "%g", f }') fps, $(awk -v d="$DUR" 'BEGIN { printf "%.1f", d }') s${loud:+, $loud}"
echo "  contact_2fps_NN.png ($sheets sheets), strips at ${strips}, phone_360.mp4 and sheets"
echo "  loop seam SSIM ${ssim:-n/a}; audio ends $a_start / $a_end dB; probe.txt"
[ -n "$font" ] || echo "  (no font found for timestamps: pass --font FILE or set CRITIQUE_FONT)"
echo "Next: look at every image, then grade with prompts/harsh-director.md and log docs/review_log.md."

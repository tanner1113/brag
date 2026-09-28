# Critique loop

Every render is reviewed the way a harsh director would review it: scored, logged and fixed, round after round, until it's good. Review all three formats in every round.

## One round

1. **Make the review images** for each format. Use `--strips` for the times of fast actions from the shot list: cuts, wipes, slider moves, pops. Without it, the script picks detected cuts.

   ```bash
   bash scripts/critique.sh out/<slug>_9x16_1080x1920_v1.mp4 --strips 3.0,8.15,16.25
   ```

   ```powershell
   .\scripts\critique.ps1 -Video out\<slug>_9x16_1080x1920_v1.mp4 -Strips 3.0,8.15,16.25
   ```

   Output goes to `review/<video-name>/round-<n>/`. The round number counts up by itself; pass `--round` / `-Round` to set it.
2. **Look at every image yourself.** Don't grade from memory or from the code.
3. **Grade** with `prompts/harsh-director.md`: six scores from 1 to 10 for each format.
4. **Log** the round in `docs/review_log.md` (template in `templates/docs/`): the scores for each format, and the three worst problems, each with its format and timestamp, the fix, and the seconds to re-render.
5. **Fix the three worst problems**, not the three easiest.
6. **Re-render only the affected seconds**, for example `node render.mjs --format square --range 12-16` (see RENDER.md). Then run the full critique again, because a fix can break something else.
7. **Repeat** until every score in every format is 8 or higher.
   - Flagship pieces get at least 3 rounds, even if they pass sooner. Flagship means lead-gen ads, brand story pieces, anything 30 s or longer, anything going to paid distribution, and anything the brief calls flagship.
   - After 6 rounds without passing, stop and report the blocking problems to the caller instead of looping.

## What the script makes

| Check | Files | What to look for |
|---|---|---|
| Contact sheet at 2 fps | `contact_2fps_NN.png` | The whole piece at a glance. A run of 9 or more near-identical tiles is a stall over 4 s. Also check: a weak first tile, missing brand, one move repeated everywhere, banned imagery in any tile. |
| Frame strips | `strip_<t>.png` | 8 consecutive frames, starting 4 frames before each fast action. Look for pops, jitter, double exposures, text collisions, lazy easing. |
| Phone test at 360 px wide | `phone_360.mp4`, `phone_360_NN.png` | Can every line meant to be read be read at phone size? Check small labels, thin weights and low contrast. Landscape at 360 px is the harshest case, a wide video in a phone feed, and its must-read type should still pass. |
| Loop seam | `loop_seam.png`, `loop_seam.txt` | The last frame, the first frame and their difference, plus SSIM and the audio level at both ends. A looping piece needs a smooth seam and no click. A one-shot needs a real poster frame first and near-silence (below −40 dB) in the last 50 ms. |
| Probe | `probe.txt` | Size, fps, codecs, color tags, duration and loudness: about −14 LUFS integrated, true peak at or below −1 dBTP. |

## The six scores

| Score | 10 | 8 (the bar) | 5 | 1 |
|---|---|---|---|---|
| Hook | Frame 0 stops the scroll; the hook is readable by 1 s | Clear subject; the hook is readable by 2 s | The hook arrives late or is generic | Black, a logo sting or a fade-up |
| Phone readability | Every line crisp at 360 px, with strong contrast | Every must-read line legible at 360 px | Some lines small, thin or low-contrast | Unreadable at phone size |
| Motion quality | Every move motivated and eased; nothing to fix in the strips | Clean strips: no pops, collisions or double exposures | Visible jitter, collisions or muddy crossfades | Broken timing or flicker |
| Variety | Something new every 2–4 s; varied shots and transitions | No stall over 4 s; no move three times in a row | Stalls, or one move used everywhere | A static slideshow |
| Brand accuracy | Exact colors and faces, the logo early and at the end, every rule met | Every rule met; the logo early and at the end | Off colors or faces, or the logo only at the end | Any rule or banned-imagery violation (caps the score at 3) |
| Sound sync | Every cut on a measured beat, effects on their events, the final hit on the end card, −14 LUFS | Cuts within 1 frame of the beats; −14 ±1 LUFS | Drifting cuts or harsh effects | No sync, or clipping |

## The commands behind critique.sh

`critique.ps1` runs the same commands. Here `$V` is the video, `$O` the round folder and `$FONT` a font file for the timestamps. `critique.sh` finds a font itself (on Windows it's `C\:/Windows/Fonts/arial.ttf`, with the colon escaped).

```bash
# 1. Contact sheet: 2 fps, timestamped, 8x5 tiles (6x5 for square, 5x5 for landscape)
ffmpeg -i "$V" -vf "fps=2,scale=-2:320,drawtext=fontfile='$FONT':text='%{pts\:hms}':x=6:y=6:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=8x5:padding=4:color=0x222222" "$O/contact_2fps_%02d.png"

# 2. Frame strip: 8 consecutive frames starting 4 frames before t (here t = 8.15 s at 30 fps)
ffmpeg -ss 8.000 -copyts -i "$V" -frames:v 1 -vf "select='lt(n\,8)',scale=-2:360,drawtext=...,tile=8x1:padding=2:color=0x222222" "$O/strip_008.15.png"

# Default strip times: detected cuts
ffmpeg -i "$V" -an -vf "select='gt(scene,0.25)',showinfo" -f null - 2>&1 | grep -o 'pts_time:[0-9.]*'

# 3. Phone test: 360 px wide, as a video and as 1 fps sheets
ffmpeg -i "$V" -vf "scale=360:-2:flags=area" -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 96k "$O/phone_360.mp4"
ffmpeg -i "$V" -vf "fps=1,scale=360:-2:flags=area,drawtext=...,tile=6x2:padding=4:color=0x222222" "$O/phone_360_%02d.png"

# 4. Loop seam: first and last frames, SSIM, a side-by-side with a 4x difference, audio level at both ends
ffmpeg -i "$V" -frames:v 1 "$O/first.png"
ffmpeg -sseof -0.5 -i "$V" -update 1 "$O/last.png"
ffmpeg -i "$O/last.png" -i "$O/first.png" -lavfi "[0][1]ssim" -f null - 2>&1 | grep -o 'All:[0-9.]*'
ffmpeg -i "$O/last.png" -i "$O/first.png" -filter_complex "[0]format=gbrp,split[a][a2];[1]format=gbrp,split[b][b2];[a2][b2]blend=all_mode=difference,lutrgb=r='min(val*4\,255)':g='min(val*4\,255)':b='min(val*4\,255)'[d];[a]scale=-2:360[x];[b]scale=-2:360[y];[d]scale=-2:360[z];[x][y][z]hstack=inputs=3" "$O/loop_seam.png"
ffmpeg -t 0.05 -i "$V" -vn -af astats -f null - 2>&1 | grep 'RMS level dB' | tail -n1
ffmpeg -sseof -0.05 -i "$V" -vn -af astats -f null - 2>&1 | grep 'RMS level dB' | tail -n1

# 5. Probe and loudness
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,color_space,sample_rate,channels -of default=nw=1 "$V"
ffmpeg -nostats -i "$V" -vn -af ebur128=peak=true -f null - 2>&1 | grep -A12 'Summary:'
```

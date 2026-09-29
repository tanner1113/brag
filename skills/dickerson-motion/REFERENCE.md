# Reference → style guide and shot list

Before any render code, every piece gets two approved documents:

- `docs/style_guide.md`: how the piece looks and moves.
- `docs/shotlist.md`: every shot, second by second.

Both live in the project folder. The templates are in `templates/docs/`.

## With a reference

The caller may supply a single frame, a video, or a folder of images.

- **Borrow its grammar:** rhythm, shot lengths, transitions, camera moves, texture, and how type is set and enters and exits.
- **Never borrow its content:** not its footage or images, words, logos, characters, music or distinctive graphics.

Map every trait onto Dickerson material. The reference's shots become job photos, its colors become the brand palette in RULES.md, and its type becomes the two brand faces.

1. **Extract.** Keep the reference out of git, then run:

   ```bash
   python scripts/reference.py path/to/reference.mp4 --out ref/
   python scripts/reference.py path/to/folder-of-images --out ref/
   python scripts/reference.py path/to/frame.png --out ref/
   ```

   | Output | What it holds |
   |---|---|
   | `ref/frames/` | Samples: 2 per second for video, or the images themselves |
   | `ref/contact_NN.png` | The samples tiled, with timestamps for video |
   | `ref/shots.json` | Video only: every scene change (hard cuts, plus wipes and slides found by comparing frames 0.25 s apart), shot lengths, the median and range, cuts per 10 s |
   | `ref/strips/cut_<t>.png` | 8 consecutive frames around each scene change |
   | `ref/palette.json`, `palette.png` | Dominant colors as hex with their share of pixels, and accent candidates |
   | `ref/summary.md` | All of the above, ready to paste |

2. **Look** at the contact sheets, the strips around scene changes, and individual frames. Note:
   - **Shot lengths**: median, shortest and longest, and how they sit on the music.
   - **Transitions**: type (hard cut, wipe, push, match cut, mask reveal), direction, and duration in frames. The strips show this.
   - **Camera moves** on stills and footage: push-in speed (percent of scale per second), pans, parallax, handheld drift.
   - **Texture**: grain, blur, vignette. Use them only within RULES.md.
   - **Type**: weight, width, case, size relative to frame height, line length, alignment and tracking.
   - **Text in and out**: how lines enter and leave (mask slide, per-line stagger, direction), how long it takes, and how long lines stay settled.

3. **Write `docs/style_guide.md`** from the template. For each trait (palette, type, shot lengths, transitions, camera moves, texture, text in and out), record what the reference does and the Dickerson version. Finish with a "borrowed / not borrowed" list.

4. **Write `docs/shotlist.md`** from the template:
   - the brief's constraints first: prices, banned imagery, required wording, CTA;
   - the photo check against banned imagery and privacy;
   - every shot, with its time window on beats from `beats.json`, the visual (photo file and focal point per format), the exact on-screen text, the motion, and the sound cue;
   - the cadence check.

5. **STOP.** Show both documents to the caller with a one-paragraph summary, and ask for approval.
   - Write no render code, composition files or render commands until the caller explicitly approves ("approved", "go ahead", "build it"). Silence and "looks interesting" are not approval.
   - If they ask for changes, revise both documents and ask again.
   - Record the approval (who, when, which revision) at the top of `docs/shotlist.md`.

## Without a reference

Write both documents anyway, from RULES.md and the brief, and stop for approval the same way. The style guide then records the house grammar:

- the brand palette and the two faces;
- shot lengths set by the music (2–4 s, on downbeats);
- lines that slide up out of a mask;
- before/after wipes with labels riding the divider;
- slow push-ins on photos, with a little seeded drift;
- hard cuts on the beat, with brand-red wipes at section changes.

## The ffmpeg commands behind reference.py

Run these by hand if Python isn't available:

```bash
# 2 fps samples, 480 px on the long side (tall video shown; use 480:-2 for wide)
ffmpeg -i ref.mp4 -vf "fps=2,scale=-2:480" ref/frames/f_%04d.png

# Contact sheets from the samples
ffmpeg -framerate 2 -i ref/frames/f_%04d.png -vf "scale=-2:270,tile=8x5:padding=4:color=0x222222" ref/contact_%02d.png

# Hard cuts: times of frames whose scene score passes 0.3
ffmpeg -i ref.mp4 -an -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"

# Wipes and slides: 4 fps grayscale thumbnails; big differences between neighbors mark a scene change
ffmpeg -i ref.mp4 -vf "fps=4,scale=64:64,format=gray" -f rawvideo -pix_fmt gray ref/gray4fps.raw

# 8 consecutive frames starting 4 frames before a change at 12.40 s (30 fps)
ffmpeg -ss 12.25 -i ref.mp4 -frames:v 1 -vf "select='lt(n\,8)',scale=-2:270,tile=8x1" ref/strips/cut_012.40.png

# Dominant colors, as a quick visual check
ffmpeg -i ref.mp4 -vf "fps=1,scale=160:-2,palettegen=max_colors=8" -frames:v 1 ref/palette_ffmpeg.png
```

Windows PowerShell takes the same commands. Double quotes work as written; if you pipe to `grep`, use `Select-String` instead.

---
name: dickerson-motion
description: Make Dickerson Services videos (the HVAC, crawlspace and indoor-air company in Guntersville, North Alabama) with /brag-slim's build-it-yourself pipeline, plus Dickerson's brand rules, an approval gate, a critique loop and native renders in three formats. Use for any Dickerson Services video — before-and-afters, service explainers, seasonal promos, social cuts, lead-gen ads or brand story pieces — including when a /brag or /brag-slim request is about Dickerson Services.
---

# Dickerson motion

**First, on every run: read [`RULES.md`](RULES.md) in full, before anything else.** It overrides /brag-slim wherever the two differ, and every critique round grades against it.

This skill makes Dickerson Services videos the /brag-slim way: you build every frame yourself in a browser, as a pure function of time, and encode with ffmpeg. On top of that it adds what a real local business needs:

- fixed brand rules;
- a style guide and shot list that the caller approves before any code;
- a harsh, scored critique loop;
- one timeline rendered natively in three formats.

Where this file is silent, follow /brag-slim (`skills/brag-slim/SKILL.md`). Its creative laws (the hook, readability, showing the real thing, every frame postable) and its sound guidance still apply.

## Inputs

Ask only for what's missing and can't be inferred.

- **The brief:** the piece type, audience, the one message, the call to action and the duration. It also sets any prices (only prices written in the brief may appear), required wording and **banned imagery** (a hard filter; see RULES.md).
- **Job photos** from real Dickerson jobs (CompanyCam exports). Never generated or stock.
- **Brand files:** the logo files listed in RULES.md, placed in the project's `assets/brand/`.
- **A reference (optional):** a frame, a video or a folder of images whose *grammar* to borrow.
- **Music (optional):** a track from the brief, or one of the bundled tracks in `skills/brag/assets/music/`. Check the license before paid use.

## Steps

1. **Rules and brief.** Read RULES.md, then the brief. Copy the brief's constraints (supplied prices, banned imagery, required wording, CTA, phone, URL) into the top of `docs/shotlist.md` before doing anything else.
2. **Project.** Copy `templates/project/` to the project folder, for example `projects/<slug>/`.
   - Every `docs/`, `work/`, `out/` and `review/` path in this skill is inside that folder. Never use the repo's own `docs/` (the launch site).
   - Put the job photos in `assets/photos/` and the logos in `assets/brand/`.
   - In a public repo, keep `assets/`, `work/`, `out/` and `review/` out of git. The template's `.gitignore` does this.
3. **Music.** Run `scripts/beats.py` on the track so shot windows can sit on measured beats (see [`AUDIO.md`](AUDIO.md)).
4. **Style guide and shot list, then STOP.** Follow [`REFERENCE.md`](REFERENCE.md). With a reference, extract its frames and borrow its grammar; without one, work from RULES.md. Write `docs/style_guide.md` and `docs/shotlist.md` from `templates/docs/`. Show both to the caller and **wait for explicit approval. Write no render code before it.**
5. **Build.** After approval, build the composition against the layout function (see [`RENDER.md`](RENDER.md)):
   - `seek(t)` only;
   - every position and type size from `layout(format)`;
   - every cut on a beat from `beats.json`.

   Check stills in all three formats, including frames in the middle of transitions.
6. **Sound.** Edit the music on measured downbeats, add effects in the track's key, and master to about −14 LUFS (see AUDIO.md).
7. **Render** all three formats from the one timeline: 1080×1920, 1080×1080 and 1920×1080. RENDER.md has the commands and the file names.
8. **Critique loop.** Follow [`CRITIQUE.md`](CRITIQUE.md):
   1. Run `scripts/critique.sh` on each format.
   2. Score the six categories with `prompts/harsh-director.md`, and log the scores to `docs/review_log.md`.
   3. Fix the three worst problems, and re-render only the affected seconds.
   4. Repeat until every score is 8 or higher. Flagship pieces get at least 3 rounds.
9. **Deliver:**
   - the three MP4s with their posters;
   - the approved style guide and shot list;
   - the review log;
   - 1–3 sentences of share copy.

   Say where everything is and give the last round's scores.

## Files

| File | Use |
|---|---|
| `RULES.md` | Brand, tone, imagery and render rules. Read first, every run. |
| `REFERENCE.md` | Reference → style guide and shot list, then the approval gate. |
| `RENDER.md` | The layout function, the `seek(t)` contract, the three-format commands and the file names. |
| `AUDIO.md` | `beats.py`, beat-timed cuts, music edits, the −14 LUFS master. |
| `CRITIQUE.md` | The review loop, the six scores, and the critique commands. |
| `INSTALL.md` | Setup on macOS, Linux and Windows 11 (PowerShell). |
| `prompts/harsh-director.md` | The critique prompt for every review round. |
| `scripts/beats.py` | Writes `beats.json` (bpm, beats, downbeats, onset hits) for a track. |
| `scripts/reference.py` | Pulls frames, cuts, strips and a palette out of a reference. |
| `scripts/critique.sh`, `scripts/critique.ps1` | Contact sheet, frame strips, phone test, loop seam and probe (bash, and a PowerShell port). |
| `templates/docs/` | `style_guide.md`, `shotlist.md` and `review_log.md`, ready to fill in. |
| `templates/project/` | A starter composition and renderer that follow the contract. |

## Defaults

| Setting | Default |
|---|---|
| Formats | All three: `vertical` 1080×1920, `square` 1080×1080, `landscape` 1920×1080 |
| Frame rate | 30 fps |
| Duration | Social cut 10–15 s; before/after 15–25 s; lead-gen ad and seasonal promo 15–30 s; service explainer 30–60 s; brand story 45–90 s |
| Output | H.264 High, yuv420p, BT.709; AAC 48 kHz; about −14 LUFS, true peak ≤ −1 dBTP |
| Flagship | Lead-gen ads, brand story pieces, anything 30 s or longer, anything going to paid distribution, and anything the brief calls flagship |

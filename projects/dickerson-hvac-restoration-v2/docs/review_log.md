# Review log: Dickerson Services, HVAC System Restoration, v2

**The bar:** every score 8 or more, in every format. **Flagship:** yes (lead-gen ad for paid distribution), so at least 3 rounds.
**Grader:** `skills/dickerson-motion/prompts/harsh-director.md` · **Images:** `review/<video-name>/round-<n>/` from `scripts/critique.sh` (not committed; they contain client photos)

Round 2 was graded by a fresh reviewer (a separate agent given only the harsh-director prompt, RULES.md, CRITIQUE.md, the shot list and the round's images), as the prompt recommends; the author checked each claim against the images before logging it. Rounds 1, 3 and 4 were graded by the author: the fresh reviewer could not be started for rounds 3 and 4 (model usage limit).

## Round 1 · Sep 28, 2026 · first render

### vertical (9x16)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 7 | 7 | 6 | 7 | 7 |

Evidence for the 8: frame 0 is settled, with the whole hook in 104 px Display type, "NEW SYSTEM?" in red and the badge already in the header band; the subject (a condenser swallowed by vines) reads at thumbnail size.

Worst three problems, worst first:
1. **[00:07.62–00:18.53]** The same move four scenes running: a hard cut, then a left-to-right before/after sweep, in 4a, 4b, 4c and 4d (five times in the piece, counting scene 2). **Fix:** 4b sweeps top to bottom, 4c becomes a split where the AFTER half slides in beside the BEFORE half, and 4d keeps the left-to-right sweep. **Re-render:** 7.6–18.6 s.
2. **[00:05.45–00:07.62]** The three paths, the turn of the whole ad, are 56 px grey chips that read as UI tags; and **[00:18.53–00:22.34]** "Evidence Before Recommendation", the brief's thesis line, is a 36 px kicker above a sentence. **Fix:** set the paths as headline lines (Noto Sans Display 900, about 96 px), fill "SYSTEM RESTORATION" red on the beat, and morph that row into the 4a kicker; make "EVIDENCE BEFORE RECOMMENDATION." the 5a headline, with the sentence under it. **Re-render:** 5.4–7.7 s and 18.5–22.4 s.
3. **[00:00.00–00:29.60]** True peak is −0.7 dBTP on the delivered file (the rule is −1 dBTP or lower): the −1.2 dBTP master overshoots in the AAC encode. **Fix:** master to −2.0 dBTP. **Re-render:** audio, all formats.

Also noted: **[00:11.99–00:12.04]** "COMPONENTS" from 4b is still rising out over the 4c photo after the hard cut. **[00:25.09–00:25.55]** the wipe clears onto an empty black frame, since the badge only starts to move at 25.33 s and the offer at 25.55 s. **[00:26.55–00:29.60]** "BOOK" on the button is 30 px (10 px on a 360-px phone). The phone number is set in Noto Sans Display, but RULES.md §4 gives the phone number to Noto Sans, and the checklist uses Noto Sans at 87.5% width where the rule says normal width.

Verdict: ANOTHER ROUND

### square (1x1)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 7 | 7 | 6 | 7 | 7 |

Evidence for the 8: same settled frame 0 as vertical; the 84 px hook fills the text block under a 500 px photo band.

Worst three problems, worst first:
1. **[00:07.62–00:18.53]** The same cut-plus-sweep four times running, as in vertical. **Fix:** as vertical. **Re-render:** 7.6–18.6 s.
2. **[00:05.45–00:07.62]** The three paths are 48 px chips, and "Evidence Before Recommendation" is a 32 px kicker. **Fix:** as vertical. **Re-render:** 5.4–7.7 s and 18.5–22.4 s.
3. **[00:26.55–00:29.60]** "BOOK" is 26 px (about 9 px at phone size) and the kickers are 32 px (11 px), the smallest must-read type in the piece. **Fix:** "BOOK" at 0.75 em of the button, kickers 38 px, BEFORE/AFTER 36 px. **Re-render:** 7.6–18.6 s and 25–29.6 s.

Also noted: the leftover "COMPONENTS" at 11.99 s, the empty end card reveal at 25.09 s and the −0.7 dBTP true peak, as in vertical.

Verdict: ANOTHER ROUND

### landscape (16x9)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 6 | 6 | 6 | 7 | 7 |

Evidence for the 8: frame 0 has the hook settled beside the overgrown condenser, with the badge in the header band.

Worst three problems, worst first:
1. **[00:07.62–00:18.53]** The same cut-plus-sweep four times running. **Fix:** as vertical. **Re-render:** 7.6–18.6 s.
2. **[00:07.62–00:18.53]** In the 360-px phone test the kickers (44 px) are about 8 px tall and BEFORE/AFTER (40 px) about 7.5 px; "BOOK" (32 px) is 6 px. **Fix:** kickers 56 px, labels 48 px, "BOOK" 0.75 em, and the text column widened to 814 px so the larger type fits. **Re-render:** all.
3. **[00:04.78–00:05.45, 00:09.16–00:09.81, 00:16.99–00:18.53]** After every sweep the AFTER label parks inside the photo's feathered right edge and reads as a half-transparent ghost. **Fix:** labels show only while their divider is on screen and fade out with it, so none is ever parked. **Re-render:** 3.7–18.6 s.

Also noted: the three-path chips (52 px), the leftover "COMPONENTS", the empty end card reveal and the −0.7 dBTP true peak.

Verdict: ANOTHER ROUND

**Fixed this round (all formats, one timeline):**
- Three different reveals: 4b sweeps top to bottom, 4c is a split where the AFTER half slides in (side by side in vertical and square, stacked in landscape), and 2, 4a and 4d sweep left to right.
- The three paths are now headline lines. "SYSTEM RESTORATION" fills red on the beat, then shrinks and rises into the 4a kicker, easing its width, weight and tracking until it matches the kicker exactly at the cut.
- "EVIDENCE BEFORE RECOMMENDATION." is the 5a headline ("EVIDENCE" in red), with the sentence under it on the next beat (19.07 s).
- Every text block now finishes leaving at least a frame before the hard cut that follows it (tested).
- End card: the badge sets off at 25.2 s, as soon as the wipe's trailing edge has cleared its path (tested per frame), and the offer rises under the clearing wipe. The checks, button and URL follow on the beat grid (25.63, 25.90, 26.18, 26.45 s).
- BEFORE and AFTER show only while their divider is on screen.
- Larger phone type: kickers 42/38/56 px, labels 38/36/48 px, "BOOK" at 0.75 em. The landscape text column is 814 px wide.
- Faces: the phone number is now Noto Sans 700, and the checklist uses Noto Sans at normal width, in sentence case.
- Audio: master ceiling −2.0 dBTP, so the delivered files measure −14.1 LUFS and −1.5 dBTP. Sound cues follow the new moves: a falling sweep for 4b, air panning in from the right for the 4c split, and the end card ticks on their new beats.

**Re-rendered:** all three formats in full (a 29.6 s render takes about 50 s). `check-badge.py`: header band untouched until 25.2 s in all three.

## Round 2 · Sep 28, 2026 · fresh reviewer

### vertical (9x16)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 6 | 6 | 7 | 6 | 8 | 8 |

Evidence for the 8s: the badge sits in the header band from 0.00 and both red curtains stop under it (strips 18.40–18.63, 24.97–25.33). "$85" appears only in the offer, and there are no corner tags or brackets. BEFORE/AFTER ride the divider, and no banned equipment shows in any tile. Audio: −14.1 LUFS, −1.5 dBTP, silent last 50 ms; the hard cuts land on the first frame after each measured beat.

Worst three problems, worst first:
1. **[00:22.34–00:25.09]** The thesis, "Replacement may be the right answer. It shouldn't be the automatic answer.", is small sentence-case text, and its payoff "automatic answer." is #D51E30 on #111 (about 3.6:1). Lines 3–4 are settled only about 1.5 s. **Fix:** make 5b a Display 900 headline block, bring lines 3–4 in on the half-beat (22.62), and turn AUTOMATIC ANSWER. red on the 22.900 downbeat. **Re-render:** 22.3–25.1 s.
2. **[00:03.27–00:05.30]** "YOU MAY HAVE A THIRD OPTION." is settled about 1.4 s (0.23 s a word) while the sweep pulls the eye away. **Fix:** start scene 2 a beat earlier (2.69) and leave the sweep on 3.784. **Re-render:** 2.5–5.5 s.
3. **[00:00.00–00:25.09]** Every scene is one template (header band, a photo strip a third of the frame tall, kicker and headline on flat black, the same mask-rise), so two thirds of every frame is flat black and the evidence never gets bigger than a strip. **Fix:** grow the photo to about half the frame with the text over its feathered base, give 5a a different layout, and replace some mask-rises with moves driven by the content. **Re-render:** 0–25.1 s.

Verdict: ANOTHER ROUND

### square (1x1)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 7 | 6 | 7 | 6 | 8 | 8 |

Evidence for the 8s: as vertical (header clear above both curtains, cuts on 7.633 and 12.000, curtains fully covering at 18.500 and 25.100).

Worst three problems, worst first:
1. **[00:22.34–00:25.09]** The thesis sits as four small caption lines, and lines 3–4 get about 1.5 s. **Fix:** as vertical. **Re-render:** 22.3–25.1 s.
2. **[00:03.27–00:05.30]** THIRD OPTION. is settled about 1.4 s. **Fix:** as vertical. **Re-render:** 2.5–5.5 s.
3. **[00:07.62–00:25.09]** Every scene after the hook is built the same way, and the same flat red curtain is used at 18.30 and 24.86. **Fix:** change the 5a layout and replace the second curtain with a different move. **Re-render:** 7.6–25.3 s.

Verdict: ANOTHER ROUND

### landscape (16x9)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 7 | 4 | 7 | 6 | 8 | 8 |

Evidence for the 8s: as vertical (badge top-left in the header band at frame 0, the header clear above both curtains, no banned equipment in any tile).

Worst three problems, worst first:
1. **[00:03.78–00:29.60]** In the 360-px test everything below headline size is barely legible (checklist, 5a sentence, 5b, end card checks, button, URL), and the kickers, BEFORE/AFTER and "BOOK" can't be read. **Fix:** widen the text column to start at about 46% of the width, scale the secondary type up about 1.5 times, and set chips and "BOOK" much larger. **Re-render:** 3.7–29.6 s.
2. **[00:22.34–00:25.09]** The thesis is caption-size, with about 1.5 s settled. **Fix:** as vertical. **Re-render:** 22.3–25.1 s.
3. **[00:03.27–00:05.30]** THIRD OPTION. is settled about 1.4 s. **Fix:** as vertical. **Re-render:** 2.5–5.5 s.

Verdict: ANOTHER ROUND

**Other problems the reviewer noticed (all formats unless marked):**
- **[00:00.00–00:03.27]** The hook is a static card, with nothing happening on the 1.079 downbeat.
- **[00:14.17–00:14.85], [00:25.63–00:26.00]** Check rows are revealed by a left-to-right mask that freezes on partial words ("Performa"), which reads like the banned type-on look.
- **[00:18.30], [00:24.86]** The same red curtain twice. The final hit lands on a blank red frame.
- **[00:09.00], [00:15.80–00:16.30]** BEFORE/AFTER caught half-faded.
- **Every text change** has 2–4 blank frames on the beat.
- **[00:26.18–00:29.60]** The phone number and "BOOK" are third-tier type.
- **[00:18.60–00:25.00]** Photo 10 holds 6.4 s and reads as louvers beside a tan wall, not a packed coil.
- **Header badge:** only the "D" reads at 360 px.
- **Landscape:** the end card logo outranks the offer.

The author checked each claim against the round 2 images before acting on it.

**Fixed this round (one timeline, all formats):**
- 5b is a Display 900 headline. Lines 3–4 come in on the half-beat (22.62), and "AUTOMATIC ANSWER." turns red with a left-to-right wipe on the build downbeat (22.90), with a soft tick. Lines 3–4 now settle about 1.8 s.
- Scene 2 starts a beat earlier (2.69) as a push: the photo and the hook's text slide out left as the new photo and "YOU MAY HAVE A THIRD OPTION." slide in from the right, each inside its own region. The line is now settled 3.11–5.44 s (0.39 s a word).
- Vertical photo band 372–1312 px (square 146–746) feathering out under the top of the text block, with a tight drop shadow on type where it crosses the feather (RULES.md limits).
- The hook photo punches in on the 1.079 downbeat (1.00→1.06).
- 5a is a new layout: before photos from three of the jobs (08, 04, 09) side by side (stacked in landscape), revealed by the wipe. Photo 10 is no longer used.
- The end card arrives on a hard cut on the final hit instead of a second curtain. The badge sets off on the cut and the offer is already rising.
- Every text change now happens on its cut or beat: the old block holds until the cut and the new one rises from it, so no beat lands on an empty text area.
- Check rows rise out of masks like the headlines; no partial words.
- BEFORE/AFTER ride in and out with the divider, which now starts and ends off the frame (sine-eased sweeps, 1.3 s; 4d 1.4 s). There are no fades.
- Phone type: kickers 50/46/76 px and labels 50/46/64 px (vertical/square/landscape). "BOOK" is the same size as the phone number, and the button is larger (72/60/88 px).
- Landscape: text column 900–1824 px, headlines 120 px, secondary type 84 px, and a smaller end card logo with the offer in a 1064 px column.
- Badge 250/190/200 px wide (was 220/170/180).

**Re-rendered:** all three formats in full. `npm test` (24 checks) and lint pass. `check-badge.py`: header band untouched until the end card cut (25.086 s) in all three. Loudness −14.1 LUFS, true peak −1.6 dBTP.

## Round 3 · Sep 29, 2026 · author

The fresh-reviewer subagent could not be started this round (model usage limit), so the author graded it from the round 3 images.

### vertical (9x16)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 8 |

Evidence for the 8s: frame 0 is settled, with the hook in 104 px Display type over the overgrown unit, and the photo punches in on the 1.079 downbeat. At 360 px every must-read line reads; the smallest are the 50 px kickers and BEFORE/AFTER labels (about 17 px on the phone). The longest stretch with nothing new is 5a's settled text (19.3–22.3 s) while the tiles push in, and no reveal runs three times in a row. The badge holds the header band from 0.00 through the push and the brand wipe, "$85" appears only in the offer, there are no corner tags or brackets, and no tile shows banned equipment. Audio: −14.1 LUFS, −1.6 dBTP, last 50 ms silent, and each hard cut lands on the first frame after its measured downbeat.

Worst three problems, worst first:
1. **[00:07.63, 00:12.00, 00:14.20, 00:22.37, 00:25.10]** The first frame after a cut has an empty text area: the new photo is up but the headline only starts rising on the next frame, and at 25.10 the end card is black apart from the badge. **Fix:** text that arrives on a cut starts rising 0.07 s before it and shows from the cut, so the first frame already has the line moving. **Re-render:** all.
2. **[00:02.77–00:03.00]** In the push, the hook's lines are cut off at the text block's left edge (x 90) and the new lines appear at its right edge (x 960) while the photo slides across the full frame, so the type seems to pass behind an invisible box. **Fix:** widen each line's mask to the frame edges for the push. **Re-render:** 2.6–3.2 s.
3. **[00:12.52–00:12.75]** The 4c split starts on the beat but barely moves for its first 7 frames (in-out cubic), so the beat lands on a still frame and the AFTER half arrives late. **Fix:** out-cubic, so the half moves from its first frame and lands softly; the air cue follows the same curve. **Re-render:** 12.4–13.4 s.

Verdict: ANOTHER ROUND

### square (1x1)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 8 |

Evidence for the 8s: as vertical, with an 84 px hook; the smallest must-read type is the 46 px kickers, labels and end card checks (about 15 px on the phone).

Worst three problems, worst first:
1. **[00:07.63, 00:12.00, 00:14.20, 00:22.37, 00:25.10]** An empty text area on the first frame after each cut, as in vertical (at 12.00 only the MAY INCLUDE tag is up). **Fix:** as vertical. **Re-render:** all.
2. **[00:02.77–00:03.00]** The pushed lines are clipped at the text block's edges (x 60 and 1020), not the frame's. **Fix:** as vertical. **Re-render:** 2.6–3.2 s.
3. **[00:12.52–00:12.75]** The split sits still for 7 frames after its beat. **Fix:** as vertical. **Re-render:** 12.4–13.4 s.

Verdict: ANOTHER ROUND

### landscape (16x9)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 8 |

Evidence for the 8s: frame 0 has the hook settled beside the overgrown unit. In the 360-px test the checklist, the 5a sentence and the thesis (84 px, about 16 px on the phone) all read, and so do the end card checks, button and URL; the smallest must-read type is BEFORE/AFTER (64 px, 12 px on the phone), still legible in its chip. Brand and sound as vertical.

Worst three problems, worst first:
1. **[00:07.63, 00:12.00, 00:14.20, 00:22.37, 00:25.10]** An empty text column on the first frame after each cut; at 12.00 only the MAY INCLUDE tag sits beside the new photo. **Fix:** as vertical. **Re-render:** all.
2. **[00:02.77–00:03.00]** The new lines appear at the text column's right edge (x 1824) instead of sliding in from the frame edge. **Fix:** the mask runs from the column's inner edge (x 900, so type never crosses the photo) to the right frame edge. **Re-render:** 2.6–3.2 s.
3. **[00:12.52–00:12.75]** The stacked split sits still for 7 frames after its beat. **Fix:** as vertical. **Re-render:** 12.4–13.4 s.

Verdict: ANOTHER ROUND

**Fixed this round (one timeline, all formats):**
- Text on a cut (4a, 4b, 4c, 4d, the three paths, 5b and the end card offer) starts rising 0.07 s before the cut and shows from the cut, so every cut is a cut on action. The 4a kicker still replaces the rising row exactly on the cut.
- The push clips its text at the frame edges in vertical and square, and between the text column's inner edge and the right frame edge in landscape.
- The 4c split eases out-cubic; its air cue uses the same curve.

**Re-rendered:** all three formats in full. `npm test` (24 checks) and lint pass, and `npm run check` renders the same frame identically after seeking elsewhere and back. `check-badge.py`: header band untouched until 25.086 s in all three. Loudness −14.1 LUFS, true peak −1.8 dBTP.

## Round 4 · Sep 29, 2026 · author

The fresh-reviewer subagent was blocked by the model usage limit again, so the author graded round 4. Every contact sheet, strip and phone sheet in all three formats was checked, plus full-resolution frames from the delivered files wherever a tile was ambiguous (landscape 2.83, 18.47 and 25.10 s). The automated checks were re-run on the delivered files.

### vertical (9x16)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 |

Evidence for the 8s:
- **Hook:** frame 0 is settled, with the whole hook in 104 px Display type over the overgrown unit and the badge in the header band. The photo punches in on the 1.079 downbeat. Nothing is black, faded up or held for a logo sting.
- **Phone readability:** at 360 px every must-read line reads, down to the 46–50 px checklist rows, end card checks and URL (about 16 px on the phone).
- **Motion quality:** round 3's three faults are gone. Text is already rising on the first frame after every cut (7.633, 12.000, 14.200, 22.367, 25.100), the push clips at the frame edges, and the 4c split moves from 12.533, its first frame after the beat. No strip shows a pop, collision, double exposure or crossfade.
- **Variety:** the longest stretch with nothing new is 5a's settled text (19.3–22.3 s, 3.0 s) while its tiles push in. There are three different reveals, and none runs three times in a row.
- **Brand accuracy:** the badge holds the header band from 0.00 until the end card cut, and the red wipe (18.30–18.76) stays below it. "$85" is the only price. There are no corner tags, brackets, glow or particles. Only photos 04, 06, 07, 08, 09 and 11 appear, with no mini-split, wall head or line set in any tile (06's copper stays outside the crop through 13.0–14.1).
- **Sound sync:** −14.1 LUFS, −1.8 dBTP, last 50 ms silent. Each hard cut is the first frame after its measured downbeat, and the final hit lands on the end card cut (25.086, frame 25.100).

Worst three problems, worst first:
1. **[00:26.18–00:26.35]** The button opens left to right with its label clipped, so a partial phone number ("BOOK 256-203-") shows for about five frames, where every other line rises whole. **Fix:** raise the button out of a mask like the lines above it. **Re-render:** 26.1–26.6 s.
2. **[00:25.10–00:25.20]** The badge's travel eases in-out, so for the end card's first four frames it has barely left the header and only the offer's first line is moving. **Fix:** ease the travel out-cubic so it moves from the cut. **Re-render:** 25.0–25.7 s.
3. **[00:02.69–00:02.74]** The push also eases in-out: two frames after its beat it has moved under 5 px. **Fix:** out-cubic, as for the 4c split. **Re-render:** 2.6–3.2 s.

None of the three shows as a fault at playback speed, and none takes a score below 8.

Verdict: SHIP

### square (1x1)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 |

Evidence for the 8s: as vertical, with an 84 px hook over the overgrown unit. The smallest must-read type is the 46 px kickers, labels, checklist rows and end card checks (about 15 px on the phone), and all of it reads. The cuts, split, wipe and end card land on the same frames as vertical, and no tile shows banned equipment.

Worst three problems, worst first:
1. **[00:26.18–00:26.35]** The button's clipped reveal, as vertical. **Fix:** as vertical. **Re-render:** 26.1–26.6 s.
2. **[00:25.10–00:25.20]** The badge's slow start on the end card cut, as vertical. **Fix:** as vertical. **Re-render:** 25.0–25.7 s.
3. **[00:02.69–00:02.74]** The push's slow start, as vertical. **Fix:** as vertical. **Re-render:** 2.6–3.2 s.

Verdict: SHIP

### landscape (16x9)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 |

Evidence for the 8s: frame 0 has the 120 px hook settled beside the overgrown unit, with the badge top left. In the 360-px test the checklist, the 5a sentence, the thesis (84 px, about 16 px on the phone) and the end card checks, button and URL all read. The smallest must-read type is BEFORE/AFTER (64 px, 12 px on the phone), still legible in its chip. At 2.83 s the hook's lines leave at the text column's inner edge (x 900) while "YOU MAY HAVE A THIRD OPTION." enters from the frame edge, so no type crosses the photo. The stacked 4c split moves from 12.533. At 18.47 the wipe covers everything but its last few pixels on the right, and never the header band. Brand and sound as vertical.

Worst three problems, worst first:
1. **[00:26.18–00:26.35]** The button's clipped reveal, as vertical. **Fix:** as vertical. **Re-render:** 26.1–26.6 s.
2. **[00:25.10–00:25.20]** At the end card cut the badge is still in the header and only the offer's first line is rising in the right-hand column, so the left half of the frame is empty for four frames. **Fix:** as vertical. **Re-render:** 25.0–25.7 s.
3. **[00:02.69–00:02.74]** The push's slow start, as vertical. **Fix:** as vertical. **Re-render:** 2.6–3.2 s.

Verdict: SHIP

**Left as they are:** the three notes above, recorded for the next revision.

**Checked on the delivered files:** `npm test` (24 checks), lint and `npm run check` pass. `check-badge.py` passes in all three: 752 frames each (0–25.086 s), with a peak header band change of 49, 44 and 29 code values (vertical, square, landscape; the limit is 110). All three files are H.264 High, yuv420p, BT.709, 30 fps, AAC 48 kHz stereo, 29.6 s, −14.1 LUFS and −1.8 dBTP.

## Final scores

| Format | Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync | Verdict |
|---|---|---|---|---|---|---|---|
| vertical (1080×1920) | 8 | 8 | 8 | 8 | 8 | 8 | SHIP |
| square (1080×1080) | 8 | 8 | 8 | 8 | 8 | 8 | SHIP |
| landscape (1920×1080) | 8 | 8 | 8 | 8 | 8 | 8 | SHIP |

Four rounds: round 1 and rounds 3–4 graded by the author, round 2 by a fresh reviewer.

# Review log: Dickerson Services, HVAC System Restoration, v3

**The bar:** every score 8 or more, in every format. **Flagship:** yes (lead-gen ad for paid distribution), so at least 3 rounds.
**Grader:** `skills/dickerson-motion/prompts/harsh-director.md` · **Images:** `review/<video-name>/round-<n>/` from `scripts/critique.sh` (not committed; they contain client photos)

Rounds are self-graded. A separate reviewer was not available for v3 (the v2 fresh-reviewer subagent was already blocked by a model usage limit, and this pass graded from the round images directly).

## Round 1 · Sep 29, 2026 · first v3 render

Graded from the round-1 contact sheets, strips, phone sheets, probe and loop seam in all three formats, plus full-resolution frames of the vertical file at 0.00, 2.70, 4.20, 9.00, 10.50, 11.10, 12.70, 16.40, 19.50, 25.15 and 26.20 s. The three v2 timing notes are fixed on this render: the push is moving at 2.700, the logo is moving and turning silver by 25.15, and the button at 26.20 shows the whole number "BOOK 256-203-6612".

### vertical (9x16)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 8 |

Evidence for the 8s: frame 0 is settled, the hook is fully set in 104 px type over the overgrown unit, and the badge is in the header band. At 360 px the hook, the three paths, the checklist, the thesis and the end-card number all read. The longest hold with nothing new is the evidence sentence over the pushing tiles (about 18.8–22.3 s). Reveals are a left-to-right sweep, a top-to-bottom sweep, a split, then a two-up, so no move runs three times in a row. Audio is −14.1 LUFS, peak −1.6 dBFS, and the last 50 ms is silent.

Worst three problems, worst first:
1. **[00:03.78–00:07.62 and 00:18.53–00:25.09]** The outdoor-unit window still contains the electrical disconnect and its conduit. At 4.20 s the conduit is on the right of the washed cabinet, and the same window is the left tile of the evidence grid. **Fix:** stop the shared 19/20 window at x=780 and y=940 so the disconnect, the conduit, the shuttered window and the pad line-set stub are outside every format's crop. **Re-render:** 2.7–7.7 s and 18.5–25.1 s.
2. **[00:10.90–00:11.40]** On the top-to-bottom wipe, BEFORE rides down into the photo's feather and sits on the MAY INCLUDE kicker (frame at 11.10 s). **Fix:** fade each y-axis label out before its box reaches the text block. The divider keeps moving. **Re-render:** 10.3–11.7 s.
3. **[00:16.35–00:18.53 and 00:18.53–00:25.09]** Photo 22 is framed on the housing, so the dirty wheel is stuck at the bottom of the left blower panel and the evidence tile reads as a shelf. **Fix:** recrop 22 onto the wheel (x 340–1040, y 460–1020), still clear of the blurry wires. **Re-render:** 16.3–25.1 s.

Verdict: ANOTHER ROUND

### square (1x1)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 8 |

Evidence for the 8s: same settled frame 0, with an 84 px hook. The phone sheets read through the end card, including the full number. Variety and sound match vertical.

Worst three problems, worst first:
1. **[00:03.78–00:07.62 and 00:18.53–00:25.09]** The square cover uses the full width of the 19/20 window, so the disconnect and conduit are in frame on the outdoor unit and again in the evidence grid. **Fix:** as vertical. **Re-render:** 2.7–7.7 s and 18.5–25.1 s.
2. **[00:10.90–00:11.40]** BEFORE meets the kicker on the top-to-bottom wipe, as vertical. **Fix:** as vertical. **Re-render:** 10.3–11.7 s.
3. **[00:16.35–00:18.53]** The left blower panel is housing, as vertical. **Fix:** as vertical. **Re-render:** 16.3–25.1 s.

Verdict: ANOTHER ROUND

### landscape (16x9)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 8 |

Evidence for the 8s: frame 0 has the 120 px hook beside the overgrown unit. In the 360-px sheets the checklist, the thesis and the end-card number read. The push clips outgoing type at the text column's inner edge. The top-to-bottom labels stay in the photo, because the text column does not overlap it.

Worst three problems, worst first:
1. **[00:18.53–00:25.09]** The stacked evidence tile of 19 uses the full width of the window, so the disconnect's conduit can enter the top tile. **Fix:** as vertical. **Re-render:** 2.7–7.7 s and 18.5–25.1 s.
2. **[00:16.35–00:18.53 and 00:18.53–00:25.09]** The 22 crop is mostly housing, and a short landscape tile crops the wheel off. **Fix:** as vertical. **Re-render:** 16.3–25.1 s.
3. **[00:10.33–00:11.64]** The interior pair's angle change is allowed, and the labels do not hit the text column. No third fault at the bar. **Fix:** none beyond 1 and 2. **Re-render:** none.

Verdict: ANOTHER ROUND

**Fixed this round (all formats, one timeline):**
- 19/20 window is now x 300–780, y 400–940. The disconnect, its conduit, the shuttered window and the pad line-set stub are outside the window, so no format can show them.
- 22's window is the wheel (x 340–1040, y 460–1020). The blurry wires stay out. Focus is 0.46, 0.62.
- A top-to-bottom label fades out across 28 px before it reaches a text block that overlaps the photo. Landscape is unchanged, because its text sits beside the photo.

## Round 2 · Sep 29, 2026 · self-graded

Re-rendered all three formats. Badge check passes (header-band peaks 49, 41 and 44; limit 110). Graded the round-2 sheets and strips, plus full frames at 4.20, 11.05, 11.20, 16.50 and 19.50 s.

### vertical (9x16)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 8 |

Evidence for the 8s: frame 0 is unchanged and still settled. The outdoor unit at 4.20 s is the cabinet and the brick, with no disconnect and no conduit. The blower two-up at 16.50 s is two dirty wheels, unlabeled. The evidence grid at 19.50 s is the outdoor unit, the blower wheel and the coil. Audio is −14.1 LUFS, peak −1.6 dBFS, last 50 ms silent.

Worst three problems, worst first:
1. **[00:10.97–00:11.10]** BEFORE still reaches the feather and touches the top of MAY INCLUDE for about four frames (strip at 11.10 s). The fade finishes, but too late. **Fix:** finish the fade by 56% of the photo height, where the feather starts. **Re-render:** 10.3–11.7 s.
2. **[00:04.20]** The departing AFTER chip is a single letter at the left edge while it rides off with the divider. That is the designed exit, and it does not sit on the type. **Fix:** none. **Re-render:** none.
3. **[00:16.35–00:18.53]** The checklist line "Before-and-after photos" holds over two dirty wheels. They are unlabeled and both dirty, so the line stays a service item. **Fix:** none. **Re-render:** none.

Verdict: ANOTHER ROUND

### square (1x1)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 8 |

Evidence for the 8s: the square outdoor crop at 4.20 s has no disconnect. The blower two-up at 16.50 s reads as two dirty wheels. Phone type matches the v2 sizes that already passed at 360 px.

Worst three problems, worst first:
1. **[00:10.97–00:11.20]** The same late fade: AFTER is still in the feather just above MAY INCLUDE at 11.20 s. **Fix:** as vertical. **Re-render:** 10.3–11.7 s.
2. **[00:04.20]** A clipped AFTER letter at the left edge, riding out with the divider. **Fix:** none. **Re-render:** none.
3. **[00:16.35–00:18.53]** The checklist holds over the dirty wheels, as vertical. **Fix:** none. **Re-render:** none.

Verdict: ANOTHER ROUND

### landscape (16x9)

| Hook | Phone readability | Motion quality | Variety | Brand accuracy | Sound sync |
|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 |

Evidence for the 8s: at 4.20 s the cabinet crop has brick and no conduit, and BEFORE sits on the photo clear of the text column. At 16.50 s both blower tiles show the wheel. At 19.50 s the stack is outdoor unit, blower, coil, and the 120 px thesis reads. In the 360-px sheet the end card shows the full number "BOOK 256-203-6612". The text column does not overlap the photo, so the top-to-bottom labels never meet the kicker.

Worst three problems, worst first:
1. **[00:04.20]** BEFORE is fully drawn; the paired label is off the left edge with the divider, as designed. **Fix:** none. **Re-render:** none.
2. **[00:10.33–00:11.64]** The interior pair's angle differs, which the brief allows. The pan reads as cleaned against the leaves. **Fix:** none. **Re-render:** none.
3. **[00:16.35–00:18.53]** The checklist holds beside the dirty wheels. **Fix:** none. **Re-render:** none.

Verdict: ANOTHER ROUND (scores pass; the flagship round minimum is 3, and vertical and square are not there yet)

**Fixed this round:** the top-to-bottom fade now finishes at 56% of the photo height, at the start of the feather, instead of a few pixels above the text block.

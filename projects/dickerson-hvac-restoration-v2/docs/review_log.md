# Review log: Dickerson Services, HVAC System Restoration, v2

**The bar:** every score 8 or more, in every format. **Flagship:** yes (lead-gen ad for paid distribution), so at least 3 rounds.
**Grader:** `skills/dickerson-motion/prompts/harsh-director.md` · **Images:** `review/<video-name>/round-<n>/` from `scripts/critique.sh` (not committed; they contain client photos)

Round 1 was graded by the author. Rounds 2 and later were graded by a fresh reviewer (a separate agent given only the harsh-director prompt, RULES.md, CRITIQUE.md, the shot list and the round's images), as the prompt recommends; the author checked each claim against the images before logging it.

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

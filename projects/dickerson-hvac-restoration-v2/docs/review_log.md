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

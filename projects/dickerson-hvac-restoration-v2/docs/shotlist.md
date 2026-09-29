# Shot list: Dickerson Services, HVAC System Restoration, v3

**Status:** APPROVED. The v3 job brief (Sep 29, 2026) builds on the v2 timeline the owner already approved: same script, same scene order, the $85 Aging HVAC Evaluation as the only price, and the three timing fixes called out in the v2 review. This revision weaves the new outdoor-unit and blower photos into the restoration and evidence sections.
**Piece:** lead-gen ad (flagship: at least 3 critique rounds) · **Duration:** 29.6 s · **fps:** 30
**Formats:** 1080×1920 (primary), 1080×1080, 1920×1080, from one timeline
**Music:** `happy-beats-business-moves-vol-12` (109.98 BPM, measured with `beats.py` into `work/beats.json`). The video starts at track 1.115 s, a measured beat. There are two splices, each attack to attack on a measured downbeat:
- at 14.169 s, back one bar (track 15.284 → 13.102), so the fuller section (track 17.461) lands on the evidence scene at 18.528 s;
- at 22.900 s, from the groove (track 21.833) into the last build bar (track 111.284), so the closing hit (track 113.470) lands on the end card at 25.086 s.

## Brief constraints (hard)

- **Supplied prices:** "$85", for the **$85 Aging HVAC Evaluation**. It is the only price anywhere in the piece.
- **Banned imagery:**
  - Central ducted system imagery only: air handlers, evaporator coils, blower wheels in air handlers or furnaces, ductwork, furnaces and outdoor condensers.
  - **No ductless mini-splits, wall heads or exposed line sets, under any circumstances.** This is a hard filter, checked on the full photo and on every format's crop.
  - Photos 01, 02 and 03 are excluded outright.
  - Photo 06 stays cropped so its refrigerant line set never enters the window.
  - Photo 22 is cropped so the blurry wires at the lower left never enter the window.
- **Required wording:**
  - the hook "Tired of being told you need a new system?";
  - the three paths "Repair / System Restoration / Replacement";
  - "Evidence Before Recommendation";
  - the close on the "$85 Aging HVAC Evaluation".
- **Restoration items:** only the doc's "may include" list, in its phrasing.
- **CTA:** Book: **256-203-6612** · **dickersonservices.com**
- **Audience and the one message:** homeowners with aging systems who keep hearing "you need a new system". The message: you may have a third option, and the recommendation should follow the evidence. v3 has to show restoration of the whole system: outdoor unit, blower, and coil.
- **Tone:** education-forward. No urgency, no invented stats, reviews, warranties or claims, no mold or health talk, and no attacks on competitors.
- **Honesty for the new photos:** 17/18 and 19/20 are true before/after pairs and may wipe. 21 and 22 are dirty blower wheels. 23 is a clean blower from a different job. 21/22 and 23 are never labeled BEFORE/AFTER and never wiped into each other.
- **Carry-over fixes:**
  - hold the checklist noticeably longer;
  - never cover or cut the badge in a transition;
  - remove the "NORTH ALABAMA" corner tag;
  - remove the viewfinder bracket;
  - the Book button's phone number is never partly drawn;
  - the end-card logo move and the push into scene 2 use an out-cubic ease, so both move on their first frame.

## Photo check

The whole photo was checked first. Crop windows are in `prep-assets.py`, and every format shows only part of its window, so a clean window means a clean crop in every format. The per-format crops are checked again on stills (see the review log).

| Photo | What it shows | Banned imagery | Privacy | Use |
|---|---|---|---|---|
| 01, 02, 03 | Evaporator coil and blower wheel | **FAIL:** read as a ductless wall head (brief) | — | excluded |
| 04 | A-coil in a cased plenum, dirty and cleaned | pass (the coil's copper return bends are cropped out) | pass | 4a; coil before in the 5a grid |
| 05 | Indoor coil, stacked | pass | pass | not used: staining and a mottled cabinet wall could read as mold |
| 06 | Air handler cabinet: old drain, then new PVC trap with red cleanout caps | **pass only as cropped:** refrigerant line set and copper enter at the top right of both halves. The window (x 275–1090, 125–605 px into each half) keeps them out. | pass | 4c |
| 07 | Coil surface, grimy and clean | pass | pass | 4d |
| 08 | Outdoor condenser coil, debris and clean | pass | pass | not used: a coil close-up. 19/20 now carry the outdoor unit |
| 09 | Condenser side panel, grass and washed | pass | pass | not used: replaced by the 17/18 interior clean-out |
| 10 | Condenser louvers and coil, packed and clean | pass | pass | not used: at phone size the louver close-up reads as a grille beside a wall |
| 11 | Packaged central unit overgrown with vines | pass: packaged central unit; its open control box wiring is cropped out | pass | 1 |
| 12 | Basement ductwork, old and new | pass | pass | not used: the "after" shows a newly installed unit, which reads as selling new equipment |
| 13 | Duct leakage gauge (291 → 42) | not system imagery | pass | not used: the readings would imply a results claim |
| 14, 15, 16 | Crawlspace encapsulation and ducts | pass | pass | not used: a different service (16 also has a black pipe that could be misread and printed numbers) |
| 17 | Looking down into an outdoor condenser: compressor in wet leaves | pass: ducted condenser interior. Internal compressor piping is the unit, not a line set to a wall head | pass | 4b before, with 18 |
| 18 | Same condenser after the debris was cleaned out | pass, same reason. Framing differs from 17 (the addendum); the wipe compares the pan, it does not pretend the angle matches | pass | 4b after |
| 19 | Packaged outdoor unit, dull cabinet, before the wash | pass as cropped: the shuttered window, the disconnect and its conduit, and the pad line-set stub are outside the window (x 300–780, y 400–940) | pass | 2 before; outdoor before in the 5a grid |
| 20 | Same unit after the cabinet was washed | pass, same window as 19 | pass | 2 after; darkened behind the three paths |
| 21 | Close-up of a dirty centrifugal blower wheel | pass as cropped: foliage and a red edge on the right stay outside the window | pass | 4e, beside 22. Not a pair with 23 |
| 22 | Dirty blower wheel in an air-handler cabinet | pass as cropped: the window sits on the wheel (x 340–1040, y 460–1020). The blurry wires (about x<280 and y>1040) stay outside it. The motor shaft at the lower left is part of the blower | pass | 4e, and the blower tile in the 5a grid |
| 23 | Clean centrifugal blower wheel | pass | pass | **not used.** It is a different job from 21 and 22. Putting it next to them, or cutting to it from them, would read as that wheel's after. There is no other window long enough for a standalone close-up without dropping a required line |

**Used:** 04, 06, 07, 11, 17, 18, 19, 20, 21, 22. All come from this bundle. Nothing outside the bundle was added.

## Shots

Times are in video seconds. "db" is a measured downbeat and "b" a measured beat (track time, then its video time).

| # | Window (s) | On the beat | Visual (focus per format) | On-screen text (exact) | Motion | Sound |
|---|---|---|---|---|---|---|
| 1 | 0.000–2.690 | frame 0; punch on db 2.194 → 1.079 | `11_before`: matted coil behind the wire guard, weeds. Focus 0.50,0.42 | TIRED OF / BEING TOLD / YOU NEED A / **NEW SYSTEM?** | Settled on frame 0, with the badge in the header band and the text over the photo's feathered base. Push-in 1.00→1.06 with seeded drift, and a punch-in (×1.06, 0.6 s) on the downbeat. | Music in on the beat (60 ms fade); low air on the punch |
| 2 | 2.690–5.445 | push on b 3.805 → 2.690; sweep on b 4.899 → 3.784 | `19_before` → `20_after`, outdoor unit exterior wash; focus 0.50,0.40 | YOU MAY HAVE A / **THIRD OPTION.** | **Push** (0.42 s, out-cubic, moving on the first frame): the hook photo and its text slide out left as the outdoor-unit photo and the new lines slide in from the right. The photo stays in its band; the text runs out at the frame edges (landscape: from the text column's inner edge). **Left-to-right sweep** 3.784–5.084: BEFORE rides in ahead of the divider, AFTER follows it out. | Air on the push, panning right to left, on the same out-cubic curve; air on the sweep |
| 3 | 5.445–7.621 | db 6.560 → 5.445; highlight on b 7.639 → 6.524 | `20_after`, the washed outdoor unit, darkened to 50% | REPAIR / SYSTEM RESTORATION / REPLACEMENT, as headline lines (Display 900) | Text cut on the downbeat: the lines rise out of their masks from 5.445. On the highlight beat the middle line fills red and the others dim to 38%. At 7.20 the others clear and the red line shrinks and rises into the kicker slot, easing its width, weight and tracking until it matches the SYSTEM RESTORATION kicker, which replaces it on the cut. | Soft air as the lines rise; mallet tick on the highlight; air on the rise |
| 4a | 7.621–9.807 | db 8.736 (bass entry) → 7.621; sweep on b 9.271 → 8.156 | `04` before → after, indoor coil; focus 0.40,0.55 | [SYSTEM RESTORATION] MORE THAN A / BASIC TUNE-UP. | Hard cut on the bass entry, the headline rising from the cut; **left-to-right sweep** 8.156–9.456 | Air on the sweep, panning left to right |
| 4b | 9.807–11.987 | db 10.922 → 9.807; sweep b 11.450 → 10.335 | `17_before` → `18_after`, condenser interior; focus 0.48,0.52 | [MAY INCLUDE] DEEP CLEANING / OF ACCESSIBLE / COMPONENTS | Hard cut; the kicker swaps; **top-to-bottom sweep** 10.335–11.635 (a wash-down into the cabinet), AFTER riding above the divider and BEFORE below it | Air falling in pitch with the divider |
| 4c | 11.987–14.169 | db 13.102 → 11.987; split on b 13.630 → 12.515 | `06` before → after; focus 0.62,0.50 | [MAY INCLUDE] REPLACEMENT / OF DEFINED / AGE-RELATED PARTS | Hard cut; **split** 12.515–13.315 (out-cubic, moving from its first frame): the AFTER half slides in (from the right in vertical and square, from below in landscape) and BEFORE slides over, until old and new parts sit side by side (stacked in landscape) with BEFORE and AFTER on either side of the divider; held to the cut | Air panning in from the right |
| 4d | 14.169–16.351 | db 13.102 (splice) → 14.169; rows on half-beats; sweep b 14.193 → 15.260 | `07` before → after, coil surface; focus 0.50,0.35 | [MAY INCLUDE] ☐ Performance checks / ☐ Before-and-after photos / ☐ Written condition report | Hard cut; rows rise out of their masks at 14.169, 14.442 and 14.715 and hold through 4e. **Left-to-right sweep** 15.260–16.351, one beat, finishing as the next scene cuts. | Mallet ticks on each row, rising; air on the sweep |
| 4e | 16.351–18.528 | db 15.284 → 16.351 | **Blower evidence:** `22_blower` and `21_blower` side by side (stacked in landscape), 12–14 px gap, each with its own push-in. No BEFORE/AFTER, no divider, no wipe. | The 4d checklist holds. No new line. | Hard cut on the downbeat. The two dirty wheels push in until the evidence wipe. | Short air on the cut, out-cubic |
| 5a | 18.528–22.337 | db 17.461 (fuller section) → 18.528 | **Evidence grid:** `19_before` (outdoor unit), `22_blower` (blower), `04_before` (coil), side by side (stacked in landscape), 12–14 px gaps, each with its own push-in | **EVIDENCE** BEFORE / RECOMMENDATION. (headline) · We don't decide the answer / before looking at the system. | Brand wipe in the content area only (18.298–18.758, full cover at 18.528); its trailing edge reveals the tiles left to right. The headline rises from 18.59 and the sentence follows straight on from 18.83. Both hold until the beat at 22.337. | Airy wipe with body |
| 5b | 22.337–25.086 | b 21.270 → 22.337; half-beat 22.618; red on db 21.833 → 22.900 | The grid, darkened to 72% | REPLACEMENT MAY BE / THE RIGHT ANSWER. / IT SHOULDN'T BE THE / **AUTOMATIC ANSWER.** (headline) | Text cut on the beat: lines 1–2 rise from 22.337, lines 3–4 from 22.618. AUTOMATIC ANSWER. turns red with a left-to-right wipe (0.3 s) on the build downbeat at 22.900. | Soft swell into the statement; a soft G5 tick on the red; build bar from 22.900 |
| 6 | 25.086–29.600 | final hit 113.470 → 25.086; then the beat grid (0.545 s) | Background only | [logo] / **$85** AGING HVAC / EVALUATION / ✓ A clear first look / ✓ A next-step recommendation / [BOOK  256-203-6612] / dickersonservices.com | **Hard cut on the final hit.** The badge sets off on the cut and moves out-cubic into the logo slot by 25.586, crossfading to the silver logo as it travels; the offer rises from the cut. Checks at 25.632 and 25.904. The button settles in over 0.24 s from 26.177 with the phone number fully drawn on every frame (no clip). URL at 26.45, then all hold. | Warm C major bloom under the final hit; air on the badge travel, on the same out-cubic curve; ticks on the checks; a short air as the button settles |

## Cadence check

- **Hook fully readable by:** 0.0 s. It's settled on frame 0, which is also the thumbnail.
- **Logo first on screen:** 0.0 s. It stays in the header band through every transition, then becomes the end card logo.
- **Longest stretch with nothing new:** 3.0 s (5a's settled text, 19.3–22.3, while the tiles push in). The checklist copy holds from 14.2 to 18.5, and the photo changes under it at 15.26 (the coil sweep) and 16.35 (the blower cut). The end card's final hold is about 2.7 s (26.9–29.6).
- **The three parts:** outdoor unit in 2, 3 and the 5a grid (19/20); blower in 4e and the 5a grid (22, with 21 beside it); coil in 4a, 4d and the 5a grid (04 and 07).
- **Reveals:** left-to-right sweep (2, 4a, 4d), top-to-bottom sweep (4b), split (4c), two-up with no divider (4e). No reveal runs three times in a row. Scene changes: push (2), text cut (3), hard cuts (4a–4e), brand wipe (5a), text cut (5b), hard cut on the final hit (6).
- **Tightest reading times:** 5b's lines 3–4 are settled about 23.12–25.09 s, 2.0 s for 6 words; the hook is settled 0–2.69 s, 2.7 s for 9 words; "YOU MAY HAVE A THIRD OPTION." is settled 3.11–5.44 s, 2.3 s for 6 words; 5a's sentence is settled 19.33–22.34 s, 3.0 s for 10 words.
- **Education and invitation:** 8 educational scenes (0–25.1 s) and 1 invitation, the end card (25.1–29.6 s, 15%).

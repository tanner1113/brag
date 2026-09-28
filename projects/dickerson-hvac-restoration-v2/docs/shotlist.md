# Shot list: Dickerson Services, HVAC System Restoration, v2

**Status:** APPROVED. *The owner pre-approved the v1 script and the constraints below in the job 2 brief (Sep 28, 2026); this is revision 1.*
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
- **Required wording:**
  - the hook "Tired of being told you need a new system?";
  - the three paths "Repair / System Restoration / Replacement";
  - "Evidence Before Recommendation";
  - the close on the "$85 Aging HVAC Evaluation".
- **Restoration items:** only the doc's "may include" list, in its phrasing.
- **CTA:** Book: **256-203-6612** · **dickersonservices.com**
- **Audience and the one message:** homeowners with aging systems who keep hearing "you need a new system". The message: you may have a third option, and the recommendation should follow the evidence.
- **Tone:** education-forward. No urgency, no invented stats, reviews, warranties or claims, no mold or health talk, and no attacks on competitors.
- **Carry-over fixes:**
  - hold the checklist noticeably longer;
  - never cover or cut the badge in a transition;
  - remove the "NORTH ALABAMA" corner tag;
  - remove the viewfinder bracket.

## Photo check

The whole photo was checked first. Crop windows are in `prep-assets.py`, and every format shows only part of its window, so a clean window means a clean crop in every format. The per-format crops were also checked on stills (see the review log).

| Photo | What it shows | Banned imagery | Privacy | Use |
|---|---|---|---|---|
| 01, 02, 03 | Evaporator coil and blower wheel | **FAIL:** read as a ductless wall head (brief) | — | excluded |
| 04 | A-coil in a cased plenum, dirty and cleaned | pass (the coil's copper return bends are cropped out) | pass | 4a |
| 05 | Indoor coil, stacked | pass | pass | not used: staining and a mottled cabinet wall could read as mold |
| 06 | Air handler cabinet: old drain, then new PVC trap with red cleanout caps | **pass only as cropped:** refrigerant line set and copper enter at the top right of both halves. The window (x 275–1090, 125–605 px into each half) keeps them out. | pass | 4c |
| 07 | Coil surface, grimy and clean | pass | pass | 4d |
| 08 | Outdoor condenser coil, debris and clean | pass | pass | 2, 3 |
| 09 | Condenser side panel, grass and washed | pass | pass | 4b |
| 10 | Condenser louvers and coil, packed and clean | pass | pass | 5a, 5b |
| 11 | Packaged central unit overgrown with vines | pass: packaged central unit; its open control box wiring is cropped out | pass | 1 |
| 12 | Basement ductwork, old and new | pass | pass | not used: the "after" shows a newly installed unit, which reads as selling new equipment |
| 13 | Duct leakage gauge (291 → 42) | not system imagery | pass | not used: the readings would imply a results claim |
| 14, 15, 16 | Crawlspace encapsulation and ducts | pass | pass | not used: a different service (16 also has a black pipe that could be misread and printed numbers) |

**Used:** 04, 06, 07, 08, 09, 10, 11. All come from the cleared 04–16 set. Nothing outside the bundle was added.

## Shots

Times are in video seconds. "db" is a measured downbeat and "b" a measured beat (track time, then its video time).

| # | Window (s) | On the beat | Visual (focus per format) | On-screen text (exact) | Motion | Sound |
|---|---|---|---|---|---|---|
| 1 | 0.000–3.265 | frame 0; db 2.194 → 1.079 | `11_before`: matted coil behind the wire guard, weeds. Focus 0.50,0.40 | TIRED OF / BEING TOLD / YOU NEED A / **NEW SYSTEM?** | Settled on frame 0, with the badge in the header band. Push-in 1.00→1.06 with seeded drift. | Music in on the beat (60 ms fade) |
| 2 | 3.265–5.445 | db 4.380 → 3.265; sweep on b 4.899 → 3.784 | `08` before → after; focus 0.45,0.45 | YOU MAY HAVE A / **THIRD OPTION.** | Photo swipes in from the right (0.42 s); lines rise from 3.30; divider sweeps 3.784–4.784, labels riding | Soft air on the swipe and the sweep |
| 3 | 5.445–7.621 | db 6.560 → 5.445; highlight on b 7.639 → 6.524 | `08_after`, darkened to 38% | REPAIR / SYSTEM RESTORATION / REPLACEMENT | Rows slide in 5.445–5.61. The middle row fills red at 6.524 and the others dim. At 7.20 the red row rises into the kicker slot. | Mallet tick on the highlight; air on the rise |
| 4a | 7.621–9.807 | db 8.736 (bass entry) → 7.621; sweep on b 9.271 → 8.156 | `04` before → after; focus 0.40,0.55 | [SYSTEM RESTORATION] MORE THAN A / BASIC TUNE-UP. | Hard cut on the bass entry; lines rise; sweep 8.156–9.156 | Air on the sweep |
| 4b | 9.807–11.987 | db 10.922 → 9.807; sweep b 11.450 → 10.335 | `09` before → after; focus 0.50,0.45 | [MAY INCLUDE] DEEP CLEANING / OF ACCESSIBLE / COMPONENTS | Hard cut; the kicker swaps; sweep 10.335–11.335 | Air |
| 4c | 11.987–14.169 | db 13.102 → 11.987; sweep b 13.630 → 12.515 | `06` before → after; focus 0.62,0.50 | [MAY INCLUDE] REPLACEMENT / OF DEFINED / AGE-RELATED PARTS | Hard cut; sweep 12.515–13.515 | Air |
| 4d | 14.169–18.528 | db 13.102 (splice) → 14.169; rows on half-beats; sweep b 14.722 → 15.789 | `07` before → after; focus 0.50,0.35 | [MAY INCLUDE] ☐ PERFORMANCE CHECKS / ☐ BEFORE-AND-AFTER PHOTOS / ☐ WRITTEN CONDITION REPORT | Rows land at 14.169, 14.442 and 14.715 and hold, all three settled from about 15.1 s to 18.3 s. Sweep 15.789–16.989. | Mallet ticks on each row, rising; air on the sweep |
| 5a | 18.528–22.337 | db 17.461 (fuller section) → 18.528 | `10_before`: packed coil behind the louvers; focus 0.55,0.45; push-in 1.00→1.08 | [EVIDENCE BEFORE RECOMMENDATION] We don't decide / the answer before / **looking at the system.** | Brand wipe in the content area only (18.298–18.758, full cover at 18.528); lines rise from 18.53 | Airy wipe with body |
| 5b | 22.337–25.086 | b 21.270 → 22.337; lines 3–4 on db 21.833 → 22.900 | `10_before`, darkened to 72% | Replacement may be / the right answer. / It shouldn't be the / **automatic answer.** | Evidence lines exit; lines 1–2 rise at 22.337, lines 3–4 at 22.900 | Soft swell into the statement; build bar from 22.900 |
| 6 | 25.086–29.600 | final hit 113.470 → 25.086 | Background only | [logo] / **$85** AGING HVAC / EVALUATION / ✓ A clear first look / ✓ A next-step recommendation / [BOOK  256-203-6612] / dickersonservices.com | Brand wipe in the content area only (24.856–25.316, full cover at 25.086). The badge travels into the logo slot (25.086–25.746). Offer rises at 25.35, checks at 25.90 and 26.20, button 26.55, URL 26.75, then all hold. | Warm C major bloom under the final hit |

## Cadence check

- **Hook fully readable by:** 0.0 s. It's settled on frame 0, which is also the thumbnail.
- **Logo first on screen:** 0.0 s. It stays in the header band through every transition, then becomes the end card logo.
- **Longest stretch with nothing new:** 2.6 s (the end card's final hold, 27.0–29.6). Every other stretch is under 2 s.
- **Tightest reading times:** scene 2 "YOU MAY HAVE A THIRD OPTION." is settled 3.72–5.17 s, about 1.5 s for 6 words; this is set by the music. Scene 5b's second pair of lines is settled 23.40–25.09 s, 1.7 s for 6 words. Every other line meets 0.3 s per word: 5a's 10 words are settled 19.10–22.09 s.
- **Education and invitation:** 8 educational scenes (0–25.1 s) and 1 invitation, the end card (25.1–29.6 s, 15%).

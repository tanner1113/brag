# Brag plan: Dickerson Services, HVAC System Restoration (30s vertical)

## The questions

- **What is it?** A new service from Dickerson Services (Guntersville / North Alabama): HVAC System Restoration, a more complete service for qualifying aging systems. The first step is the $85 Aging HVAC System Evaluation.
- **Who is it for?** Homeowners with aging systems who keep hearing "you need a new system", or who want another opinion before a major purchase.
- **What sets it apart?** A third option between repair and replacement, decided by evidence. The enemy is the predetermined recommendation, not replacement.
- **Most impressive claim (allowed)?** Real before/after photos from Dickerson jobs. No numbers, stats or testimonials; the only price is $85.
- **Visual hook?** An overgrown, weathered condenser under "Tired of being told you need a new system?", then a before/after slider on a dirty condenser coil as "You may have a third option." lands.
- **Real material to show:** CompanyCam before/after composites, split into matched halves and replayed as sliders.
- **Tone:** `polished` with a calm-to-confident build: honest, education-first (about 90% education, 10% invitation), with no hype or urgency.
- **Share caption:** see `share-copy.txt`.

## Angle

"You may have a third option." The video walks the owner's VSL logic in one breath: frustration, the third option, what restoration is, how the decision gets made (evidence first), then a low-pressure first step.

## Visual identity (from the owner's existing restoration ads)

- Background `#111111`; bars `#AB1525`; accent text `#D51E30`; text `#FAFAFA`.
- Noto Sans (the live site's font). Headlines use the heavy weights at a condensed width, which echoes the tall headlines in the ads while staying in Noto Sans. Supporting lines are sentence case.
- Logos: official silver "grey layer style" logo on the end card; the white recolor as a small header bug, with the "NORTH ALABAMA" red tag from the ads.
- Photos feather into the dark background as in the ads. Captions stay between y 500 and 1480, inside the centered 1080×1080 square (y 420–1500), so 1:1 and 4:5 crops still work.

## Music and sound

- Track: `happy-beats-business-moves-vol-12` ("steady and clean"), C major, 109.96 BPM.
- Edit: start 1.0s into the track, so the bass entry (8.73s) lands on the restoration reveal at 7.745s and the fuller section (17.45s) lands on "Evidence Before Recommendation" at 16.475s. At 25.177s it cuts, attack to attack, from the groove's downbeat (26.177s) into the track's last build bar (111.274s), so the track's own closing C major hit lands on the end card at 27.35s and rings out under it.
- Sound effects are synthesized and kept 11–19 LU under the music: soft panned air on swipes, slider wipes and brand wipes; mallet ticks on chord tones of the bar they fall in (checkmarks, the highlighted path, the inspection frame); and a warm C major bloom under the final hit. They share one small room reverb.
- Master: −14 LUFS integrated, true peak −1.2 dBTP, at most 0.6 dB of limiting.

## Storyboard (30.2s, 30fps)

| # | Time | Scene | On-screen text | Photo |
|---|---|---|---|---|
| 1 | 0.00–3.00 | Hook (settled from frame 0; photo pushes in) | TIRED OF / BEING TOLD / YOU NEED A / **NEW SYSTEM?** | 11 before (overgrown condenser) |
| 2 | 3.00–5.40 | Reveal: swipe to a new photo, slider wipes before to after | YOU MAY HAVE A / **THIRD OPTION.** | 08 condenser coil, before/after |
| 3 | 5.40–7.745 | Three paths; the middle one lights up red and becomes the next label | REPAIR / SYSTEM RESTORATION / REPLACEMENT | 08 after, dimmed |
| 4a | 7.745–9.80 | Bass enters; slider | SYSTEM RESTORATION / MORE THAN A / BASIC TUNE-UP. | 01 evaporator coil, before/after |
| 4b | 9.80–11.98 | Slider | MAY INCLUDE / DEEP CLEANING / OF ACCESSIBLE / COMPONENTS | 09 condenser coil, before/after |
| 4c | 11.98–14.08 | Slider | REPLACEMENT / OF DEFINED / AGE-RELATED PARTS | 06 drain and cabinet, before/after |
| 4d | 14.08–16.475 | Slider plus checklist | PERFORMANCE CHECKS / BEFORE/AFTER PHOTOS / WRITTEN CONDITION REPORT | 07 coil surface, before/after |
| 5a | 16.475–20.10 | Brand wipe on the lift; an inspection frame locks onto the blower wheel | EVIDENCE BEFORE RECOMMENDATION / We don't decide the answer before looking at the system. | 03 blower wheel close-up |
| 5b | 20.10–24.115 | Statement | Replacement may be the right answer. / It shouldn't be the **automatic answer.** | 03, dimmed |
| 6 | 24.115–27.35 | Invitation (about 11%) | $85 / AGING HVAC SYSTEM EVALUATION / A clear first look / A next-step recommendation | 02 clean coil |
| 7 | 27.35–30.20 | End card on the final hit | [logo] / BOOK YOUR $85 EVALUATION / 256-203-6612 / dickersonservices.com | none |

Every line stays fully visible for at least about 0.3s per word after it settles.

## Compliance (checked before delivery)

- The only price is $85. There are no other numbers except the phone number 256-203-6612 (not 850-491-7883).
- No mold or medical claims, no urgency or countdowns, no "like new" / "guaranteed extra years" / "never replace again", and nothing about competitors.
- Restoration items come only from the doc's "may include" list, in its phrasing.
- Photos excluded: 13 (gauge numbers), 12 (a new unit with a brand label, which reads as replacement), 04/05 (weak contrast, could read as mold), 10 (outdoor coil already covered by 08/09), 14–16 (crawlspace, a different service; 16 has printed numbers).

## Rebuild

The client's photos, logos and brief stay out of this public repo; they come from `restoration-assets.tar.gz`. Needs Node 22, Python 3 (`requirements.txt`), ffmpeg and Google Chrome.

    npm install && pip install -r requirements.txt
    bash prep-assets.sh /path/to/restoration-assets.tar.gz   # crops into composition/assets/
    python3 build-audio.py                                    # brag-output/work/audio/mix.wav
    node render.mjs --stills 2,4.9,15.9 --guides              # review stills with 1:1 and 4:5 guides
    node render.mjs                                           # brag-output/brag.mp4
    node contact-sheet.mjs                                    # brag-output/contact_sheet.png

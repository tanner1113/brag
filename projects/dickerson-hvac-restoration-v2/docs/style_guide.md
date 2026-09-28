# Style guide: Dickerson Services, HVAC System Restoration, v2

**Status:** APPROVED. The owner pre-approved the v1 script and this piece's constraints (job brief, Sep 28, 2026), so the gate in REFERENCE.md is treated as passed.
**Reference:** none supplied. This uses the house grammar from `skills/dickerson-motion/RULES.md`, kept close to the v1 piece the owner approved. **Brief:** the job 2 request plus `ASSET_BRIEF.md` in the asset bundle. **Revision:** 1

## Borrowed from v1 (the approved grammar)

- The VSL order: hook, third option, three paths, what restoration may include, evidence first, the statement, the $85 close.
- Before/after sliders on real job photos, one idea per scene.
- The owner's ad palette: near-black background, one red, white type.
- Scene changes on the music's downbeats. The bass entry lands on "System Restoration", the fuller section on "Evidence Before Recommendation", and the track's closing hit on the end card.

## Changed from v1 (rules and feedback)

| Change | Why |
|---|---|
| No "NORTH ALABAMA" tag and no viewfinder bracket | Corner labels and frame borders are banned (RULES.md §1) |
| BEFORE and AFTER ride on the slider divider | v1 parked them in the photo corners |
| The logo badge sits in a header band the transitions never enter, above every layer | Feedback: the badge must never be covered or cut by a transition. The badge then travels into the end card logo. |
| The checklist holds for about 3.4 s after its last row lands (v1: about 1.4 s) | Feedback: readable on a phone |
| Photos 01, 02 and 03 are gone | Banned imagery (they read as a ductless wall head) |
| Three native layouts: 1080×1920, 1080×1080 and 1920×1080 | Skill contract (RENDER.md) |
| Headline face is Noto Sans Display | RULES.md §4: one display face and one UI face |

## Palette

| Role | Hex | Use |
|---|---|---|
| Background | `#111111` | Every frame, the header band, the end card |
| Accent fill | `#AB1525` | Kicker tags, the highlighted path, check boxes, the CTA button, brand wipes |
| Accent text on dark | `#D51E30` | The key phrase of each headline ("NEW SYSTEM?", "THIRD OPTION.", "looking at the system.", "automatic answer.", "$85") |
| Text | `#FAFAFA` | All other type |

Red stays under about 10% of the frame except during the wipes and on the button. Photos keep their own color: no grading, and the same treatment for both halves of a pair. A darkening layer over a photo (up to 70%) is allowed behind the statement scenes.

## Type

| Use | Face | Style | Vertical / square / landscape | Notes |
|---|---|---|---|---|
| Headlines | Noto Sans Display | 900, 75% width, uppercase, line height 1.0 | 104 / 84 / 112 px | Left-aligned; shrinks only if a line overflows |
| Kicker tags | Noto Sans | 700, uppercase, tracking 0.08em, on a red tag | 36 / 32 / 44 px | Attached to the headline block, never in a corner. A long tag shrinks to the column width. |
| Checklist | Noto Sans | 700, 87.5% width, uppercase, red check box | 54 / 48 / 60 px | One row per item; landscape wraps the two long items onto two lines |
| Statements | Noto Sans | 700, sentence case, line height 1.15 | 60 / 52 / 68 px | Key phrase in `#D51E30` |
| BEFORE / AFTER | Noto Sans | 700, uppercase, tracking 0.08em, tag | 32 / 30 / 40 px | Ride on the divider |
| End card | Display for the offer, Noto Sans for checks, phone and URL | as above | per `layout.js` | |

Landscape type is sized to pass the 360-px phone test: the smallest must-read text is 64 px there.

## Shot lengths

One bar (2.18 s at 109.98 BPM) per idea. The hook and the two statement scenes get 1.5 bars. The checklist gets two bars, and the end card holds for about 4.5 s. The longest stretch without a new element is under 3 s.

## Transitions

| Type | Duration | Where | Direction |
|---|---|---|---|
| Photo swipe | 0.42 s, in-out cubic | Hook → third option (3.27 s) | New photo pushes in from the right, inside the photo band |
| Hard cut | 0 | 4a, 4b, 4c, 4d, on downbeats | — |
| Before/after sweep | 1.0 s (1.2 s in 4d), in-out cubic | Every slider, starting on a beat | Divider left to right |
| Row to kicker | 0.42 s | Three paths → 4a | The red "SYSTEM RESTORATION" row rises into the kicker slot |
| Brand wipe | 0.46 s, full cover at the midpoint | Into evidence (18.53 s) and into the end card (25.09 s) | Red panel left to right, **content area only**: never the header band |
| Badge travel | 0.66 s, out-quart | End card, from the final hit | The small white badge moves and grows into the end card logo, crossfading to the silver logo |

## Camera moves

- A push-in on every photo: scale 1.00 → 1.06 over its scene (1.08 on the evidence shot), in-out sine.
- Drift from seeded `noise()`: ±6 px horizontal and ±4 px vertical, speed 0.35. It never uncovers an edge (`cover()` clamps it).
- No pans or parallax.

## Texture

None beyond the photos. No grain, glow, particles, light leaks or vignettes (RULES.md §1). Photo bands feather into the background at their inner edge.

## Text in and out

- **In:** lines slide up out of their masks, 0.42 s, out-quart, with 0.08 s between lines. Rows slide in from the left out of a mask, and tags reveal from the left.
- **Out:** lines keep rising, out of the top of their masks, in 0.25 s. They finish before the next scene's text arrives, or leave under a wipe or cut.
- **Settled time:** at least 0.3 s per word wherever the music allows. The two tightest lines are logged in the shot list's cadence check.

## Per-format notes

- **Vertical (primary):**
  - Header band y 0–360, with the badge at 90,228.
  - Photo band y 372–1062, feathered at the bottom.
  - Text y 1082–1500, all inside the Reels/TikTok safe area.
- **Square:** header band y 0–138, photo band y 146–646, text y 664–1030.
- **Landscape:**
  - Header band y 0–150.
  - Photo x 0–980, y 150–1080, feathered on the right.
  - Text column x 1040–1824.

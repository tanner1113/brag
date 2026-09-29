# Style guide: Dickerson Services, HVAC System Restoration, v2

**Status:** APPROVED. The owner pre-approved the v1 script and this piece's constraints (job brief, Sep 28, 2026), so the gate in REFERENCE.md is treated as passed.
**Reference:** none supplied. This uses the house grammar from `skills/dickerson-motion/RULES.md`, kept close to the v1 piece the owner approved. **Brief:** the job 2 request plus `ASSET_BRIEF.md` in the asset bundle. **Revision:** 3 (type sizes, reveals and transitions updated after critique rounds 1 and 2)

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
| Accent text on dark | `#D51E30` | The key phrase of each headline ("NEW SYSTEM?", "THIRD OPTION.", "EVIDENCE", "AUTOMATIC ANSWER.", "$85") |
| Text | `#FAFAFA` | All other type |

Red stays under about 10% of the frame except during the wipes and on the button. Photos keep their own color: no grading, and the same treatment for both halves of a pair. A darkening layer over a photo (up to 72%) is allowed behind the three paths and the 5b statement.

## Type

| Use | Face | Style | Vertical / square / landscape | Notes |
|---|---|---|---|---|
| Headlines | Noto Sans Display | 900, 75% width, uppercase, line height 1.0 | 104 / 84 / 120 px | Left-aligned; shrinks only if a line overflows. Includes the three paths (up to 100 / 86 / 120 px, one size for all three), the 5a headline and the 5b statement. |
| Kicker tags | Noto Sans | 700, uppercase, tracking 0.08em, on a red tag | 50 / 46 / 76 px | Attached to the headline block, never in a corner. A long tag shrinks to the column width. |
| Checklist | Noto Sans | 700, normal width, sentence case, red check box | 56 / 50 / 84 px | One row per item; landscape wraps the two long items at their compound break |
| Sentence (5a) | Noto Sans | 700, sentence case, line height 1.15 | 60 / 52 / 84 px | Under the 5a headline |
| BEFORE / AFTER | Noto Sans | 700, uppercase, tracking 0.08em, tag | 50 / 46 / 64 px | Ride in and out with the divider |
| End card | Display for the offer; Noto Sans 700 for checks, "BOOK", the phone number and the URL | as above | per `layout.js` | "BOOK" and the phone number share one size (72 / 60 / 88 px) |

Landscape type is sized for the 360-px phone test: must-read lines are 84 px or more there, kickers and labels 64–76.

## Shot lengths

One bar (2.18 s at 109.98 BPM) per idea. The hook gets 1.25 bars, the two statement scenes 1.5 bars and the checklist two. The end card holds for about 4.5 s. The longest stretch without a new element is under 3 s.

## Transitions

| Type | Duration | Where | Direction |
|---|---|---|---|
| Push | 0.42 s, in-out cubic | Hook → third option (2.69 s) | The hook photo and its text slide out left as the new photo and text slide in from the right, each clipped to its own region (photo band, text column) |
| Text cut | 0 | Into the three paths (5.445 s) and the 5b statement (22.337 s), on the beat | The old block holds until the beat; the new one rises from it |
| Hard cut | 0 | 4a, 4b, 4c, 4d on downbeats, and the end card on the final hit (25.086 s) | Picture and text change together; the new headline rises from the cut |
| Before/after sweep | 1.3 s (1.4 s in 4d), in-out sine | 2, 4a and 4d left to right; 4b top to bottom; each starts on a beat | The divider starts and ends off the frame: BEFORE rides in ahead of it and AFTER follows it out. No fades. |
| Before/after split | 0.8 s, in-out cubic | 4c (12.52 s) | The AFTER half slides in and BEFORE slides over until they sit side by side (vertical, square) or stacked (landscape), each centered on its own focal point |
| Row to kicker | 0.42 s, in-out cubic | Three paths → 4a | The red "SYSTEM RESTORATION" line shrinks and rises into the kicker slot, easing width 75→100%, weight 900→700 and tracking until it's exactly the kicker's box; the kicker replaces it on the cut |
| Brand wipe | 0.46 s, full cover at the midpoint | Into evidence (18.53 s) only | Red panel left to right, **content area only**: never the header band. Its trailing edge reveals the evidence tiles. |
| Red flip | 0.3 s, out-cubic | "AUTOMATIC ANSWER." on the 22.9 s build downbeat | A red copy of the line wipes over the white one, left to right |
| Badge travel | 0.5 s, in-out cubic | End card, from the cut at 25.086 s | The small white badge moves and grows into the end card logo, crossfading to the silver logo |

## Camera moves

- A push-in on every photo: scale 1.00 → 1.06 over its scene (1.05 on each evidence tile), in-out sine.
- The hook photo also punches in (×1.06 over 0.6 s, out-cubic) on the 1.079 s downbeat; frame 0 is unchanged.
- Drift from seeded `noise()`: ±6 px horizontal and ±4 px vertical, speed 0.35. It never uncovers an edge (`cover()` clamps it).
- No pans or parallax. The split slides each half by up to a quarter of the band so its own focal point ends centered.

## Texture

None beyond the photos. No grain, glow, particles, light leaks or vignettes (RULES.md §1). Photo bands feather into the background at their inner edge; in vertical and square the feather runs under the top of the text block. Type there gets a tight drop shadow (blur 10 px, 50% black), within RULES.md §1.

## Text in and out

- **In:** lines and check rows slide up out of their masks, 0.42 s, out-quart, with 0.08 s between lines; tags reveal from the left.
- **Out:** on the cut, beat or wipe that changes the scene. No beat lands on an empty text area.
- **Settled time:** at least 0.3 s per word wherever the music allows. The two tightest lines are logged in the shot list's cadence check.

## Per-format notes

- **Vertical (primary):**
  - Header band y 0–362, with the badge (250 px wide) at 90,222.
  - Photo band y 372–1312, fully opaque to about y 917, then feathering out under the top of the text block.
  - Text y 1082–1500, all inside the Reels/TikTok safe area.
- **Square:** header band y 0–138 (badge 190 px wide), photo band y 146–746 feathering under the text, text y 664–1030.
- **Landscape:**
  - Header band y 0–150 (badge 200 px wide).
  - Photo x 0–860, y 150–1080, feathered on the right.
  - Text column x 900–1824. On the end card the logo sits left and the offer column runs x 760–1824.

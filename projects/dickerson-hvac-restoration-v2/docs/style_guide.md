# Style guide: Dickerson Services, HVAC System Restoration, v3

**Status:** APPROVED with the shot list. The v3 job brief (Sep 29, 2026) is the approval: build from the v2 timeline, show the outdoor unit, the blower and the coil, and fix the three timing notes from v2's round 4.
**Reference:** none supplied. This keeps the v2 grammar. **Revision:** 6 (tighter 19/20 and 22 windows, and the top-to-bottom labels fade before the text)

## Kept from v2

- The order: hook, third option, three paths, what restoration may include, evidence first, the statement, the $85 close.
- The words, including the "may include" lines and the checklist.
- Before/after sliders on real pairs from one job, one idea per scene.
- The owner's ad palette, the two brand faces, and the header band the transitions never enter.
- Scene changes on the music's downbeats. The bass entry lands on "System Restoration", the fuller section on "Evidence Before Recommendation", and the track's closing hit on the end card.
- No "NORTH ALABAMA" tag and no viewfinder bracket. BEFORE and AFTER ride the divider.

## Changed from v2

| Change | Why |
|---|---|
| Scene 2 is the outdoor unit, 19 → 20, not the condenser-coil close-up (08) | The piece has to read as restoration of the whole system, not coil cleaning |
| 4b is the condenser interior, 17 → 18, not the side panel (09) | Deep cleaning of an accessible part of the outdoor unit |
| 4d's coil sweep is one beat (15.260–16.351), then a hard cut to two dirty blower wheels (21 and 22) | The blower has to be on screen. The checklist copy holds across the cut |
| The evidence grid is outdoor unit (19), blower (22) and coil (04), all before shots | One glance at the three parts. 08 and 09 left the grid |
| 21/22 are a two-up with no divider and no BEFORE/AFTER labels. 23 is not in the piece | 23 is a clean wheel from a different job. A wipe or a label would claim it is the after |
| 22's window is the wheel itself and excludes the blurry wires at the lower left. 19/20's window excludes the pad line-set stub, the disconnect, its conduit and the shuttered window | Banned imagery and the addendum's crop note, checked on the whole window |
| On a top-to-bottom sweep, BEFORE and AFTER fade out before they enter the text block (vertical and square) | A label that followed the divider into the feather sat on the kicker |
| The push into scene 2 and the badge's travel into the end card ease out-cubic | Both used to sit still for the first frames (in-out cubic) |
| The Book button settles a few pixels with no clip | A left-to-right clip drew half the phone number for about five frames |

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
| BEFORE / AFTER | Noto Sans | 700, uppercase, tracking 0.08em, tag | 50 / 46 / 64 px | Ride in and out with the divider. They are not used on 21, 22 or 23 |
| End card | Display for the offer; Noto Sans 700 for checks, "BOOK", the phone number and the URL | as above | per `layout.js` | "BOOK" and the phone number share one size (72 / 60 / 88 px) and are drawn whole |

Landscape type is sized for the 360-px phone test: must-read lines are 84 px or more there, kickers and labels 64–76.

## Shot lengths

One bar (2.18 s at 109.98 BPM) per idea. The hook gets 1.25 bars, the two statement scenes 1.5 bars and the checklist two bars, with the blower cut on the downbeat in the middle of that hold. The end card holds for about 4.5 s. The longest stretch without a new element is 3 s.

## Transitions

| Type | Duration | Where | Direction |
|---|---|---|---|
| Push | 0.42 s, out-cubic | Hook → third option (2.69 s) | Moves on the first frame. The hook photo and its text slide out left as the new photo and text slide in from the right. The photo is clipped to its band; the text runs out at the frame edges (in landscape, from the text column's inner edge to the right frame edge) |
| Text cut | 0 | Into the three paths (5.445 s) and the 5b statement (22.337 s), on the beat | The old block holds until the beat; the new one rises from it |
| Hard cut | 0 | 4a, 4b, 4c, 4d on downbeats, the blower two-up on the 16.351 downbeat, and the end card on the final hit (25.086 s) | Picture and text change together, except the blower cut, which keeps the checklist and changes only the photo |
| Before/after sweep | 1.3 s (1.091 s in 4d), in-out sine | 2, 4a and 4d left to right; 4b top to bottom; each starts on a beat | The divider starts and ends off the frame: BEFORE rides in ahead of it and AFTER follows it out. On the top-to-bottom sweep in vertical and square, each label fades out across 28 px before its box reaches the text block, so it never sits on the kicker. 4d's sweep ends on the blower cut |
| Before/after split | 0.8 s, out-cubic | 4c (12.52 s) | The AFTER half slides in, moving from its first frame and landing softly, and BEFORE slides over until they sit side by side (vertical, square) or stacked (landscape) |
| Blower two-up | none | 4e (16.351 s) | Two dirty wheels in the evidence-grid layout. No divider, no labels, no wipe |
| Row to kicker | 0.42 s, in-out cubic | Three paths → 4a | The red "SYSTEM RESTORATION" line shrinks and rises into the kicker slot, easing width 75→100%, weight 900→700 and tracking until it's exactly the kicker's box; the kicker replaces it on the cut |
| Brand wipe | 0.46 s, full cover at the midpoint | Into evidence (18.53 s) only | Red panel left to right, **content area only**: never the header band. Its trailing edge reveals the evidence tiles |
| Red flip | 0.3 s, out-cubic | "AUTOMATIC ANSWER." on the 22.9 s build downbeat | A red copy of the line wipes over the white one, left to right |
| Badge travel | 0.5 s, out-cubic | End card, from the cut at 25.086 s | Moves on the first frame. The small white badge grows into the end card logo and crossfades to the silver logo along the way |
| Button | 0.24 s, out-cubic, unclipped | End card, 26.177 s | The whole button, including the full phone number, settles upward by 10 px. Nothing clips the number |

## Camera moves

- A push-in on every photo: scale 1.00 → 1.06 over its scene (1.05 on each evidence tile, 1.06 on each blower tile), in-out sine.
- The hook photo also punches in (×1.06 over 0.6 s, out-cubic) on the 1.079 s downbeat; frame 0 is unchanged.
- Drift from seeded `noise()`: ±6 px horizontal and ±4 px vertical, speed 0.35. It never uncovers an edge (`cover()` clamps it).
- No pans or parallax. The split slides each half by up to a quarter of the band so its own focal point ends centered.

## Texture

None beyond the photos. No grain, glow, particles, light leaks or vignettes (RULES.md §1). Photo bands feather into the background at their inner edge; in vertical and square the feather runs under the top of the text block. Type there gets a tight drop shadow (blur 10 px, 50% black), within RULES.md §1.

## Text in and out

- **In:** lines and check rows slide up out of their masks, 0.42 s, out-quart, with 0.08 s between lines; tags reveal from the left.
- **On a cut:** the new text starts rising 0.07 s before the cut and shows from the cut, so the first frame of the new scene already has it moving (a cut on action), never an empty text area. The blower cut is the exception: the checklist is already up, and only the photo changes.
- **Out:** on the cut, beat or wipe that changes the scene. No beat lands on an empty text area.
- **The phone number:** visible only as a complete string. It never wipes on.
- **Settled time:** at least 0.3 s per word wherever the music allows. The two tightest lines are logged in the shot list's cadence check.

## Per-format notes

- **Vertical (primary):**
  - Header band y 0–362, with the badge (250 px wide) at 90,222.
  - Photo band y 372–1312, fully opaque to about y 917, then feathering out under the top of the text block.
  - Text y 1082–1500, all inside the Reels/TikTok safe area.
  - The blower two-up and the evidence grid run left to right.
- **Square:** header band y 0–138 (badge 190 px wide), photo band y 146–746 feathering under the text, text y 664–1030. Same left-to-right tiles.
- **Landscape:**
  - Header band y 0–150 (badge 200 px wide).
  - Photo x 0–860, y 150–1080, feathered on the right.
  - Text column x 900–1824. On the end card the logo sits left and the offer column runs x 760–1824.
  - The blower two-up and the evidence grid stack top to bottom in the photo column.

# Style guide: <piece title>

**Status:** DRAFT, waiting for the caller's approval. No render code until it's approved (REFERENCE.md).
**Reference:** <path, or "none: the house style from RULES.md"> · **Brief:** <path> · **Revision:** 1

## Borrowed from the reference (grammar only)

- <e.g. shots of 1.5–2.5 s, cut on every second downbeat>
- <e.g. headlines slide up out of a mask, line by line, 80 ms apart>

## Not borrowed

- Its footage, images, words, logos, music, characters and distinctive graphics.
- Its colors, unless they happen to be Dickerson's.

## Palette

| Role | Reference | Dickerson (RULES.md) |
|---|---|---|
| Background | `#......` | `#111111` |
| Accent fill (bars, labels, button) | `#......` | `#AB1525` |
| Accent text on dark | `#......` | `#D51E30` |
| Text | `#......` | `#FAFAFA` |

How much of the frame each color takes: <e.g. mostly dark with photos; red under 10% of the frame, only on the key word and the labels>

## Type

| Use | Face | Weight, width, case | Size (vertical / square / landscape) | Alignment, tracking |
|---|---|---|---|---|
| Headlines | Noto Sans Display | 900, 75%, uppercase | 116 / 92 / 100 px | left, 0.005em |
| Labels | Noto Sans | 700, 100%, uppercase | 34 / 32 / 40 px | left, 0.08em |
| Sentence lines | Noto Sans | 600–700 | 60 / 52 / 60 px | left |

Line length: <max characters per line>. Key word in `#D51E30`: <which word, and why>.

## Shot lengths

- Reference: median <s>, range <a–b s>, <n> cuts per 10 s (from `ref/summary.md`).
- Ours: <e.g. 2–4 s per shot, every boundary on a measured downbeat; a hold of 4 s at most>.

## Transitions

| Type | Duration | Where | Direction |
|---|---|---|---|
| Hard cut | 0 frames | <shot changes on downbeats> | — |
| Brand-red wipe | <n frames> | <section changes> | left to right |
| Before/after sweep | <n frames> | <reveals> | divider left to right |

## Camera moves

- Push-in on photos: <e.g. scale 1.00 → 1.06 over the shot, ease in-out>.
- Drift: seeded `noise()`, <e.g. ±6 px horizontal, ±4 px vertical, speed 0.35>.
- Pans or parallax: <if any>.

## Texture

<e.g. none beyond the photos; or seeded grain at <strength>, seeded by frame number>. Nothing from RULES.md section 1.

## Text in and out

- In: <e.g. lines slide up 110% out of their masks, 420 ms, ease-out-quart, 80 ms between lines>.
- Out: <e.g. none: scenes end on a hard cut; or a slide down in 300 ms>.
- Settled time: at least 0.3 s per word before anything moves it.

## Per-format notes

- **Vertical:** <photo on top, text below; must-read text inside y 220–1500>.
- **Square:** <the same stack, tighter>.
- **Landscape:** <photo left, text right; type sized for the 360-px phone test>.

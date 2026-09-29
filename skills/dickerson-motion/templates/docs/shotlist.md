# Shot list: <piece title>

**Status:** DRAFT, waiting for approval. After approval, record it here: *Approved by <who> on <date>, revision <n>.*
**Piece:** <before/after | service explainer | seasonal promo | social cut | lead-gen ad | brand story> · **Duration:** <s> · **fps:** 30
**Formats:** 1080×1920, 1080×1080, 1920×1080 · **Music:** <track>, starting at <offset s> in the track (beats: `work/beats.json`, <bpm> BPM)

## Brief constraints (hard)

- **Supplied prices:** <exact wording from the brief, or "none: no prices on screen">
- **Banned imagery:** <list from the brief, or "none declared"> (hard filter: see the photo check below)
- **Required wording:** <phrases the brief requires, exactly>
- **CTA:** <exact CTA> · **Phone:** 256-203-6612 · **URL:** dickersonservices.com
- **Audience and the one message:** <who it's for; the single thing they should remember>

## Photo check

Check the whole photo, not just one crop: each format reframes it.

| Photo file | What it shows | Banned imagery | Privacy (faces, house numbers, plates, names) | Use |
|---|---|---|---|---|
| `assets/photos/<file>` | <description> | pass / FAIL: <item> | pass / FAIL: <what> | shot <n> / dropped |

## Shots

Times are in video seconds; each boundary is a measured time from `beats.json` minus the offset.

| # | Time window (s) | On the beat | Visual (photo, focus per format) | On-screen text (exact) | Motion (in / camera / out) | Sound cue |
|---|---|---|---|---|---|---|
| 1 | 0.00–2.19 | frame 0; downbeat 2 at 2.19 | `hook.jpg`, focus 0.50,0.45 (all formats) | <HOOK LINE> | settled on frame 0; push-in 1.00→1.06 | music in on the first beat |
| 2 | 2.19–4.38 | downbeat 2 → 3 | … | … | … | … |

## Cadence check

- Hook fully readable by: <s> (must be ≤ 2.0 s)
- Logo first on screen: <s> (must be ≤ 3.0 s), and on the end card
- Longest stretch with nothing new: <s> (must be ≤ 4.0 s)
- Every must-read line settled for 0.3 s per word or more: <yes/no, with the tightest line and its time>
- Education to invitation: <e.g. 5 educational shots, 1 invitation (the end card)>

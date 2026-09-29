# Audio: beat-timed cuts and the mix

Cuts land on **measured** beats, not on a grid computed from a BPM number. The final mix is mastered to about **−14 LUFS**. Setup is in `INSTALL.md`: a Python virtual environment with librosa (ISC license), numpy and soundfile.

## Measure the track

```bash
python scripts/beats.py path/to/track.mp3 --out work/beats.json
python scripts/beats.py --selftest     # checks the install on a synthetic track; no file needed
```

It reads WAV, MP3, FLAC and OGG directly, and anything else (M4A, AAC) through ffmpeg. A two-minute track takes a few seconds. It writes:

```json
{
  "schema": "dickerson-motion/beats@1",
  "source": "happy-beats-business-moves-vol-12-by-ende-dot-app.mp3",
  "duration": 117.36,
  "analyzed": { "start": 0.0, "duration": 117.36, "sample_rate": 22050 },
  "bpm": 109.98,
  "meter": 4,
  "beats": [0.537, 1.1146, 1.6254, 2.1943, 2.7138],
  "downbeats": [2.1943, 4.3799, 6.5596, 8.7365],
  "downbeat_phase": 3,
  "downbeat_confidence": 0.483,
  "onset_hits": [{ "t": 0.4267, "strength": 1.0 }, { "t": 0.537, "strength": 0.859 }]
}
```

The lists are shortened here: this track has 208 beats, 52 downbeats and 48 onset hits.

| Field | Meaning |
|---|---|
| `bpm` | Tempo from the measured spacing of the beats. It's more precise than librosa's own tempo estimate, which is off by a few percent on some tracks. |
| `beats` | Every beat, in seconds from the start of the file, placed at the start of its attack. A beat only moves to an attack that stays within 35 ms of the beat grid, so it can't jump to an off-beat note. |
| `downbeats` | The first beat of each bar. librosa doesn't track bars, so the script picks the beat whose bass note and chord change most, and where the energy steps up. |
| `downbeat_phase`, `downbeat_confidence` | Which of the first `meter` beats starts a bar, and how clearly it won (0–1). Under 0.15 the script prints a warning: listen, and override with `--downbeat-phase` if the bars sound wrong. |
| `onset_hits` | The strongest attacks (drum hits, stabs, the final hit) with strength 0–1, for accents between beats. |

**Options:**

- `--meter 3` for three beats per bar;
- `--start S --duration D` to analyze part of a track (times stay relative to the whole file);
- `--hits N` to keep more or fewer onsets;
- `--downbeat-phase P` to force the bar start.

It was tested on the bundled tracks. On vol-12, the downbeats land within 8–18 ms of hand-measured attacks (the bass entry at 8.73 s, the groove at 26.18 s, the final hit at 113.46 s).

## Cut on measured beats

1. **Choose the edit offset**, which is where in the track the video starts. Pick it so the big moments land on downbeats: the reveal on a bass entry, the brand moment on a section change, the end card on the final hit.
2. **Snap every shot boundary** in `docs/shotlist.md` to a time from `beats.json`, minus the offset:
   - scene changes to `downbeats`;
   - secondary entrances to `beats`;
   - small accents to `onset_hits`.

   Write the beat next to each time window in the shot list.
3. **Convert to frames** with `round(t * fps)`. A cut counts as on the beat within one frame (33 ms at 30 fps). The critique loop checks this.
4. **Edit the music on downbeats**, attack to attack, to shorten it or jump to the ending. Cut just before both attacks, with a 10–20 ms equal-power crossfade, so the new attack masks the seam. Listen to every join for clicks.
5. **Land the final hit on the end card** and let it ring. Fade only the last 0.3 s or so.

## The mix

- **Effects** sit under the music, about 10–18 LU below it. Pitched effects go in the track's key, and all of them share one small reverb. Nothing harsh or spiky; small repeated sounds stay in the background.
- **Master to about −14 LUFS integrated, with true peak at or below −1 dBTP.** Measure:

  ```bash
  ffmpeg -nostats -i work/audio/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary
  ```

  Or normalize in two passes. The first pass prints JSON measurements; feed them into the second:

  ```bash
  ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
  ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true -ar 48000 work/audio/mix.wav
  ```

- **Music:** use a track the brief supplies, or one of the bundled tracks in `skills/brag/assets/music/` (their precomputed cues are in `cues/`). Before any paid distribution, confirm that the track's license covers commercial advertising.
- **Effects sources:** synthesize them, or use the CC0 Kenney effects in `skills/brag/assets/sfx/`.
- **Delivery:** the same `work/audio/mix.wav` (48 kHz) is muxed into all three formats by `render.mjs --audio`, so sync is identical in each.

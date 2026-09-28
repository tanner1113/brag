#!/usr/bin/env python3
"""Prove the logo badge is never covered or cut by a transition.

    python check-badge.py out/*_v2.mp4          # every frame of the renders
    python check-badge.py out/stills/9x16/*.png  # exact check on rendered stills

The badge lives in a header band that no transition enters. So from frame 0 until the badge
starts its travel into the end card logo (25.2 s), nothing may ever draw in that band. After
that, `npm test` proves geometrically that no wipe ever reaches the travelling badge.

- Stills (PNG, straight from the renderer) must match each other exactly.
- Encoded frames carry H.264 noise on the logo's thin wordmark (a few dozen pixels, up to about
  50 code values, settling after each keyframe). So a video fails if any band pixel moves more
  than 110 code values from the band's steady state, or more than 0.2% of the band moves more
  than 32. The red wipe, a photo or a line of text in the band would move far more.
"""
from __future__ import annotations

import json
import subprocess
import sys
from collections import defaultdict

import numpy as np

# Header band and badge box per render size (composition/layout.js), and the travel start.
BANDS = {
    (1080, 1920): ((0, 0, 1080, 362), (90, 228, 220, 116)),
    (1080, 1080): ((0, 0, 1080, 138), (60, 36, 170, 90)),
    (1920, 1080): ((0, 0, 1920, 150), (96, 38, 180, 95)),
}
TRAVEL_START = 25.2  # composition/timing.js T.travel
HARD_LIMIT = 110
NOISE_LEVEL = 32
NOISE_SHARE = 0.002


def probe(path: str) -> dict:
    return json.loads(subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
         '-of', 'json', path], capture_output=True, check=True).stdout)['streams'][0]


def band_frames(path: str, band: tuple, frames: int | None = None):
    """Yield the band crop of each frame (uint8), streamed so long renders fit in memory."""
    bx, by, bw, bh = band
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    if frames:
        cmd += ['-frames:v', str(frames)]
    cmd += ['-vf', f'crop={bw}:{bh}:{bx}:{by}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    size = bw * bh * 3
    with subprocess.Popen(cmd, stdout=subprocess.PIPE) as proc:
        while chunk := proc.stdout.read(size):
            if len(chunk) < size:
                break
            yield np.frombuffer(chunk, np.uint8).reshape(bh, bw, 3)


def check_video(path: str) -> bool:
    info = probe(path)
    size = (info['width'], info['height'])
    num, den = map(int, info['r_frame_rate'].split('/'))
    fps = num / den
    band, badge = BANDS[size]
    count = int(TRAVEL_START * fps)
    ref = np.median(np.stack([f for i, f in enumerate(band_frames(path, band, count)) if i % 12 == 0]), axis=0)
    gx, gy = badge[0] - band[0], badge[1] - band[1]
    limit = NOISE_SHARE * band[2] * band[3]
    peaks, noisy, badge_peak = [], [], 0
    for f in band_frames(path, band, count):
        d = np.abs(f.astype(np.int16) - ref).max(axis=2)
        peaks.append(int(d.max()))
        noisy.append(int((d > NOISE_LEVEL).sum()))
        badge_peak = max(badge_peak, int(d[gy:gy + badge[3], gx:gx + badge[2]].max()))
    peaks, noisy = np.array(peaks), np.array(noisy)
    bad = np.nonzero((peaks > HARD_LIMIT) | (noisy > limit))[0]
    print(f'{path}: {len(peaks)} frames (0-{TRAVEL_START}s); band peak {int(peaks.max())}, badge peak {badge_peak}, '
          f'most noisy pixels {int(noisy.max())} (limit {int(limit)}) -> {"PASS" if not len(bad) else "FAIL"}')
    if len(bad):
        print(f'  something drew in the band from frame {bad[0]} ({bad[0] / fps:.3f}s), {len(bad)} frames in all')
    return not len(bad)


def check_stills(paths: list[str]) -> bool:
    groups = defaultdict(list)
    for p in paths:
        info = probe(p)
        groups[(info['width'], info['height'])].append(p)
    ok = True
    for size, files in groups.items():
        band, _ = BANDS[size]
        crops = [next(band_frames(f, band)).astype(np.int16) for f in sorted(files)]
        diff = [int(np.abs(c - crops[0]).max()) for c in crops]
        same = max(diff) == 0
        ok &= same
        print(f'{size[0]}x{size[1]}: {len(files)} stills, header band max diff {max(diff)} -> {"PASS" if same else "FAIL"}')
    return ok


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__.strip().splitlines()[2].strip())
    stills = [a for a in args if a.lower().endswith('.png')]
    videos = [a for a in args if not a.lower().endswith('.png')]
    results = [check_video(v) for v in videos] + ([check_stills(stills)] if stills else [])
    sys.exit(0 if all(results) else 1)

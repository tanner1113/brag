#!/usr/bin/env python3
"""Build the display crops and logos the composition loads, from the client asset bundle.

    python prep-assets.py /path/to/restoration-assets.tar.gz

Writes assets/photos/*.png and assets/brand/*.png. assets/ and work/ are gitignored: this repo
is public and the photos and logos belong to the client.

Banned imagery (brief): central ducted equipment only; no ductless mini-splits, wall heads or
exposed line sets. Photos 01-03 are excluded outright. Every window below was checked against
the whole source photo, and the composition's per-format framing only ever shows part of a
window, so a clean window means a clean crop in every format.

Each before/after pair uses one window for both halves (the slider compares like with like),
clear of the baked-in logo badge, BEFORE/AFTER labels and CompanyCam watermark. Both halves get
identical scaling and sharpening; no color changes.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tarfile
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
SRC = HERE / "work" / "src"
OUT = HERE / "assets"
UPSCALE = 1.5  # the composition then scales each crop by about 0.9-1.3x per format

# id: (file prefix, (before x, y), (after x, y), window w, h, what the window avoids)
PAIRS = {
    # Side-by-side composites (1440x1440, halves 720 wide).
    "04": ("04_", (0, 400), (720, 400), 660, 820,
           "badge-free photo; stops above the labels (y>=1300) and the coil's copper return bends, "
           "and left of the watermark column (x>=1385)"),
    "07": ("07_", (0, 245), (720, 245), 720, 800,
           "below the top-center badge (y<=235), above the labels and watermark (y>=1050)"),
    "08": ("08_", (0, 245), (720, 245), 720, 800, "same as 07"),
    "09": ("09_", (0, 245), (720, 245), 720, 800, "same as 07"),
    "10": ("10_", (0, 245), (720, 245), 720, 800, "same as 07"),
    # Stacked composite (1440x1440, halves 720 tall). Refrigerant piping enters the cabinet at the
    # top right: an insulated suction line and copper at x>=1160 in the before half, and copper at
    # x>=1040 in the top 110 px of the after half. The window starts 125 px down each half and
    # stops at x=1090, so none of it is ever on screen; it also clears the badge (x<=265), the
    # labels (x>=1094) and the watermark (y>=627 within the half).
    "06": ("06_", (275, 125), (275, 845), 815, 480,
           "refrigerant line set and copper (top right), badge, labels, watermark"),
}
# Single frames: (file prefix, x, y, w, h, what the window avoids)
SINGLES = {
    # The overgrown packaged unit (hook): x>=450 drops the open control box and its loose wiring
    # (and the badge), and y<=575 stops above the BEFORE label (y>=585) while keeping the unit's
    # rim, its matted coil and the weeds on the right.
    "11_before": ("11_", 450, 0, 990, 575, "open control box wiring, badge, BEFORE label"),
}
EXCLUDED = ("01_", "02_", "03_")  # read as a ductless wall head: never used


def run(cmd: list[str]) -> bytes:
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        sys.exit(f"prep-assets: {cmd[0]} failed: {p.stderr.decode(errors='replace').strip()}")
    return p.stdout


def source(prefix: str) -> Path:
    if prefix in EXCLUDED:
        sys.exit(f"prep-assets: {prefix}* is banned imagery for this piece")
    matches = sorted((SRC / "photos").glob(f"{prefix}*.jpg"))
    if len(matches) != 1:
        sys.exit(f"prep-assets: expected one photos/{prefix}*.jpg in the bundle")
    return matches[0]


def cut(src: Path, name: str, x: int, y: int, w: int, h: int) -> None:
    ow, oh = round(w * UPSCALE / 2) * 2, round(h * UPSCALE / 2) * 2
    run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf",
         f"crop={w}:{h}:{x}:{y},scale={ow}:{oh}:flags=lanczos,unsharp=5:5:0.35:5:5:0.0,format=rgb24",
         str(OUT / "photos" / f"{name}.png")])


def trim_logo(src: Path, name: str, width: int) -> tuple[int, int]:
    info = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                           "stream=width,height", "-of", "json", str(src)]))["streams"][0]
    w, h = info["width"], info["height"]
    alpha = np.frombuffer(run(["ffmpeg", "-v", "error", "-i", str(src), "-f", "rawvideo", "-pix_fmt", "rgba", "-"]),
                          np.uint8).reshape(h, w, 4)[:, :, 3]
    ys, xs = np.nonzero(alpha > 8)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf",
         f"crop={x1 - x0}:{y1 - y0}:{x0}:{y0},scale={width}:-2:flags=lanczos,format=rgba",
         str(OUT / "brand" / f"{name}.png")])
    return x1 - x0, y1 - y0


def main() -> int:
    if len(sys.argv) != 2 or not Path(sys.argv[1]).is_file():
        print(__doc__.strip().splitlines()[2].strip())
        return 1
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"prep-assets: {tool} is not on PATH")
    shutil.rmtree(SRC, ignore_errors=True)
    shutil.rmtree(OUT, ignore_errors=True)
    SRC.mkdir(parents=True)
    (OUT / "photos").mkdir(parents=True)
    (OUT / "brand").mkdir(parents=True)
    with tarfile.open(sys.argv[1]) as tar:
        tar.extractall(SRC, filter="data")

    for pid, (prefix, (bx, by), (ax, ay), w, h, _why) in PAIRS.items():
        src = source(prefix)
        cut(src, f"{pid}_before", bx, by, w, h)
        cut(src, f"{pid}_after", ax, ay, w, h)
    for name, (prefix, x, y, w, h, _why) in SINGLES.items():
        cut(source(prefix), name, x, y, w, h)

    white = trim_logo(SRC / "brand" / "DERIVED_logo-w-name_WHITE_trimmed.png", "logo-white", 880)
    silver = trim_logo(SRC / "brand" / "drive_Logo-w-name_transparent_grey-layer-style.png", "logo-silver", 1200)
    print(f"logo aspect: white {white[0] / white[1]:.3f}, silver {silver[0] / silver[1]:.3f}")
    for f in sorted((OUT / "photos").iterdir()) + sorted((OUT / "brand").iterdir()):
        print(f"  {f.relative_to(HERE)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

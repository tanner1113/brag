"""Trim a transparent PNG to its visible pixels and scale it to a target width.

Usage: python3 trim-logo.py in.png out.png WIDTH
Uses ffmpeg for decode/encode and numpy for the alpha bounding box (no PIL needed).
"""
import json
import subprocess
import sys

import numpy as np

src, dst, width = sys.argv[1], sys.argv[2], int(sys.argv[3])

probe = json.loads(subprocess.run(
    ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-of", "json", src], capture_output=True, check=True).stdout)
w, h = probe["streams"][0]["width"], probe["streams"][0]["height"]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
                     capture_output=True, check=True).stdout
alpha = np.frombuffer(raw, dtype=np.uint8).reshape(h, w, 4)[:, :, 3]
ys, xs = np.nonzero(alpha > 8)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf",
                f"crop={x1 - x0}:{y1 - y0}:{x0}:{y0},scale={width}:-1:flags=lanczos,format=rgba", dst],
               check=True)
print(f"{dst}: trimmed {w}x{h} -> {x1 - x0}x{y1 - y0}, scaled to width {width}")

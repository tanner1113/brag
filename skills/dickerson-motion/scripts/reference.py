#!/usr/bin/env python3
"""Pull a reference apart so its grammar can go into docs/style_guide.md (see REFERENCE.md).

    python reference.py REF [--out ref] [--scene 0.3]

REF is a video, an image, or a folder of images. Writes to --out (default: ref/):
  frames/f_NNNN.png   samples (2 fps for video) or the images, 480 px on the long side
  contact_NN.png      the samples tiled (with timestamps for video)
  shots.json          video only: scene changes (hard cuts, and wipes or slides), shot lengths
  strips/cut_<t>.png  video only: 8 consecutive frames around each scene change
  palette.json        dominant colors (hex, share of pixels) and the most saturated accents
  palette.png         the palette as swatches sized by share
  summary.md          the numbers above, ready to paste into the style guide
Needs ffmpeg, ffprobe and numpy. Keep references you don't own out of git.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import statistics
import subprocess
import sys
from pathlib import Path

import numpy as np

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
LONG_SIDE = 480
MAX_SAMPLES = 240


def run(cmd: list[str]) -> str:
    """Run a tool; return its stderr (ffmpeg logs there). Exit with the tool's message on failure."""
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        sys.exit(f"reference.py: {Path(cmd[0]).name} failed:\n{p.stderr.decode(errors='replace').strip()}")
    return p.stderr.decode(errors="replace")


def probe(path: Path) -> dict:
    p = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
                       capture_output=True)
    if p.returncode != 0:
        sys.exit(f"reference.py: ffprobe can't read {path}")
    info = json.loads(p.stdout)
    video = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), None)
    if video is None:
        sys.exit(f"reference.py: {path} has no video or image stream")
    num, _, den = video.get("r_frame_rate", "30/1").partition("/")
    return {
        "width": int(video["width"]), "height": int(video["height"]),
        "fps": float(num) / float(den or 1) if float(den or 1) else 30.0,
        "duration": float(info.get("format", {}).get("duration", 0) or 0),
    }


def find_font() -> str | None:
    """A font file for drawtext timestamps (some ffmpeg builds, notably on Windows, need one)."""
    candidates = []
    if shutil.which("fc-match"):
        r = subprocess.run(["fc-match", "-f", "%{file}", "DejaVu Sans"], capture_output=True, text=True)
        candidates.append(r.stdout.strip())
    candidates += ["C:/Windows/Fonts/arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf",
                   "/Library/Fonts/Arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    return next((c for c in candidates if c and Path(c).is_file()), None)


def stamp(font: str | None, size: int) -> str:
    if not font:
        return ""
    f = font.replace("\\", "/").replace(":", "\\:")
    return (f"drawtext=fontfile='{f}':text='%{{pts\\:hms}}':x=6:y=6:fontsize={size}:"
            "fontcolor=yellow:box=1:boxcolor=black@0.6,")


def fit_long_side() -> str:
    return f"scale='if(gt(iw,ih),{LONG_SIDE},-2)':'if(gt(iw,ih),-2,{LONG_SIDE})'"


def sample_frames(src: Path, kind: str, info: dict, frames: Path) -> float:
    """Write frames/f_NNNN.png; return the sampling rate (samples per second, 1 for images)."""
    frames.mkdir(parents=True, exist_ok=True)
    for old in frames.glob("f_*.png"):
        old.unlink()
    if kind == "video":
        rate = min(2.0, MAX_SAMPLES / max(info["duration"], 1e-6))
        run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", f"fps={rate:.4f},{fit_long_side()}",
             str(frames / "f_%04d.png")])
        return rate
    images = [src] if kind == "image" else sorted(p for p in src.iterdir() if p.suffix.lower() in IMAGE_EXT)
    if not images:
        sys.exit(f"reference.py: no images in {src}")
    for i, img in enumerate(images[:MAX_SAMPLES], start=1):
        run(["ffmpeg", "-v", "error", "-y", "-i", str(img), "-frames:v", "1", "-vf", fit_long_side(),
             str(frames / f"f_{i:04d}.png")])
    return 1.0


def contact_sheets(frames: Path, out: Path, rate: float, info: dict, kind: str, font: str | None) -> None:
    for old in out.glob("contact_*.png"):
        old.unlink()
    tall, square = info["height"] > info["width"], info["height"] == info["width"]
    cols, scale = (8, "scale=-2:270") if tall else (6, "scale=-2:240") if square else (5, "scale=320:-2")
    label = stamp(font, 14) if kind == "video" else ""
    run(["ffmpeg", "-v", "error", "-y", "-framerate", f"{rate:.4f}", "-i", str(frames / "f_%04d.png"),
         "-vf", f"{scale},{label}tile={cols}x5:padding=4:color=0x222222", str(out / "contact_%02d.png")])


def detect_cuts(src: Path, threshold: float) -> list[float]:
    """Hard cuts: frames whose ffmpeg scene score passes the threshold."""
    log = run(["ffmpeg", "-v", "info", "-i", str(src), "-an", "-vf",
               f"select='gt(scene,{threshold})',showinfo", "-f", "null", "-"])
    return [round(float(t), 3) for t in re.findall(r"pts_time:([0-9.]+)", log)]


def gray_frames(src: Path, start: float, dur: float, rate: float | None = None, size: int = 64) -> np.ndarray:
    vf = (f"fps={rate}," if rate else "") + f"scale={size}:{size}:flags=area,format=gray"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", str(src),
                          "-vf", vf, "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, size, size).astype(np.float32)


def detect_transitions(src: Path, info: dict, step: float = 0.25) -> list[float]:
    """Wipes, slides and pushes spread over many frames, so no single frame scores as a cut.
    Compare frames `step` apart instead, then refine each jump to its busiest frame."""
    f = gray_frames(src, 0.0, info["duration"], rate=1 / step)
    if len(f) < 3:
        return []
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
    limit = max(12.0, 4.0 * float(np.median(d)))
    out = []
    for i in range(len(d)):
        if d[i] > limit and d[i] == d[max(0, i - 2):i + 3].max():
            w = gray_frames(src, i * step, 2 * step)
            k = int(np.argmax(np.abs(np.diff(w, axis=0)).mean(axis=(1, 2)))) + 1 if len(w) > 1 else 0
            out.append(round(i * step + k / info["fps"], 3))
    return out


def merge_times(*lists: list[float], gap: float = 0.5) -> list[float]:
    merged: list[float] = []
    for t in sorted(t for ts in lists for t in ts):
        if not merged or t - merged[-1] >= gap:
            merged.append(t)
    return merged


def shot_stats(cuts: list[float], duration: float, fps: float) -> dict:
    bounds = [0.0] + [c for c in cuts if 0.05 < c < duration - 0.05] + [duration]
    lengths = [round(b - a, 3) for a, b in zip(bounds, bounds[1:]) if b - a > 0.02]
    bins = {"under 1 s": 0, "1-2 s": 0, "2-3 s": 0, "3-4 s": 0, "over 4 s": 0}
    for s in lengths:
        key = "under 1 s" if s < 1 else "1-2 s" if s < 2 else "2-3 s" if s < 3 else "3-4 s" if s < 4 else "over 4 s"
        bins[key] += 1
    return {
        "cuts": cuts, "shot_lengths": lengths, "shots": len(lengths),
        "median_s": round(statistics.median(lengths), 2) if lengths else None,
        "mean_s": round(statistics.mean(lengths), 2) if lengths else None,
        "shortest_s": min(lengths) if lengths else None, "longest_s": max(lengths) if lengths else None,
        "median_frames": round(statistics.median(lengths) * fps) if lengths else None,
        "cuts_per_10s": round(10 * len(cuts) / duration, 2) if duration else None,
        "length_histogram": bins,
    }


def strips(src: Path, cuts: list[float], fps: float, info: dict, out: Path, font: str | None) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("cut_*.png"):
        old.unlink()
    height = 270 if info["height"] >= info["width"] else 180
    for t in cuts[:24]:
        start = max(0.0, t - 4.5 / fps)
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-copyts", "-i", str(src), "-frames:v", "1",
             "-vf", f"select='lt(n\\,8)',scale=-2:{height},{stamp(font, 12)}tile=8x1:padding=2:color=0x222222",
             str(out / f"cut_{t:06.2f}.png")])


def palette(frames: Path, k: int = 8, seed: int = 0) -> dict:
    """Dominant colors by seeded k-means over every sampled frame."""
    files = sorted(frames.glob("f_*.png"))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-framerate", "1", "-i", str(frames / "f_%04d.png"),
                          "-vf", "scale=64:64:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    px = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(np.float32)
    if len(px) == 0:
        sys.exit("reference.py: no pixels sampled")
    rng = np.random.default_rng(seed)
    if len(px) > 200_000:
        px = px[rng.choice(len(px), 200_000, replace=False)]
    centers = [px[rng.integers(len(px))]]
    for _ in range(1, k):  # k-means++ seeding
        d = np.min([np.sum((px - c) ** 2, axis=1) for c in centers], axis=0)
        centers.append(px[rng.choice(len(px), p=d / d.sum())] if d.sum() > 0 else px[rng.integers(len(px))])
    centers = np.array(centers)
    for _ in range(25):
        label = np.argmin(((px[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2), axis=1)
        new = np.array([px[label == j].mean(axis=0) if np.any(label == j) else centers[j] for j in range(k)])
        if np.allclose(new, centers, atol=0.5):
            break
        centers = new
    share = np.bincount(label, minlength=k) / len(label)

    def describe(c: np.ndarray, s: float) -> dict:
        r, g, b = (int(round(v)) for v in c)
        mx, mn = max(r, g, b) / 255, min(r, g, b) / 255
        sat = 0.0 if mx == 0 else (mx - mn) / mx
        return {"hex": f"#{r:02X}{g:02X}{b:02X}", "share": round(float(s), 3),
                "lightness": round((mx + mn) / 2, 2), "saturation": round(sat, 2)}

    colors = [describe(centers[j], share[j]) for j in np.argsort(-share)]
    accents = sorted((c for c in colors if c["saturation"] >= 0.45 and c["share"] >= 0.01 and 0.15 < c["lightness"] < 0.9),
                     key=lambda c: -c["saturation"] * c["share"])
    return {"samples": len(files), "colors": colors, "accents": accents[:3]}


def palette_png(pal: dict, path: Path, width: int = 800, height: int = 100) -> None:
    img = np.zeros((height, width, 3), np.uint8)
    x = 0
    for c in pal["colors"]:
        w = max(1, int(round(c["share"] * width)))
        img[:, x:x + w] = [int(c["hex"][i:i + 2], 16) for i in (1, 3, 5)]
        x += w
    img[:, x:] = img[:, max(0, x - 1):x] if x else 0
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
                    "-i", "-", str(path)], input=img.tobytes(), check=True)


def summary(src: Path, kind: str, info: dict, rate: float, shots: dict | None, pal: dict) -> str:
    lines = [f"# Reference summary: {src.name}", "",
             f"- Kind: {kind}; {info['width']}x{info['height']}"
             + (f", {info['fps']:.2f} fps, {info['duration']:.1f} s" if kind == "video" else ""),
             f"- Samples: {pal['samples']} in `frames/`" + (f" at {rate:g} per second" if kind == "video" else ""), ""]
    if shots:
        lines += ["## Shots", "",
                  f"- {shots['shots']} shots; median {shots['median_s']} s ({shots['median_frames']} frames), "
                  f"range {shots['shortest_s']}-{shots['longest_s']} s; {shots['cuts_per_10s']} cuts per 10 s",
                  "- Lengths: " + ", ".join(f"{k} {v}" for k, v in shots["length_histogram"].items()),
                  "- Scene changes: " + (", ".join(f"{c:.2f}" for c in shots["cuts"]) or "none detected")
                  + f" ({len(shots['hard_cuts'])} hard cuts; the rest are wipes, slides or pushes)",
                  "- Frame strips around each cut: `strips/`", ""]
    lines += ["## Palette (share of pixels)", "", "| Hex | Share | Lightness | Saturation |", "|---|---|---|---|"]
    lines += [f"| `{c['hex']}` | {c['share']:.0%} | {c['lightness']} | {c['saturation']} |" for c in pal["colors"]]
    lines += ["", "Accent candidates: " + (", ".join(f"`{c['hex']}`" for c in pal["accents"]) or "none"), "",
              "Next: fill in `docs/style_guide.md` with this reference's grammar (rhythm, moves, type behavior)",
              "mapped onto Dickerson's palette, faces and job photos. Never copy its footage, words or logos.", ""]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="Extract frames, cuts, strips and a palette from a reference.")
    ap.add_argument("ref", type=Path, help="a video, an image, or a folder of images")
    ap.add_argument("--out", type=Path, default=Path("ref"), help="output folder (default: ref/)")
    ap.add_argument("--scene", type=float, default=0.3, help="cut detection threshold, 0-1 (default 0.3)")
    args = ap.parse_args()
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"reference.py: {tool} is not on PATH (see INSTALL.md)")
    if not args.ref.exists():
        sys.exit(f"reference.py: {args.ref} not found")

    kind = "folder" if args.ref.is_dir() else "image" if args.ref.suffix.lower() in IMAGE_EXT else "video"
    first = args.ref if kind != "folder" else next(
        (p for p in sorted(args.ref.iterdir()) if p.suffix.lower() in IMAGE_EXT), None)
    if first is None:
        sys.exit(f"reference.py: no images in {args.ref}")
    info = probe(first)
    if kind == "video" and info["duration"] < 0.5:
        kind = "image"
    args.out.mkdir(parents=True, exist_ok=True)
    font = find_font()

    rate = sample_frames(args.ref, kind, info, args.out / "frames")
    contact_sheets(args.out / "frames", args.out, rate, info, kind, font)
    shots = None
    if kind == "video":
        cuts = detect_cuts(args.ref, args.scene)
        transitions = detect_transitions(args.ref, info)
        changes = merge_times(cuts, transitions)
        shots = {"hard_cuts": cuts, "transitions": [t for t in changes if t not in cuts],
                 **shot_stats(changes, info["duration"], info["fps"])}
        (args.out / "shots.json").write_text(json.dumps(shots, indent=2) + "\n", encoding="utf-8")
        strips(args.ref, shots["cuts"], info["fps"], info, args.out / "strips", font)
    pal = palette(args.out / "frames")
    (args.out / "palette.json").write_text(json.dumps(pal, indent=2) + "\n", encoding="utf-8")
    palette_png(pal, args.out / "palette.png")
    (args.out / "summary.md").write_text(summary(args.ref, kind, info, rate, shots, pal), encoding="utf-8")

    print(f"reference: {args.ref} ({kind}) -> {args.out}/")
    if shots:
        print(f"  {shots['shots']} shots, median {shots['median_s']} s, {shots['cuts_per_10s']} cuts per 10 s")
    print("  palette: " + " ".join(f"{c['hex']} {c['share']:.0%}" for c in pal["colors"][:5]))
    print(f"  read {args.out}/summary.md, the contact sheets and strips, then write docs/style_guide.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())

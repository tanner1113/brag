#!/usr/bin/env python3
"""Measure a music track so cuts can land on its real beats.

    python beats.py TRACK [--out beats.json] [--meter 4] [--start S] [--duration D]
                          [--hits N] [--downbeat-phase P]
    python beats.py --selftest

Writes JSON with bpm, beats, downbeats and onset_hits (times in seconds from the
start of the file), plus the downbeat phase and a confidence score. See AUDIO.md.

Needs librosa (ISC), numpy and soundfile. ffmpeg is used only for formats that
soundfile can't read (m4a, aac and so on).
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

SR = 22050
HOP = 256  # 11.6 ms: beat tracking resolution
FINE_HOP = 64  # 2.9 ms: the onset envelope used to place beats and hits on their attacks
SNAP = 0.035  # look for a clear attack within +-35 ms of each tracked beat
TOL = 0.035  # ...and use it only if it stays within 35 ms of the beat grid
SCHEMA = "dickerson-motion/beats@1"


def load(path: Path, start: float, duration: float | None) -> tuple[np.ndarray, float]:
    """Mono float32 at SR, plus the file's total duration in seconds."""
    try:
        with sf.SoundFile(str(path)) as f:
            total = f.frames / f.samplerate
            f.seek(int(round(start * f.samplerate)))
            frames = -1 if duration is None else int(round(duration * f.samplerate))
            y = f.read(frames, dtype="float32", always_2d=True).mean(axis=1)
            sr = f.samplerate
    except (RuntimeError, sf.SoundFileError) as err:
        y, sr, total = load_with_ffmpeg(path, start, duration, err)
    if sr != SR:
        y = librosa.resample(y, orig_sr=sr, target_sr=SR)
    return np.ascontiguousarray(y, dtype=np.float32), total


def load_with_ffmpeg(path: Path, start: float, duration: float | None, err: Exception):
    exe = shutil.which("ffmpeg")
    if not exe:
        sys.exit(f"beats.py: soundfile can't read {path} ({err}) and ffmpeg isn't on PATH")
    cmd = [exe, "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    run = subprocess.run(cmd, capture_output=True)
    if run.returncode != 0:
        sys.exit(f"beats.py: ffmpeg couldn't decode {path}: {run.stderr.decode(errors='replace').strip()}")
    y = np.frombuffer(run.stdout, dtype="<f4")
    total = len(y) / SR
    i0 = int(round(start * SR))
    i1 = len(y) if duration is None else i0 + int(round(duration * SR))
    return y[i0:i1].copy(), SR, total


def snap_to_attacks(times: np.ndarray, fine: np.ndarray) -> np.ndarray:
    """Move each time to the start of the strongest attack within SNAP, if that attack clearly
    stands out. The onset envelope peaks mid-attack, so the attack's start is taken as the
    point where the rise from the preceding minimum reaches 30% of its height."""
    r = int(round(SNAP * SR / FINE_HOP))
    ctx = int(round(0.15 * SR / FINE_HOP))
    back = int(round(0.045 * SR / FINE_HOP))
    out = []
    for t in times:
        i = int(round(t * SR / FINE_HOP))
        lo, hi = max(0, i - r), min(len(fine), i + r + 1)
        if lo >= hi:
            out.append(t)
            continue
        j = lo + int(np.argmax(fine[lo:hi]))
        local = np.median(fine[max(0, i - ctx):min(len(fine), i + ctx + 1)])
        if fine[j] <= 2.0 * local + 1e-9:
            out.append(t)
            continue
        k = j
        while k > 0 and j - k < back and fine[k - 1] < fine[k]:
            k -= 1
        rise = k + int(np.argmax(fine[k:j + 1] >= fine[k] + 0.3 * (fine[j] - fine[k])))
        out.append(rise * FINE_HOP / SR)
    return np.array(out)


def period_of(beats: np.ndarray) -> float:
    """Beat period: the mean of the intervals within 10% of the median (skips missed beats)."""
    d = np.diff(beats)
    med = float(np.median(d))
    near = d[np.abs(d - med) <= 0.1 * med]
    return float(near.mean()) if near.size else med


def place_beats(raw: np.ndarray, fine: np.ndarray, duration: float) -> np.ndarray:
    """Put the tracked beats on their attacks without letting any jump to an off-beat note.

    A beat takes its attack time only if that stays within TOL of the tracker's
    grid (shifted by the track's typical attack offset); otherwise it keeps the grid time.
    librosa also trims weak beats at both ends, so edge beats with a clear attack go back in."""
    snapped = snap_to_attacks(raw, fine)
    moved = np.abs(snapped - raw) > 1e-9
    offset = float(np.median((snapped - raw)[moved])) if moved.any() else 0.0
    beats = [float(s) if abs(s - (r + offset)) <= TOL else float(r + offset) for r, s in zip(raw, snapped)]
    period = period_of(raw)

    def edge(t: float) -> float | None:
        s = float(snap_to_attacks(np.array([t]), fine)[0])
        return s if abs(s - t) > 1e-9 and abs(s - (t + offset)) <= TOL else None

    t = raw[0] - period
    while t >= 0 and (s := edge(t)) is not None:
        beats.insert(0, s)
        t -= period
    t = raw[-1] + period
    while t <= duration - 0.05 and (s := edge(t)) is not None:
        beats.append(s)
        t += period
    return np.array(beats)


def track_beats(y: np.ndarray) -> np.ndarray:
    env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    _, frames = librosa.beat.beat_track(onset_envelope=env, sr=SR, hop_length=HOP, units="frames")
    if len(frames) >= 8:
        # librosa's tempo estimate is coarse (a few percent), so track again at the tempo
        # measured from the first pass's beat spacing, held tighter to keep sparse intros on the grid.
        period = float(np.median(np.diff(frames))) * HOP / SR
        _, frames = librosa.beat.beat_track(
            onset_envelope=env, sr=SR, hop_length=HOP, bpm=60.0 / period, tightness=400, units="frames")
    return librosa.frames_to_time(frames, sr=SR, hop_length=HOP)


def robust_unit(x: np.ndarray) -> np.ndarray:
    hi = np.percentile(x, 95) if x.size else 0.0
    return np.clip(x / hi, 0.0, 1.5) if hi > 1e-12 else np.zeros_like(x)


def change_at_beats(chroma: np.ndarray, frames: np.ndarray) -> np.ndarray:
    """How much the pitch content changes across each beat (0 = same, 1 = unrelated)."""
    seg = librosa.util.sync(chroma, list(frames), aggregate=np.median)  # column i+1 starts at beat i
    unit = seg / (np.linalg.norm(seg, axis=0, keepdims=True) + 1e-9)
    return np.array([1.0 - float(unit[:, i] @ unit[:, i + 1]) for i in range(len(frames))])


def downbeat_scores(y: np.ndarray, beats: np.ndarray, meter: int) -> np.ndarray:
    """Score each beat phase as the bar's first beat.

    librosa doesn't track bars, so this weighs three cues that favor the downbeat:
    the bass note changing (the strongest cue), the chord changing, and the energy
    stepping up (sections start on the bar). Kick and onset strength are left out
    because backbeat snares and sidechained kicks often point at the wrong beat."""
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    n = S.shape[1]
    bf = np.clip(librosa.time_to_frames(beats, sr=SR, hop_length=HOP), 0, n - 1)
    chord = change_at_beats(librosa.feature.chroma_stft(S=S ** 2, sr=SR, hop_length=HOP), bf)

    # Bass notes need finer frequency resolution than the main STFT: use a 4 kHz copy.
    low_sr, low_hop = 4000, 64
    y_low = librosa.resample(y, orig_sr=SR, target_sr=low_sr)
    L = np.abs(librosa.stft(y_low, n_fft=2048, hop_length=low_hop)) ** 2
    L[(librosa.fft_frequencies(sr=low_sr, n_fft=2048) < 40) | (librosa.fft_frequencies(sr=low_sr, n_fft=2048) > 250)] = 0
    lf = np.clip(librosa.time_to_frames(beats, sr=low_sr, hop_length=low_hop), 0, L.shape[1] - 1)
    bass = change_at_beats(librosa.feature.chroma_stft(S=L, sr=low_sr, hop_length=low_hop), lf)

    rms = librosa.feature.rms(S=S, frame_length=2048, hop_length=HOP)[0]
    span = max(1, int(round(2 * np.median(np.diff(bf))))) if len(bf) > 1 else 1
    step = np.array([
        max(0.0, np.log(rms[f:f + span].mean() + 1e-6) - np.log(rms[max(0, f - span):f].mean() + 1e-6))
        if f > 0 else 0.0 for f in bf])

    evidence = 2.0 * robust_unit(bass) + robust_unit(chord) + robust_unit(step)
    return np.array([evidence[p::meter].mean() if len(evidence[p::meter]) else 0.0 for p in range(meter)])


def onset_hits(fine: np.ndarray, n: int, min_gap: float = 0.1) -> list[dict]:
    """The n strongest attacks (at least min_gap apart), timed at their start like the beats."""
    peaks = librosa.onset.onset_detect(onset_envelope=fine, sr=SR, hop_length=FINE_HOP, units="frames")
    if len(peaks) == 0:
        return []
    strength = fine[peaks] / max(np.percentile(fine[peaks], 99), 1e-9)
    times = peaks * FINE_HOP / SR
    chosen: list[int] = []
    for k in np.argsort(-strength):
        if all(abs(times[k] - times[c]) >= min_gap for c in chosen):
            chosen.append(int(k))
        if len(chosen) >= n:
            break
    chosen.sort(key=lambda c: times[c])
    starts = snap_to_attacks(times[chosen], fine)
    return [{"t": round(float(t), 4), "strength": round(float(min(1.0, strength[k])), 3)}
            for t, k in zip(starts, chosen)]


def analyze(y: np.ndarray, meter: int = 4, n_hits: int = 48, phase: int | None = None) -> dict:
    fine = librosa.onset.onset_strength(y=y, sr=SR, hop_length=FINE_HOP)
    raw = track_beats(y)
    if len(raw) < 2 * meter:
        raise SystemExit("beats.py: too few beats found; is this a track with a steady pulse?")
    beats = place_beats(raw, fine, len(y) / SR)
    scores = downbeat_scores(y, beats, meter)
    order = np.argsort(-scores)
    best = int(order[0]) if phase is None else phase % meter
    confidence = float((scores[order[0]] - scores[order[1]]) / max(scores[order[0]], 1e-9))
    return {
        "bpm": round(60.0 / period_of(beats), 2),
        "meter": meter,
        "beats": [round(float(t), 4) for t in beats],
        "downbeats": [round(float(t), 4) for t in beats[best::meter]],
        "downbeat_phase": best,
        "downbeat_confidence": round(confidence if phase is None else 1.0, 3),
        "onset_hits": onset_hits(fine, n_hits),
    }


def shift(result: dict, offset: float) -> dict:
    if offset:
        for key in ("beats", "downbeats"):
            result[key] = [round(t + offset, 4) for t in result[key]]
        for hit in result["onset_hits"]:
            hit["t"] = round(hit["t"] + offset, 4)
    return result


def selftest() -> int:
    """Analyze a synthetic 120 BPM track with known bars; no audio file needed."""
    dur, bpm, first = 24.0, 120.0, 0.25
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros_like(t)
    rng = np.random.default_rng(7)
    chords = [(261.63, 329.63, 392.0), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66)]
    beat = 60.0 / bpm
    for k in range(int((dur - first) / beat)):
        b = first + k * beat
        i = int(b * SR)
        env = np.exp(-np.arange(int(0.25 * SR)) / (0.06 * SR))
        seg = slice(i, min(len(y), i + len(env)))
        m = seg.stop - seg.start
        if k % 4 == 0:  # kick on the downbeat only
            ph = 2 * np.pi * np.cumsum(np.linspace(110, 45, m)) / SR
            y[seg] += 0.9 * np.sin(ph) * env[:m]
        hat = rng.standard_normal(m) * np.exp(-np.arange(m) / (0.012 * SR))
        y[seg] += 0.15 * hat
    for bar in range(int((dur - first) / (4 * beat))):
        s0, s1 = int((first + bar * 4 * beat) * SR), int((first + (bar + 1) * 4 * beat) * SR)
        tt = t[s0:s1] - t[s0]
        y[s0:s1] += 0.06 * sum(np.sin(2 * np.pi * f * tt) for f in chords[bar % 4]) * np.minimum(1, tt / 0.02)
    res = analyze(y.astype(np.float32))
    want = first + np.arange(0, 40) * 4 * beat
    got = np.array(res["downbeats"])
    near = np.abs(got[:, None] - want[None, :]).min(axis=1) if len(got) else np.array([1.0])
    ok_bpm = abs(res["bpm"] - bpm) < 0.5
    ok_bars = len(got) >= 4 and float(np.median(near)) < 0.02
    print(f"selftest: bpm {res['bpm']} (want {bpm}), {len(res['beats'])} beats, "
          f"downbeats {res['downbeats'][:3]}... (want {[round(float(w), 3) for w in want[:3]]}), "
          f"confidence {res['downbeat_confidence']}")
    print("selftest:", "PASS" if ok_bpm and ok_bars else "FAIL")
    return 0 if ok_bpm and ok_bars else 1


def main() -> int:
    ap = argparse.ArgumentParser(description="Write beats.json (bpm, beats, downbeats, onset hits) for a track.")
    ap.add_argument("track", nargs="?", type=Path, help="audio file (wav, mp3, flac, ogg; others via ffmpeg)")
    ap.add_argument("--out", type=Path, default=Path("beats.json"), help="output JSON (default: beats.json)")
    ap.add_argument("--meter", type=int, default=4, help="beats per bar (default 4)")
    ap.add_argument("--start", type=float, default=0.0, help="analyze from this time in seconds")
    ap.add_argument("--duration", type=float, default=None, help="analyze only this many seconds")
    ap.add_argument("--hits", type=int, default=48, help="how many of the strongest onsets to keep (default 48)")
    ap.add_argument("--downbeat-phase", type=int, default=None,
                    help="force which beat (0-based, among the first --meter beats) starts a bar")
    ap.add_argument("--selftest", action="store_true", help="check the install on a synthetic track and exit")
    args = ap.parse_args()

    if args.selftest:
        return selftest()
    if args.track is None:
        ap.error("give a track, or use --selftest")
    if not args.track.exists():
        ap.error(f"{args.track} not found")

    y, total = load(args.track, args.start, args.duration)
    result = shift(analyze(y, args.meter, args.hits, args.downbeat_phase), args.start)
    doc = {
        "schema": SCHEMA,
        "source": args.track.name,
        "duration": round(total, 3),
        "analyzed": {"start": args.start, "duration": round(len(y) / SR, 3), "sample_rate": SR},
        **result,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")

    first = ", ".join(f"{t:.3f}" for t in doc["downbeats"][:4])
    strongest = ", ".join(f"{h['t']:.3f}" for h in sorted(doc["onset_hits"], key=lambda h: -h["strength"])[:4])
    print(f"{args.track.name}: {doc['bpm']} BPM, {len(doc['beats'])} beats, {len(doc['downbeats'])} bars")
    print(f"  first downbeats: {first}  (phase {doc['downbeat_phase']}, confidence {doc['downbeat_confidence']})")
    print(f"  strongest hits: {strongest}")
    if args.downbeat_phase is None and doc["downbeat_confidence"] < 0.15:
        print("  warning: the bar start is uncertain on this track. Listen to the first downbeats above and,"
              " if they're off, rerun with --downbeat-phase 0..%d." % (args.meter - 1))
    print(f"  wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

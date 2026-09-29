#!/usr/bin/env python3
"""Soundtrack for the v2 restoration video: a beat-aligned edit of one bundled track, plus sound
effects synthesized in the track's key and mixed with it as one piece.

    python build-audio.py   ->  work/audio/{music,sfx,mix}.wav

Music: happy-beats-business-moves-vol-12 (109.98 BPM, C major). Beats come from
skills/dickerson-motion/scripts/beats.py (work/beats.json). The video starts on the measured beat
at 1.115 s. Two splices, each attack to attack on a measured downbeat, fit the track to the shots:
at 14.169 s it steps back one bar, so the fuller section lands on "Evidence Before
Recommendation" at 18.528 s; at 22.900 s it drops from the groove into the last build bar, so the
closing C major hit lands on the end card at 25.086 s and rings out under it.

Effects stay under the music: soft air on moves and slider sweeps, mallet ticks on chord tones of
the bar they fall in (chords read from the track's chroma), and a warm C major bloom under the
final hit. They share one small room reverb.
"""
from __future__ import annotations

import pathlib
import re
import subprocess

import numpy as np
from scipy import ndimage, signal
from scipy.io import wavfile

SR = 48000
DUR = 29.6
N = int(round(DUR * SR))
HERE = pathlib.Path(__file__).resolve().parent
TRACK = (HERE / '../../skills/brag/assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3').resolve()
OUT = HERE / 'work' / 'audio'

# (video start, track start): each segment plays until the next one begins. Every track time is a
# measured beat or downbeat attack from work/beats.json.
SEGMENTS = [
    (0.000, 1.115),     # the hook starts on a beat of the intro
    (14.169, 13.102),   # the checklist: back one bar (from the downbeat at 15.284)
    (22.900, 111.284),  # from the groove's downbeat (21.833) into the last build bar
]
XFADE = 0.015  # each splice crossfades over the 15 ms before the incoming attack
TARGET_LUFS = -14.0
# AAC encoding overshoots the master's true peak by up to about 0.6 dB, and the rule is
# -1 dBTP on the delivered file, so the master sits lower.
CEILING_DBTP = -2.0

rng = np.random.default_rng(20260928)


# ---------- music ----------

def load_track() -> np.ndarray:
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(TRACK), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def music_edit() -> np.ndarray:
    x = load_track()
    out = np.zeros((N, 2))
    xf = int(round(XFADE * SR))
    ramp = np.linspace(0, np.pi / 2, xf)
    for k, (v0, s0) in enumerate(SEGMENTS):
        v1 = SEGMENTS[k + 1][0] if k + 1 < len(SEGMENTS) else DUR
        i0, i1 = int(round(v0 * SR)), int(round(v1 * SR))
        pre = xf if k else 0
        a0 = int(round(s0 * SR)) - pre
        seg = np.zeros((i1 - i0 + pre, 2))
        src = x[a0:a0 + len(seg)]
        seg[:len(src)] = src
        if k:
            seg[:xf] *= np.sin(ramp)[:, None]
        if k + 1 < len(SEGMENTS):
            seg[-xf:] *= np.cos(ramp)[:, None]
        out[i0 - pre:i1] += seg
    # The track is mid-phrase at 1.115 s: a short fade avoids a click on the first frame.
    fin = int(0.06 * SR)
    out[:fin] *= (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, fin)))[:, None]
    return out


# ---------- synthesis helpers ----------

def ease(kind: str, u):
    u = np.clip(u, 0.0, 1.0)
    if kind == 'inOutCubic':
        return np.where(u < 0.5, 4 * u ** 3, 1 - (-2 * u + 2) ** 3 / 2)
    if kind == 'inOutSine':
        return (1 - np.cos(np.pi * u)) / 2
    if kind == 'outCubic':
        return 1 - (1 - u) ** 3
    if kind == 'outQuart':
        return 1 - (1 - u) ** 4
    raise ValueError(kind)


def speed(kind: str, u):
    """Normalized |d ease / du| (peak 1), so a sound follows the on-screen motion."""
    u = np.clip(u, 0.0, 1.0)
    if kind == 'inOutCubic':
        return np.where(u < 0.5, 12 * u ** 2, 12 * (1 - u) ** 2) / 3
    if kind == 'inOutSine':
        return np.sin(np.pi * u)
    if kind == 'outCubic':
        return (1 - u) ** 2
    if kind == 'outQuart':
        return (1 - u) ** 3
    raise ValueError(kind)


def smooth_env(e: np.ndarray, attack: float, release: float) -> np.ndarray:
    """Soften an envelope: a short raised-cosine attack blur and an exponential release tail."""
    a = max(1, int(attack * SR))
    k_a = np.hanning(2 * a + 1)
    e = np.convolve(e, k_a / k_a.sum(), mode='same')
    r = int(release * 5 * SR)
    k_r = np.exp(-np.arange(r) / (release * SR))
    y = signal.fftconvolve(e, k_r / k_r.sum())[:len(e)]
    return y / max(y.max(), 1e-12) * e.max()


def pan_stereo(y: np.ndarray, p) -> np.ndarray:
    p = np.broadcast_to(np.asarray(p, dtype=float), y.shape)
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1)


def peak_rms(st: np.ndarray, win: float = 0.05) -> float:
    w = int(win * SR)
    p = np.convolve((st ** 2).mean(axis=1), np.ones(w) / w, mode='valid')
    return float(np.sqrt(p.max()))


def sos_filter(y, kind, freq, order=2):
    return signal.sosfilt(signal.butter(order, freq, btype=kind, fs=SR, output='sos'), y, axis=0)


def air(dur, kind, f_lo, f_hi, *, sweep='speed', width=0.75, pan=(0.0, 0.0), pre=0.03, tail=0.12, body=0.0):
    """Soft air: noise through a log-Gaussian band. With sweep='speed' the band rises with the
    speed of the on-screen move; 'down' follows the position from f_hi to f_lo. The level
    follows the speed; the pan follows the position."""
    n = int(round((pre + dur + tail * 5) * SR))
    t = np.arange(n) / SR - pre
    u = t / dur
    raw = speed(kind, u) ** 0.85
    raw[(t < 0) | (t > dur)] = 0
    env = smooth_env(raw, 0.012, tail)
    pos = ease(kind, u)

    nper, hop = 1024, 256
    noise = rng.standard_normal(n + nper)
    f, ft, Z = signal.stft(noise, SR, nperseg=nper, noverlap=nper - hop)
    ft = ft - pre
    if sweep == 'speed':
        drive = np.interp(ft, t, env / max(env.max(), 1e-12))
        fc = f_lo * (f_hi / f_lo) ** drive
    else:
        fc = f_hi * (f_lo / f_hi) ** np.interp(ft, t, pos)
    logf = np.log(np.maximum(f, 20.0))[:, None]
    band = np.exp(-0.5 * ((logf - np.log(fc)[None, :]) / width) ** 2)
    _, y = signal.istft(Z * band, SR, nperseg=nper, noverlap=nper - hop)
    y = y[:n] * env
    if body:
        low = sos_filter(rng.standard_normal(n), 'bandpass', [70, 260], 2)
        y = y + body * low / np.abs(low).max() * np.abs(y).max() * env / max(env.max(), 1e-12)
    y = sos_filter(y, 'highpass', 90, 2)
    y = sos_filter(y, 'lowpass', 9000, 2)
    st = pan_stereo(y, pan[0] + (pan[1] - pan[0]) * pos)
    return st / peak_rms(st), pre


def swell(dur, f_lo, f_hi, *, release=0.1):
    """A breath that grows into a moment and stops on it."""
    n = int(round((dur + release * 6) * SR))
    t = np.arange(n) / SR
    u = np.clip(t / dur, 0, 1)
    env = np.where(t <= dur, u ** 2.2, np.exp(-(t - dur) / release))
    env = smooth_env(env, 0.01, 0.03)
    nper, hop = 1024, 256
    f, ft, Z = signal.stft(rng.standard_normal(n + nper), SR, nperseg=nper, noverlap=nper - hop)
    fc = f_lo * (f_hi / f_lo) ** np.clip(ft / dur, 0, 1)
    band = np.exp(-0.5 * ((np.log(np.maximum(f, 20.0))[:, None] - np.log(fc)[None, :]) / 0.7) ** 2)
    _, y = signal.istft(Z * band, SR, nperseg=nper, noverlap=nper - hop)
    y = sos_filter(y[:n] * env, 'highpass', 120, 2)
    # Slight decorrelation so it feels wide without panning.
    st = np.stack([y, np.roll(y, int(0.011 * SR))], axis=1)
    return st / peak_rms(st), 0.0


def mallet(freqs, decay=0.11):
    """Soft wooden tick: fundamental plus the 4:1 partial of a tuned bar, with a gentle attack."""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f0 in freqs:
        y += np.sin(2 * np.pi * f0 * t) * np.exp(-t / decay)
        y += 0.12 * np.sin(2 * np.pi * 3.98 * f0 * t) * np.exp(-t / (decay * 0.2))
    knock = sos_filter(rng.standard_normal(n), 'bandpass', [900, 3200], 2) * np.exp(-t / 0.004)
    y += 0.04 * knock / np.abs(knock).max() * len(freqs)
    y *= 0.5 - 0.5 * np.cos(np.pi * np.clip(t / 0.0035, 0, 1))
    y = sos_filter(y, 'lowpass', 6500, 2)
    st = pan_stereo(y, 0.0)
    return st / np.abs(st).max(), 0.0


def bloom():
    """Warm C major glow under the track's final hit (C3 G3 C4 E4), slow in, long out."""
    n = int(2.95 * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f0, g in [(130.81, 1.0), (196.00, 0.55), (261.63, 0.5), (329.63, 0.28)]:
        y += g * (np.sin(2 * np.pi * f0 * t) + 0.12 * np.sin(2 * np.pi * 2 * f0 * t))
    y *= (1 - np.exp(-t / 0.07)) * np.exp(-t / 1.05)
    y = sos_filter(y, 'lowpass', 2400, 2)
    st = np.stack([y, np.roll(y, int(0.007 * SR))], axis=1)
    return st / np.abs(st).max(), 0.0


def room_ir(rt60=1.1, pre=0.02, length=2.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-6.91 * t / rt60)[:, None]
    ir = sos_filter(ir, 'lowpass', 5200, 2)
    ir = sos_filter(ir, 'highpass', 180, 2)
    ir = np.vstack([np.zeros((int(pre * SR), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0).mean())


# ---------- the cue sheet (video seconds; matches composition/timeline.js) ----------

def cue_sheet():
    D = lambda db: 10 ** (db / 20)  # noqa: E731
    sweep = lambda dur: air(dur, 'inOutSine', 280, 1500, width=0.6, pan=(-0.6, 0.6))  # noqa: E731
    wipe = lambda: air(0.46, 'inOutCubic', 260, 3000, width=0.85, pan=(-0.7, 0.7), body=0.35)  # noqa: E731
    return [
        # (start of the on-screen move, sound, level dB, reverb send)
        (1.079, air(0.6, 'outQuart', 220, 900, width=0.6), D(-40), 0.1),  # the hook photo punches in on the downbeat
        (2.690, air(0.42, 'inOutCubic', 320, 2600, pan=(0.55, -0.55)), D(-32), 0.12),  # scene 2 pushes in from the right
        (3.784, sweep(1.3), D(-35), 0.1),  # slider sweep
        (5.445, air(0.40, 'outQuart', 500, 2200, width=0.7), D(-38), 0.1),  # three paths rise in
        (6.524, mallet([523.25, 880.00], decay=0.14), D(-24), 0.3),  # "System Restoration" lights up (C5+A5 over F)
        (7.200, air(0.42, 'inOutCubic', 700, 2400, sweep='down', pan=(0.0, -0.3)), D(-34), 0.12),  # row rises into the kicker
        (8.156, sweep(1.3), D(-35), 0.1),
        (10.335, air(1.3, 'inOutSine', 280, 1500, sweep='down', width=0.6), D(-35), 0.1),  # top-to-bottom sweep, falling
        (12.515, air(0.8, 'outCubic', 300, 1600, width=0.6, pan=(0.6, 0.05)), D(-35), 0.1),  # AFTER half slides in from the right
        (14.169, mallet([523.25]), D(-24), 0.3),  # checklist rows tick C5 E5 G5 (C bar)
        (14.442, mallet([659.25]), D(-24), 0.3),
        (14.715, mallet([783.99]), D(-25), 0.3),
        (15.789, sweep(1.4), D(-36), 0.1),
        (18.298, wipe(), D(-28), 0.14),  # brand wipe into the evidence scene
        (22.337 - 0.45, swell(0.45, 300, 1400), D(-34), 0.2),  # grows into the statement
        (22.900, mallet([783.99], decay=0.09), D(-28), 0.25),  # "AUTOMATIC ANSWER." turns red on the build (G5 over C)
        (25.086, bloom(), D(-25), 0.45),  # under the final hit: the cut to the end card
        (25.086, air(0.5, 'inOutCubic', 600, 1800, sweep='down', width=0.6, pan=(-0.4, -0.1)), D(-37), 0.15),  # badge travels
        (25.632, mallet([783.99]), D(-23), 0.3),  # end card checks G5 -> C6 (over the final C chord)
        (25.904, mallet([1046.50]), D(-24), 0.3),
        (26.177, air(0.38, 'outQuart', 400, 1800, width=0.7, pan=(-0.4, 0.2)), D(-37), 0.1),  # button reveals
    ]


# ---------- mix and master ----------

def measure(y: np.ndarray):
    tmp = OUT / '_measure.wav'
    wavfile.write(tmp, SR, y.astype(np.float32))
    r = subprocess.run(['ffmpeg', '-nostats', '-hide_banner', '-i', str(tmp), '-af', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, text=True)
    tmp.unlink()
    s = r.stderr[r.stderr.rfind('Summary:'):]
    lufs = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1))
    tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))
    return lufs, tp


def limit(y: np.ndarray, ceiling_db: float, look=0.004, release=0.12):
    """Lookahead limiter on 4x-oversampled peaks. Returns the output and max gain reduction in dB."""
    ceiling = 10 ** (ceiling_db / 20)
    up = signal.resample_poly(y, 4, 1, axis=0)
    pk = np.abs(up).max(axis=1)[:len(y) * 4].reshape(-1, 4).max(axis=1)
    need = np.minimum(1.0, ceiling / np.maximum(pk, 1e-12))
    if need.min() >= 1.0:
        return y, 0.0
    la = int(look * SR)
    g = ndimage.minimum_filter1d(need, size=2 * la + 1, mode='nearest')
    g = ndimage.uniform_filter1d(g, size=la, mode='nearest')
    a = 1 - np.exp(-1 / (release * SR))
    out = g.copy()
    prev = 1.0
    for i in range(len(g)):
        prev = min(g[i], prev + (1 - prev) * a)
        out[i] = prev
    return y * out[:, None], float(-20 * np.log10(out.min()))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    music = music_edit()

    ir = room_ir()
    dry = np.zeros((N, 2))
    send = np.zeros((N, 2))
    for at, (st, pre), gain, wet in cue_sheet():
        i0 = int(round((at - pre) * SR))
        seg = st * gain
        j0, j1 = max(0, i0), min(N, i0 + len(seg))
        dry[j0:j1] += seg[j0 - i0:j1 - i0]
        send[j0:j1] += seg[j0 - i0:j1 - i0] * wet
    wet_bus = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], axis=1) * 0.5
    sfx = dry + wet_bus

    mix = music + sfx
    end = int(0.35 * SR)
    fade = (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, end)))[:, None]

    lufs0, _ = measure(mix)
    gain = 10 ** ((TARGET_LUFS - lufs0) / 20)
    master, gr = limit(mix * gain, CEILING_DBTP)
    master[-end:] *= fade
    lufs, tp = measure(master)

    print(f'music edit: {len(music) / SR:.3f}s; splices at ' + ', '.join(f'{v:.3f}s' for v, _ in SEGMENTS[1:]))
    print(f'pre-master {lufs0:.2f} LUFS, gain {20 * np.log10(gain):+.2f} dB, limiter max GR {gr:.2f} dB')
    print(f'final: {lufs:.2f} LUFS integrated, true peak {tp:.2f} dBTP')
    w = int(0.4 * SR)
    for at, _, _, _ in cue_sheet():
        i = int(at * SR)
        m = np.sqrt(np.mean(music[i:i + w] ** 2)) + 1e-12
        s = np.sqrt(np.mean(sfx[i:i + w] ** 2)) + 1e-12
        print(f'  cue {at:6.2f}s  sfx {20 * np.log10(s / m):+6.1f} dB vs music')

    wavfile.write(OUT / 'music.wav', SR, (music * gain).astype(np.float32))
    wavfile.write(OUT / 'sfx.wav', SR, (sfx * gain).astype(np.float32))
    wavfile.write(OUT / 'mix.wav', SR, master.astype(np.float32))
    print(f'wrote {OUT / "mix.wav"}')


if __name__ == '__main__':
    main()

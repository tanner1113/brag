#!/usr/bin/env python3
"""Soundtrack for the Dickerson restoration video: a bar-aligned edit of one bundled track,
plus sound effects synthesized in the track's key and mixed with it as one piece.

    python3 build-audio.py   ->  brag-output/work/audio/{music,sfx,mix}.wav

Music: happy-beats-business-moves-vol-12 (109.96 BPM, C major, calm and steady). The video
starts 1.0s into the track, so the bass entry lands on the restoration reveal (7.745s) and
the fuller section on "Evidence Before Recommendation" (16.475s). At 25.177s it cuts,
attack to attack, into the track's last build bar, so the closing C major hit lands on the
end card (27.35s) and rings out under it.

Effects stay under the music: soft air on moves and slider wipes, mallet ticks on chord
tones of whatever bar they fall in, and a warm C major bloom under the final hit. They
share one small room reverb so they sit in the same space.
"""
from __future__ import annotations

import pathlib
import re
import subprocess

import numpy as np
from scipy import ndimage, signal
from scipy.io import wavfile

SR = 48000
DUR = 30.2
N = int(round(DUR * SR))
HERE = pathlib.Path(__file__).resolve().parent
TRACK = (HERE / '../../skills/brag/assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3').resolve()
OUT = HERE / 'brag-output' / 'work' / 'audio'

START = 1.0  # track time at video t=0
CUT_A = 26.177  # track time of the groove's downbeat attack; the cut lands just before it
CUT_B = 111.274  # track time of the final build bar's downbeat attack
XFADE = 0.015
TARGET_LUFS = -14.0
CEILING_DBTP = -1.2

rng = np.random.default_rng(20260928)


# ---------- music ----------

def load_track() -> np.ndarray:
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(TRACK), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def music_edit() -> np.ndarray:
    x = load_track()
    cut = int(round((CUT_A - START) * SR))
    xf = int(round(XFADE * SR))
    a0 = int(round(START * SR))
    out = np.zeros((N, 2))
    out[:cut] = x[a0:a0 + cut]
    ramp = np.linspace(0, np.pi / 2, xf)
    out[cut - xf:cut] *= np.cos(ramp)[:, None]
    b0 = int(round(CUT_B * SR)) - xf
    tail = x[b0:b0 + N - (cut - xf)].copy()
    tail[:xf] *= np.sin(ramp)[:, None]
    out[cut - xf:cut - xf + len(tail)] += tail
    # The track is mid-bar at 1.0s: a short fade avoids a click on the first frame.
    fin = int(0.06 * SR)
    out[:fin] *= (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, fin)))[:, None]
    return out


# ---------- synthesis helpers ----------

def ease(kind: str, u):
    u = np.clip(u, 0.0, 1.0)
    if kind == 'inOutCubic':
        return np.where(u < 0.5, 4 * u ** 3, 1 - (-2 * u + 2) ** 3 / 2)
    if kind == 'outQuart':
        return 1 - (1 - u) ** 4
    raise ValueError(kind)


def speed(kind: str, u):
    """Normalized |d ease / du| (peak 1), so a sound follows the on-screen motion."""
    u = np.clip(u, 0.0, 1.0)
    if kind == 'inOutCubic':
        return np.where(u < 0.5, 12 * u ** 2, 12 * (1 - u) ** 2) / 3
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
    return [
        # (start of the on-screen move, sound, level dB, reverb send)
        (3.00, air(0.42, 'inOutCubic', 320, 2600, pan=(0.55, -0.55)), D(-32), 0.12),  # hook -> reveal swipe, right to left
        (3.42, air(1.00, 'inOutCubic', 280, 1500, width=0.6, pan=(-0.6, 0.6)), D(-35), 0.1),  # slider wipe
        (6.27, mallet([523.25, 880.00], decay=0.14), D(-24), 0.3),  # "System Restoration" lights up (C5+A5 over F)
        (7.25, air(0.46, 'inOutCubic', 700, 2400, sweep='down', pan=(0.1, -0.3)), D(-34), 0.12),  # row becomes the label
        (8.15, air(0.90, 'inOutCubic', 280, 1500, width=0.6, pan=(-0.6, 0.6)), D(-35), 0.1),
        (10.30, air(0.90, 'inOutCubic', 280, 1500, width=0.6, pan=(-0.6, 0.6)), D(-35), 0.1),
        (12.45, air(0.90, 'inOutCubic', 280, 1500, width=0.6, pan=(-0.6, 0.6)), D(-35), 0.1),
        (14.55, air(0.90, 'inOutCubic', 280, 1500, width=0.6, pan=(-0.6, 0.6)), D(-36), 0.1),
        (14.30, mallet([523.25]), D(-24), 0.3),  # checklist ticks rise C5 E5 A5 (Am -> F bar)
        (14.58, mallet([659.25]), D(-24), 0.3),
        (14.86, mallet([880.00]), D(-25), 0.3),
        (16.25, air(0.36, 'inOutCubic', 260, 3000, width=0.85, pan=(-0.7, 0.7), body=0.35), D(-28), 0.14),  # brand wipe
        (17.02, mallet([783.99], decay=0.09), D(-23), 0.35),  # frame locks on the blower wheel (G5 over C)
        (20.00, swell(0.5, 300, 1400), D(-34), 0.2),  # into the statement card
        (23.90, air(0.36, 'inOutCubic', 260, 3000, width=0.85, pan=(-0.7, 0.7), body=0.35), D(-28), 0.14),  # brand wipe
        (24.78, mallet([783.99]), D(-23), 0.3),  # invitation checks G5 -> C6 (C bar)
        (25.02, mallet([1046.50]), D(-24), 0.3),
        (27.36, bloom(), D(-25), 0.45),  # under the final hit, end card
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

    # Report how far the effects sit under the music around each cue.
    print(f'music edit: {len(music) / SR:.3f}s, cut at {CUT_A - START:.3f}s video time')
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

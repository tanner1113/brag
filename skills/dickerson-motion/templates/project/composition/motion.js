// Pure helpers for seek(t): no clocks and no unseeded randomness, so every frame renders the same.

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, p) => a + (b - a) * p;

export const ease = {
  linear: (p) => p,
  inCubic: (p) => p ** 3,
  outCubic: (p) => 1 - (1 - p) ** 3,
  inOutCubic: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
  outQuart: (p) => 1 - (1 - p) ** 4,
  inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
};

// Eased 0-1 progress of a move that starts at `start` and lasts `dur` seconds.
export const progress = (t, start, dur, e = ease.outCubic) => e(clamp((t - start) / dur));

// Seeded random numbers (mulberry32): the same seed gives the same sequence on every render.
export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A fixed value in [0, 1) for each (seed, integer) pair.
export const hash = (seed, i) => rng(Math.imul(seed | 0, 374761393) ^ Math.imul(i | 0, 668265263))();

// Smooth 1-D value noise in [-1, 1]. noise(seed, t * speed) gives drift that looks handheld
// but is identical on every render. Seed grain by frame number: noise(seed, Math.round(t * fps)).
export function noise(seed, x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(seed, i), hash(seed, i + 1), u) * 2 - 1;
}

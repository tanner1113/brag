// When everything happens, in video seconds. Scene changes and moves sit on measured beats from
// work/beats.json (docs/shotlist.md). Pure, so the tests can check the timing without a browser.
import { ease, progress } from './motion.js';

export const DURATION = 29.6;
export const FPS = 30;

export const T = {
  swipe: 3.265, sweep2: 3.784, paths: 5.445, highlight: 6.524, rise: 7.2,
  s4a: 7.621, sweep4a: 8.156, s4b: 9.807, sweep4b: 10.335, s4c: 11.987, split4c: 12.515,
  s4d: 14.169, rows4d: [14.169, 14.442, 14.715], sweep4d: 15.789,
  s5a: 18.528, sentence5a: 19.071, s5b: 22.337, line2: 22.9, end: 25.086,
  // End card. The badge sets off once the wipe's trailing edge has cleared its path; the rest
  // lands on the beat grid after the final hit (the track has no more attacks to measure).
  travel: 25.2, offer: 25.2, checks: [25.632, 25.904], button: 26.177, url: 26.45,
};
export const SWEEP = 1.0;
export const SPLIT = 0.8;
export const TRAVEL = 0.5;
export const WIPE = 0.46;
export const WIPES = [T.s5a, T.end]; // full cover lands on these downbeats

// The brand wipe crosses the content area left to right, covering it fully at each WIPES time.
// Returns the covered span as fractions of the content width, or null when no wipe is on.
export function wipeSpan(t) {
  for (const mid of WIPES) {
    const lead = progress(t, mid - WIPE / 2, WIPE / 2, ease.inOutCubic);
    const trail = progress(t, mid, WIPE / 2, ease.inOutCubic);
    if (lead > 0 && trail < 1) return { from: trail, to: lead };
  }
  return null;
}

// The badge's travel from the header band into the end card logo, 0 to 1.
export const travel = (t) => progress(t, T.travel, TRAVEL, ease.inOutCubic);

// When a block of n lines should start leaving so its last line is gone before a cut at `cut`
// (lines leave 0.04 s apart and take 0.25 s each).
export const outBefore = (cut, n) => cut - 0.25 - 0.04 * (n - 1) - 0.05;

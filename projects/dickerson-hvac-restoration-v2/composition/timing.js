// When everything happens, in video seconds. Scene changes and moves sit on measured beats from
// work/beats.json (docs/shotlist.md). Pure, so the tests can check the timing without a browser.
import { ease, progress } from './motion.js';

export const DURATION = 29.6;
export const FPS = 30;

export const T = {
  punch: 1.079, swipe: 2.69, sweep2: 3.784, paths: 5.445, highlight: 6.524, rise: 7.2,
  s4a: 7.621, sweep4a: 8.156, s4b: 9.807, sweep4b: 10.335, s4c: 11.987, split4c: 12.515,
  s4d: 14.169, rows4d: [14.169, 14.442, 14.715], sweep4d: 15.789,
  // The 5a sentence follows straight on from its headline (not a beat) to leave it ~0.3 s a word.
  s5a: 18.528, sentence5a: 18.83,
  // 5b: two lines on the beat, two on the half-beat, and the red lands on the build downbeat.
  s5b: 22.337, half5b: 22.618, flip5b: 22.9,
  // End card: a hard cut on the track's final hit. The rest lands on the beat grid after it
  // (the track has no more attacks to measure).
  end: 25.086, travel: 25.086, checks: [25.632, 25.904], button: 26.177, url: 26.45,
};
// Text that arrives on a cut starts rising this much earlier and shows from the cut, so the first
// frame after the cut already has it moving (a cut on action) instead of an empty text area.
export const PRE = 0.07;
export const SWEEP = 1.3;
export const SWEEP_4D = 1.4;
export const SPLIT = 0.8;
export const PUSH = 0.42;
export const TRAVEL = 0.5;
export const WIPE = 0.46;
export const WIPES = [T.s5a]; // full cover lands on this downbeat

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

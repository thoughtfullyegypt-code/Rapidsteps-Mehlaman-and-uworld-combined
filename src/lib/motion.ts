// lib/motion.ts — Easing curves, reduced-motion helpers, spring params

export const EASINGS = {
  standard:   'cubic-bezier(0.16, 1, 0.3, 1)',
  spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
  emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  exit:       'cubic-bezier(0.3, 0, 0.8, 0.15)',
  linear:     'linear',
} as const;

export const DURATIONS = {
  hover:          150,  // ms
  press:          90,   // ms
  focusRing:      0,    // instant
  paneRoute:      240,  // ms
  modalEnter:     320,  // ms
  modalExit:      200,  // ms
  accordionOpen:  480,  // ms
  accordionClose: 360,  // ms
  heroWord:       28,   // ms per word stagger
  heroChar:       22,   // ms per char stagger
  counter:        1200, // ms total for counter animation
  cursorDot:      60,   // ms lerp target
  cursorRing:     130,  // ms lerp target
  nodeFlight:     900,  // ms map focus-animate
} as const;

/** Returns true when prefers-reduced-motion is active */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Returns true on coarse-pointer (touch) devices — no custom cursor */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Lerp helper (cursor smoothing) */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

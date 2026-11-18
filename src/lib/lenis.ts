// lib/lenis.ts — Smooth scroll init / destroy
// Lenis is used only on marketing pages; not in /app/

import type Lenis from '@studio-freight/lenis';

let instance: Lenis | null = null;
let rafId: number | null = null;

export async function initLenis(): Promise<void> {
  const { default: LenisClass } = await import('@studio-freight/lenis');
  instance = new LenisClass({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.0,
  });

  function raf(time: number) {
    instance!.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  // Integrate with GSAP ScrollTrigger if loaded
  if ((window as any).ScrollTrigger) {
    instance.on('scroll', (window as any).ScrollTrigger.update);
  }
}

export function destroyLenis(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  instance?.destroy();
  instance = null;
}

export function getLenis(): Lenis | null {
  return instance;
}

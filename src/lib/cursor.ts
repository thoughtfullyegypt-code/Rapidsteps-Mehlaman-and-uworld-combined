// lib/cursor.ts — Custom two-layer cursor with morphs
// Only active on fine-pointer devices (no touch)

import { lerp, isCoarsePointer, prefersReducedMotion } from './motion';

interface CursorState {
  dot:  { x: number; y: number };
  ring: { x: number; y: number };
  target: { x: number; y: number };
  rafId: number | null;
  el: { dot: HTMLElement; ring: HTMLElement } | null;
  label: HTMLElement | null;
  active: boolean;
  currentLabel: string;
}

const state: CursorState = {
  dot:    { x: 0, y: 0 },
  ring:   { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  rafId:  null,
  el:     null,
  label:  null,
  active: false,
  currentLabel: '',
};

// Lerp speeds (higher = faster / tighter)
const DOT_SPEED  = 0.85; // near-instant, glued
const RING_SPEED = 0.12; // lags, shows the tail

export function initCursor(): () => void {
  if (isCoarsePointer() || prefersReducedMotion()) return () => {};

  // Build DOM
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  const lbl  = document.createElement('span');

  dot.id  = 'rs-cursor-dot';
  ring.id = 'rs-cursor-ring';
  lbl.id  = 'rs-cursor-label';

  dot.style.cssText = `
    position: fixed; top: 0; left: 0; width: 8px; height: 8px;
    border-radius: 50%; background: #FF8C1A; pointer-events: none;
    z-index: 99999; transform: translate(-50%, -50%);
    mix-blend-mode: normal; transition: transform 0.08s ease, background 0.15s ease, width 0.15s ease, height 0.15s ease;
    will-change: transform;
  `;

  ring.style.cssText = `
    position: fixed; top: 0; left: 0; width: 36px; height: 36px;
    border-radius: 50%; border: 1.5px solid rgba(255,140,26,0.6);
    pointer-events: none; z-index: 99998; transform: translate(-50%, -50%);
    transition: transform 0.1s ease, border-color 0.15s ease, width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1);
    will-change: transform;
  `;

  lbl.style.cssText = `
    position: fixed; top: -20px; left: 50%; transform: translateX(-50%);
    white-space: nowrap; font-size: 11px; font-weight: 700;
    color: #0F172A; background: #FF8C1A; padding: 2px 8px;
    border-radius: 4px; opacity: 0; transition: opacity 0.15s ease;
    pointer-events: none;
  `;

  ring.appendChild(lbl);
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('cursor-custom');

  state.el    = { dot, ring };
  state.label = lbl;
  state.active = true;

  // Mouse tracking
  const onMouseMove = (e: MouseEvent) => {
    state.target.x = e.clientX;
    state.target.y = e.clientY;
  };

  // Morph on interactive elements
  const MORPHS: Array<{ sel: string; label: string; scale: number }> = [
    { sel: 'a, button, [role="button"]',          label: '', scale: 1.6 },
    { sel: '.magnetic-btn, .price-card',           label: 'Open', scale: 2.2 },
    { sel: '[data-cursor-label]',                  label: '', scale: 2.0 },
    { sel: 'input, textarea',                      label: '', scale: 0.5 },
  ];

  const onMouseOver = (e: MouseEvent) => {
    if (!state.el) return;
    for (const { sel, label, scale } of MORPHS) {
      if ((e.target as Element)?.closest(sel)) {
        const el = (e.target as Element).closest('[data-cursor-label]');
        const lText = el?.getAttribute('data-cursor-label') ?? label;
        morphCursor(scale, lText);
        return;
      }
    }
    morphCursor(1, '');
  };

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseover', onMouseOver, { passive: true });

  // Press feedback
  const onMouseDown = () => {
    if (!state.el) return;
    state.el.dot.style.transform = 'translate(-50%, -50%) scale(0.75)';
  };
  const onMouseUp = () => {
    if (!state.el) return;
    state.el.dot.style.transform = 'translate(-50%, -50%) scale(1)';
  };

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);

  // Animation loop
  const tick = () => {
    if (!state.el) return;

    state.dot.x  = lerp(state.dot.x,  state.target.x, DOT_SPEED);
    state.dot.y  = lerp(state.dot.y,  state.target.y, DOT_SPEED);
    state.ring.x = lerp(state.ring.x, state.target.x, RING_SPEED);
    state.ring.y = lerp(state.ring.y, state.target.y, RING_SPEED);

    state.el.dot.style.left  = `${state.dot.x}px`;
    state.el.dot.style.top   = `${state.dot.y}px`;
    state.el.ring.style.left = `${state.ring.x}px`;
    state.el.ring.style.top  = `${state.ring.y}px`;

    state.rafId = requestAnimationFrame(tick);
  };
  state.rafId = requestAnimationFrame(tick);

  // Cleanup
  return () => {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    dot.remove();
    ring.remove();
    document.body.classList.remove('cursor-custom');
    state.active = false;
  };
}

function morphCursor(scale: number, label: string) {
  if (!state.el) return;
  const size = 36 * scale;
  state.el.ring.style.width  = `${size}px`;
  state.el.ring.style.height = `${size}px`;
  if (state.label) {
    state.label.textContent = label;
    state.label.style.opacity = label ? '1' : '0';
  }
}

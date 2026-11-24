import React from 'react';
import { IconX } from '@/components/icons/Icons';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'J / →', desc: 'Next case or drill item' },
  { key: 'K / ←', desc: 'Previous case or drill item' },
  { key: 'L / Enter', desc: 'Reveal diagnosis (Active Recall)' },
  { key: 'M', desc: 'Toggle Mark as Mastered' },
  { key: 'B', desc: 'Bookmark / Unbookmark case' },
  { key: 'X', desc: 'Flag case for later review' },
  { key: 'F', desc: 'Toggle Distraction-Free Focus Mode' },
  { key: '/', desc: 'Quick focus search bar' },
  { key: '1 – 4 / A – D', desc: 'Select drill multiple-choice option' },
  { key: 'Esc', desc: 'Close dialog, sheet, or exit focus mode' },
  { key: '?', desc: 'Show this shortcuts cheatsheet' },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-light dark:bg-orange-DEFAULT/20 text-orange-rust dark:text-orange-DEFAULT">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
              </svg>
            </span>
            <h2 className="text-lg font-bold font-display text-navy-DEFAULT dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-white/5 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="font-mono text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 text-navy-DEFAULT dark:text-orange-DEFAULT shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/10 text-center">
          <p className="text-xs text-slate-400">
            Press <kbd className="font-mono font-bold">Esc</kbd> at any time to close overlays.
          </p>
        </div>
      </div>
    </div>
  );
}

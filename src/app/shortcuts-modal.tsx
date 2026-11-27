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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050814]/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0B1120] border border-[#E2E6EE] dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden p-6 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E6EE] dark:border-white/[0.08] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FFF4E5] dark:bg-orange-DEFAULT/20 text-[#C2550A] dark:text-orange-DEFAULT">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
              </svg>
            </span>
            <h2 className="text-lg font-bold font-display text-[#0D1321] dark:text-white">
              Keyboard shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:text-[#0D1321] dark:hover:text-white hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
            aria-label="Close shortcuts modal"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="divide-y divide-[#E2E6EE] dark:divide-white/10 border-y border-[#E2E6EE] dark:border-white/[0.08] max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 px-1 text-[15px]"
            >
              <span className="text-[#0D1321] dark:text-slate-200 font-medium">{sc.desc}</span>
              <kbd className="rs-kbd text-[12px] font-semibold px-2.5 py-1 h-auto">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <p className="text-[13px] text-[#475569] dark:text-slate-400">
            Press <kbd className="rs-kbd">Esc</kbd> at any time to close overlays.
          </p>
        </div>
      </div>
    </div>
  );
}

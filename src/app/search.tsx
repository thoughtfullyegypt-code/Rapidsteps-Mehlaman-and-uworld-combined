import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DEMO_CASES } from '@/lib/catalog';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import { SystemIcon } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  systemId: string;
  systemBadge: string;
  buzzword: string;
  score: number;
}

export default function SearchModal({ isOpen, onClose, onSelectCase }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [sysFilter, setSysFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setQuery('');
      setSysFilter('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const scored: SearchResult[] = [];
    const seenIds = new Set<string>();

    // Search all 1,609 topics across all 16 Organ Systems fairly
    for (const sys of ATLAS_MANIFEST.systems) {
      if (sysFilter !== 'all' && sys.systemId !== sysFilter) continue;
      const chMap = new Map(sys.chapters.map((c) => [c.id, c]));

      for (const t of sys.topics) {
        const tl = t.title.toLowerCase();
        const sl = t.summary.toLowerCase();
        let score = 0;

        if (tl === trimmed) {
          score = 100;
        } else if (tl.startsWith(trimmed)) {
          score = 85;
        } else if (tl.includes(` ${trimmed}`) || tl.includes(`(${trimmed}`)) {
          score = 72;
        } else if (tl.includes(trimmed)) {
          score = 58;
        } else if (sl.includes(trimmed)) {
          score = 32;
        }

        if (score > 0) {
          const ch = chMap.get(t.chapterId);
          seenIds.add(t.id);
          scored.push({
            id: t.id,
            title: t.title,
            systemId: sys.systemId,
            systemBadge: `${sys.short} · Ch ${ch?.num ?? '01'}`,
            buzzword: t.summary,
            score,
          });
        }
      }
    }

    // Include classic vignettes if not already matched
    Object.values(DEMO_CASES).forEach((c) => {
      if (seenIds.has(c.id)) return;
      if (sysFilter !== 'all' && c.systemId !== sysFilter) return;
      const dl = c.diagnosis.toLowerCase();
      const bl = c.buzzword.toLowerCase();
      let score = 0;
      if (dl.startsWith(trimmed)) score = 80;
      else if (dl.includes(trimmed)) score = 55;
      else if (bl.includes(trimmed)) score = 35;

      if (score > 0) {
        scored.push({
          id: c.id,
          title: c.diagnosis,
          systemId: c.systemId,
          systemBadge: c.systemName,
          buzzword: c.buzzword,
          score,
        });
      }
    });

    scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return scored.slice(0, 24);
  }, [query, sysFilter]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectCase(results[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search Step 1 Atlas"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden rs-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-white/10">
          <svg
            className="w-4 h-4 text-slate-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search ${ATLAS_MANIFEST.totals.topics.toLocaleString()} topics across all 16 systems…`}
            aria-label="Search Step 1 Atlas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-3.5 px-3 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <kbd className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-400">
            Esc
          </kbd>
        </div>

        {/* Compact Organ System Filter Strip */}
        <div className="px-3 py-1.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-navy-950/50">
          <div className="rs-pill-strip flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSysFilter('all')}
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors',
                sysFilter === 'all'
                  ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
              )}
            >
              All 16
            </button>
            {ATLAS_MANIFEST.systems.map((sys) => (
              <button
                key={sys.systemId}
                type="button"
                onClick={() => setSysFilter(sys.systemId)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors inline-flex items-center gap-1',
                  sysFilter === sys.systemId
                    ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                )}
              >
                <span>{sys.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-1.5">
          {results.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {results.map((r, idx) => (
                <div
                  key={`${r.id}-${idx}`}
                  onClick={() => {
                    onSelectCase(r.id);
                    onClose();
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                    idx === selectedIndex
                      ? 'bg-slate-100 dark:bg-white/10 text-navy-DEFAULT dark:text-orange-DEFAULT'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                  )}
                >
                  <div className="min-w-0 pr-3 flex items-start gap-2.5">
                    <span className="mt-0.5 text-navy-DEFAULT dark:text-orange-DEFAULT shrink-0">
                      <SystemIcon systemId={r.systemId} size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                        <span className="truncate">{r.title}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 flex-shrink-0">
                          {r.systemBadge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {r.buzzword}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 flex-shrink-0">→</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-xs text-slate-500">
              {query.trim()
                ? 'No matching topics found.'
                : `Type any disease, nerve, microbe, drug, enzyme, or buzzword across ${ATLAS_MANIFEST.totals.topics.toLocaleString()} Step 1 topics…`}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="rs-kbd">↑</span>
              <span className="rs-kbd">↓</span> navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="rs-kbd">↵</span> open
            </span>
            <span className="flex items-center gap-1">
              <span className="rs-kbd">esc</span> close
            </span>
          </div>
          {results.length > 0 && <span className="font-mono">{results.length} matches</span>}
        </div>
      </div>
    </div>
  );
}

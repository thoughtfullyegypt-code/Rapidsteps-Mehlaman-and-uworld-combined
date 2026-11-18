import React, { useState, useEffect, useRef } from 'react';
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
}

export default function SearchModal({ isOpen, onClose, onSelectCase }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const titleHits: SearchResult[] = [];
    const summaryHits: SearchResult[] = [];

    // 1. Search all topics across all 16 Organ Systems
    for (const sys of ATLAS_MANIFEST.systems) {
      const chMap = new Map(sys.chapters.map((c) => [c.id, c]));
      for (const t of sys.topics) {
        const tl = t.title.toLowerCase();
        const sl = t.summary.toLowerCase();
        const ch = chMap.get(t.chapterId);
        if (tl.includes(trimmed)) {
          titleHits.push({
            id: t.id,
            title: t.title,
            systemId: sys.systemId,
            systemBadge: `${sys.short} · Ch ${ch?.num ?? '01'}`,
            buzzword: t.summary,
          });
        } else if (sl.includes(trimmed) && summaryHits.length < 20) {
          summaryHits.push({
            id: t.id,
            title: t.title,
            systemId: sys.systemId,
            systemBadge: `${sys.short} · Ch ${ch?.num ?? '01'}`,
            buzzword: t.summary,
          });
        }
        if (titleHits.length >= 16) break;
      }
      if (titleHits.length >= 16) break;
    }

    // 2. Also include matching classic vignettes
    Object.values(DEMO_CASES).forEach((c) => {
      if (
        c.diagnosis.toLowerCase().includes(trimmed) ||
        c.buzzword.toLowerCase().includes(trimmed)
      ) {
        titleHits.push({
          id: c.id,
          title: c.diagnosis,
          systemId: c.systemId,
          systemBadge: c.systemName,
          buzzword: c.buzzword,
        });
      }
    });

    setResults([...titleHits, ...summaryHits].slice(0, 16));
    setSelectedIndex(0);
  }, [query]);

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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/70 backdrop-blur-sm"
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
          <svg className="w-5 h-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search ${ATLAS_MANIFEST.totals.topics.toLocaleString()} topics across all 16 organ systems… [/]`}
            aria-label="Search Step 1 Atlas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-4 px-3 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 text-sm"
          />
          <kbd className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-400">
            Esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((r, idx) => (
                <div
                  key={`${r.id}-${idx}`}
                  onClick={() => {
                    onSelectCase(r.id);
                    onClose();
                  }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors',
                    idx === selectedIndex
                      ? 'bg-orange-light dark:bg-orange-DEFAULT/20 text-navy-DEFAULT dark:text-orange-DEFAULT'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                  )}
                >
                  <div className="min-w-0 pr-3 flex items-start gap-2.5">
                    <span className="mt-0.5 text-navy-DEFAULT dark:text-orange-DEFAULT shrink-0">
                      <SystemIcon systemId={r.systemId} size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span className="truncate">{r.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                          {r.systemBadge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {r.buzzword}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-rust dark:text-orange-DEFAULT flex-shrink-0">
                    Open →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-sm text-slate-500">
              {query.trim()
                ? 'No matching topics found.'
                : `Type any disease, nerve, microbe, drug, enzyme, or buzzword across ${ATLAS_MANIFEST.totals.topics.toLocaleString()} Step 1 topics…`}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/10 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="rs-kbd">↑</span><span className="rs-kbd">↓</span> navigate</span>
          <span className="flex items-center gap-1"><span className="rs-kbd">↵</span> open</span>
          <span className="flex items-center gap-1"><span className="rs-kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DEMO_CASES } from '@/lib/catalog';
import {
  ATLAS_MANIFEST,
  findTopicLocation,
  getManifestSystem,
  loadDecoderIndex,
  DecoderIndexPayload,
} from '@/lib/atlas-data';
import ScrollStrip from '@/components/ScrollStrip';
import { SystemIcon, IconCheck, IconBookmark } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
  recentTopics?: string[];
  bookmarks?: Set<string>;
  masteredCases?: Set<string>;
}

interface SearchResult {
  id: string;
  title: string;
  systemId: string;
  systemBadge: string;
  buzzword: string;
  matchTag?: 'Pearl Match' | 'Vignette';
  score: number;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectCase,
  recentTopics = [],
  bookmarks,
  masteredCases,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [sysFilter, setSysFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [decoderIndex, setDecoderIndex] = useState<DecoderIndexPayload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setQuery('');
      setSysFilter('all');
      setSelectedIndex(0);

      let cancelled = false;
      loadDecoderIndex()
        .then((idx) => {
          if (!cancelled) setDecoderIndex(idx);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const tokens = trimmed.split(/\s+/).filter((w) => w.length >= 2);
    const scored = new Map<string, SearchResult>();

    // 1. Instant search across all 1,609 topics (multi-word across title + chapter + summary)
    for (const sys of ATLAS_MANIFEST.systems) {
      if (sysFilter !== 'all' && sys.systemId !== sysFilter) continue;
      const chMap = new Map(sys.chapters.map((c) => [c.id, c]));

      for (const t of sys.topics) {
        const ch = chMap.get(t.chapterId);
        const tl = t.title.toLowerCase();
        const cl = (ch?.title || '').toLowerCase();
        const sl = t.summary.toLowerCase();
        let score = 0;

        if (tl === trimmed) {
          score = 100;
        } else if (tl.startsWith(trimmed)) {
          score = 88;
        } else if (tl.includes(` ${trimmed}`) || tl.includes(`(${trimmed}`)) {
          score = 76;
        } else if (tl.includes(trimmed)) {
          score = 64;
        } else if (tokens.length > 1 && tokens.every((tok) => tl.includes(tok))) {
          score = 60;
        } else if (sl.includes(trimmed) || cl.includes(trimmed)) {
          score = 40;
        } else if (
          tokens.length > 0 &&
          tokens.every((tok) => tl.includes(tok) || cl.includes(tok) || sl.includes(tok))
        ) {
          score = 34;
        }

        if (score > 0) {
          scored.set(t.id, {
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

    // 2. Classic vignettes
    Object.values(DEMO_CASES).forEach((c) => {
      if (scored.has(c.id)) return;
      if (sysFilter !== 'all' && c.systemId !== sysFilter) return;
      const dl = c.diagnosis.toLowerCase();
      const bl = c.buzzword.toLowerCase();
      let score = 0;
      if (dl.startsWith(trimmed)) score = 82;
      else if (dl.includes(trimmed)) score = 58;
      else if (bl.includes(trimmed)) score = 38;

      if (score > 0) {
        scored.set(c.id, {
          id: c.id,
          title: c.diagnosis,
          systemId: c.systemId,
          systemBadge: c.systemName,
          buzzword: c.buzzword,
          score,
        });
      }
    });

    // 3. Full-corpus Pearl, Keyword & Vignette matching via lazily loaded decoder index
    if (decoderIndex) {
      const searchTokens = tokens.length > 0 ? tokens : [trimmed];

      for (const dt of decoderIndex.topics) {
        if (sysFilter !== 'all' && dt.sys !== sysFilter) continue;

        let kwScore = 0;
        let pearlHit = '';
        for (const p of dt.pearls) {
          const pl = p.toLowerCase();
          if (pl.includes(trimmed)) {
            kwScore = Math.max(kwScore, 54);
            pearlHit = p;
            break;
          }
          if (searchTokens.every((tok) => pl.includes(tok))) {
            kwScore = Math.max(kwScore, 44);
            if (!pearlHit) pearlHit = p;
          }
        }

        if (kwScore === 0) {
          for (const tok of searchTokens) {
            if (dt.kw[tok] !== undefined) {
              kwScore += dt.kw[tok] * 2.5;
            } else if (tok.length >= 4) {
              for (const [k, w] of Object.entries(dt.kw)) {
                if (k.includes(tok)) {
                  kwScore += w * 1.4;
                  break;
                }
              }
            }
          }
          if (kwScore > 0) kwScore = Math.min(52, 24 + kwScore);
        }

        if (kwScore > 0) {
          const existing = scored.get(dt.id);
          if (!existing || kwScore > existing.score) {
            scored.set(dt.id, {
              id: dt.id,
              title: dt.title,
              systemId: dt.sys,
              systemBadge: `${dt.sysShort} · ${dt.ch}`,
              buzzword: pearlHit || dt.pearls[0] || dt.summary,
              matchTag: existing ? undefined : 'Pearl Match',
              score: existing ? Math.max(existing.score, kwScore) : kwScore,
            });
          }
        }
      }

      if (trimmed.length >= 3) {
        let vigCount = 0;
        for (const v of decoderIndex.vignettes) {
          if (sysFilter !== 'all' && v.sys !== sysFilter) continue;
          const ql = v.q.toLowerCase();
          const al = v.a.toLowerCase();
          const matched =
            ql.includes(trimmed) ||
            al.includes(trimmed) ||
            (searchTokens.length > 1 &&
              searchTokens.every((tok) => ql.includes(tok) || al.includes(tok)));
          if (!matched) continue;

          const targetId =
            v.topicId || getManifestSystem(v.sys)?.topics[0]?.id;
          if (!targetId) continue;

          if (!scored.has(v.id)) {
            scored.set(v.id, {
              id: targetId,
              title: v.q.length > 96 ? `${v.q.slice(0, 96)}…` : v.q,
              systemId: v.sys,
              systemBadge: `${v.sysShort} Q&A`,
              buzzword: `→ ${v.a}`,
              matchTag: 'Vignette',
              score: ql.includes(trimmed) ? 46 : 36,
            });
            vigCount += 1;
            if (vigCount >= 6) break;
          }
        }
      }
    }

    const list = Array.from(scored.values());
    list.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return list.slice(0, 24);
  }, [query, sysFilter, decoderIndex]);

  // Empty-query quick suggestions (Recent + Bookmarks)
  const quickSuggestions = useMemo(() => {
    if (query.trim()) return [];
    const out: Array<SearchResult & { group: 'recent' | 'bookmark' }> = [];
    const seen = new Set<string>();

    for (const id of recentTopics.slice(0, 6)) {
      const loc = findTopicLocation(id);
      if (!loc) continue;
      if (sysFilter !== 'all' && loc.systemId !== sysFilter) continue;
      seen.add(id);
      out.push({
        id,
        title: loc.stub.title,
        systemId: loc.systemId,
        systemBadge: `${loc.systemShort} · Ch ${loc.chapter?.num ?? '01'}`,
        buzzword: loc.stub.summary,
        score: 100,
        group: 'recent',
      });
    }

    if (bookmarks) {
      for (const id of Array.from(bookmarks)) {
        if (seen.has(id)) continue;
        const loc = findTopicLocation(id);
        if (!loc) continue;
        if (sysFilter !== 'all' && loc.systemId !== sysFilter) continue;
        out.push({
          id,
          title: loc.stub.title,
          systemId: loc.systemId,
          systemBadge: `${loc.systemShort} · Ch ${loc.chapter?.num ?? '01'}`,
          buzzword: loc.stub.summary,
          score: 90,
          group: 'bookmark',
        });
        if (out.length >= 12) break;
      }
    }
    return out;
  }, [query, recentTopics, bookmarks, sysFilter]);

  const navigableList = query.trim() ? results : quickSuggestions;

  useEffect(() => {
    setSelectedIndex(0);
  }, [results, query, sysFilter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (navigableList.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (navigableList.length || 1)) % (navigableList.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (navigableList[selectedIndex]) {
        onSelectCase(navigableList[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-16 px-4 bg-navy-950/70 backdrop-blur-sm"
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
            placeholder="Search topics, pearls & buzzwords (e.g. psammoma, Heinz)…"
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
          <ScrollStrip innerClassName="gap-1" ariaLabel="Filter search by organ system">
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
          </ScrollStrip>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-1.5">
          {query.trim() ? (
            results.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {results.map((r, idx) => (
                  <div
                    key={`${r.id}-${r.matchTag || 't'}-${idx}`}
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
                    <div className="min-w-0 pr-3 flex items-start gap-2.5 flex-1">
                      <span className="mt-0.5 text-navy-DEFAULT dark:text-orange-DEFAULT shrink-0">
                        <SystemIcon systemId={r.systemId} size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-full">{r.title}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 flex-shrink-0">
                            {r.systemBadge}
                          </span>
                          {r.matchTag && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100/80 dark:bg-amber-950/50 text-orange-rust dark:text-orange-DEFAULT flex-shrink-0">
                              {r.matchTag}
                            </span>
                          )}
                          {masteredCases?.has(r.id) && (
                            <IconCheck size={11} className="text-emerald-500 shrink-0" />
                          )}
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
                No matching topics, pearls, or vignettes found.
              </div>
            )
          ) : quickSuggestions.length > 0 ? (
            <div className="space-y-1 p-1">
              <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Recent &amp; Bookmarked Topics</span>
                <span>{quickSuggestions.length}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {quickSuggestions.map((r, idx) => (
                  <div
                    key={`${r.group}-${r.id}`}
                    onClick={() => {
                      onSelectCase(r.id);
                      onClose();
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
                      idx === selectedIndex
                        ? 'bg-slate-100 dark:bg-white/10 text-navy-DEFAULT dark:text-orange-DEFAULT'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                    )}
                  >
                    <div className="min-w-0 pr-3 flex items-center gap-2.5 flex-1">
                      <span className="text-navy-DEFAULT dark:text-orange-DEFAULT shrink-0">
                        {r.group === 'bookmark' ? (
                          <IconBookmark size={14} filled className="text-orange-DEFAULT" />
                        ) : (
                          <SystemIcon systemId={r.systemId} size={14} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span className="truncate">{r.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {r.systemBadge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {r.buzzword}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">→</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-xs text-slate-500">
              Type any disease, pearl, nerve, microbe, drug, enzyme, or buzzword across{' '}
              {ATLAS_MANIFEST.totals.topics.toLocaleString()} Step 1 topics &amp;{' '}
              {ATLAS_MANIFEST.totals.rapidFireQAs.toLocaleString()} vignettes…
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
          {query.trim() && results.length > 0 && (
            <span className="font-mono">{results.length} matches</span>
          )}
        </div>
      </div>
    </div>
  );
}

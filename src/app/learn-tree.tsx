import React, { useState } from 'react';
import { SYSTEMS } from '@/lib/catalog';
import { ATLAS_MANIFEST, ManifestSystem } from '@/lib/atlas-data';
import {
  SystemIcon,
  IconChevronDown,
  IconCheck,
  IconBookmark,
  IconFlag,
  IconVideo,
  IconImage,
  IconAtlas,
} from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface LearnTreeProps {
  onSelectCase: (caseId: string) => void;
  selectedCaseId: string | null;
  masteredCases: Set<string>;
  bookmarks: Set<string>;
  flags: Set<string>;
  dueForReview: string[];
  onOpenCardioHub?: (systemId?: string) => void;
}

export default function LearnTree({
  onSelectCase,
  selectedCaseId,
  masteredCases,
  bookmarks,
  flags,
  onOpenCardioHub,
}: LearnTreeProps) {
  const [expandedSys, setExpandedSys] = useState<string>('cardio');
  const [expandedChapterBySys, setExpandedChapterBySys] = useState<Record<string, string>>({
    cardio: 'ch4-valvular',
  });
  const [filterBySys, setFilterBySys] = useState<Record<string, string>>({});

  const toggleExpand = (sysId: string) => {
    setExpandedSys((prev) => {
      const next = prev === sysId ? '' : sysId;
      if (next && !expandedChapterBySys[next]) {
        const ms = ATLAS_MANIFEST.systems.find((s) => s.systemId === next);
        if (ms && ms.chapters[0]) {
          setExpandedChapterBySys((chPrev) => ({ ...chPrev, [next]: ms.chapters[0].id }));
        }
      }
      return next;
    });
  };

  const { totals } = ATLAS_MANIFEST;

  return (
    <div className="h-full overflow-y-auto p-3 md:p-5 space-y-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold font-display text-navy-DEFAULT dark:text-white">
            16 Organ Systems · {totals.topics.toLocaleString()} Topics
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {totals.images.toLocaleString()} clinical figures · {totals.tables} tables · {totals.rapidFireQAs.toLocaleString()} Step 1 Q&amp;As
          </p>
        </div>
        {onOpenCardioHub && (
          <button
            type="button"
            onClick={() => onOpenCardioHub(expandedSys || 'cardio')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-DEFAULT to-[#FFA23F] text-navy-950 text-xs font-bold hover:shadow-sm transition-all inline-flex items-center gap-1.5"
          >
            <IconAtlas size={13} />
            <span>Open Atlas Hub →</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {ATLAS_MANIFEST.systems.map((ms: ManifestSystem) => {
          const sysStyle = SYSTEMS.find((s) => s.id === ms.systemId);
          const isExpanded = expandedSys === ms.systemId;
          const sysMastered = ms.topics.filter((t) => masteredCases.has(t.id)).length;
          const sysTotal = ms.stats.topics;
          const progressPct = sysTotal > 0 ? Math.round((sysMastered / sysTotal) * 100) : 0;
          const sysQuery = (filterBySys[ms.systemId] || '').trim().toLowerCase();
          const activeChId = expandedChapterBySys[ms.systemId] ?? ms.chapters[0]?.id ?? '';

          return (
            <div
              key={ms.systemId}
              className={cn(
                'rounded-xl border transition-all duration-200 overflow-hidden',
                isExpanded
                  ? 'border-navy-DEFAULT/30 dark:border-orange-DEFAULT/30 bg-white dark:bg-navy-900/80 shadow-sm'
                  : 'border-slate-200/70 dark:border-white/[0.07] bg-white/60 dark:bg-navy-900/30 hover:border-slate-300'
              )}
            >
              {/* System Header */}
              <button
                type="button"
                onClick={() => toggleExpand(ms.systemId)}
                className="w-full flex items-center justify-between p-3 text-left focus:outline-none group"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: sysStyle?.bgTint || '#EEF2FF',
                      color: sysStyle?.badgeText || '#1E2A8A',
                      border: `1px solid ${sysStyle?.borderTint || '#C7D2FE'}`,
                    }}
                  >
                    <SystemIcon systemId={ms.systemId} size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-[13px] text-navy-DEFAULT dark:text-white">
                        {ms.title}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                        {ms.stats.topics} topics
                      </span>
                      {ms.stats.totalImages > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                          {ms.stats.totalImages} figs
                        </span>
                      )}
                      {ms.stats.rapidFireQAs > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-DEFAULT/15 text-orange-rust dark:text-orange-DEFAULT">
                          {ms.stats.rapidFireQAs} Q&amp;As
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 rs-progress-bar">
                        <div
                          className={cn('rs-progress-fill', progressPct === 100 && 'complete')}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {sysMastered}/{sysTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <IconChevronDown
                  size={15}
                  className={cn(
                    'text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2',
                    isExpanded && 'rotate-180 text-navy-DEFAULT dark:text-orange-DEFAULT'
                  )}
                />
              </button>

              {/* ==================== EXPANDED SYSTEM CHAPTERS & TOPICS ==================== */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1.5 border-t border-slate-100 dark:border-white/5 space-y-2 rs-fade-in">
                  {/* Multimedia Studio Banner */}
                  {onOpenCardioHub && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#141C66] to-[#2A3FB5] text-white flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px]">
                        <div className="font-extrabold text-orange-DEFAULT uppercase tracking-wider text-[10px]">
                          {ms.short} Multimedia Atlas
                        </div>
                        <div className="font-semibold">
                          {ms.stats.chapters} Chapters · {ms.stats.totalImages} Figures
                          {ms.stats.videos > 0 ? ` · ${ms.stats.videos} Videos` : ''} · {ms.stats.rapidFireQAs} Q&amp;As
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenCardioHub(ms.systemId)}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-DEFAULT text-navy-950 font-bold text-[11px] hover:bg-orange-hover transition-colors whitespace-nowrap"
                      >
                        Open {ms.short} Hub →
                      </button>
                    </div>
                  )}

                  {/* Per-System Filter */}
                  <div className="relative">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="search"
                      value={filterBySys[ms.systemId] || ''}
                      onChange={(e) =>
                        setFilterBySys((prev) => ({ ...prev, [ms.systemId]: e.target.value }))
                      }
                      placeholder={`Filter ${ms.stats.topics} ${ms.short} topics…`}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT"
                    />
                  </div>

                  {/* Chapters Accordion */}
                  <div className="space-y-1.5">
                    {ms.chapters.map((ch) => {
                      const chTopics = ms.topics.filter(
                        (t) =>
                          t.chapterId === ch.id &&
                          (!sysQuery ||
                            t.title.toLowerCase().includes(sysQuery) ||
                            t.summary.toLowerCase().includes(sysQuery))
                      );
                      if (chTopics.length === 0) return null;
                      const chOpen = Boolean(sysQuery) || activeChId === ch.id;
                      const chMastered = chTopics.filter((t) => masteredCases.has(t.id)).length;

                      return (
                        <div
                          key={ch.id}
                          className="rounded-lg border border-slate-200/70 dark:border-white/[0.06] overflow-hidden bg-slate-50/40 dark:bg-navy-950/20"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedChapterBySys((prev) => ({
                                ...prev,
                                [ms.systemId]: prev[ms.systemId] === ch.id ? '' : ch.id,
                              }))
                            }
                            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-navy-DEFAULT text-white font-bold shrink-0">
                                {ch.num}
                              </span>
                              <span className="text-xs font-bold text-navy-DEFAULT dark:text-white truncate">
                                {ch.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-[10px] font-mono text-slate-400">
                                {chMastered}/{chTopics.length}
                              </span>
                              <IconChevronDown
                                size={12}
                                className={cn(
                                  'text-slate-400 transition-transform duration-150',
                                  chOpen && 'rotate-180'
                                )}
                              />
                            </div>
                          </button>

                          {chOpen && (
                            <div className="p-1.5 border-t border-slate-200/50 dark:border-white/[0.04] space-y-0.5 bg-white dark:bg-navy-900/40 rs-fade-in">
                              {chTopics.map((ct) => {
                                const isSel = selectedCaseId === ct.id;
                                const isMast = masteredCases.has(ct.id);
                                const isBm = bookmarks.has(ct.id);
                                const isFl = flags.has(ct.id);

                                return (
                                  <div
                                    key={ct.id}
                                    onClick={() => onSelectCase(ct.id)}
                                    className={cn(
                                      'rs-topic-card p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2',
                                      isSel
                                        ? 'bg-orange-light/60 dark:bg-orange-DEFAULT/15 border-orange-DEFAULT'
                                        : 'bg-slate-50/40 dark:bg-navy-950/30 border-transparent hover:border-slate-200 dark:hover:border-white/10'
                                    )}
                                  >
                                    <div className="min-w-0 flex items-center gap-2">
                                      <span
                                        className={cn(
                                          'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                                          isMast
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 dark:bg-navy-800 text-slate-400'
                                        )}
                                      >
                                        {isMast ? (
                                          <IconCheck size={10} />
                                        ) : (
                                          <span className="w-1 h-1 rounded-full bg-current" />
                                        )}
                                      </span>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                          {ct.title}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                          {ct.summary}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {isBm && <IconBookmark size={11} filled className="text-orange-DEFAULT" />}
                                      {isFl && <IconFlag size={11} filled className="text-red-500" />}
                                      {ct.videoCount > 0 && (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300">
                                          <IconVideo size={10} />
                                        </span>
                                      )}
                                      {ct.imageCount > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                                          <IconImage size={10} /> {ct.imageCount}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

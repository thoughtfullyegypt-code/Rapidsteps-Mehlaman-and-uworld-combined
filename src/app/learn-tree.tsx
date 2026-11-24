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
    <div className="h-full overflow-y-auto p-3 md:p-4 space-y-2">
      {/* Compact Header */}
      <div className="pb-2 mb-1 border-b border-slate-200/70 dark:border-white/[0.07] flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-extrabold font-display text-slate-900 dark:text-white">
            16 Organ Systems · {totals.topics.toLocaleString()} Topics
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {totals.images.toLocaleString()} figures · {totals.rapidFireQAs.toLocaleString()} Q&amp;As
          </p>
        </div>
        {onOpenCardioHub && (
          <button
            type="button"
            onClick={() => onOpenCardioHub(expandedSys || 'cardio')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200/80 dark:hover:bg-navy-700 text-navy-DEFAULT dark:text-orange-DEFAULT text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <IconAtlas size={13} />
            <span>Full View →</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5">
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
                'rounded-xl border transition-colors overflow-hidden',
                isExpanded
                  ? 'border-slate-300 dark:border-white/15 bg-white dark:bg-navy-900/90 shadow-xs'
                  : 'border-slate-200/70 dark:border-white/[0.06] bg-white/70 dark:bg-navy-900/40 hover:border-slate-300'
              )}
            >
              {/* Clean System Row */}
              <button
                type="button"
                onClick={() => toggleExpand(ms.systemId)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left focus:outline-none group"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: sysStyle?.bgTint || '#EEF2FF',
                      color: sysStyle?.badgeText || '#1E2A8A',
                    }}
                  >
                    <SystemIcon systemId={ms.systemId} size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-[13px] text-slate-900 dark:text-white block truncate">
                      {ms.title}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {ms.stats.chapters} chapters · {ms.stats.topics} topics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-14 rs-progress-bar">
                      <div
                        className={cn('rs-progress-fill', progressPct === 100 && 'complete')}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 w-9 text-right">
                      {sysMastered}/{sysTotal}
                    </span>
                  </div>

                  <IconChevronDown
                    size={14}
                    className={cn(
                      'text-slate-400 transition-transform duration-150 flex-shrink-0',
                      isExpanded && 'rotate-180 text-navy-DEFAULT dark:text-orange-DEFAULT'
                    )}
                  />
                </div>
              </button>

              {/* Expanded System Chapters & Topics */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                  {/* Per-System Filter + Quick Hub Link */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="search"
                        value={filterBySys[ms.systemId] || ''}
                        onChange={(e) =>
                          setFilterBySys((prev) => ({ ...prev, [ms.systemId]: e.target.value }))
                        }
                        placeholder={`Filter ${ms.short} topics…`}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-navy-DEFAULT"
                      />
                    </div>
                    {onOpenCardioHub && (
                      <button
                        type="button"
                        onClick={() => onOpenCardioHub(ms.systemId)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 whitespace-nowrap"
                        title={`Open ${ms.short} figures & Q&A`}
                      >
                        {ms.stats.totalImages} Figs · {ms.stats.rapidFireQAs} Q&amp;As →
                      </button>
                    )}
                  </div>

                  {/* Chapters Accordion */}
                  <div className="space-y-1">
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
                          className="rounded-lg border border-slate-200/60 dark:border-white/[0.06] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedChapterBySys((prev) => ({
                                ...prev,
                                [ms.systemId]: prev[ms.systemId] === ch.id ? '' : ch.id,
                              }))
                            }
                            className="w-full px-2.5 py-1.5 flex items-center justify-between text-left bg-slate-50/70 dark:bg-navy-950/40 hover:bg-slate-100/70 dark:hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                {ch.num}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
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
                            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] bg-white dark:bg-navy-900/40">
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
                                      'px-2.5 py-2 cursor-pointer transition-colors flex items-center justify-between gap-2 border-l-2',
                                      isSel
                                        ? 'border-l-navy-DEFAULT dark:border-l-orange-DEFAULT bg-slate-100/80 dark:bg-white/[0.06]'
                                        : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                    )}
                                  >
                                    <div className="min-w-0 flex items-center gap-2">
                                      <span
                                        className={cn(
                                          'w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0',
                                          isMast
                                            ? 'bg-emerald-500 text-white'
                                            : 'border border-slate-300 dark:border-slate-600'
                                        )}
                                      >
                                        {isMast && <IconCheck size={9} />}
                                      </span>
                                      <span
                                        className={cn(
                                          'text-xs truncate',
                                          isSel
                                            ? 'font-extrabold text-navy-DEFAULT dark:text-orange-DEFAULT'
                                            : 'font-semibold text-slate-800 dark:text-slate-200'
                                        )}
                                      >
                                        {ct.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400">
                                      {isBm && <IconBookmark size={11} filled className="text-orange-DEFAULT" />}
                                      {isFl && <IconFlag size={11} filled className="text-red-500" />}
                                      {ct.videoCount > 0 && <IconVideo size={11} className="text-rose-500" />}
                                      {ct.imageCount > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono">
                                          <IconImage size={10} />
                                          {ct.imageCount}
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

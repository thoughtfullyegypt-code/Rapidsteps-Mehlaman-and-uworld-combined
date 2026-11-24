import { useState } from 'react';
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
    <div className="h-full overflow-y-auto p-3 md:p-5 space-y-3">
      {/* Header */}
      <div className="pb-3 border-b border-[#E2E6EE] dark:border-white/10 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-bold font-display text-[#0D1321] dark:text-white">
            16 Organ Systems · {totals.topics.toLocaleString()} topics
          </h2>
          <p className="text-[13px] text-[#526074] dark:text-slate-400 tabular-nums">
            {totals.images.toLocaleString()} figures · {totals.rapidFireQAs.toLocaleString()} Q&amp;As
          </p>
        </div>
        {onOpenCardioHub && (
          <button
            type="button"
            onClick={() => onOpenCardioHub(expandedSys || 'cardio')}
            className="px-3 py-1.5 rounded-lg bg-[#F1F3F7] dark:bg-[#131E36] hover:bg-[#E2E6EE] dark:hover:bg-white/10 text-[#16236E] dark:text-orange-DEFAULT text-[13px] font-semibold transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            <IconAtlas size={14} />
            <span>Full view →</span>
          </button>
        )}
      </div>

      {/* Flat Hairline System Index */}
      <div className="rounded-xl border border-[#E2E6EE] dark:border-white/10 bg-white dark:bg-[#0E1629] divide-y divide-[#E2E6EE] dark:divide-white/10 overflow-hidden">
        {ATLAS_MANIFEST.systems.map((ms: ManifestSystem) => {
          const sysStyle = SYSTEMS.find((s) => s.id === ms.systemId);
          const isExpanded = expandedSys === ms.systemId;
          const sysMastered = ms.topics.filter((t) => masteredCases.has(t.id)).length;
          const sysTotal = ms.stats.topics;
          const progressPct = sysTotal > 0 ? Math.round((sysMastered / sysTotal) * 100) : 0;
          const sysQuery = (filterBySys[ms.systemId] || '').trim().toLowerCase();
          const activeChId = expandedChapterBySys[ms.systemId] ?? ms.chapters[0]?.id ?? '';

          return (
            <div key={ms.systemId}>
              {/* System Row */}
              <button
                type="button"
                onClick={() => toggleExpand(ms.systemId)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-3 text-left transition-colors duration-150 focus:outline-none',
                  isExpanded
                    ? 'bg-[#F7F8FA] dark:bg-[#131E36]'
                    : 'hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]'
                )}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: sysStyle?.bgTint || '#EEF2FF',
                      color: sysStyle?.badgeText || '#16236E',
                    }}
                  >
                    <SystemIcon systemId={ms.systemId} size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-[15px] text-[#0D1321] dark:text-white block truncate leading-snug">
                      {ms.title}
                    </span>
                    <span className="text-[13px] text-[#526074] dark:text-slate-400 tabular-nums">
                      {ms.stats.chapters} chapters · {ms.stats.topics} topics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-14 rs-progress-bar">
                      <div
                        className={cn('rs-progress-fill', progressPct === 100 && 'complete')}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-medium text-[#526074] dark:text-slate-400 w-11 text-right tabular-nums">
                      {sysMastered}/{sysTotal}
                    </span>
                  </div>

                  <IconChevronDown
                    size={15}
                    className={cn(
                      'text-[#526074] dark:text-slate-400 transition-transform duration-150 flex-shrink-0',
                      isExpanded && 'rotate-180 text-[#16236E] dark:text-orange-DEFAULT'
                    )}
                  />
                </div>
              </button>

              {/* Expanded System Chapters & Topics */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2.5 bg-[#F7F8FA]/70 dark:bg-[#080D1A]/40 border-t border-[#E2E6EE] dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526074] pointer-events-none"
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
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#CBD2DF] dark:border-white/10 bg-white dark:bg-[#0E1629] text-[13px] text-[#0D1321] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#16236E]"
                      />
                    </div>
                    {onOpenCardioHub && (
                      <button
                        type="button"
                        onClick={() => onOpenCardioHub(ms.systemId)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1629] border border-[#E2E6EE] dark:border-white/10 text-[13px] font-medium text-[#526074] dark:text-slate-300 hover:text-[#0D1321] dark:hover:text-white dark:hover:bg-white/5 whitespace-nowrap transition-colors duration-150 tabular-nums"
                        title={`Open ${ms.short} figures & Q&A`}
                      >
                        {ms.stats.totalImages} figs · {ms.stats.rapidFireQAs} Q&amp;As →
                      </button>
                    )}
                  </div>

                  {/* Chapters Hairline List */}
                  <div className="rounded-lg bg-white dark:bg-[#0E1629] divide-y divide-[#E2E6EE] dark:divide-white/10 overflow-hidden">
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
                        <div key={ch.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedChapterBySys((prev) => ({
                                ...prev,
                                [ms.systemId]: prev[ms.systemId] === ch.id ? '' : ch.id,
                              }))
                            }
                            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors duration-150"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[13px] font-semibold text-[#526074] dark:text-slate-400 shrink-0 tabular-nums">
                                {ch.num}
                              </span>
                              <span className="text-[13px] font-semibold text-[#0D1321] dark:text-slate-100 truncate">
                                {ch.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-[13px] text-[#526074] dark:text-slate-400 tabular-nums">
                                {chMastered}/{chTopics.length}
                              </span>
                              <IconChevronDown
                                size={13}
                                className={cn(
                                  'text-[#526074] transition-transform duration-150',
                                  chOpen && 'rotate-180'
                                )}
                              />
                            </div>
                          </button>

                          {chOpen && (
                            <div className="divide-y divide-[#F1F3F7] dark:divide-white/[0.05] border-t border-[#E2E6EE] dark:border-white/10">
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
                                      'px-3 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between gap-2 border-l-2',
                                      isSel
                                        ? 'border-l-[#16236E] dark:border-l-orange-DEFAULT bg-[#F1F3F7] dark:bg-[#131E36]'
                                        : 'border-l-transparent hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]'
                                    )}
                                  >
                                    <div className="min-w-0 flex items-center gap-2.5">
                                      <span
                                        className={cn(
                                          'w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0',
                                          isMast
                                            ? 'bg-emerald-600 text-white'
                                            : 'border border-[#CBD2DF] dark:border-slate-600'
                                        )}
                                      >
                                        {isMast && <IconCheck size={9} />}
                                      </span>
                                      <span
                                        className={cn(
                                          'text-[14px] truncate',
                                          isSel
                                            ? 'font-bold text-[#16236E] dark:text-orange-DEFAULT'
                                            : 'font-medium text-[#0D1321] dark:text-slate-200'
                                        )}
                                      >
                                        {ct.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0 text-[#526074] dark:text-slate-400">
                                      {isBm && <IconBookmark size={12} filled className="text-orange-DEFAULT" />}
                                      {isFl && <IconFlag size={12} filled className="text-red-500" />}
                                      {ct.videoCount > 0 && <IconVideo size={12} className="text-rose-500" />}
                                      {ct.imageCount > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[13px] tabular-nums">
                                          <IconImage size={12} />
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

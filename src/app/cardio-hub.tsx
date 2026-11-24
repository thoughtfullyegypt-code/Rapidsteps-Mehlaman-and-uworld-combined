import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ATLAS_MANIFEST,
  useSystemAtlas,
  extractSystemImages,
  extractSystemVideos,
  findTopicLocation,
  CardioTopic,
  CardioBlock,
  CardioChapter,
  AtlasQAItem,
} from '@/lib/atlas-data';
import { SYSTEMS } from '@/lib/catalog';
import {
  SystemIcon,
  IconBookOpen,
  IconVideo,
  IconImage,
  IconZap,
  IconBookmark,
  IconCheck,
  IconZoomIn,
  IconEye,
  IconEyeOff,
  IconArrows,
  IconChevronDown,
} from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

type HubMode = 'chapters' | 'videos' | 'images' | 'qa';
type QaTypeFilter = 'all' | 'qa' | 'mcq' | 'arrow';

interface CardioHubProps {
  activeSystemId?: string;
  onSelectSystem?: (sysId: string) => void;
  selectedTopicId?: string | null;
  onSelectTopic: (topicId: string) => void;
  masteredCases: Set<string>;
  onToggleMaster: (id: string) => void;
  bookmarks: Set<string>;
  onToggleBookmark: (id: string) => void;
  activeRecall?: boolean;
  onToggleActiveRecall?: () => void;
}

interface GroupedNoteSection {
  id: string;
  num: string;
  title: string;
  items: CardioBlock[];
}

/**
 * Formats a clinical bullet line so leading category labels (e.g. "Mechanism:", "Diagnosis:")
 * stand out cleanly for rapid 5-second scanning.
 */
function renderClinicalLine(text: string): React.ReactNode {
  const match = text.match(/^([A-Z][A-Za-z0-9 /()&+-]{1,28}:)\s+(.*)$/);
  if (match) {
    return (
      <>
        <strong className="font-extrabold text-slate-900 dark:text-white">{match[1]} </strong>
        <span>{match[2]}</span>
      </>
    );
  }
  return text;
}

/**
 * Groups flat topic blocks into categorized sub-sections based on `kind === 'sub'`.
 * Every non-sub block is preserved in its exact original order.
 */
function groupBlocksIntoSubsections(blocks: CardioBlock[], fallbackTitle: string): GroupedNoteSection[] {
  if (!blocks || blocks.length === 0) return [];
  const groups: GroupedNoteSection[] = [];
  let current: GroupedNoteSection | null = null;

  for (const b of blocks) {
    if (b.kind === 'sub') {
      const idx = groups.length + 1;
      current = {
        id: `subsec-${idx}`,
        num: String(idx).padStart(2, '0'),
        title: b.text,
        items: [],
      };
      groups.push(current);
    } else {
      if (!current) {
        current = {
          id: 'subsec-1',
          num: '01',
          title: `${fallbackTitle} — Core Principles`,
          items: [],
        };
        groups.push(current);
      }
      current.items.push(b);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export function CardioTopicReader({
  topic,
  chapter,
  systemShort,
  isMastered,
  onToggleMaster,
  isBookmarked,
  onToggleBookmark,
  onOpenLightbox,
  compact = false,
}: {
  topic: CardioTopic;
  chapter?: CardioChapter | null;
  systemShort?: string;
  isMastered: boolean;
  onToggleMaster: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenLightbox: (src: string, caption: string) => void;
  compact?: boolean;
}) {
  const loc = findTopicLocation(topic.id);
  const resolvedCh = chapter ?? loc?.chapter;
  const resolvedSysShort = systemShort ?? loc?.systemShort ?? 'ATLAS';

  const hasVideos = Boolean(topic.videos && topic.videos.length > 0);
  const hasBlocks = Boolean(topic.blocks && topic.blocks.length > 0);
  const hasHy = Boolean(
    (topic.hyImages && topic.hyImages.length > 0) ||
      (topic.hyBullets && topic.hyBullets.length > 0) ||
      (topic.hySections && topic.hySections.length > 0)
  );

  const noteSections = useMemo(
    () => groupBlocksIntoSubsections(topic.blocks || [], topic.title),
    [topic.blocks, topic.title]
  );

  const scrollToSub = (domId: string) => {
    const el = document.getElementById(domId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={cn('space-y-5 rs-fade-in', compact ? 'text-sm' : 'text-sm md:text-[15px]')}>
      {/* Clean Editorial Header + Sub-Section Outline */}
      <div className="p-4 md:p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
            <span className="text-navy-DEFAULT dark:text-orange-DEFAULT uppercase">
              {resolvedSysShort}
              {resolvedCh ? ` · Ch ${resolvedCh.num} · ${resolvedCh.short}` : ''}
            </span>
            {noteSections.length > 0 && (
              <span>
                · {noteSections.length} sub-section{noteSections.length > 1 ? 's' : ''}
              </span>
            )}
            {topic.imageCount > 0 && <span>· {topic.imageCount} fig{topic.imageCount > 1 ? 's' : ''}</span>}
            {topic.tableCount > 0 && <span>· {topic.tableCount} table{topic.tableCount > 1 ? 's' : ''}</span>}
            {topic.videoCount > 0 && (
              <span className="text-rose-600 dark:text-rose-400">
                · {topic.videoCount} video{topic.videoCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleBookmark(topic.id)}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold border transition-colors',
                  isBookmarked
                    ? 'bg-orange-light dark:bg-orange-DEFAULT/20 border-orange-DEFAULT text-orange-rust dark:text-orange-DEFAULT'
                    : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                )}
                title="Bookmark topic (B)"
                aria-label="Bookmark topic"
              >
                <IconBookmark size={14} filled={isBookmarked} />
              </button>
              <button
                type="button"
                onClick={() => onToggleMaster(topic.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors inline-flex items-center gap-1.5',
                  isMastered
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                )}
              >
                {isMastered ? (
                  <IconCheck size={12} />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-current" />
                )}
                <span>{isMastered ? 'Mastered' : 'Master'}</span>
              </button>
            </div>
          )}
        </div>

        <h2 className="text-lg md:text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-snug">
          {topic.title}
        </h2>

        {/* Categorized Sub-Sections Quick-Jump Pills */}
        {(noteSections.length > 1 || (topic.hySections && topic.hySections.length > 1)) && (
          <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1">
              Sections:
            </span>
            {noteSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSub(`${topic.id}-${sec.id}`)}
                className="px-2 py-1 rounded-lg bg-slate-100/90 dark:bg-navy-800 hover:bg-navy-DEFAULT hover:text-white dark:hover:bg-orange-DEFAULT dark:hover:text-navy-950 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 text-left"
              >
                <span className="font-mono text-[10px] font-bold opacity-70">{sec.num}</span>
                <span className="truncate max-w-[220px]">{sec.title}</span>
              </button>
            ))}
            {hasHy && (
              <button
                type="button"
                onClick={() => scrollToSub(`${topic.id}-hy-pearls`)}
                className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-orange-DEFAULT hover:text-navy-950 text-orange-rust dark:text-orange-DEFAULT border border-amber-200/80 dark:border-amber-800/50 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
              >
                <IconZap size={11} />
                <span>HY Pearls ({topic.hyBullets.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. Clinical Videos */}
      {hasVideos && (
        <div className="space-y-2.5">
          <div className="rs-section-label text-rose-600 dark:text-rose-400">
            <IconVideo size={14} />
            <span>Clinical Videos</span>
          </div>
          <div className={cn('grid gap-4', topic.videos.length > 1 && !compact ? 'md:grid-cols-2' : 'grid-cols-1')}>
            {topic.videos.map((v) => (
              <div
                key={v.src}
                className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 shadow-xs"
              >
                <div className="bg-black">
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full max-h-[260px] bg-black object-contain block"
                    src={v.src}
                  />
                </div>
                <div className="p-3 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-white/10">
                  <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">{v.title}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Core Notes, Figures & Tables — empty state when no blocks and no HY */}
      {!hasBlocks && !hasHy && (
        <div className="p-6 rounded-xl bg-white dark:bg-navy-900 border border-dashed border-slate-200 dark:border-white/10 text-center space-y-1">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            No extra narrative blocks for this subtopic.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Use the Q&amp;A tab or neighboring chapter topics for related board vignettes.
          </p>
        </div>
      )}

      {/* 2b. Categorized Core Note Sub-Sections */}
      {noteSections.length > 0 && (
        <div className="space-y-3">
          <div className="rs-section-label text-navy-DEFAULT dark:text-orange-DEFAULT">
            <IconBookOpen size={14} />
            <span>Core Notes ({noteSections.length} Categorized Section{noteSections.length > 1 ? 's' : ''})</span>
          </div>

          <div className="space-y-3.5">
            {noteSections.map((sec) => (
              <section
                key={sec.id}
                id={`${topic.id}-${sec.id}`}
                className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xs scroll-mt-4"
              >
                {/* Sub-Section Category Header Bar */}
                <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-navy-950/70 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-mono text-[10px] font-extrabold shrink-0">
                    {sec.num}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold font-display text-slate-900 dark:text-white leading-snug">
                    {sec.title}
                  </h3>
                </div>

                {/* Sub-Section Content Items */}
                <div className="p-4 md:p-5 space-y-3">
                  {sec.items.map((b: CardioBlock, idx: number) => {
                    if (b.kind === 'p') {
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'leading-relaxed text-slate-700 dark:text-slate-200 flex items-start gap-2.5',
                            b.level === 1 && 'pl-4',
                            b.level >= 2 && 'pl-8'
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-DEFAULT/60 dark:bg-orange-DEFAULT/80 mt-2.5 select-none shrink-0" />
                          <span>{renderClinicalLine(b.text)}</span>
                        </div>
                      );
                    }

                    if (b.kind === 'img') {
                      return (
                        <figure
                          key={idx}
                          className="my-2.5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/80 p-2"
                        >
                          <button
                            type="button"
                            onClick={() => onOpenLightbox(b.src, b.caption || sec.title)}
                            className="block w-full group relative cursor-zoom-in"
                            title="Click to enlarge"
                          >
                            <img
                              src={b.src}
                              alt={b.caption || sec.title}
                              loading="lazy"
                              className="max-h-[360px] w-auto mx-auto rounded-lg object-contain"
                            />
                            <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-navy-950/75 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm inline-flex items-center gap-1">
                              <IconZoomIn size={11} /> Zoom
                            </span>
                          </button>
                          {b.caption && (
                            <figcaption className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                              {b.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    if (b.kind === 'table') {
                      const hasBanner = b.rows.length > 1 && b.rows[0].length === 1 && b.rows[1].length > 1;
                      const bannerTitle = hasBanner ? b.rows[0][0] : null;
                      const dataRows = hasBanner ? b.rows.slice(1) : b.rows;
                      const headerRow = dataRows[0] || [];
                      const bodyRows = dataRows.slice(1);

                      return (
                        <div
                          key={idx}
                          className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/15"
                        >
                          {bannerTitle && (
                            <div className="px-3.5 py-2 bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                              {bannerTitle}
                            </div>
                          )}
                          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                            {headerRow.length > 0 && (
                              <thead>
                                <tr className="bg-slate-50 dark:bg-navy-950 text-navy-DEFAULT dark:text-orange-DEFAULT border-b border-slate-200 dark:border-white/10">
                                  {headerRow.map((cell, ci) => (
                                    <th key={ci} className="py-2 px-3 font-extrabold">
                                      {cell}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                            )}
                            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10 bg-white dark:bg-navy-900/60">
                              {bodyRows.map((row, ri) => (
                                <tr key={ri} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                                  {row.map((cell, ci) => (
                                    <td
                                      key={ci}
                                      className={cn(
                                        'py-2 px-3 align-top leading-relaxed text-slate-700 dark:text-slate-200',
                                        ci === 0 && row.length > 1 && 'font-bold text-slate-900 dark:text-white'
                                      )}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* 3. Categorized High-Yield Exam Pearls */}
      {hasHy && (
        <div id={`${topic.id}-hy-pearls`} className="space-y-3 scroll-mt-4">
          <div className="rs-section-label text-orange-rust dark:text-orange-DEFAULT">
            <IconZap size={14} />
            <span>High-Yield Pearls</span>
          </div>

          {topic.hyImages && topic.hyImages.length > 0 && (
            <div className={cn('grid gap-3', topic.hyImages.length > 1 && !compact ? 'md:grid-cols-2' : 'grid-cols-1')}>
              {topic.hyImages.map((im) => (
                <figure
                  key={im.src}
                  className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 p-2.5 flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(im.src, im.caption)}
                    className="block w-full group relative cursor-zoom-in"
                  >
                    <img
                      src={im.src}
                      alt={im.caption}
                      loading="lazy"
                      className="max-h-[240px] w-auto mx-auto rounded-lg object-contain bg-slate-50 dark:bg-navy-950 p-1"
                    />
                  </button>
                  <figcaption className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-2 px-1 leading-snug">
                    {im.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {topic.hySections && topic.hySections.length > 0 ? (
            <div className="space-y-3">
              {topic.hySections.map((sec, si) => (
                <section
                  key={si}
                  className="rounded-xl bg-amber-50/45 dark:bg-amber-950/15 border border-amber-200/80 dark:border-amber-800/50 overflow-hidden"
                >
                  <div className="px-4 py-2 bg-amber-100/60 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-800/40 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-orange-DEFAULT text-navy-950 font-mono text-[10px] font-extrabold shrink-0">
                      HY {String(si + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold font-display text-slate-900 dark:text-amber-100">
                      {sec.heading || `${topic.title} — High-Yield Pearls`}
                    </h4>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {sec.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT mt-2 select-none shrink-0" />
                        <span>{renderClinicalLine(b)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            topic.hyBullets &&
            topic.hyBullets.length > 0 && (
              <div className="p-4 md:p-5 rounded-xl bg-amber-50/45 dark:bg-amber-950/15 border border-amber-200/80 dark:border-amber-800/50 space-y-1.5">
                {topic.hyBullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT mt-2 select-none shrink-0" />
                    <span>{renderClinicalLine(b)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// UNIVERSAL 16-SYSTEM MULTIMEDIA ATLAS HUB
// ============================================================
export default function CardioHub({
  activeSystemId,
  onSelectSystem,
  selectedTopicId,
  onSelectTopic,
  masteredCases,
  onToggleMaster,
  bookmarks,
  onToggleBookmark,
  activeRecall = false,
  onToggleActiveRecall,
}: CardioHubProps) {
  const currentSysId = activeSystemId || 'cardio';
  const { data: sysData, loading } = useSystemAtlas(currentSysId);

  const [mode, setMode] = useState<HubMode>('chapters');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [qaSearch, setQaSearch] = useState<string>('');
  const [qaTypeFilter, setQaTypeFilter] = useState<QaTypeFilter>('all');
  const [qaRecallMode, setQaRecallMode] = useState<boolean>(activeRecall);
  const [revealedQaIds, setRevealedQaIds] = useState<Set<string>>(new Set());
  const [mcqPicked, setMcqPicked] = useState<Record<string, number>>({});
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  // Sync with global header Active Recall toggle
  useEffect(() => {
    setQaRecallMode(activeRecall);
    if (activeRecall) {
      setRevealedQaIds(new Set());
    }
  }, [activeRecall]);

  const activeTopicRef = useRef<HTMLButtonElement | null>(null);

  // Reset filters when switching Organ Systems
  useEffect(() => {
    setChapterFilter('all');
    setCollapsedChapters(new Set());
    setSearchQuery('');
    setQaSearch('');
    setQaTypeFilter('all');
    if (mode === 'videos') {
      const mSys = ATLAS_MANIFEST.systems.find((s) => s.systemId === currentSysId);
      if (mSys && mSys.stats.videos === 0) {
        setMode('chapters');
      }
    }
  }, [currentSysId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightbox) {
        setLightbox(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  useEffect(() => {
    if (activeTopicRef.current) {
      activeTopicRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedTopicId]);

  const activeTopic: CardioTopic | null = useMemo(() => {
    if (!sysData || sysData.topics.length === 0) return null;
    if (selectedTopicId) {
      const found = sysData.topics.find((t) => t.id === selectedTopicId);
      if (found) return found;
    }
    return sysData.topics[0];
  }, [sysData, selectedTopicId]);

  const systemImages = useMemo(() => (sysData ? extractSystemImages(sysData) : []), [sysData]);
  const systemVideos = useMemo(() => (sysData ? extractSystemVideos(sysData) : []), [sysData]);

  const filteredTopics = useMemo(() => {
    if (!sysData) return [];
    const q = searchQuery.trim().toLowerCase();
    return sysData.topics.filter((t) => {
      if (chapterFilter !== 'all' && t.chapterId !== chapterFilter) return false;
      if (!q) return true;
      if (t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)) return true;
      if (t.hyBullets.some((b) => b.toLowerCase().includes(q))) return true;
      if (t.blocks.some((b) => 'text' in b && b.text.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [sysData, chapterFilter, searchQuery]);

  // Group filteredTopics by Chapter so the sidebar is cleanly categorized into sub-sections
  const groupedSidebarChapters = useMemo(() => {
    if (!sysData) return [];
    return sysData.chapters
      .map((ch) => ({
        chapter: ch,
        topics: filteredTopics.filter((t) => t.chapterId === ch.id),
      }))
      .filter((g) => g.topics.length > 0);
  }, [sysData, filteredTopics]);

  const toggleChapterCollapse = (chId: string) => {
    setCollapsedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return systemImages.filter((im) => {
      if (chapterFilter !== 'all' && im.chapterId !== chapterFilter) return false;
      if (!q) return true;
      return im.caption.toLowerCase().includes(q) || im.topicTitle.toLowerCase().includes(q);
    });
  }, [systemImages, chapterFilter, searchQuery]);

  const qaCounts = useMemo(() => {
    const list = sysData?.rapidFireQAs || [];
    return {
      all: list.length,
      qa: list.filter((x) => !x.kind || x.kind === 'qa').length,
      mcq: list.filter((x) => x.kind === 'mcq').length,
      arrow: list.filter((x) => x.kind === 'arrow').length,
    };
  }, [sysData]);

  const filteredQAs = useMemo(() => {
    if (!sysData) return [];
    const q = qaSearch.trim().toLowerCase();
    return sysData.rapidFireQAs.filter((item) => {
      const itemKind = item.kind || 'qa';
      if (qaTypeFilter !== 'all' && itemKind !== qaTypeFilter) return false;
      if (!q) return true;
      return (
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q) ||
        (item.options && item.options.some((o) => o.toLowerCase().includes(q)))
      );
    });
  }, [sysData, qaSearch, qaTypeFilter]);

  const toggleQaReveal = (id: string) => {
    setRevealedQaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSystemSwitch = (sysId: string) => {
    onSelectSystem?.(sysId);
    const sysStub = ATLAS_MANIFEST.systems.find((s) => s.systemId === sysId);
    if (sysStub && sysStub.topics[0]) {
      onSelectTopic(sysStub.topics[0].id);
    }
  };

  const manifestSys = ATLAS_MANIFEST.systems.find((s) => s.systemId === currentSysId) || ATLAS_MANIFEST.systems[0];
  const stats = sysData?.stats || manifestSys.stats;
  const masteredCount = manifestSys.topics.filter((t) => masteredCases.has(t.id)).length;

  const chMap = useMemo(
    () => new Map((sysData?.chapters || manifestSys.chapters).map((c) => [c.id, c])),
    [sysData, manifestSys]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-navy-950">
      {/* 1. Compact 16-System Switcher Bar */}
      <div className="flex-shrink-0 px-3 md:px-4 py-1.5 bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-white/[0.07]">
        <div className="rs-pill-strip flex items-center gap-1">
          {ATLAS_MANIFEST.systems.map((sys) => {
            const active = sys.systemId === currentSysId;
            const catMeta = SYSTEMS.find((s) => s.id === sys.systemId);
            return (
              <button
                key={sys.systemId}
                type="button"
                onClick={() => handleSystemSwitch(sys.systemId)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors inline-flex items-center gap-1.5',
                  active
                    ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                )}
              >
                <SystemIcon systemId={sys.systemId} size={13} className={active ? '' : 'opacity-75'} />
                <span>{catMeta?.shortName || sys.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Unified Single Command & Filter Bar */}
      <div className="flex-shrink-0 px-3 md:px-5 py-2 bg-slate-50/90 dark:bg-navy-950/90 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 pr-1">
            <h1 className="text-xs sm:text-sm font-extrabold font-display text-slate-900 dark:text-white truncate">
              {manifestSys.title}
            </h1>
            <span className="text-[10px] font-mono text-slate-400">
              {masteredCount}/{stats.topics}
            </span>
          </div>

          {(mode === 'chapters' || mode === 'images') && (
            <>
              <div className="relative w-44 sm:w-56">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={mode === 'chapters' ? 'Filter topics & notes…' : 'Filter figures…'}
                  className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-navy-DEFAULT"
                />
              </div>

              {manifestSys.chapters.length > 1 && (
                <select
                  aria-label="Filter by chapter"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none max-w-[210px] truncate"
                >
                  <option value="all">All {manifestSys.chapters.length} Sub-Sections</option>
                  {manifestSys.chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.num} · {ch.title}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>

        {/* Sub-View Mode Tabs */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/70 dark:bg-navy-900 border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setMode('chapters')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1.5',
              mode === 'chapters'
                ? 'bg-white dark:bg-navy-800 text-navy-DEFAULT dark:text-orange-DEFAULT shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <IconBookOpen size={12} />
            <span>Notes ({stats.topics})</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('images')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1.5',
              mode === 'images'
                ? 'bg-white dark:bg-navy-800 text-navy-DEFAULT dark:text-orange-DEFAULT shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <IconImage size={12} />
            <span>Figures ({stats.totalImages})</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('qa')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1.5',
              mode === 'qa'
                ? 'bg-white dark:bg-navy-800 text-navy-DEFAULT dark:text-orange-DEFAULT shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <IconZap size={12} />
            <span>Q&amp;A ({stats.rapidFireQAs})</span>
          </button>

          {stats.videos > 0 && (
            <button
              type="button"
              onClick={() => setMode('videos')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1.5',
                mode === 'videos'
                  ? 'bg-white dark:bg-navy-800 text-navy-DEFAULT dark:text-orange-DEFAULT shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <IconVideo size={12} />
              <span>Videos ({stats.videos})</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && !sysData && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-navy-DEFAULT/10 dark:bg-orange-DEFAULT/15 text-navy-DEFAULT dark:text-orange-DEFAULT flex items-center justify-center mx-auto animate-pulse">
              <SystemIcon systemId={currentSysId} size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Loading {manifestSys.title}…
            </p>
          </div>
        </div>
      )}

      {/* ==================== MODE 1: CHAPTERS (CATEGORIZED BY SUB-SECTION) ==================== */}
      {sysData && mode === 'chapters' && (
        <div className="flex-1 overflow-hidden grid md:grid-cols-[310px_1fr] lg:grid-cols-[350px_1fr]">
          {/* Categorized Left Topic Index (Grouped by Chapter Sub-Sections) */}
          <div className="h-full overflow-y-auto border-r border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900/50">
            {groupedSidebarChapters.map(({ chapter: ch, topics }) => {
              const isCollapsed = collapsedChapters.has(ch.id) && !searchQuery.trim();
              const chMastered = topics.filter((t) => masteredCases.has(t.id)).length;

              return (
                <div key={ch.id} className="border-b border-slate-200/80 dark:border-white/[0.07]">
                  {/* Sticky Chapter Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleChapterCollapse(ch.id)}
                    className="sticky top-0 z-10 w-full px-3 py-2 bg-slate-100/95 dark:bg-navy-950/95 backdrop-blur-xs flex items-center justify-between gap-2 text-left hover:bg-slate-200/70 dark:hover:bg-navy-900 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-mono text-[10px] font-extrabold shrink-0">
                        {ch.num}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {ch.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {chMastered}/{topics.length}
                      </span>
                      <IconChevronDown
                        size={12}
                        className={cn(
                          'text-slate-400 transition-transform duration-150',
                          !isCollapsed && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  {/* Topics inside this Sub-Section */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {topics.map((t) => {
                        const isSelected = activeTopic?.id === t.id;
                        const isMast = masteredCases.has(t.id);
                        const subCount = t.blocks.filter((b) => b.kind === 'sub').length;
                        return (
                          <button
                            key={t.id}
                            ref={isSelected ? activeTopicRef : undefined}
                            type="button"
                            onClick={() => onSelectTopic(t.id)}
                            className={cn(
                              'rs-scroll-into-view w-full text-left px-3.5 py-2.5 transition-colors border-l-3',
                              isSelected
                                ? 'border-l-navy-DEFAULT dark:border-l-orange-DEFAULT bg-slate-100/90 dark:bg-white/[0.06]'
                                : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={cn(
                                  'text-xs leading-snug flex items-center gap-1.5',
                                  isSelected
                                    ? 'font-extrabold text-navy-DEFAULT dark:text-orange-DEFAULT'
                                    : 'font-bold text-slate-800 dark:text-slate-100'
                                )}
                              >
                                {isMast && <IconCheck size={12} className="text-emerald-500 shrink-0" />}
                                <span>{t.title}</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {t.summary}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 shrink-0">
                                {subCount > 1 && <span>{subCount}§</span>}
                                {t.imageCount > 0 && (
                                  <span className="inline-flex items-center gap-0.5">
                                    <IconImage size={10} />
                                    {t.imageCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Multimedia Reader */}
          <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
            {activeTopic && (
              <div className="max-w-4xl mx-auto">
                <CardioTopicReader
                  key={activeTopic.id}
                  topic={activeTopic}
                  chapter={chMap.get(activeTopic.chapterId)}
                  systemShort={sysData.short}
                  isMastered={masteredCases.has(activeTopic.id)}
                  onToggleMaster={onToggleMaster}
                  isBookmarked={bookmarks.has(activeTopic.id)}
                  onToggleBookmark={onToggleBookmark}
                  onOpenLightbox={(src, caption) => setLightbox({ src, caption })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODE 2: VIDEOS ==================== */}
      {sysData && mode === 'videos' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-5">
            <div>
              <h2 className="text-lg font-extrabold font-display text-slate-900 dark:text-white">
                Heart Sounds, Murmurs &amp; Pathology Videos ({systemVideos.length})
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemVideos.map((vid) => (
                <div
                  key={vid.src}
                  className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="bg-black">
                      <video
                        controls
                        preload="none"
                        playsInline
                        src={vid.src}
                        className="w-full h-44 bg-black object-contain block"
                      />
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-rust dark:text-orange-DEFAULT">
                        {vid.topicTitle}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 mb-1">
                        {vid.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {vid.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTopic(vid.topicId);
                        setMode('chapters');
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-navy-DEFAULT hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                    >
                      Open Topic Notes →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODE 3: FIGURES GALLERY ==================== */}
      {sysData && mode === 'images' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm md:text-base font-extrabold font-display text-slate-900 dark:text-white">
                {sysData.title} Figures ({filteredImages.length} of {systemImages.length})
              </h2>
              <span className="text-[11px] text-slate-400">Click any figure to enlarge</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredImages.map((im, idx) => (
                <div
                  key={`${im.src}-${idx}`}
                  className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 flex flex-col justify-between p-2.5 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setLightbox({ src: im.src, caption: `${im.topicTitle} — ${im.caption}` })}
                    className="block w-full h-40 bg-slate-50 dark:bg-navy-950 rounded-lg overflow-hidden p-1.5 cursor-zoom-in"
                  >
                    <img
                      src={im.src}
                      alt={im.caption}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </button>
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-orange-rust dark:text-orange-DEFAULT truncate">
                        {im.topicTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">
                      {im.caption}
                    </p>
                    {im.topicId && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTopic(im.topicId);
                          setMode('chapters');
                        }}
                        className="text-[11px] font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline"
                      >
                        Open topic →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODE 4: Q&A, MCQS & ARROW DRILLS ==================== */}
      {sysData && mode === 'qa' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Compact Filter + Search + Recall Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-navy-900 p-3 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQaTypeFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                    qaTypeFilter === 'all' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  )}
                >
                  All ({qaCounts.all})
                </button>
                {qaCounts.qa > 0 && (
                  <button
                    type="button"
                    onClick={() => setQaTypeFilter('qa')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                      qaTypeFilter === 'qa' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    Vignettes ({qaCounts.qa})
                  </button>
                )}
                {qaCounts.mcq > 0 && (
                  <button
                    type="button"
                    onClick={() => setQaTypeFilter('mcq')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                      qaTypeFilter === 'mcq' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    MCQs ({qaCounts.mcq})
                  </button>
                )}
                {qaCounts.arrow > 0 && (
                  <button
                    type="button"
                    onClick={() => setQaTypeFilter('arrow')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1',
                      qaTypeFilter === 'arrow' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    <IconArrows size={12} /> Arrows ({qaCounts.arrow})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[220px] justify-end">
                <div className="relative flex-1 max-w-xs">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    value={qaSearch}
                    onChange={(e) => setQaSearch(e.target.value)}
                    placeholder={`Search ${stats.rapidFireQAs} items…`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-navy-DEFAULT"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onToggleActiveRecall) {
                      onToggleActiveRecall();
                    } else {
                      setQaRecallMode((v) => !v);
                      setRevealedQaIds(new Set());
                    }
                  }}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors inline-flex items-center gap-1.5 shrink-0',
                    qaRecallMode
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                      : 'bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  )}
                >
                  {qaRecallMode ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                  <span>{qaRecallMode ? 'Recall ON' : 'Recall'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredQAs.map((item: AtlasQAItem) => {
                const isMcq = item.kind === 'mcq' && item.options && item.options.length >= 2;
                const pickedIdx = mcqPicked[item.id];
                const mcqAnswered = pickedIdx !== undefined;
                const showAns = isMcq
                  ? (!qaRecallMode && !mcqAnswered ? false : mcqAnswered || !qaRecallMode)
                  : (!qaRecallMode || revealedQaIds.has(item.id));
                const effectiveShowMcqAns = isMcq ? mcqAnswered : showAns;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isMcq && qaRecallMode && toggleQaReveal(item.id)}
                    className={cn(
                      'p-3.5 md:p-4 rounded-xl border bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10 transition-colors',
                      !isMcq && qaRecallMode && 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {item.num}
                      </span>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-[13px] md:text-sm text-slate-900 dark:text-white leading-relaxed">
                            {item.q}
                          </div>
                          {item.topicId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTopic(item.topicId!);
                                setMode('chapters');
                              }}
                              className="text-[11px] font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline shrink-0"
                            >
                              Topic →
                            </button>
                          )}
                        </div>

                        {/* Attached Clinical Images */}
                        {item.images && item.images.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            {item.images.map((src) => (
                              <button
                                key={src}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightbox({ src, caption: item.q });
                                }}
                                className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 p-1 cursor-zoom-in"
                              >
                                <img
                                  src={src}
                                  alt="Clinical vignette figure"
                                  loading="lazy"
                                  className="max-h-44 w-auto object-contain rounded"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Interactive Multiple-Choice Options */}
                        {isMcq && item.options && (
                          <div className="grid gap-1.5 pt-1">
                            {item.options.map((opt, oi) => {
                              const isThisPicked = pickedIdx === oi;
                              const isCorrectOpt = item.correctIndex === oi;
                              return (
                                <button
                                  key={oi}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMcqPicked((prev) => ({ ...prev, [item.id]: oi }));
                                  }}
                                  className={cn(
                                    'w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors',
                                    !mcqAnswered && 'bg-slate-50 dark:bg-navy-950/60 border-slate-200 dark:border-white/10 hover:border-navy-DEFAULT dark:hover:border-orange-DEFAULT text-slate-800 dark:text-slate-200',
                                    mcqAnswered && isCorrectOpt && 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold',
                                    mcqAnswered && isThisPicked && !isCorrectOpt && 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-200',
                                    mcqAnswered && !isCorrectOpt && !isThisPicked && 'opacity-55 border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-400'
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Answer / Explanation Reveal */}
                        {effectiveShowMcqAns ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                            <strong className="font-extrabold">→ </strong>
                            {isMcq ? (item.explanation || item.a) : item.a}
                          </div>
                        ) : (
                          !isMcq && (
                            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Click to reveal answer →
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-w-5xl w-full bg-white dark:bg-navy-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 rs-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate pr-4">
                {lightbox.caption}
              </span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-navy-800 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 flex items-center gap-1.5"
              >
                Close <span className="rs-kbd">Esc</span>
              </button>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-navy-950 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={lightbox.src}
                alt={lightbox.caption}
                className="max-h-[74vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

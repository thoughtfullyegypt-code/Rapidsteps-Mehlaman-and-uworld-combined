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
  IconTable,
  IconZap,
  IconBookmark,
  IconCheck,
  IconZoomIn,
  IconEye,
  IconEyeOff,
  IconArrows,
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

  return (
    <div className={cn('space-y-6 rs-fade-in', compact ? 'text-sm' : 'text-sm md:text-[15px]')}>
      {/* Topic Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#141C66] via-[#1E2A8A] to-[#2A3FB5] text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 text-white/90 backdrop-blur-sm">
              {resolvedSysShort} {resolvedCh ? `· Ch ${resolvedCh.num} · ${resolvedCh.short}` : ''}
            </span>
            {topic.videoCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/25 border border-rose-300/20 text-rose-100">
                <IconVideo size={12} />
                {topic.videoCount} Video{topic.videoCount > 1 ? 's' : ''}
              </span>
            )}
            {topic.imageCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-100">
                <IconImage size={12} />
                {topic.imageCount} Fig{topic.imageCount > 1 ? 's' : ''}
              </span>
            )}
            {topic.tableCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/20 text-emerald-100">
                <IconTable size={12} />
                {topic.tableCount} Table{topic.tableCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleBookmark(topic.id)}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold transition-all',
                isBookmarked
                  ? 'bg-orange-DEFAULT text-navy-950'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              )}
              title="Bookmark topic"
              aria-label="Bookmark topic"
            >
              <IconBookmark size={14} filled={isBookmarked} />
            </button>
            <button
              type="button"
              onClick={() => onToggleMaster(topic.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5',
                isMastered
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              )}
            >
              {isMastered && <IconCheck size={12} />}
              <span>{isMastered ? 'Mastered' : 'Master'}</span>
            </button>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-extrabold font-display text-white leading-tight">
          {topic.title}
        </h2>
      </div>

      {/* 1. Clinical Videos */}
      {topic.videos && topic.videos.length > 0 && (
        <div className="space-y-3">
          <div className="rs-section-label text-rose-600 dark:text-rose-400">
            <IconVideo size={14} />
            <span>Clinical Videos</span>
          </div>
          <div className={cn('grid gap-4', topic.videos.length > 1 && !compact ? 'md:grid-cols-2' : 'grid-cols-1')}>
            {topic.videos.map((v) => (
              <div
                key={v.src}
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 shadow-sm rs-video-card"
              >
                <video
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full max-h-[280px] bg-black object-contain"
                  src={v.src}
                />
                <div className="p-3.5 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-white/10">
                  <div className="font-bold text-sm text-navy-DEFAULT dark:text-white mb-0.5">{v.title}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Core Notes, Figures & Tables — empty state when no blocks */}
      {(!topic.blocks || topic.blocks.length === 0) && !(
        (topic.hyBullets && topic.hyBullets.length > 0) ||
        (topic.hySections && topic.hySections.length > 0) ||
        (topic.hyImages && topic.hyImages.length > 0)
      ) && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-dashed border-slate-200 dark:border-white/10 text-center space-y-1">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Full notes are being added for this topic.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Check back soon — explore the High-Yield Pearls below for the most board-tested points.</p>
        </div>
      )}

      {/* 2b. Core Notes, Figures & Tables */}
      {topic.blocks && topic.blocks.length > 0 && (
        <div className="space-y-3">
          <div className="rs-section-label text-navy-DEFAULT dark:text-orange-DEFAULT">
            <IconBookOpen size={14} />
            <span>Core Notes</span>
          </div>

          <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 space-y-3.5 shadow-xs">
            {topic.blocks.map((b: CardioBlock, idx: number) => {
              if (b.kind === 'sub') {
                return (
                  <h3
                    key={idx}
                    className="pt-3 first:pt-0 text-base md:text-lg font-extrabold font-display text-navy-DEFAULT dark:text-orange-DEFAULT border-b border-slate-100 dark:border-white/10 pb-1.5"
                  >
                    {b.text}
                  </h3>
                );
              }

              if (b.kind === 'p') {
                return (
                  <div
                    key={idx}
                    className={cn(
                      'leading-relaxed text-slate-700 dark:text-slate-200 flex items-start gap-2.5',
                      b.level === 1 && 'pl-5',
                      b.level >= 2 && 'pl-9'
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT mt-2.5 select-none shrink-0" />
                    <span>{b.text}</span>
                  </div>
                );
              }

              if (b.kind === 'img') {
                return (
                  <figure
                    key={idx}
                    className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/80 p-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenLightbox(b.src, b.caption)}
                      className="block w-full group relative cursor-zoom-in"
                      title="Click to enlarge"
                    >
                      <img
                        src={b.src}
                        alt={b.caption}
                        loading="lazy"
                        className="max-h-[380px] w-auto mx-auto rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-navy-950/75 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm inline-flex items-center gap-1">
                        <IconZoomIn size={11} /> Zoom
                      </span>
                    </button>
                    {b.caption && (
                      <figcaption className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
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
                    className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/15 shadow-xs"
                  >
                    {bannerTitle && (
                      <div className="px-4 py-2 bg-navy-DEFAULT text-white font-extrabold text-xs uppercase tracking-wider">
                        {bannerTitle}
                      </div>
                    )}
                    <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                      {headerRow.length > 0 && (
                        <thead>
                          <tr className="bg-slate-100 dark:bg-navy-950 text-navy-DEFAULT dark:text-orange-DEFAULT border-b border-slate-200 dark:border-white/10">
                            {headerRow.map((cell, ci) => (
                              <th key={ci} className="py-2.5 px-3.5 font-extrabold">
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
                                  'py-2.5 px-3.5 align-top leading-relaxed text-slate-700 dark:text-slate-200',
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
        </div>
      )}

      {/* 3. High-Yield Exam Pearls */}
      {((topic.hyImages && topic.hyImages.length > 0) || (topic.hyBullets && topic.hyBullets.length > 0)) && (
        <div className="space-y-3">
          <div className="rs-section-label text-orange-rust dark:text-orange-DEFAULT">
            <IconZap size={14} />
            <span>High-Yield Pearls</span>
          </div>

          {topic.hyImages && topic.hyImages.length > 0 && (
            <div className={cn('grid gap-4', topic.hyImages.length > 1 && !compact ? 'md:grid-cols-2' : 'grid-cols-1')}>
              {topic.hyImages.map((im) => (
                <figure
                  key={im.src}
                  className="rounded-xl overflow-hidden border border-orange-border dark:border-orange-DEFAULT/30 bg-[#FFFDF9] dark:bg-navy-900 p-2.5 flex flex-col justify-between"
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
                      className="max-h-[260px] w-auto mx-auto rounded-lg object-contain bg-white p-1"
                    />
                  </button>
                  <figcaption className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-2 px-1 leading-snug">
                    {im.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {topic.hySections && topic.hySections.length > 0 && (
            <div className="p-5 md:p-6 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-4">
              {topic.hySections.map((sec, si) => (
                <div key={si} className="space-y-2">
                  {sec.heading && (
                    <h4 className="text-sm font-extrabold font-display text-navy-DEFAULT dark:text-orange-DEFAULT border-b border-amber-200/80 dark:border-amber-800/40 pb-1">
                      {sec.heading}
                    </h4>
                  )}
                  <div className="space-y-1.5">
                    {sec.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-sm bg-orange-rust dark:bg-orange-DEFAULT mt-2 select-none shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
}: CardioHubProps) {
  const derivedSysId = useMemo(() => {
    if (activeSystemId) return activeSystemId;
    const loc = findTopicLocation(selectedTopicId);
    return loc?.systemId || 'cardio';
  }, [activeSystemId, selectedTopicId]);

  const [internalSysId, setInternalSysId] = useState<string>(derivedSysId);
  useEffect(() => {
    setInternalSysId(derivedSysId);
  }, [derivedSysId]);

  const currentSysId = onSelectSystem ? derivedSysId : internalSysId;
  const { data: sysData, loading } = useSystemAtlas(currentSysId);

  const [mode, setMode] = useState<HubMode>('chapters');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  const activeTopicRef = useRef<HTMLButtonElement>(null);

  // Q&A / MCQ / Arrow Vault state
  const [qaSearch, setQaSearch] = useState('');
  const [qaTypeFilter, setQaTypeFilter] = useState<QaTypeFilter>('all');
  const [qaRecallMode, setQaRecallMode] = useState(false);
  const [revealedQaIds, setRevealedQaIds] = useState<Set<string>>(new Set());
  const [mcqPicked, setMcqPicked] = useState<Record<string, number>>({});

  // Reset filters when switching systems
  useEffect(() => {
    setChapterFilter('all');
    setSearchQuery('');
    setQaSearch('');
    setQaTypeFilter('all');
    if (mode === 'videos' && currentSysId !== 'cardio') {
      setMode('chapters');
    }
  }, [currentSysId]);

  const activeTopic = useMemo(() => {
    if (!sysData || sysData.topics.length === 0) return null;
    const found = sysData.topics.find((t) => t.id === selectedTopicId);
    return found || sysData.topics[0];
  }, [sysData, selectedTopicId]);

  useEffect(() => {
    if (activeTopicRef.current && mode === 'chapters') {
      activeTopicRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeTopic?.id, mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightbox) {
        setLightbox(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const systemImages = useMemo(() => (sysData ? extractSystemImages(sysData) : []), [sysData]);
  const systemVideos = useMemo(() => (sysData ? extractSystemVideos(sysData) : []), [sysData]);

  const filteredTopics = useMemo(() => {
    if (!sysData) return [];
    const q = searchQuery.trim().toLowerCase();
    return sysData.topics.filter((t) => {
      if (chapterFilter !== 'all' && t.chapterId !== chapterFilter) return false;
      if (!q) return true;
      if (t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)) return true;
      if (t.blocks.some((b) => 'text' in b && b.text.toLowerCase().includes(q))) return true;
      if (t.hyBullets.some((hb) => hb.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [sysData, chapterFilter, searchQuery]);

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
    if (onSelectSystem) onSelectSystem(sysId);
    else setInternalSysId(sysId);
    const sysStub = ATLAS_MANIFEST.systems.find((s) => s.systemId === sysId);
    if (sysStub && sysStub.topics[0]) {
      onSelectTopic(sysStub.topics[0].id);
    }
  };

  const sysColorMeta = SYSTEMS.find((s) => s.id === currentSysId);
  const manifestSys = ATLAS_MANIFEST.systems.find((s) => s.systemId === currentSysId) || ATLAS_MANIFEST.systems[0];
  const stats = sysData?.stats || manifestSys.stats;
  const masteredCount = manifestSys.topics.filter((t) => masteredCases.has(t.id)).length;
  const progressPct = stats.topics > 0 ? Math.round((masteredCount / stats.topics) * 100) : 0;

  const chMap = useMemo(
    () => new Map((sysData?.chapters || manifestSys.chapters).map((c) => [c.id, c])),
    [sysData, manifestSys]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-navy-950">
      {/* 16-System Switcher Bar */}
      <div className="flex-shrink-0 px-3 md:px-5 py-2 bg-slate-100/80 dark:bg-navy-950 border-b border-slate-200/80 dark:border-white/[0.07]">
        <div className="rs-pill-strip flex items-center gap-1.5">
          {ATLAS_MANIFEST.systems.map((sys) => {
            const active = sys.systemId === currentSysId;
            const catMeta = SYSTEMS.find((s) => s.id === sys.systemId);
            return (
              <button
                key={sys.systemId}
                type="button"
                onClick={() => handleSystemSwitch(sys.systemId)}
                className={cn(
                  'px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all inline-flex items-center gap-1.5 border',
                  active
                    ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT shadow-xs'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                )}
              >
                <SystemIcon systemId={sys.systemId} size={14} className={active ? '' : 'opacity-80'} />
                <span>{catMeta?.shortName || sys.short}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded-md',
                    active
                      ? 'bg-white/20 dark:bg-navy-950/15 text-white dark:text-navy-950'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-400'
                  )}
                >
                  {sys.stats.topics}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top System Command Bar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-2.5 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0"
              style={{
                backgroundColor: sysColorMeta?.bgTint || '#EEF2FF',
                color: sysColorMeta?.badgeText || '#1E2A8A',
                border: `1px solid ${sysColorMeta?.borderTint || '#C7D2FE'}`,
              }}
            >
              <SystemIcon systemId={currentSysId} size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold font-display text-navy-DEFAULT dark:text-white truncate">
                  {manifestSys.title}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                  {masteredCount}/{stats.topics} mastered
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {stats.chapters} Ch · {stats.topics} Topics · {stats.totalImages} Figs · {stats.tables} Tables
                {stats.videos > 0 ? ` · ${stats.videos} Videos` : ''} · {stats.rapidFireQAs} Q&amp;As
              </p>
            </div>
          </div>

          {/* Sub-View Tabs */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMode('chapters')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5',
                mode === 'chapters'
                  ? 'bg-navy-DEFAULT text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              )}
            >
              <IconBookOpen size={13} />
              <span className="hidden sm:inline">Chapters ({stats.topics})</span>
              <span className="sm:hidden">{stats.topics}</span>
            </button>

            {stats.videos > 0 && (
              <button
                type="button"
                onClick={() => setMode('videos')}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5',
                  mode === 'videos'
                    ? 'bg-navy-DEFAULT text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                )}
              >
                <IconVideo size={13} />
                <span className="hidden sm:inline">Videos ({stats.videos})</span>
                <span className="sm:hidden">{stats.videos}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode('images')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5',
                mode === 'images'
                  ? 'bg-navy-DEFAULT text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              )}
            >
              <IconImage size={13} />
              <span className="hidden sm:inline">Figures ({stats.totalImages})</span>
              <span className="sm:hidden">{stats.totalImages}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('qa')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5',
                mode === 'qa'
                  ? 'bg-navy-DEFAULT text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              )}
            >
              <IconZap size={13} />
              <span className="hidden sm:inline">Q&amp;A ({stats.rapidFireQAs})</span>
              <span className="sm:hidden">{stats.rapidFireQAs}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 rs-progress-bar">
          <div className={cn('rs-progress-fill', progressPct === 100 && 'complete')} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Chapter Filter Strip */}
      {(mode === 'chapters' || mode === 'images') && (
        <div className="flex-shrink-0 px-4 md:px-5 py-2 bg-white/60 dark:bg-navy-900/40 border-b border-slate-200/60 dark:border-white/[0.06] flex flex-wrap items-center gap-2">
          <div className="relative flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mode === 'chapters' ? 'Search topics & notes…' : 'Filter figures…'}
              className="w-48 sm:w-56 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT"
            />
          </div>
          <div className="rs-pill-strip flex items-center gap-1 flex-1 pb-0.5">
            <button
              type="button"
              onClick={() => setChapterFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors',
                chapterFilter === 'all'
                  ? 'bg-orange-DEFAULT text-navy-950'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              )}
            >
              All Chapters
            </button>
            {manifestSys.chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChapterFilter(ch.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors',
                  chapterFilter === ch.id
                    ? 'bg-orange-DEFAULT text-navy-950'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                )}
              >
                {ch.num} {ch.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !sysData && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-navy-DEFAULT/10 dark:bg-orange-DEFAULT/15 text-navy-DEFAULT dark:text-orange-DEFAULT flex items-center justify-center mx-auto animate-pulse">
              <SystemIcon systemId={currentSysId} size={22} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Loading {manifestSys.title} Atlas…
            </p>
          </div>
        </div>
      )}

      {/* ==================== MODE 1: CHAPTERS ==================== */}
      {sysData && mode === 'chapters' && (
        <div className="flex-1 overflow-hidden grid md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
          {/* Left Topic Index */}
          <div className="h-full overflow-y-auto border-r border-slate-200 dark:border-white/10 p-2.5 space-y-1 bg-white/50 dark:bg-navy-900/30">
            <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
              <span>{filteredTopics.length} topics</span>
              <span className="text-emerald-600 dark:text-emerald-400">{masteredCount} mastered</span>
            </div>
            {filteredTopics.map((t) => {
              const isSelected = activeTopic?.id === t.id;
              const isMast = masteredCases.has(t.id);
              const ch = chMap.get(t.chapterId);
              return (
                <button
                  key={t.id}
                  ref={isSelected ? activeTopicRef : undefined}
                  type="button"
                  onClick={() => onSelectTopic(t.id)}
                  className={cn(
                    'rs-topic-card rs-scroll-into-view w-full text-left p-2.5 rounded-xl border',
                    isSelected
                      ? 'bg-orange-light/70 dark:bg-orange-DEFAULT/15 border-orange-DEFAULT shadow-sm'
                      : 'bg-white dark:bg-navy-900/60 border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15'
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-0.5">
                    <span className="font-bold text-xs text-navy-DEFAULT dark:text-white leading-snug flex items-center gap-1.5">
                      {isMast && <IconCheck size={12} className="text-emerald-500 shrink-0" />}
                      <span>{t.title}</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-400 flex-shrink-0">
                      {ch?.num}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5">
                    {t.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 text-[9px] font-semibold">
                    {t.videoCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300">
                        <IconVideo size={10} /> {t.videoCount}
                      </span>
                    )}
                    {t.imageCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                        <IconImage size={10} /> {t.imageCount}
                      </span>
                    )}
                    {t.tableCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
                        <IconTable size={10} /> {t.tableCount}
                      </span>
                    )}
                    {t.hyBullets.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                        <IconZap size={10} /> {t.hyBullets.length}
                      </span>
                    )}
                  </div>
                </button>
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
              <h2 className="text-lg md:text-xl font-extrabold font-display text-navy-DEFAULT dark:text-white">
                Heart Sounds, Murmurs &amp; Pathology Videos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All {systemVideos.length} clinical videos. Press play on any clip or click &ldquo;Open Full Topic&rdquo; for complete notes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemVideos.map((vid) => (
                <div
                  key={vid.src}
                  className="rs-video-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <video
                      controls
                      preload="none"
                      playsInline
                      src={vid.src}
                      className="w-full h-44 bg-black object-contain"
                    />
                    <div className="p-3.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-rust dark:text-orange-DEFAULT">
                        {vid.topicTitle}
                      </span>
                      <h3 className="text-sm font-extrabold text-navy-DEFAULT dark:text-white mt-0.5 mb-1">
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
                      className="w-full py-2 rounded-lg bg-navy-DEFAULT text-white text-xs font-bold hover:bg-navy-500 transition-colors"
                    >
                      Open Full Topic →
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
              <h2 className="text-base md:text-lg font-extrabold font-display text-navy-DEFAULT dark:text-white">
                {sysData.title} Visual Atlas ({filteredImages.length} of {systemImages.length} Figures)
              </h2>
              <span className="text-[11px] text-slate-400">Click any figure to zoom</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredImages.map((im, idx) => (
                <div
                  key={`${im.src}-${idx}`}
                  className="rs-img-card rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 flex flex-col justify-between p-2.5 shadow-xs"
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
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-400">
                        {im.source === 'docx' ? 'NOTES' : 'ATLAS'}
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
                        Go to topic →
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
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
              <div>
                <h2 className="text-lg font-extrabold font-display text-navy-DEFAULT dark:text-white">
                  {stats.rapidFireQAs} Step 1 Vignettes, MCQs &amp; Drills
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clinical vignettes, mechanism hooks, multiple-choice stems &amp; physiological arrow drills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQaRecallMode((v) => !v);
                  setRevealedQaIds(new Set());
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5',
                  qaRecallMode
                    ? 'bg-orange-DEFAULT text-navy-950 border-orange-DEFAULT'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-navy-700'
                )}
              >
                {qaRecallMode ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                <span>{qaRecallMode ? 'Recall ON' : 'Enable Recall'}</span>
              </button>
            </div>

            {/* Type Filter Pills + Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setQaTypeFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                    qaTypeFilter === 'all' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300'
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
                      qaTypeFilter === 'qa' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300'
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
                      qaTypeFilter === 'mcq' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300'
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
                      qaTypeFilter === 'arrow' ? 'bg-navy-DEFAULT text-white' : 'text-slate-600 dark:text-slate-300'
                    )}
                  >
                    <IconArrows size={12} /> Arrows ({qaCounts.arrow})
                  </button>
                )}
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="search"
                  value={qaSearch}
                  onChange={(e) => setQaSearch(e.target.value)}
                  placeholder={`Search ${stats.rapidFireQAs} items in ${manifestSys.short}…`}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT"
                />
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Showing {filteredQAs.length} of {sysData.rapidFireQAs.length} items
            </div>

            <div className="space-y-2.5">
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
                      'rs-qa-card p-3.5 md:p-4 rounded-xl border bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10 transition-all',
                      !isMcq && qaRecallMode && 'cursor-pointer',
                      effectiveShowMcqAns && 'revealed'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-navy-DEFAULT text-white font-mono text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {item.num}
                      </span>
                      <div className="flex-1 space-y-2.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.sourceTag && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-300">
                              {item.sourceTag}
                            </span>
                          )}
                          {item.topicId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTopic(item.topicId!);
                                setMode('chapters');
                              }}
                              className="text-[10px] font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline"
                            >
                              Related Topic →
                            </button>
                          )}
                        </div>

                        <div className="font-bold text-[13px] md:text-sm text-slate-900 dark:text-white leading-relaxed">
                          {item.q}
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
                                className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 p-1.5 cursor-zoom-in hover:border-orange-DEFAULT transition-colors"
                              >
                                <img
                                  src={src}
                                  alt="Clinical vignette figure"
                                  loading="lazy"
                                  className="max-h-48 w-auto object-contain rounded-lg"
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
                                    'w-full text-left px-3 py-2 rounded-lg border text-xs transition-all',
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
                          <div className="rs-qa-answer p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                            <strong className="font-extrabold">→ </strong>
                            {isMcq ? (item.explanation || item.a) : item.a}
                          </div>
                        ) : (
                          !isMcq && (
                            <div className="text-[11px] font-bold text-orange-rust dark:text-orange-DEFAULT">
                              Tap to reveal answer →
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
              <span className="text-xs sm:text-sm font-bold text-navy-DEFAULT dark:text-white truncate pr-4">
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

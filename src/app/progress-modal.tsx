import React, { useState, useRef } from 'react';
import { ATLAS_MANIFEST, findTopicLocation } from '@/lib/atlas-data';
import {
  getStudyStats,
  exportStudyData,
  importStudyData,
  getMissedDrillItems,
} from '@/lib/storage';
import {
  SystemIcon,
  IconX,
  IconBookmark,
  IconFlag,
  IconCheck,
  IconZap,
} from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  masteredCases: Set<string>;
  bookmarks: Set<string>;
  flags: Set<string>;
  dueForReview: string[];
  recentTopics: string[];
  onSelectTopic: (id: string) => void;
  onSelectSystem: (sysId: string) => void;
  onToggleBookmark: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onDataImported: () => void;
}

type DashTab = 'systems' | 'due' | 'saved' | 'recent' | 'backup';

export default function ProgressModal({
  isOpen,
  onClose,
  masteredCases,
  bookmarks,
  flags,
  dueForReview,
  recentTopics,
  onSelectTopic,
  onSelectSystem,
  onToggleBookmark,
  onToggleFlag,
  onDataImported,
}: ProgressModalProps) {
  const [tab, setTab] = useState<DashTab>('systems');
  const [importStatus, setImportStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const stats = getStudyStats();
  const totalTopics = ATLAS_MANIFEST.totals.topics;
  const masteredTotal = ATLAS_MANIFEST.systems.reduce(
    (acc, sys) => acc + sys.topics.filter((t) => masteredCases.has(t.id)).length,
    0
  );
  const pct = totalTopics > 0 ? Math.round((masteredTotal / totalTopics) * 100) : 0;
  const missedDrillCount = getMissedDrillItems().length;

  const handleExport = () => {
    const json = exportStudyData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `rapidsteps-study-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importStudyData(String(reader.result || ''));
      if (res.ok) {
        setImportStatus({
          ok: true,
          msg: `Restored ${res.restoredCount} study records cleanly.`,
        });
        onDataImported();
      } else {
        setImportStatus({
          ok: false,
          msg: res.error || 'Failed to restore backup file.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const renderTopicChipList = (
    ids: string[],
    emptyMsg: string,
    action?: { label: string; onClick: (id: string) => void }
  ) => {
    if (ids.length === 0) {
      return (
        <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
          {emptyMsg}
        </div>
      );
    }
    return (
      <div className="divide-y divide-slate-100 dark:divide-white/[0.06] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-navy-900">
        {ids.map((id) => {
          const loc = findTopicLocation(id);
          return (
            <div
              key={id}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectTopic(id);
                  onClose();
                }}
                className="flex items-center gap-2.5 min-w-0 text-left flex-1"
              >
                <span className="text-navy-DEFAULT dark:text-orange-DEFAULT shrink-0">
                  <SystemIcon systemId={loc?.systemId || 'cardio'} size={15} />
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {loc?.stub.title || id}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {loc ? `${loc.systemShort} · ${loc.chapter?.title || ''}` : 'Topic'}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {masteredCases.has(id) && (
                  <span className="text-emerald-600 dark:text-emerald-400" title="Mastered">
                    <IconCheck size={13} />
                  </span>
                )}
                {action && (
                  <button
                    type="button"
                    onClick={() => action.onClick(id)}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    {action.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Study Progress Dashboard"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] rs-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold font-display text-navy-DEFAULT dark:text-white">
              Step 1 Mastery &amp; Review Dashboard
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {masteredTotal} of {totalTopics.toLocaleString()} topics mastered ({pct}%)
              {missedDrillCount > 0 ? ` · ${missedDrillCount} flashcards queued for review` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close dashboard"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 py-3 bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-white/10">
          <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400">Mastered</div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {masteredTotal}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400">Streak</div>
            <div className="text-sm sm:text-base font-extrabold text-orange-rust dark:text-orange-DEFAULT">
              {stats.streak}d
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400">Today</div>
            <div className="text-sm sm:text-base font-extrabold text-navy-DEFAULT dark:text-white">
              {stats.todayCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400">Due</div>
            <div className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400">
              {dueForReview.length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400">Saved</div>
            <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
              {bookmarks.size}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400">Flagged</div>
            <div className="text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400">
              {flags.size}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2 border-b border-slate-200 dark:border-white/10 flex items-center gap-1 overflow-x-auto rs-pill-strip">
          {[
            { id: 'systems' as DashTab, label: '16 Systems' },
            { id: 'due' as DashTab, label: `Due Review (${dueForReview.length})` },
            { id: 'saved' as DashTab, label: `Saved (${bookmarks.size + flags.size})` },
            { id: 'recent' as DashTab, label: `Recent (${recentTopics.length})` },
            { id: 'backup' as DashTab, label: 'Backup & Restore' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
                tab === t.id
                  ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'systems' && (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {ATLAS_MANIFEST.systems.map((sys) => {
                const sysMast = sys.topics.filter((t) => masteredCases.has(t.id)).length;
                const sysPct =
                  sys.stats.topics > 0 ? Math.round((sysMast / sys.stats.topics) * 100) : 0;
                return (
                  <button
                    key={sys.systemId}
                    type="button"
                    onClick={() => {
                      onSelectSystem(sys.systemId);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-navy-950/50 hover:border-navy-DEFAULT dark:hover:border-orange-DEFAULT text-left transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <SystemIcon
                          systemId={sys.systemId}
                          size={15}
                          className="text-navy-DEFAULT dark:text-orange-DEFAULT shrink-0"
                        />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {sys.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                        {sysMast}/{sys.stats.topics}
                      </span>
                    </div>
                    <div className="rs-progress-bar">
                      <div
                        className={cn('rs-progress-fill', sysPct === 100 && 'complete')}
                        style={{ width: `${sysPct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'due' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <IconZap size={14} className="text-orange-DEFAULT shrink-0" />
                <span>
                  Topics you mastered earlier whose 1 / 3 / 7 / 14 / 30 day review interval is due.
                </span>
              </div>
              {renderTopicChipList(
                dueForReview,
                'No topics due right now. Mark topics Mastered to build your spaced-review ladder.'
              )}
            </div>
          )}

          {tab === 'saved' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-rust dark:text-orange-DEFAULT">
                  <IconBookmark size={13} filled />
                  <span>Bookmarked Topics ({bookmarks.size})</span>
                </div>
                {renderTopicChipList(
                  Array.from(bookmarks),
                  'No bookmarked topics yet. Press B while reading a topic to bookmark it.',
                  { label: 'Remove', onClick: onToggleBookmark }
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                  <IconFlag size={13} filled />
                  <span>Flagged for Review ({flags.size})</span>
                </div>
                {renderTopicChipList(
                  Array.from(flags),
                  'No flagged topics yet. Press X while reading a topic to flag it.',
                  { label: 'Unflag', onClick: onToggleFlag }
                )}
              </div>
            </div>
          )}

          {tab === 'recent' &&
            renderTopicChipList(
              recentTopics,
              'Topics you open appear here for quick jumping.'
            )}

          {tab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Export Study Data
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Download a portable JSON backup containing all mastered topics, bookmarks, flags, personal topic notes, mistake log, spaced-review history, and drill progress.
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-4 py-2 rounded-xl bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 text-xs font-extrabold hover:opacity-95 transition-opacity"
                >
                  Download JSON Backup
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Restore from Backup File
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Restore progress on a new browser or device from a previously exported Rapid Steps `.json` backup.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-navy-900 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Choose Backup JSON File…
                </button>
                {importStatus && (
                  <p
                    className={cn(
                      'text-xs font-bold pt-1',
                      importStatus.ok
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {importStatus.msg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

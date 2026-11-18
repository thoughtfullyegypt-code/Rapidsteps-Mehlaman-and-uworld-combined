import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_CASES, CaseDemo, SYSTEMS } from '@/lib/catalog';
import { useTopicDetail } from '@/lib/atlas-data';
import { CardioTopicReader } from './cardio-hub';
import { StudySize } from '@/lib/storage';
import {
  SystemIcon,
  IconFlag,
  IconBookmark,
  IconCheck,
  IconLock,
  IconEye,
  IconAlert,
} from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface CasePanelProps {
  caseId: string | null;
  onClose: () => void;
  activeRecall: boolean;
  studySize: StudySize;
  isMastered: boolean;
  onToggleMaster: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isFlagged: boolean;
  onToggleFlag: (id: string) => void;
  onNextCase: () => void;
  onPrevCase: () => void;
  onOpenUnlock: () => void;
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pct =
      el.scrollHeight <= el.clientHeight
        ? 100
        : Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    setProgress(pct);
  }, []);

  useEffect(() => {
    const el = document.querySelector('[data-scroll-reader]') as HTMLDivElement;
    if (el) {
      scrollRef.current = el;
      el.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="rs-reading-progress">
      <div className="rs-reading-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

export default function CasePanel({
  caseId,
  onClose,
  activeRecall,
  studySize,
  isMastered,
  onToggleMaster,
  isBookmarked,
  onToggleBookmark,
  isFlagged,
  onToggleFlag,
  onNextCase,
  onPrevCase,
  onOpenUnlock,
}: CasePanelProps) {
  const [diagnosisRevealed, setDiagnosisRevealed] = useState(!activeRecall);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  const { topic: atlasTopic, chapter: atlasChapter, location: atlasLoc, loading: atlasLoading } =
    useTopicDetail(caseId);

  useEffect(() => {
    setDiagnosisRevealed(!activeRecall);
    setSelectedOption(null);
    setAnswerChecked(false);
  }, [caseId, activeRecall]);

  if (!caseId) return null;

  // 1. Universal 16-System Multimedia Atlas Topics
  if (atlasLoc) {
    return (
      <div
        className={cn(
          'h-full flex flex-col bg-slate-50 dark:bg-navy-950 border-l border-slate-200 dark:border-white/10 overflow-hidden',
          studySize === 'large' ? 'text-base' : 'text-sm'
        )}
        role="region"
        aria-label={`${atlasLoc.systemTitle} topic details`}
      >
        <ReadingProgressBar />

        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 overflow-hidden">
            <span className="inline-flex items-center gap-1 text-navy-DEFAULT dark:text-orange-DEFAULT font-bold shrink-0">
              <SystemIcon systemId={atlasLoc.systemId} size={13} />
              <span>{atlasLoc.systemShort}</span>
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="truncate text-slate-600 dark:text-slate-300">{atlasChapter?.title}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="truncate font-bold text-navy-DEFAULT dark:text-white">{atlasLoc.stub.title}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onToggleFlag(caseId)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isFlagged ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
              )}
              title="Flag (X)"
              aria-label="Flag this topic"
            >
              <IconFlag size={14} filled={isFlagged} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5" data-scroll-reader>
          {atlasLoading || !atlasTopic ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">
              Loading {atlasLoc.stub.title}…
            </div>
          ) : (
            <CardioTopicReader
              key={caseId}
              topic={atlasTopic}
              chapter={atlasChapter}
              systemShort={atlasLoc.systemShort}
              isMastered={isMastered}
              onToggleMaster={onToggleMaster}
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              onOpenLightbox={(src, caption) => setLightbox({ src, caption })}
              compact
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onToggleMaster(caseId)}
            className={cn(
              'py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border',
              isMastered
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
            )}
          >
            {isMastered ? <IconCheck size={13} /> : <span className="w-2.5 h-2.5 rounded-full border-2 border-current" />}
            <span>{isMastered ? 'Mastered' : 'Master'}</span>
            <span className="rs-kbd hidden sm:inline-flex">M</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevCase}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onNextCase}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Next"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightbox(null)}
          >
            <div
              className="max-w-4xl w-full bg-white dark:bg-navy-900 rounded-2xl overflow-hidden shadow-2xl rs-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-navy-DEFAULT dark:text-white truncate pr-4">
                  {lightbox.caption}
                </span>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-navy-800 text-xs font-bold flex items-center gap-1.5"
                >
                  Close <span className="rs-kbd">Esc</span>
                </button>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 flex items-center justify-center max-h-[80vh] overflow-auto">
                <img src={lightbox.src} alt={lightbox.caption} className="max-h-[72vh] w-auto object-contain rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Classic Demo Case Fallback
  const caseData: CaseDemo | undefined = DEMO_CASES[caseId];
  const isLocked = !caseData;

  let lockedTitle = caseId.toUpperCase();
  let lockedSyndrome = 'Specialized Pathology';
  let lockedSystem = 'Organ System';
  SYSTEMS.forEach((sys) => {
    const s = sys.paidCaseSample.find((c) => c.id === caseId);
    if (s) {
      lockedTitle = s.title;
      lockedSyndrome = s.syndrome;
      lockedSystem = sys.name;
    }
  });

  return (
    <div
      className={cn(
        'h-full flex flex-col bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-white/10 overflow-hidden',
        studySize === 'large' ? 'text-base' : 'text-sm'
      )}
      role="region"
      aria-label="Case details"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-navy-950/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 overflow-hidden">
          <span className="text-navy-DEFAULT dark:text-blue-400 truncate">
            {isLocked ? lockedSystem : caseData.systemName}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 shrink-0">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="truncate">{isLocked ? lockedSyndrome : caseData.syndrome}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleBookmark(caseId)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isBookmarked ? 'text-orange-DEFAULT bg-orange-light dark:bg-orange-DEFAULT/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
            )}
            title="Bookmark (B)"
          >
            <IconBookmark size={14} filled={isBookmarked} />
          </button>
          <button
            type="button"
            onClick={() => onToggleFlag(caseId)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isFlagged ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
            )}
            title="Flag (X)"
          >
            <IconFlag size={14} filled={isFlagged} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 rs-fade-in" data-scroll-reader>
        {isLocked ? (
          <div className="py-10 px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-xl bg-orange-light dark:bg-orange-DEFAULT/15 text-orange-rust dark:text-orange-DEFAULT flex items-center justify-center mx-auto">
              <IconLock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-DEFAULT">Preview Case</span>
              <h1 id="case-title" className="text-xl font-extrabold font-display text-navy-DEFAULT dark:text-white mt-1">
                {lockedTitle}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                Explore the full Organ System Atlas for complete clinical notes, figures, and high-yield tables.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenUnlock}
              className="py-3 px-6 bg-gradient-to-r from-orange-DEFAULT to-[#FFA23F] text-navy-950 font-bold rounded-full shadow-sm hover:shadow-glow-orange transition-all text-sm"
            >
              Unlock Full Access — from $19
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-light dark:bg-orange-DEFAULT/15 border border-orange-border dark:border-orange-DEFAULT/30 text-orange-rust dark:text-orange-DEFAULT text-xs font-bold mb-2.5">
                <span className="font-mono text-[10px]">BUZZWORD:</span>
                <span id="case-buzzword">{caseData.buzzword}</span>
              </div>

              {diagnosisRevealed ? (
                <h1 id="case-title" className="text-xl md:text-2xl font-extrabold font-display text-navy-DEFAULT dark:text-white leading-tight">
                  {caseData.diagnosis}
                </h1>
              ) : (
                <button
                  type="button"
                  onClick={() => setDiagnosisRevealed(true)}
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-orange-DEFAULT/50 bg-orange-light/30 dark:bg-orange-DEFAULT/10 text-orange-rust dark:text-orange-DEFAULT font-bold text-sm hover:bg-orange-light/60 transition-all inline-flex items-center justify-center gap-2"
                >
                  <IconEye size={16} />
                  <span>Active Recall ON — Click to reveal Diagnosis</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Clinical Vignette</h2>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border-l-4 border-navy-DEFAULT dark:border-orange-DEFAULT border-t border-r border-b border-slate-200 dark:border-white/5">
                <p id="case-vignette" className="text-vignette text-slate-700 dark:text-slate-200 leading-relaxed text-base">
                  {caseData.vignette}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cellular Mechanism</h2>
              <div id="case-mechanism" className="p-3.5 rounded-xl bg-white dark:bg-navy-800/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 leading-relaxed">
                {caseData.mechanism}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lab Signature</h2>
              <div id="case-labs" className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-950 dark:text-blue-200 leading-relaxed font-mono text-xs">
                {caseData.labSignature}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <IconAlert size={13} />
                <span>Board Trap</span>
              </h2>
              <div id="case-trap" className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 leading-relaxed text-xs">
                {caseData.trap}
              </div>
            </div>

            <div id="case-quiz" className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-rust dark:text-orange-DEFAULT">
                Mini-Question Drill
              </span>

              <p className="font-semibold text-slate-800 dark:text-white leading-relaxed text-[13px]">
                {caseData.question.stem}
              </p>

              <div className="space-y-1.5">
                {caseData.question.options.map((opt, i) => {
                  const isCorrect = i === caseData.question.correct;
                  const isPicked = i === selectedOption;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={answerChecked}
                      onClick={() => setSelectedOption(i)}
                      className={cn(
                        'w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all',
                        isPicked && !answerChecked
                          ? 'border-navy-DEFAULT dark:border-orange-DEFAULT bg-navy-50/50 dark:bg-white/5 font-semibold'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20',
                        answerChecked && isCorrect && 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold',
                        answerChecked && !isCorrect && isPicked && 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300'
                      )}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0',
                          answerChecked && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : answerChecked && isPicked
                            ? 'bg-red-600 text-white'
                            : isPicked
                            ? 'bg-navy-DEFAULT text-white'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!answerChecked ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={() => setAnswerChecked(true)}
                  className="py-2 px-5 rounded-full bg-navy-DEFAULT text-white font-bold text-xs hover:bg-navy-dark transition-colors disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
                  <strong>Explanation:</strong> {caseData.question.explanation}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">High-Yield Facts</h2>
              <ul className="space-y-1.5">
                {caseData.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-navy-950/60 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onToggleMaster(caseId)}
          className={cn(
            'py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border',
            isMastered
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300'
              : 'border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          )}
        >
          {isMastered ? <IconCheck size={13} /> : <span className="w-2.5 h-2.5 rounded-full border-2 border-current" />}
          <span>{isMastered ? 'Mastered' : 'Master'}</span>
          <span className="rs-kbd hidden sm:inline-flex">M</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevCase}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNextCase}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

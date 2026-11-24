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
          'h-full flex flex-col bg-[#F7F8FA] dark:bg-[#080D1A] border-l border-[#E2E6EE] dark:border-white/10 overflow-hidden',
          studySize === 'large' ? 'text-base' : 'text-[15px]'
        )}
        role="region"
        aria-label={`${atlasLoc.systemTitle} topic details`}
      >
        <ReadingProgressBar />

        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E2E6EE] dark:border-white/10 bg-white dark:bg-[#0E1629]">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#526074] dark:text-slate-400 overflow-hidden">
            <span className="inline-flex items-center gap-1 text-[#16236E] dark:text-orange-DEFAULT font-semibold shrink-0">
              <SystemIcon systemId={atlasLoc.systemId} size={13} />
              <span>{atlasLoc.systemShort}</span>
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-slate-300 shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="truncate">{atlasChapter?.title}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-slate-300 shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="truncate font-semibold text-[#0D1321] dark:text-white">{atlasLoc.stub.title}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onToggleBookmark(caseId)}
              className={cn(
                'p-1.5 rounded-lg transition-colors duration-150',
                isBookmarked ? 'text-[#C2550A] bg-[#FFF4E5] dark:bg-orange-DEFAULT/20 dark:text-orange-DEFAULT' : 'text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10'
              )}
              title="Bookmark (B)"
              aria-label="Bookmark this topic"
            >
              <IconBookmark size={14} filled={isBookmarked} />
            </button>
            <button
              type="button"
              onClick={() => onToggleFlag(caseId)}
              className={cn(
                'p-1.5 rounded-lg transition-colors duration-150',
                isFlagged ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 'text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10'
              )}
              title="Flag (X)"
              aria-label="Flag this topic"
            >
              <IconFlag size={14} filled={isFlagged} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#526074] hover:text-[#0D1321] dark:hover:text-white hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
              aria-label="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5" data-scroll-reader>
          {atlasLoading || !atlasTopic ? (
            <div className="py-12 text-center text-[13px] font-medium text-[#526074]">
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
        <div className="px-4 py-2.5 border-t border-[#E2E6EE] dark:border-white/10 bg-white dark:bg-[#0E1629] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onToggleMaster(caseId)}
            className={cn(
              'py-1.5 px-3 rounded-lg text-[13px] font-semibold transition-colors duration-150 flex items-center gap-1.5 border',
              isMastered
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300'
                : 'border-[#E2E6EE] dark:border-white/15 text-[#526074] dark:text-slate-300 hover:bg-[#F1F3F7] dark:hover:bg-white/10'
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
              className="p-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
              title="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onNextCase}
              className="p-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
              title="Next"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
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
              className="max-w-4xl w-full bg-white dark:bg-[#0E1629] rounded-2xl overflow-hidden shadow-2xl rs-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E6EE] dark:border-white/10">
                <span className="text-[13px] font-semibold text-[#0D1321] dark:text-white truncate pr-4">
                  {lightbox.caption}
                </span>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="px-2.5 py-1 rounded-md bg-[#F1F3F7] dark:bg-[#131E36] text-[13px] font-semibold flex items-center gap-1.5"
                >
                  Close <span className="rs-kbd">Esc</span>
                </button>
              </div>
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#080D1A] flex items-center justify-center max-h-[80vh] overflow-auto">
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
        'h-full flex flex-col bg-white dark:bg-[#0E1629] border-l border-[#E2E6EE] dark:border-white/10 overflow-hidden',
        studySize === 'large' ? 'text-base' : 'text-[15px]'
      )}
      role="region"
      aria-label="Case details"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E6EE] dark:border-white/10 bg-[#F7F8FA] dark:bg-[#080D1A]/70 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#526074] dark:text-slate-400 overflow-hidden">
          <span className="text-[#16236E] dark:text-orange-DEFAULT font-semibold truncate">
            {isLocked ? lockedSystem : caseData.systemName}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-slate-300 shrink-0">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="truncate">{isLocked ? lockedSyndrome : caseData.syndrome}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleBookmark(caseId)}
            className={cn(
              'p-1.5 rounded-lg transition-colors duration-150',
              isBookmarked ? 'text-[#C2550A] bg-[#FFF4E5] dark:bg-orange-DEFAULT/20 dark:text-orange-DEFAULT' : 'text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10'
            )}
            title="Bookmark (B)"
          >
            <IconBookmark size={14} filled={isBookmarked} />
          </button>
          <button
            type="button"
            onClick={() => onToggleFlag(caseId)}
            className={cn(
              'p-1.5 rounded-lg transition-colors duration-150',
              isFlagged ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 'text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10'
            )}
            title="Flag (X)"
          >
            <IconFlag size={14} filled={isFlagged} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#526074] hover:text-[#0D1321] dark:hover:text-white hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 rs-fade-in" data-scroll-reader>
        {isLocked ? (
          <div className="py-10 px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF4E5] dark:bg-orange-DEFAULT/15 text-[#C2550A] dark:text-orange-DEFAULT flex items-center justify-center mx-auto">
              <IconLock size={22} />
            </div>
            <div>
              <span className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT">Preview case</span>
              <h1 id="case-title" className="text-xl font-extrabold font-display text-[#0D1321] dark:text-white mt-1">
                {lockedTitle}
              </h1>
              <p className="text-[#526074] dark:text-slate-400 text-[15px] mt-2 max-w-sm mx-auto leading-relaxed">
                Explore the full Organ System Atlas for complete clinical notes, figures, and high-yield tables.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenUnlock}
              className="py-3 px-6 bg-orange-DEFAULT hover:bg-orange-hover text-navy-950 font-semibold rounded-full transition-colors duration-150 text-[15px]"
            >
              Unlock Full Access, from $19
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT mb-1.5">
                Buzzword: <span id="case-buzzword">{caseData.buzzword}</span>
              </div>

              {diagnosisRevealed ? (
                <h1 id="case-title" className="text-xl md:text-2xl font-extrabold font-display text-[#0D1321] dark:text-white leading-tight">
                  {caseData.diagnosis}
                </h1>
              ) : (
                <button
                  type="button"
                  onClick={() => setDiagnosisRevealed(true)}
                  className="w-full py-3.5 px-4 rounded-xl border border-dashed border-orange-DEFAULT/60 bg-[#FFF4E5]/50 dark:bg-orange-DEFAULT/10 text-[#C2550A] dark:text-orange-DEFAULT font-semibold text-[14px] hover:bg-[#FFF4E5] transition-colors duration-150 inline-flex items-center justify-center gap-2"
                >
                  <IconEye size={16} />
                  <span>Active recall on: click to reveal diagnosis</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[13px] font-semibold text-[#526074] dark:text-slate-400">Clinical vignette</h2>
              <div className="p-4 rounded-r-xl bg-[#F7F8FA] dark:bg-[#131E36] border-l-[3px] border-[#16236E] dark:border-orange-DEFAULT">
                <p id="case-vignette" className="text-vignette text-[#0D1321] dark:text-slate-200 leading-relaxed text-[15px]">
                  {caseData.vignette}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[13px] font-semibold text-[#526074] dark:text-slate-400">Cellular mechanism</h2>
              <div id="case-mechanism" className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#131E36] text-[#0D1321] dark:text-slate-200 leading-relaxed text-[15px]">
                {caseData.mechanism}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[13px] font-semibold text-[#526074] dark:text-slate-400">Lab signature</h2>
              <div id="case-labs" className="p-3.5 rounded-r-xl bg-[#EEF2FF]/60 dark:bg-[#131E36] border-l-[3px] border-[#16236E] dark:border-blue-400 text-[#0D1321] dark:text-slate-200 leading-relaxed text-[15px]">
                {caseData.labSignature}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[13px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <IconAlert size={13} />
                <span>Board trap</span>
              </h2>
              <div id="case-trap" className="p-3.5 rounded-r-xl bg-red-50/70 dark:bg-red-950/30 border-l-[3px] border-red-500 text-red-950 dark:text-red-200 leading-relaxed text-[15px]">
                {caseData.trap}
              </div>
            </div>

            <div id="case-quiz" className="pt-4 border-t border-[#E2E6EE] dark:border-white/10 space-y-3">
              <span className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT block">
                Mini-question drill
              </span>

              <p className="font-semibold text-[#0D1321] dark:text-white leading-relaxed text-[15px]">
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
                        'w-full flex items-center gap-2.5 p-3 rounded-lg border text-left text-[14px] transition-colors duration-150',
                        isPicked && !answerChecked
                          ? 'border-[#16236E] dark:border-orange-DEFAULT bg-[#EEF2FF]/60 dark:bg-white/5 font-semibold'
                          : 'border-[#E2E6EE] dark:border-white/10 hover:border-[#CBD2DF] dark:hover:border-white/20',
                        answerChecked && isCorrect && 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-900 dark:text-emerald-300 font-semibold',
                        answerChecked && !isCorrect && isPicked && 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-300'
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center text-[13px] font-bold shrink-0 tabular-nums',
                          answerChecked && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : answerChecked && isPicked
                            ? 'bg-red-600 text-white'
                            : isPicked
                            ? 'bg-[#16236E] text-white'
                            : 'bg-[#F1F3F7] dark:bg-[#131E36] text-[#526074] dark:text-slate-300'
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
                  className="py-2 px-5 rounded-full bg-[#16236E] text-white font-semibold text-[13px] hover:bg-[#0F1854] transition-colors duration-150 disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <div className="p-3.5 rounded-r-lg border-l-[3px] border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-[15px] leading-relaxed text-emerald-950 dark:text-emerald-200">
                  <strong>Explanation:</strong> {caseData.question.explanation}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[13px] font-semibold text-[#526074] dark:text-slate-400">High-yield facts</h2>
              <ul className="space-y-1.5">
                {caseData.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[15px] text-[#0D1321] dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT mt-2 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-[#E2E6EE] dark:border-white/10 bg-[#F7F8FA] dark:bg-[#080D1A]/70 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onToggleMaster(caseId)}
          className={cn(
            'py-1.5 px-3 rounded-lg text-[13px] font-semibold transition-colors duration-150 flex items-center gap-1.5 border',
            isMastered
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300'
              : 'border-[#E2E6EE] dark:border-white/15 text-[#526074] dark:text-slate-300 hover:bg-[#F1F3F7] dark:hover:bg-white/10'
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
            className="p-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
            title="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNextCase}
            className="p-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[#526074] hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
            title="Next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

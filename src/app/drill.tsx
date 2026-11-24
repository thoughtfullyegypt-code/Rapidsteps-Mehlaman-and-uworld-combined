import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DEMO_CASES } from '@/lib/catalog';
import { ATLAS_MANIFEST, useSystemAtlas } from '@/lib/atlas-data';
import { getDrillScore, updateDrillScore, resetDrillScore, DrillScore } from '@/lib/storage';
import { SystemIcon, IconCheck, IconX, IconZap } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface DrillProps {
  onOpenUnlock: () => void;
  onSelectCase: (caseId: string) => void;
}

type DrillMode = 'flashcards' | 'mcq';

interface UnifiedDrillQuestion {
  id: string;
  caseRefId?: string;
  systemName: string;
  stem: string;
  options: string[];
  correct: number;
  explanation: string;
  trap?: string;
  images?: string[];
}

interface FlashcardItem {
  id: string;
  num: number | string;
  q: string;
  a: string;
  topicId?: string | null;
  sourceTag?: string;
  images?: string[];
}

const CORE_DRILL_QUESTIONS: UnifiedDrillQuestion[] = Object.values(DEMO_CASES).map((c) => ({
  id: c.id,
  caseRefId: c.id,
  systemName: c.systemName,
  stem: `${c.vignette} ${c.question.stem}`,
  options: c.question.options,
  correct: c.question.correct,
  explanation: c.question.explanation,
  trap: c.trap,
}));

const MCQ_BANKS = [
  { id: 'mixed', label: 'Core Multi-System Vignettes' },
  { id: 'epi', label: 'Biostatistics & Medical Ethics (131)' },
  { id: 'biochem', label: 'Genetics & Hardy-Weinberg (48)' },
  { id: 'neuro', label: 'Ophthalmology & Neurolocalization (38)' },
];

export default function Drill({ onSelectCase }: DrillProps) {
  const [drillMode, setDrillMode] = useState<DrillMode>('flashcards');
  const [flashSysId, setFlashSysId] = useState<string>('cardio');
  const [bankId, setBankId] = useState<string>('mixed');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [score, setScore] = useState<DrillScore>(getDrillScore);

  const activeSysToLoad = drillMode === 'flashcards' ? flashSysId : bankId === 'mixed' ? null : bankId;
  const { data: sysAtlas, loading } = useSystemAtlas(activeSysToLoad);

  const mcqQuestions: UnifiedDrillQuestion[] = useMemo(() => {
    if (bankId === 'mixed') return CORE_DRILL_QUESTIONS;
    if (!sysAtlas) return [];
    return sysAtlas.rapidFireQAs
      .filter((q) => q.kind === 'mcq' && q.options && q.options.length >= 2 && q.correctIndex !== undefined)
      .map((q) => ({
        id: q.id,
        caseRefId: q.topicId || sysAtlas.topics[0]?.id,
        systemName: `${sysAtlas.title}${q.sourceTag ? ` · ${q.sourceTag}` : ''}`,
        stem: q.q,
        options: q.options!.map((o) => o.replace(/^[A-G]\)\s*/, '')),
        correct: q.correctIndex!,
        explanation: q.explanation || q.a,
        images: q.images,
      }));
  }, [bankId, sysAtlas]);

  const flashcards: FlashcardItem[] = useMemo(() => {
    if (!sysAtlas) return [];
    return sysAtlas.rapidFireQAs
      .filter((q) => q.kind !== 'mcq')
      .map((q) => ({
        id: q.id,
        num: q.num,
        q: q.q,
        a: q.a,
        topicId: q.topicId || sysAtlas.topics[0]?.id,
        sourceTag: q.sourceTag,
        images: q.images,
      }));
  }, [sysAtlas]);

  const totalCount = drillMode === 'mcq' ? mcqQuestions.length : flashcards.length;
  const currentQ = mcqQuestions[currentIndex] || mcqQuestions[0];
  const currentCard = flashcards[currentIndex] || flashcards[0];

  const resetCardState = useCallback(() => {
    setSelectedOption(null);
    setSubmitted(false);
    setCardRevealed(false);
  }, []);

  const handleStep = useCallback(
    (delta: 1 | -1) => {
      resetCardState();
      if (totalCount > 0) {
        setCurrentIndex((prev) => (prev + delta + totalCount) % totalCount);
      }
    },
    [resetCardState, totalCount]
  );

  const handleShuffle = useCallback(() => {
    if (totalCount <= 1) return;
    resetCardState();
    setCurrentIndex(Math.floor(Math.random() * totalCount));
  }, [resetCardState, totalCount]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (submitted) return;
      setSelectedOption(index);
    },
    [submitted]
  );

  const handleSubmitMcq = useCallback(() => {
    if (selectedOption === null || submitted || !currentQ) return;
    setSubmitted(true);
    const isCorrect = selectedOption === currentQ.correct;
    updateDrillScore(isCorrect);
    setScore(getDrillScore());
  }, [selectedOption, submitted, currentQ]);

  const handleGradeFlashcard = useCallback(
    (knewIt: boolean) => {
      updateDrillScore(knewIt);
      setScore(getDrillScore());
      handleStep(1);
    },
    [handleStep]
  );

  const handleResetScore = () => {
    resetDrillScore();
    setScore({ correct: 0, total: 0 });
  };

  // Keyboard shortcuts for fast study flow
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStep(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStep(-1);
        return;
      }

      if (drillMode === 'flashcards') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!cardRevealed) {
            setCardRevealed(true);
          } else {
            handleGradeFlashcard(true);
          }
        } else if (cardRevealed && e.key === '1') {
          e.preventDefault();
          handleGradeFlashcard(true);
        } else if (cardRevealed && e.key === '2') {
          e.preventDefault();
          handleGradeFlashcard(false);
        }
      } else if (drillMode === 'mcq' && currentQ) {
        const keyUpper = e.key.toUpperCase();
        const letterIdx = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(keyUpper);
        const numIdx = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
        const chosenIdx = letterIdx !== -1 ? letterIdx : numIdx;

        if (!submitted && chosenIdx !== -1 && chosenIdx < currentQ.options.length) {
          e.preventDefault();
          handleSelectOption(chosenIdx);
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (!submitted && selectedOption !== null) {
            e.preventDefault();
            handleSubmitMcq();
          } else if (submitted) {
            e.preventDefault();
            handleStep(1);
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    drillMode,
    cardRevealed,
    submitted,
    selectedOption,
    currentQ,
    handleStep,
    handleGradeFlashcard,
    handleSelectOption,
    handleSubmitMcq,
  ]);

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F7F8FA] dark:bg-[#080D1A]">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-7 space-y-5">
        {/* Top Mode & Score Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E1629] p-3.5 md:p-4 rounded-xl border border-[#E2E6EE] dark:border-white/10">
          {/* Segmented Mode Switch */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F3F7] dark:bg-[#131E36] border border-[#E2E6EE] dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setDrillMode('flashcards');
                setCurrentIndex(0);
                resetCardState();
              }}
              className={cn(
                'px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-150 inline-flex items-center gap-1.5',
                drillMode === 'flashcards'
                  ? 'bg-[#16236E] text-white'
                  : 'text-[#526074] dark:text-slate-300 hover:text-[#0D1321] dark:hover:text-white'
              )}
            >
              <IconZap size={13} />
              <span>16-System Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDrillMode('mcq');
                setCurrentIndex(0);
                resetCardState();
              }}
              className={cn(
                'px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-150',
                drillMode === 'mcq'
                  ? 'bg-[#16236E] text-white'
                  : 'text-[#526074] dark:text-slate-300 hover:text-[#0D1321] dark:hover:text-white'
              )}
            >
              Multiple-Choice (MCQs)
            </button>
          </div>

          {/* Session Score */}
          <div className="flex items-center gap-2.5">
            <div className="text-[13px] font-semibold text-[#0D1321] dark:text-slate-200 bg-[#F1F3F7] dark:bg-[#131E36] px-3 py-1.5 rounded-lg tabular-nums">
              Score: <span className="text-emerald-700 dark:text-emerald-400">{score.correct}</span>/{score.total} (
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
            </div>
            {score.total > 0 && (
              <button
                type="button"
                onClick={handleResetScore}
                className="text-[13px] font-medium text-[#526074] hover:text-[#0D1321] dark:hover:text-slate-200 transition-colors duration-150"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* System / Bank Selector */}
        {drillMode === 'flashcards' ? (
          <div className="rs-pill-strip flex items-center gap-1.5 pb-0.5">
            {ATLAS_MANIFEST.systems.map((sys) => {
              const active = sys.systemId === flashSysId;
              return (
                <button
                  key={sys.systemId}
                  type="button"
                  onClick={() => {
                    setFlashSysId(sys.systemId);
                    setCurrentIndex(0);
                    resetCardState();
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap border transition-colors duration-150 inline-flex items-center gap-1.5',
                    active
                      ? 'bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-[#16236E] dark:border-orange-DEFAULT'
                      : 'bg-white dark:bg-[#0E1629] text-[#526074] dark:text-slate-300 border-[#E2E6EE] dark:border-white/10 hover:border-[#CBD2DF]'
                  )}
                >
                  <SystemIcon systemId={sys.systemId} size={13} />
                  <span>{sys.short}</span>
                  <span className="text-[13px] opacity-75 tabular-nums">{sys.stats.rapidFireQAs}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {MCQ_BANKS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBankId(b.id);
                  setCurrentIndex(0);
                  resetCardState();
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors duration-150',
                  bankId === b.id
                    ? 'bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-[#16236E] dark:border-orange-DEFAULT'
                    : 'bg-white dark:bg-[#0E1629] text-[#526074] dark:text-slate-300 border-[#E2E6EE] dark:border-white/10 hover:border-[#CBD2DF]'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="py-16 text-center text-[13px] font-medium text-[#526074]">
            Loading study items…
          </div>
        )}

        {/* ==================== MODE A: 16-SYSTEM FLASHCARDS ==================== */}
        {!loading && drillMode === 'flashcards' && currentCard && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px] text-[#526074] dark:text-slate-400">
              <span className="font-semibold text-[#16236E] dark:text-orange-DEFAULT tabular-nums">
                Card {currentIndex + 1} of {flashcards.length} · {sysAtlas?.title}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="font-medium text-[#526074] hover:text-[#0D1321] dark:hover:text-white transition-colors duration-150"
                >
                  Shuffle
                </button>
                {currentCard.topicId && (
                  <button
                    type="button"
                    onClick={() => onSelectCase(currentCard.topicId!)}
                    className="font-semibold text-[#16236E] dark:text-orange-DEFAULT hover:underline"
                  >
                    Open topic →
                  </button>
                )}
              </div>
            </div>

            {/* Flashcard Box */}
            <div
              onClick={() => !cardRevealed && setCardRevealed(true)}
              className={cn(
                'p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0E1629] border border-[#E2E6EE] dark:border-white/10 space-y-5 transition-colors duration-150',
                !cardRevealed && 'cursor-pointer hover:border-[#CBD2DF] dark:hover:border-white/20'
              )}
            >
              <div className="space-y-3">
                <span className="inline-block text-[13px] font-semibold px-2.5 py-0.5 rounded bg-[#F1F3F7] dark:bg-[#131E36] text-[#526074] dark:text-slate-300 tabular-nums">
                  Prompt #{currentCard.num}
                </span>
                <p className="text-[16px] md:text-[18px] font-bold text-[#0D1321] dark:text-white leading-relaxed max-w-[68ch]">
                  {currentCard.q}
                </p>

                {currentCard.images && currentCard.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {currentCard.images.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt="Clinical prompt figure"
                        className="max-h-56 w-auto rounded-xl border border-[#E2E6EE] dark:border-white/10 bg-[#F7F8FA] p-1.5 object-contain"
                      />
                    ))}
                  </div>
                )}
              </div>

              {cardRevealed ? (
                <div className="pt-5 border-t border-[#E2E6EE] dark:border-white/10 space-y-4 rs-fade-in">
                  <div className="p-4 rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-[15px] text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium max-w-[68ch]">
                    <strong className="font-semibold">→ </strong>
                    {currentCard.a}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGradeFlashcard(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors duration-150"
                      >
                        <IconCheck size={14} />
                        <span>Got it</span>
                        <span className="rs-kbd bg-emerald-700 text-white border-emerald-500">1</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGradeFlashcard(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#F1F3F7] dark:bg-[#131E36] hover:bg-[#E2E6EE] dark:hover:bg-white/10 text-[#0D1321] dark:text-slate-200 text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors duration-150"
                      >
                        <IconX size={13} />
                        <span>Review again</span>
                        <span className="rs-kbd">2</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStep(-1);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[13px] font-semibold text-[#526074] dark:text-slate-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStep(1);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[13px] font-semibold text-[#526074] dark:text-slate-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5"
                      >
                        Skip →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#E2E6EE] dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCardRevealed(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-semibold text-[13px] hover:opacity-95 transition-opacity duration-150 inline-flex items-center gap-2"
                  >
                    <span>Reveal answer</span>
                    <span className="rs-kbd bg-white/20 text-current border-white/20">Space</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStep(-1);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[13px] font-semibold text-[#526074] hover:bg-[#F7F8FA] dark:hover:bg-white/5"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStep(1);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[13px] font-semibold text-[#526074] hover:bg-[#F7F8FA] dark:hover:bg-white/5"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== MODE B: MULTIPLE CHOICE (MCQS) ==================== */}
        {!loading && drillMode === 'mcq' && currentQ && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[#16236E] dark:text-orange-DEFAULT tabular-nums">
                Question {currentIndex + 1} of {mcqQuestions.length} · {currentQ.systemName}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="font-medium text-[#526074] hover:text-[#0D1321] dark:hover:text-white"
                >
                  Shuffle
                </button>
                {currentQ.caseRefId && (
                  <button
                    type="button"
                    onClick={() => onSelectCase(currentQ.caseRefId!)}
                    className="text-[#16236E] dark:text-orange-DEFAULT hover:underline font-semibold"
                  >
                    Open topic →
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white dark:bg-[#0E1629] border border-[#E2E6EE] dark:border-white/10 space-y-4">
              <p className="text-[#0D1321] dark:text-slate-100 text-[15px] md:text-base font-medium leading-relaxed max-w-[68ch]">
                {currentQ.stem}
              </p>
              {currentQ.images && currentQ.images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {currentQ.images.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt="Question clinical figure"
                      className="max-h-60 w-auto rounded-xl border border-[#E2E6EE] dark:border-white/10 bg-[#F7F8FA] p-1.5 object-contain"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const isPicked = selectedOption === idx;
                const isCorrect = idx === currentQ.correct;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      'w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors duration-150',
                      !submitted && isPicked && 'border-[#16236E] dark:border-orange-DEFAULT bg-[#EEF2FF]/60 dark:bg-orange-DEFAULT/15 font-semibold',
                      !submitted && !isPicked && 'border-[#E2E6EE] dark:border-white/10 bg-white dark:bg-[#0E1629] hover:border-[#CBD2DF]',
                      submitted && isCorrect && 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold',
                      submitted && !isCorrect && isPicked && 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200',
                      submitted && !isCorrect && !isPicked && 'opacity-50 border-[#E2E6EE] dark:border-white/5 bg-white dark:bg-[#0E1629]'
                    )}
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center text-[13px] font-bold flex-shrink-0 tabular-nums',
                        submitted && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : submitted && isPicked
                          ? 'bg-red-600 text-white'
                          : isPicked
                          ? 'bg-[#16236E] text-white'
                          : 'bg-[#F1F3F7] dark:bg-[#131E36] text-[#526074] dark:text-slate-300'
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-[15px] text-[#0D1321] dark:text-slate-100">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              {!submitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitMcq}
                  className="px-5 py-2.5 rounded-xl bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-semibold text-[13px] hover:opacity-95 disabled:opacity-40 transition-opacity duration-150"
                >
                  Check answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-semibold text-[13px] hover:opacity-95 transition-opacity duration-150"
                >
                  Next question →
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  className="px-3 py-2 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[13px] font-semibold text-[#526074] hover:bg-white dark:hover:bg-[#0E1629]"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="px-3 py-2 rounded-lg border border-[#E2E6EE] dark:border-white/10 text-[13px] font-semibold text-[#526074] hover:bg-white dark:hover:bg-[#0E1629]"
                >
                  Next →
                </button>
              </div>
            </div>

            {submitted && (
              <div className="p-5 rounded-xl bg-white dark:bg-[#0E1629] border border-[#E2E6EE] dark:border-white/10 space-y-2.5 rs-fade-in">
                <div
                  className={cn(
                    'text-[13px] font-semibold inline-flex items-center gap-1.5',
                    selectedOption === currentQ.correct
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {selectedOption === currentQ.correct ? <IconCheck size={14} /> : <IconX size={14} />}
                  <span>{selectedOption === currentQ.correct ? 'Correct' : 'Review key distinction'}</span>
                </div>
                <p className="text-[15px] text-[#0D1321] dark:text-slate-200 leading-relaxed max-w-[68ch]">
                  {currentQ.explanation}
                </p>
                {currentQ.trap && (
                  <div className="p-3.5 rounded-r-lg border-l-[3px] border-[#FF8C1A] bg-[#FFF4E5]/70 dark:bg-orange-DEFAULT/10 text-[15px] text-[#0D1321] dark:text-amber-200 leading-relaxed max-w-[68ch]">
                    <strong className="font-semibold">Exam trap: </strong>
                    {currentQ.trap}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

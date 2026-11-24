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
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-navy-950">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-7 space-y-5">
        {/* Top Mode & Score Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-navy-900 p-3.5 md:p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
          {/* Segmented Mode Switch */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setDrillMode('flashcards');
                setCurrentIndex(0);
                resetCardState();
              }}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-bold transition-colors inline-flex items-center gap-1.5',
                drillMode === 'flashcards'
                  ? 'bg-navy-DEFAULT text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
                'px-3 py-1.5 rounded-md text-xs font-bold transition-colors',
                drillMode === 'mcq'
                  ? 'bg-navy-DEFAULT text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Multiple-Choice (MCQs)
            </button>
          </div>

          {/* Session Score */}
          <div className="flex items-center gap-2.5">
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 px-3 py-1.5 rounded-lg">
              Score: <span className="text-emerald-600 dark:text-emerald-400">{score.correct}</span>/{score.total} (
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
            </div>
            {score.total > 0 && (
              <button
                type="button"
                onClick={handleResetScore}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* System / Bank Selector */}
        {drillMode === 'flashcards' ? (
          <div className="rs-pill-strip flex items-center gap-1 pb-0.5">
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
                    'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors inline-flex items-center gap-1.5',
                    active
                      ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT'
                      : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  )}
                >
                  <SystemIcon systemId={sys.systemId} size={13} />
                  <span>{sys.short}</span>
                  <span className="text-[10px] font-mono opacity-70">{sys.stats.rapidFireQAs}</span>
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
                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                  bankId === b.id
                    ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="py-16 text-center text-xs font-bold text-slate-400">
            Loading study items…
          </div>
        )}

        {/* ==================== MODE A: 16-SYSTEM FLASHCARDS ==================== */}
        {!loading && drillMode === 'flashcards' && currentCard && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono font-bold uppercase text-navy-DEFAULT dark:text-orange-DEFAULT">
                Card {currentIndex + 1} of {flashcards.length} · {sysAtlas?.title}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Shuffle
                </button>
                {currentCard.topicId && (
                  <button
                    type="button"
                    onClick={() => onSelectCase(currentCard.topicId!)}
                    className="font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline"
                  >
                    Open Topic →
                  </button>
                )}
              </div>
            </div>

            {/* Flashcard Box */}
            <div
              onClick={() => !cardRevealed && setCardRevealed(true)}
              className={cn(
                'p-6 md:p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-5 transition-colors',
                !cardRevealed && 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20'
              )}
            >
              <div className="space-y-3">
                <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                  Prompt #{currentCard.num}
                </span>
                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentCard.q}
                </p>

                {currentCard.images && currentCard.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {currentCard.images.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt="Clinical prompt figure"
                        className="max-h-56 w-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 p-1.5 object-contain"
                      />
                    ))}
                  </div>
                )}
              </div>

              {cardRevealed ? (
                <div className="pt-5 border-t border-slate-200 dark:border-white/10 space-y-4 rs-fade-in">
                  <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-sm md:text-base text-emerald-950 dark:text-emerald-100 leading-relaxed font-semibold">
                    <strong className="font-extrabold">→ </strong>
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
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <IconCheck size={14} />
                        <span>Got It</span>
                        <span className="rs-kbd bg-emerald-700 text-white border-emerald-500">1</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGradeFlashcard(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <IconX size={13} />
                        <span>Review Again</span>
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
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStep(1);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      >
                        Skip →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCardRevealed(true)}
                    className="px-5 py-2.5 rounded-xl bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-extrabold text-xs hover:opacity-95 transition-opacity inline-flex items-center gap-2"
                  >
                    <span>Reveal Answer</span>
                    <span className="rs-kbd bg-white/20 text-current border-white/20">Space</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStep(-1);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStep(1);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
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
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider font-bold text-navy-DEFAULT dark:text-orange-DEFAULT">
                Question {currentIndex + 1} of {mcqQuestions.length} · {currentQ.systemName}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Shuffle
                </button>
                {currentQ.caseRefId && (
                  <button
                    type="button"
                    onClick={() => onSelectCase(currentQ.caseRefId!)}
                    className="text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline font-bold"
                  >
                    Open Topic →
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 md:p-6 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-2xs space-y-4">
              <p className="text-slate-900 dark:text-slate-100 text-sm md:text-base font-medium leading-relaxed">
                {currentQ.stem}
              </p>
              {currentQ.images && currentQ.images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {currentQ.images.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt="Question clinical figure"
                      className="max-h-60 w-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 p-1.5 object-contain"
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
                      'w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors',
                      !submitted && isPicked && 'border-navy-DEFAULT dark:border-orange-DEFAULT bg-navy-50/70 dark:bg-orange-DEFAULT/15 font-semibold',
                      !submitted && !isPicked && 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 hover:border-slate-300',
                      submitted && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold',
                      submitted && !isCorrect && isPicked && 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200',
                      submitted && !isCorrect && !isPicked && 'opacity-50 border-slate-200 dark:border-white/5 bg-white dark:bg-navy-900'
                    )}
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold flex-shrink-0',
                        submitted && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : submitted && isPicked
                          ? 'bg-red-600 text-white'
                          : isPicked
                          ? 'bg-navy-DEFAULT text-white'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-100">{option}</span>
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
                  className="px-5 py-2.5 rounded-xl bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-extrabold text-xs hover:opacity-95 disabled:opacity-40 transition-opacity"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-extrabold text-xs hover:opacity-95 transition-opacity"
                >
                  Next Question →
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-navy-900"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-navy-900"
                >
                  Next →
                </button>
              </div>
            </div>

            {submitted && (
              <div className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 space-y-2.5 rs-fade-in">
                <div
                  className={cn(
                    'text-xs font-extrabold inline-flex items-center gap-1.5',
                    selectedOption === currentQ.correct
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {selectedOption === currentQ.correct ? <IconCheck size={14} /> : <IconX size={14} />}
                  <span>{selectedOption === currentQ.correct ? 'Correct' : 'Review Key Distinction'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {currentQ.explanation}
                </p>
                {currentQ.trap && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-amber-200 leading-relaxed">
                    <strong className="font-bold">Exam Trap: </strong>
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

import React, { useState, useMemo } from 'react';
import { DEMO_CASES, getAlsoInLabel } from '@/lib/catalog';
import { ATLAS_MANIFEST, useSystemAtlas } from '@/lib/atlas-data';
import { getDrillScore, updateDrillScore, resetDrillScore, DrillScore } from '@/lib/storage';
import { IconCheck, IconX } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface DrillProps {
  onOpenUnlock: () => void;
  onSelectCase: (caseId: string) => void;
}

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
  /** System ids this question also appears in (cross-system spaced repetition). */
  alsoIn?: string[];
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
  { id: 'epi', label: 'Biostatistics & Medical Ethics MCQs' },
  { id: 'biochem', label: 'Medical Genetics & Hardy-Weinberg MCQs' },
  { id: 'neuro', label: 'Ophthalmology & Neurolocalization MCQs' },
];

export default function Drill({ onSelectCase }: DrillProps) {
  const [bankId, setBankId] = useState<string>('mixed');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<DrillScore>(getDrillScore);

  const { data: sysAtlas, loading } = useSystemAtlas(bankId === 'mixed' ? null : bankId);

  const questions: UnifiedDrillQuestion[] = useMemo(() => {
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
        alsoIn: q.alsoIn,
      }));
  }, [bankId, sysAtlas]);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (index: number) => {
    if (submitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || submitted || !currentQ) return;
    setSubmitted(true);
    const isCorrect = selectedOption === currentQ.correct;
    updateDrillScore(isCorrect);
    setScore(getDrillScore());
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    if (questions.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % questions.length);
    }
  };

  const handleResetScore = () => {
    resetDrillScore();
    setScore({ correct: 0, total: 0 });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col justify-between min-h-full">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="drill-system-filter" className="sr-only">
              Select Question Bank
            </label>
            <select
              id="drill-system-filter"
              value={bankId}
              onChange={(e) => {
                setBankId(e.target.value);
                setCurrentIndex(0);
                setSelectedOption(null);
                setSubmitted(false);
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-900 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              {MCQ_BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 px-3 py-1.5 rounded-xl">
              Score: <span className="text-emerald-600 dark:text-emerald-400">{score.correct}</span> / {score.total} (
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
            </div>
            <button
              type="button"
              onClick={handleResetScore}
              className="min-h-[44px] px-2 inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm font-semibold text-slate-400">
            Loading question bank…
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No MCQs in this bank yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try another question bank, or practice every Q&amp;A in the Atlas Hub.
            </p>
          </div>
        )}

        {!loading && currentQ && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono uppercase tracking-wider font-bold text-orange-rust dark:text-orange-DEFAULT">
                Question {currentIndex + 1} of {questions.length} · {currentQ.systemName}
              </span>
              {currentQ.caseRefId && (
                <button
                  type="button"
                  onClick={() => onSelectCase(currentQ.caseRefId!)}
                  className="min-h-[44px] px-1 inline-flex items-center shrink-0 text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline font-bold"
                >
                  Open related topic →
                </button>
              )}
            </div>

            {(() => {
              const repeatLabel = getAlsoInLabel(
                currentQ.alsoIn,
                bankId === 'mixed' ? null : bankId
              );
              return repeatLabel ? (
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    {repeatLabel}
                  </span>
                </div>
              ) : null;
            })()}

            <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <p className="text-vignette text-slate-800 dark:text-slate-100 text-base md:text-lg leading-relaxed">
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

            <div className="space-y-2.5">
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
                      'w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all min-h-[52px]',
                      !submitted && isPicked && 'border-navy-DEFAULT dark:border-orange-DEFAULT bg-navy-50 dark:bg-orange-DEFAULT/15 font-semibold',
                      !submitted && !isPicked && 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 hover:border-slate-400',
                      submitted && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold',
                      submitted && !isCorrect && isPicked && 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200',
                      submitted && !isCorrect && !isPicked && 'opacity-50 border-slate-200 dark:border-white/5 bg-white dark:bg-navy-900'
                    )}
                  >
                    <span
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0',
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
                    <span className="text-sm text-slate-800 dark:text-slate-100">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {!submitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-full bg-orange-DEFAULT text-navy-950 font-extrabold text-sm hover:bg-orange-hover disabled:opacity-40 transition-all"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-full bg-navy-DEFAULT text-white font-extrabold text-sm hover:bg-navy-500 transition-all"
                >
                  Next Question →
                </button>
              )}
            </div>

            {submitted && (
              <div
                role="status"
                aria-live="polite"
                className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 space-y-3 rs-fade-in"
              >
                <div
                  className={cn(
                    'text-sm font-extrabold inline-flex items-center gap-1.5',
                    selectedOption === currentQ.correct
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {selectedOption === currentQ.correct ? <IconCheck size={15} /> : <IconX size={15} />}
                  <span>{selectedOption === currentQ.correct ? 'Correct!' : 'Review Key Distinction'}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {currentQ.explanation}
                </p>
                {currentQ.trap && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-amber-200 leading-relaxed">
                    <strong className="font-bold">Exam Trap: </strong>
                    {currentQ.trap}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>Switch to Atlas Hub → Q&amp;A to practice all {ATLAS_MANIFEST.totals.rapidFireQAs.toLocaleString()} vignettes, MCQs &amp; physiological arrow drills across all 16 systems.</span>
      </div>
      </div>
    </div>
  );
}

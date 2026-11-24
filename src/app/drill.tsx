import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DEMO_CASES, getAlsoInLabel } from '@/lib/catalog';
import {
  ATLAS_MANIFEST,
  useSystemAtlas,
  loadSystemsAtlas,
  SystemAtlasPayload,
} from '@/lib/atlas-data';
import {
  getDrillScore,
  updateDrillScore,
  resetDrillScore,
  DrillScore,
  getMissedDrillItems,
  markDrillMissed,
  clearDrillMissed,
  MissedDrillItem,
  recordCardSrs,
  recordStudyActivity,
  addMistake,
} from '@/lib/storage';
import ScrollStrip from '@/components/ScrollStrip';
import { SystemIcon, IconCheck, IconX, IconZap } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface DrillProps {
  initialSystemId?: string;
  onOpenUnlock: () => void;
  onSelectCase: (caseId: string) => void;
  onOpenLabValues?: () => void;
  onMistakeAdded?: () => void;
}

type DrillMode = 'flashcards' | 'mcq';

interface UnifiedDrillQuestion {
  id: string;
  systemId: string;
  caseRefId?: string;
  systemName: string;
  stem: string;
  options: string[];
  correct: number;
  explanation: string;
  trap?: string;
  images?: string[];
  alsoIn?: string[];
}

interface FlashcardItem {
  id: string;
  systemId: string;
  systemTitle: string;
  num: number | string;
  kind?: 'qa' | 'mcq' | 'arrow';
  q: string;
  a: string;
  topicId?: string | null;
  sourceTag?: string;
  images?: string[];
}

const CORE_DRILL_QUESTIONS: UnifiedDrillQuestion[] = Object.values(DEMO_CASES).map((c) => ({
  id: c.id,
  systemId: c.systemId,
  caseRefId: c.id,
  systemName: c.systemName,
  stem: `${c.vignette} ${c.question.stem}`,
  options: c.question.options,
  correct: c.question.correct,
  explanation: c.question.explanation,
  trap: c.trap,
}));

const MCQ_BANKS = [
  { id: 'all_mcq', label: 'All 227 MCQs (Mixed)' },
  { id: 'mixed', label: 'Core Multi-System Vignettes (10)' },
  { id: 'epi', label: 'Biostatistics & Medical Ethics (131)' },
  { id: 'biochem', label: 'Genetics & Hardy-Weinberg (48)' },
  { id: 'neuro', label: 'Ophthalmology & Neurolocalization (38)' },
];

const MCQ_SYSTEM_IDS = ['epi', 'biochem', 'neuro'];

function shuffleArrayIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Drill({
  initialSystemId,
  onSelectCase,
  onOpenLabValues,
  onMistakeAdded,
}: DrillProps) {
  const [drillMode, setDrillMode] = useState<DrillMode>('flashcards');
  const [flashDeckId, setFlashDeckId] = useState<string>(initialSystemId || 'cardio');
  const [bankId, setBankId] = useState<string>('all_mcq');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [deckOrder, setDeckOrder] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [struckOptions, setStruckOptions] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [score, setScore] = useState<DrillScore>(getDrillScore);

  const [missedItems, setMissedItems] = useState<MissedDrillItem[]>(getMissedDrillItems);
  const [loggedItemIds, setLoggedItemIds] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  // Optional 90s USMLE Step 1 pacing timer for MCQs
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);

  // Sync if user clicked "Drill in Flashcards →" from Atlas Hub
  useEffect(() => {
    if (initialSystemId) {
      setDrillMode('flashcards');
      setFlashDeckId(initialSystemId);
      setCurrentIndex(0);
      setCardRevealed(false);
    }
  }, [initialSystemId]);

  const isSingleFlashSystem =
    drillMode === 'flashcards' &&
    flashDeckId !== 'review' &&
    flashDeckId !== 'all16' &&
    flashDeckId !== 'arrows';

  const activeSingleSys = isSingleFlashSystem
    ? flashDeckId
    : drillMode === 'mcq' && MCQ_SYSTEM_IDS.includes(bankId)
    ? bankId
    : null;

  const { data: sysAtlas, loading: singleLoading } = useSystemAtlas(activeSingleSys);

  // Multi-system payloads (loaded cleanly on demand for review / all16 / arrows / all_mcq)
  const [multiPayloads, setMultiPayloads] = useState<SystemAtlasPayload[] | null>(null);
  const [multiLoading, setMultiLoading] = useState(false);

  const multiTargetIds = useMemo(() => {
    if (drillMode === 'mcq' && bankId === 'all_mcq') {
      return MCQ_SYSTEM_IDS;
    }
    if (drillMode === 'flashcards') {
      if (flashDeckId === 'all16' || flashDeckId === 'arrows') {
        return ATLAS_MANIFEST.systems.map((s) => s.systemId);
      }
      if (flashDeckId === 'review') {
        return Array.from(new Set(missedItems.map((m) => m.systemId)));
      }
    }
    return null;
  }, [drillMode, flashDeckId, bankId, missedItems]);

  const multiKey = multiTargetIds ? multiTargetIds.join(',') : '';

  useEffect(() => {
    if (!multiTargetIds) {
      setMultiPayloads(null);
      setMultiLoading(false);
      return;
    }
    if (multiTargetIds.length === 0) {
      setMultiPayloads([]);
      setMultiLoading(false);
      return;
    }
    let cancelled = false;
    setMultiLoading(true);
    loadSystemsAtlas(multiTargetIds)
      .then((res) => {
        if (!cancelled) {
          setMultiPayloads(res);
          setMultiLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setMultiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [multiKey]);

  const loading = singleLoading || multiLoading;

  const mcqQuestions: UnifiedDrillQuestion[] = useMemo(() => {
    if (bankId === 'mixed') return CORE_DRILL_QUESTIONS;
    if (bankId === 'all_mcq') {
      if (!multiPayloads) return [];
      const fetchedMcqs: UnifiedDrillQuestion[] = [];
      for (const sys of multiPayloads) {
        for (const q of sys.rapidFireQAs) {
          if (q.kind === 'mcq' && q.options && q.options.length >= 2 && q.correctIndex !== undefined) {
            fetchedMcqs.push({
              id: q.id,
              systemId: sys.systemId,
              caseRefId: q.topicId || sys.topics[0]?.id,
              systemName: `${sys.title}${q.sourceTag ? ` · ${q.sourceTag}` : ''}`,
              stem: q.q,
              options: q.options.map((o) => o.replace(/^[A-G]\)\s*/, '')),
              correct: q.correctIndex,
              explanation: q.explanation || q.a,
              images: q.images,
              alsoIn: q.alsoIn,
            });
          }
        }
      }
      return [...CORE_DRILL_QUESTIONS, ...fetchedMcqs];
    }
    if (!sysAtlas) return [];
    return sysAtlas.rapidFireQAs
      .filter((q) => q.kind === 'mcq' && q.options && q.options.length >= 2 && q.correctIndex !== undefined)
      .map((q) => ({
        id: q.id,
        systemId: sysAtlas.systemId,
        caseRefId: q.topicId || sysAtlas.topics[0]?.id,
        systemName: `${sysAtlas.title}${q.sourceTag ? ` · ${q.sourceTag}` : ''}`,
        stem: q.q,
        options: q.options!.map((o) => o.replace(/^[A-G]\)\s*/, '')),
        correct: q.correctIndex!,
        explanation: q.explanation || q.a,
        images: q.images,
        alsoIn: q.alsoIn,
      }));
  }, [bankId, sysAtlas, multiPayloads]);

  const flashcards: FlashcardItem[] = useMemo(() => {
    if (flashDeckId === 'review') {
      if (!multiPayloads) return [];
      const missedSet = new Set(missedItems.map((m) => m.id));
      const byId = new Map<string, FlashcardItem>();
      for (const sys of multiPayloads) {
        for (const q of sys.rapidFireQAs) {
          if (q.kind !== 'mcq' && missedSet.has(q.id)) {
            byId.set(q.id, {
              id: q.id,
              systemId: sys.systemId,
              systemTitle: sys.title,
              num: q.num,
              kind: q.kind,
              q: q.q,
              a: q.a,
              topicId: q.topicId || sys.topics[0]?.id,
              sourceTag: q.sourceTag,
              images: q.images,
            });
          }
        }
      }
      return missedItems.map((m) => byId.get(m.id)).filter((x): x is FlashcardItem => Boolean(x));
    }

    if (flashDeckId === 'all16' || flashDeckId === 'arrows') {
      if (!multiPayloads) return [];
      const out: FlashcardItem[] = [];
      for (const sys of multiPayloads) {
        for (const q of sys.rapidFireQAs) {
          if (q.kind === 'mcq') continue;
          if (flashDeckId === 'arrows' && q.kind !== 'arrow') continue;
          out.push({
            id: q.id,
            systemId: sys.systemId,
            systemTitle: sys.title,
            num: q.num,
            kind: q.kind,
            q: q.q,
            a: q.a,
            topicId: q.topicId || sys.topics[0]?.id,
            sourceTag: q.sourceTag,
            images: q.images,
          });
        }
      }
      return out;
    }

    if (!sysAtlas) return [];
    return sysAtlas.rapidFireQAs
      .filter((q) => q.kind !== 'mcq')
      .map((q) => ({
        id: q.id,
        systemId: sysAtlas.systemId,
        systemTitle: sysAtlas.title,
        num: q.num,
        kind: q.kind,
        q: q.q,
        a: q.a,
        topicId: q.topicId || sysAtlas.topics[0]?.id,
        sourceTag: q.sourceTag,
        images: q.images,
      }));
  }, [flashDeckId, sysAtlas, multiPayloads, missedItems]);

  const rawItemsLength = drillMode === 'mcq' ? mcqQuestions.length : flashcards.length;
  const deckKey = drillMode === 'mcq' ? `mcq:${bankId}:${rawItemsLength}` : `fc:${flashDeckId}:${rawItemsLength}`;
  const prevDeckSignatureRef = React.useRef<string>('');

  // Rebuild sequential deckOrder whenever deck source changes (preserve on minor review-queue removals if same deck mode)
  useEffect(() => {
    const modePrefix = drillMode === 'mcq' ? `mcq:${bankId}` : `fc:${flashDeckId}`;
    const prevPrefix = prevDeckSignatureRef.current.split('|')[0];

    if (modePrefix !== prevPrefix || deckOrder.length === 0 || (modePrefix !== 'fc:review' && prevDeckSignatureRef.current !== deckKey)) {
      setDeckOrder(Array.from({ length: rawItemsLength }, (_, i) => i));
      setIsShuffled(false);
      setCurrentIndex(0);
    } else if (modePrefix === 'fc:review') {
      // Remove out-of-range entries cleanly while preserving progress in Needs Review
      setDeckOrder((prev) => {
        const valid = prev.filter((idx) => idx < rawItemsLength);
        return valid.length > 0 ? valid : Array.from({ length: rawItemsLength }, (_, i) => i);
      });
      setCurrentIndex((prev) => (rawItemsLength === 0 ? 0 : Math.min(prev, Math.max(0, rawItemsLength - 1))));
    }
    prevDeckSignatureRef.current = `${modePrefix}|${rawItemsLength}`;
  }, [drillMode, bankId, flashDeckId, rawItemsLength, deckKey]);

  const orderLength = deckOrder.length > 0 ? deckOrder.length : rawItemsLength;
  const safePos = orderLength > 0 ? Math.min(currentIndex, orderLength - 1) : 0;
  const resolvedIndex = deckOrder[safePos] ?? safePos;

  const currentQ = mcqQuestions[resolvedIndex] || mcqQuestions[0];
  const currentCard = flashcards[resolvedIndex] || flashcards[0];

  const resetCardState = useCallback(() => {
    setSelectedOption(null);
    setStruckOptions(new Set());
    setSubmitted(false);
    setCardRevealed(false);
    setSecondsLeft(90);
  }, []);

  // Optional MCQ pacing timer countdown
  useEffect(() => {
    if (!timerEnabled || timerPaused || drillMode !== 'mcq' || submitted || !currentQ) return;
    const iv = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, [timerEnabled, timerPaused, drillMode, submitted, currentQ]);

  const handleStep = useCallback(
    (delta: 1 | -1) => {
      resetCardState();
      if (orderLength > 0) {
        setCurrentIndex((prev) => (prev + delta + orderLength) % orderLength);
      }
    },
    [resetCardState, orderLength]
  );

  const handleToggleShuffle = useCallback(() => {
    if (rawItemsLength <= 1) return;
    resetCardState();
    if (isShuffled) {
      setDeckOrder(Array.from({ length: rawItemsLength }, (_, i) => i));
      setIsShuffled(false);
    } else {
      setDeckOrder(shuffleArrayIndices(rawItemsLength));
      setIsShuffled(true);
    }
    setCurrentIndex(0);
  }, [rawItemsLength, isShuffled, resetCardState]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (submitted) return;
      setSelectedOption(index);
    },
    [submitted]
  );

  const toggleOptionStrike = useCallback(
    (index: number) => {
      if (submitted) return;
      setStruckOptions((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    },
    [submitted]
  );

  const handleSubmitMcq = useCallback(() => {
    if (selectedOption === null || submitted || !currentQ) return;
    setSubmitted(true);
    const isCorrect = selectedOption === currentQ.correct;
    updateDrillScore(isCorrect);
    setScore(getDrillScore());
    recordStudyActivity();
  }, [selectedOption, submitted, currentQ]);

  const handleGradeFlashcard = useCallback(
    (knewIt: boolean) => {
      if (!currentCard) return;
      updateDrillScore(knewIt);
      setScore(getDrillScore());
      recordCardSrs(currentCard.id, knewIt);
      recordStudyActivity();

      if (knewIt) {
        setMissedItems(clearDrillMissed(currentCard.id));
        if (flashDeckId === 'review') {
          resetCardState();
          const remaining = Math.max(0, orderLength - 1);
          if (remaining > 0 && safePos >= remaining) {
            setCurrentIndex(0);
          }
        } else {
          handleStep(1);
        }
      } else {
        setMissedItems(markDrillMissed(currentCard.id, currentCard.systemId));
        // Real re-queue: insert card 3 slots ahead in this session when possible
        const base =
          deckOrder.length > 0
            ? [...deckOrder]
            : Array.from({ length: rawItemsLength }, (_, i) => i);
        const insertAt = Math.min(base.length, safePos + 4);
        const willInsert =
          base.length > 2 && !base.slice(safePos + 1, insertAt + 1).includes(resolvedIndex);
        if (willInsert) {
          base.splice(insertAt, 0, resolvedIndex);
          setDeckOrder(base);
        }
        resetCardState();
        const nextLen = base.length || 1;
        setCurrentIndex((safePos + 1) % nextLen);
      }
    },
    [currentCard, flashDeckId, handleStep, deckOrder, rawItemsLength, orderLength, safePos, resolvedIndex, resetCardState]
  );

  const handleLogFlashcardMistake = (card: FlashcardItem) => {
    addMistake({
      topicId: card.topicId || undefined,
      systemId: card.systemId,
      caseName: `${card.systemTitle} — Prompt #${card.num}`,
      picked: 'Review Again / Missed Recall',
      correct: card.a,
      note: card.q,
    });
    recordStudyActivity();
    setLoggedItemIds((prev) => new Set(prev).add(card.id));
    onMistakeAdded?.();
  };

  const handleLogMcqMistake = (q: UnifiedDrillQuestion, pickedIdx: number) => {
    addMistake({
      topicId: q.caseRefId || undefined,
      systemId: q.systemId,
      caseName: q.systemName,
      picked: q.options[pickedIdx] || 'Unanswered',
      correct: q.options[q.correct] || '',
      note: `${q.stem.slice(0, 140)}… → ${q.explanation}`,
    });
    recordStudyActivity();
    setLoggedItemIds((prev) => new Set(prev).add(q.id));
    onMistakeAdded?.();
  };

  const handleResetScore = () => {
    resetDrillScore();
    setScore({ correct: 0, total: 0 });
  };

  // Capture-phase Escape for Drill lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKeyCapture = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setLightbox(null);
      }
    };
    window.addEventListener('keydown', onKeyCapture, true);
    return () => window.removeEventListener('keydown', onKeyCapture, true);
  }, [lightbox]);

  // Keyboard shortcuts for fast study flow
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightbox) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement)?.isContentEditable) return;

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

      if (drillMode === 'flashcards' && currentCard) {
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
    lightbox,
    drillMode,
    cardRevealed,
    submitted,
    selectedOption,
    currentQ,
    currentCard,
    handleStep,
    handleGradeFlashcard,
    handleSelectOption,
    handleSubmitMcq,
  ]);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-navy-950">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-7 space-y-5">
        {/* Top Mode, Timer, Labs & Score Header */}
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

          {/* Right Utilities: Pacing Timer, Lab Values, Score */}
          <div className="flex flex-wrap items-center gap-2">
            {drillMode === 'mcq' && (
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTimerEnabled((v) => !v);
                    setTimerPaused(false);
                    setSecondsLeft(90);
                  }}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors',
                    timerEnabled
                      ? secondsLeft === 0
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-700 dark:text-red-300'
                        : secondsLeft <= 20
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300'
                        : 'bg-navy-50 dark:bg-navy-800 border-navy-200 dark:border-white/15 text-navy-DEFAULT dark:text-orange-DEFAULT'
                      : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                  )}
                  title="Toggle 90-second Step 1 question timer"
                >
                  {timerEnabled ? `⏱ ${formatTimer(secondsLeft)}` : '⏱ 90s Timer'}
                </button>
                {timerEnabled && !submitted && secondsLeft > 0 && (
                  <button
                    type="button"
                    onClick={() => setTimerPaused((p) => !p)}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    {timerPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
              </div>
            )}

            {onOpenLabValues && (
              <button
                type="button"
                onClick={onOpenLabValues}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
                title="Normal Lab Values (V)"
              >
                <span>Lab Values</span>
                <kbd className="rs-kbd hidden sm:inline-flex">V</kbd>
              </button>
            )}

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

        {/* System / Special Deck Selector */}
        {drillMode === 'flashcards' ? (
          <ScrollStrip innerClassName="gap-1.5 pb-1" ariaLabel="Select flashcard deck">
            <button
              type="button"
              onClick={() => {
                setFlashDeckId('review');
                setCurrentIndex(0);
                resetCardState();
              }}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors inline-flex items-center gap-1.5',
                flashDeckId === 'review'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white dark:bg-navy-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:border-red-400'
              )}
            >
              <span>Needs Review</span>
              <span className="text-[10px] font-mono opacity-85">{missedItems.length}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFlashDeckId('all16');
                setCurrentIndex(0);
                resetCardState();
              }}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors inline-flex items-center gap-1.5',
                flashDeckId === 'all16'
                  ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-slate-300'
              )}
            >
              <span>All 16 Mixed</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFlashDeckId('arrows');
                setCurrentIndex(0);
                resetCardState();
              }}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors inline-flex items-center gap-1.5',
                flashDeckId === 'arrows'
                  ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-slate-300'
              )}
            >
              <span>↑↓ Arrows Only</span>
              <span className="text-[10px] font-mono opacity-70">147</span>
            </button>

            {ATLAS_MANIFEST.systems.map((sys) => {
              const active = sys.systemId === flashDeckId;
              return (
                <button
                  key={sys.systemId}
                  type="button"
                  onClick={() => {
                    setFlashDeckId(sys.systemId);
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
          </ScrollStrip>
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
            Loading study deck…
          </div>
        )}

        {/* Empty State for Needs Review */}
        {!loading && drillMode === 'flashcards' && flashDeckId === 'review' && flashcards.length === 0 && (
          <div className="p-10 rounded-2xl bg-white dark:bg-navy-900 border border-dashed border-slate-200 dark:border-white/10 text-center space-y-2">
            <p className="text-sm font-extrabold text-slate-800 dark:text-white">
              Needs Review Queue is Empty
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tap &ldquo;Review Again (2)&rdquo; on any tricky flashcard in any system or Mixed mode to add it here for focused repetition.
            </p>
          </div>
        )}

        {/* ==================== MODE A: 16-SYSTEM FLASHCARDS ==================== */}
        {!loading && drillMode === 'flashcards' && currentCard && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-mono font-bold uppercase text-navy-DEFAULT dark:text-orange-DEFAULT">
                Card {safePos + 1} of {orderLength} · {currentCard.systemTitle}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleShuffle}
                  className={cn(
                    'font-bold px-2.5 py-1 rounded-md border transition-colors',
                    isShuffled
                      ? 'bg-orange-light dark:bg-orange-DEFAULT/20 border-orange-DEFAULT text-orange-rust dark:text-orange-DEFAULT'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-navy-900'
                  )}
                >
                  {isShuffled ? 'Shuffled ✓' : 'Shuffle Deck'}
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
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                    {currentCard.kind === 'arrow' ? '↑↓ Arrow Prompt' : 'Prompt'} #{currentCard.num}
                  </span>
                  {isShuffled && (
                    <span className="text-[10px] font-mono text-slate-400">Shuffled Order</span>
                  )}
                </div>

                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentCard.q}
                </p>

                {currentCard.images && currentCard.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {currentCard.images.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightbox({ src, caption: currentCard.q });
                        }}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 p-1.5 cursor-zoom-in"
                        title="Zoom figure"
                      >
                        <img
                          src={src}
                          alt="Clinical prompt figure"
                          className="max-h-56 w-auto rounded-lg object-contain"
                        />
                      </button>
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
                    <div className="flex flex-wrap items-center gap-2">
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
                        title="Adds to Needs Review queue & repeats soon"
                      >
                        <IconX size={13} />
                        <span>Review Again</span>
                        <span className="rs-kbd">2</span>
                      </button>
                      <button
                        type="button"
                        disabled={loggedItemIds.has(currentCard.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogFlashcardMistake(currentCard);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:text-emerald-600 dark:disabled:text-emerald-400 transition-colors"
                      >
                        {loggedItemIds.has(currentCard.id) ? '✓ Logged' : '+ Mistake Log'}
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono uppercase tracking-wider font-bold text-navy-DEFAULT dark:text-orange-DEFAULT">
                Question {safePos + 1} of {orderLength} · {currentQ.systemName}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleShuffle}
                  className={cn(
                    'font-bold px-2.5 py-1 rounded-md border transition-colors',
                    isShuffled
                      ? 'bg-orange-light dark:bg-orange-DEFAULT/20 border-orange-DEFAULT text-orange-rust dark:text-orange-DEFAULT'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-navy-900'
                  )}
                >
                  {isShuffled ? 'Shuffled ✓' : 'Shuffle'}
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

            {(() => {
              const repeatLabel = getAlsoInLabel(
                currentQ.alsoIn,
                bankId === 'mixed' || bankId === 'all_mcq' ? null : bankId
              );
              return repeatLabel ? (
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    {repeatLabel}
                  </span>
                </div>
              ) : null;
            })()}

            <div className="p-5 md:p-6 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-2xs space-y-4">
              <p className="text-slate-900 dark:text-slate-100 text-sm md:text-base font-medium leading-relaxed">
                {currentQ.stem}
              </p>
              {currentQ.images && currentQ.images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {currentQ.images.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightbox({ src, caption: currentQ.stem })}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 p-1.5 cursor-zoom-in"
                      title="Zoom figure"
                    >
                      <img
                        src={src}
                        alt="Question clinical figure"
                        className="max-h-60 w-auto rounded-lg object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 px-1">
                Tip: Right-click any option (or click &times;) to cross it out while reasoning.
              </div>
              {currentQ.options.map((option, idx) => {
                const isPicked = selectedOption === idx;
                const isCorrect = idx === currentQ.correct;
                const isStruck = struckOptions.has(idx);

                return (
                  <div key={idx} className="flex items-stretch gap-1.5 group">
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(idx)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        toggleOptionStrike(idx);
                      }}
                      className={cn(
                        'flex-1 flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors',
                        !submitted && isPicked && 'border-navy-DEFAULT dark:border-orange-DEFAULT bg-navy-50/70 dark:bg-orange-DEFAULT/15 font-semibold',
                        !submitted && !isPicked && 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 hover:border-slate-300',
                        !submitted && isStruck && 'opacity-45',
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
                      <span
                        className={cn(
                          'text-xs sm:text-sm text-slate-800 dark:text-slate-100',
                          !submitted && isStruck && 'line-through'
                        )}
                      >
                        {option}
                      </span>
                    </button>

                    {!submitted && (
                      <button
                        type="button"
                        onClick={() => toggleOptionStrike(idx)}
                        title={isStruck ? 'Restore choice' : 'Cross out choice'}
                        aria-label={isStruck ? 'Restore choice' : 'Cross out choice'}
                        className={cn(
                          'px-2.5 rounded-xl border text-xs font-mono font-bold transition-colors shrink-0',
                          isStruck
                            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-slate-400 hover:text-slate-700 dark:hover:text-white opacity-70 group-hover:opacity-100'
                        )}
                      >
                        &times;
                      </button>
                    )}
                  </div>
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
              <div
                role="status"
                aria-live="polite"
                className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 space-y-2.5 rs-fade-in"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
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

                  {selectedOption !== null && selectedOption !== currentQ.correct && (
                    <button
                      type="button"
                      disabled={loggedItemIds.has(currentQ.id)}
                      onClick={() => handleLogMcqMistake(currentQ, selectedOption)}
                      className="px-3 py-1 rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50/70 dark:bg-red-950/30 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 disabled:text-emerald-700 dark:disabled:text-emerald-400 disabled:border-emerald-300 transition-colors"
                    >
                      {loggedItemIds.has(currentQ.id) ? '✓ Saved to Mistake Log' : '+ Log Mistake'}
                    </button>
                  )}
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

      {/* Lightbox for Drill Images */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
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

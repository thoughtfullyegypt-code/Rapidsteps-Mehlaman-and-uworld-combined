import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/cn';
import {
  StudySize,
  MistakeEntry,
  getMistakes,
  addMistake,
  toggleMistakeResolved,
  deleteMistake,
} from '@/lib/storage';
import { IconX, IconAlert, IconCheck } from '@/components/icons/Icons';

// ============================================================
// SIGN-IN DIALOG (Passwordless 6-digit email code)
// ============================================================
interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onSignOut: () => void;
  onSignedIn: (email: string) => void;
}

export function SignInModal({ isOpen, onClose, userEmail, onSignOut, onSignedIn }: SignInModalProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 600);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignedIn(email);
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-6">
          <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white">
            {userEmail ? 'Your Account' : 'Sign in to Rapid Steps'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <IconX size={16} />
          </button>
        </div>

        {userEmail ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/10">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider mb-1">Signed in as</span>
              <span className="font-semibold text-navy-DEFAULT dark:text-white text-base">{userEmail}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All study progress, bookmarks, flags, personal notes, and mistake logs are stored locally in your browser and can be backed up anytime via Study Dashboard.
            </p>
            <button
              onClick={() => { onSignOut(); onClose(); }}
              className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Enter your email to tag this local browser profile. Use Backup &amp; Restore inside Study Dashboard to transfer progress across devices.
            </p>

            {step === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label htmlFor="server-signin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Email
                  </label>
                  <input
                    id="server-signin-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT dark:focus:ring-orange-DEFAULT transition-all"
                    data-autofocus="true"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-orange-DEFAULT hover:bg-orange-hover text-navy-950 font-bold rounded-full transition-all shadow-glow-orange min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Preparing…' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 rounded-xl bg-orange-light/50 dark:bg-navy-950/60 border border-orange-border/50 text-xs text-orange-rust dark:text-orange-DEFAULT">
                  Enter any 6-digit PIN for local profile <strong>{email}</strong>.
                </div>

                <div>
                  <label htmlFor="server-signin-code" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    6-Digit Code
                  </label>
                  <input
                    id="server-signin-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 text-center tracking-widest font-mono text-xl rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT dark:focus:ring-orange-DEFAULT transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-3.5 px-4 bg-orange-DEFAULT hover:bg-orange-hover text-navy-950 font-bold rounded-full transition-all shadow-glow-orange min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving…' : 'Save Profile'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setCode(''); }}
                    className="text-xs text-navy-DEFAULT dark:text-blue-400 font-semibold hover:underline"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// UNLOCK MODAL (Static Archive Notice — Free Open Access)
// ============================================================
interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onOpenSignIn: () => void;
}

export function UnlockModal({ isOpen, onClose, userEmail, onOpenSignIn }: UnlockModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'plan1mo' | 'plan6mo' | 'plan12mo'>('plan6mo');
  const [statusNote, setStatusNote] = useState('');

  if (!isOpen) return null;

  const plans = [
    { id: 'plan1mo' as const, label: '1 Month', price: 19, duration: '30 days', tagline: 'A low-risk start: 30 days of all facts.' },
    { id: 'plan6mo' as const, label: '6 Months', price: 50, duration: '180 days', tagline: 'The full Step 1 runway, at the best value.', featured: true },
    { id: 'plan12mo' as const, label: '12 Months', price: 79, duration: '365 days', tagline: 'A full year of access for long runways.' },
  ];

  const handleCheckout = () => {
    if (!userEmail) {
      onOpenSignIn();
      return;
    }
    setStatusNote('All 16 organ systems, 1,609 topics, and 3,877 drills are already unlocked free in this GitHub Pages edition.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Full access status"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 animate-fade-up overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-5">
          <h2 id="unlock-modal-title" className="text-xl md:text-2xl font-bold font-display text-navy-DEFAULT dark:text-white">
            Full Access Enabled
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
          <IconCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>
            This edition already includes unrestricted access to all 16 organ systems, 128 sub-sections, 3,877 rapid-fire drills, figures, and clinical videos.
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6 opacity-75">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={cn(
                'relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left',
                selectedPlan === p.id
                  ? 'border-orange-DEFAULT bg-orange-light/30 dark:bg-orange-DEFAULT/10 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-navy-950/40'
              )}
            >
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">{p.label}</span>
                <span className="text-2xl font-extrabold text-navy-DEFAULT dark:text-white font-display block mb-1">${p.price}</span>
                <span className="text-[11px] text-slate-500 block mb-2">{p.duration}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{p.tagline}</p>
            </div>
          ))}
        </div>

        {statusNote && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <IconAlert size={14} className="shrink-0" />
            <span>{statusNote}</span>
          </div>
        )}

        <button
          onClick={handleCheckout}
          className="w-full py-3.5 px-6 bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-bold rounded-full transition-all text-sm"
        >
          Continue Studying All 16 Systems
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PERSISTENT MISTAKE LOG MODAL (LIST + FILTER + NEW ENTRY)
// ============================================================
interface MistakeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic?: (topicId: string) => void;
  onMistakesChanged?: () => void;
}

export function MistakeLogModal({
  isOpen,
  onClose,
  onSelectTopic,
  onMistakesChanged,
}: MistakeLogModalProps) {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);

  const [caseName, setCaseName] = useState('');
  const [picked, setPicked] = useState('');
  const [correct, setCorrect] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMistakes(getMistakes());
      setView('list');
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mistakes.filter((m) => {
      if (filter === 'active' && m.resolved) return false;
      if (filter === 'resolved' && !m.resolved) return false;
      if (!q) return true;
      return (
        m.caseName.toLowerCase().includes(q) ||
        m.picked.toLowerCase().includes(q) ||
        m.correct.toLowerCase().includes(q) ||
        m.note.toLowerCase().includes(q)
      );
    });
  }, [mistakes, filter, search]);

  if (!isOpen) return null;

  const refresh = () => {
    setMistakes(getMistakes());
    onMistakesChanged?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMistake({ caseName, picked, correct, note });
    setCaseName('');
    setPicked('');
    setCorrect('');
    setNote('');
    refresh();
    setFilter('active');
    setView('list');
  };

  const activeCount = mistakes.filter((m) => !m.resolved).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Mistake Log"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[86vh] rs-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold font-display text-navy-DEFAULT dark:text-white">
              Question Mistake Log
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeCount} active trap{activeCount === 1 ? '' : 's'} · {mistakes.length} total saved locally
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView(view === 'list' ? 'new' : 'list')}
              className="px-3 py-1.5 rounded-lg bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 text-xs font-extrabold hover:opacity-95"
            >
              {view === 'list' ? '+ Log Mistake' : '← Back to List'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Close mistake log"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <>
            <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-navy-950/60 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'active', label: `Active (${activeCount})` },
                    { id: 'resolved', label: `Resolved (${mistakes.length - activeCount})` },
                    { id: 'all', label: `All (${mistakes.length})` },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                      filter === f.id
                        ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mistakes…"
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none w-48"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {filtered.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {mistakes.length === 0
                      ? 'No mistakes logged yet. Any missed Drill question can be logged with 1 click.'
                      : 'No mistakes match this filter.'}
                  </p>
                  {mistakes.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setView('new')}
                      className="text-xs font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline"
                    >
                      + Log your first distractor manually
                    </button>
                  )}
                </div>
              ) : (
                filtered.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'p-3.5 rounded-xl border space-y-2',
                      m.resolved
                        ? 'bg-slate-50/70 dark:bg-navy-950/40 border-slate-200/70 dark:border-white/5 opacity-75'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          {m.caseName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {new Date(m.ts).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.topicId && onSelectTopic && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTopic(m.topicId!);
                              onClose();
                            }}
                            className="px-2 py-1 rounded-md text-[11px] font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline"
                          >
                            Open Topic →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            toggleMistakeResolved(m.id);
                            refresh();
                          }}
                          className={cn(
                            'px-2 py-1 rounded-md border text-[11px] font-bold transition-colors',
                            m.resolved
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          )}
                        >
                          {m.resolved ? '✓ Resolved' : 'Resolve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteMistake(m.id);
                            refresh();
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 transition-colors"
                          aria-label="Delete mistake entry"
                        >
                          <IconX size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200/70 dark:border-red-900/40 text-red-900 dark:text-red-200">
                        <span className="font-extrabold">Trap Picked: </span>
                        {m.picked}
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                        <span className="font-extrabold">Correct: </span>
                        {m.correct}
                      </div>
                    </div>

                    {m.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {m.note}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
            <div>
              <label htmlFor="mistake-case" className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                Case / Pathology
              </label>
              <input
                id="mistake-case"
                type="text"
                required
                placeholder="e.g. PSGN vs IgA Nephropathy"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mistake-picked" className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  What you picked (Trap)
                </label>
                <input
                  id="mistake-picked"
                  type="text"
                  required
                  placeholder="e.g. IgA Nephropathy"
                  value={picked}
                  onChange={(e) => setPicked(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="mistake-correct" className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Correct Diagnosis
                </label>
                <input
                  id="mistake-correct"
                  type="text"
                  required
                  placeholder="e.g. PSGN"
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mistake-note" className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                Why you missed it (Distractor analysis)
              </label>
              <textarea
                id="mistake-note"
                rows={3}
                placeholder="e.g. Confused latency: PSGN is 2-3 weeks post-infection, IgA is 1-2 days synpharyngitic."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 font-bold rounded-xl hover:opacity-95 transition-opacity"
            >
              Save Mistake
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MORE / STUDY MENU SHEET
// ============================================================
interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  activeRecall: boolean;
  onToggleActiveRecall: () => void;
  studySize: StudySize;
  onToggleStudySize: () => void;
  onOpenSignIn: () => void;
  onOpenUnlock: () => void;
  onOpenShortcuts: () => void;
  onOpenMistakeLog: () => void;
  onOpenProgress: () => void;
  onOpenLabValues: () => void;
  masteredCount: number;
  totalCount: number;
  mistakeCount?: number;
  dueCount?: number;
  bookmarkCount?: number;
  flagCount?: number;
}

export function MoreMenu({
  isOpen,
  onClose,
  userEmail,
  activeRecall,
  onToggleActiveRecall,
  studySize,
  onToggleStudySize,
  onOpenSignIn,
  onOpenShortcuts,
  onOpenMistakeLog,
  onOpenProgress,
  onOpenLabValues,
  masteredCount,
  totalCount,
  mistakeCount = 0,
  dueCount = 0,
  bookmarkCount = 0,
  flagCount = 0,
}: MoreMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Study tools and settings"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-navy-900 border-t sm:border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-slide-in sm:animate-fade-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-display text-navy-DEFAULT dark:text-white">
              Study Menu
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {masteredCount}/{totalCount} mastered
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Active Recall toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-white/5">
            <div>
              <span className="font-semibold text-slate-800 dark:text-white block">Active Recall Mode</span>
              <span className="text-xs text-slate-500">Blur answers until clicked (R)</span>
            </div>
            <button
              onClick={onToggleActiveRecall}
              aria-label="Toggle Active Recall Mode"
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative p-0.5',
                activeRecall ? 'bg-orange-DEFAULT' : 'bg-slate-300 dark:bg-slate-700'
              )}
            >
              <span className={cn('block w-5 h-5 rounded-full bg-white transition-transform', activeRecall ? 'translate-x-6' : 'translate-x-0')} />
            </button>
          </div>

          {/* Study size toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-white/5">
            <div>
              <span className="font-semibold text-slate-800 dark:text-white block">Study Font Size</span>
              <span className="text-xs text-slate-500">{studySize === 'large' ? 'Large reader text' : 'Standard reader text'}</span>
            </div>
            <button
              onClick={onToggleStudySize}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-navy-DEFAULT dark:text-orange-DEFAULT"
            >
              {studySize === 'large' ? 'Large A+' : 'Normal A'}
            </button>
          </div>

          {/* Study Tools & Actions */}
          <div className="space-y-1.5">
            <button
              onClick={() => { onClose(); onOpenProgress(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-100 font-bold transition-colors text-left"
            >
              <span>Study Dashboard &amp; Backup</span>
              <span className="text-xs font-mono text-orange-rust dark:text-orange-DEFAULT">
                {dueCount > 0 ? `${dueCount} due · ` : ''}{bookmarkCount + flagCount} saved
              </span>
            </button>

            <button
              onClick={() => { onClose(); onOpenLabValues(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>USMLE Normal Lab Values</span>
              <kbd className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border">V</kbd>
            </button>

            <button
              onClick={() => { onClose(); onOpenMistakeLog(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>Mistake Log</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                {mistakeCount} active
              </span>
            </button>

            <button
              onClick={() => { onClose(); onOpenShortcuts(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>Keyboard Shortcuts</span>
              <kbd className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border">?</kbd>
            </button>

            <button
              onClick={() => { onClose(); onOpenSignIn(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>{userEmail ? 'Study Profile' : 'Set Local Profile Email'}</span>
              <span className="text-xs text-slate-400 truncate max-w-[160px]">{userEmail || 'Optional'}</span>
            </button>
          </div>

          {/* Legal and disclaimer */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 text-xs text-slate-400 space-y-2">
            <div className="flex gap-4">
              <a href={`${import.meta.env.BASE_URL}terms`} className="hover:underline">Terms</a>
              <a href={`${import.meta.env.BASE_URL}privacy`} className="hover:underline">Privacy</a>
              <a href={`${import.meta.env.BASE_URL}refunds`} className="hover:underline">Refunds</a>
              <a href="mailto:support@rapidsteps.tech" className="hover:underline">Help &amp; Support</a>
            </div>
            <p className="leading-normal">
              Rapid Steps is an independent study aid for USMLE Step 1. Not affiliated with NBME, FSMB, or USMLE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

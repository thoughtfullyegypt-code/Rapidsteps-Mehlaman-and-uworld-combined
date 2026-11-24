import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { StudySize } from '@/lib/storage';
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
  const [countdown, setCountdown] = useState(0);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
      setCountdown(45);
    }, 800);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignedIn(email);
      onClose();
    }, 700);
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
              Your purchased plans, study progress, and mastered cases sync across devices automatically with this email.
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
              Sign in with your email to restore your plan on any device. We send a 6-digit code to that email. There is no password.
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

                <div id="turnstile-container" className="min-h-[10px] text-xs text-slate-400" />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-orange-DEFAULT hover:bg-orange-hover text-navy-950 font-bold rounded-full transition-all shadow-glow-orange min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending code…' : 'Send code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 rounded-xl bg-orange-light/50 dark:bg-navy-950/60 border border-orange-border/50 text-xs text-orange-rust dark:text-orange-DEFAULT">
                  Code sent to <strong>{email}</strong>. Enter the 6-digit code below.
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
                  {loading ? 'Checking…' : 'Verify code'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setCode(''); }}
                    className="text-xs text-navy-DEFAULT dark:text-blue-400 font-semibold hover:underline"
                  >
                    Use a different email / send a new code
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
// UNLOCK MODAL (Paddle Checkout Trigger)
// ============================================================
interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onOpenSignIn: () => void;
}

export function UnlockModal({ isOpen, onClose, userEmail, onOpenSignIn }: UnlockModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'plan1mo' | 'plan6mo' | 'plan12mo'>('plan6mo');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

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
    setCheckoutLoading(true);
    // Paddle integration point:
    // Paddle.Checkout.open({ priceId: PLAN_PRICE_IDS[selectedPlan], customData: { user_id }, customer: { email: userEmail } })
    setTimeout(() => {
      setCheckoutLoading(false);
      alert('Paddle checkout would open here with selected plan: ' + selectedPlan + ' for user: ' + userEmail + (discountCode ? ' (Discount code: ' + discountCode + ')' : ''));
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Unlock full cases"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 animate-fade-up overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-5">
          <h2 id="unlock-modal-title" className="text-xl md:text-2xl font-bold font-display text-navy-DEFAULT dark:text-white">
            Unlock full cases
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close unlock dialog"
          >
            <IconX size={16} />
          </button>
        </div>

        {!userEmail && (
          <div className="mb-5 p-4 rounded-2xl bg-orange-light dark:bg-orange-DEFAULT/10 border border-orange-border dark:border-orange-DEFAULT/30 text-xs text-orange-rust dark:text-orange-DEFAULT flex items-start gap-2.5">
            <span className="font-bold inline-flex items-center gap-1 shrink-0"><IconAlert size={14} /> Note:</span>
            <span>
              Sign in with the email you will pay with, then tap Unlock again. Your purchase attaches to your signed-in account automatically.
            </span>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={cn(
                'relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left',
                selectedPlan === p.id
                  ? 'border-orange-DEFAULT bg-orange-light/30 dark:bg-orange-DEFAULT/10 shadow-sm ring-1 ring-orange-DEFAULT'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-navy-950/40'
              )}
            >
              {p.featured && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-DEFAULT text-navy-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">{p.label}</span>
                <span className="text-2xl font-extrabold text-navy-DEFAULT dark:text-white font-display block mb-1">${p.price}</span>
                <span className="text-[11px] text-slate-500 block mb-2">{p.duration}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{p.tagline}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <IconCheck size={14} className="text-orange-DEFAULT shrink-0" />
            <span>All high-yield fact texts, all systems</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCheck size={14} className="text-orange-DEFAULT shrink-0" />
            <span>One-time payment, never a subscription</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCheck size={14} className="text-orange-DEFAULT shrink-0" />
            <span>Restore on any device by signing in with your email</span>
          </div>
        </div>

        {/* Discount Code Box */}
        <div className="mb-6 pt-4 border-t border-slate-100 dark:border-white/10">
          <label htmlFor="discount-code-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Student Discount Code (Optional)
          </label>
          <div className="flex gap-2">
            <input
              id="discount-code-input"
              type="text"
              placeholder="e.g. STUDY10 or GROUP15"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT dark:focus:ring-orange-DEFAULT"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Student discounts: <code>STUDY10</code> for 10% off · <code>GROUP15</code> for 15% off for 3+ buyers.
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full py-4 px-6 bg-orange-DEFAULT hover:bg-orange-hover text-navy-950 font-bold rounded-full transition-all shadow-glow-orange min-h-[50px] flex items-center justify-center gap-2 text-base"
        >
          {checkoutLoading ? 'Opening checkout…' : `Unlock now — $${selectedPlan === 'plan1mo' ? 19 : selectedPlan === 'plan6mo' ? 50 : 79} one-time`}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Full refund within 14 days, no questions asked. Secure payments processed by Paddle.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MISTAKE LOG MODAL
// ============================================================
interface MistakeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MistakeLogModal({ isOpen, onClose }: MistakeLogModalProps) {
  const [caseName, setCaseName] = useState('');
  const [picked, setPicked] = useState('');
  const [correct, setCorrect] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Mistake Log"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
          <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white">
            Log a Question Mistake
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <IconX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            className="w-full py-3 bg-navy-DEFAULT text-white font-bold rounded-xl hover:bg-navy-dark transition-colors"
          >
            {saved ? '✓ Saved to Mistake Log!' : 'Save Mistake'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MORE / ACCOUNT MENU SHEET
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
  masteredCount: number;
  totalCount: number;
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
  onOpenUnlock,
  onOpenShortcuts,
  onOpenMistakeLog,
  masteredCount,
  totalCount,
}: MoreMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Account and menu"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-navy-900 border-t sm:border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-slide-in sm:animate-fade-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-display text-navy-DEFAULT dark:text-white">
              {userEmail ? 'Account and menu' : 'Menu'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {masteredCount}/{totalCount} mastered
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Active Recall toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-white/5">
            <div>
              <span className="font-semibold text-slate-800 dark:text-white block">Active Recall Mode</span>
              <span className="text-xs text-slate-500">Hide diagnoses until clicked</span>
            </div>
            <button
              onClick={onToggleActiveRecall}
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
              <span className="text-xs text-slate-500">{studySize === 'large' ? 'Large (19px reader)' : 'Normal (16px standard)'}</span>
            </div>
            <button
              onClick={onToggleStudySize}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-navy-DEFAULT dark:text-orange-DEFAULT"
            >
              {studySize === 'large' ? 'Large A+' : 'Normal A'}
            </button>
          </div>

          {/* Tools & Links */}
          <div className="space-y-1.5">
            <button
              onClick={() => { onClose(); onOpenShortcuts(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>Keyboard Shortcuts</span>
              <kbd className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border">?</kbd>
            </button>

            <button
              onClick={() => { onClose(); onOpenMistakeLog(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>Mistake Log</span>
              <span className="text-xs text-slate-400">Review what you missed</span>
            </button>

            <button
              onClick={() => { onClose(); onOpenUnlock(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-light/50 dark:hover:bg-orange-DEFAULT/10 text-orange-rust dark:text-orange-DEFAULT font-semibold transition-colors text-left"
            >
              <span>Plans & Pricing</span>
              <span className="text-xs">$19 · $50 · $79 one-time</span>
            </button>

            <button
              onClick={() => { onClose(); onOpenSignIn(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors text-left"
            >
              <span>{userEmail ? 'Account Profile' : 'Sign in'}</span>
              <span className="text-xs text-slate-400">{userEmail || 'Passwordless email code'}</span>
            </button>
          </div>

          {/* Legal and disclaimer */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 text-xs text-slate-400 space-y-2">
            <div className="flex gap-4">
              <a href={`${import.meta.env.BASE_URL}terms`} className="hover:underline">Terms</a>
              <a href={`${import.meta.env.BASE_URL}privacy`} className="hover:underline">Privacy</a>
              <a href={`${import.meta.env.BASE_URL}refunds`} className="hover:underline">Refunds</a>
              <a href="mailto:support@rapidsteps.tech" className="hover:underline">Help & Support</a>
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

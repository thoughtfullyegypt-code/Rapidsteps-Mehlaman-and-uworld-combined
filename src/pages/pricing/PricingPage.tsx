import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';
import { cn } from '@/lib/cn';

const PLANS = [
  {
    id: 'plan1mo',
    label: '1 Month',
    price: 19,
    perMonth: '$19 / mo',
    savings: null,
    badge: null,
    duration: '30 days access',
    tagline: 'Ideal for dedicated final-month rapid review before exam day.',
    featured: false,
    cta: 'Sign in and unlock — $19',
  },
  {
    id: 'plan6mo',
    label: '6 Months',
    price: 50,
    perMonth: '$8.33 / mo',
    savings: 'Save ~56%',
    badge: 'Most Popular',
    duration: '180 days access',
    tagline: 'Covers your full dedicated USMLE Step 1 study runway.',
    featured: true,
    cta: 'Sign in and unlock — $50',
  },
  {
    id: 'plan12mo',
    label: '12 Months',
    price: 79,
    perMonth: '$6.58 / mo',
    savings: 'Save ~65%',
    badge: 'Lowest Monthly Cost',
    duration: '365 days access',
    tagline: 'Lowest monthly equivalent—built for M2 organ blocks through Step 1.',
    featured: false,
    cta: 'Sign in and unlock — $79',
  },
];

const PLAN_FEATURES = [
  'All 1,079 cases & ~2,289 high-yield facts',
  'All 16 organ systems + 8 system 5-Step Frameworks',
  'Vignette Drill + Browser-local Stem Decoder',
  'Sign in on phone, tablet & laptop via email OTP',
  'One-time prepaid payment, never auto-renews',
];

export default function PricingPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Pricing — Rapid Steps';
    window.scrollTo(0, 0);
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Nav />

      <main id="main" className="flex-1 pt-[68px]">
        {/* Navy Header Band */}
        <section className="bg-gradient-to-b from-navy-950 via-navy-900 to-[#141C66] text-white py-16 px-6 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <nav className="text-xs text-slate-400 mb-4 flex items-center justify-center gap-2 font-medium" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-orange-DEFAULT font-semibold">Pricing</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-4">
              Simple Prepaid Pricing
            </h1>
            <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              One-time payments only—never a subscription. Paddle (our Merchant of Record) calculates any regional sales tax or VAT and shows the exact total before you pay.
            </p>
          </div>
        </section>

        {/* Pricing Grid Section */}
        <section className="py-16 px-6 -mt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-12 p-4 max-w-2xl mx-auto rounded-2xl bg-navy-DEFAULT text-white text-sm font-medium shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-orange-DEFAULT flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Anti-Subscription Guarantee: <strong className="text-orange-DEFAULT">Zero recurring charges.</strong> Nothing ever auto-renews.</span>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch mb-12">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 border',
                    plan.featured
                      ? 'bg-white dark:bg-navy-900 border-2 border-orange-DEFAULT shadow-glow-orange/30 md:scale-[1.03] z-10'
                      : 'bg-white dark:bg-navy-900/70 border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md'
                  )}
                >
                  {plan.badge && (
                    <div
                      className={cn(
                        'absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md whitespace-nowrap',
                        plan.featured
                          ? 'bg-gradient-to-r from-orange-hover to-orange-DEFAULT text-navy-950'
                          : 'bg-navy-DEFAULT text-white'
                      )}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-lg font-extrabold text-navy-DEFAULT dark:text-white">{plan.label}</span>
                      {plan.savings && (
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {plan.savings}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-5xl font-extrabold text-navy-DEFAULT dark:text-white font-display tracking-tight">${plan.price}</span>
                      <span className="text-slate-500 text-sm font-semibold">USD total</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-orange-rust dark:text-orange-DEFAULT mb-3">
                      {plan.perMonth} · {plan.duration}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{plan.tagline}</p>

                    <div className="border-t border-slate-100 dark:border-white/10 pt-5 mb-6">
                      <ul className="space-y-3">
                        {PLAN_FEATURES.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                            <svg className={cn('w-4 h-4 mt-0.5 flex-shrink-0', plan.featured ? 'text-orange-DEFAULT' : 'text-navy-DEFAULT dark:text-blue-400')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    to="/app/?plans=1"
                    className={cn(
                      'block w-full text-center py-3.5 rounded-full font-extrabold text-sm transition-all',
                      plan.featured
                        ? 'bg-orange-DEFAULT text-navy-950 hover:bg-orange-hover shadow-glow-orange'
                        : 'bg-navy-DEFAULT text-white hover:bg-navy-500'
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Discount codes + Fine Print */}
            <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 text-center space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold">Student Discounts (enter at Paddle checkout):</span>
                {['STUDY10', 'GROUP15'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => copyCode(code)}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 font-mono font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:border-orange-DEFAULT"
                  >
                    {copiedCode === code ? '✓ Copied!' : code}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>14-day full refund guarantee:</strong> Not satisfied for any reason? Email{' '}
                <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a>{' '}
                within 14 days for a no-questions-asked refund (<Link to="/refunds" className="underline font-semibold">Refund Policy</Link>).
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fair-use &amp; storage note: Account access transfers across devices via email OTP; personal study checkmarks &amp; bookmarks stay private in each browser&apos;s local storage. Fair-use cap of 150 newly opened paid cases/day.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

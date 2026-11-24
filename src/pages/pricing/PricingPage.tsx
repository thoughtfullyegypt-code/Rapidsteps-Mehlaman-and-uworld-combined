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
    cta: 'Sign in and unlock · $19',
  },
  {
    id: 'plan6mo',
    label: '6 Months',
    price: 50,
    perMonth: '$8.33 / mo',
    savings: 'Save ~56%',
    badge: 'Most popular',
    duration: '180 days access',
    tagline: 'Covers your full dedicated USMLE Step 1 study runway.',
    featured: true,
    cta: 'Sign in and unlock · $50',
  },
  {
    id: 'plan12mo',
    label: '12 Months',
    price: 79,
    perMonth: '$6.58 / mo',
    savings: 'Save ~65%',
    badge: 'Lowest monthly cost',
    duration: '365 days access',
    tagline: 'Lowest monthly equivalent, built for M2 organ blocks through Step 1.',
    featured: false,
    cta: 'Sign in and unlock · $79',
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
    document.title = 'Pricing | Rapid Steps';
    window.scrollTo(0, 0);
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#080D1A] text-[#0D1321] dark:text-[#F2F5FA] flex flex-col">
      <Nav />

      <main id="main" className="flex-1 pt-[68px]">
        {/* Navy Header Band */}
        <section
          className="text-white py-16 px-6 border-b border-white/10"
          style={{
            background: 'linear-gradient(180deg, #080D1A 0%, #0E1629 60%, #0F1854 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <nav className="text-[13px] text-slate-400 mb-4 flex items-center justify-center gap-2 font-medium" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors duration-150">Home</Link>
              <span>/</span>
              <span className="text-orange-DEFAULT font-semibold">Pricing</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-[-0.025em] text-white mb-4">
              Simple prepaid pricing
            </h1>
            <p className="text-slate-300 text-[16px] md:text-[18px] max-w-2xl mx-auto leading-relaxed mb-4">
              One-time payments only, never a subscription. Paddle (our Merchant of Record) calculates any regional sales tax or VAT and shows the exact total before you pay.
            </p>
            <p className="text-[13px] font-medium text-orange-DEFAULT">
              Anti-subscription guarantee: Zero recurring charges. Nothing ever auto-renews.
            </p>
          </div>
        </section>

        {/* Pricing Grid Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 items-stretch mb-12">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'price-card flex flex-col justify-between',
                    plan.featured && 'featured'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-lg font-bold font-display text-[#0D1321] dark:text-white">{plan.label}</span>
                      {plan.badge && (
                        <span className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT whitespace-nowrap">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-extrabold text-[#16236E] dark:text-white font-display tracking-tight tabular-nums">${plan.price}</span>
                      <span className="text-[#526074] dark:text-slate-400 text-[13px] font-medium">USD total</span>
                    </div>
                    <div className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT mb-3 tabular-nums">
                      {plan.perMonth} · {plan.duration}
                      {plan.savings ? ` · ${plan.savings}` : ''}
                    </div>
                    <p className="text-[15px] text-[#526074] dark:text-slate-300 mb-6 leading-relaxed">{plan.tagline}</p>

                    <div className="border-t border-[#E2E6EE] dark:border-white/10 pt-5 mb-6">
                      <ul className="space-y-3">
                        {PLAN_FEATURES.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 text-[15px] text-[#0D1321] dark:text-slate-200 leading-relaxed">
                            <svg className={cn('w-4 h-4 mt-1 flex-shrink-0', plan.featured ? 'text-[#C2550A] dark:text-orange-DEFAULT' : 'text-[#16236E] dark:text-blue-400')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                      'block w-full text-center py-3 rounded-full font-semibold text-[15px] transition-colors duration-150',
                      plan.featured
                        ? 'bg-orange-DEFAULT text-navy-950 hover:bg-orange-hover'
                        : 'bg-[#16236E] text-white hover:bg-[#0F1854]'
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Discount codes + Fine Print */}
            <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#0E1629] border border-[#E2E6EE] dark:border-white/10 text-center space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-[#526074] dark:text-slate-300">
                <span className="font-semibold">Student discounts (enter at Paddle checkout):</span>
                {['STUDY10', 'GROUP15'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => copyCode(code)}
                    className="px-3 py-1 rounded-lg bg-[#F1F3F7] dark:bg-[#131E36] border border-[#CBD2DF] dark:border-white/15 font-semibold text-[#16236E] dark:text-orange-DEFAULT hover:border-orange-DEFAULT transition-colors duration-150 tabular-nums"
                  >
                    {copiedCode === code ? 'Copied' : code}
                  </button>
                ))}
              </div>
              <p className="text-[15px] text-[#526074] dark:text-slate-300 leading-relaxed">
                <strong className="text-[#0D1321] dark:text-white">14-day full refund guarantee:</strong> Not satisfied for any reason? Email{' '}
                <a href="mailto:support@rapidsteps.tech" className="text-[#16236E] dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a>{' '}
                within 14 days for a no-questions-asked refund (<Link to="/refunds" className="underline font-semibold">Refund Policy</Link>).
              </p>
              <p className="text-[13px] text-[#526074] dark:text-slate-400 leading-relaxed">
                Storage note: Account access transfers across devices via email OTP; personal study checkmarks &amp; bookmarks stay private in each browser&apos;s local storage. There is no per-day cap on opening cases.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

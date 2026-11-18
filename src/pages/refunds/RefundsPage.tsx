import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';

export default function RefundsPage() {
  useEffect(() => {
    document.title = 'Refund Policy — Rapid Steps';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Nav />

      <main id="main" className="flex-1 pt-20">
        <section className="bg-gradient-to-b from-navy-950 via-navy-900 to-[#141C66] text-white py-14 px-6 border-b border-white/10">
          <div className="max-w-3xl mx-auto">
            <nav className="text-xs text-slate-400 mb-4 flex items-center gap-2 font-medium" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-orange-DEFAULT font-semibold">Refund Policy</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mb-2">
              Refund Policy
            </h1>
            <p className="text-sm text-slate-400">Effective: 26 October 2026</p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto bg-white dark:bg-navy-900/40 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-sm space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                The purchase
              </h2>
              <p>
                Rapid Steps offers one-time payments for full access to the paid cases and high-yield facts: 1 month for $19 USD, 6 months for $50 USD, or 12 months for $79 USD. Every plan is a one-time payment, not a subscription, and none of them renew automatically.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Requesting a refund
              </h2>
              <p>
                Full refund within 14 days, no questions asked. To request one, email <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a> within 14 days of your purchase and include the email address you signed in with and your Paddle receipt or transaction ID.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                How refunds are issued
              </h2>
              <p>
                Approved refunds are issued to your original payment method via Paddle, our payment processor. When a full refund is issued, the access days from that purchase end.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Contact
              </h2>
              <p>
                Refund questions: <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

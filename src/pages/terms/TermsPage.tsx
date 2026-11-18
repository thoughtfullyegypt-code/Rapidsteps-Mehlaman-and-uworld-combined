import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service — Rapid Steps';
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
              <span className="text-orange-DEFAULT font-semibold">Terms of Service</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-400">Effective: 26 October 2026</p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto bg-white dark:bg-navy-900/40 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-sm space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                About Rapid Steps
              </h2>
              <p>
                Rapid Steps (rapidsteps.tech) is a USMLE Step 1 buzzword study atlas, built by a medical student. Support is at <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a>. It presents medical study material as an interactive map of systems, syndromes, buzzwords, and diagnoses, with case triggers, mechanisms, lab patterns, question angles, and rule-outs. Not affiliated with, endorsed by, or sponsored by the NBME, the FSMB, or any question-bank or review-resource publisher. Page references on cases are unofficial study pointers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Access and payment
              </h2>
              <p>
                The first 3 cases of every system are free. Paying unlocks all other cases and the high-yield facts. To use paid access you sign in with your email address; your purchase attaches to that account. Three plans are offered, all one-time payments that never renew automatically:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>1 month:</strong> $19 USD one-time (30 days).</li>
                <li><strong>6 months:</strong> $50 USD one-time (180 days).</li>
                <li><strong>12 months:</strong> $79 USD one-time (365 days).</li>
              </ul>
              <p className="mt-3">
                Prices are in USD. Depending on your location, sales tax or VAT is either included or added at checkout; Paddle shows the exact total before you pay. Discount codes, if offered at checkout, reduce the price paid. Payments are processed securely by Paddle. We never see, handle, or store your card details. Buying again before your plan ends adds the new period to the end of the current one. There is no per-day limit on opening cases.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                When a plan ends, and renewal
              </h2>
              <p>
                When your plan ends, paid cases simply lock again. Renew by purchasing again at the same prices. Nothing renews automatically.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Refunds
              </h2>
              <p>
                Full refund within 14 days, no questions asked. See the <Link to="/refunds" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">Refund Policy</Link> for how to request one. When a full refund is issued, the access from that purchase ends.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Permitted use
              </h2>
              <p>
                Access is for your personal study use only. You may not share your account, or copy, scrape, resell, or redistribute the atlas content or the paid cases and facts, in whole or in part. Automated access is not allowed.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Content disclaimer
              </h2>
              <p>
                The atlas is study material for exam preparation. It is not medical advice, and it is not a substitute for textbooks, lectures, or clinical training.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Revocation for abuse
              </h2>
              <p>
                Access may be revoked if an account is shared, content is scraped or resold, or the service is otherwise abused, in line with these terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Changes to these terms
              </h2>
              <p>
                These terms may change from time to time. The updated version will be posted on this page, and continued use of the site after a change means you accept the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Contact
              </h2>
              <p>
                Questions about these terms: <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

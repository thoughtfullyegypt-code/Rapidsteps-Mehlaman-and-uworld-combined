import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Rapid Steps';
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
              <span className="text-orange-DEFAULT font-semibold">Privacy Policy</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-400">Effective: 26 October 2026</p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto bg-white dark:bg-navy-900/40 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-sm space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                What we collect
              </h2>
              <p>
                Browsing the free cases does not require an account. To open paid cases you sign in with your email address, and we store: that email address, your plan and its end date, a reference to each payment (Paddle transaction and customer identifiers, never card details), and a daily count of how many paid cases your account opened. We do not ask for your name, and we do not collect any other personal details.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Sign-in codes
              </h2>
              <p>
                Sign-in uses a one-time 6-digit code sent to your email. Accounts and plan records are stored with our database and sign-in provider, Supabase (data hosted in the European Union). The code emails are delivered by Brevo, our email delivery provider. A bot check from Cloudflare (Turnstile) may be shown on the sign-in form.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Payments
              </h2>
              <p>
                Payments are handled entirely by Paddle, our payment processor and merchant of record. Paddle collects and processes your payment information under Paddle's own privacy policy. We never see or store your card details. Paddle tells us when a payment or refund happens so that we can start or end your access.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                What is stored in your browser
              </h2>
              <p>
                Your browser's localStorage holds your sign-in session (so you stay signed in on that device) and your own study preferences and progress, such as dark mode and mastered cases. Paid case text is kept in memory only and is not saved to your device. Signing out clears the session. You can remove everything at any time by clearing your browser's site data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Third-party resources
              </h2>
              <p>
                The site loads fonts from Google Fonts and the payment window from Paddle, so those providers see your IP address when you load the page or open checkout.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Tracking and sharing
              </h2>
              <p>
                We do not use advertising trackers, and we do not sell or share your personal data. We share data only with the providers named above, as needed to run sign-in, email delivery, payments and hosting.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Your data
              </h2>
              <p>
                You can ask us to delete your account and its records, or to send you a copy, by emailing <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a> from the address you signed in with. Payment records may be kept as long as Paddle and the law require.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-navy-DEFAULT dark:text-white mb-2">
                Contact
              </h2>
              <p>
                Privacy questions: <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

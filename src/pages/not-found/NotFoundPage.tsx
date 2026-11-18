import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found — Rapid Steps';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Nav />

      <main id="main" className="flex-1 flex flex-col justify-center items-center py-24 px-6 text-center">
        <div className="max-w-md mx-auto">
          <nav className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-2 font-medium" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-DEFAULT dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-orange-DEFAULT font-semibold">Page not found</span>
          </nav>

          <div className="text-7xl font-extrabold font-display text-navy-DEFAULT dark:text-orange-DEFAULT mb-4">
            404
          </div>
          <h1 className="text-3xl font-bold font-display text-navy-DEFAULT dark:text-white mb-4">
            Page not found
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            That page does not exist. Go back to the atlas.
          </p>

          <Link
            to="/app/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-DEFAULT hover:bg-orange-hover text-navy-950 font-bold rounded-full transition-all shadow-glow-orange min-h-[48px]"
          >
            <span>Open the atlas</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

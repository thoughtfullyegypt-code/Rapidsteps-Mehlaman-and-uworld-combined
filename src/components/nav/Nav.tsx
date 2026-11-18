import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import Logo from '../logo/Logo';
import ThemeToggle from '../theme-toggle/ThemeToggle';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { label: 'How it works', href: '/#how' },
  { label: '4 Engines', href: '/#features' },
  { label: 'Study Stack', href: '/#stack' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={cn(
          'site-nav nav fixed top-0 left-0 right-0 z-50 glass-nav transition-all',
          scrolled && 'scrolled'
        )}
      >
        <div className="container-tight">
          <div className="flex items-center justify-between h-[68px] gap-4">
            {/* Brand */}
            <div className="brand flex items-center gap-3 flex-shrink-0">
              <Link
                to="/"
                aria-label="Rapid Steps home"
                className="brand-logo flex items-center hover:opacity-95 transition-opacity"
              >
                <Logo width={78} height={35} variant="reversed" />
              </Link>

              {/* Live catalog badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-slate-200 bg-white/8 border border-white/12">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT animate-pulse-led" />
                {ATLAS_MANIFEST.totals.topics.toLocaleString()} topics · 16 systems
              </div>
            </div>

            {/* Desktop nav links */}
            <nav className="nav-links hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} isHome={isHome}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="nav-cta flex items-center gap-2.5">
              <ThemeToggle />

              <Link
                to="/app/?signin=1"
                className="rs-auth-btn btn-ghost hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white/85 rounded-full border border-white/20 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all min-h-[42px]"
              >
                Sign in
              </Link>

              <Link
                to="/app/"
                className="btn-or inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-sm font-bold bg-orange-DEFAULT text-navy-950 rounded-full hover:bg-orange-hover transition-all min-h-[42px] shadow-sm hover:shadow-glow-orange whitespace-nowrap"
              >
                <span>Explore free cases</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Mobile & Tablet hamburger (ensures How it works, Stack, FAQ are never lost below desktop) */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-[68px] z-40 bg-navy-950/98 backdrop-blur-2xl border-b border-orange-DEFAULT/25 px-6 py-5 flex flex-col gap-1.5 shadow-2xl transition-all duration-200',
          mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 sm:hidden">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT" />
            {ATLAS_MANIFEST.totals.topics.toLocaleString()} topics across 16 organ systems
          </span>
        </div>

        {NAV_LINKS.map((link) => {
          const isAnchor = link.href.startsWith('/#');
          return isAnchor && isHome ? (
            <a
              key={link.href}
              href={link.href.replace('/', '')}
              className="text-white/90 text-base font-semibold py-2.5 px-3 rounded-xl hover:bg-white/8 hover:text-white transition-colors flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              <span className="text-white/40 text-xs">→</span>
            </a>
          ) : (
            <Link
              key={link.href}
              to={link.href}
              className="text-white/90 text-base font-semibold py-2.5 px-3 rounded-xl hover:bg-white/8 hover:text-white transition-colors flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              <span className="text-white/40 text-xs">→</span>
            </Link>
          );
        })}

        <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-white/10">
          <Link
            to="/app/?signin=1"
            onClick={() => setMobileOpen(false)}
            className="text-center text-sm font-semibold text-white/90 py-3 rounded-full border border-white/25 hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/app/"
            onClick={() => setMobileOpen(false)}
            className="text-center text-sm font-bold bg-orange-DEFAULT text-navy-950 py-3 rounded-full hover:bg-orange-hover transition-colors"
          >
            Explore 48 free
          </Link>
        </div>
      </div>
    </>
  );
}

function NavLink({ href, isHome, children }: { href: string; isHome: boolean; children: React.ReactNode }) {
  const isAnchor = href.startsWith('/#');
  if (isAnchor && isHome) {
    return (
      <a
        href={href.replace('/', '')}
        className="text-sm font-semibold text-white/80 px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/8 transition-all"
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={href}
      className="text-sm font-semibold text-white/80 px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/8 transition-all"
    >
      {children}
    </Link>
  );
}

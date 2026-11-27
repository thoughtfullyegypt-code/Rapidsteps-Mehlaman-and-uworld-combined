import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../logo/Logo';
import ThemeToggle from '../theme-toggle/ThemeToggle';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { label: 'How it works', href: '/#how' },
  { label: '4 Engines', href: '/#features' },
  { label: 'Compare', href: '/#stack' },
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
    onScroll();
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
          'site-nav nav fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-200 ease-standard',
          isHome && !scrolled
            ? 'bg-transparent border-b border-transparent'
            : 'bg-[#050814]/88 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
        )}
      >
        <div className="container-tight">
          <div className="flex items-center justify-between h-[68px] gap-4">
            {/* Brand */}
            <div className="brand flex items-center gap-3 flex-shrink-0">
              <Link
                to="/"
                aria-label="Rapid Steps home"
                className="brand-logo flex items-center hover:opacity-90 transition-opacity duration-150"
              >
                <Logo width={78} height={35} variant="reversed" />
              </Link>
            </div>

            {/* Stable Desktop Nav Links */}
            <nav className="nav-links hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} isHome={isHome}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="nav-cta flex items-center gap-3">
              <ThemeToggle />

              <Link
                to="/app/?signin=1"
                className="rs-auth-btn hidden sm:inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-150 min-h-[42px]"
              >
                Sign in
              </Link>

              <Link
                to="/app/"
                className="group btn-or inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-sm font-semibold bg-orange-DEFAULT text-navy-950 rounded-full hover:bg-orange-hover transition-colors duration-150 min-h-[42px] whitespace-nowrap"
              >
                <span>Explore 48 free cases</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="group-hover:translate-x-0.5 transition-transform duration-150"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Mobile & Tablet hamburger */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/15 text-white hover:bg-white/10 transition-colors duration-150"
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
          'lg:hidden fixed inset-x-0 top-[68px] z-40 bg-[#050814]/98 backdrop-blur-2xl border-b border-white/[0.08] px-6 py-5 flex flex-col gap-1 shadow-2xl transition-[opacity,transform] duration-200 ease-standard',
          mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        {NAV_LINKS.map((link) => {
          const isAnchor = link.href.startsWith('/#');
          return isAnchor && isHome ? (
            <a
              key={link.href}
              href={link.href.replace('/', '')}
              className="text-white/90 text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors duration-150 flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              <span className="text-white/40 text-sm">→</span>
            </a>
          ) : (
            <Link
              key={link.href}
              to={link.href}
              className="text-white/90 text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors duration-150 flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              <span className="text-white/40 text-sm">→</span>
            </Link>
          );
        })}

        <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-white/[0.08]">
          <Link
            to="/app/?signin=1"
            onClick={() => setMobileOpen(false)}
            className="text-center text-sm font-medium text-white/90 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            to="/app/"
            onClick={() => setMobileOpen(false)}
            className="text-center text-sm font-semibold bg-orange-DEFAULT text-navy-950 py-3 rounded-full hover:bg-orange-hover transition-colors duration-150"
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
  const cls =
    'text-sm font-medium text-white/80 px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors duration-150 whitespace-nowrap';

  if (isAnchor && isHome) {
    return (
      <a href={href.replace('/', '')} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {children}
    </Link>
  );
}

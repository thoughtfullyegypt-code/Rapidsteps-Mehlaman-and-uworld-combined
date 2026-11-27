import { Link } from 'react-router-dom';
import Logo from '../logo/Logo';

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Open the app', href: '/app/' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Refunds', href: '/refunds' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'support@rapidsteps.tech', href: 'mailto:support@rapidsteps.tech', external: true },
      { label: 'Sign in', href: '/app/?signin=1' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#050814] text-slate-400 pt-16 pb-10 border-t border-white/[0.08]">
      <div className="container-tight">
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand col */}
          <div>
            <Link to="/" aria-label="Rapid Steps home" className="inline-block mb-4">
              <Logo width={67} height={30} variant="reversed" />
            </Link>
            <p className="text-[15px] leading-relaxed text-slate-400 max-w-[320px]">
              USMLE Step 1 buzzword atlas. Not affiliated with the NBME, FSMB or any question-bank publisher.
            </p>
          </div>

          {/* Nav cols */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <h2 className="text-[13px] font-semibold text-slate-200 mb-3.5">
                {col.heading}
              </h2>
              <nav aria-label={col.heading}>
                {col.links.map((link) =>
                  'external' in link && link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className="block text-[14px] text-slate-400 py-1.5 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block text-[14px] text-slate-400 py-1.5 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom rule */}
        <div className="border-t border-white/[0.08] pt-6 text-[13px] text-slate-400 text-center">
          © 2026 Rapid Steps. Study material only, not medical advice.
        </div>
      </div>
    </footer>
  );
}

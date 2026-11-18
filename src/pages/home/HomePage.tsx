import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';
import CanvasNetwork from '@/components/canvas-network/CanvasNetwork';
import { prefersReducedMotion } from '@/lib/motion';
import { DECODER_STEMS, DEMO_CASES, FRAMEWORKS, decodeClinicalStem } from '@/lib/catalog';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import { SystemIcon, IconShield, IconAtlas } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

type ConsoleCaseKey = 'psgn' | 'apl' | 'hocm' | 'graves';
type HeroTab = 'atlas' | 'drill' | 'decoder' | 'steps';

export default function HomePage() {
  const [heroCase, setHeroCase] = useState<ConsoleCaseKey>('psgn');
  const [heroTab, setHeroTab] = useState<HeroTab>('atlas');

  useEffect(() => {
    document.title = 'Rapid Steps — USMLE Step 1 Pattern-Recognition Atlas';
    const root = document.documentElement;
    const els = document.querySelectorAll<HTMLElement>('.rv');

    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    root.classList.add('js-rv-ready');
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    els.forEach((el) => obs.observe(el));

    // Safety guarantee: never leave any section unrevealed for fast scrollers or Cmd+F
    const fallback = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('in'));
    }, 1800);

    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
      root.classList.remove('js-rv-ready');
    };
  }, []);

  const handleSelectQuickClue = (key: ConsoleCaseKey) => {
    setHeroCase(key);
    setHeroTab('atlas');
  };

  return (
    <div className="min-h-screen bg-navy-950" id="top">
      <Nav />

      <main id="main">
        <HeroSection
          activeCase={heroCase}
          onSelectCase={setHeroCase}
          activeTab={heroTab}
          onSelectTab={setHeroTab}
          onQuickClue={handleSelectQuickClue}
        />
        <StatsSection />
        <CardioSpotlightSection />
        <PathSection />
        <BentoSection />
        <StudyStackSection />
        <FreePaidSection />
        <PricingSection />
        <TrustFaqSection />
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}

// ============================================================
// 1. HERO + 4-TAB INTERACTIVE CLINICAL CONSOLE
// ============================================================
const QUICK_CLUES: Array<{ key: ConsoleCaseKey; label: string; tag: string }> = [
  { key: 'psgn', label: 'Cola urine 2–3 wks post-strep', tag: 'Renal' },
  { key: 'apl', label: 'Auer rods + t(15;17)', tag: 'Heme' },
  { key: 'hocm', label: 'Murmur ↑ w/ Valsalva', tag: 'Cardio' },
  { key: 'graves', label: 'Pretibial myxedema', tag: 'Endo' },
];

function HeroSection({
  activeCase,
  onSelectCase,
  activeTab,
  onSelectTab,
  onQuickClue,
}: {
  activeCase: ConsoleCaseKey;
  onSelectCase: (k: ConsoleCaseKey) => void;
  activeTab: HeroTab;
  onSelectTab: (t: HeroTab) => void;
  onQuickClue: (k: ConsoleCaseKey) => void;
}) {
  return (
    <section className="relative pt-28 pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Layered royal navy + warm amber radial atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-[#11194A] to-[#1E2A8A]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(1100px 650px at 80% 18%, rgba(255,140,26,0.18) 0%, transparent 60%), radial-gradient(900px 600px at 12% 85%, rgba(79,110,247,0.22) 0%, transparent 60%)',
        }}
      />

      {/* Clinical grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 55% 40%, black 30%, transparent 82%)',
        }}
      />

      {/* Subtle network canvas */}
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <CanvasNetwork />
      </div>

      <div className="container-tight relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-16 items-center">
          {/* Left: Headline, CTAs & Quick-Clue Triggers */}
          <div>
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-white/8 border border-white/15 text-orange-DEFAULT">
              <span className="w-2 h-2 rounded-full bg-orange-DEFAULT animate-pulse-led" />
              USMLE Step 1 Pattern-Recognition Atlas
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-[64px] text-white mb-6 leading-[1.06] tracking-tight font-extrabold font-display">
              Recognize the clue.{' '}
              <span className="text-orange-DEFAULT block sm:inline">Name the diagnosis.</span>
            </h1>

            <p className="text-slate-200/90 text-lg md:text-xl leading-relaxed mb-8 max-w-[570px]">
              A visual USMLE Step 1 atlas connecting stem buzzwords to syndromes, mechanisms, lab signatures, and common traps—reinforced with vignette drills, browser-local stem decoding, and 5-step diagnostic frameworks.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap gap-3.5 mb-5">
              <Link
                to="/app/"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-extrabold bg-orange-DEFAULT text-navy-950 rounded-full hover:bg-orange-hover transition-all shadow-glow-orange hover:scale-[1.02] min-h-[54px]"
              >
                Explore 48 free cases
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-full border border-white/25 bg-white/5 hover:bg-white/12 transition-all min-h-[54px]"
              >
                See how it works
              </a>
            </div>

            {/* Trust microcopy */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300/90 mb-8">
              {[
                'No account or card to start',
                '3 free cases in all 16 systems',
                'Prepaid plans · never auto-renews',
              ].map((note) => (
                <li key={note} className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-DEFAULT/20 text-orange-DEFAULT text-[10px] font-bold">
                    ✓
                  </span>
                  {note}
                </li>
              ))}
            </ul>

            {/* Interactive Trigger Pills -> loads right into Hero Console */}
            <div className="pt-5 border-t border-white/10">
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                Click a classic stem trigger to trace live →
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CLUES.map((item) => {
                  const isActive = activeTab === 'atlas' && activeCase === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onQuickClue(item.key)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left',
                        isActive
                          ? 'bg-orange-DEFAULT text-navy-950 border-orange-DEFAULT shadow-sm font-bold'
                          : 'bg-white/6 border-white/12 text-slate-200 hover:bg-white/12 hover:border-white/25'
                      )}
                    >
                      <span
                        className={cn(
                          'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded',
                          isActive ? 'bg-navy-950/15 text-navy-950 font-bold' : 'bg-white/10 text-orange-DEFAULT'
                        )}
                      >
                        {item.tag}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: High-Contrast, Zero-Clipping 4-Tab Interactive Clinical Console */}
          <div className="w-full max-w-[500px] mx-auto lg:max-w-none">
            <HeroClinicalConsole
              activeCase={activeCase}
              onSelectCase={onSelectCase}
              activeTab={activeTab}
              onSelectTab={onSelectTab}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HERO 4-TAB INTERACTIVE CONSOLE (Replaces buggy phone mockup)
// ============================================================
const HERO_DRILLS = [
  {
    id: 'psgn',
    badge: 'Renal Differential Trap',
    question: 'How do serum C3 levels and post-infectious latency distinguish IgA Nephropathy from Poststreptococcal GN (PSGN)?',
    options: [
      'IgA Nephropathy has low C3 and a 3-week latency',
      'IgA Nephropathy has normal C3 and <5-day ("synpharyngitic") latency',
      'PSGN has normal C3 and <48-hour latency after URI',
      'Both present with persistently low C3 and 2-week latency',
    ],
    correct: 1,
    explanation:
      'IgA nephropathy (Berger disease) causes hematuria 1–5 days into a mucosal URI with NORMAL C3. PSGN appears 2–3 weeks after strep pharyngitis/impetigo with LOW C3 and subepithelial humps.',
  },
  {
    id: 'hocm',
    badge: 'Cardio Hemodynamics',
    question: 'A 19-year-old athlete has a harsh systolic murmur at the LLSB. Which bedside maneuver INCREASES murmur intensity in HOCM?',
    options: [
      'Sustained handgrip (increases afterload)',
      'Passive leg raise while supine (increases preload)',
      'Valsalva strain phase or abrupt standing (decreases preload)',
      'Rapid squatting from standing (increases preload & afterload)',
    ],
    correct: 2,
    explanation:
      'Valsalva and abrupt standing reduce venous return, shrinking LV chamber volume and pulling the anterior mitral leaflet closer to the hypertrophied septum—making the HOCM murmur LOUDER.',
  },
];

function HeroClinicalConsole({
  activeCase,
  onSelectCase,
  activeTab,
  onSelectTab,
}: {
  activeCase: ConsoleCaseKey;
  onSelectCase: (k: ConsoleCaseKey) => void;
  activeTab: HeroTab;
  onSelectTab: (t: HeroTab) => void;
}) {
  // Tab 1: Atlas step reveal state (1 = Clue, 2 = Syndrome, 3 = Full Dx + Pearl/Trap)
  const [atlasStage, setAtlasStage] = useState<1 | 2 | 3>(3);
  useEffect(() => {
    setAtlasStage(3);
  }, [activeCase]);

  // Tab 2: Drill state
  const [drillIdx, setDrillIdx] = useState(0);
  const [pickedOpt, setPickedOpt] = useState<number | null>(null);
  const currentDrill = HERO_DRILLS[drillIdx];

  // Tab 3: Decoder state
  const [decoderText, setDecoderText] = useState(
    'Cola-colored urine 2 weeks after sore throat, RBC casts, low serum C3'
  );
  const decoded = decodeClinicalStem(decoderText);

  // Tab 4: 5-Step Thyroid state
  const [fwStep, setFwStep] = useState(3);
  const endoFw = FRAMEWORKS[0];

  const c = DEMO_CASES[activeCase];

  const tabs: Array<{ id: HeroTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'atlas',
      label: 'Atlas',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3" />
          <circle cx="6" cy="19" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M10.5 7.5 7.5 16.5M13.5 7.5l3 9" />
        </svg>
      ),
    },
    {
      id: 'drill',
      label: 'Drill',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      id: 'decoder',
      label: 'Decoder',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35M8 11h6" />
        </svg>
      ),
    },
    {
      id: 'steps',
      label: '5-Step',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h12M3 18h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-3xl overflow-hidden border border-white/15 bg-white text-slate-900 shadow-[0_28px_80px_rgba(0,0,0,0.45)] flex flex-col">
      {/* Console Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#141C66] text-white border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-orange-DEFAULT" />
          <span className="text-xs font-extrabold tracking-wide uppercase font-display">
            Interactive Preview
          </span>
        </div>
        <Link
          to={`/app/#${activeCase}`}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/12 hover:bg-orange-DEFAULT hover:text-navy-950 text-white transition-colors"
        >
          Open full app →
        </Link>
      </div>

      {/* Top Mode Switcher (4 Tabs with real vector icons & high contrast) */}
      <div
        className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100 border-b border-slate-200"
        role="tablist"
        aria-label="Preview Rapid Steps tools"
      >
        {tabs.map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectTab(t.id)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all',
                isSelected
                  ? 'bg-[#1E2A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Console Body — Spacious, High-Contrast, Zero Clipping */}
      <div className="p-5 sm:p-6 bg-white min-h-[430px] flex flex-col justify-between">
        {/* ==================== TAB 1: ATLAS ==================== */}
        {activeTab === 'atlas' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              {/* Case Switcher */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {c.systemName}
                </span>
                <div className="flex gap-1">
                  {(['psgn', 'apl', 'hocm', 'graves'] as ConsoleCaseKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSelectCase(key)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors',
                        activeCase === key
                          ? 'bg-orange-light text-orange-rust border border-orange-border'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3-Step Cognitive Chain */}
              <div className="space-y-2.5">
                {/* Step 1: Trigger Buzzword */}
                <div className="p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9A3412]">
                      01 · Trigger Buzzword
                    </span>
                    <span className="text-[10px] font-semibold text-[#C2410C]">Stem Clue</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{c.buzzword}</div>
                </div>

                {/* Step 2: Clinical Syndrome */}
                {atlasStage >= 2 ? (
                  <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE]">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3730A3] mb-0.5">
                      02 · Clinical Syndrome
                    </div>
                    <div className="text-sm font-bold text-[#1E2A8A]">{c.syndrome}</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAtlasStage(2)}
                    className="w-full py-3 px-4 rounded-2xl border border-dashed border-slate-300 text-xs font-bold text-[#1E2A8A] hover:bg-slate-50 transition-colors"
                  >
                    Reveal Step 2: Clinical Syndrome →
                  </button>
                )}

                {/* Step 3: Diagnosis + Mechanism + Trap */}
                {atlasStage >= 3 ? (
                  <div className="p-4 rounded-2xl bg-[#1E2A8A] text-white shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-DEFAULT">
                          03 · Definitive Diagnosis
                        </div>
                        <div className="text-base font-extrabold text-white">{c.diagnosis}</div>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-orange-DEFAULT text-navy-950 flex items-center justify-center font-black text-xs flex-shrink-0">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed border-t border-white/15 pt-2">
                      <strong className="text-white">Mechanism:</strong> {c.mechanism}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-amber-100 leading-relaxed">
                      <strong className="text-orange-DEFAULT">Exam Trap:</strong> {c.trap}
                    </div>
                  </div>
                ) : (
                  atlasStage === 2 && (
                    <button
                      type="button"
                      onClick={() => setAtlasStage(3)}
                      className="w-full py-3 px-4 rounded-2xl bg-orange-DEFAULT text-navy-950 text-xs font-extrabold hover:bg-orange-hover transition-colors"
                    >
                      Reveal Step 3: Diagnosis & Exam Trap →
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setAtlasStage(atlasStage === 3 ? 1 : 3)}
                className="font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {atlasStage === 3 ? 'Test active recall (hide steps)' : 'Show full card'}
              </button>
              <Link to={`/app/#${c.id}`} className="font-bold text-[#1E2A8A] hover:underline">
                Study full vignette in app →
              </Link>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: DRILL (Fixed Contrast & Zero Clipping) ==================== */}
        {activeTab === 'drill' && (
          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {currentDrill.badge}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDrillIdx((i) => (i + 1) % HERO_DRILLS.length);
                    setPickedOpt(null);
                  }}
                  className="text-xs font-bold text-[#1E2A8A] hover:underline"
                >
                  Next sample question →
                </button>
              </div>

              {/* High-contrast question box (dark slate text on warm amber-50) */}
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] mb-3">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {currentDrill.question}
                </p>
              </div>

              {/* All 4 options visible with crisp dark ink */}
              <div className="space-y-2">
                {currentDrill.options.map((opt, idx) => {
                  const answered = pickedOpt !== null;
                  const isCorrect = idx === currentDrill.correct;
                  const isChosen = idx === pickedOpt;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPickedOpt(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs sm:text-[13px] font-medium transition-all',
                        !answered && 'bg-white border-slate-200 text-slate-800 hover:border-[#1E2A8A] hover:bg-slate-50',
                        answered && isCorrect && 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold',
                        answered && !isCorrect && isChosen && 'bg-red-50 border-red-400 text-red-950',
                        answered && !isCorrect && !isChosen && 'bg-slate-50 border-slate-200 text-slate-500'
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0',
                          !answered && 'bg-slate-100 text-[#1E2A8A]',
                          answered && isCorrect && 'bg-emerald-600 text-white',
                          answered && !isCorrect && isChosen && 'bg-red-600 text-white',
                          answered && !isCorrect && !isChosen && 'bg-slate-200 text-slate-500'
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant explanation — rendered cleanly in-flow, never clipped */}
              {pickedOpt !== null && (
                <div
                  className={cn(
                    'mt-3 p-3.5 rounded-xl border text-xs leading-relaxed',
                    pickedOpt === currentDrill.correct
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-slate-900'
                  )}
                >
                  <strong className="font-extrabold">
                    {pickedOpt === currentDrill.correct ? '✓ Correct: ' : 'Key distinction: '}
                  </strong>
                  {currentDrill.explanation}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
              {pickedOpt !== null ? (
                <button
                  type="button"
                  onClick={() => setPickedOpt(null)}
                  className="font-semibold text-slate-500 hover:text-slate-800"
                >
                  Reset answer
                </button>
              ) : (
                <span className="text-slate-500">Tap A–D for instant feedback</span>
              )}
              <Link to="/app/" className="font-bold text-[#1E2A8A] hover:underline">
                Open Vignette Drill →
              </Link>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: DECODER (Fixed Legibility on All Matches) ==================== */}
        {activeTab === 'decoder' && (
          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="hero-decoder-box" className="text-xs font-extrabold text-slate-800">
                  Paste or edit stem clues:
                </label>
                <div className="flex gap-1">
                  {[
                    { label: 'PSGN', text: 'Cola-colored urine 2 weeks after sore throat, RBC casts, low serum C3' },
                    { label: 'APL', text: 'Oozing IV sites, promyelocytes with Auer rod bundles, t(15;17)' },
                    { label: 'Wilson', text: 'Young adult tremor, elevated AST/ALT, low ceruloplasmin, Kayser-Fleischer rings' },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setDecoderText(sample.text)}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-orange-light hover:text-orange-rust transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                id="hero-decoder-box"
                rows={2}
                value={decoderText}
                onChange={(e) => setDecoderText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-[13px] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#1E2A8A] resize-none leading-relaxed"
              />

              {/* High-contrast ranked matches — every disease name 100% legible */}
              <div className="mt-3 space-y-2">
                {decoded.noMatch ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                    No confident match yet—honest uncertainty instead of guessing. Try &ldquo;Auer rods&rdquo; or &ldquo;Kayser-Fleischer&rdquo;.
                  </div>
                ) : (
                  decoded.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'p-3 rounded-xl border flex items-center justify-between gap-3',
                        idx === 0
                          ? 'bg-[#FFF7ED] border-[#FB923C]'
                          : 'bg-white border-slate-200'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-extrabold text-slate-900 truncate">
                          {m.diagnosis}
                        </div>
                        <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          {m.detail}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0',
                          m.confidence === 'top'
                            ? 'bg-orange-DEFAULT text-navy-950'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        )}
                      >
                        {m.confidence === 'top' ? 'Top match' : 'Look-alike'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <IconShield size={13} className="text-emerald-600" />
                <span>Runs locally in your browser—text is never sent or saved.</span>
              </span>
              <Link to="/app/" className="font-bold text-[#1E2A8A] whitespace-nowrap hover:underline">
                Full Decoder →
              </Link>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: 5-STEP (Fixed Decision Tree Contrast) ==================== */}
        {activeTab === 'steps' && (
          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold text-[#1E2A8A]">
                  Endocrine · Thyroid Axis 5-Step Tree
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-500">
                  8 core systems in app
                </span>
              </div>

              {/* 5 Step Number Pills */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {['1 Axis', '2 Level', '3 Site', '4 Loop', '5 Hooks'].map((lbl, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFwStep(n)}
                      className={cn(
                        'py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center',
                        fwStep === n
                          ? 'bg-[#1E2A8A] text-white border-[#1E2A8A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      )}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 mb-3">
                Step {fwStep}: {endoFw.steps[fwStep - 1]}
              </div>

              {/* High-contrast Decision Branches (dark ink on tinted cards — zero white-on-light!) */}
              <div className="space-y-2">
                {endoFw.branches.map((br) => (
                  <div
                    key={br.badge}
                    className={cn(
                      'p-3 rounded-xl border text-xs leading-snug',
                      br.tone === 'amber' && 'bg-[#FFFBEB] border-[#FCD34D] text-slate-900',
                      br.tone === 'teal' && 'bg-[#F0FDFA] border-[#99F6E4] text-slate-900',
                      br.tone === 'navy' && 'bg-[#EEF2FF] border-[#C7D2FE] text-slate-900'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-extrabold text-slate-900">{br.title}</span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 border border-slate-300 text-slate-800">
                        {br.badge}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11.5px]">{br.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Included 100% free in the app</span>
              <Link to="/app/" className="font-bold text-[#1E2A8A] hover:underline">
                Explore all 8 frameworks →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 2. PROOF / NUMBERS BAR
// ============================================================
function StatsSection() {
  const { totals } = ATLAS_MANIFEST;
  const STATS = [
    { label: 'Organ systems', value: String(totals.systems), sub: '100% USMLE Step 1 curriculum' },
    { label: 'Structured topics', value: totals.topics.toLocaleString(), sub: `${totals.chapters} chapters + ${totals.tables} tables` },
    { label: 'Clinical figures', value: totals.images.toLocaleString(), sub: `Histology, ECGs, imaging & ${totals.videos} videos` },
    { label: 'Step 1 Q&As & MCQs', value: totals.rapidFireQAs.toLocaleString(), sub: `${totals.hyBullets.toLocaleString()} high-yield exam pearls` },
  ];

  return (
    <section className="py-12 border-y border-white/10 bg-[#0B122B]" aria-label="Rapid Steps in numbers">
      <div className="container-tight">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="rv text-center lg:text-left p-4 rounded-2xl bg-white/[0.03] border border-white/8">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight mb-1">
                {s.value}
              </div>
              <div className="text-sm font-bold text-orange-DEFAULT mb-0.5">{s.label}</div>
              <div className="text-xs text-slate-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 2B. COMPLETE 16-SYSTEM MULTIMEDIA ATLAS SPOTLIGHT
// ============================================================
function CardioSpotlightSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#0B122B] to-[#0A1222] border-b border-white/10" id="cardio-spotlight">
      <div className="container-tight">
        <div className="rv rounded-3xl border border-orange-DEFAULT/35 bg-gradient-to-br from-[#141C66]/90 via-[#111945] to-[#0B1030] p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-DEFAULT text-navy-950 text-xs font-black uppercase tracking-wider mb-3">
                <IconAtlas size={14} />
                <span>Complete 16-System Atlas · 100% Unlocked</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white mb-2">
                All 16 USMLE Step 1 Organ Systems Integrated
              </h2>
              <p className="text-slate-200/90 text-sm sm:text-base leading-relaxed">
                Explore <strong>{ATLAS_MANIFEST.totals.chapters} structured chapters</strong> and <strong>{ATLAS_MANIFEST.totals.topics.toLocaleString()} topics</strong> across every organ system—combining comprehensive notes, <strong>{ATLAS_MANIFEST.totals.images.toLocaleString()} clinical figures</strong>, <strong>{ATLAS_MANIFEST.totals.tables} comparison tables</strong>, <strong>{ATLAS_MANIFEST.totals.videos} clinical videos</strong>, <strong>{ATLAS_MANIFEST.totals.hyBullets.toLocaleString()} high-yield pearls</strong>, and <strong>{ATLAS_MANIFEST.totals.rapidFireQAs.toLocaleString()} vignettes, MCQs &amp; arrow drills</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Link
                to="/app/?tab=atlas"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-orange-DEFAULT text-navy-950 font-extrabold text-sm hover:bg-orange-hover shadow-glow-orange transition-all"
              >
                Open Fullscreen Atlas Hub →
              </Link>
              <Link
                to="/app/"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/25 bg-white/8 text-white font-bold text-sm hover:bg-white/15 transition-all"
              >
                Browse Learn Tree
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ATLAS_MANIFEST.systems.map((sys) => (
              <Link
                key={sys.systemId}
                to={`/app/?system=${sys.systemId}`}
                className="p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/12 hover:border-orange-DEFAULT/60 transition-all group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 text-orange-DEFAULT flex items-center justify-center shrink-0 group-hover:bg-orange-DEFAULT group-hover:text-navy-950 transition-colors">
                  <SystemIcon systemId={sys.systemId} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs sm:text-sm text-white group-hover:text-orange-DEFAULT transition-colors truncate">
                    {sys.title}
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                    {sys.stats.topics} topics · {sys.stats.totalImages} figs · {sys.stats.rapidFireQAs} Q&amp;As
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 3. HOW IT WORKS (4-Stage Diagnostic Cognitive Flow)
// ============================================================
function PathSection() {
  const [step, setStep] = useState(3);

  const PATH_STEPS = [
    {
      num: 1,
      label: 'Spot the Clue',
      value: 'Cola-colored urine 2–3 wks post-strep',
      desc: 'Start with the exact trigger phrase, histology hook, or lab pattern the exam stem hides in sentence three.',
      color: '#FF8C1A',
      pill: '#C2410C',
    },
    {
      num: 2,
      label: 'Identify the Syndrome',
      value: 'Acute Nephritic Syndrome',
      desc: 'Anchor the clue inside its clinical bucket (hematuria, RBC casts, hypertension, oliguria) before guessing diseases.',
      color: '#6366F1',
      pill: '#4338CA',
    },
    {
      num: 3,
      label: 'Name the Diagnosis',
      value: 'Poststreptococcal GN (PSGN)',
      desc: 'Separate the winner from look-alike distractors using latency and complement (2–3 wks + low C3 vs. IgA 1–5 days + normal C3).',
      color: '#10B981',
      pill: '#047857',
    },
    {
      num: 4,
      label: 'Understand Why & Lock the Trap',
      value: 'Type III immune complexes · Subepithelial humps',
      desc: 'Cement the mechanism and NBME-style second-order question so you never miss either diagnosis or pathophysiology.',
      color: '#38BDF8',
      pill: '#0369A1',
    },
  ];

  return (
    <section id="how" className="section-pad bg-[#0A1222]">
      <div className="container-tight">
        <div className="text-center mb-14 rv">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-DEFAULT/60 text-orange-DEFAULT text-xs font-bold uppercase tracking-widest border border-white/10 mb-5">
            How It Works
          </span>
          <h2 className="text-display-3 text-white mb-4">
            Four cognitive beats from stem clue to diagnosis
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Textbooks organize medicine from disease → symptoms. Exam stems test you in reverse: from clue → syndrome → diagnosis → mechanism.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div className="space-y-3.5">
            {PATH_STEPS.map((s, i) => {
              const active = step === i;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    'w-full text-left flex gap-4 p-5 rounded-2xl border transition-all duration-200',
                    active
                      ? 'border-orange-DEFAULT/60 bg-white/10 shadow-lg'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  )}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: s.pill }}
                  >
                    0{s.num}
                  </div>
                  <div>
                    <div className="text-xs text-orange-DEFAULT uppercase tracking-wider mb-0.5 font-bold">
                      {s.label}
                    </div>
                    <div className="font-bold text-white text-base mb-1">{s.value}</div>
                    <p className="text-sm text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <PathMapSVG step={step} steps={PATH_STEPS} onSelectStep={setStep} />
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Case Flow vs. 5-Step Master Frameworks:</strong> Every one of the 1,079 atlas cases follows this 4-beat path. Separately, our{' '}
              <span className="text-orange-DEFAULT font-semibold">5-Step Diagnostic Frameworks</span> give you top-down system algorithms (e.g., Endocrine, Renal, Acid-Base/Resp, Heme) when a vignette has no obvious buzzword.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathMapSVG({
  step,
  steps,
  onSelectStep,
}: {
  step: number;
  steps: Array<{ label: string; value: string; color: string }>;
  onSelectStep: (idx: number) => void;
}) {
  return (
    <div className="bg-navy-900/70 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-slate-400">
        <span>COGNITIVE PATHWAY</span>
        <span className="text-orange-DEFAULT">CLICK ANY NODE</span>
      </div>
      <svg viewBox="0 0 360 310" className="w-full h-auto" role="img" aria-label="4-step diagnostic pathway diagram">
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1="56"
            y1={46 + i * 74}
            x2="56"
            y2={96 + i * 74}
            stroke={steps[i].color}
            strokeWidth="2.5"
            strokeDasharray="5 4"
          />
        ))}

        {steps.map((s, i) => {
          const y = 42 + i * 74;
          const isSelected = step === i;
          return (
            <g
              key={s.label}
              className="cursor-pointer"
              onClick={() => onSelectStep(i)}
            >
              <rect
                x="16"
                y={y - 24}
                width="328"
                height="54"
                rx="14"
                fill={isSelected ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.04)'}
                stroke={isSelected ? s.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={isSelected ? 2 : 1}
              />
              <circle cx="56" cy={y + 3} r="16" fill={s.color} />
              <text
                x="56"
                y={y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#060919"
                fontSize="12"
                fontWeight="800"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {i + 1}
              </text>
              <text
                x="86"
                y={y - 4}
                fill="rgba(255,255,255,0.6)"
                fontSize="9.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                {s.label.toUpperCase()}
              </text>
              <text
                x="86"
                y={y + 13}
                fill="#FFFFFF"
                fontSize="11.5"
                fontFamily="Inter, sans-serif"
                fontWeight="700"
              >
                {s.value.length > 33 ? s.value.slice(0, 33) + '…' : s.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================
// 4. BENTO FEATURES — FOUR INTERACTIVE ENGINES
// ============================================================
function BentoSection() {
  return (
    <section className="section-pad bg-[#F8FAFC] dark:bg-navy-950" id="features">
      <div className="container-tight">
        <div className="text-center mb-14 rv">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-light border border-orange-border text-orange-rust text-xs font-bold uppercase tracking-widest mb-5">
            Inside the App · Four Tools, One Method
          </span>
          <h2 className="text-display-3 text-navy-DEFAULT dark:text-white mb-4">
            Built to teach active differentiation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Try every engine live right below—click map nodes, walk a 5-step decision tree, answer a vignette drill, or paste your own stem clues.
          </p>
        </div>

        <div className="bento-grid">
          <BentoAtlas />
          <BentoFiveStep />
          <BentoDrill />
          <BentoDecoder />
        </div>
      </div>
    </section>
  );
}

function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10',
        'bg-white dark:bg-navy-900/70',
        'shadow-card hover:shadow-card-hover transition-all duration-300',
        'rv',
        className
      )}
    >
      {children}
    </div>
  );
}

function BentoAtlas() {
  const [selectedNode, setSelectedNode] = useState<'psgn' | 'goodpasture' | 'mcd'>('psgn');
  const activeCase = DEMO_CASES[selectedNode];

  return (
    <BentoCard className="bento-featured flex flex-col">
      <div className="p-7 flex-1 flex flex-col">
        <div className="mb-5">
          <span className="text-xs font-bold text-orange-rust bg-orange-light border border-orange-border px-3 py-1 rounded-full uppercase tracking-wider">
            1 · Interactive Atlas Map
          </span>
          <h3 className="text-2xl font-bold text-navy-DEFAULT dark:text-white mt-3 mb-2">
            See an entire organ system on one zoomable map
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Zoom from organ system → syndrome → stem buzzword → definitive diagnosis. Click any disease node below to inspect how look-alikes split.
          </p>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-navy-950/70 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              RENAL // GLOMERULAR SPLIT
            </span>
            <span className="text-xs font-mono font-bold text-orange-rust dark:text-orange-DEFAULT">
              CLICK A DIAGNOSIS NODE
            </span>
          </div>

          <BentoAtlasSVG selected={selectedNode} onSelect={setSelectedNode} />

          {/* Selected Node Live Inspector */}
          <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-navy-DEFAULT dark:text-white">
                {activeCase.diagnosis} <span className="text-orange-rust dark:text-orange-DEFAULT font-semibold">· {activeCase.buzzword}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {activeCase.labSignature}
              </div>
            </div>
            <Link
              to={`/app/#${activeCase.id}`}
              className="text-xs font-bold px-3 py-2 rounded-lg bg-navy-DEFAULT text-white hover:bg-navy-500 whitespace-nowrap transition-colors text-center"
            >
              Open case →
            </Link>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

function BentoAtlasSVG({
  selected,
  onSelect,
}: {
  selected: 'psgn' | 'goodpasture' | 'mcd';
  onSelect: (id: 'psgn' | 'goodpasture' | 'mcd') => void;
}) {
  const staticNodes = [
    { id: 'renal', x: 180, y: 12, w: 150, label: 'Renal & Urinary', fill: '#1E2A8A', stroke: '#141C66', textFill: '#FFFFFF' },
    { id: 'nephritic', x: 75, y: 74, w: 145, label: 'Nephritic (RBC casts)', fill: '#EEF2FF', stroke: '#4F46E5', textFill: '#1E2A8A' },
    { id: 'nephrotic', x: 315, y: 74, w: 155, label: 'Nephrotic (>3.5g/d)', fill: '#FFF1F2', stroke: '#E11D48', textFill: '#881337' },
    { id: 'cola', x: 16, y: 138, w: 130, label: 'Low C3 · Humps', fill: '#FFF7ED', stroke: '#F97316', textFill: '#9A3412' },
    { id: 'linear', x: 162, y: 138, w: 130, label: 'Linear IgG + Lung', fill: '#F8FAFC', stroke: '#64748B', textFill: '#0F172A' },
    { id: 'footproc', x: 325, y: 138, w: 135, label: 'Normal LM · Child', fill: '#F8FAFC', stroke: '#64748B', textFill: '#0F172A' },
  ];

  const dxNodes: Array<{ id: 'psgn' | 'goodpasture' | 'mcd'; x: number; y: number; w: number; label: string }> = [
    { id: 'psgn', x: 16, y: 202, w: 130, label: 'PSGN' },
    { id: 'goodpasture', x: 162, y: 202, w: 130, label: 'Goodpasture' },
    { id: 'mcd', x: 325, y: 202, w: 135, label: 'Minimal Change' },
  ];

  const allNodes = [...staticNodes, ...dxNodes];
  const edges = [
    ['renal', 'nephritic'],
    ['renal', 'nephrotic'],
    ['nephritic', 'cola'],
    ['nephritic', 'linear'],
    ['nephrotic', 'footproc'],
    ['cola', 'psgn'],
    ['linear', 'goodpasture'],
    ['footproc', 'mcd'],
  ];

  return (
    <svg viewBox="0 0 490 248" className="w-full h-auto" role="img" aria-label="Interactive Renal Atlas tree">
      {edges.map(([a, b]) => {
        const na = allNodes.find((n) => n.id === a)!;
        const nb = allNodes.find((n) => n.id === b)!;
        const ax = na.x + na.w / 2;
        const ay = na.y + 34;
        const bx = nb.x + nb.w / 2;
        const by = nb.y;
        return (
          <path
            key={`${a}-${b}`}
            d={`M${ax},${ay} C${ax},${(ay + by) / 2} ${bx},${(ay + by) / 2} ${bx},${by}`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.7"
          />
        );
      })}

      {staticNodes.map((node) => (
        <g key={node.id}>
          <rect x={node.x} y={node.y} width={node.w} height={34} rx="9" fill={node.fill} stroke={node.stroke} strokeWidth="1.5" />
          <text x={node.x + node.w / 2} y={node.y + 21} textAnchor="middle" fill={node.textFill} fontSize="11" fontFamily="Inter, sans-serif" fontWeight="700">
            {node.label}
          </text>
        </g>
      ))}

      {dxNodes.map((node) => {
        const isSel = selected === node.id;
        return (
          <g key={node.id} className="cursor-pointer" onClick={() => onSelect(node.id)}>
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={36}
              rx="10"
              fill={isSel ? '#FF8C1A' : '#1E2A8A'}
              stroke={isSel ? '#C2410C' : '#141C66'}
              strokeWidth="2"
            />
            <text
              x={node.x + node.w / 2}
              y={node.y + 22}
              textAnchor="middle"
              fill={isSel ? '#060919' : '#FFFFFF'}
              fontSize="11.5"
              fontFamily="Inter, sans-serif"
              fontWeight="800"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BentoFiveStep() {
  const [fwIdx, setFwIdx] = useState(0);
  const [active, setActive] = useState(1);
  const fw = FRAMEWORKS[fwIdx];

  return (
    <BentoCard className="bento-side flex flex-col">
      <div className="p-7 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-navy-DEFAULT dark:text-blue-300 bg-navy-50 dark:bg-navy-DEFAULT/30 border border-navy-100 dark:border-navy-DEFAULT/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
            2 · 5-Step Frameworks
          </span>
          <h3 className="text-xl font-bold text-navy-DEFAULT dark:text-white mb-2">
            Repeatable algorithms across 8 systems
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            When a stem lacks a classic buzzword, work top-down through 5 structured clinical checkpoints.
          </p>

          {/* System mini-pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {FRAMEWORKS.slice(0, 4).map((item, idx) => (
              <button
                key={item.system}
                type="button"
                onClick={() => {
                  setFwIdx(idx);
                  setActive(1);
                }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors',
                  fwIdx === idx
                    ? 'bg-orange-DEFAULT text-navy-950 border-orange-DEFAULT'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                )}
              >
                {item.system.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* 5 Steps */}
          <div className="space-y-1.5">
            {fw.steps.map((title, idx) => {
              const n = idx + 1;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setActive(n)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-left transition-all',
                    active === n
                      ? 'bg-navy-DEFAULT text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  )}
                >
                  <span
                    className={cn(
                      'w-6 h-6 flex items-center justify-center rounded-md text-xs font-extrabold flex-shrink-0',
                      active === n ? 'bg-orange-DEFAULT text-navy-950' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {n}
                  </span>
                  <span className="leading-snug">{title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Free on all plans</span>
          <Link to="/app/" className="font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline">
            Open 5-Step Master →
          </Link>
        </div>
      </div>
    </BentoCard>
  );
}

function BentoDrill() {
  const DRILL_SAMPLES = [
    {
      caseId: 'psgn',
      stem: 'An 8-year-old boy presents with dark, tea-colored urine and periorbital edema three weeks after honey-crusted facial lesions. BP is 142/92 mmHg. UA shows dysmorphic RBCs and RBC casts. Serum C3 is markedly low.',
      opts: ['IgA nephropathy (Berger disease)', 'Poststreptococcal GN (PSGN)', 'Minimal change disease', 'Goodpasture syndrome'],
      correct: 1,
      explain: '2–3 week latency post-impetigo + low C3 locks in PSGN. IgA nephropathy occurs 1–5 days post-URI with normal C3.',
    },
    {
      caseId: 'apl',
      stem: 'A 29-year-old woman has gingival bleeding, oozing from IV sites, D-dimer elevation, and blasts packed with bundles of needle-like eosinophilic rods. Which treatment must start immediately?',
      opts: ['Imatinib (tyrosine kinase inhibitor)', 'All-trans retinoic acid (ATRA)', 'Rituximab (anti-CD20)', 'Eculizumab (anti-C5)'],
      correct: 1,
      explain: 'Auer rod bundles + DIC = t(15;17) APL (AML M3). Start ATRA immediately to induce promyelocyte maturation and halt fatal DIC.',
    },
  ];

  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const q = DRILL_SAMPLES[qIdx];
  const revealed = selected !== null;

  return (
    <BentoCard className="bento-half flex flex-col">
      <div className="p-7 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2.5">
              3 · Vignette Drill
            </span>
            <h3 className="text-xl font-bold text-navy-DEFAULT dark:text-white">
              Practice the exact way NBME stems test
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setQIdx((i) => (i + 1) % DRILL_SAMPLES.length);
              setSelected(null);
            }}
            className="text-xs font-bold text-navy-DEFAULT dark:text-orange-DEFAULT px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Switch stem ({qIdx + 1}/{DRILL_SAMPLES.length})
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950/60 border-l-4 border-navy-DEFAULT dark:border-orange-DEFAULT rounded-r-xl px-5 py-4 mb-4">
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-vignette">
            {q.stem}
          </p>
        </div>

        <div className="space-y-2 flex-1">
          {q.opts.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = i === selected;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all',
                  !revealed && 'border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-navy-DEFAULT dark:hover:border-orange-DEFAULT',
                  revealed && isCorrect && 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold',
                  revealed && !isCorrect && isPicked && 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-200',
                  revealed && !isCorrect && !isPicked && 'opacity-55 border-slate-200 dark:border-white/5 text-slate-500'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0',
                    revealed && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : revealed && isPicked
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
            <strong>✓ Reasoning:</strong> {q.explain}
            <Link to={`/app/#${q.caseId}`} className="block mt-2 text-xs text-emerald-800 dark:text-emerald-400 font-bold hover:underline">
              Open full case in the atlas →
            </Link>
          </div>
        )}
      </div>
    </BentoCard>
  );
}

function BentoDecoder() {
  const [inputVal, setInputVal] = useState(DECODER_STEMS[0].text);
  const { matches, detectedClues, noMatch } = decodeClinicalStem(inputVal);

  return (
    <BentoCard className="bento-half flex flex-col">
      <div className="p-7 flex-1 flex flex-col">
        <span className="text-xs font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2.5 self-start">
          4 · Browser-Local Stem Decoder
        </span>
        <h3 className="text-xl font-bold text-navy-DEFAULT dark:text-white mb-1">
          Paste a clinical stem. See the top match & traps.
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Honest match confidence—never guesses when clues are insufficient. Runs 100% in your browser.
        </p>

        <div className="mb-3">
          <label htmlFor="bento-decoder-input" className="sr-only">
            Clinical stem or buzzwords
          </label>
          <textarea
            id="bento-decoder-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={3}
            placeholder="Paste a clinical vignette or type buzzwords…"
            className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-white/15 rounded-xl bg-slate-50 dark:bg-navy-950/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT dark:focus:ring-orange-DEFAULT leading-relaxed"
          />
        </div>

        {/* Sample chips — medically verified */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {DECODER_STEMS.slice(0, 5).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setInputVal(s.text)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-orange-light hover:text-orange-rust dark:hover:bg-orange-DEFAULT/20 dark:hover:text-orange-DEFAULT transition-all border border-slate-200/80 dark:border-white/10"
            >
              {s.label}
            </button>
          ))}
        </div>

        {detectedClues.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
            <span className="font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Detected clues:</span>
            {detectedClues.slice(0, 4).map((cl) => (
              <span key={cl} className="px-2 py-0.5 rounded bg-orange-light text-orange-rust font-semibold border border-orange-border">
                {cl}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-2">
          {noMatch ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 text-center">
              No confident match. Try a sample stem above or type a classic Step 1 trigger phrase (e.g. &ldquo;Maltese cross&rdquo;, &ldquo;Linear IgG&rdquo;, &ldquo;Valsalva&rdquo;).
            </div>
          ) : (
            matches.map((r, i) => (
              <div
                key={r.diagnosis}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all gap-3',
                  i === 0
                    ? 'bg-orange-light/70 dark:bg-orange-DEFAULT/15 border-orange-border dark:border-orange-DEFAULT/40'
                    : 'bg-white dark:bg-navy-950/40 border-slate-200 dark:border-white/10'
                )}
              >
                <div className="min-w-0">
                  <div className={cn('font-bold', i === 0 ? 'text-navy-DEFAULT dark:text-orange-DEFAULT' : 'text-slate-800 dark:text-slate-200')}>
                    {r.diagnosis}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                    {r.system} · {r.detail}
                  </div>
                </div>
                <Link
                  to={`/app/#${r.caseId}`}
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0',
                    r.confidence === 'top'
                      ? 'bg-orange-DEFAULT text-navy-950 hover:bg-orange-hover'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {r.confidence === 'top' ? 'Top match →' : 'Possible'}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </BentoCard>
  );
}

// ============================================================
// 5. YOUR STUDY STACK COMPARISON (Restored & Upgraded from rapidsteps.tech)
// ============================================================
function StudyStackSection() {
  const ROWS = [
    {
      tool: 'Rapid Steps',
      highlight: true,
      role: 'Pattern-recognition atlas & differential splitter',
      direction: 'Stem clue → Syndrome → Diagnosis → Trap',
      when: 'Before & after Q-bank blocks to see why look-alikes split',
    },
    {
      tool: 'Question Banks (UWorld / AMBOSS)',
      highlight: false,
      role: 'Timed exam simulation & endurance',
      direction: 'Random multi-step vignettes → Score assessment',
      when: 'Daily timed blocks to test retrieval under exam pressure',
    },
    {
      tool: 'Flashcards (Anki)',
      highlight: false,
      role: 'Isolated fact retention via spaced repetition',
      direction: 'Single prompt → Single atomic fact',
      when: 'Locking in drug names, genes, and enzyme cofactors',
    },
    {
      tool: 'Textbooks & Videos (First Aid / Pathoma)',
      highlight: false,
      role: 'Foundational first-pass physiology & pathology',
      direction: 'Disease heading → List of features',
      when: 'Initial organ-block learning before active practice',
    },
  ];

  return (
    <section id="stack" className="section-pad bg-white dark:bg-[#0B1226] border-t border-slate-200/70 dark:border-white/5">
      <div className="container-tight">
        <div className="text-center mb-12 rv">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-50 dark:bg-white/8 text-navy-DEFAULT dark:text-blue-200 text-xs font-bold uppercase tracking-widest border border-navy-100 dark:border-white/10 mb-4">
            Your Study Stack
          </span>
          <h2 className="text-display-3 text-navy-DEFAULT dark:text-white mb-4">
            A companion to your Q-bank, not a replacement
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Students miss Step 1 questions when two syndromes blur together. Rapid Steps builds the visual map between First Aid reading and UWorld blocks.
          </p>
        </div>

        <div className="rv overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-navy-900/60">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/70 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-bold">Resource</th>
                <th className="py-4 px-6 font-bold">Primary Job</th>
                <th className="py-4 px-6 font-bold">Cognitive Direction</th>
                <th className="py-4 px-6 font-bold">Best Moment to Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/8 text-sm">
              {ROWS.map((r) => (
                <tr
                  key={r.tool}
                  className={cn(
                    r.highlight
                      ? 'bg-orange-light/55 dark:bg-orange-DEFAULT/12'
                      : 'hover:bg-slate-50/70 dark:hover:bg-white/[0.03]'
                  )}
                >
                  <td className="py-4 px-6 font-extrabold text-navy-DEFAULT dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {r.highlight && (
                        <span className="w-2 h-2 rounded-full bg-orange-DEFAULT flex-shrink-0" />
                      )}
                      <span>{r.tool}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-200 font-medium">{r.role}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs">{r.direction}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{r.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 6. FREE VS PAID
// ============================================================
function FreePaidSection() {
  const freeFeatures = [
    'First 3 cases in every organ system (48 cases in full)',
    'Complete vignette, mechanism, lab signature, trap & question on free cases',
    'Interactive Atlas Map, Vignette Drill & Stem Decoder on free cases',
    'All 8 system 5-Step Diagnostic Master Frameworks',
    'Instant access—no credit card, no account required',
  ];
  const paidFeatures = [
    'All 1,079 cases across all 16 USMLE Step 1 organ systems',
    'Every look-alike exam trap & NBME-style check question',
    'All ~2,289 high-yield pathology, lab & mechanism pearls',
    'Restore your paid plan on any phone, tablet, or laptop via 6-digit email code',
    'Prepaid one-time access—zero recurring billing or surprise renewals',
  ];

  return (
    <section className="section-pad bg-[#F8FAFC] dark:bg-[#0A1222] border-t border-slate-200/70 dark:border-white/5">
      <div className="container-tight">
        <div className="text-center mb-14 rv">
          <h2 className="text-display-3 text-navy-DEFAULT dark:text-white mb-4">
            Start free. Unlock the full atlas when it clicks.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Test the method across all 16 organ systems before spending a dollar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rv rounded-3xl border border-slate-200 dark:border-white/10 p-8 bg-white dark:bg-navy-900/50 flex flex-col justify-between">
            <div>
              <div className="text-2xl font-extrabold text-navy-DEFAULT dark:text-white mb-1">Free Explorer</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm mb-6">$0 forever · No account or card needed</div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-navy-50 dark:bg-navy-DEFAULT/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1E2A8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-blue-300">
                        <path d="M20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/app/"
              className="block w-full text-center py-3.5 rounded-full border-2 border-navy-DEFAULT text-navy-DEFAULT dark:text-white dark:border-white/30 font-bold text-sm hover:bg-navy-DEFAULT hover:text-white dark:hover:bg-white/10 transition-all"
            >
              Explore 48 free cases →
            </Link>
          </div>

          <div className="rv rounded-3xl border-2 border-orange-DEFAULT bg-gradient-to-br from-white to-[#FFFDF9] dark:from-navy-900/80 dark:to-[#131D36] p-8 shadow-glow-orange/20 relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 bg-orange-DEFAULT text-navy-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
              Full Catalog
            </div>
            <div>
              <div className="text-2xl font-extrabold text-navy-DEFAULT dark:text-white mb-1">Full Atlas Access</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mb-6">From $6.58/mo equiv. · Prepaid · 14-day refund</div>
              <ul className="space-y-3 mb-8">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-orange-light border border-orange-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="#pricing"
              className="block w-full text-center py-3.5 rounded-full bg-orange-DEFAULT text-navy-950 font-extrabold text-sm hover:bg-orange-hover transition-all shadow-glow-orange"
            >
              Compare prepaid plans
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 7. PRICING (With Monthly Equivalent, Savings Badges & Click-to-Copy Codes)
// ============================================================
const PLANS = [
  {
    id: 'plan1mo',
    label: '1 Month',
    price: 19,
    perMonth: '$19 / mo',
    savings: null,
    duration: '30 days access',
    tagline: 'Ideal for dedicated final-month rapid review before exam day.',
    featured: false,
    badge: null,
  },
  {
    id: 'plan6mo',
    label: '6 Months',
    price: 50,
    perMonth: '$8.33 / mo',
    savings: 'Save ~56%',
    duration: '180 days access',
    tagline: 'Covers your entire dedicated Step 1 study runway.',
    featured: true,
    badge: 'Most Popular',
  },
  {
    id: 'plan12mo',
    label: '12 Months',
    price: 79,
    perMonth: '$6.58 / mo',
    savings: 'Save ~65%',
    duration: '365 days access',
    tagline: 'Lowest monthly cost—built for M2 organ blocks through Step 1.',
    featured: false,
    badge: 'Lowest Monthly Cost',
  },
];

const PLAN_FEATURES = [
  'All 1,079 cases & ~2,289 high-yield facts',
  'All 16 organ systems + 5-Step Frameworks',
  'Vignette Drill + Browser-local Stem Decoder',
  'Sign in on phone, tablet & laptop via email OTP',
];

function PricingSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyDiscount = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="pricing" className="section-pad bg-[#EEF3FF] dark:bg-navy-950 border-t border-slate-200/70 dark:border-white/5">
      <div className="container-tight">
        <div className="text-center mb-5 rv">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-DEFAULT/10 dark:bg-navy-DEFAULT/60 text-navy-DEFAULT dark:text-blue-200 text-xs font-bold uppercase tracking-widest border border-navy-DEFAULT/20 dark:border-navy-DEFAULT mb-5">
            Prepaid · Anti-Subscription
          </span>
          <h2 className="text-display-3 text-navy-DEFAULT dark:text-white mb-4">
            One-time payment. Never a subscription.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Pay once for the runway you need. Paddle (our merchant of record) shows any local VAT/tax clearly before you pay.
          </p>
        </div>

        <div className="rv flex items-center justify-center gap-3 mb-12 p-4 max-w-2xl mx-auto rounded-2xl bg-navy-DEFAULT text-white text-sm font-medium shadow-md">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 text-orange-DEFAULT">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            When your prepaid period ends, paid cases lock again and your 48 free cases stay free.{' '}
            <strong className="text-orange-DEFAULT">Zero auto-renewals.</strong>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'price-card rv flex flex-col justify-between',
                plan.featured && 'featured'
              )}
            >
              {plan.badge && (
                <div
                  className={cn(
                    'absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm',
                    plan.featured
                      ? 'bg-gradient-to-r from-orange-hover to-orange-DEFAULT text-navy-950 shadow-glow-orange'
                      : 'bg-navy-DEFAULT text-white'
                  )}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-lg font-extrabold text-navy-DEFAULT dark:text-white">{plan.label}</span>
                  {plan.savings && (
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-5xl font-extrabold text-navy-DEFAULT dark:text-white font-display tracking-tight">
                    ${plan.price}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">USD total</span>
                </div>

                <div className="text-xs font-mono font-bold text-orange-rust dark:text-orange-DEFAULT mb-3">
                  {plan.perMonth} · {plan.duration}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {plan.tagline}
                </p>

                <ul className="space-y-2.5 mb-8 border-t border-slate-100 dark:border-white/10 pt-5">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={plan.featured ? '#FF8C1A' : '#1E2A8A'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 mt-0.5 dark:stroke-orange-DEFAULT"
                      >
                        <path d="M20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
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
                Unlock {plan.label.toLowerCase()} — ${plan.price}
              </Link>
            </div>
          ))}
        </div>

        {/* Interactive Student Discount Pills + Transparent Policy Fine Print */}
        <div className="rv max-w-3xl mx-auto text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Student discount codes (click to copy for checkout):</span>
            {[
              { code: 'STUDY10', desc: '10% off individual' },
              { code: 'GROUP15', desc: '15% off 3+ students' },
            ].map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => copyDiscount(d.code)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/15 font-mono font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:border-orange-DEFAULT transition-colors"
              >
                <span>{copiedCode === d.code ? '✓ Copied!' : d.code}</span>
                <span className="font-sans font-normal text-slate-500 dark:text-slate-400">({d.desc})</span>
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>14-day no-questions-asked refund.</strong>{' '}
            <Link to="/refunds" className="text-navy-DEFAULT dark:text-blue-300 font-semibold hover:underline">
              Read refund policy
            </Link>
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Transparent notes: Paid plans sync account entitlement across devices via email OTP; study mastery/bookmark logs stay private in your browser&apos;s local storage. There is no per-day cap on opening cases.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 8. TRUST + COMPLETE 11-QUESTION SEARCHABLE FAQ
// ============================================================
const TRUST_ITEMS = [
  {
    title: 'Paddle Merchant Security',
    body: 'Checkout is handled by Paddle. Your card details never touch our servers.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Passwordless 6-Digit Login',
    body: 'No passwords to forget or leak. Sign in with a one-time code sent to your email.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    title: '14-Day Full Refund',
    body: 'Not clicking for how you study? Email us within 14 days for a full, no-questions refund.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    title: 'Zero Ad Trackers',
    body: 'No third-party ad pixels. Pasted Stem Decoder vignettes never leave your browser.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: 'What do I get for free?',
    a: 'The first 3 cases of every organ system (48 cases total across all 16 systems) are unlocked in full—vignette, mechanism, lab signature, look-alike trap, and check question—plus all 8 system 5-Step Diagnostic Frameworks, the interactive Atlas map, and the Stem Decoder on free cases. No account or card is required.',
  },
  {
    q: 'Is this a recurring subscription?',
    a: 'No. Every plan is a single prepaid payment: $19 (30 days), $50 (180 days), or $79 (365 days). Nothing ever auto-renews. When your prepaid period ends, paid cases simply lock again while the 48 free cases stay open.',
  },
  {
    q: 'Does my study progress sync across devices?',
    a: 'Your paid plan unlocks on any phone, tablet, or computer when you sign in with your email. However, your mastered checkmarks, bookmarks, and drill scores are stored locally in each device’s browser for speed and privacy—so progress checklists do not currently cloud-sync between devices.',
  },
  {
    q: 'Who built Rapid Steps?',
    a: 'Rapid Steps is independently authored and maintained by a medical student obsessed with visual differential diagnosis and Step 1 pattern recognition. Spotted a typo or want to suggest a high-yield trap? Email support@rapidsteps.tech directly.',
  },
  {
    q: 'Is my pasted text in the Stem Decoder private?',
    a: 'Yes—100%. Stem matching runs locally inside your browser in JavaScript. Pasted vignettes or notes are never uploaded, logged, or saved on any server.',
  },
  {
    q: 'Does the app work offline?',
    a: 'An internet connection is required: case content loads from this site over the web, and there is no offline download yet. Once loaded in your session, navigation and stem decoding are instant.',
  },
  {
    q: 'How do I sign in without a password?',
    a: 'Enter your email address inside the app and we send a one-time 6-digit verification code. Enter the code and your paid access is immediately active on that device.',
  },
  {
    q: 'Can I get a refund if it’s not right for me?',
    a: 'Yes. Request a full refund within 14 days of purchase—no questions asked. Just email support@rapidsteps.tech from your sign-in email or include your Paddle receipt.',
  },
  {
    q: 'Who processes payments and VAT/tax?',
    a: 'Paddle.com is our authorized Merchant of Record and handles all billing, receipts, and regional sales tax/VAT compliance. You always see the exact final total before completing payment.',
  },
  {
    q: 'Can I install Rapid Steps on my phone or iPad?',
    a: 'Yes! Rapid Steps is a mobile-ready Progressive Web App (PWA). Use "Add to Home Screen" in Safari or Chrome for a full-screen native-like study experience alongside desktop.',
  },
  {
    q: 'Is Rapid Steps affiliated with the USMLE or NBME?',
    a: 'No. Rapid Steps is an independent educational study tool and is not affiliated with, endorsed by, or sponsored by the NBME, FSMB, USMLE, or any question-bank publisher. All content is for exam preparation only and is not medical advice.',
  },
];

function TrustFaqSection() {
  const [faqQuery, setFaqQuery] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  const visibleFaqs = FAQ_ITEMS.filter(
    (item) =>
      !faqQuery.trim() ||
      item.q.toLowerCase().includes(faqQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(faqQuery.toLowerCase())
  );

  return (
    <>
      <section className="section-pad bg-white dark:bg-[#0A1222] border-t border-slate-200/70 dark:border-white/5">
        <div className="container-tight">
          <div className="text-center mb-12 rv">
            <h2 className="text-display-3 text-navy-DEFAULT dark:text-white">Simple, safe and fair</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((t) => (
              <div
                key={t.title}
                className="rv p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-navy-900/40 hover:border-orange-DEFAULT transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-light dark:bg-orange-DEFAULT/15 text-orange-rust dark:text-orange-DEFAULT flex items-center justify-center mb-4 border border-orange-border dark:border-orange-DEFAULT/30">
                  {t.icon}
                </div>
                <h3 className="font-bold text-navy-DEFAULT dark:text-white mb-1.5 text-base">{t.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-pad bg-[#F8FAFC] dark:bg-navy-950 border-t border-slate-200/70 dark:border-white/5">
        <div className="container-tight">
          <div className="text-center mb-8 rv">
            <h2 className="text-display-3 text-navy-DEFAULT dark:text-white mb-3">Questions, answered plainly</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Clear answers on free cases, prepaid billing, privacy, and how the atlas works.
            </p>
          </div>

          {/* Search + Expand All toolbar */}
          <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="search"
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Filter questions (e.g., refund, offline, sync, subscription)…"
              aria-label="Filter FAQ questions"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT"
            />
            <button
              type="button"
              onClick={() => setExpandAll((v) => !v)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-900 text-xs font-bold text-navy-DEFAULT dark:text-slate-200 hover:border-navy-DEFAULT transition-colors whitespace-nowrap"
            >
              {expandAll ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {visibleFaqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} forceOpen={expandAll} />
            ))}
            {visibleFaqs.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-6">
                No matching FAQ found. Email <a href="mailto:support@rapidsteps.tech" className="text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold underline">support@rapidsteps.tech</a> anytime.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FaqItem({ q, a, forceOpen }: { q: string; a: string; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <details
      className="group rv rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-navy-900/40 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-navy-DEFAULT dark:text-white text-base">
        <span>{q}</span>
        <span
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
            open
              ? 'bg-navy-DEFAULT text-white rotate-45'
              : 'bg-orange-light border border-orange-border text-orange-rust'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
        {a}
      </div>
    </details>
  );
}

// ============================================================
// 9. FINAL CTA
// ============================================================
function FinalCtaSection() {
  return (
    <section
      className="section-pad relative overflow-hidden border-t border-slate-100 dark:border-white/5"
      style={{
        background: 'linear-gradient(145deg, #060919 0%, #141C66 50%, #1E2A8A 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(900px 500px at 50% 110%, rgba(255,140,26,0.24) 0%, transparent 65%)',
        }}
      />

      <div className="container-tight relative z-10 text-center rv">
        <h2 className="text-display-2 text-white mb-5">Ready to see how fast it clicks?</h2>
        <p className="text-slate-200 text-xl mb-10 max-w-xl mx-auto">
          Open the atlas right now and explore 48 full clinical cases across all 16 organ systems—free, with no account required.
        </p>
        <Link
          to="/app/"
          className="inline-flex items-center gap-3 px-10 py-4 text-lg font-extrabold bg-orange-DEFAULT text-navy-950 rounded-full hover:bg-orange-hover shadow-glow-orange hover:scale-[1.03] transition-all min-h-[60px]"
        >
          Explore 48 free cases
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

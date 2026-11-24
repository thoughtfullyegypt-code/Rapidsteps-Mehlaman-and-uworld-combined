import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';
import { prefersReducedMotion } from '@/lib/motion';
import { DECODER_STEMS, DEMO_CASES, FRAMEWORKS, decodeClinicalStem } from '@/lib/catalog';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import { SystemIcon, IconShield } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

type ConsoleCaseKey = 'psgn' | 'apl' | 'hocm' | 'graves';
type HeroTab = 'atlas' | 'drill' | 'decoder' | 'steps';

export default function HomePage() {
  const [heroCase, setHeroCase] = useState<ConsoleCaseKey>('psgn');
  const [heroTab, setHeroTab] = useState<HeroTab>('atlas');

  useEffect(() => {
    document.title = 'Rapid Steps | USMLE Step 1 Pattern-Recognition Atlas';
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
// 1. HERO + INTEGRATED 4-TAB CLINICAL WORKBENCH
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
    <section
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080D1A 0%, #0E1629 58%, #0F1854 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(960px 480px at 50% 0%, rgba(255, 140, 26, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="container-tight relative z-10">
        {/* Centered Typographic Focal Block */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.6rem] text-white leading-[1.06] tracking-[-0.03em] font-extrabold font-display">
            Recognize the clue.{' '}
            <span className="text-orange-DEFAULT block sm:inline">Name the diagnosis.</span>
          </h1>

          <p className="text-slate-300 text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mx-auto mt-5">
            Connect USMLE Step 1 stem buzzwords to syndromes, mechanisms, lab signatures, and exam traps with drills, stem decoding, and 5-step frameworks.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              to="/app/"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[15px] font-semibold bg-orange-DEFAULT text-navy-950 rounded-full hover:bg-orange-hover transition-colors duration-150 min-h-[50px]"
            >
              <span>Explore 48 free cases</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Wide Integrated Clinical Workbench */}
        <div className="mt-12 max-w-[920px] mx-auto">
          <HeroClinicalConsole
            activeCase={activeCase}
            onSelectCase={onSelectCase}
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            onQuickClue={onQuickClue}
          />
        </div>
      </div>
    </section>
  );
}

const HERO_DRILLS = [
  {
    id: 'psgn',
    badge: 'Renal differential trap',
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
    badge: 'Cardio hemodynamics',
    question: 'A 19-year-old athlete has a harsh systolic murmur at the LLSB. Which bedside maneuver INCREASES murmur intensity in HOCM?',
    options: [
      'Sustained handgrip (increases afterload)',
      'Passive leg raise while supine (increases preload)',
      'Valsalva strain phase or abrupt standing (decreases preload)',
      'Rapid squatting from standing (increases preload & afterload)',
    ],
    correct: 2,
    explanation:
      'Valsalva and abrupt standing reduce venous return, shrinking LV chamber volume and pulling the anterior mitral leaflet closer to the hypertrophied septum, making the HOCM murmur louder.',
  },
];

function HeroClinicalConsole({
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
  const [atlasStage, setAtlasStage] = useState<1 | 2 | 3>(3);
  useEffect(() => {
    setAtlasStage(3);
  }, [activeCase]);

  const [drillIdx, setDrillIdx] = useState(0);
  const [pickedOpt, setPickedOpt] = useState<number | null>(null);
  const currentDrill = HERO_DRILLS[drillIdx];

  const [decoderText, setDecoderText] = useState(
    'Cola-colored urine 2 weeks after sore throat, RBC casts, low serum C3'
  );
  const decoded = decodeClinicalStem(decoderText);

  const [fwStep, setFwStep] = useState(3);
  const endoFw = FRAMEWORKS[0];

  const c = DEMO_CASES[activeCase];

  const tabs: Array<{ id: HeroTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'atlas',
      label: 'Atlas',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      id: 'decoder',
      label: 'Decoder',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35M8 11h6" />
        </svg>
      ),
    },
    {
      id: 'steps',
      label: '5-Step',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h12M3 18h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/15 bg-white text-[#0D1321] shadow-[0_24px_64px_rgba(0,0,0,0.38)] flex flex-col">
      {/* Workbench Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0E1629] text-white border-b border-white/10">
        <div className="text-[13px] font-semibold text-slate-200">
          Interactive clinical workbench
        </div>
        <Link
          to={`/app/#${activeCase}`}
          className="text-[13px] font-semibold text-orange-DEFAULT hover:text-orange-hover transition-colors duration-150"
        >
          Open full app →
        </Link>
      </div>

      {/* Mode Switcher */}
      <div
        className="grid grid-cols-4 gap-1 p-1.5 bg-[#F1F3F7] border-b border-[#E2E6EE]"
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
                'flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[13px] font-semibold transition-[background-color,color,box-shadow] duration-150 ease-standard',
                isSelected
                  ? 'bg-white text-[#16236E] shadow-sm'
                  : 'text-[#526074] hover:text-[#0D1321] hover:bg-white/60'
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workbench Content */}
      <div className="p-5 sm:p-7 bg-white min-h-[380px] flex flex-col justify-between">
        {/* ==================== TAB 1: ATLAS ==================== */}
        {activeTab === 'atlas' && (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div>
              {/* Integrated Quick-Clue Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E2E6EE]">
                <span className="text-[13px] font-semibold text-[#526074]">
                  {c.systemName}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CLUES.map((item) => {
                    const isActive = activeCase === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onQuickClue(item.key)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors duration-150',
                          isActive
                            ? 'bg-[#FFF4E5] border-[#FFD29D] text-[#0D1321] font-semibold'
                            : 'bg-[#F7F8FA] border-[#E2E6EE] text-[#526074] hover:text-[#0D1321] hover:border-[#CBD2DF]'
                        )}
                      >
                        <span className="text-[#C2550A] font-semibold mr-1.5">{item.tag}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3-Step Clinical Trace */}
              <div className="mt-5 grid md:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  {/* Stem Clue */}
                  <div className="p-4 rounded-xl bg-[#FFF4E5]/70 border-l-[3px] border-[#FF8C1A]">
                    <div className="text-[13px] font-semibold text-[#C2550A] mb-1">
                      Trigger buzzword
                    </div>
                    <div className="text-[15px] font-semibold text-[#0D1321] leading-snug">
                      {c.buzzword}
                    </div>
                  </div>

                  {/* Syndrome */}
                  {atlasStage >= 2 ? (
                    <div className="p-4 rounded-xl bg-[#F1F3F7] border-l-[3px] border-[#16236E]">
                      <div className="text-[13px] font-semibold text-[#16236E] mb-1">
                        Clinical syndrome
                      </div>
                      <div className="text-[15px] font-semibold text-[#0D1321] leading-snug">
                        {c.syndrome}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAtlasStage(2)}
                      className="w-full py-3.5 px-4 rounded-xl border border-dashed border-[#CBD2DF] text-[13px] font-semibold text-[#16236E] hover:bg-[#F7F8FA] transition-colors duration-150 text-left"
                    >
                      Reveal clinical syndrome →
                    </button>
                  )}
                </div>

                {/* Diagnosis + Mechanism + Exam Trap */}
                <div>
                  {atlasStage >= 3 ? (
                    <div className="p-5 rounded-xl bg-[#16236E] text-white space-y-3">
                      <div>
                        <div className="text-[13px] font-semibold text-orange-DEFAULT mb-1">
                          Definitive diagnosis
                        </div>
                        <div className="text-lg font-bold font-display text-white leading-snug">
                          {c.diagnosis}
                        </div>
                      </div>
                      <p className="text-[15px] text-slate-200 leading-relaxed border-t border-white/15 pt-3">
                        <strong className="text-white font-semibold">Mechanism:</strong> {c.mechanism}
                      </p>
                      <div className="border-l-[3px] border-orange-DEFAULT pl-3 py-0.5 text-[15px] text-slate-100 leading-relaxed">
                        <strong className="text-orange-DEFAULT font-semibold">Exam trap:</strong> {c.trap}
                      </div>
                    </div>
                  ) : (
                    atlasStage === 2 && (
                      <button
                        type="button"
                        onClick={() => setAtlasStage(3)}
                        className="w-full py-3.5 px-4 rounded-xl bg-orange-DEFAULT text-navy-950 text-[13px] font-semibold hover:bg-orange-hover transition-colors duration-150"
                      >
                        Reveal diagnosis &amp; exam trap →
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E2E6EE] text-[13px]">
              <button
                type="button"
                onClick={() => setAtlasStage(atlasStage === 3 ? 1 : 3)}
                className="font-medium text-[#526074] hover:text-[#0D1321] transition-colors duration-150"
              >
                {atlasStage === 3 ? 'Hide diagnosis to self-test' : 'Show full card'}
              </button>
              <Link to={`/app/#${c.id}`} className="font-semibold text-[#16236E] hover:underline">
                Study full vignette in app →
              </Link>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: DRILL ==================== */}
        {activeTab === 'drill' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[13px] font-semibold text-[#C2550A]">
                  {currentDrill.badge}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDrillIdx((i) => (i + 1) % HERO_DRILLS.length);
                    setPickedOpt(null);
                  }}
                  className="text-[13px] font-semibold text-[#16236E] hover:underline"
                >
                  Next sample question →
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF4E5]/70 border-l-[3px] border-[#FF8C1A] mb-3.5">
                <p className="text-[15px] font-semibold text-[#0D1321] leading-snug">
                  {currentDrill.question}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
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
                        'w-full flex items-start gap-3 p-3.5 rounded-xl border text-left text-[15px] font-medium transition-colors duration-150',
                        !answered && 'bg-white border-[#E2E6EE] text-[#0D1321] hover:border-[#16236E] hover:bg-[#F7F8FA]',
                        answered && isCorrect && 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold',
                        answered && !isCorrect && isChosen && 'bg-red-50 border-red-500 text-red-950',
                        answered && !isCorrect && !isChosen && 'bg-[#F7F8FA] border-[#E2E6EE] text-[#526074]'
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center text-[13px] font-bold flex-shrink-0 mt-0.5 tabular-nums',
                          !answered && 'bg-[#F1F3F7] text-[#16236E]',
                          answered && isCorrect && 'bg-emerald-600 text-white',
                          answered && !isCorrect && isChosen && 'bg-red-600 text-white',
                          answered && !isCorrect && !isChosen && 'bg-[#E2E6EE] text-[#526074]'
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {pickedOpt !== null && (
                <div
                  className={cn(
                    'mt-3.5 p-4 rounded-xl border-l-[3px] text-[15px] leading-relaxed',
                    pickedOpt === currentDrill.correct
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-[#FFF4E5] border-[#FF8C1A] text-[#0D1321]'
                  )}
                >
                  <strong className="font-semibold">
                    {pickedOpt === currentDrill.correct ? 'Correct: ' : 'Key distinction: '}
                  </strong>
                  {currentDrill.explanation}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EE] text-[13px]">
              {pickedOpt !== null ? (
                <button
                  type="button"
                  onClick={() => setPickedOpt(null)}
                  className="font-medium text-[#526074] hover:text-[#0D1321] transition-colors duration-150"
                >
                  Reset answer
                </button>
              ) : (
                <span className="text-[#526074]">Select A–D for instant feedback</span>
              )}
              <Link to="/app/" className="font-semibold text-[#16236E] hover:underline">
                Open Vignette Drill →
              </Link>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: DECODER ==================== */}
        {activeTab === 'decoder' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <label htmlFor="hero-decoder-box" className="text-[13px] font-semibold text-[#0D1321]">
                  Paste or edit stem clues
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'PSGN', text: 'Cola-colored urine 2 weeks after sore throat, RBC casts, low serum C3' },
                    { label: 'APL', text: 'Oozing IV sites, promyelocytes with Auer rod bundles, t(15;17)' },
                    { label: 'Wilson', text: 'Young adult tremor, elevated AST/ALT, low ceruloplasmin, Kayser-Fleischer rings' },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setDecoderText(sample.text)}
                      className="px-2.5 py-1 rounded-lg text-[13px] font-semibold bg-[#F1F3F7] text-[#0D1321] hover:bg-[#FFF4E5] hover:text-[#C2550A] transition-colors duration-150"
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
                className="w-full p-3.5 rounded-xl border border-[#CBD2DF] bg-[#F7F8FA] text-[15px] text-[#0D1321] focus:outline-none focus:ring-2 focus:ring-[#16236E] resize-none leading-relaxed"
              />

              <div className="mt-3.5 space-y-2">
                {decoded.noMatch ? (
                  <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E2E6EE] text-[15px] text-[#526074] text-center">
                    No confident match yet. Try &ldquo;Auer rods&rdquo; or &ldquo;Kayser-Fleischer&rdquo;.
                  </div>
                ) : (
                  decoded.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'p-3.5 rounded-xl border flex items-center justify-between gap-3',
                        idx === 0
                          ? 'bg-[#FFF4E5]/80 border-[#FFD29D]'
                          : 'bg-white border-[#E2E6EE]'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-[#0D1321] truncate">
                          {m.diagnosis}
                        </div>
                        <div className="text-[13px] text-[#526074] leading-snug mt-0.5">
                          {m.detail}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-[13px] font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0',
                          m.confidence === 'top'
                            ? 'bg-orange-DEFAULT text-navy-950'
                            : 'bg-[#F1F3F7] text-[#526074]'
                        )}
                      >
                        {m.confidence === 'top' ? 'Top match' : 'Look-alike'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E2E6EE] text-[13px] text-[#526074]">
              <span className="inline-flex items-center gap-1.5">
                <IconShield size={14} className="text-emerald-700" />
                <span>Runs locally in your browser. Text is never sent or saved.</span>
              </span>
              <Link to="/app/" className="font-semibold text-[#16236E] whitespace-nowrap hover:underline">
                Full Decoder →
              </Link>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: 5-STEP ==================== */}
        {activeTab === 'steps' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[13px] font-semibold text-[#16236E]">
                  Endocrine · Thyroid Axis 5-Step Tree
                </span>
                <span className="text-[13px] font-medium text-[#526074] tabular-nums">
                  8 core systems in app
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-3.5">
                {['1 Axis', '2 Level', '3 Site', '4 Loop', '5 Hooks'].map((lbl, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFwStep(n)}
                      className={cn(
                        'py-2 px-1 rounded-lg text-[13px] font-semibold border transition-colors duration-150 text-center tabular-nums',
                        fwStep === n
                          ? 'bg-[#16236E] text-white border-[#16236E]'
                          : 'bg-[#F7F8FA] text-[#526074] border-[#E2E6EE] hover:text-[#0D1321] hover:border-[#CBD2DF]'
                      )}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F1F3F7] text-[15px] font-semibold text-[#0D1321] mb-3.5">
                Step {fwStep}: {endoFw.steps[fwStep - 1]}
              </div>

              <div className="grid sm:grid-cols-3 gap-2.5">
                {endoFw.branches.map((br) => (
                  <div
                    key={br.badge}
                    className={cn(
                      'p-3.5 rounded-xl border-l-[3px]',
                      br.tone === 'amber' && 'bg-[#FFF4E5]/70 border-[#FF8C1A]',
                      br.tone === 'teal' && 'bg-emerald-50/70 border-emerald-600',
                      br.tone === 'navy' && 'bg-[#F1F3F7] border-[#16236E]'
                    )}
                  >
                    <div className="text-[13px] font-semibold text-[#526074] mb-1">
                      {br.badge}
                    </div>
                    <div className="text-[15px] font-bold text-[#0D1321] mb-1 leading-snug">
                      {br.title}
                    </div>
                    <p className="text-[13px] text-[#526074] leading-snug">{br.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EE] text-[13px]">
              <span className="text-[#526074]">Included free in the app</span>
              <Link to="/app/" className="font-semibold text-[#16236E] hover:underline">
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
// 2. PROOF / NUMBERS STRIP (Clean Typographic Metrics)
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
    <section className="py-12 border-y border-white/10 bg-[#080D1A]" aria-label="Rapid Steps in numbers">
      <div className="container-tight">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-white/10">
          {STATS.map((s) => (
            <div key={s.label} className="rv py-4 px-2 sm:px-6 lg:first:pl-0 lg:last:pr-0 text-center lg:text-left">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight tabular-nums mb-1">
                {s.value}
              </div>
              <div className="text-[15px] font-semibold text-orange-DEFAULT mb-0.5">{s.label}</div>
              <div className="text-[13px] text-slate-400">{s.sub}</div>
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
    <section className="section-pad bg-[#0E1629] border-b border-white/10" id="cardio-spotlight">
      <div className="container-tight">
        <div className="rv flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-white mb-3">
              All 16 USMLE Step 1 Organ Systems Integrated
            </h2>
            <p className="text-slate-300 text-[15px] leading-relaxed">
              Explore <strong className="text-white">{ATLAS_MANIFEST.totals.chapters} structured chapters</strong> and{' '}
              <strong className="text-white tabular-nums">{ATLAS_MANIFEST.totals.topics.toLocaleString()} topics</strong> across every organ system, combining comprehensive notes,{' '}
              <strong className="text-white tabular-nums">{ATLAS_MANIFEST.totals.images.toLocaleString()} clinical figures</strong>,{' '}
              <strong className="text-white tabular-nums">{ATLAS_MANIFEST.totals.tables} comparison tables</strong>,{' '}
              <strong className="text-white tabular-nums">{ATLAS_MANIFEST.totals.videos} clinical videos</strong>,{' '}
              <strong className="text-white tabular-nums">{ATLAS_MANIFEST.totals.hyBullets.toLocaleString()} high-yield pearls</strong>, and{' '}
              <strong className="text-white tabular-nums">{ATLAS_MANIFEST.totals.rapidFireQAs.toLocaleString()} vignettes, MCQs &amp; arrow drills</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-shrink-0">
            <Link
              to="/app/?tab=atlas"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-DEFAULT text-navy-950 font-semibold text-[15px] hover:bg-orange-hover transition-colors duration-150"
            >
              Open Fullscreen Atlas Hub →
            </Link>
            <Link
              to="/app/"
              className="text-[15px] font-semibold text-slate-200 hover:text-white transition-colors duration-150"
            >
              Browse Learn Tree
            </Link>
          </div>
        </div>

        {/* Hairline Grid of all 16 Systems */}
        <div className="rv grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
          {ATLAS_MANIFEST.systems.map((sys) => (
            <Link
              key={sys.systemId}
              to={`/app/?system=${sys.systemId}`}
              className="p-4 bg-[#080D1A] hover:bg-[#131E36] transition-colors duration-150 group flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#131E36] text-orange-DEFAULT flex items-center justify-center shrink-0 group-hover:bg-orange-DEFAULT group-hover:text-navy-950 transition-colors duration-150">
                <SystemIcon systemId={sys.systemId} size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] text-white group-hover:text-orange-DEFAULT transition-colors duration-150 truncate">
                  {sys.title}
                </div>
                <p className="text-[13px] text-slate-400 mt-0.5 tabular-nums">
                  {sys.stats.topics} topics · {sys.stats.totalImages} figs · {sys.stats.rapidFireQAs} Q&amp;As
                </p>
              </div>
            </Link>
          ))}
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
      label: 'Spot the clue',
      value: 'Cola-colored urine 2–3 wks post-strep',
      desc: 'Start with the exact trigger phrase, histology hook, or lab pattern the exam stem hides in sentence three.',
      color: '#FF8C1A',
    },
    {
      num: 2,
      label: 'Identify the syndrome',
      value: 'Acute Nephritic Syndrome',
      desc: 'Anchor the clue inside its clinical bucket (hematuria, RBC casts, hypertension, oliguria) before guessing diseases.',
      color: '#6366F1',
    },
    {
      num: 3,
      label: 'Name the diagnosis',
      value: 'Poststreptococcal GN (PSGN)',
      desc: 'Separate the winner from look-alike distractors using latency and complement (2–3 wks + low C3 vs. IgA 1–5 days + normal C3).',
      color: '#10B981',
    },
    {
      num: 4,
      label: 'Understand why & lock the trap',
      value: 'Type III immune complexes · Subepithelial humps',
      desc: 'Cement the mechanism and NBME-style second-order question so you never miss either diagnosis or pathophysiology.',
      color: '#38BDF8',
    },
  ];

  return (
    <section id="how" className="section-pad bg-[#080D1A]">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto mb-12 rv">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-white mb-4">
            Four cognitive beats from stem clue to diagnosis
          </h2>
          <p className="text-slate-300 text-[15px] leading-relaxed">
            Textbooks organize medicine from disease → symptoms. Exam stems test you in reverse: from clue → syndrome → diagnosis → mechanism.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          <div className="divide-y divide-white/10 border-y border-white/10">
            {PATH_STEPS.map((s, i) => {
              const active = step === i;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    'w-full text-left flex gap-4 py-5 px-4 transition-colors duration-150',
                    active ? 'bg-[#131E36]' : 'hover:bg-white/[0.03]'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px] tabular-nums mt-0.5',
                      active ? 'bg-orange-DEFAULT text-navy-950' : 'bg-white/10 text-slate-300'
                    )}
                  >
                    {s.num}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-orange-DEFAULT mb-1">
                      {s.label}
                    </div>
                    <div className="font-bold font-display text-white text-[17px] mb-1">
                      {s.value}
                    </div>
                    <p className="text-[15px] text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            <PathMapSVG step={step} steps={PATH_STEPS} onSelectStep={setStep} />
            <div className="border-l-[3px] border-orange-DEFAULT pl-4 py-1 text-[15px] text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Case flow vs. 5-step frameworks:</strong> Every one of the{' '}
              {ATLAS_MANIFEST.totals.topics.toLocaleString()} atlas cases follows this 4-beat path. Separately, our{' '}
              <span className="text-orange-DEFAULT font-semibold">5-Step Diagnostic Frameworks</span> give you top-down system algorithms (Endocrine, Renal, Acid-Base/Resp, Heme) when a vignette has no obvious buzzword.
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
    <div className="bg-[#0E1629] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3 text-[13px] font-medium text-slate-400">
        <span>Cognitive pathway</span>
        <span className="text-orange-DEFAULT">Select a node</span>
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
            strokeWidth="2"
            strokeDasharray="4 4"
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
                rx="12"
                fill={isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'}
                stroke={isSelected ? s.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={isSelected ? 1.8 : 1}
              />
              <circle cx="56" cy={y + 3} r="15" fill={s.color} />
              <text
                x="56"
                y={y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#080D1A"
                fontSize="12"
                fontWeight="800"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {i + 1}
              </text>
              <text
                x="84"
                y={y - 4}
                fill="rgba(255,255,255,0.68)"
                fontSize="11"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                {s.label}
              </text>
              <text
                x="84"
                y={y + 14}
                fill="#FFFFFF"
                fontSize="12.5"
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
    <section className="section-pad bg-[#F7F8FA] dark:bg-[#080D1A] border-t border-[#E2E6EE] dark:border-white/10" id="features">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto mb-12 rv">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-[#0D1321] dark:text-white mb-4">
            Built to teach active differentiation
          </h2>
          <p className="text-[#526074] dark:text-slate-400 text-[15px] leading-relaxed">
            Try every engine live below: click map nodes, walk a 5-step decision tree, answer a vignette drill, or paste your own stem clues.
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
        'relative overflow-hidden rounded-2xl border border-[#E2E6EE] dark:border-white/10',
        'bg-white dark:bg-[#0E1629]',
        'transition-colors duration-150 rv',
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
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT mb-2">
            Interactive atlas map
          </div>
          <h3 className="text-xl sm:text-[1.35rem] font-bold font-display text-[#0D1321] dark:text-white mb-2">
            See an entire organ system on one zoomable map
          </h3>
          <p className="text-[#526074] dark:text-slate-400 text-[15px] leading-relaxed mb-5">
            Zoom from organ system → syndrome → stem buzzword → definitive diagnosis. Click any disease node below to inspect how look-alikes split.
          </p>

          <div className="bg-[#F1F3F7] dark:bg-[#131E36] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2 text-[13px]">
              <span className="font-semibold text-[#526074] dark:text-slate-300">
                Renal · Glomerular split
              </span>
              <span className="font-semibold text-[#C2550A] dark:text-orange-DEFAULT">
                Select a diagnosis node
              </span>
            </div>

            <BentoAtlasSVG selected={selectedNode} onSelect={setSelectedNode} />
          </div>
        </div>

        {/* Selected Node Live Inspector */}
        <div className="mt-4 pt-4 border-t border-[#E2E6EE] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-[#0D1321] dark:text-white">
              {activeCase.diagnosis}{' '}
              <span className="text-[#C2550A] dark:text-orange-DEFAULT font-semibold">· {activeCase.buzzword}</span>
            </div>
            <div className="text-[13px] text-[#526074] dark:text-slate-400 mt-0.5">
              {activeCase.labSignature}
            </div>
          </div>
          <Link
            to={`/app/#${activeCase.id}`}
            className="text-[13px] font-semibold px-4 py-2 rounded-full bg-[#16236E] text-white hover:bg-[#0F1854] whitespace-nowrap transition-colors duration-150 text-center"
          >
            Open case →
          </Link>
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
    { id: 'renal', x: 180, y: 12, w: 150, label: 'Renal & Urinary', fill: '#16236E', stroke: '#0F1854', textFill: '#FFFFFF' },
    { id: 'nephritic', x: 75, y: 74, w: 145, label: 'Nephritic (RBC casts)', fill: '#EEF2FF', stroke: '#4F6EF7', textFill: '#16236E' },
    { id: 'nephrotic', x: 315, y: 74, w: 155, label: 'Nephrotic (>3.5g/d)', fill: '#FFF1F2', stroke: '#E11D48', textFill: '#881337' },
    { id: 'cola', x: 16, y: 138, w: 130, label: 'Low C3 · Humps', fill: '#FFF4E5', stroke: '#FF8C1A', textFill: '#0D1321' },
    { id: 'linear', x: 162, y: 138, w: 130, label: 'Linear IgG + Lung', fill: '#FFFFFF', stroke: '#64748B', textFill: '#0D1321' },
    { id: 'footproc', x: 325, y: 138, w: 135, label: 'Normal LM · Child', fill: '#FFFFFF', stroke: '#64748B', textFill: '#0D1321' },
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
            strokeWidth="1.6"
          />
        );
      })}

      {staticNodes.map((node) => (
        <g key={node.id}>
          <rect x={node.x} y={node.y} width={node.w} height={34} rx="8" fill={node.fill} stroke={node.stroke} strokeWidth="1.25" />
          <text x={node.x + node.w / 2} y={node.y + 21} textAnchor="middle" fill={node.textFill} fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight="600">
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
              rx="9"
              fill={isSel ? '#FF8C1A' : '#16236E'}
              stroke={isSel ? '#C2550A' : '#0F1854'}
              strokeWidth="1.5"
            />
            <text
              x={node.x + node.w / 2}
              y={node.y + 22}
              textAnchor="middle"
              fill={isSel ? '#080D1A' : '#FFFFFF'}
              fontSize="12"
              fontFamily="Inter, sans-serif"
              fontWeight="700"
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
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[#16236E] dark:text-blue-300 mb-2">
            5-step frameworks
          </div>
          <h3 className="text-xl sm:text-[1.35rem] font-bold font-display text-[#0D1321] dark:text-white mb-2">
            Repeatable algorithms across 8 systems
          </h3>
          <p className="text-[#526074] dark:text-slate-400 text-[15px] leading-relaxed mb-4">
            When a stem lacks a classic buzzword, work top-down through 5 structured clinical checkpoints.
          </p>

          {/* System switcher */}
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
                  'px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors duration-150',
                  fwIdx === idx
                    ? 'bg-orange-DEFAULT text-navy-950 border-orange-DEFAULT'
                    : 'bg-[#F7F8FA] dark:bg-white/5 text-[#526074] dark:text-slate-300 border-[#E2E6EE] dark:border-white/10 hover:text-[#0D1321] dark:hover:text-white'
                )}
              >
                {item.system.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* 5 Steps */}
          <div className="divide-y divide-[#E2E6EE] dark:divide-white/10 border-y border-[#E2E6EE] dark:border-white/10">
            {fw.steps.map((title, idx) => {
              const n = idx + 1;
              const isAct = active === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setActive(n)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-[15px] font-medium text-left transition-colors duration-150',
                    isAct
                      ? 'bg-[#16236E] text-white font-semibold'
                      : 'text-[#0D1321] dark:text-slate-200 hover:bg-[#F7F8FA] dark:hover:bg-white/5'
                  )}
                >
                  <span
                    className={cn(
                      'w-6 h-6 flex items-center justify-center rounded-md text-[13px] font-bold flex-shrink-0 tabular-nums',
                      isAct ? 'bg-orange-DEFAULT text-navy-950' : 'bg-[#F1F3F7] dark:bg-white/10 text-[#526074] dark:text-slate-300'
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

        <div className="mt-4 pt-3 flex items-center justify-between text-[13px]">
          <span className="text-[#526074] dark:text-slate-400">Free on all plans</span>
          <Link to="/app/" className="font-semibold text-[#16236E] dark:text-orange-DEFAULT hover:underline">
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
      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
              Vignette drill
            </div>
            <h3 className="text-xl font-bold font-display text-[#0D1321] dark:text-white">
              Practice the exact way NBME stems test
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setQIdx((i) => (i + 1) % DRILL_SAMPLES.length);
              setSelected(null);
            }}
            className="text-[13px] font-semibold text-[#16236E] dark:text-orange-DEFAULT px-3 py-1.5 rounded-lg bg-[#F1F3F7] dark:bg-white/10 hover:bg-[#E2E6EE] dark:hover:bg-white/15 transition-colors duration-150 whitespace-nowrap tabular-nums"
          >
            Switch stem ({qIdx + 1}/{DRILL_SAMPLES.length})
          </button>
        </div>

        <div className="bg-[#F7F8FA] dark:bg-[#131E36] border-l-[3px] border-[#16236E] dark:border-orange-DEFAULT rounded-r-xl px-4 py-3.5 mb-4">
          <p className="text-[15px] text-[#0D1321] dark:text-slate-200 leading-relaxed text-vignette">
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
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-[15px] font-medium text-left transition-colors duration-150',
                  !revealed && 'border-[#E2E6EE] dark:border-white/10 text-[#0D1321] dark:text-slate-200 hover:border-[#16236E] dark:hover:border-orange-DEFAULT',
                  revealed && isCorrect && 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-950 dark:text-emerald-200 font-semibold',
                  revealed && !isCorrect && isPicked && 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200',
                  revealed && !isCorrect && !isPicked && 'opacity-55 border-[#E2E6EE] dark:border-white/5 text-[#526074]'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-[13px] font-bold flex-shrink-0 tabular-nums',
                    revealed && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : revealed && isPicked
                      ? 'bg-red-600 text-white'
                      : 'bg-[#F1F3F7] dark:bg-white/10 text-[#526074] dark:text-slate-300'
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
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border-l-[3px] border-emerald-600 rounded-r-xl text-[15px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
            <strong>Reasoning:</strong> {q.explain}
            <Link to={`/app/#${q.caseId}`} className="block mt-2 text-[13px] text-emerald-800 dark:text-emerald-400 font-semibold hover:underline">
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
      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        <div className="text-[13px] font-semibold text-[#16236E] dark:text-blue-300 mb-1.5">
          Browser-local stem decoder
        </div>
        <h3 className="text-xl font-bold font-display text-[#0D1321] dark:text-white mb-1.5">
          Paste a clinical stem. See the top match &amp; traps.
        </h3>
        <p className="text-[#526074] dark:text-slate-400 text-[15px] mb-4 leading-relaxed">
          Honest match confidence, never guessing when clues are insufficient. Runs 100% in your browser.
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
            className="w-full px-4 py-3 text-[15px] border border-[#CBD2DF] dark:border-white/15 rounded-xl bg-[#F7F8FA] dark:bg-[#131E36] text-[#0D1321] dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#16236E] dark:focus:ring-orange-DEFAULT leading-relaxed"
          />
        </div>

        {/* Sample stems */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {DECODER_STEMS.slice(0, 5).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setInputVal(s.text)}
              className="text-[13px] font-medium px-3 py-1 rounded-lg bg-[#F1F3F7] dark:bg-white/10 text-[#0D1321] dark:text-slate-200 hover:bg-[#FFF4E5] hover:text-[#C2550A] dark:hover:bg-orange-DEFAULT/20 dark:hover:text-orange-DEFAULT transition-colors duration-150"
            >
              {s.label}
            </button>
          ))}
        </div>

        {detectedClues.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[13px]">
            <span className="font-semibold text-[#526074] dark:text-slate-400">Detected clues:</span>
            {detectedClues.slice(0, 4).map((cl) => (
              <span key={cl} className="px-2 py-0.5 rounded bg-[#FFF4E5] text-[#C2550A] font-medium">
                {cl}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-2">
          {noMatch ? (
            <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E2E6EE] dark:border-white/10 text-[15px] text-[#526074] dark:text-slate-300 text-center">
              No confident match. Try a sample stem above or type a classic Step 1 trigger phrase (e.g. &ldquo;Maltese cross&rdquo;, &ldquo;Linear IgG&rdquo;, &ldquo;Valsalva&rdquo;).
            </div>
          ) : (
            matches.map((r, i) => (
              <div
                key={r.diagnosis}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl border transition-colors duration-150 gap-3',
                  i === 0
                    ? 'bg-[#FFF4E5]/70 dark:bg-orange-DEFAULT/15 border-[#FFD29D] dark:border-orange-DEFAULT/40'
                    : 'bg-white dark:bg-[#131E36] border-[#E2E6EE] dark:border-white/10'
                )}
              >
                <div className="min-w-0">
                  <div className={cn('text-[15px] font-bold', i === 0 ? 'text-[#16236E] dark:text-orange-DEFAULT' : 'text-[#0D1321] dark:text-slate-200')}>
                    {r.diagnosis}
                  </div>
                  <div className="text-[13px] text-[#526074] dark:text-slate-400 mt-0.5 leading-snug">
                    {r.system} · {r.detail}
                  </div>
                </div>
                <Link
                  to={`/app/#${r.caseId}`}
                  className={cn(
                    'text-[13px] font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-colors duration-150',
                    r.confidence === 'top'
                      ? 'bg-orange-DEFAULT text-navy-950 hover:bg-orange-hover'
                      : 'bg-[#F1F3F7] dark:bg-white/10 text-[#526074] dark:text-slate-300'
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
// 5. YOUR STUDY STACK COMPARISON
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
    <section id="stack" className="section-pad bg-white dark:bg-[#0E1629] border-t border-[#E2E6EE] dark:border-white/10">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto mb-12 rv">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-[#0D1321] dark:text-white mb-4">
            A companion to your Q-bank, not a replacement
          </h2>
          <p className="text-[#526074] dark:text-slate-400 text-[15px] leading-relaxed">
            Students miss Step 1 questions when two syndromes blur together. Rapid Steps builds the visual map between First Aid reading and UWorld blocks.
          </p>
        </div>

        <div className="rv overflow-x-auto rounded-2xl border border-[#E2E6EE] dark:border-white/10 bg-white dark:bg-[#080D1A]">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E2E6EE] dark:border-white/10 bg-[#F7F8FA] dark:bg-[#131E36] text-[13px] font-semibold text-[#526074] dark:text-slate-300">
                <th className="py-3.5 px-6">Resource</th>
                <th className="py-3.5 px-6">Primary job</th>
                <th className="py-3.5 px-6">Cognitive direction</th>
                <th className="py-3.5 px-6">Best moment to use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EE] dark:divide-white/10 text-[15px]">
              {ROWS.map((r) => (
                <tr
                  key={r.tool}
                  className={cn(
                    r.highlight
                      ? 'bg-[#FFF4E5]/65 dark:bg-orange-DEFAULT/10'
                      : 'hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]'
                  )}
                >
                  <td className="py-4 px-6 font-bold text-[#16236E] dark:text-white whitespace-nowrap">
                    {r.tool}
                  </td>
                  <td className="py-4 px-6 text-[#0D1321] dark:text-slate-200 font-medium">{r.role}</td>
                  <td className="py-4 px-6 text-[#526074] dark:text-slate-300 text-[15px]">{r.direction}</td>
                  <td className="py-4 px-6 text-[#526074] dark:text-slate-300">{r.when}</td>
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
    'Instant access: no credit card, no account required',
  ];
  const paidFeatures = [
    'All 1,079 cases across all 16 USMLE Step 1 organ systems',
    'Every look-alike exam trap & NBME-style check question',
    'All ~2,289 high-yield pathology, lab & mechanism pearls',
    'Restore your paid plan on any phone, tablet, or laptop via 6-digit email code',
    'Prepaid one-time access: zero recurring billing or surprise renewals',
  ];

  return (
    <section className="section-pad bg-[#F7F8FA] dark:bg-[#080D1A] border-t border-[#E2E6EE] dark:border-white/10">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto mb-12 rv">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-[#0D1321] dark:text-white mb-4">
            Start free. Unlock the full atlas when it clicks.
          </h2>
          <p className="text-[#526074] dark:text-slate-400 text-[15px] leading-relaxed">
            Test the method across all 16 organ systems before spending a dollar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="rv rounded-2xl border border-[#E2E6EE] dark:border-white/10 p-7 sm:p-8 bg-white dark:bg-[#0E1629] flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-extrabold font-display text-[#0D1321] dark:text-white mb-1">
                Free Explorer
              </h3>
              <div className="text-[#526074] dark:text-slate-400 text-[13px] font-medium mb-6">
                $0 forever · No account or card needed
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] text-[#0D1321] dark:text-slate-200 leading-relaxed">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16236E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1 dark:stroke-blue-300">
                      <path d="M20 6 9 17 4 12" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/app/"
              className="block w-full text-center py-3 rounded-full border border-[#CBD2DF] dark:border-white/25 text-[#16236E] dark:text-white font-semibold text-[15px] hover:bg-[#16236E] hover:text-white hover:border-[#16236E] dark:hover:bg-white/10 transition-colors duration-150"
            >
              Explore 48 free cases →
            </Link>
          </div>

          <div className="rv rounded-2xl border-2 border-orange-DEFAULT bg-white dark:bg-[#0E1629] p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-2xl font-extrabold font-display text-[#0D1321] dark:text-white">
                  Full Atlas Access
                </h3>
                <span className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT">
                  Full catalog
                </span>
              </div>
              <div className="text-[#526074] dark:text-slate-400 text-[13px] font-medium mb-6 tabular-nums">
                From $6.58/mo equiv. · Prepaid · 14-day refund
              </div>
              <ul className="space-y-3 mb-8">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] text-[#0D1321] dark:text-slate-200 leading-relaxed">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2550A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1 dark:stroke-orange-DEFAULT">
                      <path d="M20 6 9 17 4 12" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="#pricing"
              className="block w-full text-center py-3 rounded-full bg-orange-DEFAULT text-navy-950 font-semibold text-[15px] hover:bg-orange-hover transition-colors duration-150"
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
// 7. PRICING
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
    badge: 'Most popular',
  },
  {
    id: 'plan12mo',
    label: '12 Months',
    price: 79,
    perMonth: '$6.58 / mo',
    savings: 'Save ~65%',
    duration: '365 days access',
    tagline: 'Lowest monthly cost, built for M2 organ blocks through Step 1.',
    featured: false,
    badge: 'Lowest monthly cost',
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
    <section id="pricing" className="section-pad bg-[#F1F3F7] dark:bg-[#080D1A] border-t border-[#E2E6EE] dark:border-white/10">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto mb-10 rv">
          <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-[#0D1321] dark:text-white mb-4">
            One-time payment. Never a subscription.
          </h2>
          <p className="text-[#526074] dark:text-slate-400 text-[15px] leading-relaxed mb-4">
            Pay once for the runway you need. Paddle (our merchant of record) shows any local VAT/tax clearly before you pay.
          </p>
          <p className="text-[13px] font-medium text-[#16236E] dark:text-slate-300">
            When your prepaid period ends, paid cases lock again and your 48 free cases stay free. Zero auto-renewals.
          </p>
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
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-lg font-bold font-display text-[#0D1321] dark:text-white">
                    {plan.label}
                  </span>
                  {plan.badge && (
                    <span className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-extrabold text-[#16236E] dark:text-white font-display tracking-tight tabular-nums">
                    ${plan.price}
                  </span>
                  <span className="text-[#526074] dark:text-slate-400 text-[13px] font-medium">
                    USD total
                  </span>
                </div>

                <div className="text-[13px] font-semibold text-[#C2550A] dark:text-orange-DEFAULT mb-3 tabular-nums">
                  {plan.perMonth} · {plan.duration}
                  {plan.savings ? ` · ${plan.savings}` : ''}
                </div>

                <p className="text-[15px] text-[#526074] dark:text-slate-300 mb-6 leading-relaxed">
                  {plan.tagline}
                </p>

                <ul className="space-y-2.5 mb-8 border-t border-[#E2E6EE] dark:border-white/10 pt-5">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px] text-[#0D1321] dark:text-slate-200 leading-relaxed">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={plan.featured ? '#C2550A' : '#16236E'}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 mt-1 dark:stroke-orange-DEFAULT"
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
                  'block w-full text-center py-3 rounded-full font-semibold text-[15px] transition-colors duration-150',
                  plan.featured
                    ? 'bg-orange-DEFAULT text-navy-950 hover:bg-orange-hover'
                    : 'bg-[#16236E] text-white hover:bg-[#0F1854]'
                )}
              >
                Unlock {plan.label.toLowerCase()} · ${plan.price}
              </Link>
            </div>
          ))}
        </div>

        <div className="rv max-w-3xl mx-auto text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-[#526074] dark:text-slate-300">
            <span className="font-medium">Student discount codes (click to copy for checkout):</span>
            {[
              { code: 'STUDY10', desc: '10% off individual' },
              { code: 'GROUP15', desc: '15% off 3+ students' },
            ].map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => copyDiscount(d.code)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-[#0E1629] border border-[#CBD2DF] dark:border-white/15 font-semibold text-[#16236E] dark:text-orange-DEFAULT hover:border-orange-DEFAULT transition-colors duration-150 tabular-nums"
              >
                <span>{copiedCode === d.code ? 'Copied' : d.code}</span>
                <span className="font-normal text-[#526074] dark:text-slate-400">({d.desc})</span>
              </button>
            ))}
          </div>

          <p className="text-[15px] text-[#526074] dark:text-slate-400">
            <strong className="text-[#0D1321] dark:text-white">14-day no-questions-asked refund.</strong>{' '}
            <Link to="/refunds" className="text-[#16236E] dark:text-blue-300 font-semibold hover:underline">
              Read refund policy
            </Link>
          </p>

          <p className="text-[13px] text-[#526074] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Passwordless 6-Digit Login',
    body: 'No passwords to forget or leak. Sign in with a one-time code sent to your email.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    title: '14-Day Full Refund',
    body: 'Not clicking for how you study? Email us within 14 days for a full, no-questions refund.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    title: 'Zero Ad Trackers',
    body: 'No third-party ad pixels. Pasted Stem Decoder vignettes never leave your browser.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: 'What do I get for free?',
    a: 'The first 3 cases of every organ system (48 cases total across all 16 systems) are unlocked in full (vignette, mechanism, lab signature, look-alike trap, and check question) plus all 8 system 5-Step Diagnostic Frameworks, the interactive Atlas map, and the Stem Decoder on free cases. No account or card is required.',
  },
  {
    q: 'Is this a recurring subscription?',
    a: 'No. Every plan is a single prepaid payment: $19 (30 days), $50 (180 days), or $79 (365 days). Nothing ever auto-renews. When your prepaid period ends, paid cases simply lock again while the 48 free cases stay open.',
  },
  {
    q: 'Does my study progress sync across devices?',
    a: 'Your paid plan unlocks on any phone, tablet, or computer when you sign in with your email. However, your mastered checkmarks, bookmarks, and drill scores are stored locally in each device’s browser for speed and privacy, so progress checklists do not currently cloud-sync between devices.',
  },
  {
    q: 'Who built Rapid Steps?',
    a: 'Rapid Steps is independently authored and maintained by a medical student obsessed with visual differential diagnosis and Step 1 pattern recognition. Spotted a typo or want to suggest a high-yield trap? Email support@rapidsteps.tech directly.',
  },
  {
    q: 'Is my pasted text in the Stem Decoder private?',
    a: 'Yes, 100%. Stem matching runs locally inside your browser in JavaScript. Pasted vignettes or notes are never uploaded, logged, or saved on any server.',
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
    a: 'Yes. Request a full refund within 14 days of purchase, no questions asked. Just email support@rapidsteps.tech from your sign-in email or include your Paddle receipt.',
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
      <section className="section-pad bg-white dark:bg-[#0E1629] border-t border-[#E2E6EE] dark:border-white/10">
        <div className="container-tight">
          <div className="text-center mb-12 rv">
            <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-[#0D1321] dark:text-white">
              Simple, safe and fair
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#E2E6EE] dark:divide-white/10">
            {TRUST_ITEMS.map((t) => (
              <div key={t.title} className="rv py-5 sm:px-6 lg:first:pl-0 lg:last:pr-0">
                <div className="text-[#C2550A] dark:text-orange-DEFAULT mb-3">
                  {t.icon}
                </div>
                <h3 className="font-bold font-display text-[#0D1321] dark:text-white mb-1.5 text-[17px]">
                  {t.title}
                </h3>
                <p className="text-[15px] text-[#526074] dark:text-slate-400 leading-relaxed">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-pad bg-[#F7F8FA] dark:bg-[#080D1A] border-t border-[#E2E6EE] dark:border-white/10">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto mb-8 rv">
            <h2 className="text-3xl sm:text-[2.5rem] font-extrabold font-display tracking-[-0.025em] leading-[1.12] text-[#0D1321] dark:text-white mb-3">
              Questions, answered plainly
            </h2>
            <p className="text-[#526074] dark:text-slate-400 text-[15px]">
              Clear answers on free cases, prepaid billing, privacy, and how the atlas works.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="search"
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Filter questions (e.g., refund, offline, sync, subscription)…"
              aria-label="Filter FAQ questions"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#CBD2DF] dark:border-white/15 bg-white dark:bg-[#0E1629] text-[15px] text-[#0D1321] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16236E]"
            />
            <button
              type="button"
              onClick={() => setExpandAll((v) => !v)}
              className="px-4 py-2.5 rounded-xl border border-[#CBD2DF] dark:border-white/15 bg-white dark:bg-[#0E1629] text-[13px] font-semibold text-[#16236E] dark:text-slate-200 hover:border-[#16236E] transition-colors duration-150 whitespace-nowrap"
            >
              {expandAll ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          <div className="max-w-2xl mx-auto divide-y divide-[#E2E6EE] dark:divide-white/10 border-y border-[#E2E6EE] dark:border-white/10 bg-white dark:bg-[#0E1629] rounded-2xl overflow-hidden px-6">
            {visibleFaqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} forceOpen={expandAll} />
            ))}
            {visibleFaqs.length === 0 && (
              <p className="text-center text-[15px] text-[#526074] py-6">
                No matching FAQ found. Email{' '}
                <a href="mailto:support@rapidsteps.tech" className="text-[#16236E] dark:text-orange-DEFAULT font-semibold underline">
                  support@rapidsteps.tech
                </a>{' '}
                anytime.
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
      className="group rv"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none font-bold font-display text-[#0D1321] dark:text-white text-[16px]">
        <span>{q}</span>
        <span
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-[background-color,transform] duration-200 ease-standard',
            open
              ? 'bg-[#16236E] text-white rotate-45'
              : 'bg-[#F1F3F7] dark:bg-white/10 text-[#0D1321] dark:text-slate-200'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <div className="pb-5 text-[15px] text-[#526074] dark:text-slate-300 leading-relaxed">
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
      className="section-pad relative overflow-hidden border-t border-white/10"
      style={{
        background: 'linear-gradient(160deg, #080D1A 0%, #0E1629 45%, #0F1854 100%)',
      }}
    >
      <div className="container-tight relative z-10 text-center rv">
        <h2 className="text-3xl sm:text-[2.75rem] font-extrabold font-display tracking-[-0.025em] leading-[1.1] text-white mb-4">
          Ready to see how fast it clicks?
        </h2>
        <p className="text-slate-300 text-[16px] sm:text-[18px] leading-relaxed mb-8 max-w-xl mx-auto">
          Open the atlas right now and explore 48 full clinical cases across all 16 organ systems free, with no account required.
        </p>
        <Link
          to="/app/"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-semibold bg-orange-DEFAULT text-navy-950 rounded-full hover:bg-orange-hover transition-colors duration-150 min-h-[52px]"
        >
          <span>Explore 48 free cases</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

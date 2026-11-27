import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from '@/components/logo/Logo';
import ThemeToggle from '@/components/theme-toggle/ThemeToggle';
import LearnTree from './learn-tree';
import MapView from './map-view';
import CasePanel from './case-panel';
import Drill from './drill';
import SearchModal from './search';
import ShortcutsModal from './shortcuts-modal';

// ── Code-split heavy tabs (lazy-loaded on first visit) ──────────────
const Decoder    = React.lazy(() => import('./decoder'));
const Frameworks = React.lazy(() => import('./frameworks'));
const CardioHub  = React.lazy(() => import('./cardio-hub'));

// React Router strips the basename from useLocation().pathname, so history
// writes must re-add it — otherwise the address bar drops the sub-path on
// GitHub Pages and a refresh lands on a 404. '' at root, '/<repo>' on Pages.
const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function TabFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
        <div className="w-7 h-7 rounded-full border-2 border-current border-t-transparent animate-spin opacity-60" />
        <span className="text-xs font-semibold tracking-wide">Loading…</span>
      </div>
    </div>
  );
}
import { SignInModal, UnlockModal, MoreMenu, MistakeLogModal } from './account';
import { DEMO_CASES } from '@/lib/catalog';
import { ATLAS_MANIFEST, findTopicLocation, getManifestSystem } from '@/lib/atlas-data';
import {
  IconBookOpen,
  IconAtlas,
  IconMap,
  IconZap,
  IconScan,
  IconSteps,
  IconSliders,
  IconEye,
  IconEyeOff,
} from '@/components/icons/Icons';
import {
  getMasteredCases,
  toggleMastered,
  getBookmarks,
  toggleBookmark,
  getFlags,
  toggleFlag,
  getDueForReview,
  getStudySize,
  setStudySize,
  StudySize,
  getFocusMode,
  setFocusMode,
} from '@/lib/storage';
import { cn } from '@/lib/cn';

type ActiveTab = 'learn' | 'cardio' | 'map' | 'drill' | 'decoder' | 'master' | 'more';

function useToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((text: string) => {
    setMsg(text);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 1800);
  }, []);

  const Toast = visible ? (
    <div className={cn('rs-toast', visible && 'show')} role="status" aria-live="polite">
      {msg}
    </div>
  ) : null;

  return { show, Toast };
}

export default function AppShell() {
  const location = useLocation();
  const { show: showToast, Toast } = useToast();

  // Tab, System & Topic state
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');
  const [hubSystemId, setHubSystemId] = useState<string>('cardio');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('cardio-aortic-stenosis');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Study tool preferences
  const [activeRecall, setActiveRecall] = useState(() => {
    return localStorage.getItem('rapidsteps_recall_mode') === '1';
  });
  const [studySize, setStudySizeState] = useState<StudySize>(getStudySize);
  const [focusMode, setFocusModeState] = useState<boolean>(getFocusMode);

  // Storage-backed collections
  const [masteredCases, setMasteredCases] = useState<Set<string>>(getMasteredCases);
  const [bookmarks, setBookmarks] = useState<Set<string>>(getBookmarks);
  const [flags, setFlags] = useState<Set<string>>(getFlags);
  const [dueReviewList] = useState<string[]>(getDueForReview);

  // Modals
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMistakeLogOpen, setIsMistakeLogOpen] = useState(false);

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('rapidsteps_user_email');
  });

  // Handle URL Hash and Query Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sysParam = params.get('system');
    if (sysParam && getManifestSystem(sysParam)) {
      setHubSystemId(sysParam);
      setActiveTab('cardio');
      const firstT = getManifestSystem(sysParam)?.topics[0]?.id;
      if (firstT && !location.hash) setSelectedCaseId(firstT);
      params.delete('system');
    }
    if (params.get('tab') === 'cardio' || params.get('tab') === 'atlas') {
      setActiveTab('cardio');
      params.delete('tab');
    }
    if (params.get('signin') === '1') {
      setIsSignInOpen(true);
      params.delete('signin');
    }
    if (params.get('plans') === '1') {
      setIsUnlockOpen(true);
      params.delete('plans');
    }
    if (params.get('txn')) {
      alert('Payment received! Activation may take a minute. If your plan does not appear, email support@rapidsteps.tech with your receipt.');
      params.delete('txn');
    }
    window.history.replaceState(
      {},
      '',
      `${ROUTER_BASE}${location.pathname}${params.toString() ? '?' + params.toString() : ''}${location.hash}`
    );

    if (location.hash) {
      const caseId = location.hash.replace('#', '').trim();
      if (caseId) {
        setSelectedCaseId(caseId);
        const loc = findTopicLocation(caseId);
        if (loc) setHubSystemId(loc.systemId);
        setIsMobileSheetOpen(true);
      }
    }
  }, [location]);

  const handleToggleMaster = (id: string) => {
    toggleMastered(id);
    const updated = getMasteredCases();
    setMasteredCases(updated);
    showToast(updated.has(id) ? 'Marked as mastered' : 'Removed from mastered');
  };

  const handleToggleBookmark = (id: string) => {
    toggleBookmark(id);
    const updated = getBookmarks();
    setBookmarks(updated);
    showToast(updated.has(id) ? 'Bookmarked topic' : 'Bookmark removed');
  };

  const handleToggleFlag = (id: string) => {
    toggleFlag(id);
    const updated = getFlags();
    setFlags(updated);
    showToast(updated.has(id) ? 'Flagged for review' : 'Flag removed');
  };

  const openCaseIds = Object.keys(DEMO_CASES);
  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    const loc = findTopicLocation(id);
    if (loc) {
      setHubSystemId(loc.systemId);
    }
    if (activeTab === 'drill' || activeTab === 'decoder' || activeTab === 'master') {
      setActiveTab('learn');
    }
    setIsMobileSheetOpen(true);
    window.history.replaceState(null, '', `${ROUTER_BASE}/app/#${id}`);
  };

  const cycleCase = (dir: 1 | -1) => {
    const loc = findTopicLocation(selectedCaseId);
    if (loc) {
      const sysTopics = getManifestSystem(loc.systemId)?.topics || [];
      if (sysTopics.length > 0) {
        const idx = sysTopics.findIndex((t) => t.id === selectedCaseId);
        const nextIdx = idx === -1 ? 0 : (idx + dir + sysTopics.length) % sysTopics.length;
        handleSelectCase(sysTopics[nextIdx].id);
        return;
      }
    }
    const idx = selectedCaseId ? openCaseIds.indexOf(selectedCaseId) : 0;
    const nextIdx = idx === -1 ? 0 : (idx + dir + openCaseIds.length) % openCaseIds.length;
    handleSelectCase(openCaseIds[nextIdx]);
  };

  const handleToggleStudySize = () => {
    const nextSize = studySize === 'normal' ? 'large' : 'normal';
    setStudySize(nextSize);
    setStudySizeState(nextSize);
    showToast(nextSize === 'large' ? 'Large text mode' : 'Normal text mode');
  };

  const handleToggleActiveRecall = () => {
    const next = !activeRecall;
    setActiveRecall(next);
    localStorage.setItem('rapidsteps_recall_mode', next ? '1' : '0');
    showToast(next ? 'Active Recall ON' : 'Active Recall OFF');
  };

  const handleToggleFocusMode = useCallback(() => {
    setFocusModeState((prev) => {
      const next = !prev;
      setFocusMode(next);
      return next;
    });
  }, []);

  // Global Atlas Progress Stats across all 16 systems
  const totalAtlasTopics = ATLAS_MANIFEST.totals.topics;
  const masteredAtlasCount = ATLAS_MANIFEST.systems.reduce(
    (acc, sys) => acc + sys.topics.filter((t) => masteredCases.has(t.id)).length,
    0
  );
  const progressPercent = totalAtlasTopics > 0 ? Math.round((masteredAtlasCount / totalAtlasTopics) * 100) : 0;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      switch (e.key) {
        case '?':
          e.preventDefault();
          setIsShortcutsOpen((p) => !p);
          break;
        case '/':
          e.preventDefault();
          setIsSearchOpen(true);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFocusMode();
          break;
        case 'b':
        case 'B':
          if (selectedCaseId) {
            e.preventDefault();
            handleToggleBookmark(selectedCaseId);
          }
          break;
        case 'm':
        case 'M':
          if (selectedCaseId) {
            e.preventDefault();
            handleToggleMaster(selectedCaseId);
          }
          break;
        case 'x':
        case 'X':
          if (selectedCaseId) {
            e.preventDefault();
            handleToggleFlag(selectedCaseId);
          }
          break;
        case 'Escape':
          setIsShortcutsOpen(false);
          setIsSearchOpen(false);
          setIsSignInOpen(false);
          setIsUnlockOpen(false);
          setIsMoreOpen(false);
          setIsMistakeLogOpen(false);
          setIsMobileSheetOpen(false);
          if (focusMode) {
            setFocusMode(false);
            setFocusModeState(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCaseId, focusMode, handleToggleFocusMode]);

  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'Learn', icon: <IconBookOpen size={14} /> },
    { id: 'cardio', label: 'Atlas Hub', icon: <IconAtlas size={14} /> },
    { id: 'map', label: 'Map', icon: <IconMap size={14} /> },
    { id: 'drill', label: 'Drill', icon: <IconZap size={14} /> },
    { id: 'decoder', label: 'Decoder', icon: <IconScan size={14} /> },
    { id: 'master', label: '5-Step Master', icon: <IconSteps size={14} /> },
  ];

  return (
    <div
      className={cn(
        'w-screen h-screen overflow-hidden flex flex-col bg-[#F7F8FA] dark:bg-[#050814] text-[#0D1321] dark:text-[#F2F5FA] antialiased selection:bg-[#FEF08A] selection:text-[#854D0E]',
        studySize === 'large' && 'text-lg'
      )}
    >
      {/* Subtle Marine-to-Amber Top Hairline */}
      {!focusMode && (
        <div
          className="h-[2px] w-full flex-shrink-0 z-40"
          style={{
            background: 'linear-gradient(90deg, #16236E 0%, #2A3FB5 55%, #FF8C1A 100%)',
          }}
        />
      )}

      {/* ============================================================
          DESKTOP PRIMARY HEADER
          ============================================================ */}
      {!focusMode && (
        <header
          className="rs-dh rs-dh-main flex-shrink-0 h-14 border-b border-[#E2E6EE] dark:border-white/[0.08] bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl px-5 flex items-center justify-between z-30"
          role="navigation"
          aria-label="Primary"
        >
          {/* Left: Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-5">
            <a href={import.meta.env.BASE_URL} className="brand flex items-center gap-2 group" aria-label="Rapid Steps home">
              <Logo width={70} height={28} variant="default" />
            </a>

            <div className="hidden lg:block w-px h-5 bg-[#E2E6EE] dark:bg-white/10" />

            <nav className="rs-dh-nav hidden lg:flex items-center gap-1">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors duration-150 relative',
                    activeTab === tab.id
                      ? 'bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                      : 'text-[#475569] dark:text-slate-300 hover:bg-[#F1F3F7] dark:hover:bg-white/5 hover:text-[#0D1321] dark:hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Search, Recall, Progress, Focus, Theme, Account */}
          <div className="rs-dh-act flex items-center gap-2">
            {/* Quick Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="rs-dh-search hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#111B33] border border-[#E2E6EE] dark:border-white/[0.08] text-[13px] text-[#475569] dark:text-slate-300 hover:border-[#CBD2DF] dark:hover:border-white/20 transition-colors duration-150"
              aria-label="Search atlas"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-[#475569] dark:text-slate-400">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="hidden lg:inline">Search</span>
              <span className="rs-kbd">/</span>
            </button>

            {/* Active Recall */}
            <button
              onClick={handleToggleActiveRecall}
              className={cn(
                'rs-recall hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors duration-150',
                activeRecall
                  ? 'bg-[#FFF4E5] text-[#C2550A] dark:bg-orange-DEFAULT/15 dark:text-orange-DEFAULT border border-[#FFD29D] dark:border-orange-DEFAULT/30'
                  : 'text-[#475569] dark:text-slate-300 hover:bg-[#F1F3F7] dark:hover:bg-white/5 border border-transparent'
              )}
              title="Hide diagnoses until revealed"
            >
              {activeRecall ? <IconEye size={14} /> : <IconEyeOff size={14} />}
              <span>{activeRecall ? 'Recall on' : 'Recall'}</span>
            </button>

            {/* Compact Global Progress Indicator */}
            <div
              className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#111B33] border border-[#E2E6EE] dark:border-white/[0.08]"
              title={`${masteredAtlasCount} of ${totalAtlasTopics} Step 1 topics mastered`}
            >
              <div className="w-16 rs-progress-bar">
                <div
                  className={cn('rs-progress-fill', progressPercent === 100 && 'complete')}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[13px] font-semibold text-[#475569] dark:text-slate-300 tabular-nums">
                {masteredAtlasCount}/{totalAtlasTopics}
              </span>
            </div>

            {/* Focus Mode */}
            <button
              onClick={handleToggleFocusMode}
              className="hidden lg:flex p-1.5 rounded-lg text-[#475569] dark:text-slate-400 hover:text-[#0D1321] dark:hover:text-white hover:bg-[#F1F3F7] dark:hover:bg-white/10 transition-colors duration-150"
              title="Focus mode (F)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            </button>

            <ThemeToggle variant="adaptive" />

            {/* Account */}
            <button
              onClick={() => setIsMoreOpen(true)}
              className="flex items-center gap-1.5 p-1 pl-2.5 rounded-full border border-[#E2E6EE] dark:border-white/[0.08] text-[13px] font-semibold text-[#0D1321] dark:text-slate-200 hover:bg-[#F1F3F7] dark:hover:bg-white/5 transition-colors duration-150"
              aria-label="Account and menu"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#475569] dark:text-slate-400">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="w-6 h-6 rounded-full bg-[#16236E] text-white flex items-center justify-center text-[12px] font-semibold">
                {userEmail ? userEmail.slice(0, 1).toUpperCase() : 'U'}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Focus Mode banner */}
      {focusMode && (
        <div className="h-9 bg-[#050814] border-b border-white/10 px-5 flex items-center justify-between text-[13px] text-slate-300 z-30">
          <span className="font-medium">Focus mode</span>
          <button
            onClick={() => {
              setFocusMode(false);
              setFocusModeState(false);
            }}
            className="text-orange-DEFAULT hover:underline font-semibold flex items-center gap-1.5"
          >
            Exit <span className="rs-kbd">Esc</span>
          </button>
        </div>
      )}

      {/* ============================================================
          MAIN BODY LAYOUT
          ============================================================ */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
          {activeTab === 'learn' && (
            <LearnTree
              onSelectCase={handleSelectCase}
              selectedCaseId={selectedCaseId}
              masteredCases={masteredCases}
              bookmarks={bookmarks}
              flags={flags}
              dueForReview={dueReviewList}
              onOpenCardioHub={(sysId) => {
                if (sysId) {
                  setHubSystemId(sysId);
                  const first = getManifestSystem(sysId)?.topics[0]?.id;
                  if (first) setSelectedCaseId(first);
                }
                setActiveTab('cardio');
              }}
            />
          )}

          {activeTab === 'cardio' && (
            <Suspense fallback={<TabFallback />}>
              <CardioHub
                activeSystemId={hubSystemId}
                onSelectSystem={(sysId) => setHubSystemId(sysId)}
                selectedTopicId={selectedCaseId}
                onSelectTopic={(tid) => {
                  setSelectedCaseId(tid);
                  const loc = findTopicLocation(tid);
                  if (loc) setHubSystemId(loc.systemId);
                  window.history.replaceState(null, '', `${ROUTER_BASE}/app/#${tid}`);
                }}
                masteredCases={masteredCases}
                onToggleMaster={handleToggleMaster}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                activeRecall={activeRecall}
                onToggleActiveRecall={handleToggleActiveRecall}
              />
            </Suspense>
          )}

          {activeTab === 'map' && (
            <MapView
              onSelectCase={handleSelectCase}
              selectedCaseId={selectedCaseId}
              masteredCases={masteredCases}
            />
          )}

          {activeTab === 'drill' && (
            <Drill
              onOpenUnlock={() => setIsUnlockOpen(true)}
              onSelectCase={handleSelectCase}
            />
          )}

          {activeTab === 'decoder' && (
            <Suspense fallback={<TabFallback />}>
              <Decoder
                onSelectCase={handleSelectCase}
              />
            </Suspense>
          )}

          {activeTab === 'master' && (
            <Suspense fallback={<TabFallback />}>
              <Frameworks
                onSelectCase={handleSelectCase}
                onBack={() => setActiveTab('cardio')}
              />
            </Suspense>
          )}
        </div>

        {/* Right Pane (Desktop Case Panel Split-View) */}
        {(activeTab === 'learn' || activeTab === 'map') && (
          <div className="hidden md:block w-[520px] lg:w-[600px] h-full flex-shrink-0">
            <CasePanel
              caseId={selectedCaseId}
              onClose={() => setSelectedCaseId(null)}
              activeRecall={activeRecall}
              studySize={studySize}
              isMastered={selectedCaseId ? masteredCases.has(selectedCaseId) : false}
              onToggleMaster={handleToggleMaster}
              isBookmarked={selectedCaseId ? bookmarks.has(selectedCaseId) : false}
              onToggleBookmark={handleToggleBookmark}
              isFlagged={selectedCaseId ? flags.has(selectedCaseId) : false}
              onToggleFlag={handleToggleFlag}
              onNextCase={() => cycleCase(1)}
              onPrevCase={() => cycleCase(-1)}
              onOpenUnlock={() => setIsUnlockOpen(true)}
            />
          </div>
        )}
      </div>

      {/* ============================================================
          MOBILE BOTTOM SHEET
          ============================================================ */}
      <div
        className={cn(
          'rs-sheet lg:hidden',
          isMobileSheetOpen && selectedCaseId ? 'open' : ''
        )}
        style={{ height: '82vh' }}
      >
        <div
          className="rs-sheet-grab"
          onClick={() => setIsMobileSheetOpen(false)}
        />
        <div className="h-full overflow-hidden">
          <CasePanel
            caseId={selectedCaseId}
            onClose={() => setIsMobileSheetOpen(false)}
            activeRecall={activeRecall}
            studySize={studySize}
            isMastered={selectedCaseId ? masteredCases.has(selectedCaseId) : false}
            onToggleMaster={handleToggleMaster}
            isBookmarked={selectedCaseId ? bookmarks.has(selectedCaseId) : false}
            onToggleBookmark={handleToggleBookmark}
            isFlagged={selectedCaseId ? flags.has(selectedCaseId) : false}
            onToggleFlag={handleToggleFlag}
            onNextCase={() => cycleCase(1)}
            onPrevCase={() => cycleCase(-1)}
            onOpenUnlock={() => setIsUnlockOpen(true)}
          />
        </div>
      </div>

      {/* ============================================================
          MOBILE BOTTOM TAB BAR (100% VECTOR SVG ICONS)
          ============================================================ */}
      {!focusMode && (
        <nav
          className="rs-tabbar lg:hidden flex-shrink-0"
          role="navigation"
          aria-label="Main navigation"
        >
          {[
            { id: 'learn' as ActiveTab, icon: <IconBookOpen size={17} />, label: 'Learn' },
            { id: 'cardio' as ActiveTab, icon: <IconAtlas size={17} />, label: 'Atlas' },
            { id: 'map' as ActiveTab, icon: <IconMap size={17} />, label: 'Map' },
            { id: 'drill' as ActiveTab, icon: <IconZap size={17} />, label: 'Drill' },
            { id: 'decoder' as ActiveTab, icon: <IconScan size={17} />, label: 'Decoder' },
            { id: 'master' as ActiveTab, icon: <IconSteps size={17} />, label: '5-Step' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileSheetOpen(false);
              }}
              className={cn('rs-tab', activeTab === tab.id && 'active')}
              aria-label={tab.label}
            >
              <span className="tab-indicator" />
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}

          <button
            onClick={() => setIsMoreOpen(true)}
            className="rs-tab"
            aria-label="More"
          >
            <IconSliders size={17} />
            <span>More</span>
          </button>
        </nav>
      )}

      {/* ============================================================
          MODALS & OVERLAYS
          ============================================================ */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={handleSelectCase}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        userEmail={userEmail}
        onSignOut={() => {
          localStorage.removeItem('rapidsteps_user_email');
          setUserEmail(null);
        }}
        onSignedIn={(email) => {
          localStorage.setItem('rapidsteps_user_email', email);
          setUserEmail(email);
        }}
      />

      <UnlockModal
        isOpen={isUnlockOpen}
        onClose={() => setIsUnlockOpen(false)}
        userEmail={userEmail}
        onOpenSignIn={() => {
          setIsUnlockOpen(false);
          setIsSignInOpen(true);
        }}
      />

      <MistakeLogModal
        isOpen={isMistakeLogOpen}
        onClose={() => setIsMistakeLogOpen(false)}
      />

      <MoreMenu
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        userEmail={userEmail}
        activeRecall={activeRecall}
        onToggleActiveRecall={handleToggleActiveRecall}
        studySize={studySize}
        onToggleStudySize={handleToggleStudySize}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenUnlock={() => setIsUnlockOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenMistakeLog={() => setIsMistakeLogOpen(true)}
        masteredCount={masteredAtlasCount}
        totalCount={totalAtlasTopics}
      />

      {Toast}
    </div>
  );
}

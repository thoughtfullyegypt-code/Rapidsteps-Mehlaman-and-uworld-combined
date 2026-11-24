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
import LabValuesModal from './lab-values-modal';
import ProgressModal from './progress-modal';
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
  logReview,
  removeReview,
  getRecentTopics,
  recordRecentTopic,
  recordStudyActivity,
  getMistakes,
  getStudySize,
  setStudySize,
  StudySize,
  getFocusMode,
  setFocusMode,
} from '@/lib/storage';
import { cn } from '@/lib/cn';

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

type ActiveTab = 'learn' | 'cardio' | 'map' | 'drill' | 'decoder' | 'master' | 'more';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

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
  const isDesktop = useIsDesktop();
  const { show: showToast, Toast } = useToast();

  // Tab, System & Topic state
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');
  const [hubSystemId, setHubSystemId] = useState<string>('cardio');
  const [drillInitialSys, setDrillInitialSys] = useState<string | undefined>(undefined);
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
  const [dueReviewList, setDueReviewList] = useState<string[]>(getDueForReview);
  const [recentTopics, setRecentTopics] = useState<string[]>(getRecentTopics);
  const [mistakeCount, setMistakeCount] = useState<number>(
    () => getMistakes().filter((m) => !m.resolved).length
  );

  // Modals
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMistakeLogOpen, setIsMistakeLogOpen] = useState(false);
  const [isLabValuesOpen, setIsLabValuesOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('rapidsteps_user_email');
  });

  const refreshMistakeCount = useCallback(() => {
    setMistakeCount(getMistakes().filter((m) => !m.resolved).length);
  }, []);

  const refreshFromStorage = useCallback(() => {
    setMasteredCases(getMasteredCases());
    setBookmarks(getBookmarks());
    setFlags(getFlags());
    setDueReviewList(getDueForReview());
    setRecentTopics(getRecentTopics());
    refreshMistakeCount();
  }, [refreshMistakeCount]);

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
        setRecentTopics(recordRecentTopic(caseId));
        setIsMobileSheetOpen(true);
      }
    }
  }, [location]);

  const handleToggleMaster = useCallback(
    (id: string) => {
      const nowMastered = toggleMastered(id);
      if (nowMastered) {
        logReview(id);
        recordStudyActivity();
      } else {
        removeReview(id);
      }
      setMasteredCases(getMasteredCases());
      setDueReviewList(getDueForReview());
      showToast(nowMastered ? 'Marked as mastered · Review scheduled' : 'Removed from mastered');
    },
    [showToast]
  );

  const handleToggleBookmark = useCallback(
    (id: string) => {
      toggleBookmark(id);
      const updated = getBookmarks();
      setBookmarks(updated);
      showToast(updated.has(id) ? 'Bookmarked topic' : 'Bookmark removed');
    },
    [showToast]
  );

  const handleToggleFlag = useCallback(
    (id: string) => {
      toggleFlag(id);
      const updated = getFlags();
      setFlags(updated);
      showToast(updated.has(id) ? 'Flagged for review' : 'Flag removed');
    },
    [showToast]
  );

  const openCaseIds = Object.keys(DEMO_CASES);
  const handleSelectCase = useCallback((id: string) => {
    setSelectedCaseId(id);
    const loc = findTopicLocation(id);
    if (loc) {
      setHubSystemId(loc.systemId);
    }
    setRecentTopics(recordRecentTopic(id));
    recordStudyActivity();
    if (activeTab === 'drill' || activeTab === 'decoder' || activeTab === 'master') {
      setActiveTab('learn');
    }
    setIsMobileSheetOpen(true);
    window.history.replaceState(null, '', `${ROUTER_BASE}/app/#${id}`);
  }, [activeTab]);

  const cycleCase = useCallback(
    (dir: 1 | -1) => {
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
    },
    [selectedCaseId, handleSelectCase, openCaseIds]
  );

  const handleToggleStudySize = () => {
    const nextSize = studySize === 'normal' ? 'large' : 'normal';
    setStudySize(nextSize);
    setStudySizeState(nextSize);
    showToast(nextSize === 'large' ? 'Large text mode' : 'Normal text mode');
  };

  const handleToggleActiveRecall = useCallback(() => {
    setActiveRecall((prev) => {
      const next = !prev;
      localStorage.setItem('rapidsteps_recall_mode', next ? '1' : '0');
      showToast(next ? 'Active Recall ON' : 'Active Recall OFF');
      return next;
    });
  }, [showToast]);

  const handleToggleFocusMode = useCallback(() => {
    setFocusModeState((prev) => {
      const next = !prev;
      setFocusMode(next);
      return next;
    });
  }, []);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
    setFocusModeState(false);
  }, []);

  // Global Atlas Progress Stats across all 16 systems
  const totalAtlasTopics = ATLAS_MANIFEST.totals.topics;
  const masteredAtlasCount = ATLAS_MANIFEST.systems.reduce(
    (acc, sys) => acc + sys.topics.filter((t) => masteredCases.has(t.id)).length,
    0
  );
  const progressPercent = totalAtlasTopics > 0 ? Math.round((masteredAtlasCount / totalAtlasTopics) * 100) : 0;

  const anyModalOpen =
    isSearchOpen ||
    isShortcutsOpen ||
    isSignInOpen ||
    isUnlockOpen ||
    isMoreOpen ||
    isMistakeLogOpen ||
    isLabValuesOpen ||
    isProgressOpen;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K always opens Search cleanly
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((p) => !p);
        return;
      }

      if (e.key === 'Escape') {
        if (anyModalOpen) {
          setIsShortcutsOpen(false);
          setIsSearchOpen(false);
          setIsSignInOpen(false);
          setIsUnlockOpen(false);
          setIsMoreOpen(false);
          setIsMistakeLogOpen(false);
          setIsLabValuesOpen(false);
          setIsProgressOpen(false);
          return;
        }
        if (isMobileSheetOpen) {
          setIsMobileSheetOpen(false);
          return;
        }
        if (focusMode) {
          exitFocusMode();
        }
        return;
      }

      if (anyModalOpen) return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // View/Modal shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((p) => !p);
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsLabValuesOpen((p) => !p);
        return;
      }

      // Skip single-letter reading shortcuts while inside Drill (so A–F MCQ keys never collide!)
      if (activeTab === 'drill') return;

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFocusMode();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleToggleActiveRecall();
          break;
        case 'j':
        case 'J':
          if (activeTab === 'learn' || activeTab === 'cardio' || activeTab === 'map') {
            e.preventDefault();
            cycleCase(1);
          }
          break;
        case 'k':
        case 'K':
          if (activeTab === 'learn' || activeTab === 'cardio' || activeTab === 'map') {
            e.preventDefault();
            cycleCase(-1);
          }
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    anyModalOpen,
    isMobileSheetOpen,
    selectedCaseId,
    focusMode,
    activeTab,
    exitFocusMode,
    handleToggleFocusMode,
    handleToggleActiveRecall,
    handleToggleBookmark,
    handleToggleMaster,
    handleToggleFlag,
    cycleCase,
  ]);

  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'Learn', icon: <IconBookOpen size={14} /> },
    { id: 'cardio', label: 'Atlas Hub', icon: <IconAtlas size={14} /> },
    { id: 'map', label: 'Map', icon: <IconMap size={14} /> },
    { id: 'drill', label: 'Drill', icon: <IconZap size={14} /> },
    { id: 'decoder', label: 'Decoder', icon: <IconScan size={14} /> },
    { id: 'master', label: '5-Step Master', icon: <IconSteps size={14} /> },
  ];

  const showDesktopLearnPanel = isDesktop && activeTab === 'learn';
  const showDesktopMapPanel = isDesktop && activeTab === 'map' && Boolean(selectedCaseId);

  return (
    <div
      className={cn(
        'w-screen h-screen overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-navy-950 text-slate-800 dark:text-slate-100 antialiased selection:bg-[#FEF08A] selection:text-[#854D0E]',
        studySize === 'large' && 'text-lg rs-reader-large'
      )}
    >
      {/* ============================================================
          DESKTOP / TOP PRIMARY HEADER
          ============================================================ */}
      {!focusMode && (
        <header
          className="rs-dh rs-dh-main flex-shrink-0 h-14 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl px-4 sm:px-5 flex items-center justify-between z-30"
          role="navigation"
          aria-label="Primary"
        >
          {/* Left: Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-5">
            <a href={import.meta.env.BASE_URL} className="brand flex items-center gap-2 group" aria-label="Rapid Steps home">
              <Logo width={70} height={28} variant="default" />
            </a>

            <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-white/10" />

            <nav className="rs-dh-nav hidden lg:flex items-center gap-0.5">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all relative',
                    tab.id === 'cardio' && activeTab === 'cardio'
                      ? 'bg-gradient-to-r from-orange-DEFAULT to-[#FFA23F] text-navy-950 shadow-sm font-bold'
                      : tab.id === 'cardio'
                      ? 'text-orange-rust dark:text-orange-DEFAULT hover:bg-orange-light/60 dark:hover:bg-orange-DEFAULT/10 font-bold'
                      : activeTab === tab.id
                      ? 'bg-navy-DEFAULT text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
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

          {/* Right: Search (visible on ALL viewports), Labs, Recall, Dashboard Pill, Focus, Theme, Menu */}
          <div className="rs-dh-act flex items-center gap-1.5 sm:gap-2">
            {/* Quick Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="rs-dh-search flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-white/10 text-xs text-slate-500 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
              aria-label="Search atlas"
              title="Search (Cmd+K or /)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="hidden lg:inline">Search</span>
              <span className="rs-kbd hidden sm:inline-flex">/</span>
            </button>

            {/* USMLE Normal Lab Values */}
            <button
              type="button"
              onClick={() => setIsLabValuesOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent dark:border-white/10 transition-colors"
              title="USMLE Normal Lab Values (V)"
            >
              <span>Labs</span>
              <span className="rs-kbd">V</span>
            </button>

            {/* Active Recall */}
            <button
              onClick={handleToggleActiveRecall}
              className={cn(
                'rs-recall hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeRecall
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  : 'text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/[0.03] border border-transparent dark:border-white/10'
              )}
              title="Hide facts until revealed (R)"
            >
              {activeRecall ? <IconEye size={14} /> : <IconEyeOff size={14} />}
              <span>{activeRecall ? 'Recall ON' : 'Recall'}</span>
            </button>

            {/* Clickable Study Progress Dashboard Pill */}
            <button
              type="button"
              onClick={() => setIsProgressOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-white/10 hover:border-navy-DEFAULT dark:hover:border-orange-DEFAULT transition-colors"
              title={`${masteredAtlasCount} of ${totalAtlasTopics} Step 1 topics mastered · Open Dashboard`}
            >
              <div className="hidden xl:block w-14 rs-progress-bar">
                <div
                  className={cn('rs-progress-fill', progressPercent === 100 && 'complete')}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                {masteredAtlasCount}/{totalAtlasTopics}
              </span>
              {dueReviewList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                  {dueReviewList.length} due
                </span>
              )}
            </button>

            {/* Focus Mode */}
            <button
              onClick={handleToggleFocusMode}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Focus mode (F)"
              aria-label="Focus mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            </button>

            <ThemeToggle variant="adaptive" />

            {/* Menu / Account */}
            <button
              onClick={() => setIsMoreOpen(true)}
              className="flex items-center gap-1.5 p-1 pl-2 rounded-full border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative"
              aria-label="Study menu and settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-DEFAULT to-navy-dark text-white flex items-center justify-center text-[10px] font-bold">
                {userEmail ? userEmail.slice(0, 1).toUpperCase() : 'U'}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Focus Mode banner */}
      {focusMode && (
        <div className="h-9 bg-navy-950 border-b border-white/10 px-5 flex items-center justify-between text-xs text-slate-400 z-30">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT animate-pulse-led" />
            Focus Mode
          </span>
          <button
            onClick={exitFocusMode}
            className="text-orange-DEFAULT hover:underline font-bold flex items-center gap-1.5"
          >
            Exit <span className="rs-kbd">Esc</span>
          </button>
        </div>
      )}

      {/* ============================================================
          MAIN BODY LAYOUT
          ============================================================ */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
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
                  setRecentTopics(recordRecentTopic(tid));
                  recordStudyActivity();
                  window.history.replaceState(null, '', `${ROUTER_BASE}/app/#${tid}`);
                }}
                masteredCases={masteredCases}
                onToggleMaster={handleToggleMaster}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                flags={flags}
                onToggleFlag={handleToggleFlag}
                activeRecall={activeRecall}
                onToggleActiveRecall={handleToggleActiveRecall}
                onDrillSystem={(sysId) => {
                  setDrillInitialSys(sysId);
                  setActiveTab('drill');
                }}
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
              initialSystemId={drillInitialSys}
              onOpenUnlock={() => setIsUnlockOpen(true)}
              onSelectCase={handleSelectCase}
              onOpenLabValues={() => setIsLabValuesOpen(true)}
              onMistakeAdded={refreshMistakeCount}
            />
          )}

          {activeTab === 'decoder' && (
            <Suspense fallback={<TabFallback />}>
              <Decoder onSelectCase={handleSelectCase} />
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

        {/* Single Desktop Right Split-Pane (only mounted on >= 1024px) */}
        {(showDesktopLearnPanel || showDesktopMapPanel) && (
          <div
            className={cn(
              'h-full flex-shrink-0',
              activeTab === 'map' ? 'w-[440px] xl:w-[500px]' : 'w-[500px] xl:w-[600px]'
            )}
          >
            {selectedCaseId ? (
              <CasePanel
                caseId={selectedCaseId}
                onClose={() => setSelectedCaseId(null)}
                activeRecall={activeRecall}
                studySize={studySize}
                isMastered={masteredCases.has(selectedCaseId)}
                onToggleMaster={handleToggleMaster}
                isBookmarked={bookmarks.has(selectedCaseId)}
                onToggleBookmark={handleToggleBookmark}
                isFlagged={flags.has(selectedCaseId)}
                onToggleFlag={handleToggleFlag}
                onNextCase={() => cycleCase(1)}
                onPrevCase={() => cycleCase(-1)}
                onOpenUnlock={() => setIsUnlockOpen(true)}
              />
            ) : (
              <div className="h-full border-l border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-8">
                <div className="max-w-sm text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-navy-DEFAULT dark:text-orange-DEFAULT shadow-2xs">
                    <IconBookOpen size={20} />
                  </div>
                  <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                    Select Any Step 1 Topic
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Choose a topic from the 16 Organ Systems tree on the left, press <kbd className="rs-kbd">/</kbd> to search, or jump into Atlas Hub &amp; Drill.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectCase('cardio-aortic-stenosis')}
                      className="px-3.5 py-2 rounded-xl bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 text-xs font-bold"
                    >
                      Open Aortic Stenosis
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProgressOpen(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      Study Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          SINGLE MOBILE / TABLET BOTTOM SHEET (ONLY MOUNTED < 1024px)
          ============================================================ */}
      {!isDesktop && isMobileSheetOpen && selectedCaseId && (
        <>
          <div
            className="fixed inset-0 bg-navy-950/50 backdrop-blur-[1px] z-[390]"
            onClick={() => setIsMobileSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            className="rs-sheet open"
            style={{ height: '84vh' }}
          >
            <div
              className="rs-sheet-grab"
              onClick={() => setIsMobileSheetOpen(false)}
            />
            <div className="h-[calc(100%-16px)] overflow-hidden">
              <CasePanel
                caseId={selectedCaseId}
                onClose={() => setIsMobileSheetOpen(false)}
                activeRecall={activeRecall}
                studySize={studySize}
                isMastered={masteredCases.has(selectedCaseId)}
                onToggleMaster={handleToggleMaster}
                isBookmarked={bookmarks.has(selectedCaseId)}
                onToggleBookmark={handleToggleBookmark}
                isFlagged={flags.has(selectedCaseId)}
                onToggleFlag={handleToggleFlag}
                onNextCase={() => cycleCase(1)}
                onPrevCase={() => cycleCase(-1)}
                onOpenUnlock={() => setIsUnlockOpen(true)}
              />
            </div>
          </div>
        </>
      )}

      {/* ============================================================
          MOBILE / TABLET BOTTOM TAB BAR (100% VECTOR SVG ICONS)
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
        recentTopics={recentTopics}
        bookmarks={bookmarks}
        masteredCases={masteredCases}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <LabValuesModal
        isOpen={isLabValuesOpen}
        onClose={() => setIsLabValuesOpen(false)}
      />

      <ProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        masteredCases={masteredCases}
        bookmarks={bookmarks}
        flags={flags}
        dueForReview={dueReviewList}
        recentTopics={recentTopics}
        onSelectTopic={handleSelectCase}
        onSelectSystem={(sysId) => {
          setHubSystemId(sysId);
          const first = getManifestSystem(sysId)?.topics[0]?.id;
          if (first) setSelectedCaseId(first);
          setActiveTab('cardio');
        }}
        onToggleBookmark={handleToggleBookmark}
        onToggleFlag={handleToggleFlag}
        onDataImported={() => {
          refreshFromStorage();
          showToast('Study data restored from backup');
        }}
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
        onSelectTopic={handleSelectCase}
        onMistakesChanged={refreshMistakeCount}
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
        onOpenProgress={() => setIsProgressOpen(true)}
        onOpenLabValues={() => setIsLabValuesOpen(true)}
        masteredCount={masteredAtlasCount}
        totalCount={totalAtlasTopics}
        mistakeCount={mistakeCount}
        dueCount={dueReviewList.length}
        bookmarkCount={bookmarks.size}
        flagCount={flags.size}
      />

      {Toast}
    </div>
  );
}

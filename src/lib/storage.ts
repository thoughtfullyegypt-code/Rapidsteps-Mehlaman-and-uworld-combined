// lib/storage.ts — Wraps all localStorage keys (existing + new)
// EXISTING keys (do not rename):
//   sb-*-auth-token          Supabase session
//   rapidsteps_access_token  paid-access token
//   rapidsteps_dark_mode     "1" / absent
//   rapidsteps_recall_mode   "1" / absent
//   rapidsteps_view_mode     "tree" | "map"
//   rapidsteps_last_system   system id or "all"
//   rapidsteps_drill_score
//   step1_mastered_cases
//
// NEW keys (prefixed to avoid collision):
//   rapidsteps_bookmarks     JSON string Set<string> of case ids
//   rapidsteps_flags         JSON string Set<string> of case ids
//   rapidsteps_focus_mode    "1" / absent
//   rapidsteps_study_size    "normal" | "large"
//   rapidsteps_review_log    JSON ReviewEntry[]
//   rapidsteps_theme_manual  "dark" | "light" | absent (uses system default)

export const STORAGE_KEYS = {
  // Existing
  DARK_MODE:       'rapidsteps_dark_mode',
  RECALL_MODE:     'rapidsteps_recall_mode',
  VIEW_MODE:       'rapidsteps_view_mode',
  LAST_SYSTEM:     'rapidsteps_last_system',
  DRILL_SCORE:     'rapidsteps_drill_score',
  MASTERED_CASES:  'step1_mastered_cases',
  ACCESS_TOKEN:    'rapidsteps_access_token',
  // New
  BOOKMARKS:       'rapidsteps_bookmarks',
  FLAGS:           'rapidsteps_flags',
  FOCUS_MODE:      'rapidsteps_focus_mode',
  STUDY_SIZE:      'rapidsteps_study_size',
  REVIEW_LOG:      'rapidsteps_review_log',
  THEME_MANUAL:    'rapidsteps_theme_manual',
} as const;

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

function safeRemove(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

// --- Dark mode ---
export function getDarkMode(): boolean {
  const saved = safeGet(STORAGE_KEYS.DARK_MODE);
  if (saved === '1') return true;
  if (saved === '0') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function setDarkMode(on: boolean): void {
  safeSet(STORAGE_KEYS.DARK_MODE, on ? '1' : '0');
  document.documentElement.classList.toggle('dark', on);
}

// --- Mastered cases ---
export function getMasteredCases(): Set<string> {
  try {
    const raw = safeGet(STORAGE_KEYS.MASTERED_CASES);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

export function toggleMastered(caseId: string): boolean {
  const set = getMasteredCases();
  const nowMastered = !set.has(caseId);
  if (nowMastered) set.add(caseId); else set.delete(caseId);
  safeSet(STORAGE_KEYS.MASTERED_CASES, JSON.stringify([...set]));
  return nowMastered;
}

// --- Bookmarks (new) ---
export function getBookmarks(): Set<string> {
  try {
    const raw = safeGet(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

export function toggleBookmark(caseId: string): boolean {
  const set = getBookmarks();
  const nowBookmarked = !set.has(caseId);
  if (nowBookmarked) set.add(caseId); else set.delete(caseId);
  safeSet(STORAGE_KEYS.BOOKMARKS, JSON.stringify([...set]));
  return nowBookmarked;
}

// --- Flags (new) ---
export function getFlags(): Set<string> {
  try {
    const raw = safeGet(STORAGE_KEYS.FLAGS);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

export function toggleFlag(caseId: string): boolean {
  const set = getFlags();
  const nowFlagged = !set.has(caseId);
  if (nowFlagged) set.add(caseId); else set.delete(caseId);
  safeSet(STORAGE_KEYS.FLAGS, JSON.stringify([...set]));
  return nowFlagged;
}

// --- Study size (new) ---
export type StudySize = 'normal' | 'large';
export function getStudySize(): StudySize {
  return (safeGet(STORAGE_KEYS.STUDY_SIZE) as StudySize) ?? 'normal';
}
export function setStudySize(s: StudySize): void {
  safeSet(STORAGE_KEYS.STUDY_SIZE, s);
}

// --- Focus mode (new) ---
export function getFocusMode(): boolean {
  return safeGet(STORAGE_KEYS.FOCUS_MODE) === '1';
}
export function setFocusMode(on: boolean): void {
  if (on) safeSet(STORAGE_KEYS.FOCUS_MODE, '1');
  else safeRemove(STORAGE_KEYS.FOCUS_MODE);
}

// --- Review log (new, SM-2-lite ladder: 1/3/7 days) ---
export interface ReviewEntry {
  caseId: string;
  ts:     number;  // ms timestamp of mastery
  interval: number; // days until next review
}

const LADDER = [1, 3, 7, 14, 30]; // days

export function getReviewLog(): ReviewEntry[] {
  try {
    const raw = safeGet(STORAGE_KEYS.REVIEW_LOG);
    return raw ? (JSON.parse(raw) as ReviewEntry[]) : [];
  } catch { return []; }
}

export function logReview(caseId: string): void {
  const log = getReviewLog();
  const existing = log.findIndex(e => e.caseId === caseId);
  const now = Date.now();
  if (existing >= 0) {
    const e = log[existing];
    const nextIdx = Math.min(LADDER.indexOf(e.interval) + 1, LADDER.length - 1);
    log[existing] = { caseId, ts: now, interval: LADDER[nextIdx] };
  } else {
    log.push({ caseId, ts: now, interval: LADDER[0] });
  }
  safeSet(STORAGE_KEYS.REVIEW_LOG, JSON.stringify(log));
}

export function getDueForReview(): string[] {
  const now = Date.now();
  return getReviewLog()
    .filter(e => now - e.ts >= e.interval * 86_400_000)
    .map(e => e.caseId);
}

// --- Drill score ---
export interface DrillScore { correct: number; total: number; }
export function getDrillScore(): DrillScore {
  try {
    const raw = safeGet(STORAGE_KEYS.DRILL_SCORE);
    return raw ? (JSON.parse(raw) as DrillScore) : { correct: 0, total: 0 };
  } catch { return { correct: 0, total: 0 }; }
}
export function updateDrillScore(correct: boolean): void {
  const s = getDrillScore();
  s.total += 1;
  if (correct) s.correct += 1;
  safeSet(STORAGE_KEYS.DRILL_SCORE, JSON.stringify(s));
}
export function resetDrillScore(): void {
  safeRemove(STORAGE_KEYS.DRILL_SCORE);
}

// --- View mode ---
export type ViewMode = 'tree' | 'map';
export function getViewMode(): ViewMode {
  return (safeGet(STORAGE_KEYS.VIEW_MODE) as ViewMode) ?? 'tree';
}
export function setViewMode(m: ViewMode): void {
  safeSet(STORAGE_KEYS.VIEW_MODE, m);
}

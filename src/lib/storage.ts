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
  MISTAKE_LOG:     'rapidsteps_mistake_log',
  TOPIC_NOTES:     'rapidsteps_topic_notes',
  RECENT_TOPICS:   'rapidsteps_recent_topics',
  STUDY_ACTIVITY:  'rapidsteps_study_activity',
  DRILL_MISSED:    'rapidsteps_drill_missed',
  CARD_SRS:        'rapidsteps_card_srs',
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

export function removeReview(caseId: string): void {
  const log = getReviewLog().filter((e) => e.caseId !== caseId);
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

// --- Mistake Log ---
export interface MistakeEntry {
  id: string;
  topicId?: string;
  systemId?: string;
  caseName: string;
  picked: string;
  correct: string;
  note: string;
  ts: number;
  resolved?: boolean;
}

export function getMistakes(): MistakeEntry[] {
  try {
    const raw = safeGet(STORAGE_KEYS.MISTAKE_LOG);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MistakeEntry[]) : [];
  } catch { return []; }
}

export function addMistake(entry: Omit<MistakeEntry, 'id' | 'ts'>): MistakeEntry {
  const list = getMistakes();
  const created: MistakeEntry = {
    ...entry,
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    resolved: entry.resolved ?? false,
  };
  list.unshift(created);
  safeSet(STORAGE_KEYS.MISTAKE_LOG, JSON.stringify(list));
  return created;
}

export function toggleMistakeResolved(id: string): void {
  const list = getMistakes().map((m) =>
    m.id === id ? { ...m, resolved: !m.resolved } : m
  );
  safeSet(STORAGE_KEYS.MISTAKE_LOG, JSON.stringify(list));
}

export function deleteMistake(id: string): void {
  const list = getMistakes().filter((m) => m.id !== id);
  safeSet(STORAGE_KEYS.MISTAKE_LOG, JSON.stringify(list));
}

// --- Per-Topic Personal Notes ---
export function getAllTopicNotes(): Record<string, string> {
  try {
    const raw = safeGet(STORAGE_KEYS.TOPIC_NOTES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch { return {}; }
}

export function getTopicNote(topicId: string): string {
  return getAllTopicNotes()[topicId] ?? '';
}

export function setTopicNote(topicId: string, note: string): void {
  const notes = getAllTopicNotes();
  if (!note.trim()) {
    delete notes[topicId];
  } else {
    notes[topicId] = note;
  }
  safeSet(STORAGE_KEYS.TOPIC_NOTES, JSON.stringify(notes));
}

// --- Recent Topics (max 20, newest first) ---
export function getRecentTopics(): string[] {
  try {
    const raw = safeGet(STORAGE_KEYS.RECENT_TOPICS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch { return []; }
}

export function recordRecentTopic(topicId: string): string[] {
  if (!topicId) return getRecentTopics();
  const next = [topicId, ...getRecentTopics().filter((id) => id !== topicId)].slice(0, 20);
  safeSet(STORAGE_KEYS.RECENT_TOPICS, JSON.stringify(next));
  return next;
}

// --- Daily Study Activity & Streak ---
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getStudyActivityMap(): Record<string, number> {
  try {
    const raw = safeGet(STORAGE_KEYS.STUDY_ACTIVITY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch { return {}; }
}

export function recordStudyActivity(): void {
  const map = getStudyActivityMap();
  const key = toLocalDateKey(new Date());
  map[key] = (map[key] || 0) + 1;
  safeSet(STORAGE_KEYS.STUDY_ACTIVITY, JSON.stringify(map));
}

export function getStudyStats(): { todayCount: number; streak: number; totalActions: number } {
  const map = getStudyActivityMap();
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const todayCount = map[todayKey] || 0;
  const totalActions = Object.values(map).reduce((sum, n) => sum + (Number(n) || 0), 0);

  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if ((map[toLocalDateKey(cursor)] || 0) === 0) {
    // Allow ongoing streak if studied yesterday but not yet today
    cursor.setDate(cursor.getDate() - 1);
  }
  while ((map[toLocalDateKey(cursor)] || 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { todayCount, streak, totalActions };
}

// --- Drill Missed Queue ---
export interface MissedDrillItem {
  id: string;
  systemId: string;
  ts: number;
}

export function getMissedDrillItems(): MissedDrillItem[] {
  try {
    const raw = safeGet(STORAGE_KEYS.DRILL_MISSED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MissedDrillItem[]) : [];
  } catch { return []; }
}

export function markDrillMissed(id: string, systemId: string): MissedDrillItem[] {
  const existing = getMissedDrillItems();
  if (existing.some((x) => x.id === id)) {
    const updated = existing.map((x) => (x.id === id ? { ...x, ts: Date.now() } : x));
    safeSet(STORAGE_KEYS.DRILL_MISSED, JSON.stringify(updated));
    return updated;
  }
  const next = [...existing, { id, systemId, ts: Date.now() }];
  safeSet(STORAGE_KEYS.DRILL_MISSED, JSON.stringify(next));
  return next;
}

export function clearDrillMissed(id: string): MissedDrillItem[] {
  const next = getMissedDrillItems().filter((x) => x.id !== id);
  safeSet(STORAGE_KEYS.DRILL_MISSED, JSON.stringify(next));
  return next;
}

// --- Card SRS Intervals ---
export type CardSrsMap = Record<string, { ts: number; interval: number }>;

export function getCardSrs(): CardSrsMap {
  try {
    const raw = safeGet(STORAGE_KEYS.CARD_SRS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CardSrsMap) : {};
  } catch { return {}; }
}

export function recordCardSrs(cardId: string, knewIt: boolean): void {
  const srs = getCardSrs();
  const prev = srs[cardId];
  let nextInterval = 1;
  if (knewIt) {
    const idx = prev ? LADDER.indexOf(prev.interval) : -1;
    nextInterval = idx >= 0 ? LADDER[Math.min(idx + 1, LADDER.length - 1)] : LADDER[0];
  } else {
    nextInterval = LADDER[0];
  }
  srs[cardId] = { ts: Date.now(), interval: nextInterval };
  safeSet(STORAGE_KEYS.CARD_SRS, JSON.stringify(srs));
}

// --- Study Data Backup / Restore ---
const BACKUP_KEY_NAMES = [
  STORAGE_KEYS.MASTERED_CASES,
  STORAGE_KEYS.BOOKMARKS,
  STORAGE_KEYS.FLAGS,
  STORAGE_KEYS.REVIEW_LOG,
  STORAGE_KEYS.DRILL_SCORE,
  STORAGE_KEYS.MISTAKE_LOG,
  STORAGE_KEYS.TOPIC_NOTES,
  STORAGE_KEYS.RECENT_TOPICS,
  STORAGE_KEYS.STUDY_ACTIVITY,
  STORAGE_KEYS.DRILL_MISSED,
  STORAGE_KEYS.CARD_SRS,
] as const;

export function exportStudyData(): string {
  const keys: Record<string, string> = {};
  for (const k of BACKUP_KEY_NAMES) {
    const val = safeGet(k);
    if (val !== null) keys[k] = val;
  }
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      keys,
    },
    null,
    2
  );
}

export function importStudyData(raw: string): { ok: boolean; error?: string; restoredCount?: number } {
  try {
    const parsed = JSON.parse(raw) as { keys?: unknown };
    if (!parsed || typeof parsed !== 'object' || !parsed.keys || typeof parsed.keys !== 'object') {
      return { ok: false, error: 'Invalid backup file format.' };
    }
    const allowed = new Set<string>(Object.values(STORAGE_KEYS));
    let restoredCount = 0;
    for (const [k, v] of Object.entries(parsed.keys as Record<string, unknown>)) {
      if (allowed.has(k) && typeof v === 'string') {
        safeSet(k, v);
        restoredCount += 1;
      }
    }
    if (restoredCount === 0) {
      return { ok: false, error: 'No recognized Rapid Steps study keys found in backup.' };
    }
    return { ok: true, restoredCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not parse JSON backup.' };
  }
}

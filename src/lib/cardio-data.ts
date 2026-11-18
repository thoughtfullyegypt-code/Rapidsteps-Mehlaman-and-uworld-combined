// lib/cardio-data.ts — Shared atlas content types (types only).
//
// System data is NOT bundled here: all 16 systems load at runtime from
// /data/systems/<id>.json via loadSystemAtlas() in ./atlas-data.ts.
// (The former bundled cardio-master.json was a duplicate of
// public/data/systems/cardio.json and was removed to shrink the bundle.)

export type CardioBlock =
  | { kind: 'p'; text: string; bullet: boolean; level: number }
  | { kind: 'sub'; text: string }
  | { kind: 'img'; src: string; caption: string }
  | { kind: 'table'; rows: string[][] };

export interface CardioMediaItem {
  src: string;
  caption: string;
  topicId: string;
  topicTitle: string;
  chapterId: string;
  source: 'docx' | 'pdf';
}

export interface CardioVideoItem {
  src: string;
  title: string;
  desc: string;
  topicId: string;
  topicTitle: string;
  chapterId: string;
}

export interface CardioHySection {
  heading?: string | null;
  bullets: string[];
}

export interface CardioTopic {
  id: string;
  title: string;
  chapterId: string;
  pillar: string;
  summary: string;
  imageCount: number;
  tableCount: number;
  videoCount: number;
  blocks: CardioBlock[];
  hySections: CardioHySection[];
  hyBullets: string[];
  hyImages: Array<{ src: string; caption: string }>;
  videos: Array<{ src: string; title: string; desc: string }>;
}

export interface CardioChapter {
  id: string;
  num: string;
  title: string;
  short: string;
  desc: string;
}

export interface CardioRapidQA {
  id: string;
  num: number;
  q: string;
  a: string;
  /** System ids this question also appears in (cross-system spaced repetition). */
  alsoIn?: string[];
}

export interface CardioMasterPayload {
  stats: {
    chapters: number;
    topics: number;
    docxImages: number;
    pdfImages: number;
    totalImages: number;
    tables: number;
    videos: number;
    hyBullets: number;
    rapidFireQAs: number;
  };
  chapters: CardioChapter[];
  topics: CardioTopic[];
  rapidFireQAs: CardioRapidQA[];
}

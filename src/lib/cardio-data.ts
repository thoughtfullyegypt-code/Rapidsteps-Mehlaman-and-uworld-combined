import rawCardio from './cardio-master.json';

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

export const CARDIO_MASTER = rawCardio as unknown as CardioMasterPayload;

const TOPIC_MAP = new Map<string, CardioTopic>(
  CARDIO_MASTER.topics.map((t) => [t.id, t])
);

const CHAPTER_MAP = new Map<string, CardioChapter>(
  CARDIO_MASTER.chapters.map((c) => [c.id, c])
);

export function getCardioTopic(id: string | null | undefined): CardioTopic | undefined {
  if (!id) return undefined;
  return TOPIC_MAP.get(id);
}

export function getCardioChapter(chapterId: string): CardioChapter | undefined {
  return CHAPTER_MAP.get(chapterId);
}

export const ALL_CARDIO_VIDEOS: CardioVideoItem[] = CARDIO_MASTER.topics.flatMap((t) =>
  t.videos.map((v) => ({
    ...v,
    topicId: t.id,
    topicTitle: t.title,
    chapterId: t.chapterId,
  }))
);

export const ALL_CARDIO_IMAGES: CardioMediaItem[] = CARDIO_MASTER.topics.flatMap((t) => {
  const docxImgs: CardioMediaItem[] = t.blocks
    .filter((b): b is Extract<CardioBlock, { kind: 'img' }> => b.kind === 'img')
    .map((b) => ({
      src: b.src,
      caption: b.caption,
      topicId: t.id,
      topicTitle: t.title,
      chapterId: t.chapterId,
      source: 'docx',
    }));
  const pdfImgs: CardioMediaItem[] = t.hyImages.map((im) => ({
    src: im.src,
    caption: im.caption,
    topicId: t.id,
    topicTitle: t.title,
    chapterId: t.chapterId,
    source: 'pdf',
  }));
  return [...docxImgs, ...pdfImgs];
});

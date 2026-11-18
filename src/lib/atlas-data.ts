import { useState, useEffect } from 'react';
import rawManifest from './atlas-manifest.json';
import rawCardio from './cardio-master.json';
import type {
  CardioBlock,
  CardioChapter,
  CardioTopic,
  CardioMediaItem,
  CardioVideoItem,
} from './cardio-data';

export interface AtlasQAItem {
  id: string;
  num: number;
  kind?: 'qa' | 'mcq' | 'arrow';
  sourceTag?: string;
  q: string;
  a: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  images?: string[];
  topicId?: string;
}

export interface SystemAtlasStats {
  chapters: number;
  topics: number;
  docxImages: number;
  pdfImages: number;
  totalImages: number;
  tables: number;
  videos: number;
  hyBullets: number;
  rapidFireQAs: number;
}

export interface SystemAtlasPayload {
  systemId: string;
  title: string;
  short: string;
  stats: SystemAtlasStats;
  chapters: CardioChapter[];
  topics: CardioTopic[];
  rapidFireQAs: AtlasQAItem[];
}

export interface ManifestTopicStub {
  id: string;
  title: string;
  chapterId: string;
  summary: string;
  imageCount: number;
  tableCount: number;
  videoCount: number;
  hyCount: number;
}

export interface ManifestSystem {
  systemId: string;
  title: string;
  short: string;
  stats: SystemAtlasStats;
  chapters: CardioChapter[];
  topics: ManifestTopicStub[];
}

export interface AtlasManifest {
  totals: {
    systems: number;
    chapters: number;
    topics: number;
    images: number;
    tables: number;
    videos: number;
    hyBullets: number;
    rapidFireQAs: number;
  };
  systems: ManifestSystem[];
}

export const ATLAS_MANIFEST = rawManifest as unknown as AtlasManifest;

const MANIFEST_SYS_MAP = new Map<string, ManifestSystem>(
  ATLAS_MANIFEST.systems.map((s) => [s.systemId, s])
);

export interface TopicLocation {
  systemId: string;
  systemTitle: string;
  systemShort: string;
  chapter: CardioChapter | undefined;
  stub: ManifestTopicStub;
}

const TOPIC_LOC_MAP = new Map<string, TopicLocation>();
for (const sys of ATLAS_MANIFEST.systems) {
  const chMap = new Map(sys.chapters.map((c) => [c.id, c]));
  for (const t of sys.topics) {
    TOPIC_LOC_MAP.set(t.id, {
      systemId: sys.systemId,
      systemTitle: sys.title,
      systemShort: sys.short,
      chapter: chMap.get(t.chapterId),
      stub: t,
    });
  }
}

export function getManifestSystem(systemId: string): ManifestSystem | undefined {
  return MANIFEST_SYS_MAP.get(systemId);
}

export function findTopicLocation(topicId: string | null | undefined): TopicLocation | undefined {
  if (!topicId) return undefined;
  return TOPIC_LOC_MAP.get(topicId);
}

// In-memory cache pre-seeded with Cardiology
const SYSTEM_CACHE = new Map<string, SystemAtlasPayload>();
SYSTEM_CACHE.set('cardio', {
  systemId: 'cardio',
  title: 'Cardiology & Vascular',
  short: 'CV',
  ...(rawCardio as unknown as Omit<SystemAtlasPayload, 'systemId' | 'title' | 'short'>),
});

const INFLIGHT = new Map<string, Promise<SystemAtlasPayload>>();

export async function loadSystemAtlas(systemId: string): Promise<SystemAtlasPayload> {
  const cached = SYSTEM_CACHE.get(systemId);
  if (cached) return cached;

  const existing = INFLIGHT.get(systemId);
  if (existing) return existing;

  const req = fetch(`/data/systems/${systemId}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load system ${systemId}: ${res.status}`);
      return res.json() as Promise<SystemAtlasPayload>;
    })
    .then((payload) => {
      SYSTEM_CACHE.set(systemId, payload);
      INFLIGHT.delete(systemId);
      return payload;
    })
    .catch((err) => {
      INFLIGHT.delete(systemId);
      throw err;
    });

  INFLIGHT.set(systemId, req);
  return req;
}

export function useSystemAtlas(systemId: string | null | undefined): {
  data: SystemAtlasPayload | null;
  loading: boolean;
} {
  const [data, setData] = useState<SystemAtlasPayload | null>(() =>
    systemId ? SYSTEM_CACHE.get(systemId) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(systemId && !SYSTEM_CACHE.has(systemId))
  );

  useEffect(() => {
    if (!systemId) {
      setData(null);
      setLoading(false);
      return;
    }
    const cached = SYSTEM_CACHE.get(systemId);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadSystemAtlas(systemId)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [systemId]);

  return { data, loading };
}

export function useTopicDetail(topicId: string | null | undefined): {
  topic: CardioTopic | null;
  chapter: CardioChapter | null;
  system: SystemAtlasPayload | null;
  location: TopicLocation | undefined;
  loading: boolean;
} {
  const loc = findTopicLocation(topicId);
  const { data: sysData, loading } = useSystemAtlas(loc?.systemId);

  if (!loc || !topicId) {
    return { topic: null, chapter: null, system: null, location: undefined, loading: false };
  }
  if (!sysData) {
    return { topic: null, chapter: loc.chapter ?? null, system: null, location: loc, loading };
  }
  const foundTopic = sysData.topics.find((t) => t.id === topicId) ?? null;
  const foundCh = sysData.chapters.find((c) => c.id === foundTopic?.chapterId) ?? loc.chapter ?? null;
  return {
    topic: foundTopic,
    chapter: foundCh,
    system: sysData,
    location: loc,
    loading: false,
  };
}

export function extractSystemImages(sys: SystemAtlasPayload): CardioMediaItem[] {
  const out: CardioMediaItem[] = [];
  const seen = new Set<string>();

  for (const t of sys.topics) {
    for (const b of t.blocks) {
      if (b.kind === 'img' && !seen.has(b.src)) {
        seen.add(b.src);
        out.push({
          src: b.src,
          caption: b.caption || t.title,
          topicId: t.id,
          topicTitle: t.title,
          chapterId: t.chapterId,
          source: 'docx',
        });
      }
    }
    for (const im of t.hyImages || []) {
      if (!seen.has(im.src)) {
        seen.add(im.src);
        out.push({
          src: im.src,
          caption: im.caption || t.title,
          topicId: t.id,
          topicTitle: t.title,
          chapterId: t.chapterId,
          source: 'pdf',
        });
      }
    }
  }

  const fallbackTopic = sys.topics[0];
  for (const qa of sys.rapidFireQAs) {
    if (qa.images && qa.images.length > 0) {
      const linked = qa.topicId ? sys.topics.find((t) => t.id === qa.topicId) : undefined;
      for (const src of qa.images) {
        if (!seen.has(src)) {
          seen.add(src);
          out.push({
            src,
            caption: qa.q.length > 110 ? `${qa.q.slice(0, 110)}…` : qa.q,
            topicId: linked?.id || fallbackTopic?.id || '',
            topicTitle: linked?.title || qa.sourceTag || sys.short,
            chapterId: linked?.chapterId || fallbackTopic?.chapterId || '',
            source: 'pdf',
          });
        }
      }
    }
  }

  return out;
}

export function extractSystemVideos(sys: SystemAtlasPayload): CardioVideoItem[] {
  return sys.topics.flatMap((t) =>
    (t.videos || []).map((v) => ({
      ...v,
      topicId: t.id,
      topicTitle: t.title,
      chapterId: t.chapterId,
    }))
  );
}

export type { CardioBlock, CardioChapter, CardioTopic, CardioMediaItem, CardioVideoItem };

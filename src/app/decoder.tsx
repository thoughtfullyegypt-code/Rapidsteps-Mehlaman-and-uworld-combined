import React, { useState, useEffect, useMemo } from 'react';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import { publicUrl } from '@/lib/paths';
import {
  SystemIcon,
  IconShield,
  IconScan,
  IconZap,
  IconImage,
  IconZoomIn,
  IconX,
} from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface DecoderProps {
  onSelectCase: (caseId: string) => void;
}

interface DecoderSample {
  id: string;
  sys: string;
  label: string;
  text: string;
}

interface IndexedTopic {
  id: string;
  sys: string;
  sysShort: string;
  chId: string;
  ch: string;
  title: string;
  summary: string;
  pearls: string[];
  img: string | null;
  kw: Record<string, number>;
}

interface IndexedVignette {
  id: string;
  sys: string;
  sysShort: string;
  q: string;
  a: string;
  img: string | null;
  topicId: string | null;
  kw: string[];
}

interface DecoderIndexPayload {
  samples: DecoderSample[];
  topics: IndexedTopic[];
  vignettes: IndexedVignette[];
}

let CACHED_DECODER_INDEX: DecoderIndexPayload | null = null;

const QUERY_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'were', 'has', 'have', 'had',
  'not', 'but', 'can', 'may', 'will', 'most', 'more', 'less', 'also', 'into', 'than', 'when', 'which',
  'what', 'who', 'where', 'why', 'how', 'patient', 'patients', 'year', 'years', 'old', 'man', 'woman',
  'male', 'female', 'boy', 'girl', 'presents', 'history', 'physician', 'comes', 'brought', 'shows',
  'seen', 'due', 'caused', 'cause', 'common', 'associated', 'treatment', 'diagnosis', 'answer',
  'question', 'likely', 'following', 'normal', 'high', 'low', 'increased', 'decreased', 'elevated',
  'positive', 'negative', 'acute', 'chronic', 'disease', 'syndrome', 'disorder', 'cell', 'cells',
  'blood', 'serum', 'urine', 'levels', 'level', 'test', 'findings', 'clinical', 'exam', 'examination',
  'physical', 'left', 'right', 'upper', 'lower', 'pain', 'week', 'weeks', 'month', 'months', 'day',
  'days', 'after', 'before', 'during', 'without',
]);

function extractQueryTokens(input: string): string[] {
  const matches = input.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*|[a-z]*\d+[a-z0-9;/+-]*/gi) || [];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of matches) {
    const clean = raw.replace(/^-+|-+$/g, '').toLowerCase();
    if (clean.length < 2 || QUERY_STOPWORDS.has(clean)) continue;
    if (/^\d+$/.test(clean) && clean.length <= 2) continue;
    if (!seen.has(clean)) {
      seen.add(clean);
      unique.push(clean);
    }
    if (clean.includes('-')) {
      const noHyph = clean.replace(/-/g, '');
      if (noHyph.length >= 3 && !seen.has(noHyph)) {
        seen.add(noHyph);
        unique.push(noHyph);
      }
    }
  }
  return unique;
}

export default function Decoder({ onSelectCase }: DecoderProps) {
  const [indexData, setIndexData] = useState<DecoderIndexPayload | null>(CACHED_DECODER_INDEX);
  const [loading, setLoading] = useState<boolean>(!CACHED_DECODER_INDEX);
  const [sysFilter, setSysFilter] = useState<string>('all');
  const [inputText, setInputText] = useState<string>('');
  const [activeSampleId, setActiveSampleId] = useState<string>('');
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  useEffect(() => {
    if (CACHED_DECODER_INDEX) {
      if (!inputText && CACHED_DECODER_INDEX.samples[0]) {
        setInputText(CACHED_DECODER_INDEX.samples[0].text);
        setActiveSampleId(CACHED_DECODER_INDEX.samples[0].id);
      }
      return;
    }
    let cancelled = false;
    fetch(publicUrl('/data/decoder-index.json'))
      .then((r) => r.json())
      .then((d: DecoderIndexPayload) => {
        for (const v of d.vignettes) {
          if (v.img) v.img = publicUrl(v.img);
        }
        CACHED_DECODER_INDEX = d;
        if (!cancelled) {
          setIndexData(d);
          setLoading(false);
          if (d.samples[0]) {
            setInputText(d.samples[0].text);
            setActiveSampleId(d.samples[0].id);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightbox) setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const visibleSamples = useMemo(() => {
    if (!indexData) return [];
    if (sysFilter === 'all') return indexData.samples;
    return indexData.samples.filter((s) => s.sys === sysFilter);
  }, [indexData, sysFilter]);

  const analysis = useMemo(() => {
    if (!indexData || !inputText.trim()) {
      return { clues: [] as string[], topTopics: [] as Array<IndexedTopic & { score: number; matched: string[]; pct: number }>, topVignettes: [] as IndexedVignette[] };
    }

    const lowerInput = inputText.toLowerCase();
    const qTokens = extractQueryTokens(inputText);
    const detectedSet = new Set<string>();

    const scoredTopics: Array<IndexedTopic & { score: number; matched: string[]; pct: number }> = [];

    for (const t of indexData.topics) {
      if (sysFilter !== 'all' && t.sys !== sysFilter) continue;

      let score = 0;
      const matched: string[] = [];

      const titleLower = t.title.toLowerCase();
      if (titleLower.length >= 4 && lowerInput.includes(titleLower)) {
        score += 28;
        matched.push(t.title.toLowerCase());
      }

      for (const qt of qTokens) {
        if (t.kw[qt] !== undefined) {
          score += t.kw[qt];
          matched.push(qt);
        } else if (qt.length >= 5) {
          // Prefix/stem match (e.g. 'demyelinating' <-> 'demyelination', 'granulomas' <-> 'granuloma')
          const stem = qt.slice(0, -1);
          for (const [k, w] of Object.entries(t.kw)) {
            if (k.length >= 5 && (k.startsWith(stem) || stem.startsWith(k.slice(0, -1)))) {
              score += w * 0.72;
              matched.push(qt);
              break;
            }
          }
        }
      }

      if (score >= 4.5 && matched.length >= 1) {
        scoredTopics.push({ ...t, score, matched: Array.from(new Set(matched)), pct: 0 });
      }
    }

    scoredTopics.sort((a, b) => b.score - a.score);
    const topSlice = scoredTopics.slice(0, 6);
    const maxScore = topSlice[0]?.score || 1;
    topSlice.forEach((item, idx) => {
      item.pct = idx === 0 ? Math.min(98, Math.max(76, Math.round(68 + item.score * 0.9))) : Math.max(28, Math.round((item.score / maxScore) * 88));
      item.matched.forEach((m) => detectedSet.add(m));
    });

    // Score matching Mehlman Rapid-Fire Vignettes
    const scoredVig: Array<{ v: IndexedVignette; sc: number }> = [];
    const qTokenSet = new Set(qTokens);
    for (const v of indexData.vignettes) {
      if (sysFilter !== 'all' && v.sys !== sysFilter) continue;
      let sc = 0;
      for (const k of v.kw) {
        if (qTokenSet.has(k) || (k.length >= 5 && lowerInput.includes(k))) {
          sc += 3;
        }
      }
      if (sc >= 6) {
        scoredVig.push({ v, sc });
      }
    }
    scoredVig.sort((a, b) => b.sc - a.sc);

    return {
      clues: Array.from(detectedSet).slice(0, 14),
      topTopics: topSlice,
      topVignettes: scoredVig.slice(0, 4).map((x) => x.v),
    };
  }, [indexData, inputText, sysFilter]);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50/50 dark:bg-navy-950">
      <div className="w-full max-w-6xl mx-auto p-4 md:p-7 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 bg-white dark:bg-navy-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-orange-rust dark:text-orange-DEFAULT">
              <IconScan size={14} />
              <span>16-System Weighted Corpus Engine · {ATLAS_MANIFEST.totals.topics.toLocaleString()} Topics + 3,857 Vignettes</span>
            </div>
            <h1 id="stem-decoder-title" className="text-xl md:text-2xl font-extrabold font-display text-navy-DEFAULT dark:text-white">
              Clinical Stem &amp; Buzzword Decoder
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Paste any USMLE Step 1 vignette, lab signature, histology/EM description, translocation, or physical exam clue. Ranks the top diagnosis, surfaces board look-alike traps, and pulls matching clinical vignettes locally in your browser.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <IconShield size={13} />
            <span>100% Browser-Local</span>
          </span>
        </div>

        {/* Organ System Scope Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Filter Scope by Organ System
            </span>
          </div>
          <div className="rs-pill-strip flex items-center gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => setSysFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all',
                sysFilter === 'all'
                  ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
              )}
            >
              All 16 Systems
            </button>
            {ATLAS_MANIFEST.systems.map((sys) => (
              <button
                key={sys.systemId}
                type="button"
                onClick={() => {
                  setSysFilter(sys.systemId);
                  const matchingSample = indexData?.samples.find((s) => s.sys === sys.systemId);
                  if (matchingSample) {
                    setActiveSampleId(matchingSample.id);
                    setInputText(matchingSample.text);
                  }
                }}
                className={cn(
                  'px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all inline-flex items-center gap-1.5',
                  sysFilter === sys.systemId
                    ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950 border-navy-DEFAULT dark:border-orange-DEFAULT'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                )}
              >
                <SystemIcon systemId={sys.systemId} size={13} />
                <span>{sys.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sample Stems Across All 16 Systems */}
        {visibleSamples.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Test a High-Yield Step 1 Vignette ({visibleSamples.length} Presets):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {visibleSamples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveSampleId(s.id);
                    setInputText(s.text);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border inline-flex items-center gap-1.5',
                    activeSampleId === s.id && inputText === s.text
                      ? 'bg-orange-DEFAULT text-navy-950 border-orange-DEFAULT font-bold shadow-xs'
                      : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  )}
                >
                  <SystemIcon systemId={s.sys} size={12} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vignette Input Box */}
        <div className="space-y-2">
          <label htmlFor="stem-decoder-input" className="sr-only">
            Clinical vignette or buzzwords
          </label>
          <div className="relative">
            <textarea
              id="stem-decoder-input"
              aria-label="Clinical vignette or buzzwords"
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setActiveSampleId('');
              }}
              placeholder="Paste any clinical vignette or buzzwords (e.g., 'painless hematuria, flank mass, polycythemia EPO VHL' or 'c-ANCA saddle nose cavitary lung nodules hematuria')…"
              className="w-full p-4 pr-10 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-navy-DEFAULT dark:focus:ring-orange-DEFAULT resize-y shadow-sm leading-relaxed"
            />
            {inputText && (
              <button
                type="button"
                aria-label="Clear input"
                onClick={() => {
                  setInputText('');
                  setActiveSampleId('');
                }}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 dark:bg-navy-700 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-navy-600 hover:text-slate-800 dark:hover:text-white transition-colors"
                title="Clear"
              >
                <IconX size={12} />
              </button>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span>{inputText.length} characters · {analysis.clues.length} diagnostic clues weighted</span>
          </div>
        </div>

        {/* Detected Clues Strip */}
        {analysis.clues.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 mr-1">
              Detected Hooks:
            </span>
            {analysis.clues.map((clue) => (
              <span
                key={clue}
                className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-orange-light dark:bg-orange-DEFAULT/15 text-orange-rust dark:text-orange-DEFAULT border border-orange-border dark:border-orange-DEFAULT/30"
              >
                {clue}
              </span>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-14 text-center text-sm font-bold text-slate-400">
            Initializing 16-System Diagnostic Index…
          </div>
        )}

        {/* Ranked Diagnostic Topic Matches */}
        {!loading && (
          <div className="space-y-4">
            <div className="rs-section-label text-navy-DEFAULT dark:text-orange-DEFAULT">
              <IconZap size={14} />
              <span>Ranked Differential Diagnosis &amp; Look-Alike Splitters</span>
            </div>

            {!inputText.trim() ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-navy-900 border border-dashed border-slate-200 dark:border-white/10 text-center text-sm text-slate-500">
                Select any sample vignette above or type clinical buzzwords to rank differentials across all {ATLAS_MANIFEST.totals.topics.toLocaleString()} topics.
              </div>
            ) : analysis.topTopics.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-navy-900 border border-dashed border-slate-200 dark:border-white/10 text-center space-y-1.5">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Add one more specific lab, histology, or exam clue.
                </p>
                <p className="text-xs text-slate-500">
                  {sysFilter !== 'all'
                    ? 'Tip: Switch scope back to "All 16 Systems" to search across every organ system.'
                    : 'Try entering specific antibodies, enzymes, murmurs, nerve roots, or pathology buzzwords.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.topTopics.map((match, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={match.id}
                      className={cn(
                        'p-4 md:p-5 rounded-2xl border transition-all',
                        isTop
                          ? 'bg-gradient-to-r from-orange-light/70 via-white to-white dark:from-orange-DEFAULT/15 dark:via-navy-900 dark:to-navy-900 border-orange-DEFAULT shadow-sm'
                          : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                'text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full',
                                isTop
                                  ? 'bg-orange-DEFAULT text-navy-950'
                                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
                              )}
                            >
                              {isTop ? '#1 Primary Match' : `#${idx + 1} Differential`} · {match.pct}%
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-navy-50 dark:bg-navy-800 text-navy-DEFAULT dark:text-slate-200">
                              <SystemIcon systemId={match.sys} size={12} />
                              <span>{match.sysShort} · {match.ch}</span>
                            </span>
                          </div>

                          <h3 className="text-base md:text-lg font-extrabold font-display text-navy-DEFAULT dark:text-white">
                            {match.title}
                          </h3>

                          {match.pearls.length > 0 ? (
                            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {match.pearls.map((p, pi) => (
                                <li key={pi} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT mt-1.5 shrink-0" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-600 dark:text-slate-300">{match.summary}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-mono text-slate-400">Matched clues:</span>
                            {match.matched.slice(0, 8).map((mc) => (
                              <span
                                key={mc}
                                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                              >
                                {mc}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right Thumbnail + Action */}
                        <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                          {match.img && (
                            <button
                              type="button"
                              onClick={() => setLightbox({ src: match.img!, caption: match.title })}
                              className="w-28 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 p-1 group relative cursor-zoom-in"
                              title="Zoom clinical figure"
                            >
                              <img src={match.img} alt={match.title} loading="lazy" className="w-full h-full object-contain" />
                              <span className="absolute bottom-1 right-1 p-0.5 rounded bg-navy-950/75 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconZoomIn size={10} />
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectCase(match.id)}
                            className="px-3.5 py-2 rounded-xl bg-navy-DEFAULT text-white text-xs font-bold hover:bg-navy-500 transition-colors whitespace-nowrap"
                          >
                            Open Full Topic →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Matching Rapid-Fire USMLE Vignettes */}
            {analysis.topVignettes.length > 0 && (
              <div className="pt-3 space-y-3">
                <div className="rs-section-label text-orange-rust dark:text-orange-DEFAULT">
                  <IconImage size={14} />
                  <span>Matching High-Yield Clinical Vignettes</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.topVignettes.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                            <SystemIcon systemId={v.sys} size={11} />
                            <span>{v.sysShort} Vignette</span>
                          </span>
                          {v.topicId && (
                            <button
                              type="button"
                              onClick={() => onSelectCase(v.topicId!)}
                              className="text-[11px] font-bold text-navy-DEFAULT dark:text-orange-DEFAULT hover:underline"
                            >
                              Related Topic →
                            </button>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                          {v.q}
                        </p>
                        {v.img && (
                          <button
                            type="button"
                            onClick={() => setLightbox({ src: v.img!, caption: v.q })}
                            className="block rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 p-1 cursor-zoom-in"
                          >
                            <img src={v.img} alt="Vignette figure" loading="lazy" className="max-h-32 w-auto object-contain mx-auto" />
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                        <strong className="font-extrabold">→ </strong>
                        {v.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-4xl w-full bg-white dark:bg-navy-900 rounded-2xl overflow-hidden shadow-2xl rs-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold text-navy-DEFAULT dark:text-white truncate pr-4">
                {lightbox.caption}
              </span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="min-h-[44px] px-3 py-1 rounded-md bg-slate-100 dark:bg-navy-800 text-xs font-bold flex items-center"
              >
                Close
              </button>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-navy-950 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img src={lightbox.src} alt={lightbox.caption} className="max-h-[72vh] w-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

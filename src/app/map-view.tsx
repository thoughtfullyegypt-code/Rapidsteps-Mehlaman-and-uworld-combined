import React, { useState, useEffect } from 'react';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import { SystemIcon } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface MapViewProps {
  onSelectCase: (caseId: string) => void;
  selectedCaseId: string | null;
  masteredCases: Set<string>;
}

export default function MapView({ onSelectCase, selectedCaseId, masteredCases }: MapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedSystem, setSelectedSystem] = useState<string>('cardio');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch4-valvular');

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.15).toFixed(2)), 1.75));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.65));
  const handleResetZoom = () => setZoom(1);

  const currentSys =
    ATLAS_MANIFEST.systems.find((s) => s.systemId === selectedSystem) || ATLAS_MANIFEST.systems[0];

  useEffect(() => {
    if (!currentSys.chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(currentSys.chapters[0]?.id || '');
    }
  }, [currentSys, selectedChapterId]);

  const currentChapter =
    currentSys.chapters.find((c) => c.id === selectedChapterId) || currentSys.chapters[0];

  const mapNodes = currentSys.topics
    .filter((t) => !currentChapter || t.chapterId === currentChapter.id)
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      syndrome: currentChapter?.short || currentSys.short,
      buzzword: t.summary,
      diagnosis: t.title,
      mediaBadge: [
        t.imageCount > 0 ? `${t.imageCount} FIG` : '',
        t.videoCount > 0 ? `${t.videoCount} VID` : '',
      ]
        .filter(Boolean)
        .join(' · '),
    }));

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-navy-950 overflow-hidden flex flex-col">
      {/* Top 16-System Toolbar */}
      <div className="flex-shrink-0 px-4 py-2.5 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 z-20">
        <div className="rs-pill-strip flex items-center gap-1.5 pb-0.5 flex-1">
          {ATLAS_MANIFEST.systems.map((sys) => (
            <button
              key={sys.systemId}
              type="button"
              onClick={() => setSelectedSystem(sys.systemId)}
              className={cn(
                'px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5',
                selectedSystem === sys.systemId
                  ? 'bg-navy-DEFAULT text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              <SystemIcon systemId={sys.systemId} size={13} />
              <span>{sys.short}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 font-bold"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-[11px] font-mono font-bold px-1.5 text-slate-600 dark:text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 h-7 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 text-xs font-bold"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Chapter Sub-Bar (All 16 Systems) */}
      {currentSys.chapters.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-slate-50 dark:bg-navy-900/70 border-b border-slate-200 dark:border-white/10 flex items-center gap-1.5 z-10">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 mr-1 whitespace-nowrap">
            {currentSys.short} Chapter:
          </span>
          <div className="rs-pill-strip flex items-center gap-1.5 flex-1">
            {currentSys.chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChapterId(ch.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
                  currentChapter?.id === ch.id
                    ? 'bg-orange-DEFAULT text-navy-950'
                    : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
                )}
              >
                {ch.num} {ch.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Spatial Mind Map Canvas */}
      <div className="flex-1 w-full overflow-auto p-6 flex items-center justify-center">
        <div
          className="transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg
            viewBox="0 0 960 500"
            className="w-[900px] max-w-none h-[470px]"
            role="img"
            aria-label={`${currentSys.title} diagnostic map`}
          >
            <defs>
              <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#CBD5E1" strokeOpacity="0.35" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="960" height="500" rx="24" fill="url(#map-grid)" />

            {[
              { y: 48, label: '01 SYSTEM' },
              { y: 168, label: '02 CHAPTER' },
              { y: 292, label: '03 KEY CLUE' },
              { y: 416, label: '04 TOPIC / DX' },
            ].map((lane) => (
              <text
                key={lane.label}
                x="16"
                y={lane.y}
                fill="#64748B"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                {lane.label}
              </text>
            ))}

            <g transform="translate(310, 18)">
              <rect width="360" height="54" rx="16" fill="#1E2A8A" stroke="#141C66" strokeWidth="2" />
              <text x="180" y="28" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="13.5">
                {`${currentSys.short} · Ch ${currentChapter?.num || '01'}: ${currentChapter?.short || currentSys.title}`}
              </text>
              <text x="180" y="44" textAnchor="middle" fill="#FDBA74" fontFamily="JetBrains Mono, monospace" fontWeight="600" fontSize="10">
                {`${currentSys.stats.topics} topics · ${currentSys.stats.totalImages} figures · ${currentSys.stats.rapidFireQAs} Q&As`}
              </text>
            </g>

            {mapNodes.map((node, idx) => {
              const count = Math.max(mapNodes.length, 1);
              const spacing = 810 / count;
              const centerX = 125 + spacing * idx + spacing / 2;
              const colW = Math.min(176, spacing - 12);
              const x = centerX - colW / 2;
              const isSelected = selectedCaseId === node.id;
              const isMastered = masteredCases.has(node.id);
              const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

              return (
                <g key={node.id}>
                  <path
                    d={`M 490 72 C 490 106, ${centerX} 106, ${centerX} 140`}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                  <line x1={centerX} y1="188" x2={centerX} y2="264" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5 4" />
                  <line x1={centerX} y1="314" x2={centerX} y2="386" stroke="#FF8C1A" strokeWidth="2.5" />

                  <g transform={`translate(${x}, 140)`}>
                    <rect width={colW} height="48" rx="13" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.6" />
                    <text x={colW / 2} y="29" textAnchor="middle" fill="#1E2A8A" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11">
                      {trunc(node.syndrome, 21)}
                    </text>
                  </g>

                  <g transform={`translate(${x}, 264)`}>
                    <rect width={colW} height="50" rx="13" fill="#FFF7ED" stroke="#FB923C" strokeWidth="1.8" />
                    <text x={colW / 2} y="29" textAnchor="middle" fill="#9A3412" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10.5">
                      {trunc(node.buzzword, 23)}
                    </text>
                  </g>

                  <g
                    transform={`translate(${x}, 386)`}
                    onClick={() => onSelectCase(node.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      width={colW}
                      height="60"
                      rx="14"
                      fill={isSelected ? '#FF8C1A' : '#1E2A8A'}
                      stroke={isMastered ? '#10B981' : isSelected ? '#C2410C' : '#141C66'}
                      strokeWidth={isMastered ? 3 : 1.8}
                    />
                    <text
                      x={colW / 2}
                      y="26"
                      textAnchor="middle"
                      fill={isSelected ? '#060919' : '#FFFFFF'}
                      fontFamily="Inter, sans-serif"
                      fontWeight="800"
                      fontSize="11"
                    >
                      {trunc(node.diagnosis, 21)}
                    </text>
                    <text
                      x={colW / 2}
                      y="44"
                      textAnchor="middle"
                      fill={isSelected ? '#1E293B' : '#FDBA74'}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="700"
                      fontSize="9.5"
                    >
                      {isMastered ? 'MASTERED' : node.mediaBadge ? `${node.mediaBadge} · OPEN →` : 'OPEN TOPIC →'}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-2 bg-white/90 dark:bg-navy-900/90 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Click any node in row 04 to open full notes, clinical figures &amp; high-yield pearls.</span>
        <span className="font-mono font-semibold text-navy-DEFAULT dark:text-orange-DEFAULT">
          {`${currentSys.title} · ${currentChapter?.title || ''}`}
        </span>
      </div>
    </div>
  );
}

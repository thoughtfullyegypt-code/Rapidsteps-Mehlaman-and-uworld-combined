import React, { useState, useEffect } from 'react';
import { ATLAS_MANIFEST } from '@/lib/atlas-data';
import ScrollStrip from '@/components/ScrollStrip';
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

  // Include all topics in the chapter (no arbitrary 5-topic cutoff)
  const mapNodes = currentSys.topics
    .filter((t) => !currentChapter || t.chapterId === currentChapter.id)
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

  const count = Math.max(mapNodes.length, 1);
  const canvasWidth = Math.max(960, count * 182 + 140);
  const hubX = canvasWidth / 2 - 180;
  const hubCenterX = canvasWidth / 2;

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-navy-950 overflow-hidden flex flex-col">
      {/* Top 16-System Toolbar */}
      <div className="flex-shrink-0 px-4 py-2 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 z-20">
        <ScrollStrip className="flex-1 min-w-0" innerClassName="gap-1 pb-0.5" ariaLabel="Select organ system">
          {ATLAS_MANIFEST.systems.map((sys) => (
            <button
              key={sys.systemId}
              type="button"
              onClick={() => setSelectedSystem(sys.systemId)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1.5',
                selectedSystem === sys.systemId
                  ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              <SystemIcon systemId={sys.systemId} size={13} />
              <span>{sys.short}</span>
            </button>
          ))}
        </ScrollStrip>

        <div className="flex items-center gap-1 flex-shrink-0 bg-slate-100 dark:bg-navy-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 font-bold"
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
            className="w-6 h-6 flex items-center justify-center rounded text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 h-6 flex items-center justify-center rounded text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 text-xs font-bold"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Chapter Sub-Bar */}
      {currentSys.chapters.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1.5 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-white/10 flex items-center gap-1.5 z-10">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1 whitespace-nowrap">
            Chapter ({mapNodes.length} topics):
          </span>
          <ScrollStrip className="flex-1 min-w-0" innerClassName="gap-1" ariaLabel="Select chapter">
            {currentSys.chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChapterId(ch.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors',
                  currentChapter?.id === ch.id
                    ? 'bg-orange-DEFAULT text-navy-950'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
                )}
              >
                {ch.num} {ch.short}
              </button>
            ))}
          </ScrollStrip>
        </div>
      )}

      {/* Main Spatial Mind Map Canvas (Horizontally scrollable for large chapters) */}
      <div className="flex-1 w-full overflow-auto p-6">
        <div
          className="transition-transform duration-200 origin-top-left mx-auto"
          style={{ transform: `scale(${zoom})`, width: `${canvasWidth}px` }}
        >
          <svg
            viewBox={`0 0 ${canvasWidth} 500`}
            style={{ width: `${canvasWidth}px`, height: '470px' }}
            className="max-w-none"
            role="img"
            aria-label={`${currentSys.title} diagnostic map`}
          >
            <defs>
              <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#CBD5E1" strokeOpacity="0.35" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={canvasWidth} height="500" rx="20" fill="url(#map-grid)" />

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

            <g transform={`translate(${hubX}, 18)`}>
              <rect width="360" height="54" rx="14" fill="#1E2A8A" stroke="#141C66" strokeWidth="2" />
              <text x="180" y="28" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="13.5">
                {`${currentSys.short} · Ch ${currentChapter?.num || '01'}: ${currentChapter?.short || currentSys.title}`}
              </text>
              <text x="180" y="44" textAnchor="middle" fill="#FDBA74" fontFamily="JetBrains Mono, monospace" fontWeight="600" fontSize="10">
                {`${mapNodes.length} chapter topics · ${currentSys.stats.totalImages} figures · ${currentSys.stats.rapidFireQAs} Q&As`}
              </text>
            </g>

            {mapNodes.map((node, idx) => {
              const usableWidth = canvasWidth - 135;
              const spacing = usableWidth / count;
              const centerX = 115 + spacing * idx + spacing / 2;
              const colW = Math.min(172, spacing - 12);
              const x = centerX - colW / 2;
              const isSelected = selectedCaseId === node.id;
              const isMastered = masteredCases.has(node.id);
              const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

              return (
                <g key={node.id}>
                  <path
                    d={`M ${hubCenterX} 72 C ${hubCenterX} 106, ${centerX} 106, ${centerX} 140`}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.8"
                  />
                  <line x1={centerX} y1="188" x2={centerX} y2="264" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="5 4" />
                  <line x1={centerX} y1="314" x2={centerX} y2="386" stroke="#FF8C1A" strokeWidth="2.2" />

                  <g transform={`translate(${x}, 140)`}>
                    <rect width={colW} height="48" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
                    <text x={colW / 2} y="29" textAnchor="middle" fill="#1E2A8A" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11">
                      {trunc(node.syndrome, 21)}
                    </text>
                  </g>

                  <g transform={`translate(${x}, 264)`}>
                    <rect width={colW} height="50" rx="12" fill="#FFF7ED" stroke="#FB923C" strokeWidth="1.5" />
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
                      rx="12"
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

      <div className="flex-shrink-0 px-4 py-1.5 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Click any diagnosis node in row 04 to open full notes, figures &amp; pearls. Scroll horizontally for wide chapters.</span>
        <span className="font-mono font-semibold text-navy-DEFAULT dark:text-orange-DEFAULT">
          {`${currentSys.title} · ${currentChapter?.title || ''} (${mapNodes.length} topics)`}
        </span>
      </div>
    </div>
  );
}

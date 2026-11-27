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
    <div className="relative w-full h-full bg-[#F7F8FA] dark:bg-[#050814] overflow-hidden flex flex-col">
      {/* Top 16-System Toolbar */}
      <div className="flex-shrink-0 px-4 py-2 bg-white dark:bg-[#0B1120] border-b border-[#E2E6EE] dark:border-white/[0.08] flex items-center justify-between gap-3 z-20">
        <div className="rs-pill-strip flex items-center gap-1 pb-0.5 flex-1">
          {ATLAS_MANIFEST.systems.map((sys) => (
            <button
              key={sys.systemId}
              type="button"
              onClick={() => setSelectedSystem(sys.systemId)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors duration-150 whitespace-nowrap inline-flex items-center gap-1.5',
                selectedSystem === sys.systemId
                  ? 'bg-[#16236E] dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                  : 'text-[#475569] dark:text-slate-300 hover:bg-[#F1F3F7] dark:hover:bg-white/10'
              )}
            >
              <SystemIcon systemId={sys.systemId} size={13} />
              <span>{sys.short}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 bg-[#F1F3F7] dark:bg-[#111B33] p-0.5 rounded-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-6 h-6 flex items-center justify-center rounded text-[#0D1321] dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 font-bold"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-[13px] font-semibold px-1.5 text-[#475569] dark:text-slate-300 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-6 h-6 flex items-center justify-center rounded text-[#0D1321] dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 h-6 flex items-center justify-center rounded text-[#0D1321] dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 text-[13px] font-semibold"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Chapter Sub-Bar */}
      {currentSys.chapters.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1.5 bg-[#F7F8FA] dark:bg-[#050814] border-b border-[#E2E6EE] dark:border-white/[0.08] flex items-center gap-2 z-10">
          <span className="text-[13px] font-medium text-[#475569] dark:text-slate-400 mr-1 whitespace-nowrap tabular-nums">
            Chapter ({mapNodes.length} topics):
          </span>
          <div className="rs-pill-strip flex items-center gap-1 flex-1">
            {currentSys.chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChapterId(ch.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[13px] font-semibold whitespace-nowrap transition-colors duration-150',
                  currentChapter?.id === ch.id
                    ? 'bg-orange-DEFAULT text-navy-950'
                    : 'bg-white dark:bg-[#0B1120] text-[#475569] dark:text-slate-300 border border-[#E2E6EE] dark:border-white/[0.08] hover:border-[#CBD2DF]'
                )}
              >
                {ch.num} {ch.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Spatial Mind Map Canvas */}
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
              <pattern id="map-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="11" cy="11" r="1.15" fill="#94A3B8" fillOpacity="0.34" />
              </pattern>
            </defs>
            <rect width={canvasWidth} height="500" rx="16" fill="url(#map-grid)" />

            {[
              { y: 48, label: '1 · System' },
              { y: 168, label: '2 · Chapter' },
              { y: 292, label: '3 · Key clue' },
              { y: 416, label: '4 · Topic / Dx' },
            ].map((lane) => (
              <text
                key={lane.label}
                x="16"
                y={lane.y}
                fill="#526074"
                fontSize="11"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                {lane.label}
              </text>
            ))}

            <g transform={`translate(${hubX}, 18)`}>
              <rect width="360" height="54" rx="12" fill="#16236E" stroke="#0F1854" strokeWidth="1.5" />
              <text x="180" y="28" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="13.5">
                {`${currentSys.short} · Ch ${currentChapter?.num || '01'}: ${currentChapter?.short || currentSys.title}`}
              </text>
              <text x="180" y="44" textAnchor="middle" fill="#FFD29D" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11">
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
                    strokeWidth="1.6"
                  />
                  <line x1={centerX} y1="188" x2={centerX} y2="264" stroke="#CBD2DF" strokeWidth="1.6" strokeDasharray="4 4" />
                  <line x1={centerX} y1="314" x2={centerX} y2="386" stroke="#FF8C1A" strokeWidth="2" />

                  <g transform={`translate(${x}, 140)`}>
                    <rect width={colW} height="48" rx="10" fill="#EEF2FF" stroke="#4F6EF7" strokeWidth="1.25" />
                    <text x={colW / 2} y="29" textAnchor="middle" fill="#16236E" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11.5">
                      {trunc(node.syndrome, 21)}
                    </text>
                  </g>

                  <g transform={`translate(${x}, 264)`}>
                    <rect width={colW} height="50" rx="10" fill="#FFF4E5" stroke="#FF8C1A" strokeWidth="1.25" />
                    <text x={colW / 2} y="29" textAnchor="middle" fill="#0D1321" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11">
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
                      rx="10"
                      fill={isSelected ? '#FF8C1A' : '#16236E'}
                      stroke={isMastered ? '#10B981' : isSelected ? '#C2550A' : '#0F1854'}
                      strokeWidth={isMastered ? 2.5 : 1.5}
                    />
                    <text
                      x={colW / 2}
                      y="26"
                      textAnchor="middle"
                      fill={isSelected ? '#050814' : '#FFFFFF'}
                      fontFamily="Inter, sans-serif"
                      fontWeight="700"
                      fontSize="11.5"
                    >
                      {trunc(node.diagnosis, 21)}
                    </text>
                    <text
                      x={colW / 2}
                      y="44"
                      textAnchor="middle"
                      fill={isSelected ? '#0D1321' : '#FFD29D'}
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                      fontSize="10.5"
                    >
                      {isMastered ? 'Mastered' : node.mediaBadge ? `${node.mediaBadge} · Open →` : 'Open topic →'}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-2 bg-white dark:bg-[#0B1120] border-t border-[#E2E6EE] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#475569] dark:text-slate-400">
        <span>Click any diagnosis node in row 4 to open full notes, figures &amp; pearls. Scroll horizontally for wide chapters.</span>
        <span className="font-semibold text-[#16236E] dark:text-orange-DEFAULT tabular-nums">
          {`${currentSys.title} · ${currentChapter?.title || ''} (${mapNodes.length} topics)`}
        </span>
      </div>
    </div>
  );
}

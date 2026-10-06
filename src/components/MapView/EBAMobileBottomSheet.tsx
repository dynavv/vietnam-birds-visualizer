import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronDown,
  Trees,
  Compass,
} from 'lucide-react';
import type { EBARegion, BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';

export type SheetSnapPoint = 'peek' | 'half' | 'full';

export interface EBAMobileBottomSheetProps {
  className?: string;
  regions: EBARegion[];
  allSpecies?: BirdSpecies[];
  selectedRegionId: string | null;
  selectedSpecies?: BirdSpecies | null;
  onSelectRegion: (region: EBARegion) => void;
  onSelectSpecies?: (species: BirdSpecies) => void;
  onResetOverview?: () => void;
  snapPoint?: SheetSnapPoint;
  onSnapChange?: (snap: SheetSnapPoint) => void;
}

export const EBAMobileBottomSheet: React.FC<EBAMobileBottomSheetProps> = ({
  className = '',
  regions,
  allSpecies: propAllSpecies,
  selectedRegionId,
  selectedSpecies: _selectedSpecies,
  onSelectRegion,
  onSelectSpecies,
  snapPoint: controlledSnapPoint,
  onSnapChange,
}) => {
  // Snap point state: 'peek' (48px floating selector), 'half' (52vh), 'full' (84vh)
  const [internalSnapPoint, setInternalSnapPoint] = useState<SheetSnapPoint>(controlledSnapPoint || 'peek');
  const snapPoint = controlledSnapPoint !== undefined ? controlledSnapPoint : internalSnapPoint;

  const updateSnapPoint = (newSnap: SheetSnapPoint | ((prev: SheetSnapPoint) => SheetSnapPoint)) => {
    const next = typeof newSnap === 'function' ? newSnap(snapPoint) : newSnap;
    setInternalSnapPoint(next);
    onSnapChange?.(next);
  };

  // Touch gesture tracking for smooth mobile drag
  const touchStartY = useRef<number | null>(null);

  // Access taxonomy context if propAllSpecies is not provided
  let contextSpeciesList: BirdSpecies[] = [];
  try {
    const taxonomy = useTaxonomy();
    if (taxonomy?.allSpecies) {
      contextSpeciesList = taxonomy.allSpecies;
    }
  } catch {
    // Graceful fallback when rendered in isolated test environments
  }

  const effectiveSpeciesList = propAllSpecies || contextSpeciesList;

  const speciesMap = useMemo(() => {
    const map = new Map<string, BirdSpecies>();
    effectiveSpeciesList.forEach(sp => {
      map.set(sp.id, sp);
    });
    return map;
  }, [effectiveSpeciesList]);

  const selectedRegion = useMemo(() => {
    return regions.find(r => r.id === selectedRegionId) || null;
  }, [regions, selectedRegionId]);

  // Handle touch events on drag handle bar with stopPropagation to isolate Leaflet map
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - touchStartY.current;
    touchStartY.current = null;

    // Threshold: 40px delta for snap transitions
    if (Math.abs(deltaY) < 40) return;

    if (deltaY < -40) {
      // Swiping up -> expand
      updateSnapPoint(prev => {
        if (prev === 'peek') return 'half';
        if (prev === 'half') return 'full';
        return 'full';
      });
    } else if (deltaY > 40) {
      // Swiping down -> collapse
      updateSnapPoint(prev => {
        if (prev === 'full') return 'half';
        if (prev === 'half') return 'peek';
        return 'peek';
      });
    }
  };

  // Height class mapping according to specification
  const snapHeightClass = {
    peek: 'h-[48px] min-h-[48px]',
    half: 'h-[52dvh] max-h-[52dvh]',
    full: 'h-[min(84dvh,calc(100dvh-72px))] max-h-[min(84dvh,calc(100dvh-72px))]'
  }[snapPoint];

  return (
    <div
      className={`absolute left-3 right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-30 transition-[height,max-height] duration-300 ease-in-out bg-paper-100/95 backdrop-blur-xl border border-paper-border/80 shadow-2xl rounded-2xl flex flex-col pointer-events-auto md:hidden overflow-hidden ${snapHeightClass} ${className}`}
      data-testid="eba-mobile-bottom-sheet"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* 1. Header with Drag Handle & EBA Title */}
      <div
        className={`w-full select-none touch-none shrink-0 ${
          snapPoint === 'peek'
            ? 'h-full px-3 flex items-center justify-between cursor-pointer'
            : 'flex flex-col items-center pt-1.5 pb-1 px-3 border-b border-paper-border/50'
        }`}
        data-testid="bottom-sheet-handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (snapPoint === 'peek') updateSnapPoint('half');
          else if (snapPoint === 'half') updateSnapPoint('peek');
        }}
      >
        {/* Drag Handle Bar (only in half / full mode) */}
        {snapPoint !== 'peek' && (
          <div className="w-10 h-1 rounded-full bg-natural-moss/40 mb-1.5 cursor-pointer active:scale-95 transition-all" />
        )}

        {/* EBA Region Title & Action Controls Row */}
        <div className={`w-full flex items-center justify-between gap-2 ${snapPoint === 'peek' ? 'h-full' : 'min-h-[32px]'}`}>
          {/* Left: EBA Region Indicator (Clickable to toggle half) */}
          <div
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (snapPoint === 'peek') updateSnapPoint('half');
              else updateSnapPoint('peek');
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-natural-moss/15 text-natural-forest flex items-center justify-center shrink-0 border border-natural-moss/30 shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              {snapPoint === 'peek' && selectedRegion ? (
                <>
                  <span className="font-serif font-bold text-xs sm:text-sm text-ink-900 truncate">
                    {selectedRegion.vietnameseName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-natural-moss/10 text-natural-forest border border-natural-moss/20 shrink-0">
                    {selectedRegion.keySpeciesIds.length} loài
                  </span>
                </>
              ) : (
                <span className="font-serif font-bold text-xs sm:text-sm text-ink-900 truncate">
                  7 Vùng Chim Đặc Hữu (EBA)
                </span>
              )}
            </div>
          </div>

          {/* Right Action: ChevronDown in peek (expand), or ChevronDown in half/full (collapse to peek) */}
          <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
            {snapPoint === 'peek' ? (
              <button
                type="button"
                data-testid="bottom-sheet-expand-to-half"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSnapPoint('half');
                }}
                aria-label="Mở rộng danh sách vùng EBA"
                title="Mở rộng danh sách vùng EBA"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-paper-200/90 hover:bg-paper-300 text-ink-700 transition-colors shadow-2xs cursor-pointer border border-paper-border/60"
              >
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                data-testid="bottom-sheet-close-to-peek"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSnapPoint('peek');
                }}
                aria-label="Đóng về xem bản đồ"
                title="Đóng về xem bản đồ"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-paper-200/90 hover:bg-paper-300 text-ink-700 transition-colors shadow-2xs cursor-pointer border border-paper-border/60"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Independent Scrollable EBA Regions List */}
      {snapPoint !== 'peek' && (
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3 space-y-2.5">
          <div className="space-y-2">
            {regions.map((region, index) => {
              const isSelected = selectedRegionId === region.id;
              const keySpeciesList = region.keySpeciesIds
                .map(id => speciesMap.get(id))
                .filter((sp): sp is BirdSpecies => Boolean(sp));

              return (
                <div
                  key={region.id}
                  data-testid={`mobile-eba-region-card-${region.id}`}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'bg-paper-50 border-natural-amber/70 ring-1 ring-natural-amber/40 shadow-sm'
                      : 'bg-paper-200/50 border-paper-border hover:bg-paper-200/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRegion(region);
                    }}
                    className="w-full p-2.5 flex items-start justify-between gap-2 text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-mono font-bold mt-0.5 ${
                          isSelected
                            ? 'bg-natural-amber text-paper-50'
                            : 'bg-paper-300 text-ink-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-ink-900 leading-snug">
                          {region.vietnameseName}
                        </h4>
                        <p className="text-[11px] text-ink-500 font-sans italic leading-snug">
                          {region.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      {region.code && (
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-natural-amber/15 text-natural-amber border border-natural-amber/30">
                          {region.code}
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-paper-100 text-ink-600 border border-paper-border">
                        {region.keySpeciesIds.length} loài
                      </span>
                    </div>
                  </button>

                  {/* Extended Details (Habitats, Description & Species Chips in Full mode or Selected) */}
                  {(snapPoint === 'full' || isSelected) && (
                    <div className="px-2.5 pb-2.5 pt-1 border-t border-paper-border/60 bg-paper-100/60 space-y-2 text-xs">
                      <p className="text-ink-700 leading-relaxed text-[11.5px] font-sans">
                        {region.description}
                      </p>

                      {region.habitats && region.habitats.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Trees className="w-3 h-3 text-natural-moss" />
                            <span>Sinh cảnh chính:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {region.habitats.map((h, hIdx) => (
                              <span
                                key={hIdx}
                                className="px-1.5 py-0.5 bg-paper-200/90 text-[10px] text-ink-700 rounded border border-paper-border"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Species Chips */}
                      {keySpeciesList.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span>Loài đặc hữu &amp; tiêu biểu:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {keySpeciesList.map(sp => (
                              <button
                                key={sp.id}
                                type="button"
                                onClick={() => {
                                  onSelectSpecies?.(sp);
                                  updateSnapPoint('peek');
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-paper-50 hover:bg-natural-moss hover:text-paper-50 text-ink-800 border border-paper-border text-[11px] font-medium transition-colors shadow-2xs"
                              >
                                <span>{sp.vietnameseName}</span>
                                <span className="font-mono text-[9px] opacity-75 font-bold">
                                  ({sp.conservation.iucn})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EBAMobileBottomSheet);

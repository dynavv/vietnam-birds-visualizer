import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Trees,
  Layers,
  ZoomIn,
  Sparkles,
  Bird
} from 'lucide-react';
import type { EBARegion, BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';

export interface EBARegionLegendProps {
  className?: string;
  selectedRegionId?: string | null;
  onSelectRegion?: (region: EBARegion) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const EBARegionLegendComponent: React.FC<EBARegionLegendProps> = ({
  className = '',
  selectedRegionId: controlledSelectedRegionId,
  onSelectRegion,
  isCollapsed: controlledCollapsed,
  onToggleCollapse
}) => {
  const { ebaRegions, allSpecies, selectedSpecies, selectSpecies } = useTaxonomy();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalSelectedRegionId, setInternalSelectedRegionId] = useState<string | null>(null);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(prev => !prev));

  // Determine active region
  const activeRegionId = controlledSelectedRegionId !== undefined
    ? controlledSelectedRegionId
    : internalSelectedRegionId;

  // Species map for quick lookup
  const speciesMap = useMemo(() => {
    const map = new Map<string, BirdSpecies>();
    allSpecies.forEach(sp => {
      map.set(sp.id, sp);
    });
    return map;
  }, [allSpecies]);

  // Handle clicking on an EBA region
  const handleRegionClick = (region: EBARegion) => {
    const nextId = activeRegionId === region.id ? null : region.id;
    setInternalSelectedRegionId(nextId);
    if (onSelectRegion) {
      onSelectRegion(region);
    }
  };

  // Check if current selected species belongs to a region
  const doesSelectedSpeciesBelongTo = (region: EBARegion): boolean => {
    if (!selectedSpecies) return false;
    if (region.keySpeciesIds.includes(selectedSpecies.id)) return true;
    const regionNameLower = region.name.toLowerCase();
    const regionVnLower = region.vietnameseName.toLowerCase();
    const speciesEbaLower = (selectedSpecies.distribution.ebaRegion || '').toLowerCase();
    return speciesEbaLower.includes(regionNameLower) ||
      speciesEbaLower.includes(regionVnLower) ||
      regionVnLower.includes(speciesEbaLower);
  };

  return (
    <div
      className={`bg-paper-100/90 backdrop-blur-xl border border-paper-border/80 rounded-2xl shadow-2xl shadow-ink-900/10 ring-1 ring-black/[0.04] overflow-hidden transition-all duration-300 w-full flex flex-col max-h-full ${className}`}
      data-testid="eba-region-legend"
      aria-label="Danh mục 6 Vùng Chim Đặc hữu Việt Nam"
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between border-b border-paper-border/70 bg-paper-200/50 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-natural-moss/20 to-natural-forest/15 text-natural-forest flex items-center justify-center flex-shrink-0 border border-natural-moss/30 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-ink-900 leading-tight truncate tracking-tight">
              Vùng Chim Đặc hữu Việt Nam
            </h3>
            <p className="text-[10px] text-ink-500 font-mono font-medium uppercase tracking-wider">
              6 EBAs • BirdLife International
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Mở rộng bảng vùng đặc hữu' : 'Thu gọn bảng vùng đặc hữu'}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-paper-100 hover:bg-paper-300/70 text-ink-600 border border-paper-border/80 transition-all flex-shrink-0 cursor-pointer shadow-2xs"
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Accordion Region List */}
      <div className={`transition-all duration-300 flex-1 overflow-hidden flex flex-col ${isCollapsed ? 'hidden' : 'flex'}`}>
        <div className="p-3 sm:p-3.5 space-y-2 overflow-y-auto flex-1 scrollbar-thin">
          
          <p className="text-[11.5px] text-ink-600 leading-relaxed font-sans px-0.5">
            Chọn một vùng sinh thái để phóng to bản đồ và khám phá các loài chim đặc hữu, quý hiếm phân bố tại khu vực đó:
          </p>

          <div className="space-y-2">
            {ebaRegions.map((region, index) => {
              const isExpanded = activeRegionId === region.id;
              const hasCurrentSpecies = doesSelectedSpeciesBelongTo(region);
              const keySpeciesList = region.keySpeciesIds
                .map(id => speciesMap.get(id))
                .filter((sp): sp is BirdSpecies => Boolean(sp));

              return (
                <div
                  key={region.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-paper-50 border-natural-amber/60 shadow-sm'
                      : hasCurrentSpecies
                      ? 'bg-natural-amber/5 border-natural-amber/30 hover:border-natural-amber/50'
                      : 'bg-paper-200/40 border-paper-border hover:bg-paper-200/70 hover:border-paper-300'
                  }`}
                  data-testid={`eba-region-card-${region.id}`}
                >
                  {/* Region Summary Header */}
                  <button
                    type="button"
                    onClick={() => handleRegionClick(region)}
                    className="w-full px-3.5 py-2.5 flex items-start justify-between gap-2.5 text-left focus:outline-none focus:bg-paper-200/60 transition-colors cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Region Index Badge */}
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mt-0.5 ${
                        isExpanded
                          ? 'bg-natural-amber text-paper-50'
                          : hasCurrentSpecies
                          ? 'bg-natural-amber/20 text-natural-amber font-semibold'
                          : 'bg-paper-300 text-ink-700'
                      }`}>
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-serif font-bold text-sm text-ink-900 leading-snug">
                            {region.vietnameseName}
                          </h4>
                          {region.code && (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold uppercase bg-natural-amber/15 text-natural-amber border border-natural-amber/30">
                              {region.code}
                            </span>
                          )}
                          {hasCurrentSpecies && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-natural-moss/15 text-natural-forest border border-natural-moss/25">
                              <Sparkles className="w-2.5 h-2.5 text-natural-ochre" />
                              Loài đang chọn
                            </span>
                          )}
                        </div>
                        
                        <p className="text-[11px] text-ink-500 font-sans italic truncate">
                          {region.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-paper-100 text-ink-600 border border-paper-border">
                        {region.keySpeciesIds.length} loài
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-400 transform transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-natural-amber' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Region Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-paper-border/60 bg-paper-100/60 text-xs">
                      {/* Description */}
                      <p className="text-ink-700 leading-relaxed font-sans pt-1">
                        {region.description}
                      </p>

                      {/* Coordinates & Habitat Highlights */}
                      <div className="bg-paper-50 rounded-lg p-2.5 border border-paper-border/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-ink-600 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-natural-terracotta" />
                            Tọa độ: {region.coordinates[0]}°N, {region.coordinates[1]}°E
                          </span>
                          <span className="text-ink-500">
                            Zoom: {region.zoomLevel}x
                          </span>
                        </div>

                        {region.habitats && region.habitats.length > 0 && (
                          <div className="pt-1">
                            <div className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Trees className="w-3 h-3 text-natural-moss" />
                              Sinh cảnh chính:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {region.habitats.map((h, hIdx) => (
                                <span
                                  key={hIdx}
                                  className="inline-block px-1.5 py-0.5 bg-paper-200/80 text-[10px] text-ink-700 rounded border border-paper-border"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Key Representative Bird Species */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-ink-800">
                          <span>Các loài chim tiêu biểu:</span>
                          <span className="text-[10px] font-sans text-ink-500 font-normal">
                            Nhấp để xem chi tiết
                          </span>
                        </div>

                        <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                          {keySpeciesList.map(species => {
                            const isCurrent = selectedSpecies?.id === species.id;

                            return (
                              <button
                                key={species.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectSpecies(species.id);
                                }}
                                className={`w-full p-2 rounded-lg flex items-center justify-between gap-2 text-left transition-all border ${
                                  isCurrent
                                    ? 'bg-natural-moss text-paper-50 border-natural-forest shadow-sm'
                                    : 'bg-paper-50 hover:bg-paper-200/80 text-ink-900 border-paper-border hover:border-natural-moss/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {/* Small Thumbnail */}
                                  <div className="w-8 h-8 rounded-md overflow-hidden bg-paper-300 flex-shrink-0 border border-paper-border">
                                    {species.illustration?.imageUrl ? (
                                      <img
                                        src={species.illustration.imageUrl}
                                        alt={species.vietnameseName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-ink-400 font-mono text-[9px]">
                                        AVI
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className={`font-serif font-semibold text-xs leading-tight truncate ${
                                        isCurrent ? 'text-paper-50' : 'text-ink-900'
                                      }`}>
                                        {species.vietnameseName}
                                      </p>
                                      {species.isEndemic && (
                                        <span title="Loài đặc hữu Việt Nam" className="inline-flex items-center flex-shrink-0">
                                          <Bird className="w-3.5 h-3.5 text-amber-500 fill-amber-400/40" />
                                        </span>
                                      )}
                                    </div>
                                    <p className={`font-serif italic text-[11px] truncate ${
                                      isCurrent ? 'text-paper-200/90' : 'text-natural-forest'
                                    }`}>
                                      {species.scientificName}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                    species.conservation.iucn === 'CR' || species.conservation.iucn === 'EN'
                                      ? isCurrent ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
                                      : isCurrent ? 'bg-paper-100/20 text-paper-50' : 'bg-paper-200 text-ink-700'
                                  }`}>
                                    {species.conservation.iucn}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Button: Zoom to region */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectRegion) onSelectRegion(region);
                        }}
                        className="w-full mt-2 py-1.5 px-3 rounded-lg bg-natural-moss/10 hover:bg-natural-moss hover:text-paper-50 text-natural-forest font-semibold text-xs border border-natural-moss/30 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Phóng to vùng {region.vietnameseName}</span>
                      </button>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export const EBARegionLegend = React.memo(EBARegionLegendComponent);
export default EBARegionLegend;


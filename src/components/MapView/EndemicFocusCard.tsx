import React, { useState } from 'react';
import {
  Compass,
  TreePine,
  Mountain,
  MapPin,
  Trees,
  Dices,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Feather,
  Info
} from 'lucide-react';
import type { BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { ConservationBadge } from '../Common/ConservationBadge';
import { EndemicBadge } from '../Common/EndemicBadge';
import { AudioVoiceButton } from '../Common/AudioVoiceButton';
import { BirdPlateImage } from '../Common/BirdPlateImage';

export interface EndemicFocusCardProps {
  species?: BirdSpecies | null;
  className?: string;
  onViewSunburst?: () => void;
  onViewCurator?: () => void;
  onSelectRandom?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const EndemicFocusCard: React.FC<EndemicFocusCardProps> = ({
  species: propSpecies,
  className = '',
  onViewSunburst,
  onViewCurator,
  onSelectRandom,
  isCollapsed: controlledCollapsed,
  onToggleCollapse
}) => {
  const {
    selectedSpecies: contextSpecies,
    setActiveView,
    selectRandomEndemic
  } = useTaxonomy();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(prev => !prev));

  const species = propSpecies !== undefined ? propSpecies : contextSpecies;

  const handleRandomClick = () => {
    setDiceRolling(true);
    if (onSelectRandom) {
      onSelectRandom();
    } else {
      selectRandomEndemic();
    }
    setTimeout(() => {
      setDiceRolling(false);
    }, 450);
  };

  const handleSwitchToSunburst = () => {
    if (onViewSunburst) {
      onViewSunburst();
    } else {
      setActiveView('sunburst');
    }
  };

  const handleSwitchToCurator = () => {
    if (onViewCurator) {
      onViewCurator();
    } else {
      setActiveView('curator');
    }
  };

  if (!species) {
    return (
      <div
        className={`bg-paper-100/95 backdrop-blur-md border border-paper-border rounded-2xl p-6 shadow-natural-lg max-w-md w-full ${className}`}
        data-testid="endemic-focus-card-empty"
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 mx-auto bg-natural-moss/10 rounded-full flex items-center justify-center text-natural-moss border border-natural-moss/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-serif text-lg font-bold text-ink-900">
            Khám phá Vùng Chim Đặc Hữu
          </h3>
          <p className="text-xs text-ink-600 max-w-xs mx-auto">
            Nhấp vào một điểm đánh dấu trên bản đồ hoặc bấm nút bên dưới để xem hồ sơ giám tuyển loài đặc hữu.
          </p>
          <button
            type="button"
            onClick={handleRandomClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-natural-moss text-paper-50 hover:bg-natural-forest transition-all text-xs font-semibold shadow-sm"
          >
            <Dices className="w-4 h-4" />
            <span>Khám phá ngẫu nhiên</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <article
      key={species.id}
      className={`bg-paper-100/90 backdrop-blur-xl border border-paper-border/80 rounded-2xl shadow-2xl shadow-ink-900/10 ring-1 ring-black/[0.04] overflow-hidden transition-all duration-300 max-w-sm lg:max-w-md w-full max-h-full flex flex-col animate-in fade-in-50 duration-300 ${className}`}
      data-testid="endemic-focus-card"
      aria-label={`Hồ sơ chi tiết loài ${species.vietnameseName}`}
    >
      {/* Header Bar */}
      <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between border-b border-paper-border/70 bg-paper-200/50 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {species.isEndemic && (
            <EndemicBadge size="sm" />
          )}
          <ConservationBadge
            status={species.conservation.iucn}
            vietnamRedList={species.conservation.vietnamRedList}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleRandomClick}
            aria-label="Đổi loài ngẫu nhiên (R)"
            title="Đổi loài ngẫu nhiên (Phím tắt: R)"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-paper-100 hover:bg-natural-amber/20 text-ink-700 hover:text-natural-amber border border-paper-border/80 transition-all cursor-pointer shadow-2xs"
          >
            <Dices
              className={`w-3.5 h-3.5 transition-transform duration-500 ${
                diceRolling ? 'rotate-180 scale-110 text-natural-amber' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Mở rộng thẻ thông tin' : 'Thu gọn thẻ thông tin'}
            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-paper-100 hover:bg-paper-300/70 text-ink-600 border border-paper-border/80 transition-all flex-shrink-0 cursor-pointer shadow-2xs"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content (collapsible on mobile/toggle) */}
      <div className={`transition-all duration-300 flex-1 min-h-0 ${isCollapsed ? 'hidden' : 'flex flex-col overflow-hidden'}`}>
        <div className="p-3 sm:p-3.5 space-y-2.5 flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
          
          {/* Frameless Modern Artwork Plate Frame — Clickable to open Curator Guide */}
          <div
            onClick={handleSwitchToCurator}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSwitchToCurator();
              }
            }}
            title={`Nhấp để mở Cẩm nang nhận dạng chi tiết của loài ${species.vietnameseName}`}
            aria-label={`Nhấp để xem hồ sơ cẩm nang loài ${species.vietnameseName}`}
            className="relative group rounded-xl overflow-hidden border border-paper-border hover:border-natural-moss/60 bg-paper-200/40 p-1 shadow-inner shrink-0 ring-1 ring-black/[0.03] cursor-pointer transition-all duration-300 active:scale-[0.99]"
            data-testid="specimen-plate-clickable"
          >
            <BirdPlateImage
              species={species}
              aspectRatio="cover"
              className="w-full aspect-[16/10] min-h-[145px] max-h-[180px] rounded-lg"
              imageClassName="group-hover:scale-105 transition-transform duration-500"
            />

            {/* Hover overlay hint */}
            <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-sm text-paper-50 text-[10.5px] font-sans font-medium px-2 py-0.5 rounded-full shadow-md pointer-events-none flex items-center gap-1">
              <span>Mở Cẩm nang</span>
              <span>›</span>
            </div>

            {/* Naturalist Plate Caption */}
            <div className="pt-1.5 px-1 text-center border-t border-paper-border/40 mt-1">
              <p className="text-[10.5px] text-ink-500 font-serif italic truncate">
                {species.illustration.artist || 'iNaturalist & Wildlife Photographers'}
                {species.illustration.sourceBook ? ` — ${species.illustration.sourceBook}` : ''}
              </p>
            </div>
          </div>

          {/* Trilingual Species Title & Taxonomy — Clickable to open Curator Guide */}
          <div className="space-y-1">
            <div
              onClick={handleSwitchToCurator}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSwitchToCurator();
                }
              }}
              title={`Nhấp để mở Cẩm nang nhận dạng loài ${species.vietnameseName}`}
              aria-label={`Nhấp để mở Cẩm nang nhận dạng loài ${species.vietnameseName}`}
              className="group cursor-pointer text-left block focus:outline-none"
              data-testid="species-name-clickable"
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h2 className="font-serif text-2xl font-bold text-ink-900 group-hover:text-natural-forest transition-colors leading-tight tracking-tight flex items-center gap-1.5">
                  <span>{species.vietnameseName}</span>
                  <span className="text-xs text-natural-moss opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    ›
                  </span>
                </h2>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <p className="font-serif italic text-sm sm:text-base font-semibold text-natural-forest group-hover:underline decoration-natural-forest/40 underline-offset-2">
                  {species.scientificName}
                </p>
                <span className="text-ink-400 text-xs">•</span>
                <p className="font-sans text-xs sm:text-sm text-ink-600">
                  {species.englishName}
                </p>
              </div>
            </div>

            {/* Taxonomy Hierarchy Summary */}
            <div className="pt-1 flex items-center gap-1.5 text-xs text-ink-500 font-sans">
              <span className="inline-block px-2 py-0.5 bg-paper-200/80 rounded border border-paper-border font-medium text-[11px] text-ink-700">
                {species.taxonomy.orderVietnamese || `Bộ ${species.taxonomy.order}`}
              </span>
              <span className="text-ink-400">›</span>
              <span className="inline-block px-2 py-0.5 bg-paper-200/80 rounded border border-paper-border font-medium text-[11px] text-ink-700">
                {species.taxonomy.familyVietnamese || `Họ ${species.taxonomy.family}`}
              </span>
            </div>
          </div>

          {/* Natural Voice Audio Button */}
          <div className="pt-1">
            <AudioVoiceButton
              audioInfo={species.audioCall}
              birdName={species.vietnameseName}
              variant="pill"
              size="md"
              className="w-full justify-center shadow-sm"
            />
          </div>

          {/* Morphological Overview Note Box */}
          {species.morphologicalAnalysis?.overview && (
            <div className="bg-paper-50/80 border-l-2 border-natural-ochre border-y border-r border-paper-border/60 rounded-xl p-3 text-xs text-ink-700 shadow-2xs relative">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-natural-moss mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed font-sans text-ink-800 italic">
                  "{species.morphologicalAnalysis.overview}"
                </p>
              </div>
            </div>
          )}

          {/* Habitat, Elevation & Distribution Matrix */}
          <div className="bg-paper-200/40 rounded-xl p-3 border border-paper-border/70 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-ink-800">
              <Mountain className="w-3.5 h-3.5 text-natural-bark flex-shrink-0" />
              <span className="font-semibold text-ink-700">Độ cao sinh sống:</span>
              <span className="font-mono text-ink-900 bg-paper-100/90 px-1.5 py-0.2 rounded border border-paper-border text-[11px]">
                {species.distribution.elevation || 'Chưa ghi nhận'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-ink-800">
              <MapPin className="w-3.5 h-3.5 text-natural-terracotta mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-ink-700">Vùng EBA: </span>
                <span className="text-ink-900 font-medium">{species.distribution.ebaRegion}</span>
              </div>
            </div>

            {species.distribution.locations && species.distribution.locations.length > 0 && (
              <div className="flex items-start gap-2 text-ink-800">
                <Trees className="w-3.5 h-3.5 text-natural-moss mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-ink-700">Địa bàn tiêu biểu: </span>
                  <span className="text-ink-800">{species.distribution.locations.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Habitats Tags */}
            {species.distribution.habitats && species.distribution.habitats.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1">
                {species.distribution.habitats.map((habitat, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 bg-paper-100/90 text-[10.5px] text-ink-700 rounded-md border border-paper-border/80"
                  >
                    {habitat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="pt-0.5 space-y-1.5">
            <button
              type="button"
              onClick={handleSwitchToSunburst}
              className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-paper-200/70 hover:bg-natural-moss hover:text-paper-50 text-ink-900 border border-paper-border/80 hover:border-natural-moss transition-all text-xs font-semibold shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-natural-moss group-hover:text-paper-50 transition-colors" />
                <span>Khám phá trên Cây Phả hệ</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform opacity-70 group-hover:opacity-100" />
            </button>

            <button
              type="button"
              onClick={handleSwitchToCurator}
              className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-paper-200/70 hover:bg-natural-forest hover:text-paper-50 text-ink-900 border border-paper-border/80 hover:border-natural-forest transition-all text-xs font-semibold shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-natural-terracotta group-hover:text-paper-50 transition-colors" />
                <span>Mở Cẩm nang Nhận dạng</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform opacity-70 group-hover:opacity-100" />
            </button>
          </div>

        </div>
      </div>
    </article>
  );
};

export default React.memo(EndemicFocusCard);


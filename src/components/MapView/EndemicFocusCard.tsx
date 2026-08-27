import React, { useState } from 'react';
import {
  Compass,
  TreePine,
  Mountain,
  MapPin,
  Trees,
  Dices,
  Sparkles,
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
  const [imageError, setImageError] = useState(false);
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
      className={`bg-paper-100/95 backdrop-blur-md border border-paper-border rounded-2xl shadow-natural-lg overflow-hidden transition-all duration-300 max-w-md w-full ${className}`}
      data-testid="endemic-focus-card"
      aria-label={`Hồ sơ chi tiết loài ${species.vietnameseName}`}
    >
      {/* Header Bar */}
      <div className="px-4 pt-3.5 pb-2.5 sm:px-5 flex items-center justify-between border-b border-paper-border/60 bg-paper-200/40">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {species.isEndemic && (
            <EndemicBadge size="sm" />
          )}
          <ConservationBadge
            status={species.conservation.iucn}
            vietnamRedList={species.conservation.vietnamRedList}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleRandomClick}
            aria-label="Đổi loài ngẫu nhiên"
            title="Đổi loài ngẫu nhiên (Random Species)"
            className="p-1.5 rounded-lg bg-paper-100 hover:bg-natural-moss/15 text-ink-700 hover:text-natural-moss border border-paper-border transition-all"
          >
            <Dices
              className={`w-4 h-4 transition-transform duration-500 ${
                diceRolling ? 'rotate-180 scale-110 text-natural-moss' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Mở rộng thẻ thông tin' : 'Thu gọn thẻ thông tin'}
            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            className="p-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-600 border border-paper-border transition-all"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content (collapsible on mobile/toggle) */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
          
          {/* Classic Naturalist Artwork Plate Frame */}
          <div className="relative group rounded-xl overflow-hidden border-2 border-paper-300 bg-paper-200/50 p-1.5 shadow-inner">
            <div className="relative w-full h-44 sm:h-52 rounded-lg overflow-hidden bg-paper-300/40 flex items-center justify-center">
              {!imageError && species.illustration.imageUrl ? (
                <img
                  src={species.illustration.imageUrl}
                  alt={`Minh họa khoa học loài ${species.vietnameseName} (${species.scientificName})`}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-ink-500 space-y-2">
                  <Feather className="w-8 h-8 text-natural-moss/60" />
                  <span className="font-serif italic text-xs">Bản họa đồ điểu học lưu trữ</span>
                </div>
              )}

              {/* Naturalist Tag overlay */}
              <div className="absolute top-2 left-2 bg-paper-100/90 backdrop-blur-sm border border-paper-border px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-ink-700 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-natural-ochre" />
                <span>Mẫu vật Điểu học</span>
              </div>
            </div>

            {/* Naturalist Plate Caption */}
            <div className="pt-2 px-1 text-center border-t border-paper-border/50 mt-1">
              <p className="text-[11px] text-ink-600 font-serif italic truncate">
                {species.illustration.artist || 'Naturalist Archives of Indochina'}
                {species.illustration.sourceBook ? ` — ${species.illustration.sourceBook}` : ''}
              </p>
            </div>
          </div>

          {/* Trilingual Species Title & Taxonomy */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h2 className="font-serif text-2xl font-bold text-ink-900 leading-tight tracking-tight">
                {species.vietnameseName}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-serif italic text-sm sm:text-base font-semibold text-natural-forest">
                {species.scientificName}
              </p>
              <span className="text-ink-400 text-xs">•</span>
              <p className="font-sans text-xs sm:text-sm text-ink-600">
                {species.englishName}
              </p>
            </div>

            {/* Taxonomy Hierarchy Summary */}
            <div className="pt-1 flex items-center gap-1.5 text-xs text-ink-500 font-sans">
              <span className="inline-block px-2 py-0.5 bg-paper-200/80 rounded border border-paper-border font-medium text-[11px] text-ink-700">
                Bộ {species.taxonomy.orderVietnamese || species.taxonomy.order}
              </span>
              <span className="text-ink-400">›</span>
              <span className="inline-block px-2 py-0.5 bg-paper-200/80 rounded border border-paper-border font-medium text-[11px] text-ink-700">
                Họ {species.taxonomy.familyVietnamese || species.taxonomy.family}
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
            <div className="bg-paper-50 border border-paper-border rounded-xl p-3 text-xs text-ink-700 shadow-paper-card relative">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-natural-moss mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed font-sans text-ink-800 italic">
                  "{species.morphologicalAnalysis.overview}"
                </p>
              </div>
            </div>
          )}

          {/* Habitat, Elevation & Distribution Matrix */}
          <div className="bg-paper-200/50 rounded-xl p-3.5 border border-paper-border space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-ink-800">
              <Mountain className="w-3.5 h-3.5 text-natural-bark flex-shrink-0" />
              <span className="font-semibold text-ink-700">Độ cao sinh sống:</span>
              <span className="font-mono text-ink-900 bg-paper-100 px-1.5 py-0.2 rounded border border-paper-border">
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
              <div className="pt-1.5 flex flex-wrap gap-1">
                {species.distribution.habitats.map((habitat, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 bg-paper-100 text-[11px] text-ink-700 rounded-md border border-paper-border"
                  >
                    {habitat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Academic Identifiers Quick Links */}
          <div className="flex items-center justify-between gap-1.5 text-[11px] text-ink-600 bg-paper-50 p-2 rounded-lg border border-paper-border">
            <span className="font-semibold text-ink-700">Tra cứu học thuật:</span>
            <div className="flex items-center gap-1.5">
              <a
                href={species.academic?.iucnUrl || `https://www.iucnredlist.org/search?query=${encodeURIComponent(species.scientificName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded bg-paper-200 hover:bg-natural-moss/20 hover:text-natural-moss font-mono text-[10px] transition-colors"
                title="Hồ sơ bảo tồn IUCN Red List"
              >
                IUCN ↗
              </a>
              <a
                href={species.academic?.avibaseId ? `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=&sec=summary&qstr=${encodeURIComponent(species.scientificName)}` : `https://avibase.bsc-eoc.org/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded bg-paper-200 hover:bg-natural-moss/20 hover:text-natural-moss font-mono text-[10px] transition-colors"
                title="Hồ sơ danh lục Avibase"
              >
                Avibase ↗
              </a>
              <a
                href={species.academic?.gbifTaxonKey || `https://www.gbif.org/species/search?q=${encodeURIComponent(species.scientificName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded bg-paper-200 hover:bg-natural-moss/20 hover:text-natural-moss font-mono text-[10px] transition-colors"
                title="Bản đồ ghi nhận mẫu GBIF"
              >
                GBIF ↗
              </a>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={handleSwitchToSunburst}
              className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-paper-200/80 hover:bg-natural-moss hover:text-paper-50 text-ink-900 border border-paper-border hover:border-natural-moss transition-all text-xs font-semibold shadow-sm"
            >
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-natural-moss group-hover:text-paper-50 transition-colors" />
                <span>🌐 Khám phá trên Bánh xe Phân loại học</span>
              </div>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleSwitchToCurator}
              className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-paper-200/80 hover:bg-natural-moss hover:text-paper-50 text-ink-900 border border-paper-border hover:border-natural-moss transition-all text-xs font-semibold shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-natural-terracotta group-hover:text-paper-50 transition-colors" />
                <span>📜 Xem phân tích hình thái học</span>
              </div>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </article>
  );
};

export default EndemicFocusCard;

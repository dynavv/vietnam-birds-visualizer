import React from 'react';
import {
  Feather,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
  HelpCircle,
  Eye
} from 'lucide-react';
import type { BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { ConservationBadge } from '../Common/ConservationBadge';
import { EndemicBadge } from '../Common/EndemicBadge';
import { AudioVoiceButton } from '../Common/AudioVoiceButton';
import { BirdPlateImage } from '../Common/BirdPlateImage';
import { getIucnUrl, getAvibaseUrl, getGbifUrl } from '../../utils/linkGenerators';

export interface QuickSpecimenPanelProps {
  species?: BirdSpecies | null;
  className?: string;
  onViewCurator?: () => void;
  isHoverPreview?: boolean;
}

export const QuickSpecimenPanel: React.FC<QuickSpecimenPanelProps> = ({
  species: propSpecies,
  className = '',
  onViewCurator,
  isHoverPreview = false
}) => {
  const { selectedSpecies: contextSpecies, setActiveView } = useTaxonomy();
  const species = propSpecies !== undefined ? propSpecies : contextSpecies;

  const handleSwitchToCurator = () => {
    if (onViewCurator) {
      onViewCurator();
    } else {
      setActiveView('curator');
    }
  };

  if (!species) {
    return (
      <aside
        className={`bg-paper-100/95 backdrop-blur-md border border-paper-border rounded-2xl p-6 shadow-paper-card flex flex-col items-center justify-center text-center space-y-4 ${className}`}
        data-testid="quick-specimen-panel-empty"
        aria-label="Thẻ mẫu vật trống"
      >
        <div className="w-14 h-14 rounded-full bg-natural-moss/10 border border-natural-moss/20 flex items-center justify-center text-natural-moss">
          <Layers className="w-7 h-7 animate-pulse" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h3 className="font-serif text-lg font-bold text-ink-900">
            Khám phá Cây Phân Loại
          </h3>
          <p className="text-xs text-ink-600 leading-relaxed">
            Rê chuột vào các nan quạt trên bánh xe hoặc nhấp chọn một loài chim để xem hồ sơ giám tuyển &amp; giải phẫu hình thái học tức thì.
          </p>
        </div>
        <div className="p-3 bg-paper-200/60 rounded-xl border border-paper-border text-[11px] text-ink-500 font-sans flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-natural-terracotta flex-shrink-0" />
          <span>Mẹo: Nhấp vào Bộ/Họ/Chi để phóng to chi tiết nhánh tiến hóa.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`bg-paper-100/95 backdrop-blur-md border border-paper-border rounded-2xl shadow-paper-card overflow-hidden transition-all duration-300 flex flex-col ${className}`}
      data-testid="quick-specimen-panel"
      aria-label={`Thẻ mẫu vật giám tuyển loài ${species.vietnameseName}`}
    >
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 bg-paper-200/50 border-b border-paper-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isHoverPreview ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-natural-ochre/20 text-natural-ochre border border-natural-ochre/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Eye className="w-3 h-3" />
              Xem nhanh
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-natural-moss/15 text-natural-forest border border-natural-moss/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-natural-moss" />
              Mẫu vật Giám tuyển
            </span>
          )}

          {species.isEndemic && <EndemicBadge size="sm" />}
        </div>

        <ConservationBadge
          status={species.conservation.iucn}
          vietnamRedList={species.conservation.vietnamRedList}
          size="sm"
        />
      </div>

      {/* Main Scrollable Body */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-13rem)]">
        {/* Classic Naturalist Artwork Plate */}
        <div className="relative group rounded-xl overflow-hidden border-2 border-paper-300 bg-paper-200/60 p-1.5 shadow-inner">
          <BirdPlateImage
            species={species}
            aspectRatio="cover"
            className="w-full h-44 sm:h-48 rounded-lg"
            imageClassName="group-hover:scale-105 transition-transform duration-500"
          />

          {/* Plate Artist Caption */}
          <div className="pt-2 px-1 text-center border-t border-paper-border/50 mt-1">
            <p className="text-[11px] text-ink-600 font-serif italic truncate">
              {species.illustration.artist || 'Naturalist Archives of Indochina'}
              {species.illustration.sourceBook ? ` — ${species.illustration.sourceBook}` : ''}
            </p>
          </div>
        </div>

        {/* Trilingual Species Heading */}
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-ink-900 leading-tight">
            {species.vietnameseName}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif italic text-sm sm:text-base font-semibold text-natural-forest">
              {species.scientificName}
            </p>
            <span className="text-ink-400 text-xs">•</span>
            <p className="font-sans text-xs sm:text-sm text-ink-600">
              {species.englishName}
            </p>
          </div>
        </div>

        {/* Audio Player */}
        <div>
          <AudioVoiceButton
            audioInfo={species.audioCall}
            birdName={species.vietnameseName}
            variant="pill"
            size="md"
            className="w-full justify-center shadow-sm"
          />
        </div>

        {/* Phylogenetic Clade Sequence */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-ink-500 font-bold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-natural-moss" />
            <span>Chuỗi Phân loại Tiến hóa (Clade)</span>
          </h3>

          <div className="flex flex-wrap gap-1 p-2 bg-paper-200/50 rounded-xl border border-paper-border">
            {species.taxonomy.clade && species.taxonomy.clade.length > 0 ? (
              species.taxonomy.clade.map((cladeName, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper-100 border border-paper-border text-[11px] font-mono text-ink-700"
                >
                  <span className="text-natural-moss font-semibold">#{idx + 1}</span>
                  <span>{cladeName}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-ink-500 italic">
                {species.taxonomy.order} › {species.taxonomy.family} › {species.taxonomy.genus}
              </span>
            )}
          </div>
        </div>

        {/* Curatorial & Morphological Reasoning */}
        {species.morphologicalAnalysis && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-ink-500 font-bold flex items-center gap-1">
              <Feather className="w-3.5 h-3.5 text-natural-terracotta" />
              <span>Phân tích Hình thái học &amp; Giám tuyển</span>
            </h3>

            {/* Overview Quote */}
            {species.morphologicalAnalysis.overview && (
              <div className="p-3 rounded-xl bg-paper-50 border border-paper-border shadow-paper-card text-xs text-ink-800 italic leading-relaxed">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-natural-moss mt-0.5 flex-shrink-0" />
                  <p>"{species.morphologicalAnalysis.overview}"</p>
                </div>
              </div>
            )}

            {/* Diagnostic Features Chips / List */}
            {species.morphologicalAnalysis.diagnosticFeatures &&
              species.morphologicalAnalysis.diagnosticFeatures.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {species.morphologicalAnalysis.diagnosticFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-paper-200/50 border border-paper-border text-xs space-y-0.5"
                    >
                      <span className="font-semibold text-natural-forest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-natural-moss" />
                        {feat.part}:
                      </span>
                      <p className="text-ink-700 text-[11px] pl-2.5 leading-normal">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Academic Registries Quick Links */}
        <div className="flex items-center justify-between gap-1 text-[11px] text-ink-600 bg-paper-50 p-2 rounded-lg border border-paper-border">
          <span className="font-semibold text-ink-700 text-[10px] uppercase font-mono">Tra cứu:</span>
          <div className="flex items-center gap-1">
            <a
              href={getIucnUrl(species)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1.5 py-0.5 rounded bg-paper-200 hover:bg-natural-moss/20 hover:text-natural-moss font-mono text-[10px] transition-colors"
              title="IUCN Red List"
            >
              IUCN ↗
            </a>
            <a
              href={getAvibaseUrl(species)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1.5 py-0.5 rounded bg-paper-200 hover:bg-natural-moss/20 hover:text-natural-moss font-mono text-[10px] transition-colors"
              title="Avibase"
            >
              Avibase ↗
            </a>
            <a
              href={getGbifUrl(species)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1.5 py-0.5 rounded bg-paper-200 hover:bg-natural-moss/20 hover:text-natural-moss font-mono text-[10px] transition-colors"
              title="GBIF"
            >
              GBIF ↗
            </a>
          </div>
        </div>

        {/* Action Button: View Full Curator Analysis */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSwitchToCurator}
            className="w-full group flex items-center justify-between px-4 py-2.5 rounded-xl bg-natural-moss hover:bg-natural-forest text-paper-50 transition-all text-xs font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-natural-moss/40"
          >
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-natural-ochre" />
              <span>📜 Xem Phân tích Chi tiết Hình thái học</span>
            </div>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(QuickSpecimenPanel);


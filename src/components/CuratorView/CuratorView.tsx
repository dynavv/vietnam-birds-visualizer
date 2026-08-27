import React from 'react';
import {
  Feather,
  Compass,
  TreePine,
  Mountain,
  MapPin,
  Trees,
  Dices,
  Sparkles,
  Globe2
} from 'lucide-react';
import type { BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { ConservationBadge } from '../Common/ConservationBadge';
import { EndemicBadge } from '../Common/EndemicBadge';
import { SpecimenPlate } from './SpecimenPlate';
import { CladeBadgeSequence } from './CladeBadgeSequence';
import { MorphologyReport } from './MorphologyReport';
import { RelatedSpeciesTabs } from './RelatedSpeciesTabs';
import { AcademicReferences } from './AcademicReferences';

export interface CuratorViewProps {
  species?: BirdSpecies | null;
  className?: string;
  onViewMap?: () => void;
  onViewSunburst?: () => void;
}

export const CuratorView: React.FC<CuratorViewProps> = ({
  species: propSpecies,
  className = '',
  onViewMap,
  onViewSunburst
}) => {
  const {
    selectedSpecies: contextSpecies,
    setActiveView,
    selectRandomEndemic,
    allSpecies
  } = useTaxonomy();

  const species = propSpecies !== undefined ? propSpecies : contextSpecies;

  const handleSwitchToMap = () => {
    if (onViewMap) {
      onViewMap();
    } else {
      setActiveView('map');
    }
  };

  const handleSwitchToSunburst = () => {
    if (onViewSunburst) {
      onViewSunburst();
    } else {
      setActiveView('sunburst');
    }
  };

  if (!species) {
    return (
      <div
        className={`w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-6 ${className}`}
        data-testid="curator-view-empty"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-natural-moss/10 border-2 border-natural-moss/20 flex items-center justify-center text-natural-moss shadow-sm">
          <Feather className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            Phòng Giám Tuyển Mẫu Vật Điểu Học
          </h2>
          <p className="text-sm text-ink-600 leading-relaxed font-sans">
            Chưa có mẫu vật nào được chọn. Hãy khám phá ngẫu nhiên một loài chim đặc hữu hoặc mở bản đồ sinh thái để bắt đầu giám tuyển.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={selectRandomEndemic}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-natural-moss text-paper-50 hover:bg-natural-forest transition-all text-sm font-semibold shadow-sm"
          >
            <Dices className="w-4 h-4" />
            <span>Xem một loài ngẫu nhiên</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 ${className}`}
      data-testid="curator-view"
    >
      {/* Top Editorial Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-paper-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-natural-moss/10 text-natural-moss border border-natural-moss/20 shadow-sm">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 tracking-tight">
                  Phòng Giám Tuyển Mẫu Vật &amp; Hình Thái Học
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-natural-moss/10 text-natural-forest border border-natural-moss/20">
                  Curator Specimen
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-600 font-sans mt-0.5">
                Specimen &amp; Morphological Curator Archive — Khám phá chi tiết giải phẫu học, bản vẽ khắc cổ điển và lập luận tiến hóa
              </p>
            </div>
          </div>
        </div>

        {/* Quick View Navigation Switchers */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleSwitchToMap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-800 border border-paper-border text-xs font-medium transition-all shadow-sm"
            title="Xem vị trí phân bố trên Bản đồ Sinh thái EBA"
          >
            <Compass className="w-3.5 h-3.5 text-natural-moss" />
            <span>Bản đồ EBA</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchToSunburst}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-800 border border-paper-border text-xs font-medium transition-all shadow-sm"
            title="Khám phá vị trí trên Bánh xe Phân loại học"
          >
            <TreePine className="w-3.5 h-3.5 text-natural-moss" />
            <span>Bánh xe Phân loại</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Academic Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Columns 1-7): Visual Plate & Evolutionary Context */}
        <div className="lg:col-span-7 space-y-6">
          {/* Specimen Illustration Plate with Victorian Double Border */}
          <SpecimenPlate species={species} />

          {/* Connected Evolutionary Phylogenetic Clade Badges */}
          <CladeBadgeSequence taxonomy={species.taxonomy} />

          {/* Related / Candidate Species Switcher Tabs */}
          <RelatedSpeciesTabs
            currentSpecies={species}
            allSpecies={allSpecies}
          />
        </div>

        {/* Right Column (Columns 8-12): Academic Nomenclature, Distribution & Morphology Report */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trilingual Nomenclature & Conservation Overview Card */}
          <section
            className="bg-paper-100/95 border border-paper-border rounded-2xl p-5 sm:p-6 shadow-paper-card space-y-4"
            aria-label="Thông tin danh pháp và tình trạng bảo tồn"
          >
            <div className="flex items-center justify-between gap-2 border-b border-paper-border pb-3">
              <span className="font-mono text-[11px] uppercase font-bold text-natural-bark flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-natural-ochre" />
                Hồ Sơ Mẫu Vật Điểu Học
              </span>

              <span className="font-mono text-[11px] text-ink-500 bg-paper-200/80 px-2 py-0.5 rounded border border-paper-border">
                ID: {species.id}
              </span>
            </div>

            {/* Trilingual Names */}
            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight leading-tight">
                {species.vietnameseName}
              </h2>

              <p className="font-serif italic text-base sm:text-lg font-bold text-natural-forest">
                {species.scientificName}
              </p>

              <p className="font-sans text-xs sm:text-sm text-ink-600 font-medium">
                Tên tiếng Anh: <span className="text-ink-800 font-semibold">{species.englishName}</span>
              </p>
            </div>

            {/* Badges Matrix */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {species.isEndemic && <EndemicBadge size="md" />}
              <ConservationBadge
                status={species.conservation.iucn}
                vietnamRedList={species.conservation.vietnamRedList}
                size="md"
              />
            </div>

            {/* Conservation Status Text */}
            {species.conservation.description && (
              <div className="p-3 rounded-xl bg-paper-50 border border-paper-border text-xs text-ink-700 leading-relaxed font-sans">
                <span className="font-semibold text-ink-900">Tình trạng bảo tồn: </span>
                {species.conservation.description}
              </div>
            )}
          </section>

          {/* Distribution & Ecological Habitat Card */}
          <section
            className="bg-paper-100/95 border border-paper-border rounded-2xl p-5 sm:p-6 shadow-paper-card space-y-3.5"
            aria-label="Phân bố địa lý và sinh cảnh tại Việt Nam"
          >
            <div className="flex items-center justify-between pb-2 border-b border-paper-border">
              <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-natural-moss" />
                <span>Sinh Cảnh &amp; Phân Bố Tự Nhiên tại Việt Nam</span>
              </h3>
              <span className="text-[10px] font-mono text-ink-500 uppercase">EBA Matrix</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* EBA Region */}
              <div className="flex items-start gap-2.5 text-ink-800">
                <MapPin className="w-4 h-4 text-natural-terracotta mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-ink-700">Vùng Chim Đặc Hữu (EBA): </span>
                  <span className="text-ink-900 font-medium">{species.distribution.ebaRegion}</span>
                </div>
              </div>

              {/* Elevation */}
              <div className="flex items-center gap-2.5 text-ink-800">
                <Mountain className="w-4 h-4 text-natural-bark flex-shrink-0" />
                <span className="font-semibold text-ink-700">Độ cao phân bố: </span>
                <span className="font-mono text-ink-900 bg-paper-200 px-2 py-0.5 rounded border border-paper-border">
                  {species.distribution.elevation || 'Chưa ghi nhận'}
                </span>
              </div>

              {/* Coordinates */}
              {species.distribution.coordinates && (
                <div className="flex items-center gap-2.5 text-ink-800">
                  <Compass className="w-4 h-4 text-natural-indigo flex-shrink-0" />
                  <span className="font-semibold text-ink-700">Tọa độ mẫu vật: </span>
                  <span className="font-mono text-ink-900">
                    {species.distribution.coordinates[0]}°N, {species.distribution.coordinates[1]}°E
                  </span>
                </div>
              )}

              {/* Locations */}
              {species.distribution.locations && species.distribution.locations.length > 0 && (
                <div className="flex items-start gap-2.5 text-ink-800 pt-1">
                  <Trees className="w-4 h-4 text-natural-moss mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-ink-700">Địa bàn quan sát: </span>
                    <span className="text-ink-900">{species.distribution.locations.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Habitat Tags */}
              {species.distribution.habitats && species.distribution.habitats.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-ink-700 block mb-1.5">Sinh cảnh đặc trưng:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {species.distribution.habitats.map((habitat, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2.5 py-1 bg-paper-200 text-[11px] text-ink-800 font-sans rounded-lg border border-paper-border"
                      >
                        {habitat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Deep Morphological Analysis & Curatorial Report */}
          <div className="bg-paper-100/95 border border-paper-border rounded-2xl p-5 sm:p-6 shadow-paper-card">
            <MorphologyReport species={species} />
          </div>

          {/* Academic Identifiers & Primary Literature References */}
          <AcademicReferences species={species} />
        </div>
      </div>
    </div>
  );
};

export default CuratorView;

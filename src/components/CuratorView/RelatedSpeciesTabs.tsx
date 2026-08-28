import React, { useState, useMemo } from 'react';
import { Layers, Sparkles, ChevronRight } from 'lucide-react';
import type { BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { BirdPlateImage } from '../Common/BirdPlateImage';

export interface RelatedSpeciesTabsProps {
  currentSpecies: BirdSpecies;
  allSpecies?: BirdSpecies[];
  onSelectSpecies?: (id: string) => void;
  className?: string;
}

type FilterTab = 'genus' | 'family' | 'all';

export const RelatedSpeciesTabsComponent: React.FC<RelatedSpeciesTabsProps> = ({
  currentSpecies,
  allSpecies: propAllSpecies,
  onSelectSpecies: propOnSelectSpecies,
  className = ''
}) => {
  const context = useTaxonomy();
  const allSpecies = propAllSpecies || context.allSpecies || [];
  const selectSpecies = propOnSelectSpecies || context.selectSpecies;

  const [activeTab, setActiveTab] = useState<FilterTab>('genus');

  // Species belonging to the same Genus (excluding current)
  const sameGenusSpecies = useMemo(() => {
    return allSpecies.filter(
      (s) =>
        s.taxonomy.genus.toLowerCase() === currentSpecies.taxonomy.genus.toLowerCase() &&
        s.id !== currentSpecies.id
    );
  }, [allSpecies, currentSpecies]);

  // Species belonging to the same Family (excluding current)
  const sameFamilySpecies = useMemo(() => {
    return allSpecies.filter(
      (s) =>
        s.taxonomy.family.toLowerCase() === currentSpecies.taxonomy.family.toLowerCase() &&
        s.id !== currentSpecies.id
    );
  }, [allSpecies, currentSpecies]);

  // Combined related species list
  const allRelatedSpecies = useMemo(() => {
    const map = new Map<string, BirdSpecies>();
    sameGenusSpecies.forEach((s) => map.set(s.id, s));
    sameFamilySpecies.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [sameGenusSpecies, sameFamilySpecies]);

  // Active list based on chosen tab
  const displayedSpecies = useMemo(() => {
    switch (activeTab) {
      case 'genus':
        return sameGenusSpecies.length > 0 ? sameGenusSpecies : sameFamilySpecies;
      case 'family':
        return sameFamilySpecies;
      case 'all':
      default:
        return allRelatedSpecies;
    }
  }, [activeTab, sameGenusSpecies, sameFamilySpecies, allRelatedSpecies]);

  const familyName =
    currentSpecies.taxonomy.familyVietnamese || currentSpecies.taxonomy.family;

  const handleSelectRelatedSpecies = (birdId: string) => {
    selectSpecies?.(birdId);
    const mainEl = document.querySelector('main');
    if (mainEl && typeof mainEl.scrollTo === 'function') {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const curatorContainer = document.querySelector('[data-testid="active-curator-view"]');
    if (curatorContainer && typeof curatorContainer.scrollTo === 'function') {
      curatorContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      className={`bg-paper-100/90 border border-paper-border rounded-2xl p-4 sm:p-5 shadow-paper-card space-y-3.5 ${className}`}
      data-testid="related-species-tabs"
      aria-label="Các loài tương cận cùng Chi và Họ tại Việt Nam"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-paper-border">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-ink-700 tracking-wider">
          <Layers className="w-4 h-4 text-natural-terracotta" />
          <span>Mẫu Vật Tương Cận Cùng Nhánh (Related Species)</span>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex items-center gap-1 bg-paper-200/70 p-1 rounded-lg border border-paper-border text-xs self-start sm:self-auto"
          role="tablist"
          aria-label="Lọc loài tương cận theo bậc phân loại"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'genus'}
            onClick={() => setActiveTab('genus')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
              activeTab === 'genus'
                ? 'bg-paper-50 text-ink-900 shadow-sm font-semibold border border-paper-border'
                : 'text-ink-600 hover:text-ink-900 hover:bg-paper-100'
            }`}
          >
            <span>Cùng Chi</span>
            <span className="font-mono text-[10px] text-ink-500 bg-paper-200 px-1 rounded">
              {sameGenusSpecies.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'family'}
            onClick={() => setActiveTab('family')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
              activeTab === 'family'
                ? 'bg-paper-50 text-ink-900 shadow-sm font-semibold border border-paper-border'
                : 'text-ink-600 hover:text-ink-900 hover:bg-paper-100'
            }`}
          >
            <span>Cùng Họ</span>
            <span className="font-mono text-[10px] text-ink-500 bg-paper-200 px-1 rounded">
              {sameFamilySpecies.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
              activeTab === 'all'
                ? 'bg-paper-50 text-ink-900 shadow-sm font-semibold border border-paper-border'
                : 'text-ink-600 hover:text-ink-900 hover:bg-paper-100'
            }`}
          >
            <span>Tất cả</span>
            <span className="font-mono text-[10px] text-ink-500 bg-paper-200 px-1 rounded">
              {allRelatedSpecies.length}
            </span>
          </button>
        </div>
      </div>

      {/* Subtitle / Context */}
      <div className="text-[11px] font-sans text-ink-500 flex items-center justify-between">
        <span>
          Chi <span className="font-serif italic font-semibold text-ink-700">{currentSpecies.taxonomy.genus}</span> •{' '}
          {familyName} (<span className="font-serif italic">{currentSpecies.taxonomy.family}</span>)
        </span>
        <span>Nhấp vào mẫu vật để chuyển đổi tức thì</span>
      </div>

      {/* List of related species cards */}
      {displayedSpecies.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-h-80 overflow-y-auto pr-1 scrollbar-thin"
          role="list"
          aria-label="Danh sách loài chim tương cận"
        >
          {displayedSpecies.map((bird) => {
            const isSelected = bird.id === currentSpecies.id;
            const iucnStatus = bird.conservation.iucn;
            const vnStatus = bird.conservation.vietnamRedList;

            return (
              <div
                key={bird.id}
                role="listitem"
                onClick={() => handleSelectRelatedSpecies(bird.id)}
                className={`group p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-natural-moss/10 border-natural-moss ring-2 ring-natural-moss/30 shadow-sm'
                    : 'bg-paper-50 hover:bg-paper-200/80 border-paper-border hover:border-natural-moss/40 hover:shadow-sm'
                }`}
                data-testid={`related-species-card-${bird.id}`}
                title={`Xem mẫu vật loài ${bird.vietnameseName} (${bird.scientificName})`}
              >
                {/* Thumbnail Naturalist Plate Container */}
                <div className="w-13 h-13 w-[52px] h-[52px] shrink-0 rounded-lg overflow-hidden border border-paper-300 bg-paper-200 shadow-inner relative">
                  <BirdPlateImage
                    species={bird}
                    aspectRatio="square"
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Info Container */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="font-serif font-bold text-xs text-ink-900 truncate leading-tight group-hover:text-natural-forest transition-colors">
                      {bird.vietnameseName}
                    </h5>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold uppercase shrink-0 ${
                        iucnStatus === 'CR' || iucnStatus === 'EN' || vnStatus === 'CR' || vnStatus === 'EN'
                          ? 'bg-red-950/10 text-red-900 border border-red-800/30'
                          : iucnStatus === 'VU' || iucnStatus === 'NT'
                          ? 'bg-amber-950/10 text-amber-900 border border-amber-700/30'
                          : 'bg-emerald-950/10 text-emerald-900 border border-emerald-700/30'
                      }`}
                    >
                      {vnStatus ? `VN:${vnStatus}` : iucnStatus}
                    </span>
                  </div>

                  <p className="font-serif italic text-[11px] text-natural-forest truncate">
                    {bird.scientificName}
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    {bird.isEndemic && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-900 border border-amber-500/30 text-[9.5px] font-semibold shrink-0">
                        ★ Đặc hữu
                      </span>
                    )}
                    <span className="text-[10.5px] text-ink-500 font-sans truncate">
                      {bird.englishName}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-ink-400 group-hover:text-natural-moss group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-paper-200/40 border border-dashed border-paper-border text-center space-y-1.5">
          <Sparkles className="w-5 h-5 mx-auto text-natural-ochre" />
          <p className="font-serif text-xs font-semibold text-ink-800">
            Chi {currentSpecies.taxonomy.genus} là chi đơn loài đại diện tại Việt Nam
          </p>
          <p className="text-[11px] text-ink-500 font-sans">
            Không có loài tương cận nào khác trong cùng chi này được ghi nhận trong cơ sở dữ liệu mẫu vật hiện tại.
          </p>
        </div>
      )}
    </section>
  );
};

export const RelatedSpeciesTabs = React.memo(RelatedSpeciesTabsComponent);
export default RelatedSpeciesTabs;


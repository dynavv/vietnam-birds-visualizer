import React from 'react';
import { ExternalLink, Database, Globe } from 'lucide-react';
import { BirdSpecies } from '../../types/bird';
import {
  getIucnUrl,
  getAvibaseUrl,
  getGbifUrl,
  getInaturalistUrl
} from '../../utils/linkGenerators';

export interface TaxonRegistriesCardProps {
  species: BirdSpecies;
  className?: string;
}

export const TaxonRegistriesCard: React.FC<TaxonRegistriesCardProps> = React.memo(({ species, className = '' }) => {
  return (
    <section
      className={`bg-paper-100/95 border border-paper-border rounded-2xl p-5 shadow-paper-card space-y-3.5 ${className}`}
      aria-label="Mã định danh trong các cơ sở dữ liệu quốc tế"
      data-testid="taxon-registries-card"
    >
      <div className="flex items-center justify-between pb-2 border-b border-paper-border">
        <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-natural-moss" />
          <span>Mã Định Danh Cơ Sở Dữ Liệu Quốc Tế</span>
        </h3>
        <span className="text-[10px] font-mono text-ink-500 uppercase">Global Verified Registries</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* IUCN Link */}
        <a
          href={getIucnUrl(species)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-paper-200/60 hover:bg-paper-200 border border-paper-border transition-all text-xs group cursor-pointer shadow-2xs"
        >
          <div>
            <span className="font-semibold text-ink-900 block">IUCN Red List</span>
            <span className="text-ink-500 text-[11px]">Hồ sơ đánh giá bảo tồn</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-natural-terracotta transition-colors shrink-0" />
        </a>

        {/* Avibase Link */}
        <a
          href={getAvibaseUrl(species)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-paper-200/60 hover:bg-paper-200 border border-paper-border transition-all text-xs group cursor-pointer shadow-2xs"
        >
          <div>
            <span className="font-semibold text-ink-900 block">Avibase Checklist</span>
            <span className="text-ink-500 text-[11px]">Cơ sở dữ liệu chim thế giới</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-natural-moss transition-colors shrink-0" />
        </a>

        {/* GBIF Link */}
        <a
          href={getGbifUrl(species)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-paper-200/60 hover:bg-paper-200 border border-paper-border transition-all text-xs group cursor-pointer shadow-2xs"
        >
          <div>
            <span className="font-semibold text-ink-900 block">GBIF Biodiversity</span>
            <span className="text-ink-500 text-[11px]">Bản đồ ghi nhận mẫu</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-natural-indigo transition-colors shrink-0" />
        </a>

        {/* iNaturalist Link */}
        <a
          href={getInaturalistUrl(species)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-paper-200/60 hover:bg-paper-200 border border-paper-border transition-all text-xs group cursor-pointer shadow-2xs"
        >
          <div>
            <span className="font-semibold text-ink-900 block">iNaturalist</span>
            <span className="text-ink-500 text-[11px]">Quan sát thực địa</span>
          </div>
          <Globe className="w-3.5 h-3.5 text-ink-400 group-hover:text-natural-forest transition-colors shrink-0" />
        </a>
      </div>
    </section>
  );
});

export interface AcademicReferencesProps {
  species: BirdSpecies;
  className?: string;
}

export const AcademicReferencesComponent: React.FC<AcademicReferencesProps> = ({ species, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`} data-testid="academic-references">
      <TaxonRegistriesCard species={species} />
    </div>
  );
};

export const AcademicReferences = React.memo(AcademicReferencesComponent);
export default AcademicReferences;

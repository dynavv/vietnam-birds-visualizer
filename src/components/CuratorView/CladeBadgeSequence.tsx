import React from 'react';
import { ChevronRight, Dna, Layers } from 'lucide-react';
import type { SpeciesTaxonomy } from '../../types/bird';

export interface CladeBadgeSequenceProps {
  taxonomy: SpeciesTaxonomy;
  className?: string;
  onCladeClick?: (rank: string, name: string) => void;
}

interface CladeStep {
  rankKey: 'class' | 'clade' | 'order' | 'family' | 'genus' | 'species';
  rankLabelVi: string;
  rankLabelEn: string;
  scientificName: string;
  vietnameseName?: string;
  colorClass: string;
  badgeBg: string;
}

const CLADE_VIETNAMESE_NAMES: Record<string, string> = {
  Aves: 'Lớp Chim',
  Neognathae: 'Nhánh Hàm Mới',
  Palaeognathae: 'Nhánh Hàm Cổ',
  Neoaves: 'Nhánh Chim Hiện Đại',
  Galloanserae: 'Nhánh Thủy Cầm & Gà',
  Passerea: 'Nhánh Sẻ & Tương Cận',
  Afroaves: 'Nhánh Chim Phi',
  Australaves: 'Nhánh Chim Nam',
  Columbaves: 'Nhánh Bồ Câu & Tương Cận'
};

export const CladeBadgeSequence: React.FC<CladeBadgeSequenceProps> = ({
  taxonomy,
  className = '',
  onCladeClick
}) => {
  // Build the complete evolutionary sequence
  const steps: CladeStep[] = [];

  // 1. Class Aves
  steps.push({
    rankKey: 'class',
    rankLabelVi: 'Lớp',
    rankLabelEn: 'Class',
    scientificName: 'Aves',
    vietnameseName: 'Chim',
    colorClass: 'text-slate-800 border-slate-300 bg-slate-100/90',
    badgeBg: 'bg-slate-200 text-slate-700'
  });

  // 2. Intermediate Clades (Neognathae, Neoaves, Passerea, etc.)
  const rawClades = taxonomy.clade || [];
  rawClades.forEach((cladeName: string) => {
    if (cladeName.toLowerCase() === 'aves') return; // already added
    steps.push({
      rankKey: 'clade',
      rankLabelVi: 'Nhánh',
      rankLabelEn: 'Clade',
      scientificName: cladeName,
      vietnameseName: CLADE_VIETNAMESE_NAMES[cladeName] || cladeName,
      colorClass: 'text-sky-900 border-sky-300 bg-sky-50/90',
      badgeBg: 'bg-sky-200/80 text-sky-800'
    });
  });

  // 3. Order
  if (taxonomy.order) {
    steps.push({
      rankKey: 'order',
      rankLabelVi: 'Bộ',
      rankLabelEn: 'Order',
      scientificName: taxonomy.order,
      vietnameseName: taxonomy.orderVietnamese || taxonomy.order,
      colorClass: 'text-emerald-900 border-emerald-300 bg-emerald-50/90',
      badgeBg: 'bg-emerald-200/80 text-emerald-800'
    });
  }

  // 4. Family
  if (taxonomy.family) {
    steps.push({
      rankKey: 'family',
      rankLabelVi: 'Họ',
      rankLabelEn: 'Family',
      scientificName: taxonomy.family,
      vietnameseName: taxonomy.familyVietnamese || taxonomy.family,
      colorClass: 'text-amber-900 border-amber-300 bg-amber-50/90',
      badgeBg: 'bg-amber-200/80 text-amber-800'
    });
  }

  // 5. Genus
  if (taxonomy.genus) {
    steps.push({
      rankKey: 'genus',
      rankLabelVi: 'Chi',
      rankLabelEn: 'Genus',
      scientificName: taxonomy.genus,
      vietnameseName: `Chi ${taxonomy.genus}`,
      colorClass: 'text-orange-900 border-orange-300 bg-orange-50/90',
      badgeBg: 'bg-orange-200/80 text-orange-800'
    });
  }

  // 6. Species
  if (taxonomy.species) {
    steps.push({
      rankKey: 'species',
      rankLabelVi: 'Loài',
      rankLabelEn: 'Species',
      scientificName: taxonomy.species,
      vietnameseName: taxonomy.species,
      colorClass: 'text-natural-forest border-natural-moss/40 bg-natural-moss/10 shadow-sm font-semibold',
      badgeBg: 'bg-natural-moss text-paper-50'
    });
  }

  return (
    <section
      className={`bg-paper-100/90 border border-paper-border rounded-xl p-3.5 sm:p-4 shadow-paper-card ${className}`}
      data-testid="clade-badge-sequence"
      aria-label="Chuỗi phân cấp tiến hóa và phân loại học"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-ink-700 tracking-wider">
          <Dna className="w-4 h-4 text-natural-moss" />
          <span>Chuỗi Phân Cấp Tiến Hóa (Phylogenetic Lineage)</span>
        </div>
        <span className="text-[11px] font-mono text-ink-500 bg-paper-200/70 px-2 py-0.5 rounded border border-paper-border flex items-center gap-1">
          <Layers className="w-3 h-3 text-natural-terracotta" />
          {steps.length} bậc tiến hóa
        </span>
      </div>

      {/* Horizontal badge chain */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin"
        role="list"
        aria-label="Các bậc phân loại học tiến hóa"
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isClickable = Boolean(onCladeClick);

          return (
            <React.Fragment key={`${step.rankKey}-${step.scientificName}-${index}`}>
              <div
                role="listitem"
                onClick={() => onCladeClick?.(step.rankKey, step.scientificName)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-sans whitespace-nowrap transition-all flex-shrink-0 ${
                  step.colorClass
                } ${
                  isClickable
                    ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95'
                    : ''
                }`}
                title={`${step.rankLabelVi} (${step.rankLabelEn}): ${step.scientificName}${
                  step.vietnameseName ? ` — ${step.vietnameseName}` : ''
                }`}
              >
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${step.badgeBg}`}
                >
                  {step.rankLabelVi}
                </span>

                <div className="flex flex-col text-left leading-tight">
                  <span className="font-serif italic font-semibold">
                    {step.scientificName}
                  </span>
                  {step.vietnameseName && step.vietnameseName !== step.scientificName && (
                    <span className="text-[10px] font-sans opacity-85">
                      {step.vietnameseName}
                    </span>
                  )}
                </div>
              </div>

              {!isLast && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-ink-400 flex-shrink-0 mx-0.5 select-none"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default CladeBadgeSequence;

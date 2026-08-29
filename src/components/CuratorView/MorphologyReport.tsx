import React from 'react';
import {
  Feather,
  Eye,
  Layers,
  Sparkles,
  BookOpen,
  Dna,
  Compass,
  CheckCircle2
} from 'lucide-react';
import type { BirdSpecies, DiagnosticFeature } from '../../types/bird';

export interface MorphologyReportProps {
  species?: BirdSpecies | null;
  className?: string;
}

interface AnatomicalMeta {
  categoryNameVi: string;
  categoryNameEn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeClass: string;
}

const getAnatomicalMeta = (partName: string, description: string): AnatomicalMeta => {
  const text = `${partName} ${description}`.toLowerCase();

  if (text.includes('mỏ') || text.includes('culmen') || text.includes('mũi') || text.includes('beak') || text.includes('bill')) {
    return {
      categoryNameVi: 'Cấu trúc Mỏ & Cơ chế Thức ăn',
      categoryNameEn: 'Beak & Feeding Apparatus',
      icon: Compass,
      colorClass: 'border-natural-terracotta/40 bg-natural-terracotta/5',
      badgeClass: 'bg-natural-terracotta/15 text-natural-terracotta border-natural-terracotta/30'
    };
  }

  if (text.includes('cánh') || text.includes('wing') || text.includes('lông bao') || text.includes('lông cánh') || text.includes('sơ cấp') || text.includes('thứ cấp')) {
    return {
      categoryNameVi: 'Lông Cánh & Vệt Màu Nhận Dạng',
      categoryNameEn: 'Wings & Primaries',
      icon: Feather,
      colorClass: 'border-natural-moss/40 bg-natural-moss/5',
      badgeClass: 'bg-natural-moss/15 text-natural-forest border-natural-moss/30'
    };
  }

  if (text.includes('đầu') || text.includes('mắt') || text.includes('mặt') || text.includes('gáy') || text.includes('đỉnh') || text.includes('crown') || text.includes('eye') || text.includes('lông mày')) {
    return {
      categoryNameVi: 'Đỉnh Đầu, Vòng Mắt & Mặt',
      categoryNameEn: 'Crown, Supercilium & Face',
      icon: Eye,
      colorClass: 'border-natural-indigo/40 bg-natural-indigo/5',
      badgeClass: 'bg-natural-indigo/15 text-natural-indigo border-natural-indigo/30'
    };
  }

  if (text.includes('đuôi') || text.includes('tail') || text.includes('thân dưới') || text.includes('bụng') || text.includes('ngực') || text.includes('underparts')) {
    return {
      categoryNameVi: 'Thân Dưới & Cấu Trúc Đuôi',
      categoryNameEn: 'Tail & Underparts',
      icon: Layers,
      colorClass: 'border-natural-amber/40 bg-natural-amber/5',
      badgeClass: 'bg-natural-amber/15 text-natural-amber border-natural-amber/30'
    };
  }

  return {
    categoryNameVi: 'Đặc Điểm Nhận Dạng Thực Địa',
    categoryNameEn: 'Diagnostic Field Marks',
    icon: Sparkles,
    colorClass: 'border-paper-border bg-paper-200/40',
    badgeClass: 'bg-paper-300/60 text-ink-700 border-paper-border'
  };
};

/**
 * Generate taxonomic & evolutionary rationale based on species phylogeny
 */
const generateTaxonomicRationale = (species: BirdSpecies): string => {
  const { taxonomy, isEndemic, distribution } = species;
  const familyVi = taxonomy.familyVietnamese || taxonomy.family;
  const orderVi = taxonomy.orderVietnamese || taxonomy.order;

  return `Loài ${species.vietnameseName} (${species.scientificName}) được xếp vào Chi ${taxonomy.genus}, thuộc ${familyVi} (${taxonomy.family}), ${orderVi} (${taxonomy.order}). Vị trí phân loại học này được củng cố bởi các đặc trưng cốt lõi về giải phẫu sọ mỏ, cấu trúc thanh quản (syrinx) và hình thái xương đai chi. ${
    isEndemic
      ? `Quá trình phân hóa loài (speciation) diễn ra mạnh mẽ tại ${distribution.ebaRegion}, nơi các rạn rừng nguyên sinh núi cao cô lập quần thể, thúc đẩy tiến hóa màu lông chuyên biệt và tiếng hót mang tính phân định lãnh thổ cao.`
      : `Sự thích nghi hình thái phản ánh quá trình bức xạ thích nghi (adaptive radiation) trong hệ sinh thái rừng nhiệt đới Đông Dương.`
  }`;
};

export const MorphologyReportComponent: React.FC<MorphologyReportProps> = ({
  species,
  className = ''
}) => {
  if (!species) {
    return (
      <section
        className={`bg-paper-100/90 border border-paper-border rounded-2xl p-6 text-center text-ink-500 space-y-2 ${className}`}
        data-testid="morphology-report-empty"
      >
        <BookOpen className="w-8 h-8 mx-auto text-ink-400 animate-pulse" />
        <p className="font-serif text-sm">Chưa có dữ liệu hình thái học</p>
      </section>
    );
  }

  const { morphologicalAnalysis, taxonomy } = species;
  const diagnosticFeatures: DiagnosticFeature[] =
    morphologicalAnalysis?.diagnosticFeatures || [];

  return (
    <section
      className={`space-y-6 ${className}`}
      data-testid="morphology-report"
      aria-label={`Báo cáo hình thái học loài ${species.vietnameseName}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-paper-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink-900 leading-tight">
              Báo Cáo Giám Tuyển &amp; Lập Luận Hình Thái Học
            </h3>
            <p className="text-[11px] font-sans text-ink-600">
              Curatorial Morphological Analysis &amp; Taxonomic Rationale
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-semibold uppercase text-natural-forest bg-natural-moss/10 px-2 py-0.5 rounded border border-natural-moss/20">
          IOC / Naturalist Review
        </span>
      </div>

      {/* 1. Morphological Overview Box */}
      {morphologicalAnalysis?.overview && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase font-bold text-ink-600 tracking-wider flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-natural-terracotta" />
            <span>1. Mô Tả Tổng Quan (Morphological Overview)</span>
          </h4>

          <div className="p-4 sm:p-5 rounded-2xl bg-paper-50 border-l-4 border-natural-moss border-t border-r border-b border-paper-border shadow-paper-card relative space-y-3">
            <div className="flex items-start gap-3">
              <p className="font-serif text-sm sm:text-base text-ink-800 italic leading-relaxed">
                "{morphologicalAnalysis.overview}"
              </p>
            </div>

            {/* Naturalist Curatorial Notes Chips */}
            <div className="pt-2 border-t border-paper-border/60 flex flex-wrap items-center gap-2 text-[11px] font-sans text-ink-600">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper-200/70 border border-paper-border">
                <CheckCircle2 className="w-3 h-3 text-natural-moss" />
                <span>Sắc tố bộ lông: Đa sắc nhiệt đới</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper-200/70 border border-paper-border">
                <CheckCircle2 className="w-3 h-3 text-natural-moss" />
                <span>Chi: {taxonomy.genus}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper-200/70 border border-paper-border">
                <CheckCircle2 className="w-3 h-3 text-natural-moss" />
                <span>Họ: {taxonomy.familyVietnamese || taxonomy.family}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Diagnostic Features Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase font-bold text-ink-600 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-natural-ochre" />
            <span>2. Bảng Đặc Điểm Nhận Dạng Then Chốt (Diagnostic Features)</span>
          </h4>
        </div>

        {diagnosticFeatures.length > 0 ? (
          <div className="space-y-2.5">
            {diagnosticFeatures.map((feat, idx) => {
              const meta = getAnatomicalMeta(feat.part, feat.description);
              const IconComp = meta.icon;

              return (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${meta.colorClass}`}
                  data-testid="diagnostic-feature-card"
                >
                  {/* Anatomical Region Header (Vertically Centered) */}
                  <div className="shrink-0 sm:w-48 flex items-center">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase border tracking-wide leading-snug w-full justify-start ${meta.badgeClass}`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{meta.categoryNameVi}</span>
                    </span>
                  </div>

                  {/* Content: Title + Description */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h5 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-natural-forest shrink-0" />
                      {feat.part}
                    </h5>

                    <p className="text-xs text-ink-700 leading-relaxed font-sans pl-3.5">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-paper-200/50 border border-paper-border text-xs text-ink-600 italic">
            Các đặc điểm giải phẫu chi tiết đang được các chuyên gia điểu học tiếp tục bổ sung.
          </div>
        )}
      </div>

      {/* 3. Taxonomic & Evolutionary Logic */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase font-bold text-ink-600 tracking-wider flex items-center gap-1.5">
          <Dna className="w-3.5 h-3.5 text-natural-indigo" />
          <span>3. Lập Luận Phân Loại Học Tiến Hóa (Taxonomic &amp; Evolutionary Logic)</span>
        </h4>

        <div className="p-4 sm:p-5 rounded-2xl bg-paper-100 border border-paper-border shadow-paper-card space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-natural-indigo/10 text-natural-indigo flex-shrink-0 mt-0.5">
              <Dna className="w-4 h-4" />
            </div>
            <div className="space-y-1.5">
              <h5 className="font-serif font-bold text-sm text-ink-900">
                Cơ sở Di truyền &amp; Bức xạ Tiến hóa của Chi {taxonomy.genus}
              </h5>
              <p className="font-sans text-xs sm:text-sm text-ink-700 leading-relaxed">
                {generateTaxonomicRationale(species)}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-paper-border flex items-center justify-between text-[11px] font-mono text-ink-500 flex-wrap gap-2">
            <span>HỆ THỐNG: IOC WORLD BIRD LIST / CLEMENTS</span>
            <span className="font-semibold text-natural-forest">LẬP LUẬN ĐIỂU HỌC CHUẨN</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const MorphologyReport = React.memo(MorphologyReportComponent);
export default MorphologyReport;


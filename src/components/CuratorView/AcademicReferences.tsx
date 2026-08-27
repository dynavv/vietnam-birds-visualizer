import React from 'react';
import { BookOpen, ExternalLink, Database, FileText, CheckCircle2 } from 'lucide-react';
import { BirdSpecies } from '../../types/bird';

interface AcademicReferencesProps {
  species: BirdSpecies;
}

export const AcademicReferences: React.FC<AcademicReferencesProps> = ({ species }) => {
  const academic = species.academic;

  return (
    <div className="bg-paper-50 rounded-xl p-6 border border-stone-200 shadow-sm mt-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-natural-moss" />
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Hồ sơ Định danh & Tài liệu Khoa học Gốc
          </h3>
        </div>
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
          Đã thẩm định học thuật
        </span>
      </div>

      {/* Global Taxonomic Identifiers */}
      <div className="mt-4">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2.5 flex items-center">
          <Database className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
          Mã định danh trong các Cơ sở Dữ liệu Quốc tế
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* IUCN Link */}
          <a
            href={academic?.iucnUrl || `https://www.iucnredlist.org/search?query=${encodeURIComponent(species.scientificName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 transition-colors text-xs group"
          >
            <div>
              <span className="font-semibold text-stone-800 block">IUCN Red List</span>
              <span className="text-stone-500 text-[11px]">Hồ sơ đánh giá bảo tồn</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-natural-terracotta transition-colors" />
          </a>

          {/* Avibase Link */}
          <a
            href={academic?.avibaseId ? `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=&sec=summary&qstr=${encodeURIComponent(species.scientificName)}` : `https://avibase.bsc-eoc.org/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 transition-colors text-xs group"
          >
            <div>
              <span className="font-semibold text-stone-800 block">Avibase Checklist</span>
              <span className="text-stone-500 text-[11px]">Cơ sở dữ liệu chim thế giới</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-natural-moss transition-colors" />
          </a>

          {/* GBIF Link */}
          <a
            href={academic?.gbifTaxonKey || `https://www.gbif.org/species/search?q=${encodeURIComponent(species.scientificName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 transition-colors text-xs group"
          >
            <div>
              <span className="font-semibold text-stone-800 block">GBIF Biodiversity</span>
              <span className="text-stone-500 text-[11px]">Bản đồ ghi nhận mẫu thực địa</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-natural-indigo transition-colors" />
          </a>
        </div>
      </div>

      {/* Primary Literature Citations */}
      <div className="mt-5">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2 flex items-center">
          <FileText className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
          Công trình Nghiên cứu & Tài liệu Mô tả Gốc (Primary Literature)
        </h4>

        <div className="space-y-2.5 mt-2">
          {academic?.primaryLiterature && academic.primaryLiterature.length > 0 ? (
            academic.primaryLiterature.map((ref, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-800 space-y-1"
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-stone-900">{ref.authors} ({ref.year}).</span>
                  {ref.doiOrUrl && (
                    <a
                      href={ref.doiOrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-natural-moss hover:text-stone-900 font-medium ml-2 shrink-0"
                    >
                      <span>Tài liệu gốc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="italic text-stone-700 font-serif">"{ref.title}."</div>
                <div className="text-stone-500 text-[11px]">
                  {ref.journalOrBook}{ref.volumeOrPages ? `, ${ref.volumeOrPages}` : ''}.
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded border border-stone-200">
              Craik, R. C. & Le Manh Hung (2018). Birds of Vietnam. Helm Wildlife Guides.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

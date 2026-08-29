import React, { useState } from 'react';
import { Sparkles, Info, BookOpen, ShieldCheck } from 'lucide-react';
import { MethodologyModal, MethodologyTab } from '../Common/MethodologyModal';

export interface MuseumFooterProps {
  className?: string;
}

export const MuseumFooter: React.FC<MuseumFooterProps> = ({ className = '' }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MethodologyTab>('about');

  const openModalWithTab = (tab: MethodologyTab) => {
    setActiveTab(tab);
    setModalOpen(true);
  };

  return (
    <>
      <footer
        className={`border-t border-paper-border bg-paper-100/95 py-2.5 px-3 sm:px-6 transition-all duration-300 ${className}`}
        data-testid="museum-footer"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-[11px] sm:text-xs">
          
          {/* Left: Non-Profit & Educational Archival Statement */}
          <div className="flex items-center gap-2 text-ink-700 text-center md:text-left">
            <Sparkles className="w-3.5 h-3.5 text-natural-moss shrink-0 hidden sm:inline" />
            <p>
              <strong className="font-serif font-bold text-ink-900">Avifauna of Vietnam</strong> &copy; {new Date().getFullYear()} — Dự án Giáo dục &amp; Lưu trữ Số Đa dạng Sinh học (Phi Lợi Nhuận)
            </p>
          </div>

          {/* Right: Flat Minimalist Non-Profit Standard Text Links */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center font-medium text-ink-700">
            <button
              type="button"
              onClick={() => openModalWithTab('about')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:text-natural-moss hover:bg-paper-200/80 transition-colors cursor-pointer"
            >
              <Info className="w-3 h-3 text-natural-moss" />
              <span>Giới thiệu</span>
            </button>

            <span className="text-paper-border select-none">•</span>

            <button
              type="button"
              onClick={() => openModalWithTab('data')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:text-natural-moss hover:bg-paper-200/80 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-natural-terracotta" />
              <span>Nguồn dữ liệu &amp; Danh pháp</span>
            </button>

            <span className="text-paper-border select-none">•</span>

            <button
              type="button"
              onClick={() => openModalWithTab('licensing')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:text-natural-moss hover:bg-paper-200/80 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-natural-amber" />
              <span>Bản quyền &amp; Tuyên bố</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Standard Non-Profit Academic Modal */}
      <MethodologyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={activeTab}
      />
    </>
  );
};

export default MuseumFooter;


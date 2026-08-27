import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  Library,
  Scale,
  Award,
  Globe2,
  Volume2,
  CheckCircle2,
  ScrollText
} from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
      data-testid="methodology-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-paper-50 rounded-2xl border-2 border-paper-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-paper-100/90 border-b border-paper-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
                Phương Pháp Luận &amp; Nguồn Dữ Liệu Học Thuật
              </h2>
              <p className="text-xs text-ink-600 font-sans mt-0.5">
                Scientific Methodology, Curatorial Taxonomy &amp; Primary Data Sources
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/80 text-stone-600 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-ink-800 font-sans leading-relaxed">
          {/* Section 1: Taxonomic System */}
          <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
            <div className="flex items-center space-x-2 text-natural-moss font-serif font-bold text-base">
              <Scale className="w-5 h-5" />
              <h3>1. Tiêu Chuẩn Phân Loại Học (Taxonomic Framework)</h3>
            </div>
            <p className="text-xs sm:text-sm text-ink-700">
              Toàn bộ hệ thống danh pháp khoa học và cấu trúc cây tiến hóa phát sinh chủng loại (Phylogenetic Tree) trên website được chuẩn hóa theo <strong>IOC World Bird List (Phiên bản 14.1, 2024)</strong> do <em>International Ornithologists' Union</em> ban hành, đối chiếu đồng bộ với <strong>Clements Checklist of Birds of the World</strong>.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">
                IOC v14.1
              </span>
              <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">
                Clements Checklist v2023/2024
              </span>
              <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">
                Avibase - The World Bird Database
              </span>
            </div>
          </section>

          {/* Section 2: Vietnamese Avifauna Core Literature */}
          <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-3">
            <div className="flex items-center space-x-2 text-natural-terracotta font-serif font-bold text-base">
              <BookOpen className="w-5 h-5" />
              <h3>2. Tài Liệu Nghiên Cứu Điểu Học Việt Nam (Primary Literature)</h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong>GS. Võ Quý &amp; TS. Nguyễn Cử (1995, 1999)</strong>: <em>Danh lục Chim Việt Nam &amp; Chim Việt Nam Tập I, II</em>. NXB Nông nghiệp, Hà Nội — Công trình nền móng quy chuẩn tên tiếng Việt và địa bàn phân bố.
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong>Richard Craik &amp; TS. Lê Mạnh Hùng (2018)</strong>: <em>Birds of Vietnam</em>. Helm Wildlife Guides, Bloomsbury Publishing — Cẩm nang thực địa và phân bố các loài chim đặc hữu hiện đại nhất.
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong>BirdLife International Vietnam Programme &amp; Viện Sinh thái và Tài nguyên Sinh vật (VAST)</strong>: Các báo cáo khoa học mô tả loài đặc hữu mới (*Khướu Ngọc Linh, Khướu Kon Ka Kinh, Khướu vằn đầu đen...*).
                </div>
              </li>
            </ul>
          </section>

          {/* Section 3: Naturalist Plate Archives */}
          <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
            <div className="flex items-center space-x-2 text-natural-ochre font-serif font-bold text-base">
              <ScrollText className="w-5 h-5" />
              <h3>3. Di Sản Tranh Khắc &amp; Minh Họa Tự Nhiên Học (Naturalist Plates)</h3>
            </div>
            <p className="text-xs sm:text-sm text-ink-700">
              Hình ảnh minh họa trên website được trích lục và phục dựng kỹ thuật số từ các bộ sưu tập tranh khắc màu tự nhiên học thuộc phạm vi công cộng (Public Domain) tại <strong>Biodiversity Heritage Library (BHL)</strong>:
            </p>
            <div className="p-3 bg-paper-50 rounded-lg border border-paper-border text-xs text-ink-800 space-y-1 font-serif italic">
              <div>• <em>Les Oiseaux de l'Indochine Française</em> (Jean Delacour &amp; Pierre Jabouille, 1931 - 4 tập). Họa sĩ: Henrik Grönvold.</div>
              <div>• Các công trình minh họa điểu học châu Á của John Gould (1804–1881) và J.G. Keulemans.</div>
            </div>
          </section>

          {/* Section 4: Bioacoustics & Registries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
              <div className="flex items-center space-x-2 text-natural-indigo font-serif font-bold text-base">
                <Volume2 className="w-5 h-5" />
                <h3>4. Âm Thanh Tiếng Hót</h3>
              </div>
              <p className="text-xs text-ink-700">
                Các bản ghi âm tiếng hót và tiếng gọi bầy ngoài thực địa được trích xuất từ kho âm thanh sinh học mở <strong>Xeno-canto.org</strong> theo giấy phép mở Creative Commons (CC BY-NC-SA).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
              <div className="flex items-center space-x-2 text-natural-forest font-serif font-bold text-base">
                <Globe2 className="w-5 h-5" />
                <h3>5. Tình Trạng Bảo Tồn</h3>
              </div>
              <p className="text-xs text-ink-700">
                Đánh giá mức độ đe dọa sinh thái cập nhật từ <strong>IUCN Red List of Threatened Species</strong> và <strong>Sách Đỏ Việt Nam (Phần Động vật)</strong>.
              </p>
            </div>
          </div>

          {/* Section 5: Open Science Statement */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start space-x-3">
            <Award className="w-5 h-5 text-amber-800 mt-0.5 shrink-0" />
            <div>
              <strong>Tuyên bố Khoa học Mở &amp; Giáo dục Bảo tồn:</strong> Dự án được phát triển với mục đích phi thương mại nhằm phục vụ nghiên cứu, giáo dục môi trường, nâng cao nhận thức bảo tồn các loài chim hoang dã và tôn vinh vẻ đẹp thiên nhiên đa dạng sinh học của Việt Nam.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-paper-100 border-t border-paper-border flex items-center justify-between">
          <span className="text-[11px] text-ink-500 font-mono">
            Avifauna of Vietnam Scientific Methodology
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-natural-moss hover:bg-natural-forest text-paper-50 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

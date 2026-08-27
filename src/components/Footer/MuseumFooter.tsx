import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  ChevronUp,
  Sparkles,
  ScrollText,
  Library
} from 'lucide-react';

export interface MuseumFooterProps {
  className?: string;
}

export const MuseumFooter: React.FC<MuseumFooterProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <footer
      className={`border-t border-paper-border bg-paper-100/95 transition-all duration-300 ${className}`}
      data-testid="museum-footer"
    >
      {/* Collapsible Content Area */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? 'max-h-[1200px] opacity-100 py-8' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-paper-border gap-2">
            <div className="flex items-center space-x-2.5 text-natural-moss">
              <Library className="w-5 h-5" />
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-900">
                Phương Pháp Luận, Bản Quyền &amp; Nguồn Dữ Liệu Học Thuật
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-ink-700 bg-paper-200 hover:bg-paper-300 border border-paper-border transition-all self-start sm:self-auto"
            >
              <span>Thu gọn</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Grouped Academic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            {/* Nhóm 1: Hệ Thống Phân Loại & Phương Pháp Luận */}
            <div className="bg-paper-50 rounded-xl p-5 border border-paper-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-natural-moss pb-2 border-b border-paper-border">
                <BookOpen className="w-4 h-4" />
                <h4 className="font-serif font-bold text-sm text-ink-900">
                  1. Hệ Thống Phân Loại &amp; Danh Pháp
                </h4>
              </div>
              <ul className="space-y-2.5 text-ink-700 text-xs leading-relaxed font-sans">
                <li>
                  <strong className="text-ink-900">IOC World Bird List (v14.1 / v14.2):</strong> Chuẩn danh pháp tiếng Anh và cấu trúc tiến hóa họ/chi/loài quốc tế do <em>International Ornithologists' Union</em> công bố.
                </li>
                <li>
                  <strong className="text-ink-900">Delacour &amp; Jabouille (1931):</strong> <em>Les Oiseaux de l'Indochine Française</em> (4 tập), tài liệu phân loại học mẫu mực vùng Đông Dương.
                </li>
                <li>
                  <strong className="text-ink-900">GS. TSKH. Võ Quý (1975, 1981):</strong> <em>Chim Việt Nam</em> (Tập 1 &amp; 2), NXB Khoa học và Kỹ thuật — Nền tảng danh pháp tiếng Việt.
                </li>
                <li>
                  <strong className="text-ink-900">Richard Craik &amp; TS. Lê Mạnh Hùng (2018):</strong> <em>Birds of Vietnam</em>, Helm Wildlife Guides — Cẩm nang thực địa và phân bố cập nhật.
                </li>
              </ul>
            </div>

            {/* Nhóm 2: Vùng Sinh Thái & Bảo Tồn */}
            <div className="bg-paper-50 rounded-xl p-5 border border-paper-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-natural-terracotta pb-2 border-b border-paper-border">
                <Shield className="w-4 h-4" />
                <h4 className="font-serif font-bold text-sm text-ink-900">
                  2. Vùng Sinh Thái &amp; Bảo Tồn
                </h4>
              </div>
              <ul className="space-y-2.5 text-ink-700 text-xs leading-relaxed font-sans">
                <li>
                  <strong className="text-ink-900">BirdLife International:</strong> 6 Vùng Chim Đặc Hữu (Endemic Bird Areas - EBAs) và các Vùng Chim Quan Trọng (IBAs) tại Việt Nam.
                </li>
                <li>
                  <strong className="text-ink-900">IUCN Red List of Threatened Species:</strong> Phân hạng tình trạng bảo tồn toàn cầu (CR, EN, VU, NT, LC).
                </li>
                <li>
                  <strong className="text-ink-900">Sách Đỏ Việt Nam:</strong> Cập nhật hiện trạng các loài nguy cấp, quý hiếm theo chuẩn bảo tồn quốc gia.
                </li>
                <li>
                  <strong className="text-ink-900">Viện Sinh thái &amp; TNST (VAST):</strong> Dữ liệu thực địa từ các Vườn Quốc Gia (Ngọc Linh, Bidoup, Hoàng Liên, Cát Tiên).
                </li>
              </ul>
            </div>

            {/* Nhóm 3: Bản Quyền, Bản Ghi Âm & Tư Liệu Mở */}
            <div className="bg-paper-50 rounded-xl p-5 border border-paper-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-natural-ochre pb-2 border-b border-paper-border">
                <ScrollText className="w-4 h-4" />
                <h4 className="font-serif font-bold text-sm text-ink-900">
                  3. Bản Quyền &amp; Tư Liệu Mở
                </h4>
              </div>
              <ul className="space-y-2.5 text-ink-700 text-xs leading-relaxed font-sans">
                <li>
                  <strong className="text-ink-900">Xeno-canto Foundation:</strong> Dữ liệu âm thanh tiếng hót và tiếng kêu tự nhiên chia sẻ bởi cộng đồng điểu học toàn cầu (Creative Commons CC BY-NC-SA).
                </li>
                <li>
                  <strong className="text-ink-900">Tranh khắc bản cổ điển (BHL / Public Domain):</strong> Lưu trữ từ các tác phẩm điểu học thế kỷ 19 - 20 (H. Grönvold, J. G. Keulemans, John Gould).
                </li>
                <li>
                  <strong className="text-ink-900">Mục đích giáo dục &amp; Phi thương mại:</strong> Ứng dụng phục vụ học tập, nghiên cứu và giáo dục nâng cao nhận thức bảo tồn thiên nhiên đa dạng sinh học Việt Nam.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Bar with Prominent Expand/Collapse Trigger */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Copyright & Mission Statement */}
        <div className="flex items-center space-x-2 text-ink-700 text-center md:text-left">
          <Sparkles className="w-4 h-4 text-natural-moss shrink-0 hidden sm:inline" />
          <p>
            <strong className="font-serif font-bold text-ink-900">Avifauna of Vietnam</strong> &copy; {new Date().getFullYear()} — Giám tuyển &amp; Trực quan hóa Phân loại học Điểu học Việt Nam
          </p>
        </div>

        {/* Right: Expand / Collapse Toggle Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Thu gọn phương pháp luận và nguồn dữ liệu' : 'Mở rộng xem phương pháp luận và nguồn dữ liệu học thuật'}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-paper-200 hover:bg-paper-300 text-ink-900 font-medium border border-paper-border shadow-sm transition-all"
          >
            <Library className="w-3.5 h-3.5 text-natural-moss" />
            <span>
              {isExpanded
                ? '▲ Thu gọn thông tin'
                : '📖 Phương pháp luận & Nguồn Dữ liệu (Bản quyền, Phân loại, Sinh thái) ▼'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MuseumFooter;

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Library,
  Scale,
  Award,
  Volume2,
  CheckCircle2,
  Info,
  ShieldCheck,
  Heart,
  MessageSquarePlus,
  ExternalLink,
  Compass
} from 'lucide-react';

export type MethodologyTab = 'about' | 'data' | 'licensing';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MethodologyTab;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about'
}) => {
  const [activeTab, setActiveTab] = useState<MethodologyTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/70 backdrop-blur-md animate-fadeIn"
      data-testid="methodology-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85dvh] sm:max-h-[90vh] bg-paper-50 rounded-2xl border-2 border-paper-border shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-paper-100/95 border-b border-paper-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-ink-900 line-clamp-1 sm:line-clamp-none">
                  Hồ Sơ Dự Án &amp; Bản Quyền
                </h2>
                <p className="text-[11px] sm:text-xs text-ink-600 font-sans mt-0.5">
                  Avifauna of Vietnam — Bản đồ sinh thái chim Việt Nam
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-xl hover:bg-paper-200 text-ink-700 transition-colors cursor-pointer shrink-0"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation Switcher */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-paper-border/60 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-paper-50 text-natural-forest shadow-xs border border-paper-border'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-paper-200/60'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-natural-moss" />
              <span>Về Dự Án</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-paper-50 text-natural-forest shadow-xs border border-paper-border'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-paper-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-natural-terracotta" />
              <span>Nguồn Dữ Liệu &amp; Danh Pháp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('licensing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'licensing'
                  ? 'bg-paper-50 text-natural-forest shadow-xs border border-paper-border'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-paper-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-natural-amber" />
              <span>Bản Quyền &amp; Tuyên Bố</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-ink-800 font-sans leading-relaxed overscroll-contain">
          
          {/* TAB 1: VỀ DỰ ÁN (ABOUT) */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2.5">
                <div className="flex items-center space-x-2 text-natural-moss font-serif font-bold text-base">
                  <Heart className="w-5 h-5 text-natural-terracotta" />
                  <h3>Sứ Mệnh Giáo Dục &amp; Tôn Vinh Thiên Nhiên Việt Nam</h3>
                </div>
                <p className="text-ink-700 leading-relaxed">
                  <strong>Avifauna of Vietnam</strong> là dự án số hóa tự nhiên học phi thương mại, tôn vinh và nâng cao nhận thức bảo tồn muôn loài chim hoang dã của Việt Nam.
                </p>
                <p className="text-ink-700 leading-relaxed">
                  Nền tảng tích hợp bản đồ sinh thái 07 vùng EBA, cây phả hệ tiến hóa và cẩm nang hình thái học giúp cộng đồng tiếp cận tri thức điểu học trực quan, chuẩn xác.
                </p>
              </section>

              {/* Key Highlights Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-paper-100 border border-paper-border text-center flex flex-col justify-center items-center">
                  <span className="font-serif font-bold text-xl sm:text-2xl text-natural-forest">81</span>
                  <span className="text-xs font-semibold text-ink-900 mt-0.5">Loài Mẫu Vật</span>
                  <span className="text-[11px] text-ink-600 font-sans mt-0.5">Điểu học Việt Nam</span>
                </div>
                <div className="p-3 rounded-xl bg-paper-100 border border-paper-border text-center flex flex-col justify-center items-center">
                  <span className="font-serif font-bold text-sm sm:text-base text-natural-forest leading-tight">17 Bộ • 36 Họ</span>
                  <span className="text-xs font-semibold text-ink-900 mt-0.5">69 Chi phân loại</span>
                  <span className="text-[11px] text-ink-600 font-sans mt-0.5">Chuẩn IOC v14.2</span>
                </div>
                <div className="p-3 rounded-xl bg-paper-100 border border-paper-border text-center flex flex-col justify-center items-center">
                  <span className="font-serif font-bold text-xl sm:text-2xl text-natural-terracotta">18</span>
                  <span className="text-xs font-semibold text-ink-900 mt-0.5">Loài Đặc Hữu</span>
                  <span className="text-[11px] text-ink-600 font-sans mt-0.5">13 đặc hữu VN + 5 Đông Dương</span>
                </div>
                <div className="p-3 rounded-xl bg-paper-100 border border-paper-border text-center flex flex-col justify-center items-center">
                  <span className="font-serif font-bold text-xl sm:text-2xl text-natural-moss">07</span>
                  <span className="text-xs font-semibold text-ink-900 mt-0.5">Vùng EBA</span>
                  <span className="text-[11px] text-ink-600 font-sans mt-0.5">BirdLife International</span>
                </div>
              </div>

              {/* 3 Trụ Cột Tính Năng */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-paper-100 border border-paper-border space-y-1">
                  <h4 className="font-serif font-bold text-ink-900 text-xs sm:text-sm">🗺️ 07 Vùng Đặc Hữu (EBAs)</h4>
                  <p className="text-[11px] sm:text-xs text-ink-600">Định vị địa bàn cư trú, ranh giới sinh thái và tọa độ chính xác của các loài đặc hữu.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-paper-100 border border-paper-border space-y-1">
                  <h4 className="font-serif font-bold text-ink-900 text-xs sm:text-sm">🌳 Cây Phả Hệ Trực Quan</h4>
                  <p className="text-[11px] sm:text-xs text-ink-600">Khám phá mối quan hệ tiến hóa từ Lớp Chim (Aves) đến 17 Bộ, Họ, Chi và từng Loài theo chuẩn IOC v14.2.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-paper-100 border border-paper-border space-y-1">
                  <h4 className="font-serif font-bold text-ink-900 text-xs sm:text-sm">📖 Cẩm Nang Nhận Dạng</h4>
                  <p className="text-[11px] sm:text-xs text-ink-600">Phân tích giải phẫu mỏ, cánh, thính giác tiếng hót và trích lục thư tịch học thuật.</p>
                </div>
              </div>

              {/* Section: Đóng Góp Ý Kiến & Báo Lỗi Dữ Liệu (Feedback & Errata) */}
              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-3">
                <div className="flex items-center space-x-2 text-natural-moss font-serif font-bold text-base">
                  <MessageSquarePlus className="w-5 h-5 text-natural-terracotta" />
                  <h3>Đóng Góp Ý Kiến &amp; Báo Lỗi Dữ Liệu (Feedback &amp; Errata)</h3>
                </div>

                <p className="text-ink-700 leading-relaxed text-xs sm:text-sm">
                  Nhằm đảm bảo cơ sở dữ liệu Điểu học Việt Nam luôn chính xác, khách quan và cập nhật nhất, Ban Giám tuyển luôn trân trọng đón nhận mọi ý kiến đóng góp, đính chính danh pháp hoặc báo lỗi trải nghiệm từ cộng đồng.
                </p>

                <div className="pt-1">
                  <a
                    href="https://forms.gle/iuNeqrmxN7M4Yvgs9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper-50 hover:bg-paper-200/80 text-natural-forest border border-natural-moss/30 hover:border-natural-moss font-semibold text-xs rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-natural-moss group-hover:scale-110 transition-transform" />
                    <span>Mở biểu mẫu gửi ý kiến đóng góp &amp; báo lỗi</span>
                    <ExternalLink className="w-3.5 h-3.5 text-natural-moss group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: NGUỒN DỮ LIỆU & DANH PHÁP (DATA & TAXONOMY) */}
          {activeTab === 'data' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Section 1: Taxonomic System */}
              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
                <div className="flex items-center space-x-2 text-natural-moss font-serif font-bold text-base">
                  <Scale className="w-5 h-5" />
                  <h3>1. Tiêu Chuẩn Phân Loại Học (Taxonomic Framework)</h3>
                </div>
                <p className="text-ink-700 leading-relaxed">
                  Toàn bộ hệ thống danh pháp khoa học và cấu trúc cây tiến hóa phát sinh chủng loại trên website được chuẩn hóa theo <strong>IOC World Bird List (v14.1 / v14.2, 2024)</strong> do <em>International Ornithologists' Union</em> ban hành, đối chiếu đồng bộ với <strong>Clements Checklist of Birds of the World</strong> và <strong>Avibase</strong>.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">IOC World Bird List v14.2</span>
                  <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">Clements Checklist</span>
                  <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">Avibase ID</span>
                  <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-800 border border-paper-border font-mono">GBIF Taxon Key</span>
                </div>
              </section>

              {/* Section 2: Core Literature */}
              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-3">
                <div className="flex items-center space-x-2 text-natural-terracotta font-serif font-bold text-base">
                  <BookOpen className="w-5 h-5" />
                  <h3>2. Tài Liệu Tham Khảo</h3>
                </div>
                <ul className="space-y-2 text-ink-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Danh mục bảo tồn quốc gia:</strong> Phân hạng bảo vệ theo <strong>Nghị định 84/2021/NĐ-CP</strong> (Nhóm IB, IIB), <strong>Nghị định 160/2013/NĐ-CP</strong>, <strong>Chỉ thị 04/CT-TTg</strong> của Thủ tướng Chính phủ và <strong>Sách Đỏ Việt Nam (2007)</strong>.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>BirdLife International &amp; Viện Sinh thái và Tài nguyên Sinh vật (VAST):</strong> Dữ liệu phân vùng 07 EBAs cùng các nghiên cứu mô tả loài đặc hữu mới tại Ngọc Linh, Kon Ka Kinh, Hoàng Liên Sơn.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong><em>Chim Việt Nam</em></strong>, <strong><em>Danh lục Chim Việt Nam</em></strong> (GS. TSKH. Võ Quý &amp; TS. Nguyễn Cử, 1975, 1981, 1995); <strong><em>Birds of Vietnam</em></strong> (Richard Craik &amp; TS. Lê Mạnh Hùng, 2018); <strong><em>Les Oiseaux de l'Indochine Française</em></strong> (Jean Delacour &amp; Pierre Jabouille, 1931).
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 3: BẢN QUYỀN & TUYÊN BỐ (LICENSING & DISCLAIMER) */}
          {activeTab === 'licensing' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
                <div className="flex items-center space-x-2 text-natural-amber font-serif font-bold text-base">
                  <ShieldCheck className="w-5 h-5" />
                  <h3>1. Tuyên Bố Bản Quyền Hình Ảnh &amp; Tư Liệu Mở</h3>
                </div>
                <p className="text-ink-700 leading-relaxed">
                  Toàn bộ hình ảnh thực địa và tư liệu định danh trên website được tổng hợp từ các nhiếp ảnh gia tự nhiên hoang dã, cộng đồng nghiên cứu thực địa <strong>iNaturalist</strong> và các nguồn dữ liệu khoa học mở theo giấy phép <strong>Creative Commons (CC BY, CC BY-SA, CC BY-NC)</strong>, luôn ghi nhận đầy đủ quyền tác giả và nguồn gốc bản quyền của từng bức ảnh.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
                <div className="flex items-center space-x-2 text-natural-moss font-serif font-bold text-base">
                  <Volume2 className="w-5 h-5" />
                  <h3>2. Âm Thanh Sinh Học (Bioacoustics)</h3>
                </div>
                <p className="text-ink-700 leading-relaxed">
                  Bản ghi âm tiếng hót và tiếng kêu tự nhiên được trích xuất từ <strong>Xeno-canto Foundation</strong> theo giấy phép mở phi thương mại (Creative Commons CC BY-NC-SA), giữ nguyên quyền tác giả và nguồn ghi âm thực địa của các chuyên gia điểu học.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2">
                <div className="flex items-center space-x-2 text-natural-forest font-serif font-bold text-base">
                  <Compass className="w-5 h-5" />
                  <h3>3. Dữ Liệu Bản Đồ Địa Lý &amp; Không Gian (GIS &amp; Basemaps)</h3>
                </div>
                <p className="text-ink-700 leading-relaxed">
                  Lớp bản đồ nền địa lý sinh thái sử dụng dữ liệu không gian mở từ cộng đồng <strong>OpenStreetMap</strong> (giấy phép ODbL) và phong cách trực quan hóa từ <strong>CARTO Basemaps</strong> theo tiêu chuẩn nghiên cứu và giáo dục phi thương mại.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start space-x-3">
                <Award className="w-5 h-5 text-amber-800 mt-0.5 shrink-0" />
                <div className="space-y-1.5 leading-relaxed">
                  <p>
                    <strong>Tuyên bố Miễn Trừ Trách Nhiệm &amp; Giá Trị Tham Khảo:</strong> Toàn bộ dữ liệu, mô tả và bản đồ phân bố trên nền tảng chỉ có giá trị cho mục đích tham khảo. Dù Ban Giám tuyển luôn nỗ lực đối soát từ các nguồn tài liệu tin cậy, thông tin vẫn có thể phát sinh sai sót, thiếu sót hoặc chưa kịp cập nhật theo biến động phân loại mới nhất. Chúng tôi luôn trân trọng đón nhận mọi ý kiến đóng góp, đính chính từ cộng đồng để ngày càng hoàn thiện hơn.
                  </p>
                  <p className="text-[11px] text-amber-900/80">
                    Mọi nhãn hiệu, danh pháp khoa học và dữ liệu phân bố đều thuộc về các cơ quan chủ quản tương ứng (BirdLife International, IUCN, IOC World Bird List, Xeno-canto, iNaturalist, OpenStreetMap, CARTO).
                  </p>
                </div>
              </section>
            </div>
          )}

        </div>

        {/* Minimalist Flat Status Footer */}
        <div className="px-6 py-2.5 bg-paper-100/90 border-t border-paper-border flex items-center justify-between text-[11px] text-ink-500 font-mono">
          <span>Avifauna of Vietnam • Dự án Giáo dục Phi Lợi Nhuận</span>
          <span className="hidden sm:inline">Nhấn ESC hoặc click ngoài để đóng</span>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;

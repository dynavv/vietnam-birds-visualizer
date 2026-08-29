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
  Send
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
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('errata');
  const [feedbackContact, setFeedbackContact] = useState<string>('');
  const [feedbackContent, setFeedbackContent] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('agy_avifauna_community_feedback') || '[]';
        const list = JSON.parse(stored);
        list.push({
          id: `fb-${Date.now()}`,
          category: feedbackCategory,
          contact: feedbackContact.trim(),
          content: feedbackContent.trim(),
          timestamp: new Date().toISOString()
        });
        window.localStorage.setItem('agy_avifauna_community_feedback', JSON.stringify(list));
      }
    } catch {
      // Safe fallback
    }

    setFeedbackSubmitted(true);
    setFeedbackContent('');
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
      data-testid="methodology-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-paper-50 rounded-2xl border-2 border-paper-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-6 py-4 bg-paper-100/95 border-b border-paper-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-ink-900">
                  Hồ Sơ Dự Án, Nguồn Học Thuật &amp; Bản Quyền
                </h2>
                <p className="text-[11px] sm:text-xs text-ink-600 font-sans mt-0.5">
                  Avifauna of Vietnam — Open Digital Humanities &amp; Biodiversity Educational Archive
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-paper-200 text-ink-600 transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation Switcher */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-paper-border/60">
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-ink-800 font-sans leading-relaxed">
          
          {/* TAB 1: VỀ DỰ ÁN (ABOUT) */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <section className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-2.5">
                <div className="flex items-center space-x-2 text-natural-moss font-serif font-bold text-base">
                  <Heart className="w-5 h-5 text-natural-terracotta" />
                  <h3>Sứ Mệnh Giáo Dục &amp; Tôn Vinh Thiên Nhiên Việt Nam</h3>
                </div>
                <p className="text-ink-700 leading-relaxed">
                  <strong>Avifauna of Vietnam</strong> là dự án số hóa bảo tàng tự nhiên học tương tác, phi thương mại, được xây dựng nhằm mục đích giới thiệu và nâng cao nhận thức về thế giới các loài chim hoang dã phong phú của Việt Nam đến với đông đảo học sinh, sinh viên, các nhà nghiên cứu và công chúng yêu thiên nhiên.
                </p>
                <p className="text-ink-700 leading-relaxed">
                  Ứng dụng kết hợp giữa hệ thống bản đồ địa lý sinh thái (GIS Mapping) của 6 Vùng Chim Đặc Hữu (EBAs), cây phả hệ phát sinh chủng loại (Phylogenetic Tree) và cẩm nang nhận dạng hình thái chi tiết nhằm mang lại trải nghiệm khám phá khoa học trực quan, trang nhã và cuốn hút nhất.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-paper-100 border border-paper-border space-y-1">
                  <h4 className="font-serif font-bold text-ink-900 text-xs sm:text-sm">🗺️ 6 Vùng Đặc Hữu (EBAs)</h4>
                  <p className="text-[11px] sm:text-xs text-ink-600">Định vị địa bàn cư trú, ranh giới sinh thái và tọa độ chính xác của các loài đặc hữu.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-paper-100 border border-paper-border space-y-1">
                  <h4 className="font-serif font-bold text-ink-900 text-xs sm:text-sm">🌳 Cây Phả Hệ Trực Quan</h4>
                  <p className="text-[11px] sm:text-xs text-ink-600">Khám phá mối quan hệ tiến hóa từ Lớp Chim (Aves) đến 16 Bộ, Họ, Chi và từng Loài.</p>
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

                {!isFormOpen && !feedbackSubmitted && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper-50 hover:bg-paper-200/80 text-natural-forest border border-natural-moss/30 hover:border-natural-moss font-semibold text-xs rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                    >
                      <MessageSquarePlus className="w-4 h-4 text-natural-moss group-hover:scale-110 transition-transform" />
                      <span>Mở biểu mẫu gửi ý kiến đóng góp &amp; báo lỗi</span>
                      <span className="text-natural-moss text-xs group-hover:translate-x-0.5 transition-transform">›</span>
                    </button>
                  </div>
                )}

                {isFormOpen && !feedbackSubmitted && (
                  <div className="pt-2 border-t border-paper-border/60 space-y-2.5 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink-800">Điền thông tin đóng góp:</span>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="text-[11px] text-ink-500 hover:text-ink-800 underline cursor-pointer"
                      >
                        Thu gọn biểu mẫu
                      </button>
                    </div>

                    <form onSubmit={handleFeedbackSubmit} className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                            Chủ đề đóng góp <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={feedbackCategory}
                            onChange={(e) => setFeedbackCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-paper-50 border border-paper-border rounded-lg text-xs text-ink-900 focus:ring-1 focus:ring-natural-moss focus:outline-none cursor-pointer"
                          >
                            <option value="errata">📖 Đính chính dữ liệu Điểu học (Tên, phân loại, sinh cảnh)</option>
                            <option value="bug">🐛 Báo lỗi kỹ thuật / hiển thị giao diện</option>
                            <option value="feature">💡 Đề xuất bổ sung loài chim / tính năng mới</option>
                            <option value="media">📷 Đóng góp ảnh chụp hoặc tư liệu âm thanh</option>
                            <option value="general">💬 Góp ý chung khác</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                            Họ tên hoặc Email liên hệ <span className="text-ink-400 font-normal">(Tùy chọn)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: nguyen.van.a@gmail.com"
                            value={feedbackContact}
                            onChange={(e) => setFeedbackContact(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-paper-50 border border-paper-border rounded-lg text-xs text-ink-900 placeholder:text-ink-400 focus:ring-1 focus:ring-natural-moss focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                          Nội dung chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Mô tả cụ thể thông tin bạn muốn đính chính hoặc sự cố bạn gặp phải..."
                          value={feedbackContent}
                          onChange={(e) => setFeedbackContent(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-paper-50 border border-paper-border rounded-lg text-xs text-ink-900 placeholder:text-ink-400 focus:ring-1 focus:ring-natural-moss focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[10.5px] text-ink-500 italic">
                          Dữ liệu được lưu trữ bảo mật cho mục đích hoàn thiện dự án.
                        </p>
                        <button
                          type="submit"
                          disabled={!feedbackContent.trim()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-natural-forest hover:bg-natural-moss disabled:opacity-50 text-paper-50 font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Đóng Góp</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {feedbackSubmitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 space-y-2 animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Cảm ơn bạn đã gửi đóng góp quý báu!</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Thông tin của bạn đã được ghi nhận. Ban Giám tuyển sẽ xem xét và cập nhật vào các phiên bản giám định tiếp theo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackSubmitted(false);
                        setIsFormOpen(false);
                      }}
                      className="text-xs text-emerald-700 underline hover:text-emerald-900 cursor-pointer pt-1 block"
                    >
                      Gửi thêm ý kiến khác
                    </button>
                  </div>
                )}
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
                  <h3>2. Tài Liệu Nghiên Cứu Điểu Học Kinh Điển</h3>
                </div>
                <ul className="space-y-2 text-ink-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>GS. TSKH. Võ Quý &amp; TS. Nguyễn Cử (1975, 1981, 1995)</strong>: <em>Chim Việt Nam</em> (Tập I &amp; II) và <em>Danh lục Chim Việt Nam</em>. NXB Khoa học &amp; Kỹ thuật — Nền tảng danh pháp tiếng Việt.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Richard Craik &amp; TS. Lê Mạnh Hùng (2018)</strong>: <em>Birds of Vietnam</em>. Helm Wildlife Guides — Cẩm nang thực địa và cập nhật địa bàn phân bố.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Jean Delacour &amp; Pierre Jabouille (1931)</strong>: <em>Les Oiseaux de l'Indochine Française</em> (4 tập), Paris.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>BirdLife International &amp; Viện Sinh thái và Tài nguyên Sinh vật (VAST)</strong>: Dữ liệu phân vùng 6 EBAs và các nghiên cứu mô tả loài đặc hữu mới tại Ngọc Linh, Kon Ka Kinh, Hoàng Liên Sơn.
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

              <section className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start space-x-3">
                <Award className="w-5 h-5 text-amber-800 mt-0.5 shrink-0" />
                <div>
                  <strong>Tuyên bố Phi Thương Mại &amp; Miễn Trừ Trách Nhiệm (Non-Commercial Disclaimer):</strong> Toàn bộ nội dung của dự án phục vụ 100% cho mục đích nghiên cứu, học tập và giáo dục cộng đồng. Mọi nhãn hiệu, danh pháp khoa học và dữ liệu phân bố đều thuộc về các cơ quan chủ quản tương ứng (BirdLife International, IUCN, IOC World Bird List, Xeno-canto, iNaturalist).
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

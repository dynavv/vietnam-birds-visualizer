import React from 'react';
import {
  BookOpen,
  Feather,
  Shield,
  Library,
  Volume2
} from 'lucide-react';
import { TaxonomyProvider, useTaxonomy } from './context/TaxonomyContext';
import { MuseumHeader } from './components/Header/MuseumHeader';
import { SearchFilterBar } from './components/Header/SearchFilterBar';
import { VietnamEBAMap } from './components/MapView/VietnamEBAMap';
import { SunburstView } from './components/SunburstView/SunburstView';
import { CuratorView } from './components/CuratorView/CuratorView';

export const MainContent: React.FC = () => {
  const { activeView, setActiveView } = useTaxonomy();

  return (
    <main
      className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6"
      data-testid="main-content-area"
    >
      {activeView === 'map' && (
        <div key="map-view" className="animate-fadeIn" data-testid="active-map-view">
          <VietnamEBAMap />
        </div>
      )}

      {activeView === 'sunburst' && (
        <div key="sunburst-view" className="animate-fadeIn" data-testid="active-sunburst-view">
          <SunburstView onViewCurator={() => setActiveView('curator')} />
        </div>
      )}

      {activeView === 'curator' && (
        <div key="curator-view" className="animate-fadeIn" data-testid="active-curator-view">
          <CuratorView
            onViewMap={() => setActiveView('map')}
            onViewSunburst={() => setActiveView('sunburst')}
          />
        </div>
      )}
    </main>
  );
};

export const MuseumFooter: React.FC = () => {
  return (
    <footer
      className="border-t border-paper-border bg-paper-100/90 text-ink-700 py-10 px-4 sm:px-6 mt-8 transition-colors"
      data-testid="museum-footer"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header in Footer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-paper-border/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-natural-moss/10 rounded-xl text-natural-moss border border-natural-moss/20">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-ink-900 tracking-wide">
                Avifauna of Vietnam • Thư Viện Điểu Học &amp; Đa Dạng Sinh Học
              </h3>
              <p className="text-xs text-ink-500 font-sans">
                Naturalist Archive &amp; Interactive Phylogenetic Explorer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-natural-forest font-serif italic bg-paper-50 px-3 py-1.5 rounded-lg border border-paper-border">
            <Library className="w-4 h-4 text-natural-moss" />
            <span>Tư liệu lịch sử tự nhiên &amp; phân loại học chuẩn mực</span>
          </div>
        </div>

        {/* Citations and Reference Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-xs leading-relaxed">
          {/* Column 1: Taxonomic Authorities */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-natural-moss" />
              <span>Hệ Thống Phân Loại &amp; Danh Pháp</span>
            </h4>
            <ul className="space-y-2 text-ink-600">
              <li>
                <strong className="text-ink-800">IOC World Bird List (v14.1 / v14.2):</strong> Chuẩn danh pháp tiếng Anh và cấu trúc tiến hóa họ/chi/loài quốc tế do International Ornithologists' Union công bố.
              </li>
              <li>
                <strong className="text-ink-800">Delacour &amp; Jabouille (1931):</strong> <em>Les Oiseaux de l'Indochine Française</em> (4 tập), tài liệu phân loại học mẫu mực vùng Đông Dương.
              </li>
              <li>
                <strong className="text-ink-800">GS. TSKH. Võ Quý (1975, 1981):</strong> <em>Chim Việt Nam</em> (Tập 1 &amp; 2), NXB Khoa học và Kỹ thuật — Nền tảng danh pháp tiếng Việt.
              </li>
            </ul>
          </div>

          {/* Column 2: Geographic & Conservation Data */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-natural-terracotta" />
              <span>Vùng Sinh Thái &amp; Bảo Tồn</span>
            </h4>
            <ul className="space-y-2 text-ink-600">
              <li>
                <strong className="text-ink-800">BirdLife International:</strong> 6 Vùng Chim Đặc Hữu (Endemic Bird Areas - EBAs) và các Vùng Chim Quan Trọng (IBAs) tại Việt Nam.
              </li>
              <li>
                <strong className="text-ink-800">IUCN Red List of Threatened Species:</strong> Phân hạng tình trạng bảo tồn toàn cầu (CR, EN, VU, NT, LC).
              </li>
              <li>
                <strong className="text-ink-800">Sách Đỏ Việt Nam:</strong> Cập nhật hiện trạng các loài nguy cấp, quý hiếm theo chuẩn quốc gia.
              </li>
            </ul>
          </div>

          {/* Column 3: Audio & Illustrated Media */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-natural-ochre" />
              <span>Bản Ghi Âm &amp; Bản Vẽ Khắc Bản</span>
            </h4>
            <ul className="space-y-2 text-ink-600">
              <li>
                <strong className="text-ink-800">Xeno-canto Foundation:</strong> Dữ liệu âm thanh tiếng hót và tiếng kêu tự nhiên chia sẻ bởi cộng đồng điểu học toàn cầu (Creative Commons).
              </li>
              <li>
                <strong className="text-ink-800">Tranh khắc bản cổ điển:</strong> Lưu trữ từ các tác phẩm điểu học thế kỷ 19 - 20 (H. Grönvold, J. G. Keulemans).
              </li>
              <li>
                <strong className="text-ink-800">Mục đích giáo dục:</strong> Ứng dụng phi thương mại phục vụ học tập, nghiên cứu và giáo dục nâng cao nhận thức bảo tồn thiên nhiên.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-6 border-t border-paper-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>
            Avifauna of Vietnam &copy; {new Date().getFullYear()} — Giám tuyển &amp; Trực quan hóa Phân loại học Điểu học Việt Nam
          </p>
          <div className="flex items-center space-x-1 text-natural-forest">
            <span>Dành cho những người yêu thiên nhiên và các loài chim hoang dã Việt Nam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <TaxonomyProvider>
      <div className="min-h-screen bg-paper-50 flex flex-col font-sans text-ink-900 selection:bg-natural-moss/20 selection:text-natural-forest">
        <MuseumHeader />
        <SearchFilterBar />
        <MainContent />
        <MuseumFooter />
      </div>
    </TaxonomyProvider>
  );
}

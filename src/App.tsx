import { Compass, Feather, TreePine } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-paper-50 flex flex-col">
      <header className="border-b border-paper-border bg-paper-100/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-natural-moss/10 rounded-lg text-natural-moss">
            <Feather className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-ink-900 tracking-wide">
              Avifauna of Vietnam
            </h1>
            <p className="text-xs text-ink-600 font-sans uppercase tracking-widest">
              Giám tuyển &amp; Trực quan hóa Phân loại học Chim Việt Nam
            </p>
          </div>
        </div>

        <nav className="flex items-center space-x-2 bg-paper-200/60 p-1 rounded-lg border border-paper-border text-sm font-medium">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-paper-50 text-ink-900 shadow-sm">
            <Compass className="w-4 h-4 text-natural-moss" />
            <span>Bản đồ EBA</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-ink-600 hover:text-ink-900 hover:bg-paper-100">
            <TreePine className="w-4 h-4" />
            <span>Cây Phân loại</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-ink-600 hover:text-ink-900 hover:bg-paper-100">
            <Feather className="w-4 h-4" />
            <span>Giám tuyển Mẫu vật</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="bg-paper-100 border border-paper-border rounded-xl p-8 shadow-paper-card text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
            Naturalist Editorial Archive
          </span>
          <h2 className="text-3xl font-serif font-bold text-ink-900">
            Hệ Thống Phân Loại &amp; Sinh Cảnh Chim Việt Nam
          </h2>
          <p className="text-ink-700 max-w-2xl mx-auto leading-relaxed">
            Dự án trực quan hóa phân loại học và bản đồ sinh thái các loài chim đặc hữu và bản địa tại Việt Nam theo chuẩn IOC / Clements và Sách Đỏ IUCN.
          </p>
        </div>
      </main>

      <footer className="border-t border-paper-border py-4 px-6 text-center text-xs text-ink-500 bg-paper-100">
        Avifauna of Vietnam &copy; 2026 — Dữ liệu phân loại học &amp; sinh cảnh chim Việt Nam
      </footer>
    </div>
  );
}

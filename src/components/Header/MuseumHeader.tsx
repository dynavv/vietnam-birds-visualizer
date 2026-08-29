import React, { useState, useRef, useEffect } from 'react';
import { Compass, TreePine, Feather, Dices, Search, X, Camera } from 'lucide-react';
import { useTaxonomy, ViewMode } from '../../context/TaxonomyContext';

export interface MuseumHeaderProps {
  className?: string;
  onOpenVisionDetector?: () => void;
}

interface NavTabItem {
  id: ViewMode;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_TABS: NavTabItem[] = [
  {
    id: 'map',
    label: 'Bản đồ Sinh thái',
    sublabel: 'EBA Map',
    icon: Compass
  },
  {
    id: 'sunburst',
    label: 'Cây Phả hệ',
    sublabel: 'Phylogeny Tree',
    icon: TreePine
  },
  {
    id: 'curator',
    label: 'Cẩm nang Nhận dạng',
    sublabel: 'Field Guide',
    icon: Feather
  }
];

export const MuseumHeader: React.FC<MuseumHeaderProps> = ({
  className = '',
  onOpenVisionDetector
}) => {
  const {
    activeView,
    setActiveView,
    selectRandomEndemic,
    allSpecies,
    selectSpecies,
    searchQuery,
    setSearchQuery
  } = useTaxonomy();

  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleRandomClick = () => {
    setDiceRolling(true);
    selectRandomEndemic();
    setTimeout(() => {
      setDiceRolling(false);
    }, 450);
  };

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isSearchOpen]);

  // Filtered live results for quick search popup
  const searchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allSpecies
      .filter(s =>
        s.vietnameseName.toLowerCase().includes(query) ||
        s.scientificName.toLowerCase().includes(query) ||
        s.englishName.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [allSpecies, searchQuery]);

  return (
    <header
      className={`border-b border-paper-border bg-paper-100/90 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-40 shadow-paper-card ${className}`}
      data-testid="museum-header"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand / Emblem & Title — Click to return to MainPage (EBA Map) */}
        <button
          type="button"
          onClick={() => setActiveView('map')}
          aria-label="Quay về trang chính Bản đồ Sinh thái EBA"
          className="flex items-center space-x-3 self-start md:self-auto text-left group cursor-pointer transition-all hover:opacity-95 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none border-0 bg-transparent p-0"
        >
          <div className="p-2 bg-natural-moss/10 group-hover:bg-natural-moss/20 rounded-xl text-natural-moss border border-natural-moss/20 shadow-sm flex items-center justify-center transition-colors">
            <Feather className="w-5 h-5 transform -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-serif font-bold text-ink-900 tracking-wide group-hover:text-natural-forest transition-colors">
                Avifauna of Vietnam
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9.5px] uppercase font-mono font-semibold tracking-wider bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
                Archive &amp; Specimen
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-ink-600 font-sans tracking-wider uppercase font-medium">
              Giám tuyển &amp; Trực quan hóa Phân loại học Chim Việt Nam
            </p>
          </div>
        </button>

        {/* Center: 3-View Navigation Tabs */}
        <nav
          className="flex items-center bg-paper-200/70 p-0.5 rounded-xl border border-paper-border text-xs font-medium shadow-inner"
          role="tablist"
          aria-label="Chế độ xem trực quan hóa"
        >
          {NAV_TABS.map((tab) => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-paper-50 text-ink-900 shadow-sm font-semibold border border-paper-border/80'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-paper-100/80'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-natural-moss' : 'text-ink-500'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Vision AI, Search & Random Discovery Hook */}
        <div className="flex items-center gap-2 self-end md:self-auto relative">
          
          {/* Bird Vision AI Detector Trigger Button */}
          <button
            type="button"
            onClick={onOpenVisionDetector}
            aria-label="Nhận diện loài chim qua ảnh AI"
            title="Giám định loài chim bằng Thị giác AI (Gemini 2.5 Flash)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper-100 hover:bg-paper-200 text-ink-800 border border-paper-border hover:border-natural-moss/40 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
          >
            <Camera className="w-3.5 h-3.5 text-natural-moss group-hover:scale-110 transition-transform" />
            <span>Nhận Diện AI</span>
          </button>
          
          {/* Expandable Live Search Bar */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-paper-50 border border-natural-moss/40 rounded-xl px-2.5 py-1 shadow-paper-card w-48 sm:w-64 transition-all duration-300">
                <Search className="w-3.5 h-3.5 text-natural-moss shrink-0 mr-1.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên chim..."
                  className="w-full bg-transparent text-xs text-ink-900 placeholder:text-ink-400 outline-none border-none p-0"
                  autoFocus
                />
                {/* Single Smart X Button: Clears query if text exists, closes if empty */}
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery) {
                      setSearchQuery('');
                    } else {
                      setIsSearchOpen(false);
                    }
                  }}
                  className="p-0.5 text-ink-400 hover:text-ink-800 transition-colors cursor-pointer"
                  title={searchQuery ? 'Xóa từ khóa' : 'Đóng tìm kiếm (ESC)'}
                  aria-label={searchQuery ? 'Xóa từ khóa' : 'Đóng tìm kiếm'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                title="Tìm kiếm loài chim"
                aria-label="Tìm kiếm loài chim"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-700 border border-paper-border text-xs transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-natural-moss" />
                <span className="hidden lg:inline text-ink-600 font-sans">Tìm kiếm</span>
              </button>
            )}

            {/* Quick Search Live Dropdown Results (Solid Opaque Card to stop bleed-through) */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 right-0 w-72 bg-[#FAF8F5] border-2 border-paper-border rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                <div className="px-3 py-1 text-[10px] font-mono text-ink-500 uppercase tracking-wider border-b border-paper-border/60 flex justify-between bg-paper-100/70">
                  <span>Kết quả ({searchResults.length})</span>
                  <span>Nhấn để xem</span>
                </div>
                {searchResults.map(sp => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      selectSpecies(sp.id);
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-natural-moss/10 flex items-center justify-between gap-2 border-b border-paper-border/40 last:border-0 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-ink-900 truncate">
                        {sp.vietnameseName}
                      </div>
                      <div className="text-[10px] font-serif italic text-natural-forest truncate">
                        {sp.scientificName}
                      </div>
                    </div>
                    {sp.isEndemic && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-natural-amber/15 text-natural-amber font-semibold rounded shrink-0">
                        Đặc hữu
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Random Discovery Button (Living CTA with Ambient Glow & Shimmer) */}
          <button
            type="button"
            onClick={handleRandomClick}
            aria-label="Khám phá ngẫu nhiên một loài chim"
            title="Khám phá ngẫu nhiên báu vật chim quý Việt Nam"
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-natural-moss text-paper-50 hover:bg-natural-forest active:scale-95 transition-all text-xs font-semibold border border-natural-moss/60 cursor-pointer overflow-hidden animate-breathing-glow"
          >
            {/* Periodic Golden Shimmer Sweep Animation */}
            <span
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep pointer-events-none"
            />

            <Dices
              className={`w-3.5 h-3.5 transition-transform duration-500 animate-dice-wobble ${
                diceRolling ? 'rotate-180 scale-125 text-natural-amber' : 'group-hover:rotate-45'
              }`}
            />
            <span className="tracking-wide">
              <span className="hidden sm:inline">Khám phá</span> ngẫu nhiên
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default MuseumHeader;

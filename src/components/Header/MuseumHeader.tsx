import React, { useState, useRef, useEffect } from 'react';
import { Compass, TreePine, Feather, Dices, Search, X } from 'lucide-react';
import { useTaxonomy, ViewMode } from '../../context/TaxonomyContext';

export interface MuseumHeaderProps {
  className?: string;}

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
  className = ''
}) => {
  const {
    activeView,
    setActiveView,
    selectRandomEndemic,
    allSpecies,
    selectSpecies,
    searchQuery,
    setSearchQuery,
    discoveredSpeciesIds
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
      className={`border-b border-paper-border bg-paper-100/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 sticky top-0 z-40 shadow-paper-card w-full ${className}`}
      data-testid="museum-header"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-6 flex-nowrap w-full">
        
        {/* Brand / Emblem & Title — Click to return to MainPage (EBA Map) */}
        <button
          type="button"
          onClick={() => setActiveView('map')}
          aria-label="Quay về trang chính Bản đồ Sinh thái EBA"
          className="flex items-center space-x-3 shrink-0 text-left group cursor-pointer transition-all hover:opacity-95 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none border-0 bg-transparent p-0"
        >
          <div className="p-2 bg-natural-moss/10 group-hover:bg-natural-moss/20 rounded-xl text-natural-moss border border-natural-moss/20 shadow-xs flex items-center justify-center transition-colors shrink-0">
            <Feather className="w-5 h-5 transform -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <h1 className="text-base sm:text-lg md:text-xl font-serif font-bold text-ink-900 tracking-wide group-hover:text-natural-forest transition-colors whitespace-nowrap">
                Avifauna of Vietnam
              </h1>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[9.5px] uppercase font-mono font-semibold tracking-wider bg-natural-moss/10 text-natural-moss border border-natural-moss/20 whitespace-nowrap">
                Archive &amp; Specimen
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-ink-600 font-sans tracking-wide uppercase font-medium whitespace-nowrap hidden sm:block">
              Giám tuyển &amp; Trực quan hóa Phân loại học Chim Việt Nam
            </p>
          </div>
        </button>

        {/* Center: 3-View Navigation Tabs (Desktop & Tablet: hidden md:flex) */}
        <nav
          className="hidden md:flex items-center bg-paper-200/80 p-1 rounded-xl border border-paper-border text-xs font-medium shadow-inner shrink-0"
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
                className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-paper-50 text-ink-900 shadow-sm font-semibold border border-paper-border/80'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-paper-100/80'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-natural-moss' : 'text-ink-500'
                  }`}
                />
                <span className="whitespace-nowrap font-sans">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search & Eye-Catching Random Discovery CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          
          {/* Expandable Live Search Bar */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-paper-50 border border-natural-moss/40 rounded-xl px-2.5 py-1.5 shadow-paper-card w-44 sm:w-64 transition-all duration-300">
                <Search className="w-3.5 h-3.5 text-natural-moss shrink-0 mr-1.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên chim..."
                  className="w-full bg-transparent text-xs text-ink-900 placeholder:text-ink-400 outline-none border-none p-0 whitespace-nowrap"
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
                  className="p-0.5 text-ink-400 hover:text-ink-800 transition-colors cursor-pointer shrink-0"
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
                title="Tìm kiếm loài chim (Ctrl+K)"
                aria-label="Tìm kiếm loài chim"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-paper-100 hover:bg-paper-200 text-ink-700 border border-paper-border text-xs transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 text-natural-moss shrink-0" />
                <span className="hidden md:inline text-ink-600 font-sans whitespace-nowrap">Tìm kiếm</span>
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

          {/* Random Discovery Button (Living Eye-Catching CTA with Premium Gradient & Shimmer) */}
          <button
            type="button"
            onClick={handleRandomClick}
            aria-label="Khám phá ngẫu nhiên một loài chim"
            title="Khám phá ngẫu nhiên báu vật chim quý Việt Nam"
            className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#1B4317] via-[#245A20] to-[#2E6F28] hover:from-[#163813] hover:to-[#255C20] text-paper-50 active:scale-95 transition-all duration-300 text-xs font-semibold border border-emerald-400/30 hover:border-emerald-300/70 shadow-md hover:shadow-lg shadow-natural-moss/25 cursor-pointer overflow-hidden whitespace-nowrap shrink-0"
          >
            {/* Periodic Golden Shimmer Sweep Animation */}
            <span
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-sweep pointer-events-none"
            />

            <Dices
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 transition-transform duration-500 shrink-0 ${
                diceRolling ? 'rotate-180 scale-125 text-yellow-200' : 'group-hover:rotate-45 group-hover:scale-110'
              }`}
            />
            <span className="tracking-wide whitespace-nowrap font-sans text-paper-50 drop-shadow-xs">
              <span className="hidden sm:inline">Khám phá </span>ngẫu nhiên
            </span>
          </button>

          {/* Discovery Counter Badge (2-Row Compact Stacked Layout) */}
          <div
            className="hidden sm:inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-paper-200/90 hover:bg-paper-200 border border-paper-border text-ink-700 shadow-2xs shrink-0 select-none transition-colors"
            title={`Bộ sưu tập: Đã khám phá ${discoveredSpeciesIds.length} trên tổng số ${allSpecies.length} loài chim`}
            data-testid="header-discovery-counter"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <div className="text-xs font-mono font-bold text-natural-forest whitespace-nowrap">
                <span>{discoveredSpeciesIds.length}</span>
                <span className="text-ink-400 font-normal">/</span>
                <span>{allSpecies.length}</span>
                <span className="ml-1 text-[11px] font-sans font-medium text-ink-700">loài</span>
              </div>
              <div className="text-[10px] font-sans text-ink-500 font-medium whitespace-nowrap mt-0.5">
                đã khám phá
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile-Only Dedicated Navigation Segment (md:hidden: 3 Equal Touch Columns) */}
      <nav
        className="md:hidden mt-2 grid grid-cols-3 gap-1 bg-paper-200/90 p-1 rounded-xl border border-paper-border text-xs font-medium shadow-inner w-full"
        role="tablist"
        aria-label="Chế độ xem trực quan hóa trên di động"
      >
        {NAV_TABS.map((tab) => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={`mobile-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-paper-50 text-ink-900 shadow-xs font-bold border border-paper-border/80'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? 'text-natural-moss' : 'text-ink-500'
                }`}
              />
              <span className="truncate font-sans">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default MuseumHeader;

import React, { useState } from 'react';
import { Compass, TreePine, Feather, Dices } from 'lucide-react';
import { useTaxonomy, ViewMode } from '../../context/TaxonomyContext';

export interface MuseumHeaderProps {
  className?: string;
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
    label: 'Bánh xe Phân loại',
    sublabel: 'Sunburst Wheel',
    icon: TreePine
  },
  {
    id: 'curator',
    label: 'Trình Giám tuyển',
    sublabel: 'Specimen Curator',
    icon: Feather
  }
];

export const MuseumHeader: React.FC<MuseumHeaderProps> = ({ className = '' }) => {
  const { activeView, setActiveView, selectRandomEndemic } = useTaxonomy();
  const [diceRolling, setDiceRolling] = useState<boolean>(false);

  const handleRandomClick = () => {
    setDiceRolling(true);
    selectRandomEndemic();
    setTimeout(() => {
      setDiceRolling(false);
    }, 450);
  };

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
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
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

        {/* Right action: Random Endemic Bird Explorer */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={handleRandomClick}
            aria-label="Khám phá ngẫu nhiên một loài chim đặc hữu"
            title="Khám phá ngẫu nhiên một loài chim đặc hữu Việt Nam"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-natural-moss text-paper-50 hover:bg-natural-forest active:scale-95 transition-all text-xs font-medium shadow-sm border border-natural-moss/50"
          >
            <Dices
              className={`w-3.5 h-3.5 transition-transform duration-500 ${
                diceRolling ? 'rotate-180 scale-110' : ''
              }`}
            />
            <span className="hidden sm:inline">Khám phá</span> ngẫu nhiên
          </button>
        </div>

      </div>
    </header>
  );
};

export default MuseumHeader;

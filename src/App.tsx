import React from 'react';
import { TaxonomyProvider, useTaxonomy } from './context/TaxonomyContext';
import { MuseumHeader } from './components/Header/MuseumHeader';
import { SearchFilterBar } from './components/Header/SearchFilterBar';
import { VietnamEBAMap } from './components/MapView/VietnamEBAMap';
import { SunburstView } from './components/SunburstView/SunburstView';
import { CuratorView } from './components/CuratorView/CuratorView';
import { MuseumFooter } from './components/Footer/MuseumFooter';

export { MuseumFooter };

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

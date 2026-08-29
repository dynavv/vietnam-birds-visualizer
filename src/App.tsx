import React, { useState } from 'react';
import { TaxonomyProvider, useTaxonomy } from './context/TaxonomyContext';
import { MuseumHeader } from './components/Header/MuseumHeader';
import { AvianFunFactsRibbon } from './components/Header/AvianFunFactsRibbon';
import { VietnamEBAMap } from './components/MapView/VietnamEBAMap';
import { SunburstView } from './components/SunburstView/SunburstView';
import { CuratorView } from './components/CuratorView/CuratorView';
import { MuseumFooter } from './components/Footer/MuseumFooter';
import { BirdVisionModal } from './components/VisionDetector/BirdVisionModal';

import { DiscoveryToast } from './components/Common/DiscoveryToast';

export { MuseumFooter };

export const MainContent: React.FC = () => {
  const { activeView, setActiveView } = useTaxonomy();

  return (
    <main
      className={`flex-1 min-h-0 w-full flex flex-col ${
        activeView === 'map'
          ? 'p-0 max-w-none overflow-hidden'
          : 'max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-1.5 md:py-2 h-full overflow-hidden'
      }`}
      data-testid="main-content-area"
    >
      {activeView === 'map' && (
        <div key="map-view" className="animate-fadeIn h-full w-full flex-1 min-h-0" data-testid="active-map-view">
          <VietnamEBAMap className="h-full w-full" />
        </div>
      )}

      {activeView === 'sunburst' && (
        <div key="sunburst-view" className="animate-fadeIn h-full w-full flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden" data-testid="active-sunburst-view">
          <SunburstView onViewCurator={() => setActiveView('curator')} className="h-full" />
        </div>
      )}

      {activeView === 'curator' && (
        <div key="curator-view" className="animate-fadeIn h-full w-full overflow-y-auto pb-4" data-testid="active-curator-view">
          <CuratorView
            onViewMap={() => setActiveView('map')}
            onViewSunburst={() => setActiveView('sunburst')}
          />
        </div>
      )}
    </main>
  );
};

export const AppShell: React.FC = () => {
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const {
    discoveryToastSpecies,
    dismissDiscoveryToast,
    discoveredSpeciesIds,
    allSpecies
  } = useTaxonomy();

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen bg-paper-50 flex flex-col font-sans text-ink-900 selection:bg-natural-moss/20 selection:text-natural-forest overflow-x-hidden md:overflow-hidden relative">
      <MuseumHeader
        className="shrink-0"
        onOpenVisionDetector={() => setIsVisionModalOpen(true)}
      />
      <AvianFunFactsRibbon className="shrink-0" />
      <MainContent />
      <MuseumFooter className="shrink-0" />

      {/* Bird Vision AI Detector Modal */}
      <BirdVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
      />

      {/* Discovery Celebration Toast Notification */}
      {discoveryToastSpecies && (
        <DiscoveryToast
          species={discoveryToastSpecies.species}
          isNewDiscovery={discoveryToastSpecies.isNewDiscovery}
          discoveredCount={discoveredSpeciesIds.length}
          totalCount={allSpecies.length}
          onClose={dismissDiscoveryToast}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <TaxonomyProvider>
      <AppShell />
    </TaxonomyProvider>
  );
}

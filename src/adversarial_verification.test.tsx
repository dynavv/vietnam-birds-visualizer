import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

// Import project components & contexts
import { TaxonomyProvider, useTaxonomy } from './context/TaxonomyContext';
import { VietnamEBAMap } from './components/MapView/VietnamEBAMap';
import { SunburstView } from './components/SunburstView/SunburstView';
import { CuratorView } from './components/CuratorView/CuratorView';
import { EBARegionLegend } from './components/MapView/EBARegionLegend';

describe('Adversarial Verification Suite — Challenger 2', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement for Leaflet
    window.HTMLCanvasElement.prototype.getContext = () => null;
  });

  describe('1. Tablet Viewports (768px-1023px) & EBA Legend Responsiveness', () => {
    it('ensures EBA legend and Endemic Focus Card use md:block (visible on tablet 768px+)', () => {
      const { container } = render(
        <TaxonomyProvider initialView="map">
          <VietnamEBAMap />
        </TaxonomyProvider>
      );

      // Verify EBA Legend container is present and uses md:block (NOT hidden lg:block)
      const ebaLegendContainer = container.querySelector('.hidden.md\\:block.absolute.top-4.left-4');
      expect(ebaLegendContainer).not.toBeNull();

      // Verify Endemic Focus Card container is present and uses md:block
      const endemicCardContainer = container.querySelector('.hidden.md\\:block.absolute.top-4.right-4');
      expect(endemicCardContainer).not.toBeNull();

      // Verify mobile navigation controls are hidden on md+ (md:hidden)
      const mobileNavContainer = container.querySelector('.flex.md\\:hidden');
      expect(mobileNavContainer).not.toBeNull();

      // Ensure no leftover hidden lg:block exists on the map container
      const legacyLgBlock = container.querySelector('.hidden.lg\\:block');
      expect(legacyLgBlock).toBeNull();
    });

    it('allows expanding all 6 EBA regions and interacting on tablet layout without blackout', () => {
      render(
        <TaxonomyProvider initialView="map">
          <VietnamEBAMap />
        </TaxonomyProvider>
      );

      const legend = screen.getByTestId('eba-region-legend');
      expect(legend).toBeDefined();

      const legendScope = within(legend);

      // Check all 6 EBAs inside the Legend
      const regionNames = [
        /Cao nguyên Đà Lạt/i,
        /Cao nguyên Kon Tum/i,
        /Vùng Đất thấp miền Trung/i,
        /Vùng núi Tây Bắc/i,
        /Vùng đồng bằng & rừng đất thấp Nam Bộ/i,
        /Vùng núi Đông Bắc/i
      ];

      for (const regionRegex of regionNames) {
        const regionCard = legendScope.getByText(regionRegex);
        expect(regionCard).toBeDefined();
      }

      // Click on Kon Tum region inside legend to expand
      const konTumBtn = legendScope.getByText(/Cao nguyên Kon Tum/i);
      fireEvent.click(konTumBtn);

      // Verify expanded content appears
      expect(legendScope.getByText(/Khối núi granite kỳ vĩ miền Trung/i)).toBeDefined();
    });

    it('renders EBARegionLegend in collapsed and expanded states without layout distortion', () => {
      const { rerender } = render(
        <TaxonomyProvider>
          <EBARegionLegend isCollapsed={false} />
        </TaxonomyProvider>
      );

      expect(screen.getByText('Vùng Chim Đặc hữu Việt Nam')).toBeDefined();
      expect(screen.getByText(/6 EBAs • BirdLife International/i)).toBeDefined();

      rerender(
        <TaxonomyProvider>
          <EBARegionLegend isCollapsed={true} />
        </TaxonomyProvider>
      );

      expect(screen.getByText('Vùng Chim Đặc hữu Việt Nam')).toBeDefined();
    });
  });

  describe('2. D3 Tree State Persistence across Tab Switching', () => {
    const TabSwitchSimulator: React.FC = () => {
      const { activeView, setActiveView } = useTaxonomy();
      return (
        <div>
          <div data-testid="current-view">{activeView}</div>
          <button data-testid="btn-map" onClick={() => setActiveView('map')}>Map</button>
          <button data-testid="btn-sunburst" onClick={() => setActiveView('sunburst')}>Sunburst</button>
          <button data-testid="btn-curator" onClick={() => setActiveView('curator')}>Curator</button>

          <div data-testid="view-content">
            {activeView === 'map' && <VietnamEBAMap />}
            {activeView === 'sunburst' && <SunburstView />}
            {activeView === 'curator' && <CuratorView />}
          </div>
        </div>
      );
    };

    it('persists manually expanded and collapsed nodes across tab switches', () => {
      render(
        <TaxonomyProvider initialView="sunburst">
          <TabSwitchSimulator />
        </TaxonomyProvider>
      );

      expect(screen.getByTestId('current-view').textContent).toBe('sunburst');

      // Expand Columbiformes (Bộ Bồ câu) in Cladogram Tree
      const columbiformesText = screen.getByText(/Bộ Bồ câu/i);
      expect(columbiformesText).toBeDefined();
      fireEvent.click(columbiformesText);

      // Verify family Columbidae (Họ Bồ câu) is visible
      expect(screen.getByText(/Họ Bồ câu/i)).toBeDefined();

      // Now switch tab to 'map' (unmounting SunburstView & CladogramTreeView)
      fireEvent.click(screen.getByTestId('btn-map'));
      expect(screen.getByTestId('current-view').textContent).toBe('map');
      expect(screen.getByTestId('vietnam-eba-map')).toBeDefined();

      // Switch tab to 'curator'
      fireEvent.click(screen.getByTestId('btn-curator'));
      expect(screen.getByTestId('current-view').textContent).toBe('curator');
      expect(screen.getByTestId('curator-view')).toBeDefined();

      // Switch back to 'sunburst'
      fireEvent.click(screen.getByTestId('btn-sunburst'));
      expect(screen.getByTestId('current-view').textContent).toBe('sunburst');

      // Verify Họ Bồ câu is STILL expanded!
      expect(screen.getByText(/Họ Bồ câu/i)).toBeDefined();
    });

    it('auto-expands tree branch to selected species and preserves state across tab changes', () => {
      render(
        <TaxonomyProvider initialView="map">
          <TabSwitchSimulator />
        </TaxonomyProvider>
      );

      // In Map view, switch to Sunburst tab
      fireEvent.click(screen.getByTestId('btn-sunburst'));

      // Look for Lophura edwardsi or select through tree
      const lophuraSpecies = screen.getByTestId('tree-species-lophura-edwardsi');
      expect(lophuraSpecies).toBeDefined();
      fireEvent.click(lophuraSpecies);

      // Verify active species is selected
      expect(lophuraSpecies.className).toContain('text-natural-forest');

      // Switch to Map tab
      fireEvent.click(screen.getByTestId('btn-map'));
      expect(screen.getByTestId('current-view').textContent).toBe('map');

      // Switch back to Sunburst
      fireEvent.click(screen.getByTestId('btn-sunburst'));

      // Both Galliformes and Phasianidae should remain expanded and species should remain selected
      const remountedLophura = screen.getByTestId('tree-species-lophura-edwardsi');
      expect(remountedLophura).toBeDefined();
      expect(remountedLophura.className).toContain('text-natural-forest');
    });

    it('preserves Expand All and Collapse All state across tab transitions', () => {
      render(
        <TaxonomyProvider initialView="sunburst">
          <TabSwitchSimulator />
        </TaxonomyProvider>
      );

      // Click Expand All
      const expandAllBtn = screen.getByText(/Mở rộng tất cả/i);
      fireEvent.click(expandAllBtn);

      // Verify multiple families from different orders are visible (e.g. Họ Cu cu, Họ Bồ câu)
      expect(screen.getByText(/Họ Bồ câu/i)).toBeDefined();
      expect(screen.getByText(/Họ Cu cu/i)).toBeDefined();

      // Switch to Curator
      fireEvent.click(screen.getByTestId('btn-curator'));
      expect(screen.getByTestId('curator-view')).toBeDefined();

      // Switch back to Sunburst
      fireEvent.click(screen.getByTestId('btn-sunburst'));

      // Both should still be expanded
      expect(screen.getByText(/Họ Bồ câu/i)).toBeDefined();
      expect(screen.getByText(/Họ Cu cu/i)).toBeDefined();

      // Click Collapse All
      const collapseAllBtn = screen.getByText(/Thu gọn/i);
      fireEvent.click(collapseAllBtn);

      // Switch to Map and back
      fireEvent.click(screen.getByTestId('btn-map'));
      fireEvent.click(screen.getByTestId('btn-sunburst'));

      // Families should be collapsed (not in document)
      expect(screen.queryByText(/Họ Bồ câu/i)).toBeNull();
      expect(screen.queryByText(/Họ Cu cu/i)).toBeNull();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SunburstWheel, ORDER_COLOR_MAP } from './SunburstWheel';
import { SunburstView } from './SunburstView';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import type { TaxonomyNode } from '../../types/bird';

const mockTaxonomyTree: TaxonomyNode = {
  name: 'Aves',
  vietnameseName: 'Lớp Chim',
  rank: 'class',
  color: '#1C1917',
  children: [
    {
      name: 'Passeriformes',
      vietnameseName: 'Bộ Sẻ',
      rank: 'order',
      color: '#2D5A27',
      children: [
        {
          name: 'Leiothrichidae',
          vietnameseName: 'Họ Khướu',
          rank: 'family',
          color: '#2D5A27',
          children: [
            {
              name: 'Trochalopteron',
              vietnameseName: 'Chi Trochalopteron',
              rank: 'genus',
              color: '#2D5A27',
              children: [
                {
                  name: 'Trochalopteron ngoclinhense',
                  vietnameseName: 'Khướu Ngọc Linh',
                  rank: 'species',
                  speciesId: 'trochalopteron-ngoclinhense',
                  color: '#2D5A27'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Piciformes',
      vietnameseName: 'Bộ Gõ kiến',
      rank: 'order',
      color: '#8B4513',
      children: [
        {
          name: 'Picidae',
          vietnameseName: 'Họ Gõ kiến',
          rank: 'family',
          color: '#8B4513',
          children: [
            {
              name: 'Chrysophlegma',
              vietnameseName: 'Chi Chrysophlegma',
              rank: 'genus',
              color: '#8B4513',
              children: [
                {
                  name: 'Chrysophlegma flavinucha',
                  vietnameseName: 'Gõ kiến vàng lớn',
                  rank: 'species',
                  speciesId: 'chrysophlegma-flavinucha',
                  color: '#8B4513'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

describe('SunburstWheel Component', () => {
  it('renders SVG sunburst wheel and center interactive hub with 1:1 aspect ratio', () => {
    const { container } = render(
      <TaxonomyProvider>
        <SunburstWheel data={mockTaxonomyTree} />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('sunburst-svg')).toBeDefined();
    const centerHub = screen.getByTestId('sunburst-center');
    expect(centerHub).toBeDefined();
    expect(centerHub.style.aspectRatio).toBe('1 / 1');
    expect(screen.getByText('Lớp Chim')).toBeDefined();
    expect(screen.getByText('Aves')).toBeDefined();

    // Verify SVG background circle
    const svgCenterCircle = container.querySelector('.sunburst-center-circle');
    expect(svgCenterCircle).not.toBeNull();
    expect(svgCenterCircle?.getAttribute('stroke')).toBe('#4A7C59');
  });

  it('renders arcs for hierarchy nodes', () => {
    render(
      <TaxonomyProvider>
        <SunburstWheel data={mockTaxonomyTree} />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');
    expect(arcs.length).toBeGreaterThan(0);

    // Verify order arcs exist
    const orderArc = arcs.find(a => a.getAttribute('data-name') === 'Passeriformes');
    expect(orderArc).toBeDefined();
    expect(orderArc?.getAttribute('data-rank')).toBe('order');
  });

  it('calls onSelectSpecies when a species arc is clicked', () => {
    const handleSelectSpecies = vi.fn();

    render(
      <TaxonomyProvider>
        <SunburstWheel
          data={mockTaxonomyTree}
          onSelectSpecies={handleSelectSpecies}
        />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');
    const speciesArc = arcs.find(
      a => a.getAttribute('data-species-id') === 'trochalopteron-ngoclinhense'
    );

    expect(speciesArc).toBeDefined();
    if (speciesArc) {
      fireEvent.click(speciesArc);
      expect(handleSelectSpecies).toHaveBeenCalledWith('trochalopteron-ngoclinhense');
    }
  });

  it('triggers hover callback on arc mouseenter and mouseleave', () => {
    const handleHover = vi.fn();

    render(
      <TaxonomyProvider>
        <SunburstWheel
          data={mockTaxonomyTree}
          onHoverNode={handleHover}
        />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');
    const orderArc = arcs.find(a => a.getAttribute('data-name') === 'Passeriformes');

    expect(orderArc).toBeDefined();
    if (orderArc) {
      fireEvent.mouseEnter(orderArc);
      expect(handleHover).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Passeriformes', rank: 'order' })
      );

      fireEvent.mouseLeave(orderArc);
      expect(handleHover).toHaveBeenCalledWith(null);
    }
  });

  it('zooms into non-species node when clicked and updates center hub', () => {
    const handleZoom = vi.fn();

    render(
      <TaxonomyProvider>
        <SunburstWheel
          data={mockTaxonomyTree}
          onZoomNode={handleZoom}
        />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');
    const orderArc = arcs.find(a => a.getAttribute('data-name') === 'Passeriformes');

    expect(orderArc).toBeDefined();
    if (orderArc) {
      fireEvent.click(orderArc);
      expect(handleZoom).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Passeriformes', rank: 'order' })
      );
    }
  });

  it('maps colors for all orders including Ciconiiformes', () => {
    const ordersInMock = mockTaxonomyTree.children?.filter(c => c.rank === 'order') || [];
    ordersInMock.forEach(order => {
      expect(ORDER_COLOR_MAP[order.name]).toBeDefined();
      expect(ORDER_COLOR_MAP[order.name]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
    expect(ORDER_COLOR_MAP['Ciconiiformes']).toBe('#475569');
  });

  it('formats center badge without duplicate rank prefixes (e.g. "Bộ Sẻ", not "Bộ Bộ Sẻ")', () => {
    render(
      <TaxonomyProvider>
        <SunburstWheel data={mockTaxonomyTree} />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');
    const passeriformesArc = arcs.find(a => a.getAttribute('data-name') === 'Passeriformes');
    expect(passeriformesArc).toBeDefined();

    if (passeriformesArc) {
      fireEvent.click(passeriformesArc);
      const centerContainer = screen.getByTestId('sunburst-center');
      expect(centerContainer.textContent).toContain('Bộ Sẻ');
      expect(centerContainer.textContent).not.toContain('Bộ Bộ Sẻ');
    }
  });

  it('displays root badge with dynamic order count', () => {
    render(
      <TaxonomyProvider>
        <SunburstWheel data={mockTaxonomyTree} />
      </TaxonomyProvider>
    );
    const orderCount = (mockTaxonomyTree.children || []).length;
    expect(screen.getByText(`${orderCount} Bộ Chim`)).toBeDefined();
  });

  it('renders prominent amber border, lineage glow, and pulsating pin marker for selected species without dimming other arcs', () => {
    const { container } = render(
      <TaxonomyProvider>
        <SunburstWheel
          data={mockTaxonomyTree}
          selectedSpeciesId="trochalopteron-ngoclinhense"
        />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');

    // Selected species arc (Loài) has 3.5px amber stroke and 1.0 opacity
    const selectedArc = arcs.find(
      a => a.getAttribute('data-species-id') === 'trochalopteron-ngoclinhense'
    );
    expect(selectedArc).toBeDefined();
    expect(selectedArc?.getAttribute('stroke')).toBe('#F59E0B');
    expect(selectedArc?.getAttribute('stroke-width')).toBe('3.5px');
    expect(selectedArc?.getAttribute('fill-opacity')).toBe('1');

    // Lineage ancestors: Order (Passeriformes), Family (Leiothrichidae), Genus (Trochalopteron) have 2px amber stroke and 0.98 opacity
    const orderArc = arcs.find(a => a.getAttribute('data-name') === 'Passeriformes');
    expect(orderArc).toBeDefined();
    expect(orderArc?.getAttribute('stroke')).toBe('#F59E0B');
    expect(orderArc?.getAttribute('stroke-width')).toBe('2px');
    expect(orderArc?.getAttribute('fill-opacity')).toBe('0.98');

    const familyArc = arcs.find(a => a.getAttribute('data-name') === 'Leiothrichidae');
    expect(familyArc).toBeDefined();
    expect(familyArc?.getAttribute('stroke')).toBe('#F59E0B');
    expect(familyArc?.getAttribute('stroke-width')).toBe('2px');
    expect(familyArc?.getAttribute('fill-opacity')).toBe('0.98');

    const genusArc = arcs.find(a => a.getAttribute('data-name') === 'Trochalopteron');
    expect(genusArc).toBeDefined();
    expect(genusArc?.getAttribute('stroke')).toBe('#F59E0B');
    expect(genusArc?.getAttribute('stroke-width')).toBe('2px');
    expect(genusArc?.getAttribute('fill-opacity')).toBe('0.98');

    // Non-lineage arcs remain at 0.92 idle opacity
    const otherOrderArc = arcs.find(a => a.getAttribute('data-name') === 'Piciformes');
    expect(otherOrderArc?.getAttribute('stroke')).toBe('#FAF7F0');
    expect(otherOrderArc?.getAttribute('fill-opacity')).toBe('0.92');

    // Pin marker disc radius is 7.5 with 2.2 stroke-width
    const pinMarker = container.querySelector('[data-testid="selected-species-pin"]');
    expect(pinMarker).not.toBeNull();
    const pinCircles = pinMarker?.querySelectorAll('circle');
    const disc = Array.from(pinCircles || []).find(c => c.getAttribute('r') === '7.5');
    expect(disc).toBeDefined();
    expect(disc?.getAttribute('stroke')).toBe('#FFFFFF');
    expect(disc?.getAttribute('stroke-width')).toBe('2.2');
  });

  it('restores idle opacity, lineage glow, and amber stroke on mouseleave after hovering another arc', () => {
    render(
      <TaxonomyProvider>
        <SunburstWheel
          data={mockTaxonomyTree}
          selectedSpeciesId="trochalopteron-ngoclinhense"
        />
      </TaxonomyProvider>
    );

    const arcs = screen.getAllByTestId('sunburst-arc');
    const piciformesArc = arcs.find(a => a.getAttribute('data-name') === 'Piciformes');
    expect(piciformesArc).toBeDefined();

    if (piciformesArc) {
      fireEvent.mouseEnter(piciformesArc);
      const passeriformesArc = arcs.find(a => a.getAttribute('data-name') === 'Passeriformes');
      // Lineage ancestor maintains 0.98 fill-opacity and 2px amber stroke
      expect(passeriformesArc?.getAttribute('fill-opacity')).toBe('0.98');
      expect(passeriformesArc?.getAttribute('stroke')).toBe('#F59E0B');
      expect(passeriformesArc?.getAttribute('stroke-width')).toBe('2px');

      // Selected species arc maintains 0.98 fill-opacity and 3.5px amber stroke
      const selectedArc = arcs.find(
        a => a.getAttribute('data-species-id') === 'trochalopteron-ngoclinhense'
      );
      expect(selectedArc?.getAttribute('fill-opacity')).toBe('0.98');
      expect(selectedArc?.getAttribute('stroke')).toBe('#F59E0B');
      expect(selectedArc?.getAttribute('stroke-width')).toBe('3.5px');
      expect(selectedArc?.getAttribute('fill')).not.toBe('#D97706');

      fireEvent.mouseLeave(piciformesArc);
      // Passeriformes is an ancestor of the selected species, so restores to 0.98 fill-opacity and 2px stroke
      expect(passeriformesArc?.getAttribute('fill-opacity')).toBe('0.98');
      expect(passeriformesArc?.getAttribute('stroke')).toBe('#F59E0B');
      expect(passeriformesArc?.getAttribute('stroke-width')).toBe('2px');

      // Selected species arc restores to 1.0 fill-opacity and 3.5px amber stroke
      expect(selectedArc?.getAttribute('fill-opacity')).toBe('1');
      expect(selectedArc?.getAttribute('stroke')).toBe('#F59E0B');
      expect(selectedArc?.getAttribute('stroke-width')).toBe('3.5px');

      // Unrelated arc restores to 0.92 and #FAF7F0
      expect(piciformesArc.getAttribute('fill-opacity')).toBe('0.92');
      expect(piciformesArc.getAttribute('stroke')).toBe('#FAF7F0');
    }
  });
});

describe('SunburstView Layout Component', () => {
  it('renders complete phylogenetic taxonomy view with dual-mode, breadcrumb, and side panel', () => {
    render(
      <TaxonomyProvider>
        <SunburstView />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('sunburst-view')).toBeDefined();
    expect(screen.getByText(/Phân Loại Học Chim Việt Nam/i)).toBeDefined();
    expect(screen.getByTestId('breadcrumb-trail')).toBeDefined();
    expect(screen.getByTestId('quick-specimen-panel')).toBeDefined();

    // Toggle to radial fan mode to verify wheel SVG
    const radialBtn = screen.getByText('Phả Hệ Vòng Tròn');
    fireEvent.click(radialBtn);
    expect(screen.getByTestId('sunburst-svg')).toBeDefined();
  });
});

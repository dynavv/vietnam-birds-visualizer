import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SunburstWheel } from './SunburstWheel';
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
  it('renders SVG sunburst wheel and center interactive hub', () => {
    render(
      <TaxonomyProvider>
        <SunburstWheel data={mockTaxonomyTree} />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('sunburst-svg')).toBeDefined();
    expect(screen.getByTestId('sunburst-center')).toBeDefined();
    expect(screen.getByText('Lớp Chim')).toBeDefined();
    expect(screen.getByText('Aves')).toBeDefined();
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

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BreadcrumbTrail } from './BreadcrumbTrail';
import { getTaxonomyLineage } from './taxonomyUtils';
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
    }
  ]
};

describe('BreadcrumbTrail Component', () => {
  it('renders default root badge when lineage is empty', () => {
    render(<BreadcrumbTrail lineage={[]} />);
    expect(screen.getByText(/Lớp Chim \(Aves\)/i)).toBeDefined();
  });

  it('renders full lineage chain with rank badges and Vietnamese names', () => {
    const lineage = getTaxonomyLineage(mockTaxonomyTree, 'trochalopteron-ngoclinhense');
    expect(lineage.length).toBe(5);

    render(<BreadcrumbTrail lineage={lineage} />);

    // Check rank indicators
    expect(screen.getByText('Lớp')).toBeDefined();
    expect(screen.getByText('Bộ')).toBeDefined();
    expect(screen.getByText('Họ')).toBeDefined();
    expect(screen.getByText('Chi')).toBeDefined();
    expect(screen.getByText('Loài')).toBeDefined();

    // Check node names
    expect(screen.getByText('Lớp Chim')).toBeDefined();
    expect(screen.getByText('Bộ Sẻ')).toBeDefined();
    expect(screen.getByText('Họ Khướu')).toBeDefined();
    expect(screen.getByText('Chi Trochalopteron')).toBeDefined();
    expect(screen.getByText('Khướu Ngọc Linh')).toBeDefined();
  });

  it('fires onNodeClick callback when clicking on a breadcrumb item', () => {
    const handleClick = vi.fn();
    const lineage = getTaxonomyLineage(mockTaxonomyTree, 'trochalopteron-ngoclinhense');

    render(<BreadcrumbTrail lineage={lineage} onNodeClick={handleClick} />);

    const orderButton = screen.getByText('Bộ Sẻ').closest('button');
    expect(orderButton).toBeDefined();

    if (orderButton) {
      fireEvent.click(orderButton);
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(lineage[1], 1);
    }
  });

  it('marks the last item in lineage as active step', () => {
    const lineage = getTaxonomyLineage(mockTaxonomyTree, 'trochalopteron-ngoclinhense');
    render(<BreadcrumbTrail lineage={lineage} />);

    const lastButton = screen.getByText('Khướu Ngọc Linh').closest('button');
    expect(lastButton?.getAttribute('aria-current')).toBe('step');
  });

  it('resolves correct lineage with getTaxonomyLineage helper', () => {
    // Exact speciesId
    const spLineage = getTaxonomyLineage(mockTaxonomyTree, 'trochalopteron-ngoclinhense');
    expect(spLineage.map(n => n.name)).toEqual([
      'Aves',
      'Passeriformes',
      'Leiothrichidae',
      'Trochalopteron',
      'Trochalopteron ngoclinhense'
    ]);

    // Order level
    const orderLineage = getTaxonomyLineage(mockTaxonomyTree, 'Passeriformes');
    expect(orderLineage.map(n => n.name)).toEqual(['Aves', 'Passeriformes']);

    // Non-existent
    const fallback = getTaxonomyLineage(mockTaxonomyTree, 'Unknown-Clade');
    expect(fallback.map(n => n.name)).toEqual(['Aves']);
  });
});

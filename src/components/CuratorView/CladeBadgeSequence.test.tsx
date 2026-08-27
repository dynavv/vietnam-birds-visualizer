import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CladeBadgeSequence } from './CladeBadgeSequence';
import type { SpeciesTaxonomy } from '../../types/bird';

describe('CladeBadgeSequence Component', () => {
  const mockTaxonomy: SpeciesTaxonomy = {
    clade: ['Aves', 'Neognathae', 'Neoaves', 'Passerea'],
    order: 'Passeriformes',
    orderVietnamese: 'Bộ Sẻ',
    family: 'Leiothrichidae',
    familyVietnamese: 'Họ Khướu',
    genus: 'Trochalopteron',
    species: 'T. ngoclinhense'
  };

  it('renders the complete phylogenetic lineage chain correctly', () => {
    render(<CladeBadgeSequence taxonomy={mockTaxonomy} />);

    expect(screen.getByTestId('clade-badge-sequence')).toBeDefined();
    expect(screen.getByText('Aves')).toBeDefined();
    expect(screen.getByText('Neognathae')).toBeDefined();
    expect(screen.getByText('Neoaves')).toBeDefined();
    expect(screen.getByText('Passerea')).toBeDefined();
    expect(screen.getByText('Passeriformes')).toBeDefined();
    expect(screen.getByText('Leiothrichidae')).toBeDefined();
    expect(screen.getByText('Trochalopteron')).toBeDefined();
    expect(screen.getByText('T. ngoclinhense')).toBeDefined();
  });

  it('displays Vietnamese rank names alongside scientific names', () => {
    render(<CladeBadgeSequence taxonomy={mockTaxonomy} />);

    expect(screen.getByText('Bộ Sẻ')).toBeDefined();
    expect(screen.getByText('Họ Khướu')).toBeDefined();
    expect(screen.getByText('Nhánh Hàm Mới')).toBeDefined();
    expect(screen.getByText('Nhánh Chim Hiện Đại')).toBeDefined();
  });

  it('invokes onCladeClick callback when a clade badge is clicked', () => {
    const handleCladeClick = vi.fn();
    render(<CladeBadgeSequence taxonomy={mockTaxonomy} onCladeClick={handleCladeClick} />);

    const orderBadge = screen.getByText('Passeriformes');
    fireEvent.click(orderBadge);

    expect(handleCladeClick).toHaveBeenCalledWith('order', 'Passeriformes');
  });

  it('renders correctly when clade array is empty', () => {
    const minimalTaxonomy: SpeciesTaxonomy = {
      clade: [],
      order: 'Galliformes',
      orderVietnamese: 'Bộ Gà',
      family: 'Phasianidae',
      familyVietnamese: 'Họ Trĩ',
      genus: 'Lophura',
      species: 'L. edwardsi'
    };

    render(<CladeBadgeSequence taxonomy={minimalTaxonomy} />);

    expect(screen.getByText('Aves')).toBeDefined();
    expect(screen.getByText('Galliformes')).toBeDefined();
    expect(screen.getByText('Phasianidae')).toBeDefined();
    expect(screen.getByText('Lophura')).toBeDefined();
    expect(screen.getByText('L. edwardsi')).toBeDefined();
  });
});

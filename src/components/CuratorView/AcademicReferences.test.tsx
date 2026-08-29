import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AcademicReferences, TaxonRegistriesCard } from './AcademicReferences';
import { BirdSpecies } from '../../types/bird';

const mockSpecies: BirdSpecies = {
  id: 'trochalopteron-ngoclinhense',
  scientificName: 'Trochalopteron ngoclinhense',
  vietnameseName: 'Khướu Ngọc Linh',
  englishName: 'Golden-winged Laughingthrush',
  taxonomy: {
    clade: ['Aves', 'Passeriformes'],
    order: 'Passeriformes',
    orderVietnamese: 'Bộ Sẻ',
    family: 'Leiothrichidae',
    familyVietnamese: 'Họ Khướu',
    genus: 'Trochalopteron',
    species: 'T. ngoclinhense'
  },
  isEndemic: true,
  conservation: {
    iucn: 'EN',
    description: 'Nguy cấp do sinh cảnh phân bố hẹp.'
  },
  morphologicalAnalysis: {
    overview: 'Loài khướu đặc hữu với vệt cánh vàng.',
    diagnosticFeatures: [
      { part: 'Cánh', description: 'Vệt màu vàng kim.' }
    ]
  },
  distribution: {
    ebaRegion: 'Cao nguyên Kon Tum',
    elevation: '1900-2500m',
    habitats: ['Rừng núi cao'],
    locations: ['Ngọc Linh'],
    coordinates: [15.08, 107.98]
  },
  illustration: {
    imageUrl: 'https://example.com/bird.jpg',
    artist: 'H. Grönvold'
  },
  academic: {
    iocTaxonCode: 'IOC-AV-PAS-TROCHALO',
    avibaseId: 'A37EB5E58B60CBA5',
    iucnUrl: 'https://www.iucnredlist.org/species/22728591/131518026',
    gbifTaxonKey: '6101121'
  }
};

describe('AcademicReferences & TaxonRegistriesCard Component', () => {
  it('renders global verified registry links (IUCN, Avibase, GBIF, iNaturalist)', () => {
    render(<AcademicReferences species={mockSpecies} />);
    expect(screen.getByText('IUCN Red List')).toBeDefined();
    expect(screen.getByText('Avibase Checklist')).toBeDefined();
    expect(screen.getByText('GBIF Biodiversity')).toBeDefined();
    expect(screen.getByText('iNaturalist')).toBeDefined();
  });

  it('renders correctly as standalone TaxonRegistriesCard', () => {
    render(<TaxonRegistriesCard species={mockSpecies} />);
    expect(screen.getByTestId('taxon-registries-card')).toBeDefined();
    expect(screen.getByText('Mã Định Danh Cơ Sở Dữ Liệu Quốc Tế')).toBeDefined();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AcademicReferences } from './AcademicReferences';
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
    avibaseId: 'AVIBASE-TROCHALOPTERON-NGOCLINHENSE',
    iucnUrl: 'https://www.iucnredlist.org/species/mock',
    gbifTaxonKey: 'https://www.gbif.org/species/mock',
    primaryLiterature: [
      {
        authors: 'Eames, J. C., Le Trong Trai, & Nguyen Cu',
        year: 1999,
        title: 'A new species of Laughingthrush from Vietnam',
        journalOrBook: "Bull. Brit. Orn. Club",
        volumeOrPages: '119(4): 216-224'
      }
    ]
  }
};

describe('AcademicReferences Component', () => {
  it('renders global registry links (IUCN, Avibase, GBIF)', () => {
    render(<AcademicReferences species={mockSpecies} />);
    expect(screen.getByText('IUCN Red List')).toBeDefined();
    expect(screen.getByText('Avibase Checklist')).toBeDefined();
    expect(screen.getByText('GBIF Biodiversity')).toBeDefined();
  });

  it('renders primary literature citations', () => {
    render(<AcademicReferences species={mockSpecies} />);
    expect(screen.getByText(/Eames, J. C., Le Trong Trai/)).toBeDefined();
    expect(screen.getByText(/"A new species of Laughingthrush from Vietnam."/)).toBeDefined();
  });
});

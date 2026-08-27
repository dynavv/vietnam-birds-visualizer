import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickSpecimenPanel } from './QuickSpecimenPanel';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import type { BirdSpecies } from '../../types/bird';

const mockBird: BirdSpecies = {
  id: 'trochalopteron-ngoclinhense',
  scientificName: 'Trochalopteron ngoclinhense',
  vietnameseName: 'Khướu Ngọc Linh',
  englishName: 'Golden-winged Laughingthrush',
  taxonomy: {
    clade: ['Aves', 'Neognathae', 'Passerea'],
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
    vietnamRedList: 'EN',
    description: 'Loài nguy cấp đặc hữu đỉnh núi Ngọc Linh.'
  },
  morphologicalAnalysis: {
    overview: 'Loài khướu cỡ trung bình với dải cánh màu vàng kim rực rỡ.',
    diagnosticFeatures: [
      { part: 'Vệt cánh vàng kim', description: 'Viền vàng kim óng ánh đặc trưng' },
      { part: 'Đầu và mặt', description: 'Đỉnh đầu xám bạc' }
    ]
  },
  distribution: {
    ebaRegion: 'Cao nguyên Kon Tum / Dãy Ngọc Linh',
    elevation: '1.900m - 2.598m',
    habitats: ['Rừng lùn đỉnh núi mù sương'],
    locations: ['KBT Thiên nhiên Ngọc Linh'],
    coordinates: [15.08, 107.98]
  },
  illustration: {
    imageUrl: 'https://example.com/trochalopteron.jpg',
    artist: 'Naturalist Indochina',
    sourceBook: 'Birds of Vietnam Volume II'
  },
  audioCall: {
    audioUrl: 'https://example.com/sound.mp3',
    duration: '0:35',
    recordist: 'Nguyen Cu',
    location: 'Kon Tum'
  }
};

describe('QuickSpecimenPanel Component', () => {
  it('renders empty fallback card when no species is provided/selected', () => {
    render(
      <TaxonomyProvider initialSpeciesId="invalid-id">
        <QuickSpecimenPanel species={null} />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('quick-specimen-panel-empty')).toBeDefined();
    expect(screen.getByText('Khám phá Cây Phân Loại')).toBeDefined();
  });

  it('renders trilingual bird names, illustration plate, and conservation badges', () => {
    render(
      <TaxonomyProvider>
        <QuickSpecimenPanel species={mockBird} />
      </TaxonomyProvider>
    );

    expect(screen.getAllByText('Khướu Ngọc Linh').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Trochalopteron ngoclinhense').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Golden-winged Laughingthrush')).toBeDefined();

    // Plate artist
    expect(screen.getByText(/Naturalist Indochina — Birds of Vietnam Volume II/i)).toBeDefined();

    // Badges
    expect(screen.getAllByText(/Đặc hữu/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('VN:EN')).toBeDefined();
  });

  it('renders phylogenetic clade sequence tags', () => {
    render(
      <TaxonomyProvider>
        <QuickSpecimenPanel species={mockBird} />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Chuỗi Phân loại Tiến hóa (Clade)')).toBeDefined();
    expect(screen.getByText('Aves')).toBeDefined();
    expect(screen.getByText('Neognathae')).toBeDefined();
    expect(screen.getByText('Passerea')).toBeDefined();
  });

  it('renders curatorial overview quote and diagnostic features', () => {
    render(
      <TaxonomyProvider>
        <QuickSpecimenPanel species={mockBird} />
      </TaxonomyProvider>
    );

    expect(screen.getByText(/Loài khướu cỡ trung bình với dải cánh màu vàng kim/i)).toBeDefined();
    expect(screen.getByText(/Vệt cánh vàng kim/i)).toBeDefined();
    expect(screen.getByText(/Đầu và mặt/i)).toBeDefined();
  });
});

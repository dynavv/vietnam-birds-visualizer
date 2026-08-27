import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CuratorView } from './CuratorView';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import type { BirdSpecies } from '../../types/bird';

describe('CuratorView Component', () => {
  const mockSpecies: BirdSpecies = {
    id: 'trochalopteron-ngoclinhense',
    scientificName: 'Trochalopteron ngoclinhense',
    vietnameseName: 'Khướu Ngọc Linh',
    englishName: 'Golden-winged Laughingthrush',
    taxonomy: {
      clade: ['Aves', 'Neognathae', 'Neoaves', 'Passerea'],
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
      description: 'Loài nguy cấp đặc hữu của đỉnh Ngọc Linh.'
    },
    morphologicalAnalysis: {
      overview: 'Loài khướu cỡ trung bình tuyệt đẹp với dải cánh màu vàng kim rực rỡ.',
      diagnosticFeatures: [
        {
          part: 'Vệt cánh vàng kim',
          description: 'Lông bao cánh sơ cấp và thứ cấp có viền màu vàng kim óng ánh.'
        }
      ]
    },
    distribution: {
      ebaRegion: 'Cao nguyên Kon Tum / Dãy Ngọc Linh',
      elevation: '1.900m - 2.598m',
      habitats: ['Rừng lùn đỉnh núi mù sương', 'Thảm tre nứa'],
      locations: ['KBT Thiên nhiên Ngọc Linh'],
      coordinates: [15.08, 107.98]
    },
    illustration: {
      imageUrl: 'https://example.com/trochalopteron.jpg',
      artist: 'H. Grönvold',
      sourceBook: "Les Oiseaux de l'Indochine Française"
    },
    audioCall: {
      audioUrl: 'https://xeno-canto.org/sample.mp3',
      duration: '0:24'
    }
  };

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty placeholder when no species is selected', () => {
    render(
      <TaxonomyProvider>
        <CuratorView species={null} />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('curator-view-empty')).toBeDefined();
    expect(screen.getByText(/Phòng Giám Tuyển Mẫu Vật Điểu Học/i)).toBeDefined();
  });

  it('renders full editorial layout with specimen plate, clade sequence and morphology report', () => {
    render(
      <TaxonomyProvider>
        <CuratorView species={mockSpecies} />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('curator-view')).toBeDefined();
    expect(screen.getByTestId('specimen-plate')).toBeDefined();
    expect(screen.getByTestId('clade-badge-sequence')).toBeDefined();
    expect(screen.getByTestId('related-species-tabs')).toBeDefined();
    expect(screen.getByTestId('morphology-report')).toBeDefined();

    // Verify trilingual nomenclature & taxonomy
    expect(screen.getAllByText('Khướu Ngọc Linh').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Trochalopteron ngoclinhense').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Golden-winged Laughingthrush/i).length).toBeGreaterThan(0);

    // Verify distribution details
    expect(screen.getAllByText(/Cao nguyên Kon Tum/i).length).toBeGreaterThan(0);
    expect(screen.getByText('1.900m - 2.598m')).toBeDefined();
    expect(screen.getByText(/Rừng lùn đỉnh núi mù sương/i)).toBeDefined();
  });

  it('handles navigation triggers to Map and Sunburst views', () => {
    const handleViewMap = vi.fn();
    const handleViewSunburst = vi.fn();

    render(
      <TaxonomyProvider>
        <CuratorView
          species={mockSpecies}
          onViewMap={handleViewMap}
          onViewSunburst={handleViewSunburst}
        />
      </TaxonomyProvider>
    );

    const mapBtn = screen.getByRole('button', { name: /Bản đồ EBA/i });
    fireEvent.click(mapBtn);
    expect(handleViewMap).toHaveBeenCalledTimes(1);

    const sunburstBtn = screen.getByRole('button', { name: /Bánh xe Phân loại/i });
    fireEvent.click(sunburstBtn);
    expect(handleViewSunburst).toHaveBeenCalledTimes(1);
  });
});

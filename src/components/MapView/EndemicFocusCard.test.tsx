import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EndemicFocusCard } from './EndemicFocusCard';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import type { BirdSpecies } from '../../types/bird';

const mockBird: BirdSpecies = {
  id: 'test-trochalopteron-ngoclinhense',
  scientificName: 'Trochalopteron ngoclinhense',
  vietnameseName: 'Khướu Ngọc Linh',
  englishName: 'Golden-winged Laughingthrush',
  taxonomy: {
    clade: ['Aves', 'Passerea'],
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
    description: 'Loài nguy cấp đặc hữu đỉnh Ngọc Linh.'
  },
  morphologicalAnalysis: {
    overview: 'Loài khướu cỡ trung bình với dải cánh màu vàng kim rực rỡ.',
    diagnosticFeatures: [
      { part: 'Cánh', description: 'Viền vàng kim' }
    ]
  },
  distribution: {
    ebaRegion: 'Cao nguyên Kon Tum / Dãy Ngọc Linh',
    elevation: '1.900m - 2.598m',
    habitats: ['Rừng lùn đỉnh núi mù sương', 'Thảm tre nứa núi cao'],
    locations: ['KBT Thiên nhiên Ngọc Linh', 'Núi Ngọc Phan'],
    coordinates: [15.08, 107.98]
  },
  illustration: {
    imageUrl: 'https://example.com/trochalopteron.jpg',
    artist: 'Naturalist Archives',
    sourceBook: 'Avifauna of Central Vietnam'
  },
  audioCall: {
    audioUrl: 'https://example.com/audio.mp3',
    duration: '0:24',
    recordist: 'Dao Van Tien',
    location: 'Đỉnh Ngọc Linh'
  }
};

describe('EndemicFocusCard Component', () => {
  it('renders empty fallback state when no species is provided/selected', () => {
    render(
      <TaxonomyProvider initialSpeciesId="non-existent-id">
        <EndemicFocusCard species={null} />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('endemic-focus-card-empty')).toBeDefined();
    expect(screen.getByText('Khám phá Vùng Chim Đặc Hữu')).toBeDefined();
  });

  it('renders species trilingual information, taxonomy, and ecological metrics', () => {
    render(
      <TaxonomyProvider>
        <EndemicFocusCard species={mockBird} />
      </TaxonomyProvider>
    );

    // Trilingual names
    expect(screen.getAllByText('Khướu Ngọc Linh').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Trochalopteron ngoclinhense').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Golden-winged Laughingthrush')).toBeDefined();

    // Taxonomy badges
    expect(screen.getByText(/Bộ Sẻ/i)).toBeDefined();
    expect(screen.getByText(/Họ Khướu/i)).toBeDefined();

    // Ecological & distribution
    expect(screen.getByText('1.900m - 2.598m')).toBeDefined();
    expect(screen.getByText('Cao nguyên Kon Tum / Dãy Ngọc Linh')).toBeDefined();
    expect(screen.getByText(/KBT Thiên nhiên Ngọc Linh/i)).toBeDefined();
    expect(screen.getByText('Rừng lùn đỉnh núi mù sương')).toBeDefined();

    // Morphological note
    expect(screen.getByText(/Loài khướu cỡ trung bình với dải cánh màu vàng kim/i)).toBeDefined();

    // Naturalist plate caption
    expect(screen.getByText(/Naturalist Archives — Avifauna of Central Vietnam/i)).toBeDefined();
  });

  it('renders endemic badge and conservation status', () => {
    render(
      <TaxonomyProvider>
        <EndemicFocusCard species={mockBird} />
      </TaxonomyProvider>
    );

    expect(screen.getByText(/Đặc hữu Việt Nam/i)).toBeDefined();
    expect(screen.getByText('VN:EN')).toBeDefined();
  });

  it('calls navigation callbacks when clicking switch view buttons', () => {
    const handleSunburst = vi.fn();
    const handleCurator = vi.fn();

    render(
      <TaxonomyProvider>
        <EndemicFocusCard
          species={mockBird}
          onViewSunburst={handleSunburst}
          onViewCurator={handleCurator}
        />
      </TaxonomyProvider>
    );

    const sunburstBtn = screen.getByText(/Khám phá trên Cây Phả hệ/i);
    fireEvent.click(sunburstBtn);
    expect(handleSunburst).toHaveBeenCalledTimes(1);

    const curatorBtn = screen.getByText(/Mở Cẩm nang Nhận dạng/i);
    fireEvent.click(curatorBtn);
    expect(handleCurator).toHaveBeenCalledTimes(1);

    const plateClickable = screen.getByTestId('specimen-plate-clickable');
    fireEvent.click(plateClickable);
    expect(handleCurator).toHaveBeenCalledTimes(2);

    const nameClickable = screen.getByTestId('species-name-clickable');
    fireEvent.click(nameClickable);
    expect(handleCurator).toHaveBeenCalledTimes(3);
  });

  it('calls random callback when clicking random dice button', () => {
    const handleRandom = vi.fn();

    render(
      <TaxonomyProvider>
        <EndemicFocusCard
          species={mockBird}
          onSelectRandom={handleRandom}
        />
      </TaxonomyProvider>
    );

    const randomBtn = screen.getByLabelText(/Đổi loài ngẫu nhiên/i);
    fireEvent.click(randomBtn);
    expect(handleRandom).toHaveBeenCalledTimes(1);
  });

  it('toggles collapse state when clicking chevron button', () => {
    render(
      <TaxonomyProvider>
        <EndemicFocusCard species={mockBird} />
      </TaxonomyProvider>
    );

    const toggleBtn = screen.getByLabelText(/Thu gọn thẻ thông tin/i);
    expect(screen.getAllByText('Khướu Ngọc Linh').length).toBeGreaterThanOrEqual(1);

    fireEvent.click(toggleBtn);
    // After collapse button clicked
    expect(screen.getByLabelText(/Mở rộng thẻ thông tin/i)).toBeDefined();
  });
});

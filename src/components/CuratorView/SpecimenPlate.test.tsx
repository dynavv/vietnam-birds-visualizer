import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpecimenPlate } from './SpecimenPlate';
import type { BirdSpecies } from '../../types/bird';

describe('SpecimenPlate Component', () => {
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
      description: 'Loài nguy cấp đặc hữu.'
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
      ebaRegion: 'Cao nguyên Kon Tum',
      elevation: '1.900m - 2.598m',
      habitats: ['Rừng lùn đỉnh núi mù sương'],
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

  it('renders empty placeholder when no species is provided', () => {
    render(<SpecimenPlate species={null} />);
    expect(screen.getByTestId('specimen-plate-empty')).toBeDefined();
    expect(screen.getByText(/Chưa chọn bản tranh mẫu vật/i)).toBeDefined();
  });

  it('renders archival plate details correctly', () => {
    render(<SpecimenPlate species={mockSpecies} plateNumber="PL. TAB. 24" />);

    expect(screen.getByTestId('specimen-plate')).toBeDefined();
    expect(screen.getByText('PL. TAB. 24')).toBeDefined();
    expect(screen.getAllByText('Khướu Ngọc Linh').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Trochalopteron ngoclinhense').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/H. Grönvold/i)).toBeDefined();
    expect(screen.getByText(/Les Oiseaux de l'Indochine Française/i)).toBeDefined();
    expect(screen.getAllByText(/Đặc hữu/i).length).toBeGreaterThanOrEqual(1);
  });

  it('opens zoom inspection lightbox when clicking the inspect button', async () => {
    render(<SpecimenPlate species={mockSpecies} />);

    expect(screen.queryByTestId('specimen-lightbox')).toBeNull();

    const inspectBtn = screen.getByRole('button', { name: /Soi chi tiết tranh vẽ/i });
    await act(async () => {
      fireEvent.click(inspectBtn);
    });

    expect(screen.getByTestId('specimen-lightbox')).toBeDefined();
    expect(screen.getByLabelText(/Phóng to/i)).toBeDefined();
    expect(screen.getByLabelText(/Thu nhỏ/i)).toBeDefined();
  });

  it('handles zoom in, zoom out, reset and close in lightbox modal', async () => {
    render(<SpecimenPlate species={mockSpecies} />);

    // Open lightbox
    const inspectBtn = screen.getByRole('button', { name: /Soi chi tiết tranh vẽ/i });
    await act(async () => {
      fireEvent.click(inspectBtn);
    });

    const zoomInBtn = screen.getByLabelText(/Phóng to/i);
    const zoomOutBtn = screen.getByLabelText(/Thu nhỏ/i);
    const resetBtn = screen.getByLabelText(/Khôi phục kích thước/i);
    const closeBtn = screen.getByLabelText(/Đóng kính lúp/i);

    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(resetBtn);
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('specimen-lightbox')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MorphologyReport } from './MorphologyReport';
import type { BirdSpecies } from '../../types/bird';

describe('MorphologyReport Component', () => {
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
      description: 'Loài nguy cấp.'
    },
    morphologicalAnalysis: {
      overview: 'Loài khướu cỡ trung bình tuyệt đẹp với dải cánh màu vàng kim rực rỡ.',
      diagnosticFeatures: [
        {
          part: 'Vệt cánh vàng kim',
          description: 'Lông bao cánh sơ cấp và thứ cấp có viền màu vàng kim óng ánh.'
        },
        {
          part: 'Cấu trúc mỏ và mặt',
          description: 'Mỏ màu đen sẫm khỏe khoắn thích nghi bới tìm sâu bọ trong lớp rêu.'
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
    }
  };

  it('renders empty placeholder when species is null', () => {
    render(<MorphologyReport species={null} />);
    expect(screen.getByTestId('morphology-report-empty')).toBeDefined();
    expect(screen.getByText(/Chưa có dữ liệu hình thái học/i)).toBeDefined();
  });

  it('renders morphological overview correctly', () => {
    render(<MorphologyReport species={mockSpecies} />);

    expect(screen.getByTestId('morphology-report')).toBeDefined();
    expect(
      screen.getByText(/Loài khướu cỡ trung bình tuyệt đẹp với dải cánh màu vàng kim rực rỡ/i)
    ).toBeDefined();
    expect(screen.getByText(/1. Mô Tả Tổng Quan/i)).toBeDefined();
  });

  it('renders all diagnostic features cards with anatomical breakdown', () => {
    render(<MorphologyReport species={mockSpecies} />);

    const featureCards = screen.getAllByTestId('diagnostic-feature-card');
    expect(featureCards.length).toBe(2);

    expect(screen.getByText('Vệt cánh vàng kim')).toBeDefined();
    expect(
      screen.getByText(/Lông bao cánh sơ cấp và thứ cấp có viền màu vàng kim óng ánh/i)
    ).toBeDefined();

    expect(screen.getByText('Cấu trúc mỏ và mặt')).toBeDefined();
    expect(
      screen.getByText(/Mỏ màu đen sẫm khỏe khoắn thích nghi bới tìm sâu bọ trong lớp rêu/i)
    ).toBeDefined();
  });

  it('renders taxonomic and evolutionary rationale section', () => {
    render(<MorphologyReport species={mockSpecies} />);

    expect(screen.getByText(/3. Lập Luận Phân Loại Học Tiến Hóa/i)).toBeDefined();
    expect(screen.getByText(/Cơ sở Di truyền & Bức xạ Tiến hóa của Chi Trochalopteron/i)).toBeDefined();
    expect(screen.getByText(/Cao nguyên Kon Tum/i)).toBeDefined();
  });
});

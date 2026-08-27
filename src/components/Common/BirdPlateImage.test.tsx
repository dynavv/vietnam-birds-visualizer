import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BirdPlateImage } from './BirdPlateImage';
import type { BirdSpecies } from '../../types/bird';

const mockSpecies: BirdSpecies = {
  id: 'trochalopteron-ngoclinhense',
  scientificName: 'Trochalopteron ngoclinhense',
  vietnameseName: 'Khướu Ngọc Linh',
  englishName: 'Golden-winged Laughingthrush',
  taxonomy: {
    clade: ['Aves', 'Passeriformes', 'Leiothrichidae', 'Trochalopteron'],
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
    description: 'Endangered species'
  },
  morphologicalAnalysis: {
    overview: 'Medium sized laughingthrush',
    diagnosticFeatures: [{ part: 'Wing', description: 'Golden wing panel' }]
  },
  distribution: {
    ebaRegion: 'Ngoc Linh',
    elevation: '2000m',
    habitats: ['Highland forest'],
    locations: ['Ngoc Linh'],
    coordinates: [15.08, 107.98]
  },
  illustration: {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Trochalopteron_ngoclinhense.jpg',
    artist: 'Naturalist Archives'
  }
};

describe('BirdPlateImage Component', () => {
  it('renders correctly with species info and naturalist plate frame', () => {
    render(<BirdPlateImage species={mockSpecies} />);
    
    expect(screen.getByTestId('bird-plate-trochalopteron-ngoclinhense')).toBeDefined();
    expect(screen.getAllByText(/Khướu Ngọc Linh/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Trochalopteron ngoclinhense/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/★ ĐẶC HỮU/i)).toBeDefined();
  });

  it('renders naturalist vector artwork fallback gracefully', () => {
    render(<BirdPlateImage species={mockSpecies} />);
    expect(screen.getAllByText(/Khướu Ngọc Linh/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Passeriformes/i)).toBeDefined();
  });
});

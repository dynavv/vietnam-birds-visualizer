import { render, screen, fireEvent } from '@testing-library/react';
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

  it('falls back to thumbnailUrl on primary image load error', () => {
    const speciesWithThumb: BirdSpecies = {
      ...mockSpecies,
      illustration: {
        imageUrl: 'https://broken.example.com/original.jpg',
        thumbnailUrl: 'https://working.example.com/thumb.jpg',
        artist: 'Naturalist Archives'
      }
    };

    render(<BirdPlateImage species={speciesWithThumb} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('https://broken.example.com/original.jpg');

    // Simulate primary image load error
    fireEvent.error(img);

    // Re-query fresh img element after component re-rendered with new key
    const thumbImg = screen.getByRole('img');
    expect(thumbImg.getAttribute('src')).toBe('https://working.example.com/thumb.jpg');
  });

  it('falls back to naturalist vector artwork fallback when both image and thumbnail fail', () => {
    const speciesBroken: BirdSpecies = {
      ...mockSpecies,
      illustration: {
        imageUrl: 'https://broken.example.com/original.jpg',
        thumbnailUrl: 'https://broken.example.com/thumb.jpg',
        artist: 'Naturalist Archives'
      }
    };

    render(<BirdPlateImage species={speciesBroken} />);
    const img1 = screen.getByRole('img');

    // First error: tries thumbnail
    fireEvent.error(img1);
    const img2 = screen.getByRole('img');
    // Second error: falls back to vector
    fireEvent.error(img2);

    // After all errors, img is removed and vector plate is displayed
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText(/Passeriformes/i)).toBeDefined();
    expect(screen.getAllByText(/Khướu Ngọc Linh/i).length).toBeGreaterThanOrEqual(1);
  });

  it('resets error state when species prop changes', () => {
    const speciesA: BirdSpecies = {
      ...mockSpecies,
      id: 'species-a',
      illustration: {
        imageUrl: 'https://broken.example.com/a.jpg',
        artist: 'Artist A'
      }
    };

    const speciesB: BirdSpecies = {
      ...mockSpecies,
      id: 'species-b',
      vietnameseName: 'Chim B',
      illustration: {
        imageUrl: 'https://valid.example.com/b.jpg',
        artist: 'Artist B'
      }
    };

    const { rerender } = render(<BirdPlateImage species={speciesA} />);
    const imgA = screen.getByRole('img');

    // Error out on species A
    fireEvent.error(imgA);
    expect(screen.queryByRole('img')).toBeNull();

    // Rerender with species B
    rerender(<BirdPlateImage species={speciesB} />);

    // Error state should have reset to show new image
    const imgB = screen.getByRole('img');
    expect(imgB.getAttribute('src')).toBe('https://valid.example.com/b.jpg');
  });
});

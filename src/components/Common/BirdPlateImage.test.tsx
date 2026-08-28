import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BirdPlateImage } from './BirdPlateImage';
import type { BirdSpecies } from '../../types/bird';
import * as photoResolver from '../../utils/photoResolver';

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
    elevation: '1900m - 2598m',
    habitats: ['Cloud forest'],
    locations: ['Ngoc Linh Nature Reserve'],
    coordinates: [15.08, 107.98]
  },
  illustration: {
    imageUrl: 'https://example.com/trochalopteron.jpg',
    thumbnailUrl: 'https://example.com/trochalopteron-thumb.jpg',
    artist: 'Naturalist Archives',
    license: 'cc-by'
  }
};

describe('BirdPlateImage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with species info and naturalist plate frame', () => {
    render(<BirdPlateImage species={mockSpecies} />);
    const img = screen.getByRole('img');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('https://example.com/trochalopteron.jpg');
    expect(img.getAttribute('alt')).toContain('Khướu Ngọc Linh');
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

  it('resolves dynamic photo when static image and thumbnail fail', async () => {
    vi.spyOn(photoResolver, 'resolveDynamicPhoto').mockResolvedValueOnce({
      imageUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/dynamic-resolved.jpg',
      thumbnailUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/dynamic-thumb.jpg',
      artist: 'Dynamic Photographer',
      license: 'cc-by-nc',
      source: 'inaturalist'
    });

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
    // Second error: triggers dynamic photo resolver
    fireEvent.error(img2);

    await waitFor(() => {
      const resolvedImg = screen.getByRole('img');
      expect(resolvedImg.getAttribute('src')).toBe('https://inaturalist-open-data.s3.amazonaws.com/photos/dynamic-resolved.jpg');
    });
  });

  it('falls back to naturalist vector artwork fallback when all dynamic sources fail', async () => {
    vi.spyOn(photoResolver, 'resolveDynamicPhoto').mockResolvedValueOnce(null);

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
    // Second error: attempts dynamic resolver then vector
    fireEvent.error(img2);

    // Wait for all fallbacks to settle
    await waitFor(() => {
      expect(screen.queryByRole('img')).toBeNull();
    });
    expect(screen.getByText(/Passeriformes/i)).toBeDefined();
    expect(screen.getAllByText(/Khướu Ngọc Linh/i).length).toBeGreaterThanOrEqual(1);
  });

  it('resets error state when species prop changes', async () => {
    vi.spyOn(photoResolver, 'resolveDynamicPhoto').mockResolvedValue(null);

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
    await waitFor(() => {
      expect(screen.queryByRole('img')).toBeNull();
    });

    // Rerender with species B
    rerender(<BirdPlateImage species={speciesB} />);

    // Error state should have reset to show new image
    const imgB = screen.getByRole('img');
    expect(imgB.getAttribute('src')).toBe('https://valid.example.com/b.jpg');
  });
});

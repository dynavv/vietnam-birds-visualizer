import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EBAMobileBottomSheet } from './EBAMobileBottomSheet';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import type { EBARegion, BirdSpecies } from '../../types/bird';

const mockRegions: EBARegion[] = [
  {
    id: 'dalat-plateau',
    code: 'EBA 130',
    name: 'Da Lat Plateau',
    vietnameseName: 'Cao nguyên Đà Lạt',
    description: 'Vùng núi cao Nam Tây Nguyên',
    coordinates: [11.95, 108.45],
    zoomLevel: 9,
    keySpeciesIds: ['crocias-langbianis', 'trochalopteron-yersini'],
    habitats: ['Rừng thông ba lá', 'Rừng lá rộng thường xanh']
  },
  {
    id: 'kon-tum-plateau',
    code: 'EBA 131',
    name: 'Kon Tum Plateau',
    vietnameseName: 'Cao nguyên Kon Tum',
    description: 'Vùng núi cao Bắc Tây Nguyên',
    coordinates: [15.08, 107.98],
    zoomLevel: 9,
    keySpeciesIds: ['trochalopteron-ngoclinhense'],
    habitats: ['Rừng lùn đỉnh núi mù sương']
  }
];

const mockSpecies: BirdSpecies = {
  id: 'crocias-langbianis',
  scientificName: 'Laniellus langbianis',
  vietnameseName: 'Mi Langbiang',
  englishName: 'Grey-crowned Crocias',
  taxonomy: {
    clade: ['Aves', 'Passerea'],
    order: 'Passeriformes',
    orderVietnamese: 'Bộ Sẻ',
    family: 'Leiothrichidae',
    familyVietnamese: 'Họ Khướu',
    genus: 'Laniellus',
    species: 'L. langbianis'
  },
  isEndemic: true,
  conservation: {
    iucn: 'EN',
    description: 'Nguy cấp'
  },
  morphologicalAnalysis: {
    overview: 'Loài mi đặc hữu Đà Lạt',
    diagnosticFeatures: []
  },
  distribution: {
    ebaRegion: 'Cao nguyên Đà Lạt',
    elevation: '900m - 1.500m',
    habitats: ['Rừng lá rộng thường xanh'],
    locations: ['Lạc Dương', 'Đà Lạt'],
    coordinates: [11.95, 108.45]
  },
  illustration: {
    imageUrl: 'https://example.com/crocias.jpg',
    artist: 'Artist'
  }
};

describe('EBAMobileBottomSheet Component', () => {
  it('renders in peek mode by default with header, handle and EBA title', () => {
    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId={null}
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
        />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('eba-mobile-bottom-sheet')).toBeDefined();
    expect(screen.getByTestId('bottom-sheet-handle')).toBeDefined();
    expect(screen.getByText('7 Vùng Chim Đặc Hữu (EBA)')).toBeDefined();
    expect(screen.getByTestId('bottom-sheet-expand-to-half')).toBeDefined();
  });

  it('displays selected region name and count in peek mode when selectedRegionId is provided', () => {
    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId="dalat-plateau"
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
        />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Cao nguyên Đà Lạt')).toBeDefined();
    expect(screen.getByText('2 loài')).toBeDefined();
  });

  it('expands to half mode and displays regions content when clicking expand button', () => {
    const handleSnapChange = vi.fn();
    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId={null}
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
          onSnapChange={handleSnapChange}
        />
      </TaxonomyProvider>
    );

    fireEvent.click(screen.getByTestId('bottom-sheet-expand-to-half'));

    expect(screen.getByText('Cao nguyên Đà Lạt')).toBeDefined();
    expect(screen.getByText('Cao nguyên Kon Tum')).toBeDefined();
    expect(screen.getByTestId('bottom-sheet-close-to-peek')).toBeDefined();
    expect(handleSnapChange).toHaveBeenCalledWith('half');
  });

  it('expands to half mode when handle is clicked', () => {
    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId={null}
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
        />
      </TaxonomyProvider>
    );

    const handle = screen.getByTestId('bottom-sheet-handle');
    fireEvent.click(handle);

    expect(screen.getByTestId('bottom-sheet-close-to-peek')).toBeDefined();
    expect(screen.getByText('Cao nguyên Đà Lạt')).toBeDefined();
  });

  it('triggers onSelectSpecies and collapses back to peek when a species chip is clicked in expanded mode', () => {
    const handleSelectSpecies = vi.fn();
    const handleSnapChange = vi.fn();

    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId="dalat-plateau"
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
          onSelectSpecies={handleSelectSpecies}
          onSnapChange={handleSnapChange}
        />
      </TaxonomyProvider>
    );

    // Open sheet
    fireEvent.click(screen.getByTestId('bottom-sheet-expand-to-half'));

    // Find species chip
    const speciesChip = screen.getByText('Mi Langbiang');
    fireEvent.click(speciesChip);

    expect(handleSelectSpecies).toHaveBeenCalledWith(mockSpecies);
    expect(handleSnapChange).toHaveBeenCalledWith('peek');
    expect(screen.queryByTestId('bottom-sheet-close-to-peek')).toBeNull();
    expect(screen.getByTestId('bottom-sheet-expand-to-half')).toBeDefined();
  });

  it('triggers onSelectRegion and keeps sheet open when a region card is clicked', () => {
    const handleSelectRegion = vi.fn();
    const handleSnapChange = vi.fn();

    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId={null}
          selectedSpecies={null}
          onSelectRegion={handleSelectRegion}
          onSnapChange={handleSnapChange}
        />
      </TaxonomyProvider>
    );

    // Open sheet
    fireEvent.click(screen.getByTestId('bottom-sheet-expand-to-half'));
    expect(screen.getByTestId('bottom-sheet-close-to-peek')).toBeDefined();

    const dalatCard = screen.getByTestId('mobile-eba-region-card-dalat-plateau');
    const dalatBtn = dalatCard.querySelector('button');
    expect(dalatBtn).not.toBeNull();
    if (dalatBtn) {
      fireEvent.click(dalatBtn);
      expect(handleSelectRegion).toHaveBeenCalledWith(mockRegions[0]);
    }

    // Should stay open in half mode (NOT collapse to peek)
    expect(screen.getByTestId('bottom-sheet-close-to-peek')).toBeDefined();
    expect(screen.queryByTestId('bottom-sheet-expand-to-half')).toBeNull();
    expect(handleSnapChange).not.toHaveBeenCalledWith('peek');
  });

  it('collapses back to peek mode when clicking close-to-peek button', () => {
    const handleSnapChange = vi.fn();
    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId={null}
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
          onSnapChange={handleSnapChange}
        />
      </TaxonomyProvider>
    );

    // Open sheet
    fireEvent.click(screen.getByTestId('bottom-sheet-expand-to-half'));
    expect(screen.getByText('Cao nguyên Đà Lạt')).toBeDefined();

    // Click close to peek
    fireEvent.click(screen.getByTestId('bottom-sheet-close-to-peek'));

    // Content area should be collapsed
    expect(screen.queryByTestId('bottom-sheet-close-to-peek')).toBeNull();
    expect(screen.getByTestId('bottom-sheet-expand-to-half')).toBeDefined();
    expect(handleSnapChange).toHaveBeenCalledWith('peek');
  });

  it('handles touch swipe gestures to expand and collapse sheet', () => {
    render(
      <TaxonomyProvider>
        <EBAMobileBottomSheet
          regions={mockRegions}
          allSpecies={[mockSpecies]}
          selectedRegionId={null}
          selectedSpecies={null}
          onSelectRegion={vi.fn()}
        />
      </TaxonomyProvider>
    );

    const handle = screen.getByTestId('bottom-sheet-handle');

    // Swipe up delta = -60 (from 100 to 40)
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(handle, { touches: [{ clientY: 70 }] });
    fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 40 }] });

    // Should now be open in half mode
    expect(screen.getByTestId('bottom-sheet-close-to-peek')).toBeDefined();

    // Swipe down delta = +60 (from 40 to 100)
    fireEvent.touchStart(handle, { touches: [{ clientY: 40 }] });
    fireEvent.touchMove(handle, { touches: [{ clientY: 70 }] });
    fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 100 }] });

    // Should collapse back to peek
    expect(screen.queryByTestId('bottom-sheet-close-to-peek')).toBeNull();
  });
});

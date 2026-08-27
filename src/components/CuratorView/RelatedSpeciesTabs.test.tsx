import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RelatedSpeciesTabs } from './RelatedSpeciesTabs';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import type { BirdSpecies } from '../../types/bird';

describe('RelatedSpeciesTabs Component', () => {
  const speciesList: BirdSpecies[] = [
    {
      id: 'trochalopteron-ngoclinhense',
      scientificName: 'Trochalopteron ngoclinhense',
      vietnameseName: 'Khướu Ngọc Linh',
      englishName: 'Golden-winged Laughingthrush',
      taxonomy: {
        clade: ['Aves', 'Neognathae'],
        order: 'Passeriformes',
        orderVietnamese: 'Bộ Sẻ',
        family: 'Leiothrichidae',
        familyVietnamese: 'Họ Khướu',
        genus: 'Trochalopteron',
        species: 'T. ngoclinhense'
      },
      isEndemic: true,
      conservation: { iucn: 'EN', description: 'Endangered' },
      morphologicalAnalysis: { overview: '', diagnosticFeatures: [] },
      distribution: {
        ebaRegion: 'Kon Tum',
        elevation: '2000m',
        habitats: ['Rừng'],
        locations: ['Ngọc Linh'],
        coordinates: [15.08, 107.98]
      },
      illustration: { imageUrl: '', artist: 'H. Gronvold' }
    },
    {
      id: 'trochalopteron-milnei',
      scientificName: 'Trochalopteron milnei',
      vietnameseName: 'Khướu Đuôi Đỏ',
      englishName: 'Red-tailed Laughingthrush',
      taxonomy: {
        clade: ['Aves', 'Neognathae'],
        order: 'Passeriformes',
        orderVietnamese: 'Bộ Sẻ',
        family: 'Leiothrichidae',
        familyVietnamese: 'Họ Khướu',
        genus: 'Trochalopteron',
        species: 'T. milnei'
      },
      isEndemic: false,
      conservation: { iucn: 'LC', description: 'Least Concern' },
      morphologicalAnalysis: { overview: '', diagnosticFeatures: [] },
      distribution: {
        ebaRegion: 'Hoàng Liên Sơn',
        elevation: '1800m',
        habitats: ['Rừng'],
        locations: ['Sa Pa'],
        coordinates: [22.3, 103.8]
      },
      illustration: { imageUrl: '', artist: 'Naturalist Archive' }
    },
    {
      id: 'ianthocincla-konkakinhensis',
      scientificName: 'Ianthocincla konkakinhensis',
      vietnameseName: 'Khướu Kon Ka Kinh',
      englishName: 'Chestnut-eared Laughingthrush',
      taxonomy: {
        clade: ['Aves', 'Neognathae'],
        order: 'Passeriformes',
        orderVietnamese: 'Bộ Sẻ',
        family: 'Leiothrichidae',
        familyVietnamese: 'Họ Khướu',
        genus: 'Ianthocincla',
        species: 'I. konkakinhensis'
      },
      isEndemic: true,
      conservation: { iucn: 'VU', description: 'Vulnerable' },
      morphologicalAnalysis: { overview: '', diagnosticFeatures: [] },
      distribution: {
        ebaRegion: 'Kon Tum',
        elevation: '1500m',
        habitats: ['Rừng'],
        locations: ['Kon Ka Kinh'],
        coordinates: [14.3, 108.3]
      },
      illustration: { imageUrl: '', artist: 'Naturalist Archive' }
    }
  ];

  it('renders related species in the same genus by default', () => {
    render(
      <TaxonomyProvider>
        <RelatedSpeciesTabs
          currentSpecies={speciesList[0]}
          allSpecies={speciesList}
        />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('related-species-tabs')).toBeDefined();
    // Same genus species (Khướu Đuôi Đỏ) should appear
    expect(screen.getByText('Khướu Đuôi Đỏ')).toBeDefined();
    expect(screen.getByText('Trochalopteron milnei')).toBeDefined();
  });

  it('allows switching between Genus, Family and All tabs', () => {
    render(
      <TaxonomyProvider>
        <RelatedSpeciesTabs
          currentSpecies={speciesList[0]}
          allSpecies={speciesList}
        />
      </TaxonomyProvider>
    );

    // Switch to Family tab
    const familyTab = screen.getByRole('tab', { name: /Cùng Họ/i });
    fireEvent.click(familyTab);

    // Both Khướu Đuôi Đỏ and Khướu Kon Ka Kinh should be in the same family
    expect(screen.getByText('Khướu Kon Ka Kinh')).toBeDefined();
    expect(screen.getByText('Khướu Đuôi Đỏ')).toBeDefined();
  });

  it('triggers onSelectSpecies when a related species card is clicked', () => {
    const handleSelect = vi.fn();

    render(
      <TaxonomyProvider>
        <RelatedSpeciesTabs
          currentSpecies={speciesList[0]}
          allSpecies={speciesList}
          onSelectSpecies={handleSelect}
        />
      </TaxonomyProvider>
    );

    const relatedCard = screen.getByTestId('related-species-card-trochalopteron-milnei');
    fireEvent.click(relatedCard);

    expect(handleSelect).toHaveBeenCalledWith('trochalopteron-milnei');
  });

  it('renders solitary/monotypic message when no related species in genus are present', () => {
    const solitarySpecies = speciesList[2]; // Ianthocincla (only 1 in mock)

    render(
      <TaxonomyProvider>
        <RelatedSpeciesTabs
          currentSpecies={solitarySpecies}
          allSpecies={[solitarySpecies]}
        />
      </TaxonomyProvider>
    );

    expect(
      screen.getByText(/là chi đơn loài đại diện tại Việt Nam/i)
    ).toBeDefined();
  });
});

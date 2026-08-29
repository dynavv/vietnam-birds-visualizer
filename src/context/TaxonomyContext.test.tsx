import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TaxonomyProvider, useTaxonomy } from './TaxonomyContext';
import type { TaxonomyNode } from '../types/bird';

describe('TaxonomyContext & useTaxonomy Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TaxonomyProvider>{children}</TaxonomyProvider>
  );

  it('should throw an error when useTaxonomy is called outside of TaxonomyProvider', () => {
    // Suppress console.error during this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useTaxonomy());
    }).toThrow('useTaxonomy must be used within a TaxonomyProvider');

    console.error = originalError;
  });

  it('should initialize with default states and select an endemic species', () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper });

    expect(result.current.activeView).toBe('map');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.onlyEndemic).toBe(false);
    expect(result.current.selectedOrder).toBe('all');
    expect(result.current.selectedConservation).toBe('all');
    expect(result.current.hoveredTaxonNode).toBeNull();

    expect(result.current.allSpecies.length).toBeGreaterThanOrEqual(50);
    expect(result.current.filteredSpecies.length).toBe(result.current.allSpecies.length);
    expect(result.current.taxonomyTree.name).toBe('Aves');
    expect(result.current.ebaRegions.length).toBe(6);

    expect(result.current.selectedSpeciesId).toBeTruthy();
    expect(result.current.selectedSpecies).not.toBeNull();
    expect(result.current.selectedSpecies?.isEndemic).toBe(true);
  });

  it('should initialize selectedSpeciesId with a valid species and track discovery', () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper });

    expect(result.current.selectedSpeciesId).toBeTruthy();
    expect(result.current.selectedSpecies).not.toBeNull();
    expect(result.current.discoveredSpeciesIds.length).toBeGreaterThanOrEqual(1);
    expect(result.current.discoveredSpeciesIds).toContain(result.current.selectedSpeciesId);
  });

  it('should allow selecting a species by ID', () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper });

    const targetId = 'lophura-edwardsi';
    act(() => {
      result.current.selectSpecies(targetId);
    });

    expect(result.current.selectedSpeciesId).toBe(targetId);
    expect(result.current.selectedSpecies).not.toBeNull();
    expect(result.current.selectedSpecies?.id).toBe(targetId);
    expect(result.current.selectedSpecies?.vietnameseName).toContain('Gà lôi lam mào trắng');
  });

  it('should select a random endemic species when calling selectRandomEndemic()', () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper });

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.selectRandomEndemic();
      });

      expect(result.current.selectedSpeciesId).toBeTruthy();
      expect(result.current.selectedSpecies).not.toBeNull();
      expect(result.current.selectedSpecies?.isEndemic).toBe(true);
    }
  });

  it('should switch active views correctly', () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper });

    expect(result.current.activeView).toBe('map');

    act(() => {
      result.current.setActiveView('sunburst');
    });
    expect(result.current.activeView).toBe('sunburst');

    act(() => {
      result.current.setActiveView('curator');
    });
    expect(result.current.activeView).toBe('curator');

    act(() => {
      result.current.setActiveView('map');
    });
    expect(result.current.activeView).toBe('map');
  });

  it('should update hoveredTaxonNode correctly', () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper });

    const sampleNode: TaxonomyNode = {
      name: 'Passeriformes',
      vietnameseName: 'Bộ Sẻ',
      rank: 'order'
    };

    act(() => {
      result.current.setHoveredTaxonNode(sampleNode);
    });
    expect(result.current.hoveredTaxonNode).toEqual(sampleNode);

    act(() => {
      result.current.setHoveredTaxonNode(null);
    });
    expect(result.current.hoveredTaxonNode).toBeNull();
  });

  describe('Filtering functionality', () => {
    it('should filter only endemic species when onlyEndemic is true', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      act(() => {
        result.current.setOnlyEndemic(true);
      });

      expect(result.current.onlyEndemic).toBe(true);
      expect(result.current.filteredSpecies.length).toBeGreaterThanOrEqual(12);
      for (const species of result.current.filteredSpecies) {
        expect(species.isEndemic).toBe(true);
      }
    });

    it('should filter species by trilingual search query (Vietnamese, English, Scientific)', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      // Vietnamese query
      act(() => {
        result.current.setSearchQuery('Ngọc Linh');
      });
      expect(result.current.filteredSpecies.length).toBeGreaterThan(0);
      const ngocLinh = result.current.filteredSpecies.find(s => s.id === 'trochalopteron-ngoclinhense');
      expect(ngocLinh).toBeDefined();
      expect(ngocLinh?.vietnameseName).toBe('Khướu Ngọc Linh');

      // English query
      act(() => {
        result.current.setSearchQuery('Golden-winged');
      });
      expect(result.current.filteredSpecies.length).toBeGreaterThan(0);
      expect(result.current.filteredSpecies.some(s => s.id === 'trochalopteron-ngoclinhense')).toBe(true);

      // Scientific query
      act(() => {
        result.current.setSearchQuery('Trochalopteron');
      });
      expect(result.current.filteredSpecies.length).toBeGreaterThan(0);
      expect(result.current.filteredSpecies.some(s => s.id === 'trochalopteron-ngoclinhense')).toBe(true);
    });

    it('should filter species by taxonomic order', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      act(() => {
        result.current.setSelectedOrder('Passeriformes');
      });

      expect(result.current.selectedOrder).toBe('Passeriformes');
      expect(result.current.filteredSpecies.length).toBeGreaterThan(0);
      for (const species of result.current.filteredSpecies) {
        expect(species.taxonomy.order).toBe('Passeriformes');
      }
    });

    it('should filter species by conservation IUCN status', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      act(() => {
        result.current.setSelectedConservation('CR');
      });

      expect(result.current.selectedConservation).toBe('CR');
      expect(result.current.filteredSpecies.length).toBeGreaterThan(0);
      for (const species of result.current.filteredSpecies) {
        expect(species.conservation.iucn).toBe('CR');
      }
    });

    it('should combine multiple filters simultaneously', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      act(() => {
        result.current.setOnlyEndemic(true);
        result.current.setSelectedOrder('Galliformes');
      });

      for (const species of result.current.filteredSpecies) {
        expect(species.isEndemic).toBe(true);
        expect(species.taxonomy.order).toBe('Galliformes');
      }
    });
  });

  describe('Cladogram Tree Expansion State & Auto-expansion', () => {
    it('initializes with default expanded orders (Passeriformes, Galliformes)', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });
      expect(result.current.expandedNodes.has('Passeriformes')).toBe(true);
      expect(result.current.expandedNodes.has('Galliformes')).toBe(true);
    });

    it('toggles node expansion state correctly', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      // Toggle off Passeriformes
      act(() => {
        result.current.toggleExpandedNode('Passeriformes');
      });
      expect(result.current.expandedNodes.has('Passeriformes')).toBe(false);

      // Toggle on Passeriformes
      act(() => {
        result.current.toggleExpandedNode('Passeriformes');
      });
      expect(result.current.expandedNodes.has('Passeriformes')).toBe(true);
    });

    it('expands and collapses all tree nodes', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      act(() => {
        result.current.expandAllNodes();
      });
      expect(result.current.expandedNodes.size).toBeGreaterThan(16);

      act(() => {
        result.current.collapseAllNodes();
      });
      expect(result.current.expandedNodes.size).toBe(0);
    });

    it('automatically expands order and family when a species is selected', () => {
      const { result } = renderHook(() => useTaxonomy(), { wrapper });

      // Clear all
      act(() => {
        result.current.collapseAllNodes();
      });
      expect(result.current.expandedNodes.size).toBe(0);

      // Select Lophura edwardsi (Galliformes -> Phasianidae)
      act(() => {
        result.current.selectSpecies('lophura-edwardsi');
      });

      expect(result.current.expandedNodes.has('Galliformes')).toBe(true);
      expect(result.current.expandedNodes.has('Phasianidae')).toBe(true);
    });
  });
});


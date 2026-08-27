import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types/bird';
import rawSpecies from '../data/species.json';
import rawTaxonomy from '../data/taxonomy.json';
import rawEbas from '../data/ebas.json';

const allSpeciesData = rawSpecies as unknown as BirdSpecies[];
const taxonomyTreeData = rawTaxonomy as TaxonomyNode;
const ebaRegionsData = rawEbas as EBARegion[];

export type ViewMode = 'map' | 'sunburst' | 'curator';

export interface TaxonomyContextType {
  selectedSpeciesId: string;
  selectedSpecies: BirdSpecies | null;
  selectSpecies: (id: string) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  hoveredTaxonNode: TaxonomyNode | null;
  setHoveredTaxonNode: (node: TaxonomyNode | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyEndemic: boolean;
  setOnlyEndemic: (val: boolean) => void;
  selectedOrder: string;
  setSelectedOrder: (order: string) => void;
  selectedConservation: string;
  setSelectedConservation: (status: string) => void;
  filteredSpecies: BirdSpecies[];
  selectRandomEndemic: () => void;
  allSpecies: BirdSpecies[];
  taxonomyTree: TaxonomyNode;
  ebaRegions: EBARegion[];
}

export const TaxonomyContext = createContext<TaxonomyContextType | undefined>(undefined);

export interface TaxonomyProviderProps {
  children: React.ReactNode;
  initialSpeciesId?: string;
  initialView?: ViewMode;
}

export const TaxonomyProvider: React.FC<TaxonomyProviderProps> = ({
  children,
  initialSpeciesId,
  initialView = 'map'
}) => {
  // Find default endemic species if no initial ID is passed
  const defaultEndemicId = useMemo(() => {
    const firstEndemic = allSpeciesData.find(s => s.isEndemic);
    return firstEndemic ? firstEndemic.id : (allSpeciesData[0]?.id ?? '');
  }, []);

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(
    initialSpeciesId ?? defaultEndemicId
  );
  const [activeView, setActiveView] = useState<ViewMode>(initialView);
  const [hoveredTaxonNode, setHoveredTaxonNode] = useState<TaxonomyNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyEndemic, setOnlyEndemic] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('all');
  const [selectedConservation, setSelectedConservation] = useState<string>('all');

  const selectSpecies = useCallback((id: string) => {
    setSelectedSpeciesId(id);
  }, []);

  const selectRandomEndemic = useCallback(() => {
    const endemics = allSpeciesData.filter(s => s.isEndemic);
    if (endemics.length === 0) return;
    const randomIndex = Math.floor(Math.random() * endemics.length);
    setSelectedSpeciesId(endemics[randomIndex].id);
  }, []);

  const selectedSpecies = useMemo(() => {
    return allSpeciesData.find(s => s.id === selectedSpeciesId) || null;
  }, [selectedSpeciesId]);

  const filteredSpecies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allSpeciesData.filter(species => {
      // Filter 1: Endemic only
      if (onlyEndemic && !species.isEndemic) {
        return false;
      }

      // Filter 2: Order
      if (selectedOrder !== 'all' && species.taxonomy.order !== selectedOrder) {
        return false;
      }

      // Filter 3: Conservation IUCN
      if (selectedConservation !== 'all' && species.conservation.iucn !== selectedConservation) {
        return false;
      }

      // Filter 4: Trilingual Search Query (Vietnamese, English, Scientific)
      if (query) {
        const matchVietnamese = species.vietnameseName.toLowerCase().includes(query);
        const matchEnglish = species.englishName.toLowerCase().includes(query);
        const matchScientific = species.scientificName.toLowerCase().includes(query);
        if (!matchVietnamese && !matchEnglish && !matchScientific) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, onlyEndemic, selectedOrder, selectedConservation]);

  const contextValue: TaxonomyContextType = useMemo(
    () => ({
      selectedSpeciesId,
      selectedSpecies,
      selectSpecies,
      activeView,
      setActiveView,
      hoveredTaxonNode,
      setHoveredTaxonNode,
      searchQuery,
      setSearchQuery,
      onlyEndemic,
      setOnlyEndemic,
      selectedOrder,
      setSelectedOrder,
      selectedConservation,
      setSelectedConservation,
      filteredSpecies,
      selectRandomEndemic,
      allSpecies: allSpeciesData,
      taxonomyTree: taxonomyTreeData,
      ebaRegions: ebaRegionsData
    }),
    [
      selectedSpeciesId,
      selectedSpecies,
      selectSpecies,
      activeView,
      hoveredTaxonNode,
      searchQuery,
      onlyEndemic,
      selectedOrder,
      selectedConservation,
      filteredSpecies,
      selectRandomEndemic
    ]
  );

  return (
    <TaxonomyContext.Provider value={contextValue}>
      {children}
    </TaxonomyContext.Provider>
  );
};

export const useTaxonomy = (): TaxonomyContextType => {
  const context = useContext(TaxonomyContext);
  if (!context) {
    throw new Error('useTaxonomy must be used within a TaxonomyProvider');
  }
  return context;
};

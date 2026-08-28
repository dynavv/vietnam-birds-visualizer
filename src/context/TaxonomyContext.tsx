import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import { speciesData as allSpeciesData, taxonomyData as taxonomyTreeData, ebasData as ebaRegionsData } from '../data';

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
  expandedNodes: Set<string>;
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleExpandedNode: (nodeName: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
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
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(() => {
    if (initialSpeciesId) return initialSpeciesId;
    const endemics = allSpeciesData.filter(s => s.isEndemic);
    return endemics[0]?.id || allSpeciesData[0]?.id || '';
  });
  const [activeView, setActiveView] = useState<ViewMode>(initialView);
  const [hoveredTaxonNode, setHoveredTaxonNode] = useState<TaxonomyNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyEndemic, setOnlyEndemic] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('all');
  const [selectedConservation, setSelectedConservation] = useState<string>('all');

  // Persistent Cladogram expanded nodes state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    initial.add('Passeriformes');
    initial.add('Galliformes');
    initial.add('Leiothrichidae');
    initial.add('Phasianidae');
    return initial;
  });

  const selectSpecies = useCallback((id: string) => {
    setSelectedSpeciesId(id);
    const sp = allSpeciesData.find(s => s.id === id);
    if (sp?.taxonomy) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (sp.taxonomy.order) next.add(sp.taxonomy.order);
        if (sp.taxonomy.family) next.add(sp.taxonomy.family);
        return next;
      });
    }
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

  // Auto-expand tree branch to selected species
  React.useEffect(() => {
    if (selectedSpecies?.taxonomy) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (selectedSpecies.taxonomy.order) next.add(selectedSpecies.taxonomy.order);
        if (selectedSpecies.taxonomy.family) next.add(selectedSpecies.taxonomy.family);
        return next;
      });
    }
  }, [selectedSpecies]);

  const toggleExpandedNode = useCallback((nodeName: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeName)) {
        next.delete(nodeName);
      } else {
        next.add(nodeName);
      }
      return next;
    });
  }, []);

  const expandAllNodes = useCallback(() => {
    const all = new Set<string>();
    function traverse(node: TaxonomyNode) {
      if (node.children && node.children.length > 0) {
        all.add(node.name);
        node.children.forEach(traverse);
      }
    }
    traverse(taxonomyTreeData);
    setExpandedNodes(all);
  }, []);

  const collapseAllNodes = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

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
      ebaRegions: ebaRegionsData,
      expandedNodes,
      setExpandedNodes,
      toggleExpandedNode,
      expandAllNodes,
      collapseAllNodes
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
      selectRandomEndemic,
      expandedNodes,
      toggleExpandedNode,
      expandAllNodes,
      collapseAllNodes
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


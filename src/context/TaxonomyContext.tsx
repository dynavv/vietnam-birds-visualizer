import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import { speciesData as allSpeciesData, taxonomyData as taxonomyTreeData, ebasData as ebaRegionsData } from '../data';

export type ViewMode = 'map' | 'sunburst' | 'curator';

const STORAGE_KEY_DISCOVERED = 'agy_avifauna_discovered_ids';
const STORAGE_KEY_SHUFFLE_POOL = 'agy_avifauna_shuffle_pool';

// Helper to shuffle an array with Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate new fresh shuffle pool: endemics first (shuffled), then other species (shuffled)
function generateShuffledDeck(speciesList: BirdSpecies[]): string[] {
  const endemics = speciesList.filter(s => s.isEndemic).map(s => s.id);
  const others = speciesList.filter(s => !s.isEndemic).map(s => s.id);
  return [...shuffleArray(endemics), ...shuffleArray(others)];
}

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
  // Discovery Toast state
  discoveryToastSpecies: {
    species: BirdSpecies;
    isNewDiscovery: boolean;
  } | null;
  dismissDiscoveryToast: () => void;
  triggerDiscoveryToast: (species: BirdSpecies, isNew?: boolean) => void;
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
  discoveredSpeciesIds: string[];
  markSpeciesDiscovered: (id: string) => void;
  remainingShuffleCount: number;
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
  initialView
}) => {
  // Discovery tracking state
  const [discoveredSpeciesIds, setDiscoveredSpeciesIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_DISCOVERED);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Safe fallback
    }
    return [];
  });

  // Non-repeating shuffle queue state
  const [shufflePool, setShufflePool] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_SHUFFLE_POOL);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // Safe fallback
    }
    return generateShuffledDeck(allSpeciesData);
  });

  // Helper to read initial URL params safely
  const getUrlParams = (): { view?: ViewMode; speciesId?: string } => {
    if (typeof window === 'undefined') return {};
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as ViewMode | null;
      const speciesParam = params.get('species');
      const validViews: ViewMode[] = ['map', 'sunburst', 'curator'];
      return {
        view: viewParam && validViews.includes(viewParam) ? viewParam : undefined,
        speciesId: speciesParam && allSpeciesData.some(s => s.id === speciesParam) ? speciesParam : undefined
      };
    } catch {
      return {};
    }
  };

  const initialUrlParams = useMemo(() => getUrlParams(), []);

  // Pick initial species: prop > URL param > shuffle deck
  const [selectedSpeciesId, setSelectedSpeciesIdState] = useState<string>(() => {
    if (initialSpeciesId) return initialSpeciesId;
    if (initialUrlParams.speciesId) return initialUrlParams.speciesId;
    // Pick first candidate from current shuffle deck
    const currentPool = shufflePool.length > 0 ? shufflePool : generateShuffledDeck(allSpeciesData);
    return currentPool[0] || allSpeciesData[0]?.id || '';
  });

  // Pick initial view: prop > URL param > default 'map'
  const [activeView, setActiveViewState] = useState<ViewMode>(() => {
    if (initialView) return initialView;
    if (initialUrlParams.view) return initialUrlParams.view;
    return 'map';
  });
  const [hoveredTaxonNode, setHoveredTaxonNode] = useState<TaxonomyNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyEndemic, setOnlyEndemic] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('all');
  const [selectedConservation, setSelectedConservation] = useState<string>('all');

  // Helper to sync state to browser URL and history
  const syncHistoryState = useCallback((view: ViewMode, speciesId: string, replace = false) => {
    if (typeof window === 'undefined' || !window.history) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      if (speciesId) {
        url.searchParams.set('species', speciesId);
      } else {
        url.searchParams.delete('species');
      }

      const stateObj = { view, speciesId };
      if (replace) {
        window.history.replaceState(stateObj, '', url.toString());
      } else {
        const currentState = window.history.state;
        if (!currentState || currentState.view !== view || currentState.speciesId !== speciesId) {
          window.history.pushState(stateObj, '', url.toString());
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Mark a species as discovered
  const markSpeciesDiscovered = useCallback((id: string) => {
    setDiscoveredSpeciesIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY_DISCOVERED, JSON.stringify(next));
        }
      } catch {
        // Safe fallback
      }
      return next;
    });
  }, []);

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
    setSelectedSpeciesIdState(id);
    markSpeciesDiscovered(id);
    syncHistoryState(activeView, id, false);
    const sp = allSpeciesData.find(s => s.id === id);
    if (sp?.taxonomy) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (sp.taxonomy.order) next.add(sp.taxonomy.order);
        if (sp.taxonomy.family) next.add(sp.taxonomy.family);
        return next;
      });
    }
  }, [activeView, markSpeciesDiscovered, syncHistoryState]);

  const setActiveView = useCallback((view: ViewMode) => {
    setActiveViewState(view);
    syncHistoryState(view, selectedSpeciesId, false);
  }, [selectedSpeciesId, syncHistoryState]);

  // Listen for browser Back / Forward buttons (popstate)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      let targetView: ViewMode = 'map';
      let targetSpeciesId: string | null = null;

      if (event.state && event.state.view) {
        targetView = event.state.view;
        targetSpeciesId = event.state.speciesId || null;
      } else {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view') as ViewMode | null;
        if (v === 'map' || v === 'sunburst' || v === 'curator') {
          targetView = v;
        }
        targetSpeciesId = params.get('species');
      }

      setActiveViewState(targetView);
      if (targetSpeciesId && allSpeciesData.some(s => s.id === targetSpeciesId)) {
        setSelectedSpeciesIdState(targetSpeciesId);
        markSpeciesDiscovered(targetSpeciesId);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial replaceState to establish the root history state
    syncHistoryState(activeView, selectedSpeciesId, true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeView, selectedSpeciesId, markSpeciesDiscovered, syncHistoryState]);

  // Discovery Toast Notification state
  const [discoveryToastSpecies, setDiscoveryToastSpecies] = useState<{
    species: BirdSpecies;
    isNewDiscovery: boolean;
  } | null>(null);

  const dismissDiscoveryToast = useCallback(() => {
    setDiscoveryToastSpecies(null);
  }, []);

  const triggerDiscoveryToast = useCallback((species: BirdSpecies, isNew?: boolean) => {
    const isActuallyNew = isNew !== undefined ? isNew : !discoveredSpeciesIds.includes(species.id);
    setDiscoveryToastSpecies({
      species,
      isNewDiscovery: isActuallyNew
    });
  }, [discoveredSpeciesIds]);

  // Non-repeating random picker: pops from shuffle deck until empty, then regenerates
  const selectRandomEndemic = useCallback(() => {
    setShufflePool(currentDeck => {
      let pool = currentDeck;
      if (!pool || pool.length <= 1) {
        // Regenerate deck when exhausted
        pool = generateShuffledDeck(allSpeciesData);
      }

      // Filter out currently selected to ensure a new species is picked
      const candidates = pool.filter(id => id !== selectedSpeciesId);
      const nextId = candidates[0] || pool[0];
      const remaining = pool.filter(id => id !== nextId);

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY_SHUFFLE_POOL, JSON.stringify(remaining));
        }
      } catch {
        // Safe fallback
      }

      if (nextId) {
        setSelectedSpeciesIdState(nextId);
        syncHistoryState(activeView, nextId, false);
        const isNew = !discoveredSpeciesIds.includes(nextId);
        markSpeciesDiscovered(nextId);
        const targetSpecies = allSpeciesData.find(s => s.id === nextId);
        if (targetSpecies) {
          setDiscoveryToastSpecies({
            species: targetSpecies,
            isNewDiscovery: isNew
          });
        }
      }

      return remaining;
    });
  }, [activeView, selectedSpeciesId, markSpeciesDiscovered, discoveredSpeciesIds, syncHistoryState]);

  // Automatically mark initial species as discovered
  React.useEffect(() => {
    if (selectedSpeciesId) {
      markSpeciesDiscovered(selectedSpeciesId);
    }
  }, [selectedSpeciesId, markSpeciesDiscovered]);

  // Global Keyboard Shortcuts (R, 1, 2, 3, etc.)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        selectRandomEndemic();
      } else if (e.key === '1') {
        setActiveView('map');
      } else if (e.key === '2') {
        setActiveView('sunburst');
      } else if (e.key === '3') {
        setActiveView('curator');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectRandomEndemic]);

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
      discoveryToastSpecies,
      dismissDiscoveryToast,
      triggerDiscoveryToast,
      allSpecies: allSpeciesData,
      taxonomyTree: taxonomyTreeData,
      ebaRegions: ebaRegionsData,
      expandedNodes,
      setExpandedNodes,
      toggleExpandedNode,
      expandAllNodes,
      collapseAllNodes,
      discoveredSpeciesIds,
      markSpeciesDiscovered,
      remainingShuffleCount: shufflePool.length
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
      discoveryToastSpecies,
      dismissDiscoveryToast,
      triggerDiscoveryToast,
      expandedNodes,
      toggleExpandedNode,
      expandAllNodes,
      collapseAllNodes,
      discoveredSpeciesIds,
      markSpeciesDiscovered,
      shufflePool.length
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


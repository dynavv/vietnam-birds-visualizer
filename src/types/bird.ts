/**
 * Avifauna of Vietnam - TypeScript Interfaces & Types
 * Taxonomy, Species and Endemic Bird Areas data definitions.
 */

export type IUCNStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
export type VietnamRedListStatus = 'CR' | 'EN' | 'VU' | 'R' | 'LR';

export interface DiagnosticFeature {
  part: string;
  description: string;
}

export interface MorphologicalAnalysis {
  overview: string;
  diagnosticFeatures: DiagnosticFeature[];
}

export interface SpeciesTaxonomy {
  clade: string[];
  order: string;
  orderVietnamese: string;
  family: string;
  familyVietnamese: string;
  genus: string;
  species: string;
}

export interface ConservationStatus {
  iucn: IUCNStatus;
  vietnamRedList?: VietnamRedListStatus;
  description: string;
}

export interface DistributionInfo {
  ebaRegion: string;
  elevation: string;
  habitats: string[];
  locations: string[];
  coordinates: [number, number]; // [Latitude, Longitude]
}

export interface IllustrationInfo {
  imageUrl: string;
  artist: string;
  sourceBook?: string;
}

export interface AudioCallInfo {
  audioUrl: string;
  duration?: string;
  recordist?: string;
  location?: string;
}

export interface BirdSpecies {
  id: string;
  scientificName: string;
  vietnameseName: string;
  englishName: string;
  taxonomy: SpeciesTaxonomy;
  isEndemic: boolean;
  conservation: ConservationStatus;
  morphologicalAnalysis: MorphologicalAnalysis;
  distribution: DistributionInfo;
  illustration: IllustrationInfo;
  audioCall?: AudioCallInfo;
}

export type TaxonomyRank = 'class' | 'order' | 'family' | 'genus' | 'species';

export interface TaxonomyNode {
  name: string;
  vietnameseName?: string;
  rank: TaxonomyRank;
  color?: string;
  speciesId?: string;
  children?: TaxonomyNode[];
}

export interface EBARegion {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  coordinates: [number, number]; // [Latitude, Longitude]
  zoomLevel: number;
  keySpeciesIds: string[];
  habitats: string[];
}

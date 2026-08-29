export type IUCNStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
export type VietnamRedListStatus = 'CR' | 'EN' | 'VU' | 'R' | 'LR';
export type TaxonomyRank = 'class' | 'order' | 'family' | 'genus' | 'species';

export interface TaxonomicHierarchy {
  clade: string[];
  order: string;
  orderVietnamese: string;
  family: string;
  familyVietnamese: string;
  genus: string;
  species: string;
}

export type SpeciesTaxonomy = TaxonomicHierarchy;

export interface DiagnosticFeature {
  part: string;
  description: string;
}

export interface MorphologicalAnalysis {
  overview: string;
  diagnosticFeatures: DiagnosticFeature[];
  taxonomicRationale?: string;
}

export interface GeographicDistribution {
  ebaRegion: string;
  elevation: string;
  habitats: string[];
  locations: string[];
  coordinates: [number, number];
}

export interface IllustrationInfo {
  imageUrl: string;
  thumbnailUrl?: string;
  artist: string;
  sourceBook?: string;
  plateNumber?: string;
  year?: string;
  license?: string;
  observationUrl?: string;
}

export interface AudioCallInfo {
  audioUrl: string;
  duration?: string;
  recordist?: string;
  location?: string;
  license?: string;
  xenoCantoId?: string;
}

export interface AcademicReference {
  authors: string;
  year: number | string;
  title: string;
  journalOrBook: string;
  doiOrUrl?: string;
  volumeOrPages?: string;
}

export interface AcademicIdentifiers {
  iocTaxonCode?: string;
  avibaseId?: string;
  iucnUrl?: string;
  gbifTaxonKey?: string;
  primaryLiterature?: AcademicReference[];
}

export interface BirdSpecies {
  id: string;
  scientificName: string;
  vietnameseName: string;
  englishName: string;
  taxonomy: TaxonomicHierarchy;
  isEndemic: boolean;
  conservation: {
    iucn: IUCNStatus;
    vietnamRedList?: VietnamRedListStatus;
    description: string;
  };
  morphologicalAnalysis: MorphologicalAnalysis;
  distribution: GeographicDistribution;
  illustration: IllustrationInfo;
  audioCall?: AudioCallInfo;
  academic?: AcademicIdentifiers;
}

export type Species = BirdSpecies;

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
  code?: string;
  name: string;
  vietnameseName: string;
  description: string;
  coordinates: [number, number];
  radiusMeters?: number;
  zoomLevel: number;
  keySpeciesIds: string[];
  habitats: string[];
}

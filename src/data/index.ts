import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import rawSpecies from './species.json';
import rawTaxonomy from './taxonomy.json';
import rawEbas from './ebas.json';
import rawVietnamBoundary from './vietnamBoundary.json';

export const speciesData: BirdSpecies[] = rawSpecies as unknown as BirdSpecies[];
export const taxonomyData: TaxonomyNode = rawTaxonomy as unknown as TaxonomyNode;
export const ebasData: EBARegion[] = rawEbas as unknown as EBARegion[];
export const vietnamBoundaryData = rawVietnamBoundary;

export { rawSpecies, rawTaxonomy, rawEbas, rawVietnamBoundary };

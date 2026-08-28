import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import rawSpecies from './species.json';
import rawTaxonomy from './taxonomy.json';
import rawEbas from './ebas.json';

export const speciesData: BirdSpecies[] = rawSpecies as BirdSpecies[];
export const taxonomyData: TaxonomyNode = rawTaxonomy as TaxonomyNode;
export const ebasData: EBARegion[] = rawEbas as EBARegion[];

export { rawSpecies, rawTaxonomy, rawEbas };

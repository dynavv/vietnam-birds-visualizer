import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import rawSpecies from './species.json';
import rawTaxonomy from './taxonomy.json';
import rawEbas from './ebas.json';

export const speciesData = rawSpecies as unknown as BirdSpecies[];
export const taxonomyData = rawTaxonomy as TaxonomyNode;
export const ebasData = rawEbas as EBARegion[];

export { rawSpecies, rawTaxonomy, rawEbas };

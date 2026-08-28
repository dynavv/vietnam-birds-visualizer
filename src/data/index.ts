import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import rawSpecies from './species.json';
import rawTaxonomy from './taxonomy.json';
import rawEbas from './ebas.json';

export const speciesData: BirdSpecies[] = rawSpecies as unknown as BirdSpecies[];
export const taxonomyData: TaxonomyNode = rawTaxonomy as unknown as TaxonomyNode;
export const ebasData: EBARegion[] = rawEbas as unknown as EBARegion[];

export { rawSpecies, rawTaxonomy, rawEbas };

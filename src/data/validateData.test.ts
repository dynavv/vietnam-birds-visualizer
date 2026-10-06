import { describe, it, expect } from 'vitest';
import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types/bird';
import speciesJson from './species.json';
import taxonomyJson from './taxonomy.json';
import ebasJson from './ebas.json';

const speciesList = speciesJson as unknown as BirdSpecies[];
const taxonomyTree = taxonomyJson as TaxonomyNode;
const ebasList = ebasJson as EBARegion[];

describe('Vietnam Avifauna Data Integrity & Taxonomy Suite', () => {
  it('should contain at least 50 curated bird species', () => {
    expect(speciesList.length).toBeGreaterThanOrEqual(50);
  });

  it('should have no duplicate species IDs', () => {
    const idSet = new Set<string>();
    for (const species of speciesList) {
      expect(idSet.has(species.id)).toBe(false);
      idSet.add(species.id);
    }
    expect(idSet.size).toBe(speciesList.length);
  });

  it('should include all 13 strict endemic species of Vietnam and 5 Indochina endemics with accurate scopes', () => {
    const endemics = speciesList.filter(s => s.isEndemic);
    expect(endemics.length).toBe(18);

    const strictVn = speciesList.filter(s => s.endemicScope === 'vietnam');
    expect(strictVn.length).toBe(13);

    const indochina = speciesList.filter(s => s.endemicScope === 'indochina');
    expect(indochina.length).toBe(5);

    // Verify all 13 strict Vietnamese endemics are present
    const strictVietnamEndemicIds = [
      'trochalopteron-ngoclinhense',
      'ianthocincla-konkakinhensis',
      'liochicla-langbianis',
      'trochalopteron-yersini',
      'chloris-monguilloti',
      'lophura-edwardsi',
      'rimator-pasquieri',
      'cutia-legalleni',
      'garrulax-annamensis',
      'schoeniparus-klossi',
      'prinia-rocki',
      'locustella-idonea',
      'tropicoperdix-tonkinensis'
    ];

    // Verify 5 Indochinese endemics are present
    const indochinaEndemicIds = [
      'actinodura-sodangorum',
      'polyplectron-germaini',
      'stachyris-herberti',
      'macronus-kelleyi',
      'rheinardia-ocellata'
    ];

    const speciesIdMap = new Set(speciesList.map(s => s.id));
    for (const endemicId of [...strictVietnamEndemicIds, ...indochinaEndemicIds]) {
      expect(speciesIdMap.has(endemicId)).toBe(true);
    }

    const pasquieri = speciesList.find(s => s.id === 'rimator-pasquieri');
    expect(pasquieri?.vietnameseName).toBe('Khướu đất họng trắng');

    const formosum = speciesList.find(s => s.id === 'trochalopteron-formosum-greenwayi');
    expect(formosum?.vietnameseName).toBe('Khướu cánh đỏ');

    const cutia = speciesList.find(s => s.id === 'cutia-legalleni');
    expect(cutia?.vietnameseName).toBe('Khướu hông đỏ');
  });

  it('should validate all required fields for every species', () => {
    for (const species of speciesList) {
      // Basic info
      expect(species.id).toBeTruthy();
      expect(typeof species.id).toBe('string');
      expect(species.scientificName).toBeTruthy();
      expect(species.vietnameseName).toBeTruthy();
      expect(species.englishName).toBeTruthy();
      expect(typeof species.isEndemic).toBe('boolean');

      // Taxonomy
      expect(species.taxonomy).toBeDefined();
      expect(species.taxonomy.order).toBeTruthy();
      expect(species.taxonomy.orderVietnamese).toBeTruthy();
      expect(species.taxonomy.family).toBeTruthy();
      expect(species.taxonomy.familyVietnamese).toBeTruthy();
      expect(species.taxonomy.genus).toBeTruthy();
      expect(species.taxonomy.species).toBeTruthy();
      expect(Array.isArray(species.taxonomy.clade)).toBe(true);
      expect(species.taxonomy.clade.length).toBeGreaterThan(0);

      // Conservation
      expect(species.conservation).toBeDefined();
      expect(['CR', 'EN', 'VU', 'NT', 'LC']).toContain(species.conservation.iucn);
      expect(species.conservation.description).toBeTruthy();

      // Legal Conservation Framework (Decree 84, Decree 160, Directive 04)
      expect(species.conservation.legalFramework).toBeDefined();
      const legal = species.conservation.legalFramework!;
      expect(['IB', 'IIB', 'none']).toContain(legal.decree84Group);
      expect(typeof legal.decree160Priority).toBe('boolean');
      expect(typeof legal.directive04Flagship).toBe('boolean');

      // Morphological Analysis
      expect(species.morphologicalAnalysis).toBeDefined();
      expect(species.morphologicalAnalysis.overview).toBeTruthy();
      expect(Array.isArray(species.morphologicalAnalysis.diagnosticFeatures)).toBe(true);
      expect(species.morphologicalAnalysis.diagnosticFeatures.length).toBeGreaterThanOrEqual(2);
      for (const feature of species.morphologicalAnalysis.diagnosticFeatures) {
        expect(feature.part).toBeTruthy();
        expect(feature.description).toBeTruthy();
      }

      // Distribution
      expect(species.distribution).toBeDefined();
      expect(species.distribution.ebaRegion).toBeTruthy();
      expect(species.distribution.elevation).toBeTruthy();
      expect(Array.isArray(species.distribution.habitats)).toBe(true);
      expect(species.distribution.habitats.length).toBeGreaterThan(0);
      expect(Array.isArray(species.distribution.locations)).toBe(true);
      expect(species.distribution.locations.length).toBeGreaterThan(0);
      expect(Array.isArray(species.distribution.coordinates)).toBe(true);
      expect(species.distribution.coordinates.length).toBe(2);

      const [lat, lng] = species.distribution.coordinates;
      expect(lat).toBeGreaterThanOrEqual(8.0);
      expect(lat).toBeLessThanOrEqual(24.0);
      expect(lng).toBeGreaterThanOrEqual(102.0);
      expect(lng).toBeLessThanOrEqual(110.0);

      // Illustration
      expect(species.illustration).toBeDefined();
      expect(species.illustration.imageUrl).toBeTruthy();
      expect(species.illustration.artist).toBeTruthy();

      // Optional audioCall if present
      if (species.audioCall) {
        expect(species.audioCall.audioUrl).toBeTruthy();
      }
    }
  });

  it('should validate the taxonomy hierarchy and verify 100% leaf match with species.json', () => {
    expect(taxonomyTree.name).toBe('Aves');
    expect(taxonomyTree.rank).toBe('class');
    expect(Array.isArray(taxonomyTree.children)).toBe(true);
    expect(taxonomyTree.children!.length).toBeGreaterThan(0);

    const leafSpeciesIds: string[] = [];

    function traverse(node: TaxonomyNode) {
      expect(node.name).toBeTruthy();
      expect(node.rank).toBeTruthy();

      if (node.rank === 'species') {
        expect(node.speciesId).toBeTruthy();
        leafSpeciesIds.push(node.speciesId!);
      } else {
        expect(Array.isArray(node.children)).toBe(true);
        expect(node.children!.length).toBeGreaterThan(0);
        for (const child of node.children!) {
          traverse(child);
        }
      }
    }

    traverse(taxonomyTree);

    // 100% match between taxonomy leaves and species list
    const speciesIdList = speciesList.map(s => s.id).sort();
    const sortedLeafIds = [...leafSpeciesIds].sort();

    expect(sortedLeafIds).toEqual(speciesIdList);
    expect(leafSpeciesIds.length).toBe(speciesList.length);
  });

  it('should validate all 7 EBA regions and verify all keySpeciesIds exist in species.json', () => {
    expect(ebasList.length).toBe(7);
    const validSpeciesIds = new Set(speciesList.map(s => s.id));

    const expectedEbaIds = [
      'dalat-plateau',
      'kontum-plateau',
      'annam-lowlands',
      'hoang-lien-son',
      'cochinchina',
      'northeast-mountains',
      'lower-mekong-basin'
    ];

    const actualEbaIds = ebasList.map(e => e.id);
    expect(actualEbaIds.sort()).toEqual(expectedEbaIds.sort());

    for (const eba of ebasList) {
      expect(eba.id).toBeTruthy();
      expect(eba.name).toBeTruthy();
      expect(eba.vietnameseName).toBeTruthy();
      expect(eba.description).toBeTruthy();
      expect(Array.isArray(eba.coordinates)).toBe(true);
      expect(eba.coordinates.length).toBe(2);

      const [lat, lng] = eba.coordinates;
      expect(lat).toBeGreaterThanOrEqual(8.0);
      expect(lat).toBeLessThanOrEqual(24.0);
      expect(lng).toBeGreaterThanOrEqual(102.0);
      expect(lng).toBeLessThanOrEqual(110.0);

      expect(eba.zoomLevel).toBeGreaterThanOrEqual(8);
      expect(Array.isArray(eba.keySpeciesIds)).toBe(true);
      expect(eba.keySpeciesIds.length).toBeGreaterThan(0);

      // Verify each keySpeciesId exists in species.json
      for (const spId of eba.keySpeciesIds) {
        expect(validSpeciesIds.has(spId)).toBe(true);
      }

      expect(Array.isArray(eba.habitats)).toBe(true);
      expect(eba.habitats.length).toBeGreaterThan(0);
    }
  });

  it('should validate national legal conservation framework (Decree 84, Decree 160, Directive 04)', () => {
    const nd84IB = speciesList.filter(s => s.conservation.legalFramework?.decree84Group === 'IB');
    const nd84IIB = speciesList.filter(s => s.conservation.legalFramework?.decree84Group === 'IIB');
    const nd160 = speciesList.filter(s => s.conservation.legalFramework?.decree160Priority);
    const ct04 = speciesList.filter(s => s.conservation.legalFramework?.directive04Flagship);

    expect(nd84IB.length).toBe(22);
    expect(nd84IIB.length).toBe(25);
    expect(nd160.length).toBe(16);
    expect(ct04.length).toBe(3);

    // Verify key flagship species under Directive 04
    const ct04SpeciesIds = ct04.map(s => s.id);
    expect(ct04SpeciesIds).toContain('antigone-antigone'); // Sếu đầu đỏ
    expect(ct04SpeciesIds).toContain('platalea-minor');    // Cò thìa mặt đen
    expect(ct04SpeciesIds).toContain('calidris-pygmaea');  // Rẽ mỏ thìa
  });
});


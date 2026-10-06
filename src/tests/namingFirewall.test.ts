import { describe, it, expect } from 'vitest';
import speciesData from '../data/species.json';
import taxonomyData from '../data/taxonomy.json';
import masterRegistry from '../../scripts/data-pipeline/authority/vietnam-bird-names-master.json';
import type { BirdSpecies, TaxonomyNode } from '../types/bird';

const speciesList = speciesData as unknown as BirdSpecies[];
const masterList = masterRegistry as Array<{
  id: string;
  scientificName: string;
  vietnameseName: string;
  englishName: string;
}>;

describe('3-Tier Canonical Naming Firewall & Data Integrity', () => {
  it('should have master registry containing exactly all species in the database', () => {
    expect(masterList.length).toBe(speciesList.length);
    const masterIds = new Set(masterList.map(m => m.id));
    speciesList.forEach(sp => {
      expect(masterIds.has(sp.id), `Loài ${sp.id} (${sp.scientificName}) không tồn tại trong Master Registry!`).toBe(true);
    });
  });

  it('Tier 1: Every species in species.json must strictly match the canonical Vietnamese name in master registry', () => {
    const masterMap = new Map(masterList.map(m => [m.id, m.vietnameseName]));
    speciesList.forEach(sp => {
      const canonicalName = masterMap.get(sp.id);
      expect(canonicalName).toBeDefined();
      expect(sp.vietnameseName).toBe(canonicalName);
    });
  });

  it('Tier 2: Leaf nodes in taxonomy.json must have 100% 1:1 match with species.json vietnameseName', () => {
    const leafNodes: Array<{ id: string; name: string; vietnameseName: string }> = [];

    function collectLeaves(node: TaxonomyNode) {
      if (node.rank === 'species' && node.speciesId) {
        leafNodes.push({
          id: node.speciesId,
          name: node.name,
          vietnameseName: node.vietnameseName || ''
        });
      }
      if (node.children) {
        node.children.forEach(collectLeaves);
      }
    }

    collectLeaves(taxonomyData as unknown as TaxonomyNode);

    expect(leafNodes.length).toBe(speciesList.length);

    const speciesMap = new Map(speciesList.map(sp => [sp.id, sp.vietnameseName]));
    leafNodes.forEach(leaf => {
      const expectedName = speciesMap.get(leaf.id);
      expect(expectedName, `Không tìm thấy loài ${leaf.id} trong species.json!`).toBeDefined();
      expect(
        leaf.vietnameseName,
        `Tên tiếng Việt trong taxonomy.json (${leaf.vietnameseName}) lệch so với species.json (${expectedName}) cho loài ${leaf.id}!`
      ).toBe(expectedName);
    });
  });

  it('Tier 3: Blacklist gatekeeper - Reject deprecated or erroneous legacy names', () => {
    const forbiddenNames = [
      'Già đới cổ hung',
      'Gõ kiến tam giác',
      'Đớp ruồi cằm đen',
      'Sả mỏ rộng',
      'Gõ kiến xanh hông đỏ',
      'Khướu ngực cam',
      'Khướu mỏ quặp gáy đen',
      'Chiền chiện núi Nam Bộ'
    ];

    speciesList.forEach(sp => {
      expect(
        forbiddenNames.includes(sp.vietnameseName),
        `Loài ${sp.id} đang mang tên bị cấm: ${sp.vietnameseName}!`
      ).toBe(false);
    });
  });

  it('should ensure aliases are arrays of valid strings without empty items', () => {
    speciesList.forEach(sp => {
      if (sp.aliases) {
        expect(Array.isArray(sp.aliases)).toBe(true);
        sp.aliases.forEach(alias => {
          expect(typeof alias).toBe('string');
          expect(alias.trim().length).toBeGreaterThan(0);
        });
      }
    });
  });
});

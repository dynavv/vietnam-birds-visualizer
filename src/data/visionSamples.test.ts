import { describe, it, expect } from 'vitest';
import {
  VISION_DEMO_SAMPLES,
  getVisionSampleById,
  getVisionSampleBySpeciesId
} from './visionSamples';
import speciesJson from './species.json';
import type { BirdSpecies } from '../types/bird';

const speciesList = speciesJson as unknown as BirdSpecies[];

describe('Vision Demo Samples Suite', () => {
  it('provides at least 3 curated demo bird samples', () => {
    expect(VISION_DEMO_SAMPLES.length).toBeGreaterThanOrEqual(3);
  });

  it('validates all required properties for every sample', () => {
    for (const sample of VISION_DEMO_SAMPLES) {
      expect(sample.id).toBeTruthy();
      expect(typeof sample.id).toBe('string');
      expect(sample.title).toBeTruthy();
      expect(typeof sample.title).toBe('string');
      expect(sample.speciesId).toBeTruthy();
      expect(typeof sample.speciesId).toBe('string');
      expect(sample.description).toBeTruthy();
      expect(typeof sample.description).toBe('string');
      expect(sample.imageUrl).toBeTruthy();
      expect(typeof sample.imageUrl).toBe('string');
      expect(sample.imageUrl.startsWith('http://') || sample.imageUrl.startsWith('https://')).toBe(true);
    }
  });

  it('verifies all sample speciesId correspond to valid species in species.json', () => {
    const validSpeciesIds = new Set(speciesList.map(s => s.id));
    for (const sample of VISION_DEMO_SAMPLES) {
      expect(validSpeciesIds.has(sample.speciesId)).toBe(true);
    }
  });

  it('contains iconic Vietnamese bird samples: Edwards\'s Pheasant, Orange-breasted Trogon, and Langbiang Laughingthrush', () => {
    const ids = VISION_DEMO_SAMPLES.map(s => s.speciesId);
    expect(ids).toContain('lophura-edwardsi');
    expect(ids).toContain('harpactes-oreskios');
    expect(ids).toContain('liochicla-langbianis');
  });

  it('provides getVisionSampleById helper correctly', () => {
    const sample = getVisionSampleById('sample-edwardsi');
    expect(sample).toBeDefined();
    expect(sample?.title).toBe('Gà lôi lam mào trắng');
    expect(sample?.speciesId).toBe('lophura-edwardsi');

    const nonExistent = getVisionSampleById('non-existent-id');
    expect(nonExistent).toBeUndefined();
  });

  it('provides getVisionSampleBySpeciesId helper correctly', () => {
    const sample = getVisionSampleBySpeciesId('harpactes-oreskios');
    expect(sample).toBeDefined();
    expect(sample?.title).toBe('Nuốc bụng vàng');
    expect(sample?.id).toBe('sample-oreskios');

    const nonExistent = getVisionSampleBySpeciesId('non-existent-species');
    expect(nonExistent).toBeUndefined();
  });
});

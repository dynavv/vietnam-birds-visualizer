import { describe, it, expect } from 'vitest';
import { matchSpeciesWithMuseum, BirdVisionResult } from './speciesMatcher';
import speciesData from '../data/species.json';
import { BirdSpecies, Species } from '../types/bird';

describe('speciesMatcher Utility', () => {
  const speciesList = speciesData as unknown as (BirdSpecies | Species)[];

  it('matches exact scientific name correctly', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 95,
      species_vietnamese: 'Gà lôi lam mào trắng',
      species_scientific: 'Lophura edwardsi',
      family_scientific: 'Phasianidae',
      order_scientific: 'Galliformes',
      conservation_status: 'CR',
      diagnostic_features: ['Mào lông trắng muốt'],
      brief_description: 'Loài chim trĩ đặc hữu quý hiếm'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(true);
    expect(match.matchedSpecies?.id).toBe('lophura-edwardsi');
    expect(match.matchedSpecies?.scientificName).toBe('Lophura edwardsi');
    // Ensure related species are from same genus or family and do not include the matched species itself
    expect(match.relatedMuseumSpecies.length).toBeGreaterThan(0);
    expect(match.relatedMuseumSpecies.length).toBeLessThanOrEqual(3);
    expect(match.relatedMuseumSpecies.some(s => s.id === 'lophura-edwardsi')).toBe(false);
  });

  it('matches scientific name case-insensitively and with surrounding whitespace', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 92,
      species_vietnamese: 'Gà Lôi Lam Mào Trắng',
      species_scientific: '  lOpHuRa EdWaRdSi  ',
      family_scientific: 'Phasianidae',
      order_scientific: 'Galliformes',
      conservation_status: 'CR',
      diagnostic_features: ['Mào trắng'],
      brief_description: 'Mẫu kiểm tra viết hoa thường'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(true);
    expect(match.matchedSpecies?.id).toBe('lophura-edwardsi');
  });

  it('matches partial / subspecies scientific name', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 88,
      species_vietnamese: 'Khướu cánh đỏ',
      species_scientific: 'Trochalopteron formosum',
      family_scientific: 'Leiothrichidae',
      order_scientific: 'Passeriformes',
      conservation_status: 'LC',
      diagnostic_features: ['Cánh đỏ rực'],
      brief_description: 'Khướu cánh đỏ phân bố vùng núi cao'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(true);
    expect(match.matchedSpecies?.id).toBe('trochalopteron-formosum-greenwayi');
  });

  it('matches normalized Vietnamese name if scientific name has slight variance or mismatch', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 90,
      species_vietnamese: 'Nuốc bụng vàng',
      species_scientific: 'Harpactes oreskios stellae',
      family_scientific: 'Trogonidae',
      order_scientific: 'Trogoniformes',
      conservation_status: 'LC',
      diagnostic_features: ['Bụng vàng óng'],
      brief_description: 'Nuốc sống ở rừng thường xanh'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(true);
    expect(match.matchedSpecies?.id).toBe('harpactes-oreskios');
  });

  it('matches Vietnamese name when scientific name is completely generic or empty', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 87,
      species_vietnamese: 'Mi Langbiang',
      species_scientific: '',
      family_scientific: 'Leiothrichidae',
      order_scientific: 'Passeriformes',
      conservation_status: 'EN',
      diagnostic_features: ['Lưng vằn sọc nâu đen'],
      brief_description: 'Loài mi đặc hữu cao nguyên Lâm Viên'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(true);
    expect(match.matchedSpecies?.id).toBe('liochicla-langbianis');
  });

  it('handles non-museum species gracefully and finds related species in same genus/family if available', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 85,
      species_vietnamese: 'Chim Trĩ Đỏ Châu Âu',
      species_scientific: 'Phasianus colchicus',
      family_scientific: 'Phasianidae',
      order_scientific: 'Galliformes',
      conservation_status: 'LC',
      diagnostic_features: ['Lông nhiều màu sắc'],
      brief_description: 'Loài chim trĩ phổ biến ở Âu-Á'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(false);
    expect(match.matchedSpecies).toBeNull();
    // Phasianidae exists in our museum, so related museum species should be found
    expect(match.relatedMuseumSpecies.length).toBeGreaterThan(0);
    expect(match.relatedMuseumSpecies.length).toBeLessThanOrEqual(3);
    expect(match.relatedMuseumSpecies.every(s => s.taxonomy.family === 'Phasianidae')).toBe(true);
  });

  it('handles foreign bird species with no related family in museum dataset', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 85,
      species_vietnamese: 'Chim Cánh Cụt Hoàng Đế',
      species_scientific: 'Aptenodytes forsteri',
      family_scientific: 'Spheniscidae',
      order_scientific: 'Sphenisciformes',
      conservation_status: 'NT',
      diagnostic_features: ['Lông đen trắng sống ở Nam Cực'],
      brief_description: 'Loài chim cánh cụt lớn nhất thế giới'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(false);
    expect(match.matchedSpecies).toBeNull();
    expect(match.relatedMuseumSpecies).toEqual([]);
  });

  it('returns false match and empty results when is_bird is false', () => {
    const aiResult: BirdVisionResult = {
      is_bird: false,
      confidence_score: 10,
      species_vietnamese: '',
      species_scientific: '',
      family_scientific: '',
      order_scientific: '',
      conservation_status: 'LC',
      diagnostic_features: [],
      brief_description: 'Hình ảnh không phải loài chim'
    };

    const match = matchSpeciesWithMuseum(aiResult, speciesList);
    expect(match.isMuseumSpecies).toBe(false);
    expect(match.matchedSpecies).toBeNull();
    expect(match.relatedMuseumSpecies).toEqual([]);
  });

  it('handles null or undefined input gracefully', () => {
    const match = matchSpeciesWithMuseum(null as any, speciesList);
    expect(match.isMuseumSpecies).toBe(false);
    expect(match.matchedSpecies).toBeNull();
    expect(match.relatedMuseumSpecies).toEqual([]);
  });
});

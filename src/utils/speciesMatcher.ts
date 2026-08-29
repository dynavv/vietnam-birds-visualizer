import { BirdSpecies, Species } from '../types/bird';

export interface BirdVisionResult {
  is_bird: boolean;
  confidence_score: number;
  species_vietnamese: string;
  species_scientific: string;
  family_scientific: string;
  order_scientific: string;
  conservation_status: string;
  diagnostic_features: string[];
  brief_description: string;
}

export interface SpeciesMatchResult {
  isMuseumSpecies: boolean;
  matchedSpecies: BirdSpecies | null;
  relatedMuseumSpecies: BirdSpecies[];
}

export function matchSpeciesWithMuseum(
  aiResult: BirdVisionResult,
  allSpecies: (BirdSpecies | Species)[]
): SpeciesMatchResult {
  if (!aiResult || !aiResult.is_bird) {
    return {
      isMuseumSpecies: false,
      matchedSpecies: null,
      relatedMuseumSpecies: []
    };
  }

  const cleanSci = (aiResult.species_scientific || '').trim().toLowerCase();
  const cleanVn = (aiResult.species_vietnamese || '').trim().toLowerCase();

  let matched: BirdSpecies | null = null;

  // 1. Exact or partial scientific name match
  if (cleanSci) {
    // Exact match first
    matched = allSpecies.find(s => {
      const sSci = (s.scientificName || '').trim().toLowerCase();
      return sSci === cleanSci;
    }) || null;

    // Partial match if no exact match
    if (!matched) {
      matched = allSpecies.find(s => {
        const sSci = (s.scientificName || '').trim().toLowerCase();
        return sSci.length > 0 && (cleanSci.includes(sSci) || sSci.includes(cleanSci));
      }) || null;
    }
  }

  // 2. Exact or partial Vietnamese name match
  if (!matched && cleanVn) {
    matched = allSpecies.find(s => {
      const sVn = (s.vietnameseName || '').trim().toLowerCase();
      return sVn === cleanVn;
    }) || null;

    if (!matched) {
      matched = allSpecies.find(s => {
        const sVn = (s.vietnameseName || '').trim().toLowerCase();
        return sVn.length > 0 && (cleanVn.includes(sVn) || sVn.includes(cleanVn));
      }) || null;
    }
  }

  // 3. Find related species in the museum sharing the same genus or family
  const genus = cleanSci ? cleanSci.split(' ')[0] : '';
  const family = (aiResult.family_scientific || '').trim().toLowerCase();

  const relatedMuseumSpecies = allSpecies
    .filter(s => {
      if (matched && s.id === matched.id) {
        return false;
      }
      const sSci = (s.scientificName || '').trim().toLowerCase();
      const sGenus = (s.taxonomy?.genus || sSci.split(' ')[0] || '').toLowerCase();
      const sFamily = (s.taxonomy?.family || '').toLowerCase();

      const matchesGenus = Boolean(genus && sGenus && sGenus === genus);
      const matchesFamily = Boolean(family && sFamily && (sFamily === family || sFamily.includes(family) || family.includes(sFamily)));

      return matchesGenus || matchesFamily;
    })
    .slice(0, 3);

  return {
    isMuseumSpecies: Boolean(matched),
    matchedSpecies: matched,
    relatedMuseumSpecies
  };
}

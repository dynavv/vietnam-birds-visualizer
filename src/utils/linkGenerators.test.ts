import { describe, it, expect } from 'vitest';
import {
  getIucnUrl,
  getAvibaseUrl,
  getGbifUrl,
  getInaturalistUrl,
  getXenoCantoUrl,
  resolveAcademicRefLink
} from './linkGenerators';
import type { BirdSpecies, AcademicReference, AudioCallInfo } from '../types/bird';

describe('linkGenerators Utility', () => {
  const baseSpecies: BirdSpecies = {
    id: 'trochalopteron-ngoclinhense',
    scientificName: 'Trochalopteron ngoclinhense',
    vietnameseName: 'Khướu Ngọc Linh',
    englishName: 'Golden-winged Laughingthrush',
    taxonomy: {
      clade: ['Passeriformes', 'Passeri'],
      order: 'Passeriformes',
      orderVietnamese: 'Bộ Sẻ',
      family: 'Leiothrichidae',
      familyVietnamese: 'Họ Khướu',
      genus: 'Trochalopteron',
      species: 'ngoclinhense'
    },
    isEndemic: true,
    conservation: {
      iucn: 'EN',
      vietnamRedList: 'EN',
      description: 'Nguy cấp'
    },
    morphologicalAnalysis: {
      overview: 'Lông cánh vàng óng',
      diagnosticFeatures: []
    },
    distribution: {
      ebaRegion: 'Cao nguyên Kon Tum',
      elevation: '2000-2200m',
      habitats: ['Rừng mù sương'],
      locations: ['Núi Ngọc Linh'],
      coordinates: [15.08, 107.98]
    },
    illustration: {
      imageUrl: 'https://example.com/bird.jpg',
      artist: 'H. Grönvold'
    }
  };

  describe('getIucnUrl', () => {
    it('returns custom IUCN URL when valid', () => {
      const species: BirdSpecies = {
        ...baseSpecies,
        academic: {
          iucnUrl: 'https://www.iucnredlist.org/species/22715735/94466580'
        }
      };
      expect(getIucnUrl(species)).toBe('https://www.iucnredlist.org/species/22715735/94466580');
    });

    it('falls back to search query when custom URL is missing', () => {
      const species: BirdSpecies = { ...baseSpecies, academic: undefined };
      const url = getIucnUrl(species);
      expect(url).toContain('https://www.iucnredlist.org/search?query=');
      expect(url).toContain('Trochalopteron%20ngoclinhense');
    });
  });

  describe('getAvibaseUrl', () => {
    it('returns direct page for valid 16-hex Avibase ID', () => {
      const species: BirdSpecies = {
        ...baseSpecies,
        academic: {
          avibaseId: '8C7C7DF4704BE0BA'
        }
      };
      expect(getAvibaseUrl(species)).toBe('https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=8C7C7DF4704BE0BA');
    });

    it('falls back to scientific name search when avibaseId is dummy slug', () => {
      const species: BirdSpecies = {
        ...baseSpecies,
        academic: {
          avibaseId: 'AVIBASE-TROCHALOPTERON-NGOCLINHENSE'
        }
      };
      const url = getAvibaseUrl(species);
      expect(url).toBe('https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=Trochalopteron%20ngoclinhense');
      expect(url).not.toContain('avibaseid=');
    });

    it('falls back to scientific name search when avibaseId is missing', () => {
      const species: BirdSpecies = { ...baseSpecies, academic: undefined };
      const url = getAvibaseUrl(species);
      expect(url).toBe('https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=Trochalopteron%20ngoclinhense');
    });
  });

  describe('getGbifUrl', () => {
    it('returns direct species URL when gbifTaxonKey is numeric string', () => {
      const species: BirdSpecies = {
        ...baseSpecies,
        academic: {
          gbifTaxonKey: '5231737'
        }
      };
      expect(getGbifUrl(species)).toBe('https://www.gbif.org/species/5231737');
    });

    it('returns URL directly if gbifTaxonKey is already a full URL', () => {
      const species: BirdSpecies = {
        ...baseSpecies,
        academic: {
          gbifTaxonKey: 'https://www.gbif.org/species/search?q=Trochalopteron'
        }
      };
      expect(getGbifUrl(species)).toBe('https://www.gbif.org/species/search?q=Trochalopteron');
    });

    it('falls back to search query when gbifTaxonKey is missing', () => {
      const species: BirdSpecies = { ...baseSpecies, academic: undefined };
      expect(getGbifUrl(species)).toBe('https://www.gbif.org/species/search?q=Trochalopteron%20ngoclinhense');
    });
  });

  describe('getInaturalistUrl', () => {
    it('returns observationUrl if present', () => {
      const species: BirdSpecies = {
        ...baseSpecies,
        illustration: {
          imageUrl: 'https://example.com/photo.jpg',
          artist: 'John Doe',
          observationUrl: 'https://www.inaturalist.org/taxa/12345'
        }
      };
      expect(getInaturalistUrl(species)).toBe('https://www.inaturalist.org/taxa/12345');
    });

    it('falls back to taxa search when observationUrl is missing', () => {
      const species: BirdSpecies = { ...baseSpecies };
      expect(getInaturalistUrl(species)).toBe('https://www.inaturalist.org/taxa/search?q=Trochalopteron%20ngoclinhense');
    });
  });

  describe('getXenoCantoUrl', () => {
    it('resolves direct Xeno-canto page from xenoCantoId', () => {
      const audio: AudioCallInfo = {
        audioUrl: 'https://xeno-canto.org/sounds/uploaded/sample.mp3',
        xenoCantoId: 'XC567890'
      };
      expect(getXenoCantoUrl(audio)).toBe('https://xeno-canto.org/567890');
    });

    it('extracts XC ID from audioUrl regex when xenoCantoId is missing', () => {
      const audio: AudioCallInfo = {
        audioUrl: 'https://xeno-canto.org/sounds/uploaded/VOLRFTLILA/XC567890-Golden-winged_Laughingthrush.mp3'
      };
      expect(getXenoCantoUrl(audio)).toBe('https://xeno-canto.org/567890');
    });

    it('falls back to explore search by scientificName', () => {
      expect(getXenoCantoUrl(null, 'Trochalopteron ngoclinhense')).toBe('https://xeno-canto.org/explore?query=Trochalopteron%20ngoclinhense');
    });

    it('returns homepage if no info provided', () => {
      expect(getXenoCantoUrl()).toBe('https://xeno-canto.org/');
    });
  });

  describe('resolveAcademicRefLink', () => {
    it('normalizes raw DOI string to canonical https://doi.org/', () => {
      const ref: AcademicReference = {
        authors: 'Eames, J. C.',
        year: 1999,
        title: 'A new species of Laughingthrush from Vietnam',
        journalOrBook: 'Bull. B.O.C.',
        doiOrUrl: '10.1017/S095927090000122X'
      };
      const result = resolveAcademicRefLink(ref);
      expect(result.url).toBe('https://doi.org/10.1017/S095927090000122X');
      expect(result.label).toBe('DOI Gốc');
      expect(result.isDirect).toBe(true);
    });

    it('normalizes doi: prefix to canonical https://doi.org/', () => {
      const ref: AcademicReference = {
        authors: 'Eames, J. C.',
        year: 1999,
        title: 'A new species of Laughingthrush',
        journalOrBook: 'Ibis',
        doiOrUrl: 'doi:10.1111/ibi.12345'
      };
      const result = resolveAcademicRefLink(ref);
      expect(result.url).toBe('https://doi.org/10.1111/ibi.12345');
      expect(result.label).toBe('DOI Gốc');
      expect(result.isDirect).toBe(true);
    });

    it('identifies BHL direct link', () => {
      const ref: AcademicReference = {
        authors: 'Delacour, J.',
        year: 1931,
        title: 'Les Oiseaux de l Indochine',
        journalOrBook: 'BHL',
        doiOrUrl: 'https://www.biodiversitylibrary.org/item/12345'
      };
      const result = resolveAcademicRefLink(ref);
      expect(result.url).toBe('https://www.biodiversitylibrary.org/item/12345');
      expect(result.label).toBe('Thư viện BHL');
      expect(result.isDirect).toBe(true);
    });

    it('falls back to BHL search for historical Indochina works without link', () => {
      const ref: AcademicReference = {
        authors: 'Delacour, J. & Jabouille, P.',
        year: 1931,
        title: 'Les Oiseaux de l Indochine Francaise',
        journalOrBook: 'Exposition Coloniale Internationale'
      };
      const result = resolveAcademicRefLink(ref);
      expect(result.url).toContain('https://www.biodiversitylibrary.org/search?searchTerm=');
      expect(result.label).toBe('Tra cứu BHL ↗');
      expect(result.isDirect).toBe(false);
    });

    it('falls back to Google Scholar bibliographic search for modern works without link', () => {
      const ref: AcademicReference = {
        authors: 'Craik, R. C. & Le Manh Hung',
        year: 2018,
        title: 'Birds of Vietnam',
        journalOrBook: 'Helm Wildlife Guides'
      };
      const result = resolveAcademicRefLink(ref);
      expect(result.url).toContain('https://scholar.google.com/scholar?q=');
      expect(result.url).toContain('Craik');
      expect(result.label).toBe('Tra cứu Scholar ↗');
      expect(result.isDirect).toBe(false);
    });
  });
});

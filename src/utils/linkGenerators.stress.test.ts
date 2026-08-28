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

describe('Adversarial Stress Test: linkGenerators', () => {
  const dummySpecies: BirdSpecies = {
    id: 'test-species',
    scientificName: 'Polyplectron germaini',
    vietnameseName: 'Gà tiền mặt đỏ',
    englishName: "Germain's Peacock-Pheasant",
    taxonomy: {
      clade: ['Galloanserae'],
      order: 'Galliformes',
      orderVietnamese: 'Bộ Gà',
      family: 'Phasianidae',
      familyVietnamese: 'Họ Trĩ',
      genus: 'Polyplectron',
      species: 'germaini'
    },
    isEndemic: false,
    conservation: {
      iucn: 'NT',
      vietnamRedList: 'VU',
      description: 'Sắp bị đe dọa'
    },
    morphologicalAnalysis: {
      overview: 'Mắt đỏ',
      diagnosticFeatures: []
    },
    distribution: {
      ebaRegion: 'Nam Trung Bộ',
      elevation: '0-1200m',
      habitats: ['Rừng thường xanh'],
      locations: ['Cát Tiên'],
      coordinates: [11.42, 107.43]
    },
    illustration: {
      imageUrl: 'https://example.com/test.jpg',
      artist: 'Test'
    }
  };

  describe('1. Stress-test getIucnUrl', () => {
    it('handles extreme whitespace and leading/trailing blanks in scientificName', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        scientificName: '   Lophura   edwardsi   ',
        academic: undefined
      };
      const url = getIucnUrl(sp);
      expect(url).toBe('https://www.iucnredlist.org/search?query=Lophura%20%20%20edwardsi&searchType=species');
    });

    it('handles empty string scientificName without crashing', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        scientificName: '',
        academic: undefined
      };
      const url = getIucnUrl(sp);
      expect(url).toBe('https://www.iucnredlist.org/search?query=&searchType=species');
    });

    it('handles Unicode, Vietnamese diacritics and special characters in scientificName', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Khướu Ngọc Linh (Trochalopteron ngoclinhense & sp. nov.?)',
        academic: undefined
      };
      const url = getIucnUrl(sp);
      expect(url).toBe('https://www.iucnredlist.org/search?query=Kh%C6%B0%E1%BB%9Bu%20Ng%E1%BB%8Dc%20Linh%20(Trochalopteron%20ngoclinhense%20%26%20sp.%20nov.%3F)&searchType=species');
      expect(() => new URL(url)).not.toThrow();
    });

    it('handles malformed or non-IUCN domain custom URLs by falling back to search query', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Arborophila davidi',
        academic: {
          iucnUrl: 'https://malicious-site.com/exploit?species=123'
        }
      };
      const url = getIucnUrl(sp);
      expect(url).toBe('https://www.iucnredlist.org/search?query=Arborophila%20davidi&searchType=species');
    });

    it('accepts legitimate http and https IUCN URLs', () => {
      const sp1: BirdSpecies = {
        ...dummySpecies,
        academic: { iucnUrl: 'https://www.iucnredlist.org/species/22678901/12345678' }
      };
      expect(getIucnUrl(sp1)).toBe('https://www.iucnredlist.org/species/22678901/12345678');

      const sp2: BirdSpecies = {
        ...dummySpecies,
        academic: { iucnUrl: 'http://www.iucnredlist.org/species/22678901/12345678' }
      };
      expect(getIucnUrl(sp2)).toBe('http://www.iucnredlist.org/species/22678901/12345678');
    });
  });

  describe('2. Stress-test getAvibaseUrl', () => {
    it('handles exact 16-hex valid ID regardless of case and whitespace padding', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        academic: { avibaseId: '  8c7c7df4704be0ba  ' }
      };
      expect(getAvibaseUrl(sp)).toBe('https://avibase.bsc-eoc.org/species.jsp?avibaseid=8c7c7df4704be0ba&lang=EN');
    });

    it('rejects invalid hex lengths (15 chars, 17 chars) and falls back to search', () => {
      const sp15: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Actinodura sodangorum',
        academic: { avibaseId: '8C7C7DF4704BE0B' } // 15 chars
      };
      expect(getAvibaseUrl(sp15)).toBe('https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=Actinodura%20sodangorum');

      const sp17: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Actinodura sodangorum',
        academic: { avibaseId: '8C7C7DF4704BE0BAA' } // 17 chars
      };
      expect(getAvibaseUrl(sp17)).toBe('https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=Actinodura%20sodangorum');
    });

    it('rejects non-hex characters inside 16-char string and falls back to search', () => {
      const spNonHex: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Actinodura sodangorum',
        academic: { avibaseId: '8C7C7DF4704BE0BZ' } // Z is not hex
      };
      expect(getAvibaseUrl(spNonHex)).toBe('https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=Actinodura%20sodangorum');
    });

    it('handles complex scientific names with quotes, subgenera and apostrophes', () => {
      const spComplex: BirdSpecies = {
        ...dummySpecies,
        scientificName: `Garrulax (Trochalopteron) "yersini" d'Indochine`,
        academic: undefined
      };
      const url = getAvibaseUrl(spComplex);
      expect(url).toContain('https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=');
      expect(() => new URL(url)).not.toThrow();
    });
  });

  describe('3. Stress-test getGbifUrl', () => {
    it('accepts integer taxon key string with whitespace padding', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        academic: { gbifTaxonKey: '  2493092  ' }
      };
      expect(getGbifUrl(sp)).toBe('https://www.gbif.org/species/2493092');
    });

    it('accepts full GBIF URL directly if provided', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        academic: { gbifTaxonKey: 'https://www.gbif.org/species/2493092' }
      };
      expect(getGbifUrl(sp)).toBe('https://www.gbif.org/species/2493092');
    });

    it('rejects non-numeric key strings and falls back to search query', () => {
      const spInvalid: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Pitta elliotii',
        academic: { gbifTaxonKey: 'TAXON-KEY-INVALID-999' }
      };
      expect(getGbifUrl(spInvalid)).toBe('https://www.gbif.org/species/search?q=Pitta%20elliotii');
    });

    it('handles negative or decimal strings by falling back safely', () => {
      const spNegative: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Pitta elliotii',
        academic: { gbifTaxonKey: '-12345' }
      };
      expect(getGbifUrl(spNegative)).toBe('https://www.gbif.org/species/search?q=Pitta%20elliotii');
    });
  });

  describe('4. Stress-test getInaturalistUrl', () => {
    it('returns direct observationUrl when present', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        illustration: {
          imageUrl: 'https://example.com/photo.jpg',
          artist: 'John Doe',
          observationUrl: 'https://www.inaturalist.org/observations/12345678'
        }
      };
      expect(getInaturalistUrl(sp)).toBe('https://www.inaturalist.org/observations/12345678');
    });

    it('falls back to search query when observationUrl is missing or invalid', () => {
      const sp: BirdSpecies = {
        ...dummySpecies,
        scientificName: 'Sphenocichla roberti',
        illustration: {
          imageUrl: 'https://example.com/photo.jpg',
          artist: 'John Doe',
          observationUrl: ''
        }
      };
      expect(getInaturalistUrl(sp)).toBe('https://www.inaturalist.org/taxa/search?q=Sphenocichla%20roberti');
    });
  });

  describe('5. Stress-test getXenoCantoUrl', () => {
    it('handles various xenoCantoId formats (XC12345, xc12345, 12345, with spaces)', () => {
      const audio1: AudioCallInfo = { audioUrl: 'https://example.com/1.mp3', xenoCantoId: 'XC789123' };
      const audio2: AudioCallInfo = { audioUrl: 'https://example.com/2.mp3', xenoCantoId: 'xc789123' };
      const audio3: AudioCallInfo = { audioUrl: 'https://example.com/3.mp3', xenoCantoId: '  789123  ' };

      expect(getXenoCantoUrl(audio1)).toBe('https://xeno-canto.org/789123');
      expect(getXenoCantoUrl(audio2)).toBe('https://xeno-canto.org/789123');
      expect(getXenoCantoUrl(audio3)).toBe('https://xeno-canto.org/789123');
    });

    it('extracts XC ID from CDN audioUrl even if complex query params or subpaths exist', () => {
      const audio: AudioCallInfo = {
        audioUrl: 'https://xeno-canto-storage.s3.amazonaws.com/sounds/XC654321_extended.mp3?token=abc'
      };
      expect(getXenoCantoUrl(audio)).toBe('https://xeno-canto.org/654321');
    });

    it('falls back to search when audioUrl has no XC pattern and xenoCantoId is missing', () => {
      const audio: AudioCallInfo = {
        audioUrl: 'https://cdn.example.com/custom_bird_sound.mp3'
      };
      expect(getXenoCantoUrl(audio, 'Garrulax konkakinhensis')).toBe('https://xeno-canto.org/explore?query=Garrulax%20konkakinhensis');
    });

    it('returns default root homepage when audioInfo is empty object and scientificName is whitespace', () => {
      expect(getXenoCantoUrl({ audioUrl: '' }, '   ')).toBe('https://xeno-canto.org/');
      expect(getXenoCantoUrl(null, undefined)).toBe('https://xeno-canto.org/');
    });
  });

  describe('6. Stress-test resolveAcademicRefLink', () => {
    it('normalizes DOIs with various prefixes (doi:, DOI:, whitespace)', () => {
      const ref1: AcademicReference = {
        authors: 'Test A',
        year: 2020,
        title: 'Study 1',
        journalOrBook: 'Journal of Ornithology',
        doiOrUrl: '  10.1007/s10336-020-01789-x  '
      };
      expect(resolveAcademicRefLink(ref1)).toEqual({
        url: 'https://doi.org/10.1007/s10336-020-01789-x',
        label: 'DOI Gốc',
        isDirect: true
      });

      const ref2: AcademicReference = {
        authors: 'Test B',
        year: 2021,
        title: 'Study 2',
        journalOrBook: 'Ibis',
        doiOrUrl: 'doi:10.2307/4089901'
      };
      expect(resolveAcademicRefLink(ref2)).toEqual({
        url: 'https://doi.org/10.2307/4089901',
        label: 'DOI Gốc',
        isDirect: true
      });
    });

    it('handles historical French Indochina citations with accents and varied casing', () => {
      const refFrench: AcademicReference = {
        authors: 'Jean Delacour & Pierre Jabouille',
        year: 1928,
        title: 'Vingt-trois espèces et sous-espèces nouvelles d’oiseaux d’Indochine',
        journalOrBook: 'Bulletin du Muséum national d’histoire naturelle'
      };
      const resolved = resolveAcademicRefLink(refFrench);
      expect(resolved.isDirect).toBe(false);
      expect(resolved.label).toBe('Tra cứu BHL ↗');
      expect(resolved.url).toContain('https://www.biodiversitylibrary.org/search?searchTerm=');
      expect(() => new URL(resolved.url)).not.toThrow();
    });

    it('handles Ibis and BOC historical journal mentions', () => {
      const refBoc: AcademicReference = {
        authors: 'Eames, J. C.',
        year: 2002,
        title: 'Eleven new sub-species of babbler from Vietnam',
        journalOrBook: 'Bulletin of the British Ornithologists’ Club'
      };
      const resolved = resolveAcademicRefLink(refBoc);
      expect(resolved.label).toBe('Tra cứu BHL ↗');
    });

    it('handles completely blank/empty AcademicReference without throwing', () => {
      const blankRef: AcademicReference = {
        authors: '',
        year: undefined as unknown as number,
        title: '',
        journalOrBook: ''
      };
      const resolved = resolveAcademicRefLink(blankRef);
      expect(resolved.isDirect).toBe(false);
      expect(resolved.label).toBe('Tra cứu Scholar ↗');
      expect(resolved.url).toBe('https://scholar.google.com/scholar?q=Vietnam%20ornithology');
      expect(() => new URL(resolved.url)).not.toThrow();
    });

    it('handles direct generic http/https web links', () => {
      const webRef: AcademicReference = {
        authors: 'BirdLife International',
        year: 2024,
        title: 'Data Zone Factsheet',
        journalOrBook: 'Online Database',
        doiOrUrl: 'http://datazone.birdlife.org/species/factsheet/22678901'
      };
      const resolved = resolveAcademicRefLink(webRef);
      expect(resolved.isDirect).toBe(true);
      expect(resolved.label).toBe('Tài liệu gốc');
      expect(resolved.url).toBe('http://datazone.birdlife.org/species/factsheet/22678901');
    });
  });
});

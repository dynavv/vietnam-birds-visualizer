/**
 * src/utils/linkGenerators.ts
 * Module phát sinh và giải quyết liên kết ngoại bộ học thuật & bảo tồn chuẩn tắc, chống gãy vỡ (Resilient Link Resolvers).
 */

import type { BirdSpecies, AcademicReference, AudioCallInfo } from '../types/bird';

export interface ResolvedAcademicRef {
  url: string;
  label: string;
  isDirect: boolean;
}

/**
 * Phát sinh liên kết IUCN Red List chuẩn cho loài chim
 */
export const getIucnUrl = (species: BirdSpecies): string => {
  const customUrl = species.academic?.iucnUrl;
  if (customUrl && (customUrl.startsWith('https://www.iucnredlist.org/') || customUrl.startsWith('http://www.iucnredlist.org/'))) {
    return customUrl;
  }
  const cleanName = species.scientificName ? species.scientificName.trim() : '';
  return `https://www.iucnredlist.org/search?query=${encodeURIComponent(cleanName)}&searchType=species`;
};

/**
 * Phát sinh liên kết Avibase Checklist chuẩn tắc
 */
export const getAvibaseUrl = (species: BirdSpecies): string => {
  const avibaseId = species.academic?.avibaseId?.trim();
  // Nếu là mã 16 ký tự hex hợp lệ của Avibase (không phải dummy slug 'AVIBASE-...')
  if (avibaseId && /^[A-F0-9]{16}$/i.test(avibaseId)) {
    return `https://avibase.bsc-eoc.org/species.jsp?avibaseid=${avibaseId}&lang=EN`;
  }
  const cleanName = species.scientificName ? species.scientificName.trim() : '';
  return `https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=${encodeURIComponent(cleanName)}`;
};

/**
 * Phát sinh liên kết GBIF Backbone Taxonomy chuẩn tắc
 */
export const getGbifUrl = (species: BirdSpecies): string => {
  const keyOrUrl = species.academic?.gbifTaxonKey?.trim();
  if (keyOrUrl) {
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
      return keyOrUrl;
    }
    if (/^\d+$/.test(keyOrUrl)) {
      return `https://www.gbif.org/species/${keyOrUrl}`;
    }
  }
  const cleanName = species.scientificName ? species.scientificName.trim() : '';
  return `https://www.gbif.org/species/search?q=${encodeURIComponent(cleanName)}`;
};

/**
 * Phát sinh liên kết iNaturalist Taxon hoặc Observation
 */
export const getInaturalistUrl = (species: BirdSpecies): string => {
  if (species.illustration?.observationUrl && species.illustration.observationUrl.startsWith('http')) {
    return species.illustration.observationUrl;
  }
  const cleanName = species.scientificName ? species.scientificName.trim() : '';
  return `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(cleanName)}`;
};

/**
 * Phát sinh liên kết trang thu âm Xeno-canto
 */
export const getXenoCantoUrl = (audioInfo?: AudioCallInfo | null, scientificName?: string): string => {
  if (audioInfo?.xenoCantoId) {
    const cleanId = audioInfo.xenoCantoId.trim().replace(/^XC/i, '');
    if (cleanId) {
      return `https://xeno-canto.org/${cleanId}`;
    }
  }
  if (audioInfo?.audioUrl) {
    const match = audioInfo.audioUrl.match(/XC(\d+)/i);
    if (match && match[1]) {
      return `https://xeno-canto.org/${match[1]}`;
    }
  }
  if (scientificName && scientificName.trim()) {
    return `https://xeno-canto.org/explore?query=${encodeURIComponent(scientificName.trim())}`;
  }
  return 'https://xeno-canto.org/';
};

/**
 * Giải quyết liên kết tài liệu mô tả gốc (Primary Literature Reference)
 * với DOI normalization, BHL search fallback và Google Scholar search fallback.
 */
export const resolveAcademicRefLink = (ref: AcademicReference): ResolvedAcademicRef => {
  if (ref.doiOrUrl) {
    const link = ref.doiOrUrl.trim();
    if (link.startsWith('10.') || link.startsWith('doi:10.')) {
      const cleanDoi = link.replace(/^doi:/i, '');
      return {
        url: `https://doi.org/${cleanDoi}`,
        label: 'DOI Gốc',
        isDirect: true
      };
    }
    if (link.includes('biodiversitylibrary.org')) {
      return {
        url: link,
        label: 'Thư viện BHL',
        isDirect: true
      };
    }
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return {
        url: link,
        label: 'Tài liệu gốc',
        isDirect: true
      };
    }
  }

  // Fallback 1: Nếu trích dẫn là tài liệu lịch sử BHL Đông Dương
  const title = ref.title || '';
  const journal = ref.journalOrBook || '';
  const authors = ref.authors || '';
  const titleLower = title.toLowerCase();
  const journalLower = journal.toLowerCase();

  if (
    titleLower.includes('indochine') ||
    journalLower.includes('british ornithologists') ||
    journalLower.includes('muséum') ||
    journalLower.includes('ibis') ||
    journalLower.includes('bulletin of the british ornithologists') ||
    authors.toLowerCase().includes('delacour') ||
    authors.toLowerCase().includes('jabouille')
  ) {
    return {
      url: `https://www.biodiversitylibrary.org/search?searchTerm=${encodeURIComponent(title || journal)}`,
      label: 'Tra cứu BHL ↗',
      isDirect: false
    };
  }

  // Fallback 2: Google Scholar Bibliographic Search
  const queryParts = [authors, ref.year, title].filter(Boolean).map(s => String(s).trim());
  const query = queryParts.join(' ') || journal || 'Vietnam ornithology';

  return {
    url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
    label: 'Tra cứu Scholar ↗',
    isDirect: false
  };
};

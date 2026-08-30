import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  chatWithNaturalist,
  identifyBirdImage,
  generateExpeditionLog,
  STORAGE_KEY_CUSTOM_API_KEY
} from './geminiService';
import type { BirdSpecies } from '../types/bird';

// Mock @google/genai SDK
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    }))
  };
});

describe('geminiService Unit Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockGenerateContent.mockReset();
  });

  describe('API Key Management', () => {
    it('returns empty string when no key is set', () => {
      expect(getGeminiApiKey()).toBe('');
      expect(hasGeminiApiKey()).toBe(false);
    });

    it('stores and retrieves custom API key from localStorage', () => {
      setGeminiApiKey('AIzaSyTestApiKey123456');
      expect(getGeminiApiKey()).toBe('AIzaSyTestApiKey123456');
      expect(hasGeminiApiKey()).toBe(true);
      expect(window.localStorage.getItem(STORAGE_KEY_CUSTOM_API_KEY)).toBe('AIzaSyTestApiKey123456');
    });

    it('clears API key when setting empty string', () => {
      setGeminiApiKey('AIzaSyTestApiKey123456');
      setGeminiApiKey('');
      expect(getGeminiApiKey()).toBe('');
      expect(hasGeminiApiKey()).toBe(false);
    });
  });

  describe('chatWithNaturalist', () => {
    it('throws error if API key is not configured', async () => {
      await expect(chatWithNaturalist([], 'Xin chào')).rejects.toThrow(/Chưa tìm thấy Gemini API Key/);
    });

    it('generates response when API key is present', async () => {
      setGeminiApiKey('AIzaSyValidTestKey');
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Chào bạn! Khướu Ngọc Linh là loài chim đặc hữu quý hiếm tại Việt Nam.'
      });

      const reply = await chatWithNaturalist(
        [{ role: 'user', text: 'Khướu Ngọc Linh có gì đặc biệt?' }],
        'Hãy mô tả tiếng hót của chúng.'
      );

      expect(reply).toContain('Khướu Ngọc Linh');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('falls back to secondary model when primary model fails with 503', async () => {
      setGeminiApiKey('AIzaSyValidTestKey');
      // First call (gemini-3.7-flash) fails with 503
      mockGenerateContent.mockRejectedValueOnce(new Error('503 This model is currently experiencing high demand'));
      // Second call (fallback model) succeeds
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Phản hồi từ mô hình dự phòng thành công.'
      });

      const reply = await chatWithNaturalist([], 'Chào bạn');
      expect(reply).toBe('Phản hồi từ mô hình dự phòng thành công.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('identifyBirdImage', () => {
    it('parses JSON response correctly from Gemini Vision', async () => {
      setGeminiApiKey('AIzaSyValidTestKey');
      const mockResultJson = JSON.stringify({
        matchedSpeciesId: 'trochalopteron-ngoclinhense',
        speciesNameVi: 'Khướu Ngọc Linh',
        scientificName: 'Trochalopteron ngoclinhense',
        confidence: 95,
        diagnosticRationale: 'Cánh màu vàng kim rực rỡ, chỏm đầu xám tro.',
        keyFeaturesObserved: ['Dải cánh vàng kim', 'Đỉnh đầu xám'],
        suggestedEba: 'Cao nguyên Kon Tum',
        conservationNote: 'EN • Nguy cấp',
        isEndemicToVietnam: true
      });

      mockGenerateContent.mockResolvedValueOnce({
        text: mockResultJson
      });

      const dummySpecies: BirdSpecies[] = [
        {
          id: 'trochalopteron-ngoclinhense',
          vietnameseName: 'Khướu Ngọc Linh',
          scientificName: 'Trochalopteron ngoclinhense',
          englishName: 'Golden-winged Laughingthrush',
          isEndemic: true,
          conservation: { iucn: 'EN', description: 'Nguy cấp' },
          taxonomy: { clade: [], order: 'Passeriformes', orderVietnamese: 'Bộ Sẻ', family: 'Leiothrichidae', familyVietnamese: 'Họ Khướu', genus: 'Trochalopteron', species: 'ngoclinhense' },
          morphologicalAnalysis: { overview: '', diagnosticFeatures: [] },
          distribution: { ebaRegion: 'Cao nguyên Kon Tum', elevation: '2000m', habitats: [], locations: [], coordinates: [15, 108] },
          illustration: { imageUrl: '', artist: '' }
        }
      ];

      const res = await identifyBirdImage('fakeBase64String', 'image/jpeg', dummySpecies);

      expect(res.matchedSpeciesId).toBe('trochalopteron-ngoclinhense');
      expect(res.speciesNameVi).toBe('Khướu Ngọc Linh');
      expect(res.confidence).toBe(95);
      expect(res.isEndemicToVietnam).toBe(true);
    });
  });

  describe('generateExpeditionLog', () => {
    it('calls model and returns markdown journal text', async () => {
      setGeminiApiKey('AIzaSyValidTestKey');
      mockGenerateContent.mockResolvedValueOnce({
        text: '# Nhật Ký Thám Hiểm Rừng Kon Tum\n\nSáng sớm sương mù phủ kín đỉnh núi...'
      });

      const dummySpecies: BirdSpecies = {
        id: 'trochalopteron-ngoclinhense',
        vietnameseName: 'Khướu Ngọc Linh',
        scientificName: 'Trochalopteron ngoclinhense',
        englishName: 'Golden-winged Laughingthrush',
        isEndemic: true,
        conservation: { iucn: 'EN', description: 'Nguy cấp' },
        taxonomy: { clade: [], order: 'Passeriformes', orderVietnamese: 'Bộ Sẻ', family: 'Leiothrichidae', familyVietnamese: 'Họ Khướu', genus: 'Trochalopteron', species: 'ngoclinhense' },
        morphologicalAnalysis: { overview: '', diagnosticFeatures: [] },
        distribution: { ebaRegion: 'Cao nguyên Kon Tum', elevation: '2000m', habitats: ['Rừng rêu'], locations: ['Ngọc Linh'], coordinates: [15, 108] },
        illustration: { imageUrl: '', artist: '' }
      };

      const log = await generateExpeditionLog(dummySpecies);
      expect(log).toContain('Nhật Ký Thám Hiểm');
    });
  });
});

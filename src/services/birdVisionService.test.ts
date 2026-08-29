import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeBirdImage, parseGeminiResponse } from './birdVisionService';
import type { BirdVisionResult } from '../utils/speciesMatcher';

describe('birdVisionService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('parseGeminiResponse', () => {
    it('parses structured JSON output correctly from Gemini response with markdown code fences', () => {
      const rawJson = JSON.stringify({
        is_bird: true,
        confidence_score: 96,
        species_vietnamese: 'Khướu Ngọc Linh',
        species_scientific: 'Garrulax ngoclinhensis',
        family_scientific: 'Leiothrichidae',
        order_scientific: 'Passeriformes',
        conservation_status: 'VU',
        diagnostic_features: ['Mào nâu hung', 'Vành mắt xám tro', 'Lông bụng màu xám'],
        brief_description: 'Loài khướu đặc hữu đỉnh Ngọc Linh, Kon Tum.'
      });

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: `\`\`\`json\n${rawJson}\n\`\`\`` }]
            }
          }
        ]
      };

      const result = parseGeminiResponse(mockResponse);
      expect(result.is_bird).toBe(true);
      expect(result.confidence_score).toBe(96);
      expect(result.species_vietnamese).toBe('Khướu Ngọc Linh');
      expect(result.species_scientific).toBe('Garrulax ngoclinhensis');
      expect(result.family_scientific).toBe('Leiothrichidae');
      expect(result.order_scientific).toBe('Passeriformes');
      expect(result.conservation_status).toBe('VU');
      expect(result.diagnostic_features).toHaveLength(3);
      expect(result.diagnostic_features[0]).toBe('Mào nâu hung');
      expect(result.brief_description).toContain('đặc hữu đỉnh Ngọc Linh');
    });

    it('parses raw JSON string without markdown code fence', () => {
      const rawJson = JSON.stringify({
        is_bird: true,
        confidence_score: 90,
        species_vietnamese: 'Gà lôi lam mào trắng',
        species_scientific: 'Lophura edwardsi',
        family_scientific: 'Phasianidae',
        order_scientific: 'Galliformes',
        conservation_status: 'CR',
        diagnostic_features: ['Mào trắng muốt', 'Mặt đỏ'],
        brief_description: 'Loài trĩ đặc hữu miền Trung Việt Nam.'
      });

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: rawJson }]
            }
          }
        ]
      };

      const result = parseGeminiResponse(mockResponse);
      expect(result.is_bird).toBe(true);
      expect(result.species_vietnamese).toBe('Gà lôi lam mào trắng');
      expect(result.species_scientific).toBe('Lophura edwardsi');
      expect(result.confidence_score).toBe(90);
    });

    it('handles direct string input to parseGeminiResponse', () => {
      const rawJson = `\`\`\`
{
  "is_bird": true,
  "confidence_score": 88,
  "species_vietnamese": "Nuốc bụng vàng",
  "species_scientific": "Harpactes oreskios",
  "family_scientific": "Trogonidae",
  "order_scientific": "Trogoniformes",
  "conservation_status": "LC",
  "diagnostic_features": ["Bụng vàng óng", "Lưng hung đỏ"],
  "brief_description": "Sống trong rừng thường xanh nhiệt đới."
}
\`\`\``;

      const result = parseGeminiResponse(rawJson);
      expect(result.is_bird).toBe(true);
      expect(result.species_vietnamese).toBe('Nuốc bụng vàng');
      expect(result.species_scientific).toBe('Harpactes oreskios');
    });

    it('handles non-bird image detection gracefully', () => {
      const rawJson = JSON.stringify({
        is_bird: false,
        confidence_score: 0,
        species_vietnamese: '',
        species_scientific: '',
        family_scientific: '',
        order_scientific: '',
        conservation_status: 'LC',
        diagnostic_features: [],
        brief_description: 'Hình ảnh là một chiếc xe hơi, không phải chim.'
      });

      const mockResponse = {
        candidates: [{ content: { parts: [{ text: rawJson }] } }]
      };

      const result = parseGeminiResponse(mockResponse);
      expect(result.is_bird).toBe(false);
      expect(result.confidence_score).toBe(0);
      expect(result.brief_description).toBe('Hình ảnh là một chiếc xe hơi, không phải chim.');
    });

    it('handles corrupted or invalid JSON gracefully with default fallback', () => {
      const corruptedResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'This is not valid JSON at all!' }]
            }
          }
        ]
      };

      const result = parseGeminiResponse(corruptedResponse);
      expect(result.is_bird).toBe(false);
      expect(result.confidence_score).toBe(0);
      expect(result.diagnostic_features).toEqual([]);
      expect(result.brief_description).toBeDefined();
    });

    it('handles null, undefined or empty data payload gracefully', () => {
      expect(parseGeminiResponse(null).is_bird).toBe(false);
      expect(parseGeminiResponse(undefined).is_bird).toBe(false);
      expect(parseGeminiResponse({}).is_bird).toBe(false);
      expect(parseGeminiResponse({ candidates: [] }).is_bird).toBe(false);
    });

    it('coerces and sanitizes missing or mismatched property types safely', () => {
      const partialJson = JSON.stringify({
        is_bird: 'true',
        confidence_score: '85.5',
        species_vietnamese: null,
        species_scientific: undefined,
        diagnostic_features: 'not an array'
      });

      const result = parseGeminiResponse({
        candidates: [{ content: { parts: [{ text: partialJson }] } }]
      });

      expect(result.is_bird).toBe(true);
      expect(result.confidence_score).toBe(85.5);
      expect(result.species_vietnamese).toBe('');
      expect(result.species_scientific).toBe('');
      expect(result.diagnostic_features).toEqual([]);
    });
  });

  describe('analyzeBirdImage', () => {
    it('throws error when no API key is provided and env var is not set', async () => {
      const oldEnv = import.meta.env.VITE_GEMINI_API_KEY;
      // @ts-ignore
      import.meta.env.VITE_GEMINI_API_KEY = '';

      try {
        await expect(analyzeBirdImage('sample-data-url', 'image/jpeg', '')).rejects.toThrow(
          /Chưa cấu hình VITE_GEMINI_API_KEY/i
        );
      } finally {
        // @ts-ignore
        import.meta.env.VITE_GEMINI_API_KEY = oldEnv;
      }
    });

    it('calls Gemini REST endpoint with correct payload and returns parsed result with apiKeyOverride', async () => {
      const mockResultData: BirdVisionResult = {
        is_bird: true,
        confidence_score: 95,
        species_vietnamese: 'Mi Langbiang',
        species_scientific: 'Crocias langbianis',
        family_scientific: 'Leiothrichidae',
        order_scientific: 'Passeriformes',
        conservation_status: 'EN',
        diagnostic_features: ['Lưng vằn sọc nâu đen', 'Vệt mắt đen sẫm'],
        brief_description: 'Loài mi quý hiếm đặc hữu cao nguyên Lâm Viên.'
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockResultData) }]
              }
            }
          ]
        })
      });
      global.fetch = fetchMock;

      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = await analyzeBirdImage(dataUrl, 'image/png', 'test-api-key-123');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toContain('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
      expect(url).toContain('key=test-api-key-123');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.contents[0].parts).toHaveLength(2);
      expect(body.contents[0].parts[1].inline_data.mime_type).toBe('image/png');
      expect(body.contents[0].parts[1].inline_data.data).not.toContain('data:image/png;base64,');
      expect(body.generationConfig.response_mime_type).toBe('application/json');

      expect(result.is_bird).toBe(true);
      expect(result.species_scientific).toBe('Crocias langbianis');
      expect(result.confidence_score).toBe(95);
    });

    it('handles raw base64 string without data: prefix properly', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      is_bird: true,
                      confidence_score: 91,
                      species_vietnamese: 'Khướu đầu đen má xám',
                      species_scientific: 'Trochalopteron yersini',
                      family_scientific: 'Leiothrichidae',
                      order_scientific: 'Passeriformes',
                      conservation_status: 'EN',
                      diagnostic_features: ['Đầu đen má xám', 'Cổ hung đỏ'],
                      brief_description: 'Đặc hữu vùng núi cao Nam Trung Bộ.'
                    })
                  }
                ]
              }
            }
          ]
        })
      });
      global.fetch = fetchMock;

      const rawBase64 = 'rawBase64ImageDataStringWithoutPrefix';
      const result = await analyzeBirdImage(rawBase64, 'image/webp', 'custom-key');

      const [, options] = fetchMock.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.contents[0].parts[1].inline_data.mime_type).toBe('image/webp');
      expect(body.contents[0].parts[1].inline_data.data).toBe('rawBase64ImageDataStringWithoutPrefix');
      expect(result.species_scientific).toBe('Trochalopteron yersini');
    });

    it('throws descriptive error on API failure with HTTP status and message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'API key not valid. Please pass a valid API key.'
      });

      await expect(
        analyzeBirdImage('data:image/jpeg;base64,abc', 'image/jpeg', 'invalid-key')
      ).rejects.toThrow(/Lỗi từ Gemini Vision API \(400\): API key not valid/i);
    });

    it('throws descriptive error on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error connecting to Gemini API'));

      await expect(
        analyzeBirdImage('data:image/jpeg;base64,abc', 'image/jpeg', 'valid-key')
      ).rejects.toThrow(/Network error connecting to Gemini API/i);
    });
  });
});

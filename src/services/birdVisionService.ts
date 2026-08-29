import { BirdVisionResult } from '../utils/speciesMatcher';

export type { BirdVisionResult };

export const GEMINI_SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Điểu học Hàng đầu Thế giới (World Leading Ornithologist & Taxonomic Curator) của Viện Sinh học Nhiệt đới & Bảo tàng Lịch sử Tự nhiên.
Nhiệm vụ của bạn là giám định hình ảnh loài chim được cung cấp, nhận diện tên loài theo chuẩn IOC World Bird List mới nhất và Sách Đỏ IUCN.

Hãy phân tích kỹ các đặc điểm: hình dạng mỏ, màu sắc lông vũ, sọc đầu/mắt, mào, và màu chân.
Trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm văn bản mở đầu hay kết thúc) theo đúng schema sau:
{
  "is_bird": boolean,
  "confidence_score": number (0-100),
  "species_vietnamese": string (Tên tiếng Việt chính thống),
  "species_scientific": string (Tên khoa học: Chi + loài),
  "family_scientific": string (Tên Họ khoa học),
  "order_scientific": string (Tên Bộ khoa học),
  "conservation_status": string ("LC" | "NT" | "VU" | "EN" | "CR"),
  "diagnostic_features": string[] (3 đặc điểm hình thái nhận dạng then chốt trong ảnh),
  "brief_description": string (Mô tả 1-2 câu ngắn gọn về sinh cảnh và phân bố)
}

Nếu ảnh không phải là chim hoặc không có chim, đặt is_bird = false, confidence_score = 0 và brief_description giải thích ngắn gọn đối tượng trong ảnh.`;

export function parseGeminiResponse(data: any): BirdVisionResult {
  try {
    let rawText = '';
    if (typeof data === 'string') {
      rawText = data;
    } else if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = data.candidates[0].content.parts[0].text;
    } else if (data?.text) {
      rawText = data.text;
    }

    if (!rawText || !rawText.trim()) {
      return {
        is_bird: false,
        confidence_score: 0,
        species_vietnamese: '',
        species_scientific: '',
        family_scientific: '',
        order_scientific: '',
        conservation_status: 'LC',
        diagnostic_features: [],
        brief_description: 'Không nhận diện được phản hồi hợp lệ từ mô hình AI.'
      };
    }

    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Extract JSON substring if surrounded by extra text
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanJson);
    return {
      is_bird: parsed.is_bird === true || parsed.is_bird === 'true',
      confidence_score: typeof parsed.confidence_score === 'number'
        ? parsed.confidence_score
        : (Number(parsed.confidence_score) || 0),
      species_vietnamese: typeof parsed.species_vietnamese === 'string' ? parsed.species_vietnamese.trim() : '',
      species_scientific: typeof parsed.species_scientific === 'string' ? parsed.species_scientific.trim() : '',
      family_scientific: typeof parsed.family_scientific === 'string' ? parsed.family_scientific.trim() : '',
      order_scientific: typeof parsed.order_scientific === 'string' ? parsed.order_scientific.trim() : '',
      conservation_status: typeof parsed.conservation_status === 'string' ? parsed.conservation_status.trim() : 'LC',
      diagnostic_features: Array.isArray(parsed.diagnostic_features)
        ? parsed.diagnostic_features.filter((f: any) => typeof f === 'string')
        : [],
      brief_description: typeof parsed.brief_description === 'string' ? parsed.brief_description.trim() : ''
    };
  } catch {
    return {
      is_bird: false,
      confidence_score: 0,
      species_vietnamese: '',
      species_scientific: '',
      family_scientific: '',
      order_scientific: '',
      conservation_status: 'LC',
      diagnostic_features: [],
      brief_description: 'Không thể phân tích dữ liệu hình ảnh. Vui lòng thử lại.'
    };
  }
}

export async function analyzeBirdImage(
  base64DataUrl: string,
  mimeType: string = 'image/jpeg',
  apiKeyOverride?: string
): Promise<BirdVisionResult> {
  const apiKey = apiKeyOverride || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY trong hệ thống.');
  }

  let base64Data = base64DataUrl;
  let resolvedMimeType = mimeType;

  if (base64DataUrl.startsWith('data:')) {
    const match = base64DataUrl.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      resolvedMimeType = mimeType || match[1];
      base64Data = match[2];
    } else if (base64DataUrl.includes(',')) {
      base64Data = base64DataUrl.split(',')[1];
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: GEMINI_SYSTEM_INSTRUCTION },
          {
            inline_data: {
              mime_type: resolvedMimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json'
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch {
      // ignore
    }
    throw new Error(`Lỗi từ Gemini Vision API (${response.status}): ${errorBody || response.statusText}`);
  }

  const jsonResult = await response.json();
  return parseGeminiResponse(jsonResult);
}

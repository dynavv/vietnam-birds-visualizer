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

export async function convertImageUrlToBase64(
  imageUrl: string,
  maxWidth = 1024
): Promise<{ dataUrl: string; mimeType: string }> {
  if (imageUrl.startsWith('data:')) {
    const mimeMatch = imageUrl.match(/^data:([^;]+);/);
    return {
      dataUrl: imageUrl,
      mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg'
    };
  }

  // If running in browser environment with Image & Canvas
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const result = await new Promise<{ dataUrl: string; mimeType: string }>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > maxWidth || height > maxWidth) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxWidth) / height);
                height = maxWidth;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Canvas 2D context not available');
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve({
              dataUrl,
              mimeType: 'image/jpeg'
            });
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => {
          reject(new Error('Image failed to load in browser element'));
        };
        img.src = imageUrl;
      });
      return result;
    } catch {
      // Fallback to fetch blob
    }
  }

  // Fallback using fetch blob
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Không thể tải ảnh mẫu (${res.status}): ${res.statusText}`);
    }
    const blob = await res.blob();
    const mimeType = blob.type || 'image/jpeg';
    return await new Promise<{ dataUrl: string; mimeType: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          mimeType
        });
      };
      reader.onerror = () => reject(new Error('Không thể đọc dữ liệu blob của ảnh.'));
      reader.readAsDataURL(blob);
    });
  } catch (fetchErr: any) {
    throw new Error(`Không thể chuyển đổi ảnh mẫu sang định dạng Base64: ${fetchErr?.message || fetchErr}`);
  }
}

// Active working model cache in-memory
let activeWorkingModel = '';

export function getCandidateModels(): string[] {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const envModel = metaEnv?.VITE_GEMINI_MODEL;

  const models = [
    activeWorkingModel,
    envModel,
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash',
    'gemini-2.0-flash'
  ].filter(Boolean) as string[];

  // Remove duplicates while preserving priority order
  return Array.from(new Set(models));
}

export function extractSuggestedModelFromError(errorBody: string): string | null {
  if (!errorBody) return null;
  const match = errorBody.match(/models\/([a-zA-Z0-9._-]+)/);
  if (match && match[1] && !match[1].includes('2.5')) {
    return match[1];
  }
  return null;
}

export async function analyzeBirdImage(
  imageSource: string,
  mimeType: string = 'image/jpeg',
  apiKeyOverride?: string
): Promise<BirdVisionResult> {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const envKey = metaEnv ? metaEnv.VITE_GEMINI_API_KEY : '';
  const apiKey = (apiKeyOverride !== undefined ? apiKeyOverride : envKey) || '';

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY trong hệ thống.');
  }

  let base64Data = imageSource;
  let resolvedMimeType = mimeType;

  // Auto-convert any URL or relative path (starts with /, http://, https://, blob:, etc.) to Base64
  if (
    !imageSource.startsWith('data:') &&
    (imageSource.startsWith('/') ||
      imageSource.startsWith('http://') ||
      imageSource.startsWith('https://') ||
      imageSource.startsWith('blob:') ||
      imageSource.includes('/'))
  ) {
    const converted = await convertImageUrlToBase64(imageSource);
    base64Data = converted.dataUrl;
    resolvedMimeType = converted.mimeType;
  }

  if (base64Data.startsWith('data:')) {
    const match = base64Data.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      resolvedMimeType = resolvedMimeType || match[1];
      base64Data = match[2];
    } else if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }
  }

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

  const candidateModels = getCandidateModels();
  let lastError: Error | null = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        activeWorkingModel = model;
        const jsonResult = await response.json();
        return parseGeminiResponse(jsonResult);
      }

      const errorBody = await response.text().catch(() => '');

      // Check if Google explicitly suggests a newer model in the error message
      const suggestedModel = extractSuggestedModelFromError(errorBody);
      if (suggestedModel && !candidateModels.includes(suggestedModel)) {
        candidateModels.splice(i + 1, 0, suggestedModel);
      }

      lastError = new Error(`Lỗi từ Gemini Vision API [${model}] (${response.status}): ${errorBody || response.statusText}`);
    } catch (fetchErr: any) {
      lastError = new Error(`Lỗi kết nối Gemini Vision API [${model}]: ${fetchErr?.message || fetchErr}`);
    }
  }

  throw lastError || new Error('Không thể kết nối đến bất kỳ mô hình Gemini Vision nào.');
}

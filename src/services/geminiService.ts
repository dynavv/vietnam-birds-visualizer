/**
 * src/services/geminiService.ts
 * Module tích hợp Google Gen AI SDK (@google/genai) cho dự án Avifauna of Vietnam.
 * Cung cấp:
 * 1. Trợ lý Giám tuyển Điểu học (AI Avian Naturalist Chat)
 * 2. Nhận diện loài chim qua ảnh thực địa (Multimodal Vision Identification)
 * 3. Sinh nhật ký quan sát thực địa (Field Expedition Log Generator)
 */

import { GoogleGenAI } from '@google/genai';
import type { BirdSpecies } from '../types/bird';

export const GEMINI_MODEL_DEFAULT = 'gemini-3.7-flash';
export const STORAGE_KEY_CUSTOM_API_KEY = 'agy_avifauna_gemini_api_key';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BirdIdentificationResult {
  matchedSpeciesId: string | null;
  speciesNameVi: string;
  scientificName: string;
  confidence: number; // 0 to 100
  diagnosticRationale: string;
  keyFeaturesObserved: string[];
  suggestedEba: string;
  conservationNote: string;
  isEndemicToVietnam: boolean;
}

/**
 * Lấy API key hiện hành (Ưu tiên: Custom Key trong LocalStorage > .env.local)
 */
export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const customKey = window.localStorage.getItem(STORAGE_KEY_CUSTOM_API_KEY);
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return (envKey && typeof envKey === 'string') ? envKey.trim() : '';
}

/**
 * Lưu Custom API Key do người dùng nhập từ giao diện
 */
export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (key && key.trim().length > 0) {
      window.localStorage.setItem(STORAGE_KEY_CUSTOM_API_KEY, key.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY_CUSTOM_API_KEY);
    }
  }
}

/**
 * Kiểm tra xem đã có API Key chưa
 */
export function hasGeminiApiKey(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 5);
}

/**
 * Khởi tạo client Google Gen AI an toàn
 */
function getAiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chưa tìm thấy Gemini API Key. Vui lòng nhập API Key từ Google AI Studio (https://aistudio.google.com/) trong phần Cài đặt AI.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * System Instruction chung cho vai trò Giám tuyển Điểu học
 */
export const NATURALIST_SYSTEM_INSTRUCTION = `
Bạn là "Avian Naturalist Curator" — Trợ lý Giám tuyển Điểu học và Bảo tồn Đa dạng Sinh học hàng đầu tại Việt Nam, thuộc dự án số hóa bảo tàng "Avifauna of Vietnam".

Về chuyên môn & phương pháp:
1. Bạn nắm vững hệ thống phân loại học chim thế giới theo IOC World Bird List (v14.2) và Clements Checklist, kết hợp Sách Đỏ IUCN và Sách Đỏ Việt Nam.
2. Bạn am hiểu sâu sắc 6 Vùng Chim Đặc Hữu (EBAs do BirdLife International xác định tại Việt Nam):
   - EBA 1: Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan
   - EBA 2: Vùng núi Đông Bắc & Đá vôi Bắc Bộ
   - EBA 3: Vùng Đất thấp miền Trung
   - EBA 4: Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh
   - EBA 5: Cao nguyên Đà Lạt / Lâm Viên
   - EBA 6: Vùng đồng bằng & rừng đất thấp Nam Bộ (Cát Tiên)
3. Văn phong: Trầm ấm, uyên bác, giàu chất thơ và cảm hứng tự nhiên học cổ điển thế kỷ 19-20. Luôn tôn trọng tính chính xác khoa học, sử dụng tiếng Việt chuẩn kèm tên khoa học (in nghiêng) và tên tiếng Anh khi nhắc đến bất kỳ loài nào.
4. Tuyên truyền bảo tồn: Nhấn mạnh giá trị độc bản của các loài đặc hữu Việt Nam và kêu gọi bảo vệ sinh cảnh rừng nguyên sinh.
`;

/**
 * Trò chuyện với Trợ lý Giám tuyển Điểu học
 */
export async function chatWithNaturalist(
  history: ChatMessage[],
  newMessage: string,
  currentSpecies?: BirdSpecies | null,
  modelName: string = GEMINI_MODEL_DEFAULT
): Promise<string> {
  const ai = getAiClient();

  let contextInjection = '';
  if (currentSpecies) {
    contextInjection = `\n[Ngữ cảnh loài chim người dùng đang xem trên bảo tàng:
- Tên tiếng Việt: ${currentSpecies.vietnameseName}
- Tên khoa học: ${currentSpecies.scientificName}
- Phân loại: Bộ ${currentSpecies.taxonomy?.orderVietnamese || currentSpecies.taxonomy?.order} (${currentSpecies.taxonomy?.order}), Họ ${currentSpecies.taxonomy?.familyVietnamese || currentSpecies.taxonomy?.family} (${currentSpecies.taxonomy?.family}), Chi ${currentSpecies.taxonomy?.genus}
- Đặc hữu Việt Nam: ${currentSpecies.isEndemic ? 'CÓ (Báu vật đặc hữu)' : 'Không'}
- Bậc bảo tồn IUCN: ${currentSpecies.conservation?.iucn}
- Phân bố: ${currentSpecies.distribution?.ebaRegion} (${currentSpecies.distribution?.locations?.join(', ')})
- Độ cao: ${currentSpecies.distribution?.elevation}
- Sinh cảnh: ${currentSpecies.distribution?.habitats?.join(', ')}
- Đặc điểm hình thái: ${currentSpecies.morphologicalAnalysis?.overview}
]`;
  }

  const systemInstruction = NATURALIST_SYSTEM_INSTRUCTION + contextInjection;

  // Chuẩn bị nội dung contents cho Gemini API
  const formattedContents = history.map(item => ({
    role: item.role === 'model' ? 'model' : 'user',
    parts: [{ text: item.text }]
  }));

  formattedContents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    return response.text || 'Xin lỗi, tôi chưa thể xử lý câu trả lời lúc này. Bạn vui lòng thử lại nhé.';
  } catch (err: unknown) {
    console.error('Gemini chat error:', err);
    throw err;
  }
}

/**
 * Nhận diện loài chim qua ảnh thực địa (Multimodal Vision)
 */
export async function identifyBirdImage(
  imageBase64Clean: string,
  mimeType: string,
  allSpecies: BirdSpecies[],
  modelName: string = GEMINI_MODEL_DEFAULT
): Promise<BirdIdentificationResult> {
  const ai = getAiClient();

  // Tạo danh mục tóm tắt 68 loài chim trong cơ sở dữ liệu để Gemini đối chiếu
  const speciesCatalog = allSpecies.map(s => ({
    id: s.id,
    vn: s.vietnameseName,
    sci: s.scientificName,
    order: s.taxonomy?.order,
    family: s.taxonomy?.family,
    isEndemic: s.isEndemic,
    iucn: s.conservation?.iucn,
    eba: s.distribution?.ebaRegion
  }));

  const prompt = `
Bạn là chuyên gia phân loại học hình thái chim thực địa Việt Nam.
Hãy phân tích bức ảnh này một cách tỉ mỉ:
1. Quan sát hình thái mỏ (thẳng, cong, dẹt, quặp), cấu trúc lông cánh, hoa văn vệt màu mắt/đầu/ngực/bụng, hình dạng đuôi, và chân.
2. Đối chiếu với danh lục 68 loài chim trong kho tàng dữ liệu Bảo tàng Avifauna of Vietnam dưới đây:
${JSON.stringify(speciesCatalog)}

Nếu đây là một loài trong danh sách, hãy chọn chính xác \`matchedSpeciesId\` tương ứng.
Nếu không nằm chính xác trong danh sách 68 loài, hãy đưa ra chẩn đoán loài gần nhất, đặt \`matchedSpeciesId\` là null hoặc ID loài có quan hệ họ hàng gần gũi nhất.

YÊU CẦU: Trả về DUY NHẤT một JSON hợp lệ tuân thủ đúng cấu trúc sau (không kèm markdown ngoài JSON):
{
  "matchedSpeciesId": string | null,
  "speciesNameVi": string,
  "scientificName": string,
  "confidence": number, // 0 đến 100
  "diagnosticRationale": string, // Lập luận giải phẫu chi tiết lý do nhận định loài này
  "keyFeaturesObserved": string[], // Mảng 3-5 đặc điểm quan sát thấy trong ảnh (màu lông, mỏ, vệt mắt...)
  "suggestedEba": string, // Vùng Chim Đặc Hữu hoặc sinh cảnh phù hợp tại Việt Nam
  "conservationNote": string, // Ghi chú bảo tồn (Sách Đỏ / IUCN)
  "isEndemicToVietnam": boolean
}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64Clean
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        systemInstruction: NATURALIST_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText) as BirdIdentificationResult;
    return parsed;
  } catch (err: unknown) {
    console.error('Gemini vision identification error:', err);
    throw err;
  }
}

/**
 * Sinh Nhật Ký Thám Hiểm Thực Địa Cá Nhân Hóa (Field Expedition Log)
 */
export async function generateExpeditionLog(
  species: BirdSpecies,
  modelName: string = GEMINI_MODEL_DEFAULT
): Promise<string> {
  const ai = getAiClient();

  const prompt = `
Hãy viết một trang "Nhật Ký Thám Hiểm & Quan Sát Thực Địa" (Field Expedition Journal Entry) đậm chất tự nhiên học cổ điển (phong cách các nhà thám hiểm như Delacour hay John James Audubon tại Việt Nam) khi bạn vừa may mắn bắt gặp loài chim sau trong rừng:

Thông tin quan sát:
- Loài: ${species.vietnameseName} (${species.scientificName})
- Báu vật đặc hữu: ${species.isEndemic ? 'ĐẶC HỮU DUY NHẤT CỦA VIỆT NAM' : 'Loài chim rừng nhiệt đới quý hiếm'}
- Vùng ghi nhận: ${species.distribution?.ebaRegion}
- Địa điểm cụ thể: ${species.distribution?.locations?.join(', ') || 'Rừng nguyên sinh'}
- Độ cao: ${species.distribution?.elevation}
- Sinh cảnh: ${species.distribution?.habitats?.join(', ')}
- Tình trạng bảo tồn: IUCN [${species.conservation?.iucn}] — ${species.conservation?.description}

Yêu cầu bài viết:
- Định dạng nhật ký: Có Ngày tháng thám hiểm thực địa (thời điểm bình minh/hoàng hôn trong rừng), Tọa độ GPS ghi nhận, Cao độ.
- Mô tả sinh động khoảnh khắc bắt gặp: Âm thanh tiếng hót trong vòm lá, chuyển động chuyền cành, ánh sáng xuyên qua tán rừng nhiệt đới, vệt màu lông óng ánh dưới sương mai.
- Cảm xúc và suy ngẫm về sự mong manh của thiên nhiên và trách nhiệm bảo tồn di sản sinh thái Việt Nam.
- Trình bày dạng Markdown trang nhã, trau chuốt, giàu hình ảnh thơ mộng.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: NATURALIST_SYSTEM_INSTRUCTION,
        temperature: 0.85
      }
    });

    return response.text || 'Không thể tạo nhật ký thực địa lúc này.';
  } catch (err: unknown) {
    console.error('Gemini expedition log error:', err);
    throw err;
  }
}

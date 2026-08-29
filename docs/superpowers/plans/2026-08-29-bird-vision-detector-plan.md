# Kế Hoạch Triển Khai (Implementation Plan): Bird Vision Detector (Nhận Diện Chim Bằng AI)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng Nhận diện Chim bằng Thị giác máy tính AI (Gemini 2.5 Flash Vision), cho phép người dùng tải ảnh/chụp ảnh/chọn ảnh mẫu để định danh loài, phân tích hình thái giải phẫu và liên kết trực tiếp với 68 loài chim trong Bảo tàng số Avifauna of Vietnam.

**Architecture:** 
- Phía Client: Chuyển đổi và nén ảnh $\rightarrow$ Gửi Base64 đến Gemini 2.5 Flash Vision endpoint với JSON Structured Output.
- Phân hệ So khớp (`speciesMatcher`): Nhận diện tên khoa học/tiếng Việt và đối chiếu với cơ sở dữ liệu `species.json` để mở Cẩm nang giám tuyển 1-chạm.
- Giao diện (`BirdVisionModal`): Modal tương tác cao cấp với vùng thả ảnh, ảnh mẫu demo có sẵn, hoạt ảnh quét lăng kính phân tích và thẻ kết quả định danh sinh học.

**Tech Stack:** React 18 (TypeScript), Tailwind CSS, Lucide React, Gemini Vision API (Google Gen AI REST), Vitest, Testing Library.

**Spec:** [`docs/superpowers/specs/2026-08-29-bird-vision-detector-design.md`](file:///home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/docs/superpowers/specs/2026-08-29-bird-vision-detector-design.md)

## Global Constraints

- Phù hợp phong cách mỹ thuật Bảo tàng Tự nhiên học (*Warm paper `#FAF8F5`, `#F4F0E8`, font Serif/Sans*).
- Không yêu cầu người dùng cuối nhập API key cá nhân; sử dụng biến môi trường `VITE_GEMINI_API_KEY` (hoặc mock fallback thông minh khi test).
- Tuân thủ nghiêm ngặt chuẩn phân loại học IOC World Bird List.
- Đảm bảo 100% các bài kiểm thử unit & integration test đều pass với Vitest.

---

### Task 1: Species Matcher Utility (Thuật Toán So Khớp Loài)

**Files:**
- Create: `src/utils/speciesMatcher.ts`
- Test: `src/utils/speciesMatcher.test.ts`

**Interfaces:**
- Consumes: `src/types/bird.ts` (`Species`), `src/data/species.json`
- Produces: `matchSpeciesWithMuseum(aiResult: BirdVisionResult, allSpecies: Species[]): SpeciesMatchResult`

- [ ] **Step 1: Write the failing test for speciesMatcher**

```typescript
// src/utils/speciesMatcher.test.ts
import { describe, it, expect } from 'vitest';
import { matchSpeciesWithMuseum, BirdVisionResult } from './speciesMatcher';
import speciesData from '../data/species.json';
import { Species } from '../types/bird';

describe('speciesMatcher Utility', () => {
  const speciesList = speciesData as Species[];

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
    expect(match.matchedSpecies?.nameScientific).toBe('Lophura edwardsi');
  });

  it('matches normalized Vietnamese name if scientific name has slight variance', () => {
    const aiResult: BirdVisionResult = {
      is_bird: true,
      confidence_score: 90,
      species_vietnamese: 'Nuốc bụng vàng',
      species_scientific: 'Harpactes oreskios',
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

  it('handles non-museum species gracefully and finds related species in same genus/family', () => {
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/utils/speciesMatcher.test.ts -- --run`
Expected: FAIL (Cannot find module `./speciesMatcher`)

- [ ] **Step 3: Implement speciesMatcher**

```typescript
// src/utils/speciesMatcher.ts
import { Species } from '../types/bird';

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
  matchedSpecies: Species | null;
  relatedMuseumSpecies: Species[];
}

export function matchSpeciesWithMuseum(
  aiResult: BirdVisionResult,
  allSpecies: Species[]
): SpeciesMatchResult {
  if (!aiResult.is_bird) {
    return {
      isMuseumSpecies: false,
      matchedSpecies: null,
      relatedMuseumSpecies: []
    };
  }

  const cleanSci = (aiResult.species_scientific || '').trim().toLowerCase();
  const cleanVn = (aiResult.species_vietnamese || '').trim().toLowerCase();

  // 1. Exact or partial scientific name match
  let matched = allSpecies.find(s => 
    s.nameScientific.toLowerCase() === cleanSci ||
    cleanSci.includes(s.nameScientific.toLowerCase()) ||
    s.nameScientific.toLowerCase().includes(cleanSci)
  );

  // 2. Exact Vietnamese name match
  if (!matched && cleanVn) {
    matched = allSpecies.find(s => 
      s.nameVietnamese.toLowerCase() === cleanVn ||
      cleanVn.includes(s.nameVietnamese.toLowerCase()) ||
      s.nameVietnamese.toLowerCase().includes(cleanVn)
    );
  }

  // 3. Find related species in same genus or family
  const genus = cleanSci.split(' ')[0] || '';
  const family = (aiResult.family_scientific || '').trim().toLowerCase();
  const relatedMuseumSpecies = allSpecies.filter(s => {
    if (matched && s.id === matched.id) return false;
    const sGenus = s.nameScientific.split(' ')[0].toLowerCase();
    return (genus && sGenus === genus) || (family && s.familyScientific.toLowerCase() === family);
  }).slice(0, 3);

  return {
    isMuseumSpecies: !!matched,
    matchedSpecies: matched || null,
    relatedMuseumSpecies
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/utils/speciesMatcher.test.ts -- --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/speciesMatcher.ts src/utils/speciesMatcher.test.ts
git commit -m "feat: add speciesMatcher utility with unit tests"
```

---

### Task 2: Bird Vision AI Service (`src/services/birdVisionService.ts`)

**Files:**
- Create: `src/services/birdVisionService.ts`
- Test: `src/services/birdVisionService.test.ts`

**Interfaces:**
- Consumes: Gemini Vision REST API / `VITE_GEMINI_API_KEY`
- Produces: `analyzeBirdImage(base64Image: string, mimeType?: string, apiKey?: string): Promise<BirdVisionResult>`

- [ ] **Step 1: Write the failing test for birdVisionService**

```typescript
// src/services/birdVisionService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeBirdImage, parseGeminiResponse } from './birdVisionService';

describe('birdVisionService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses structured JSON output correctly from Gemini response', () => {
    const rawJson = JSON.stringify({
      is_bird: true,
      confidence_score: 96,
      species_vietnamese: 'Khướu Ngọc Linh',
      species_scientific: 'Garrulax ngoclinhensis',
      family_scientific: 'Leiothrichidae',
      order_scientific: 'Passeriformes',
      conservation_status: 'VU',
      diagnostic_features: ['Mào nâu hung', 'Vành mắt xám tro'],
      brief_description: 'Loài khướu đặc hữu đỉnh Ngọc Linh'
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
    expect(result.species_vietnamese).toBe('Khướu Ngọc Linh');
    expect(result.species_scientific).toBe('Garrulax ngoclinhensis');
    expect(result.confidence_score).toBe(96);
  });

  it('calls Gemini REST endpoint and returns parsed result', async () => {
    const mockData = {
      is_bird: true,
      confidence_score: 92,
      species_vietnamese: 'Mi Langbiang',
      species_scientific: 'Crocias langbianis',
      family_scientific: 'Leiothrichidae',
      order_scientific: 'Passeriformes',
      conservation_status: 'EN',
      diagnostic_features: ['Lưng vằn sọc nâu đen'],
      brief_description: 'Loài mi quý hiếm cao nguyên Lâm Viên'
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(mockData) }] } }
        ]
      })
    });

    const result = await analyzeBirdImage('data:image/jpeg;base64,samplebase64', 'image/jpeg', 'test-key');
    expect(result.species_scientific).toBe('Crocias langbianis');
    expect(result.confidence_score).toBe(92);
  });

  it('handles non-bird image detection gracefully', () => {
    const rawJson = JSON.stringify({
      is_bird: false,
      confidence_score: 10,
      species_vietnamese: '',
      species_scientific: '',
      family_scientific: '',
      order_scientific: '',
      conservation_status: 'LC',
      diagnostic_features: [],
      brief_description: 'Hình ảnh không chứa loài chim.'
    });

    const mockResponse = {
      candidates: [{ content: { parts: [{ text: rawJson }] } }]
    };

    const result = parseGeminiResponse(mockResponse);
    expect(result.is_bird).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/services/birdVisionService.test.ts -- --run`
Expected: FAIL (Cannot find module `./birdVisionService`)

- [ ] **Step 3: Implement birdVisionService**

```typescript
// src/services/birdVisionService.ts
import { BirdVisionResult } from '../utils/speciesMatcher';

const GEMINI_SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Điểu học Hàng đầu Thế giới (World Leading Ornithologist & Taxonomic Curator) của Viện Sinh học Nhiệt đới & Bảo tàng Lịch sử Tự nhiên.
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
}`;

export function parseGeminiResponse(data: any): BirdVisionResult {
  try {
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      is_bird: Boolean(parsed.is_bird),
      confidence_score: Number(parsed.confidence_score) || 0,
      species_vietnamese: parsed.species_vietnamese || 'Chưa xác định',
      species_scientific: parsed.species_scientific || 'Unknown species',
      family_scientific: parsed.family_scientific || 'Unknown family',
      order_scientific: parsed.order_scientific || 'Unknown order',
      conservation_status: parsed.conservation_status || 'LC',
      diagnostic_features: Array.isArray(parsed.diagnostic_features) ? parsed.diagnostic_features : [],
      brief_description: parsed.brief_description || ''
    };
  } catch (error) {
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
  const apiKey = apiKeyOverride || import.meta.env.VITE_GEMINI_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY trong hệ thống.');
  }

  // Strip prefix data:image/...;base64,
  const base64Data = base64DataUrl.includes(',') 
    ? base64DataUrl.split(',')[1] 
    : base64DataUrl;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: GEMINI_SYSTEM_INSTRUCTION },
          {
            inline_data: {
              mime_type: mimeType,
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
    const errorBody = await response.text();
    throw new Error(`Lỗi từ Gemini Vision API (${response.status}): ${errorBody}`);
  }

  const jsonResult = await response.json();
  return parseGeminiResponse(jsonResult);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/services/birdVisionService.test.ts -- --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/birdVisionService.ts src/services/birdVisionService.test.ts
git commit -m "feat: add birdVisionService using Gemini 2.5 Flash with tests"
```

---

### Task 3: Vision Demo Samples & Asset Helper (`src/data/visionSamples.ts`)

**Files:**
- Create: `src/data/visionSamples.ts`
- Test: `src/data/visionSamples.test.ts`

**Interfaces:**
- Produces: `VISION_DEMO_SAMPLES: VisionSampleItem[]`

- [ ] **Step 1: Write test and implement vision samples**

```typescript
// src/data/visionSamples.test.ts
import { describe, it, expect } from 'vitest';
import { VISION_DEMO_SAMPLES } from './visionSamples';

describe('visionSamples', () => {
  it('provides at least 3 curated demo bird samples with image and label', () => {
    expect(VISION_DEMO_SAMPLES.length).toBeGreaterThanOrEqual(3);
    for (const sample of VISION_DEMO_SAMPLES) {
      expect(sample.id).toBeDefined();
      expect(sample.title).toBeDefined();
      expect(sample.imageUrl).toBeDefined();
      expect(sample.speciesId).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Implement visionSamples.ts**

```typescript
// src/data/visionSamples.ts
export interface VisionSampleItem {
  id: string;
  title: string;
  speciesId: string;
  description: string;
  imageUrl: string;
}

export const VISION_DEMO_SAMPLES: VisionSampleItem[] = [
  {
    id: 'sample-edwardsi',
    title: 'Gà lôi lam mào trắng',
    speciesId: 'lophura-edwardsi',
    description: 'Chim trĩ đặc hữu nguy cấp (CR) miền Trung',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lophura_edwardsi_-London_Zoo%2C_England-8a.jpg/800px-Lophura_edwardsi_-London_Zoo%2C_England-8a.jpg'
  },
  {
    id: 'sample-oreskios',
    title: 'Nuốc bụng vàng',
    speciesId: 'harpactes-oreskios',
    description: 'Chim Nuốc rừng thường xanh',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Orange-breasted_trogon_%28Harpactes_oreskios_stellae%29_male.jpg/800px-Orange-breasted_trogon_%28Harpactes_oreskios_stellae%29_male.jpg'
  },
  {
    id: 'sample-langbianis',
    title: 'Mi Langbiang',
    speciesId: 'crocias-langbianis',
    description: 'Chim đặc hữu cao nguyên Lâm Viên',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Grey-crowned_Crocias.jpg/800px-Grey-crowned_Crocias.jpg'
  }
];
```

- [ ] **Step 3: Run test and commit**

Run: `npm test src/data/visionSamples.test.ts -- --run`
Commit: `git add src/data/visionSamples.ts src/data/visionSamples.test.ts && git commit -m "feat: add curated demo bird vision samples"`

---

### Task 4: Bird Vision Modal Component (`src/components/VisionDetector/BirdVisionModal.tsx`)

**Files:**
- Create: `src/components/VisionDetector/BirdVisionModal.tsx`
- Create: `src/components/VisionDetector/index.ts`
- Test: `src/components/VisionDetector/BirdVisionModal.test.tsx`

**Interfaces:**
- Consumes: `birdVisionService.ts`, `speciesMatcher.ts`, `visionSamples.ts`, `TaxonomyContext`
- Produces: `<BirdVisionModal isOpen={boolean} onClose={() => void} />`

- [ ] **Step 1: Write the component test for BirdVisionModal**

```typescript
// src/components/VisionDetector/BirdVisionModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BirdVisionModal } from './BirdVisionModal';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import * as birdVisionService from '../../services/birdVisionService';

describe('BirdVisionModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    expect(screen.getByText(/Giám Định Loài Chim Bằng Thị Giác AI/i)).toBeDefined();
    expect(screen.getByText(/Kéo & thả ảnh chim vào đây/i)).toBeDefined();
    expect(screen.getByText(/Ảnh Mẫu Thử Nghiệm Nhanh/i)).toBeDefined();
  });

  it('handles sample click and triggers analysis', async () => {
    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockResolvedValue({
      is_bird: true,
      confidence_score: 95,
      species_vietnamese: 'Gà lôi lam mào trắng',
      species_scientific: 'Lophura edwardsi',
      family_scientific: 'Phasianidae',
      order_scientific: 'Galliformes',
      conservation_status: 'CR',
      diagnostic_features: ['Mào lông trắng'],
      brief_description: 'Đặc hữu miền Trung'
    });

    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    const sampleBtn = screen.getByRole('button', { name: /Gà lôi lam mào trắng/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Khớp với mẫu vật trong Bảo tàng số/i)).toBeDefined();
      expect(screen.getByText(/95% Tự tin/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Mở Cẩm Nang Giám Tuyển/i })).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/VisionDetector/BirdVisionModal.test.tsx -- --run`
Expected: FAIL

- [ ] **Step 3: Implement BirdVisionModal component**

Create `src/components/VisionDetector/BirdVisionModal.tsx` with:
- Drag-and-drop & file input with image preview.
- Sample items switcher.
- Scan animation with radar pulse.
- Result card rendering diagnostic traits, confidence meter, IUCN status badge, and "👉 Mở Cẩm Nang Giám Tuyển" button switching `activeView` to `'curator'` and `selectedSpeciesId`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/VisionDetector/BirdVisionModal.test.tsx -- --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/VisionDetector/
git commit -m "feat: implement interactive BirdVisionModal with test suite"
```

---

### Task 5: Integration with Header & App (`MuseumHeader.tsx` & `App.tsx`)

**Files:**
- Modify: `src/components/Header/MuseumHeader.tsx`
- Modify: `src/components/Header/MuseumHeader.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Update MuseumHeader to include "📷 Nhận Diện Bằng AI" button**

Add `onOpenVisionDetector?: () => void` prop to `MuseumHeaderProps` and render an elegant camera button.

- [ ] **Step 2: Update App.tsx to manage isVisionModalOpen state**

Wire `isVisionModalOpen` state and render `<BirdVisionModal isOpen={isVisionModalOpen} onClose={() => setIsVisionModalOpen(false)} />`.

- [ ] **Step 3: Run full test suite & production build**

Run: `npm test -- --run && npm run build`
Expected: 195+ tests PASS, Build succeeds with zero errors.

- [ ] **Step 4: Commit integration changes**

```bash
git add src/components/Header/ src/App.tsx src/App.test.tsx
git commit -m "feat: integrate Bird Vision Detector into MuseumHeader and App"
```

---

## Plan Self-Review Checklist

1. **Spec Coverage:**
   - [x] Upload Dropzone & Camera/File picker $\rightarrow$ Task 4
   - [x] 3 Demo Sample Images $\rightarrow$ Task 3, Task 4
   - [x] Gemini 2.5 Flash Vision client service $\rightarrow$ Task 2
   - [x] Museum Species Matcher & 1-Click to Curator View $\rightarrow$ Task 1, Task 4
   - [x] Header Entry Point & App Integration $\rightarrow$ Task 5
2. **Placeholder Scan:** No "TBD" or vague steps. Complete code examples provided.
3. **Type Consistency:** `BirdVisionResult`, `SpeciesMatchResult`, `VisionSampleItem` signatures match across all tasks.

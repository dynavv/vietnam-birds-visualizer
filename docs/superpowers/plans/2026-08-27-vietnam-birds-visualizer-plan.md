# Kế Hoạch Triển Khai (Implementation Plan): Avifauna of Vietnam

> **Dành cho Agentic Workers:** REQUIRED SUB-SKILL: Sử dụng `superpowers:subagent-driven-development` (khuyến nghị) hoặc `superpowers:executing-plans` để thực hiện kế hoạch này từng task một. Các bước sử dụng cú pháp checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Xây dựng website tương tác cao cấp "Avifauna of Vietnam" (Giám tuyển & Trực quan hóa Phân loại học Chim Việt Nam) với 3 màn hình tương tác đồng bộ: Bản đồ Vùng chim đặc hữu (Leaflet Map Landing), Bánh xe Phân loại học D3.js SVG (Phylogenetic Radial Sunburst Wheel), và Trình Giám tuyển Hình thái học Mẫu vật (Naturalist Specimen Curator).

**Kiến trúc:** Ứng dụng Client-side React (TypeScript) + Vite + Tailwind CSS + D3.js + Leaflet. Sử dụng cơ sở dữ liệu đồ thị phân cấp tĩnh (`taxonomy.json`, `species.json`, `ebas.json`) được quản lý qua `TaxonomyContext` đồng bộ trạng thái loài chim đang chọn xuyên suốt cả 3 màn hình.

**Ngăn xếp công nghệ:** React 18, TypeScript, Vite, Tailwind CSS, D3.js (`d3-hierarchy`, `d3-shape`, `d3-interpolate`), Leaflet & React-Leaflet, Lucide React.

**Tài liệu thiết kế (Spec):** [`docs/superpowers/specs/2026-08-27-vietnam-birds-visualizer-design.md`](file:///home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/docs/superpowers/specs/2026-08-27-vietnam-birds-visualizer-design.md)

## Các Ràng buộc Chung (Global Constraints)
- **Màn hình mặc định**: Mở đầu bằng Bản đồ Sinh thái Việt Nam (`activeView: 'map'`), tự động chọn ngẫu nhiên 1 loài chim đặc hữu và kích hoạt hiệu ứng `flyTo` trên bản đồ.
- **Âm thanh (Audio Voice Button)**: Tuyệt đối KHÔNG tự động phát âm thanh (no autoplay). Chỉ phát tiếng hót khi người dùng chủ động click vào nút Voice trên thẻ thông tin.
- **Phong cách mỹ thuật**: *Naturalist Editorial / Victorian Museum Archive* (tông màu giấy ấm `#FAF8F5`, `#F4F0E8`, phông chữ Serif sang trọng cho tên khoa học/tiêu đề, màu sinh thái tự nhiên cho các Bộ chim).
- **Dữ liệu phân loại học**: Chuẩn hóa theo hệ thống IOC / Clements và danh lục chim Việt Nam (bao phủ 100% các loài đặc hữu quý hiếm và đại diện các Bộ chính).

---

### Task 1: Khởi tạo Dự án Vite React TypeScript & Cấu hình Styling
**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- Create: `src/index.css`, `src/main.tsx`

**Interfaces:**
- Produces: Môi trường build Vite + React + TypeScript + Tailwind CSS với phông chữ Google Fonts (*Playfair Display*, *Cormorant Garamond*, *Inter*) và bảng màu Naturalist.

- [ ] **Step 1: Khởi tạo `package.json` với đầy đủ dependencies**
```json
{
  "name": "vietnam-birds-visualizer",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "d3": "^7.9.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/d3": "^7.4.3",
    "@types/leaflet": "^1.9.16",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.6",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 2: Cấu hình `tailwind.config.js` với bảng màu Naturalist Paper**
- [ ] **Step 3: Cấu hình `index.html` nhúng phông chữ Serif cổ điển & Leaflet CSS**
- [ ] **Step 4: Cài đặt dependencies và kiểm tra lệnh build**

---

### Task 2: Xây dựng Schema & Bộ Dữ liệu Chim Việt Nam (Species, Taxonomy, EBAs)
**Files:**
- Create: `src/types/bird.ts`
- Create: `src/data/species.json` (~60 loài chim gồm 100% đặc hữu VN + đại diện các Bộ)
- Create: `src/data/taxonomy.json` (Cây phân cấp D3 Partition)
- Create: `src/data/ebas.json` (Tọa độ các Vùng chim đặc hữu & Vườn Quốc Gia Việt Nam)
- Create: `src/data/validateData.test.ts`

**Interfaces:**
- Produces: `BirdSpecies`, `TaxonomyNode`, `EBARegion` interfaces và bộ dữ liệu phân loại học đã qua kiểm thử tính toàn vẹn 100%.

- [ ] **Step 1: Định nghĩa types trong `src/types/bird.ts`**
- [ ] **Step 2: Tạo bộ dữ liệu `src/data/species.json` với đầy đủ thông tin tên 3 thứ tiếng, hình thái, sinh cảnh, tình trạng Sách Đỏ và link audio**
- [ ] **Step 3: Tạo cây phân cấp `src/data/taxonomy.json` từ Lớp Aves -> Bộ -> Họ -> Chi -> Loài**
- [ ] **Step 4: Tạo dữ liệu địa lý `src/data/ebas.json` cho các Vùng chim đặc hữu**
- [ ] **Step 5: Viết test `src/data/validateData.test.ts` kiểm tra 100% loài trong `species.json` đều khớp với lá trong `taxonomy.json` và chạy test thành công**

---

### Task 3: Quản lý Trạng thái Toàn cục (TaxonomyContext)
**Files:**
- Create: `src/context/TaxonomyContext.tsx`
- Create: `src/context/TaxonomyContext.test.tsx`

**Interfaces:**
- Produces: `useTaxonomy()` hook cung cấp:
  - `selectedSpecies`: `BirdSpecies | null`
  - `activeView`: `'map' | 'sunburst' | 'curator'`
  - `selectSpecies(id: string)`: void
  - `selectRandomEndemic()`: void
  - `searchQuery`, `onlyEndemic`, `selectedOrder`, `selectedConservation`
  - `filteredSpecies`: `BirdSpecies[]`

- [ ] **Step 1: Viết test cho TaxonomyContext (khởi tạo, chọn loài ngẫu nhiên, lọc dữ liệu)**
- [ ] **Step 2: Viết implementation `src/context/TaxonomyContext.tsx`**
- [ ] **Step 3: Chạy test kiểm tra toàn bộ state context hoạt động chính xác**

---

### Task 4: Thành phần Giao diện Dùng chung (Museum Header, Search, Filter & Audio Voice Button)
**Files:**
- Create: `src/components/Header/MuseumHeader.tsx`
- Create: `src/components/Header/SearchFilterBar.tsx`
- Create: `src/components/Common/AudioVoiceButton.tsx`
- Create: `src/components/Common/ConservationBadge.tsx`

**Interfaces:**
- Consumes: `useTaxonomy()` từ `TaxonomyContext`
- Produces: Header tạp chí tự nhiên học, thanh lọc đa tiêu chí, nút phát tiếng hót chủ động với hiệu ứng sóng âm khi click.

- [ ] **Step 1: Xây dựng `AudioVoiceButton.tsx` (chỉ phát khi click, có wave visualizer, nút pause/play mượt mà)**
- [ ] **Step 2: Xây dựng `ConservationBadge.tsx` (hiển thị màu sắc chuẩn IUCN: CR, EN, VU, NT, LC)**
- [ ] **Step 3: Xây dựng `SearchFilterBar.tsx` (tìm kiếm tức thì, toggle 'Chỉ xem chim Đặc hữu', dropdown Bộ)**
- [ ] **Step 4: Xây dựng `MuseumHeader.tsx` (tiêu đề bảo tàng, bộ chuyển đổi 3 View: Map / Sunburst / Curator)**

---

### Task 5: Màn hình Bản đồ Vùng Chim Đặc hữu Việt Nam (EBA Map - Màn hình Mở đầu)
**Files:**
- Create: `src/components/MapView/VietnamEBAMap.tsx`
- Create: `src/components/MapView/EndemicFocusCard.tsx`
- Create: `src/components/MapView/EBARegionLegend.tsx`

**Interfaces:**
- Consumes: `useTaxonomy()`, `ebas.json`
- Produces: Bản đồ Leaflet tương tác địa hình Việt Nam với các vùng EBA, hiệu ứng `flyTo` khi chọn loài, thẻ nổi bật loài chim đặc hữu kèm nút Voice và nút "Khám phá trên Bánh xe Phân loại ➔".

- [ ] **Step 1: Xây dựng `EndemicFocusCard.tsx` hiển thị tranh vẽ cổ điển, tên 3 thứ tiếng, sinh cảnh, nút Audio Voice và nút chuyển sang Sunburst Wheel**
- [ ] **Step 2: Xây dựng `VietnamEBAMap.tsx` với Leaflet, render các marker/vùng sinh thái (Đà Lạt, Ngọc Linh, Fansipan, Cát Tiên...) và hiệu ứng camera `flyTo`**
- [ ] **Step 3: Tích hợp nút "🎲 Khám phá loài ngẫu nhiên" để bay đến địa điểm mới**

---

### Task 6: Màn hình Bánh xe Phân loại học D3 SVG (Phylogenetic Radial Sunburst Wheel)
**Files:**
- Create: `src/components/SunburstView/SunburstWheel.tsx`
- Create: `src/components/SunburstView/BreadcrumbTrail.tsx`
- Create: `src/components/SunburstView/QuickSpecimenPanel.tsx`

**Interfaces:**
- Consumes: `taxonomy.json`, `species.json`, `useTaxonomy()`
- Produces: Đồ thị tròn phân nhánh đa tầng D3 SVG (Lớp $\rightarrow$ Bộ $\rightarrow$ Họ $\rightarrow$ Chi $\rightarrow$ Loài), hiệu ứng phóng to cung tròn (arc zoom), chuỗi tiến hóa phát sáng và side panel xem nhanh mẫu vật.

- [ ] **Step 1: Xây dựng `BreadcrumbTrail.tsx` hiển thị đường dẫn tiến hóa từ gốc Aves đến loài đang chọn**
- [ ] **Step 2: Xây dựng `QuickSpecimenPanel.tsx` (bảng xem nhanh bên phải với ảnh tranh vẽ và lập luận tiến hóa tóm tắt)**
- [ ] **Step 3: Xây dựng `SunburstWheel.tsx` với thuật toán D3 Partition, màu sắc phân biệt các Bộ, xoay nhãn chữ hướng tâm, animation phóng to/thu nhỏ mượt mà**

---

### Task 7: Màn hình Trình Giám tuyển & Phân tích Hình thái Học (Specimen & Morphological Curator)
**Files:**
- Create: `src/components/CuratorView/SpecimenPlate.tsx`
- Create: `src/components/CuratorView/MorphologyReport.tsx`
- Create: `src/components/CuratorView/CladeBadgeSequence.tsx`
- Create: `src/components/CuratorView/RelatedSpeciesTabs.tsx`

**Interfaces:**
- Consumes: `selectedSpecies`, `useTaxonomy()`
- Produces: Giao diện giám tuyển chuyên sâu với tranh minh họa lớn, khung viền bảo tàng, báo cáo phân tích hình thái (mỏ, lông, đuôi), huy hiệu phân cấp tiến hóa và tab duyệt các loài cùng họ/chi.

- [ ] **Step 1: Xây dựng `SpecimenPlate.tsx` (khung tranh cổ điển có phóng to chi tiết tranh)**
- [ ] **Step 2: Xây dựng `MorphologyReport.tsx` (trình bày các đặc điểm nhận dạng mỏ/cánh/lông)**
- [ ] **Step 3: Xây dựng `CladeBadgeSequence.tsx` (dải huy hiệu tiến hóa kết nối)**
- [ ] **Step 4: Xây dựng `RelatedSpeciesTabs.tsx` (chuyển nhanh qua các loài lân cận trong cùng Bộ/Họ)**

---

### Task 8: Tích hợp Toàn bộ Ứng dụng & Kiểm thử Toàn diện (Integration & Verification)
**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Kết nối 3 màn hình vào `src/App.tsx` với hiệu ứng chuyển đổi mượt mà**
- [ ] **Step 2: Chạy kiểm tra toàn bộ test suite (`npm run test`)**
- [ ] **Step 3: Chạy build production (`npm run build`) đảm bảo không có lỗi TypeScript hay bundle**
- [ ] **Step 4: Chạy server demo (`npm run dev`) và nghiệm thu từng luồng tương tác**

# Tài Liệu Thiết Kế (Design Spec): Avifauna of Vietnam (Chim Việt Nam)

**Ngày lập**: 2026-08-27  
**Trạng thái**: Draft / Đang chờ duyệt  
**Cảm hứng**: Trực quan hóa phân loại học đa phương thức của Google AI Devs (*Angiosperm Phylogeny Visualizer*) kết hợp phong cách tạp chí tự nhiên học kinh điển (*Museum Archive & Naturalist Editorial*).

---

## 1. Mục tiêu Dự án (Project Goals)

Xây dựng website tương tác cao cấp trực quan hóa danh lục và hệ thống phân loại học của các loài chim tại Việt Nam (**Avifauna of Vietnam**), tập trung vào:
- **100% các loài chim đặc hữu quý hiếm** của Việt Nam (như *Khướu Ngọc Linh, Mi Langbiang, Khướu Kon Ka Kinh, Gà lôi lam mào trắng...*).
- **Bộ dữ liệu tinh hoa ~60 loài** đại diện cho đầy đủ các Bộ (*Orders*) và Họ (*Families*) chim chủ đạo tại Việt Nam.
- **Trải nghiệm thị giác 3 màn hình tương tác đồng bộ**:
  1. **Bản đồ Vùng Chim Đặc hữu (EBA Map - Màn hình Mở đầu)**: Tự động chọn ngẫu nhiên 1 loài đặc hữu, bay đến tọa độ sinh cảnh, hiển thị thẻ thông tin và nút phát tiếng hót chủ động.
  2. **Bánh xe Phân loại học (Phylogenetic Radial Sunburst Wheel)**: Trực quan hóa cây tiến hóa dạng tròn phân nhánh đa tầng (Lớp $\rightarrow$ Bộ $\rightarrow$ Họ $\rightarrow$ Chi $\rightarrow$ Loài) với D3.js SVG.
  3. **Trình Giám tuyển & Phân tích Hình thái Học (Specimen & Morphological Curator)**: Trưng bày tranh vẽ cổ điển, phân tích hình thái học chi tiết và so sánh các loài tương cận.

---

## 2. Phong cách Mỹ thuật & Thiết kế (Design & Aesthetic Direction)

- **Phong cách chủ đạo**: *Naturalist Editorial / Victorian Museum Archive* (phong cách bảo tàng tự nhiên học cổ điển kết hợp công nghệ hiện đại).
- **Bảng màu (Color Palette)**:
  - Nền chính: Màu giấy cổ ấm `#FAF8F5`, `#F4F0E8`
  - Màu chữ: Nâu mực đen `#1C1917`, xám cổ điển `#44403C`
  - Màu nhấn phân loại (Order Clades): Xanh rêu tự nhiên `#2D5A27`, đất nung `#C2593F`, vàng kim ochre `#D97706`, xanh chàm `#1E3A8A`, cánh gián `#7C2D12`
  - Thẻ thông tin: Khung viền thanh mảnh `#E7E2D6`, hiệu ứng bóng mờ nhẹ `#D5CFC2`
- **Typography**:
  - Tiêu đề & Danh pháp khoa học: Phông Serif sang trọng (*Playfair Display* / *Cormorant Garamond* / *EB Garamond*)
  - Nhãn phân loại & Số liệu: Phông Sans-serif hiện đại, thanh thoát (*Inter* / *Cinzel*)

---

## 3. Kiến trúc Hệ thống & Ngăn xếp Công nghệ (Tech Stack)

- **Framework**: Vite + React 18+ (TypeScript)
- **Styling**: Tailwind CSS
- **Trực quan hóa Đồ thị**: D3.js (d3-hierarchy, d3-shape, d3-interpolate, d3-transition)
- **Bản đồ Tương tác**: Leaflet + React-Leaflet (sử dụng base map phong cách địa hình cổ điển / Stamen Watercolor / CartoDB Voyager)
- **Biểu tượng**: Lucide React
- **Xử lý mượt mà**: 100% Client-side Static Data Graph, không độ trễ mạng, hỗ trợ chạy local và deploy web tĩnh tức thì.

---

## 4. Cấu trúc Thư mục Dự án (Project Structure)

```text
vietnam-birds-visualizer/
├── public/
│   ├── assets/illustrations/       # Tranh minh họa loài phong cách cổ điển
│   └── assets/audio/               # File âm thanh tiếng hót
├── src/
│   ├── data/
│   │   ├── taxonomy.json           # Cây phân loại học D3 Sunburst (Class -> Order -> Family -> Genus -> Species)
│   │   ├── species.json            # Cơ sở dữ liệu chi tiết ~60 loài chim Việt Nam
│   │   └── ebas.json               # Dữ liệu tọa độ các Vùng chim đặc hữu & VQG Việt Nam
│   ├── types/
│   │   └── bird.ts                 # TypeScript interfaces cho Species, TaxonomyNode, EBARegion
│   ├── context/
│   │   └── TaxonomyContext.tsx     # Global State đồng bộ hóa giữa 3 màn hình
│   ├── components/
│   │   ├── Header/
│   │   │   ├── MuseumHeader.tsx    # Header phong cách tạp chí cổ điển
│   │   │   └── SearchFilterBar.tsx # Bộ tìm kiếm & lọc (Đặc hữu, Sách đỏ, Bộ)
│   │   ├── MapView/
│   │   │   ├── VietnamEBAMap.tsx   # Bản đồ Leaflet với các vùng EBA
│   │   │   └── EndemicFocusCard.tsx# Thẻ thông tin nổi bật loài chim với nút Voice
│   │   ├── SunburstView/
│   │   │   ├── SunburstWheel.tsx   # Bánh xe D3 SVG Radial Sunburst
│   │   │   ├── BreadcrumbTrail.tsx # Chuỗi tiến hóa phát sáng
│   │   │   └── QuickSpecimenPanel.tsx # Panel xem nhanh bên phải
│   │   ├── CuratorView/
│   │   │   ├── SpecimenPlate.tsx   # Tranh vẽ độ phân giải cao + Zoom
│   │   │   ├── MorphologyReport.tsx# Phân tích hình thái học chi tiết
│   │   │   └── CladeBadgeSequence.tsx # Huy hiệu chuỗi phân cấp tiến hóa
│   │   └── Common/
│   │       ├── AudioVoiceButton.tsx# Nút phát âm thanh chủ động (không tự phát)
│   │       └── ConservationBadge.tsx # Huy hiệu IUCN / Sách Đỏ Việt Nam
│   ├── App.tsx
│   └── index.css
```

---

## 5. Cấu trúc Dữ liệu Chi tiết (Data Schema)

### 5.1. `BirdSpecies` Interface (`src/types/bird.ts`)
```typescript
export interface BirdSpecies {
  id: string;                               // Mã định danh duy nhất (VD: 'trochalopteron-ngoclinhense')
  scientificName: string;                  // 'Trochalopteron ngoclinhense'
  vietnameseName: string;                  // 'Khướu Ngọc Linh'
  englishName: string;                     // 'Golden-winged Laughingthrush'
  taxonomy: {
    clade: string[];                       // ['Aves', 'Neognathae', 'Passerea']
    order: string;                         // 'Passeriformes'
    orderVietnamese: string;               // 'Bộ Sẻ'
    family: string;                        // 'Leiothrichidae'
    familyVietnamese: string;              // 'Họ Khướu'
    genus: string;                         // 'Trochalopteron'
    species: string;                       // 'T. ngoclinhense'
  };
  isEndemic: boolean;                      // true/false
  conservation: {
    iucn: 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
    vietnamRedList?: 'CR' | 'EN' | 'VU' | 'R';
    description: string;                   // Mô tả tình trạng đe dọa / bảo tồn
  };
  morphologicalAnalysis: {
    overview: string;                      // Mô tả tổng quan hình thái
    diagnosticFeatures: {
      part: string;                        // 'Vệt cánh vàng', 'Mỏ', 'Đầu và gáy'
      description: string;
    }[];
  };
  distribution: {
    ebaRegion: string;                     // 'Cao nguyên Kon Tum / Dãy Ngọc Linh'
    elevation: string;                     // '1.900m - 2.590m'
    habitats: string[];                    // ['Rừng thường xanh trên núi cao', 'Rừng lùn đỉnh núi']
    locations: string[];                   // ['VQG Sông Thanh', 'KBT Ngọc Linh']
    coordinates: [number, number];         // [15.08, 107.98] (Vĩ độ, Kinh độ)
  };
  illustration: {
    imageUrl: string;                      // Đường dẫn tranh vẽ
    artist: string;                        // 'H. Grönvold' / 'Naturalist Classic'
    sourceBook?: string;                   // 'Les Oiseaux de l\'Indochine Française'
  };
  audioCall?: {
    audioUrl: string;                      // URL file âm thanh tiếng hót
    duration?: string;                     // Thời lượng (VD: '0:18')
    recordist?: string;                    // Tác giả bản thu xeno-canto
    location?: string;                     // 'Núi Ngọc Linh, Kon Tum'
  };
}
```

---

## 6. Luồng Tương tác & Trạng thái Toàn cục (Interaction & State Flow)

1. **Khởi tạo khi mở Web**:
   - `activeView` mặc định là `'map'`.
   - Chọn ngẫu nhiên 1 loài chim đặc hữu (`isEndemic: true`).
   - Bản đồ Leaflet kích hoạt hiệu ứng bay (`flyTo`) đến tọa độ của loài.
   - Thẻ nổi bật hiển thị: Tranh vẽ, Tên 3 thứ tiếng, Huy hiệu Đặc hữu, Huy hiệu Sách Đỏ, Nút phát âm thanh (Voice Button) kèm nút "Khám phá trên Bánh xe Phân loại ➔".
2. **Nút Phát Âm thanh (Voice Button)**:
   - Chỉ phát khi người dùng chủ động bấm (không tự động phát để tránh nặng máy và ồn).
   - Có trạng thái Play / Pause và hiệu ứng sóng âm thanh (Audio waveform pulse) mini.
3. **Đồng bộ hóa 3 Màn hình (Cross-View Synchronization)**:
   - Khi chọn bất kỳ loài hoặc nhánh nào từ Map, Sunburst hoặc Curator, `selectedSpeciesId` trong `TaxonomyContext` được cập nhật tức thì. Khi chuyển qua lại giữa các màn hình, trạng thái luôn được giữ nguyên vẹn.
4. **Bộ lọc Toàn cục**:
   - Tìm kiếm theo từ khóa (Tiếng Việt / Khoa học / Tiếng Anh).
   - Nút gạt "Chỉ xem chim Đặc hữu Việt Nam" (Only Endemics).
   - Lọc theo bậc bảo tồn (IUCN: CR, EN, VU, NT, LC).
   - Lọc theo Bộ chim (Passeriformes, Galliformes, Bucerotiformes, v.v.).

---

## 7. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

1. **Kiểm tra dữ liệu phân loại học**: Đảm bảo 100% các loài trong `species.json` liên kết đúng nhánh trong `taxonomy.json`, không có nút gãy.
2. **Kiểm tra đồ thị D3 Sunburst**: Đảm bảo thuật toán phân bổ cung góc (`d3.partition`) hiển thị mượt mà, không bị tràn viền, text nhãn xoay đúng góc đọc được.
3. **Kiểm tra Leaflet Map**: Tọa độ các vùng EBA chính xác, hiệu ứng `flyTo` mượt mà không giật khung hình.
4. **Kiểm tra Trình phát Âm thanh**: Phát/dừng đúng file, xử lý êm đẹp trường hợp chưa có audio.
5. **Kiểm tra Responsive**: Hiển thị đẹp trên các độ phân giải màn hình khác nhau (Desktop, Laptop, Tablet).

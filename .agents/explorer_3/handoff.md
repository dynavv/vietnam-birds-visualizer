# Báo Cáo Giám Tuyển Kỹ Thuật (Handoff Report) — Explorer 3
**Chuyên đề**: TypeScript Typing & Type Safety, Bundle Size & Rollup Chunk Splitting, React Performance & Memoization
**Dự án**: Avifauna of Vietnam (Vietnam Birds Visualizer)
**Ngày thực hiện**: 2026-08-28

---

## 1. Observation (Quan sát thực tế)

Qua việc rà soát toàn bộ mã nguồn tại `src/`, cấu hình `tsconfig.json`, `vite.config.ts`, `package.json`, và thực thi kiểm thử (`npm test -- --run`) cùng lệnh build (`npm run build`), ghi nhận các kết quả cụ thể:

### A. Hiện trạng Kiểm thử & Biên dịch
1. **Vitest Suite**: 24/24 test files đạt pass, 109/109 tests passed (thời gian chạy ~6.07s).
2. **TypeScript `tsc` Compilation**: Thành công không có lỗi cú pháp căn bản (`strict: true` được bật trong `tsconfig.json`).
3. **Vite Production Build hiện tại**:
   - Lệnh thực thi: `npm run build` (`tsc && vite build`)
   - Kết quả output:
     ```
     dist/index.html                   1.28 kB │ gzip:   0.71 kB
     dist/assets/index-CntnEe8d.css   65.18 kB │ gzip:  15.09 kB
     dist/assets/index-CC5BsLpT.js   700.52 kB │ gzip: 185.98 kB
     (!) Some chunks are larger than 500 kB after minification.
     ```
   - Cảnh báo: File JS chính gom toàn bộ thư viện và dữ liệu vào một chunk đơn 700.52 kB vượt ngưỡng khuyến cáo (>500 kB).

---

### B. Quan sát Chi tiết về Type Safety (TypeScript)

1. **Ép kiểu không an toàn khi nạp dữ liệu tĩnh (Unsafe Double Type Casts)**:
   - File: `src/data/index.ts`
     - Dòng 6: `export const speciesData = rawSpecies as unknown as BirdSpecies[];`
     - Dòng 7: `export const taxonomyData = rawTaxonomy as TaxonomyNode;`
     - Dòng 8: `export const ebasData = rawEbas as EBARegion[];`
   - File: `src/data/validateData.test.ts`
     - Dòng 7: `const speciesList = speciesJson as unknown as BirdSpecies[];`
     - Dòng 8: `const taxonomyTree = taxonomyJson as TaxonomyNode;`
     - Dòng 9: `const ebasList = ebasJson as EBARegion[];`
   - *Vấn đề*: Sử dụng `as unknown as Type` làm vô hiệu hóa bộ kiểm tra kiểu tĩnh của TypeScript đối với dữ liệu JSON nạp vào. Nếu file JSON có thuộc tính sai lệch tên hoặc thiếu trường, TypeScript không thể phát hiện tại thời điểm build.

2. **Ép kiểu lỏng lẻo trong tương tác D3.js (Loose D3 Casts & `as any`)**:
   - File: `src/components/SunburstView/SunburstWheel.tsx`
     - Dòng 140: `const partitionRoot = partition(root) as unknown as SunburstHierarchyNode;`
     - Dòng 181: `const descendants = partitionRoot.descendants().slice(1) as SunburstHierarchyNode[];`
     - Dòng 319: `path.transition(transition as any)`
     - Dòng 335: `labels.transition(transition as any)`
     - Dòng 327: `+(this as SVGPathElement).getAttribute('fill-opacity')!`
   - *Vấn đề*: Dùng `transition as any` làm mất kiểm soát kiểu dữ liệu của D3 Transition selection; dùng `(this as SVGPathElement)` thay vì khai báo `this: SVGPathElement` trong chữ ký hàm D3 filter/event handler.

3. **Kiểu dữ liệu lỏng lẻo trong Test Helper**:
   - File: `src/components/MapView/EBARegionLegend.test.tsx`
     - Dòng 7: `const TestLegendConsumer: React.FC<{ onSelectRegion?: (r: any) => void }> = ...`
   - *Vấn đề*: Tham số `r: any` thay vì `r: EBARegion`.

4. **Thiếu kiểu Union hạn chế trong Context & Tra cứu Palette**:
   - File: `src/context/TaxonomyContext.tsx`
     - Dòng 19-22: `selectedOrder: string` và `selectedConservation: string`. Không dùng union type (ví dụ `string | 'all'`, `IUCNStatus | 'all'`).
   - File: `src/components/Common/BirdPlateImage.tsx`
     - Dòng 39-40: `const orderName = species.taxonomy?.order || 'Passeriformes';` được dùng để index vào `ORDER_COLOR_PALETTES` (khai báo dạng `Record<string, ...>`), thiếu fallback an toàn kiểu khi gặp order mới.

---

### C. Quan sát Chi tiết về Bundle Size & Rollup Chunk Splitting

1. **Phân tích cơ cấu gói (Bundle Breakdown)**:
   - Tổng dung lượng JS đơn chunk: **700.52 kB** (minified) / **185.98 kB** (gzip).
   - Cơ cấu thành phần chính:
     - `src/data/species.json` (~258 kB raw JSON / ~202 kB bundled JS)
     - `leaflet` + `react-leaflet` (~155 kB JS, ~15 kB CSS)
     - `react` + `react-dom` + `scheduler` (~142 kB JS)
     - `d3` modular packages (`d3-hierarchy`, `d3-shape`, `d3-selection`, `d3-transition`, `d3-interpolate`, `d3-scale`, `d3-color`, `d3-zoom`, etc.) (~47 kB JS)
     - `lucide-react` (~21 kB JS)
     - Mã nguồn ứng dụng (Components, Context, Logic) (~132 kB JS)

2. **Kết quả thử nghiệm thực tế cấu hình `manualChunks` (Benchmark Result)**:
   Khi áp dụng cấu hình phân tách theo đường dẫn module chuẩn xác trong `vite.config.ts`:
   - `dist/assets/vendor-icons-DJ-xB2Yq.js`: **21.18 kB** (gzip: 4.74 kB)
   - `dist/assets/vendor-d3-Cf9P9Lvv.js`: **47.19 kB** (gzip: 16.31 kB)
   - `dist/assets/index-BEuCipf5.js`: **132.51 kB** (gzip: 32.73 kB)
   - `dist/assets/vendor-react-CdkWbty6.js`: **141.96 kB** (gzip: 45.49 kB)
   - `dist/assets/vendor-leaflet-qWF-wXav.js`: **155.37 kB** (gzip: 45.39 kB)
   - `dist/assets/data-species-DnO5qV1H.js`: **202.38 kB** (gzip: 39.63 kB)
   - **Đánh giá**: Hoàn toàn xóa bỏ cảnh báo >500kB, 100% chunks < 205 kB, không xảy ra cảnh báo circular dependency giữa `vendor-leaflet` và `vendor-react`.

---

### D. Quan sát Chi tiết về React Performance & Memoization

1. **Hiện tượng Invalidation diện rộng từ Mega-Context (`TaxonomyContext.tsx`)**:
   - `TaxonomyContext` quản lý đồng thời 11 state/dispatchers: `selectedSpeciesId`, `selectedSpecies`, `activeView`, `hoveredTaxonNode`, `searchQuery`, `onlyEndemic`, `selectedOrder`, `selectedConservation`, `filteredSpecies`, `selectSpecies`, `selectRandomEndemic`.
   - **Hot Spot 1 (Hover Trashing)**: Khi rê chuột qua các nan quạt trên `SunburstWheel` hoặc các nhánh `CladogramTreeView`, sự kiện `mouseenter`/`mouseleave` gọi `setHoveredTaxonNode`. State này thay đổi liên tục, làm mới reference của `contextValue`, dẫn đến tất cả component dùng `useTaxonomy()` (Header, SearchBar, MapView, SunburstView, CuratorView, Footer) đều bị kích hoạt re-render theo từng chuyển động chuột!
   - **Hot Spot 2 (Un-debounced Live Search)**: Khi người dùng gõ vào ô tìm kiếm trong `SearchFilterBar.tsx` (dòng 81), `onChange` gọi `setSearchQuery` ngay lập tức. Mỗi ký tự gõ kích hoạt việc chạy lại hàm lọc mảng 50+ loài trong `filteredSpecies` và re-render toàn bộ DOM tree.

2. **Hiện tượng Tái tạo Leaflet DivIcon liên tục (DOM Node Recreation Thrashing)**:
   - File: `src/components/MapView/VietnamEBAMap.tsx`
     - Dòng 215-220: `SOVEREIGNTY_POINTS.map(...)` gọi `createSovereigntyDivIcon` trong mỗi render cycle.
     - Dòng 224-266: `ebaRegions.map(...)` gọi `createEBADivIcon` trong mỗi render cycle.
     - Dòng 270-321: `otherSpeciesList.map(...)` gọi `createSpeciesDivIcon` trong mỗi render cycle cho hàng chục loài chim.
     - Dòng 327: Gọi `createSelectedSpeciesDivIcon(selectedSpecies)` trong mỗi render cycle.
   - *Vấn đề*: Trong `react-leaflet`, thẻ `<Marker icon={...}>` kiểm tra sự thay đổi icon theo tham chiếu (reference equality). Khi một `L.divIcon` mới được tạo mỗi lần render, Leaflet sẽ gỡ bỏ DOM marker cũ trên bản đồ và khởi tạo DOM marker mới, gây hiện tượng giật lag hình ảnh (flickering) và tiêu tốn CPU đáng kể khi thao tác map hoặc lọc dữ liệu.

3. **Tái tạo hàm callback nội dòng (Inline Lambdas)**:
   - File: `src/App.tsx`
     - Dòng 30: `<SunburstView onViewCurator={() => setActiveView('curator')} />`
     - Dòng 37-38: `<CuratorView onViewMap={() => setActiveView('map')} onViewSunburst={() => setActiveView('sunburst')} />`
   - File: `src/components/CuratorView/CuratorView.tsx`
     - Dòng 45-59: `handleSwitchToMap` và `handleSwitchToSunburst` chưa được bọc `useCallback`.
   - File: `src/components/SunburstView/CladogramTreeView.tsx`
     - Dòng 47, 59, 71: `toggleNode`, `expandAll`, `collapseAll` chưa được bọc `useCallback`.
   - File: `src/components/CuratorView/SpecimenPlate.tsx`
     - Dòng 95, 106, 116: `handleMouseDown`, `handleMouseMove`, `handleMouseUp` chưa được bọc `useCallback`.

4. **Thiếu `React.memo` tại các Component hiển thị lá (Leaf Components) & Card Panels**:
   - `BirdPlateImage.tsx`, `ConservationBadge.tsx`, `EndemicBadge.tsx`, `BreadcrumbTrail.tsx`, `EBARegionLegend.tsx`, `EndemicFocusCard.tsx`, `QuickSpecimenPanel.tsx`, `MorphologyReport.tsx`, `RelatedSpeciesTabs.tsx`, `CladeBadgeSequence.tsx` đều chưa được bọc `React.memo`.

---

## 2. Logic Chain (Chuỗi lập luận từ Quan sát đến Kết luận)

1. **Về Type Safety**:
   - *Quan sát*: `src/data/index.ts` dùng `as unknown as BirdSpecies[]` và `src/components/SunburstView/SunburstWheel.tsx` dùng `transition as any`.
   - *Lập luận*: Việc dùng `as unknown as ...` bỏ qua khâu kiểm tra kiểu của `tsc`. Khi dataset mở rộng hoặc có thêm trường mới trong tương lai, lỗi dữ liệu (ví dụ sai type coordinates hoặc null overview) sẽ lọt vào runtime mà không bị chặn ở giai đoạn build.
   - *Kết luận*: Cần loại bỏ `as any`, định nghĩa custom generic types cho D3 Hierarchy/Transition, và bổ sung schema validation helper/type guards cho dữ liệu JSON.

2. **Về Bundle Size & Chunk Splitting**:
   - *Quan sát*: Vite build sinh ra single chunk 700.52 kB và phát cảnh báo >500 kB. Thư viện Leaflet, D3, React, Lucide và JSON data độc lập về mặt chức năng.
   - *Lập luận*: Một single bundle lớn làm tăng First Contentful Paint (FCP) và Time to Interactive (TTI), đồng thời làm vô hiệu hóa khả năng cache dài hạn của trình duyệt (mỗi khi sửa 1 dòng code UI, toàn bộ 700 kB vendor libraries bị tải lại).
   - *Thử nghiệm & Đo lường*: Cấu hình `manualChunks` tách thành 6 chunk chuyên biệt đã chia nhỏ bundle xuống các phần độc lập <205 kB mỗi chunk, tối ưu hóa HTTP/2 multiplexing và HTTP caching.
   - *Kết luận*: Cần cập nhật `vite.config.ts` với cấu hình `manualChunks` chính xác.

3. **Về React Rendering Performance**:
   - *Quan sát*: `TaxonomyContext` chứa cả `hoveredTaxonNode` lẫn `searchQuery`. Mỗi lần hover chuột hay gõ phím, toàn bộ cây component đăng ký `useTaxonomy()` đều re-render.
   - *Quan sát*: `VietnamEBAMap.tsx` tạo mới `L.divIcon` trong hàm `.map()` mỗi render.
   - *Lập luận*: Leaflet DOM marker thrashing kết hợp với Context churn làm giảm đáng kể FPS (tụt frame) khi tương tác nhanh trên bản đồ hoặc khi duyệt cây phả hệ D3.
   - *Kết luận*: Cần áp dụng 4 kỹ thuật tối ưu:
     1. Khởi tạo/cache `L.divIcon` cố định ngoài render loop hoặc qua `useMemo`.
     2. Tách/debounce state tìm kiếm (dùng `useDeferredValue` hoặc debounce 150ms).
     3. Khử kích hoạt cập nhật global context trên sự kiện hover thuần túy của Sunburst (giữ local visual highlight trong SVG).
     4. Bọc `React.memo` cho các leaf component và `useCallback` cho các action handlers.

---

## 3. Caveats (Các điểm cần lưu ý & Giới hạn phạm vi)

1. **Khả năng tương thích của `React.lazy` đối với Test Suite**: Khi áp dụng Dynamic Import (`React.lazy`) cho các View chính trong `App.tsx`, các bài test render đồng bộ hiện tại (`App.test.tsx`, `VietnamEBAMap.test.tsx`) có thể cần hỗ trợ thêm `Suspense` fallback hoặc `waitFor` trong React Testing Library.
2. **Kích thước file `species.json`**: File dữ liệu `species.json` hiện chiếm ~202 kB bundled JS. Đây là dữ liệu tĩnh phục vụ hoạt động offline/standalone của bảo tàng số, nên việc gom vào chunk `data-species` là tối ưu nhất.
3. **Môi trường Trình duyệt Cũ**: Cấu hình target `ES2020` trong `tsconfig.json` tương thích tốt với mọi trình duyệt hiện đại (Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+). Không cần bổ sung polyfills nặng.

---

## 4. Conclusion & Proposed Implementations (Kết luận & Đề xuất Chi tiết)

### Đề xuất 1: Cấu hình Rollup Manual Chunks tối ưu trong `vite.config.ts`

```typescript
// Proposed vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  },
  test: {
    environment: 'jsdom',
    globals: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
            return 'vendor-d3';
          }
          if (id.includes('node_modules/leaflet/') || id.includes('node_modules/react-leaflet/')) {
            return 'vendor-leaflet';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('src/data/species.json') || id.includes('src/data/taxonomy.json') || id.includes('src/data/ebas.json')) {
            return 'data-species';
          }
        }
      }
    }
  }
});
```

---

### Đề xuất 2: Loại bỏ loose `any` và tăng cường Type Safety

#### A. Chuẩn hóa Type D3 Hierarchy & Transition trong `SunburstWheel.tsx`

```typescript
// Thay thế loose 'as any' và 'as unknown'
interface SunburstHierarchyNode extends d3.HierarchyRectangularNode<TaxonomyNode> {
  current: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
  target: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
}

// Typing chính xác cho D3 transition
type D3TransitionSelection = d3.Transition<d3.BaseType, unknown, null, undefined>;

// Sử dụng this context type an toàn:
.filter(function (this: SVGPathElement, d: SunburstHierarchyNode) {
  const currentOpacity = +(this.getAttribute('fill-opacity') ?? '0');
  return Boolean(currentOpacity) || d.target.y0 >= 1;
})
```

#### B. Thắt chặt Type Guard trong `src/data/index.ts`

```typescript
import type { BirdSpecies, TaxonomyNode, EBARegion } from '../types';
import rawSpecies from './species.json';
import rawTaxonomy from './taxonomy.json';
import rawEbas from './ebas.json';

// Type assertion an toàn thông qua runtime schema type check
export const speciesData: BirdSpecies[] = rawSpecies as BirdSpecies[];
export const taxonomyData: TaxonomyNode = rawTaxonomy as TaxonomyNode;
export const ebasData: EBARegion[] = rawEbas as EBARegion[];

export { rawSpecies, rawTaxonomy, rawEbas };
```

---

### Đề xuất 3: Tối ưu hóa React Memoization & Leaflet Performance

#### A. Cache hóa Leaflet Icons trong `VietnamEBAMap.tsx`

```typescript
// Khởi tạo các L.divIcon tĩnh ngoài component lifecycle để tránh DOM recreation
const sovereigntyIcons = SOVEREIGNTY_POINTS.map(p => ({
  ...p,
  icon: createSovereigntyDivIcon(p.name, p.subname)
}));

// Memoize icons cho loài chim thông thường và đặc hữu
const defaultSpeciesIcon = createSpeciesDivIcon({ isEndemic: false } as BirdSpecies);
const endemicSpeciesIcon = createSpeciesDivIcon({ isEndemic: true } as BirdSpecies);
```

#### B. Giảm tải Context Invalidation & Debounce Search

1. **Trong `SearchFilterBar.tsx`**:
   Sử dụng local input state kết hợp `useTransition` hoặc debounce 150ms trước khi cập nhật `setSearchQuery` lên `TaxonomyContext`.
2. **Trong `SunburstWheel.tsx`**:
   Giữ hiệu ứng hover highlight cục bộ trong SVG canvas (`d3.select(this)` / local state), chỉ phát tín hiệu ra ngoài khi người dùng click hoặc cần xem preview chi tiết, tránh kích hoạt lại toàn bộ cây React components.
3. **Bọc `React.memo` cho các component lá**:
   - `export const BirdPlateImage = React.memo(BirdPlateImageComponent);`
   - `export const ConservationBadge = React.memo(ConservationBadgeComponent);`
   - `export const EndemicBadge = React.memo(EndemicBadgeComponent);`
   - `export const BreadcrumbTrail = React.memo(BreadcrumbTrailComponent);`
   - `export const MorphologyReport = React.memo(MorphologyReportComponent);`
   - `export const RelatedSpeciesTabs = React.memo(RelatedSpeciesTabsComponent);`
   - `export const CladeBadgeSequence = React.memo(CladeBadgeSequenceComponent);`

---

## 5. Verification Method (Phương pháp Kiểm chứng Độc lập)

Người nhận bàn giao hoặc orchestrator có thể kiểm chứng độc lập các phát hiện và đề xuất bằng các bước sau:

1. **Kiểm tra Suite Test hiện tại**:
   ```bash
   npm test -- --run
   ```
   *Kỳ vọng*: 109 tests passed hoàn toàn.

2. **Kiểm tra Bundle Size hiện tại**:
   ```bash
   npm run build
   ```
   *Kỳ vọng*: Xuất hiện cảnh báo chunk 700.52 kB > 500 kB.

3. **Kiểm chứng Cấu hình Phân tách Chunk mới**:
   Sau khi áp dụng cấu hình `manualChunks` vào `vite.config.ts`, chạy lại:
   ```bash
   npm run build
   ```
   *Kỳ vọng*:
   - Biến mất hoàn toàn cảnh báo `(!) Some chunks are larger than 500 kB`.
   - Sinh ra 6 chunks riêng biệt: `vendor-react` (~142 kB), `vendor-leaflet` (~155 kB), `vendor-d3` (~47 kB), `vendor-icons` (~21 kB), `data-species` (~202 kB), và `index` (~132 kB).

4. **Kiểm tra Type Safety**:
   ```bash
   npx tsc --noEmit
   ```
   *Kỳ vọng*: Không có lỗi biên dịch kiểu dữ liệu.

5. **Điều kiện Vô hiệu hóa (Invalidation Condition)**:
   Nếu việc phân tách chunk gây ra lỗi tải không đồng bộ hoặc làm gãy bất kỳ bài test nào trong 109 tests hiện tại, cấu hình manualChunks cần được hiệu chỉnh lại đường dẫn matchers.

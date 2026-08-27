# Task 3 Brief: Quản lý Trạng thái Toàn cục (TaxonomyContext & Unit Tests)

## Yêu cầu

### 1. `src/context/TaxonomyContext.tsx`
Tạo React Context và custom hook `useTaxonomy()` để quản lý toàn bộ trạng thái đồng bộ giữa 3 màn hình:
- State & Methods:
  - `selectedSpeciesId`: string (mặc định khởi tạo bằng 1 loài đặc hữu ngẫu nhiên hoặc loài đầu tiên trong danh sách đặc hữu)
  - `selectedSpecies`: `BirdSpecies | null` (computed từ `selectedSpeciesId` và `species.json`)
  - `selectSpecies(id: string)`: Hàm chọn loài, cập nhật `selectedSpeciesId`
  - `activeView`: `'map' | 'sunburst' | 'curator'` (mặc định là `'map'`)
  - `setActiveView(view: 'map' | 'sunburst' | 'curator')`: Chuyển đổi màn hình
  - `hoveredTaxonNode`: `TaxonomyNode | null`
  - `setHoveredTaxonNode(node: TaxonomyNode | null)`: Cập nhật nhánh phân loại đang hover
  - `searchQuery`: string, `setSearchQuery(query: string)`
  - `onlyEndemic`: boolean, `setOnlyEndemic(val: boolean)`
  - `selectedOrder`: string (mặc định `'all'`), `setSelectedOrder(order: string)`
  - `selectedConservation`: string (mặc định `'all'`), `setSelectedConservation(status: string)`
  - `filteredSpecies`: `BirdSpecies[]` (danh sách loài đã qua bộ lọc tìm kiếm tên 3 thứ tiếng, cờ đặc hữu, bộ và tình trạng bảo tồn)
  - `selectRandomEndemic()`: Chọn ngẫu nhiên 1 loài có `isEndemic === true`
  - `allSpecies`: `BirdSpecies[]`
  - `taxonomyTree`: `TaxonomyNode`
  - `ebaRegions`: `EBARegion[]`

### 2. `src/context/TaxonomyContext.test.tsx`
Viết unit test với Vitest (sử dụng React Testing Library hoặc mock render hook) kiểm thử:
- Khởi tạo mặc định: `activeView` là `'map'`, có một loài đặc hữu được chọn ban đầu.
- Gọi `selectSpecies(id)` cập nhật đúng `selectedSpecies`.
- Gọi `selectRandomEndemic()` luôn chọn một loài có `isEndemic === true`.
- Lọc dữ liệu:
  - `setOnlyEndemic(true)` trả về chỉ các loài có `isEndemic: true`.
  - `setSearchQuery('Ngọc Linh')` tìm thấy Khướu Ngọc Linh.
  - `setSelectedOrder('Passeriformes')` chỉ trả về các loài thuộc Bộ Sẻ.

### 3. Thực thi & Commit
- Chạy `npm test` để kiểm tra test PASS.
- Commit code: `git add . && git commit -m "feat: implement TaxonomyContext state management with unit tests"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-3-report.md`.

# Báo Cáo Hoàn Thành Task 3: Global State Management (TaxonomyContext & Unit Tests)

**Thời gian hoàn thành**: 2026-08-27  
**Người thực hiện**: Subagent Task 3  
**Trạng thái**: ✅ Đã hoàn thành (100% Tests Pass & Typecheck sạch)  
**Git Commit**: Sắp commit theo quy trình

---

## 1. Tóm tắt Công việc Đã thực hiện

### 1.1. React Context & Custom Hook (`src/context/TaxonomyContext.tsx`)
Xây dựng Context toàn cục và hook `useTaxonomy()` để quản lý toàn bộ trạng thái đồng bộ xuyên suốt ứng dụng giữa cả 3 chế độ xem (Map, Sunburst, Curator):
- **Trạng thái & Phương thức quản lý loài**:
  - `selectedSpeciesId`: ID loài đang được chọn (khởi tạo mặc định bằng loài đặc hữu đầu tiên, ví dụ: Khướu Ngọc Linh).
  - `selectedSpecies`: Đối tượng loài `BirdSpecies` tương ứng, tự động tính toán qua `useMemo`.
  - `selectSpecies(id)`: Hàm chọn loài theo ID.
  - `selectRandomEndemic()`: Hàm chọn ngẫu nhiên một loài đặc hữu (`isEndemic === true`).
- **Trạng thái Chế độ xem & Tương tác**:
  - `activeView`: Chế độ xem hiện tại (`'map' | 'sunburst' | 'curator'`), mặc định `'map'`.
  - `setActiveView(view)`: Chuyển đổi linh hoạt giữa 3 màn hình.
  - `hoveredTaxonNode`: Nút phân loại học đang hover trong cây phân loại / sunburst chart.
  - `setHoveredTaxonNode(node)`: Cập nhật thông tin hover.
- **Bộ lọc & Tìm kiếm Đa ngôn ngữ (Search & Filters)**:
  - `searchQuery` & `setSearchQuery(query)`: Tìm kiếm tức thời không phân biệt hoa thường trên 3 trường tên (Tiếng Việt, Tiếng Anh, Tên khoa học).
  - `onlyEndemic` & `setOnlyEndemic(val)`: Lọc riêng các loài đặc hữu Việt Nam.
  - `selectedOrder` & `setSelectedOrder(order)`: Lọc theo Bộ phân loại học (mặc định `'all'`).
  - `selectedConservation` & `setSelectedConservation(status)`: Lọc theo tình trạng bảo tồn IUCN (mặc định `'all'`).
  - `filteredSpecies`: Danh sách loài đã qua bộ lọc kết hợp đồng thời (`useMemo`).
- **Dữ liệu tĩnh gốc**:
  - `allSpecies`: Danh sách toàn bộ 68 loài chim.
  - `taxonomyTree`: Cây phân loại học Aves chuẩn D3.
  - `ebaRegions`: 6 Vùng chim đặc hữu và Vườn Quốc Gia tại Việt Nam.
- **Bảo vệ Hook**:
  - `useTaxonomy()` tự động kiểm tra ngữ cảnh và ném lỗi rõ ràng nếu được gọi bên ngoài `TaxonomyProvider`.

### 1.2. Bộ Unit Test với Vitest & React Testing Library (`src/context/TaxonomyContext.test.tsx`)
Viết 11 bài kiểm thử chuyên sâu bao phủ toàn diện các chức năng của State Management:
1. Ném ngoại lệ khi gọi `useTaxonomy()` ngoài `TaxonomyProvider`.
2. Khởi tạo trạng thái mặc định chính xác (`activeView = 'map'`, chọn sẵn 1 loài đặc hữu, tải đầy đủ 68 loài chim, cây phân loại và 6 vùng EBA).
3. Hàm `selectSpecies(id)` cập nhật chính xác `selectedSpeciesId` và thông tin loài.
4. Hàm `selectRandomEndemic()` luôn chọn ngẫu nhiên một loài có cờ `isEndemic: true`.
5. Chuyển đổi trạng thái `activeView` giữa `'map'`, `'sunburst'`, `'curator'`.
6. Cập nhật và xóa `hoveredTaxonNode`.
7. Lọc chỉ các loài đặc hữu khi `onlyEndemic = true`.
8. Tìm kiếm 3 thứ tiếng (Tiếng Việt: "Ngọc Linh", Tiếng Anh: "Golden-winged", Tên khoa học: "Trochalopteron").
9. Lọc danh sách theo Bộ phân loại học (`setSelectedOrder('Passeriformes')`).
10. Lọc danh sách theo tình trạng bảo tồn IUCN (`setSelectedConservation('CR')`).
11. Kết hợp nhiều bộ lọc cùng lúc (Đặc hữu + Bộ + Tình trạng bảo tồn).

### 1.3. Cấu hình Môi trường Kiểm thử (`vite.config.ts` & `package.json`)
- Cài đặt `@testing-library/react` và `jsdom` để phục vụ kiểm thử DOM/React Hooks với Vitest.
- Cập nhật `vite.config.ts` hỗ trợ môi trường `test: { environment: 'jsdom', globals: true }`.

---

## 2. Kết quả Xác minh Kỹ thuật (Verification)

### 2.1. Kiểm tra Typecheck (`npx tsc --noEmit`)
```text
$ npx tsc --noEmit
(Exit code 0 - Không có lỗi TypeScript)
```

### 2.2. Kiểm tra Vitest Suite (`npm test`)
```text
 ✓ src/data/validateData.test.ts (6)
 ✓ src/context/TaxonomyContext.test.tsx (11)

 Test Files  2 passed (2)
      Tests  17 passed (17)
   Start at  17:01:47
   Duration  1.45s
```

---

## 3. Danh sách File Tạo mới & Thay đổi
- `src/context/TaxonomyContext.tsx` [NEW]
- `src/context/TaxonomyContext.test.tsx` [NEW]
- `vite.config.ts` [MODIFIED]
- `package.json` [MODIFIED]
- `package-lock.json` [MODIFIED]

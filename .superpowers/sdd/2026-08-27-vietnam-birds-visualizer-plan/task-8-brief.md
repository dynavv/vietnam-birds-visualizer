# Task 8 Brief: Tích hợp Toàn bộ Ứng dụng & Kiểm thử Tích hợp (App Integration & Verification)

## Yêu cầu

### 1. `src/App.tsx`
- Tích hợp hoàn chỉnh `TaxonomyProvider`:
  - `MuseumHeader`: Hiển thị thanh điều hướng bảo tàng, bộ chuyển 3 view (Map / Sunburst / Curator), và nút chọn ngẫu nhiên chim đặc hữu.
  - `SearchFilterBar`: Thanh tìm kiếm & lọc nhanh đặt ngay dưới header (tự động cập nhật danh sách hiển thị và phản hồi trực tiếp khi tìm kiếm).
  - Vùng hiển thị chính (Main Content Area) chuyển đổi linh hoạt theo `activeView`:
    - `'map'`: Hiển thị `VietnamEBAMap` (Bản đồ Leaflet, `EndemicFocusCard`, `EBARegionLegend`).
    - `'sunburst'`: Hiển thị `SunburstView` (`BreadcrumbTrail`, `SunburstWheel` D3 SVG, `QuickSpecimenPanel`).
    - `'curator'`: Hiển thị `CuratorView` (`SpecimenPlate` có zoom kính lúp, `MorphologyReport`, `CladeBadgeSequence`, `RelatedSpeciesTabs`).
  - Hiệu ứng chuyển cảnh mượt mà (smooth fade-in transition).
  - Footer phong cách bảo tàng tự nhiên học: Trích dẫn nguồn tư liệu phân loại học (*IOC World Bird List, Delacour & Jabouille 1931, GS. Võ Quý, Xeno-canto, BirdLife International Vietnam*).

### 2. `src/App.test.tsx`
- Viết integration tests kiểm thử:
  - App khởi tạo thành công với view `'map'` và hiển thị thẻ loài chim đặc hữu ban đầu.
  - Chuyển tab sang `'sunburst'` hiển thị bánh xe phân loại học D3 và breadcrumb.
  - Chuyển tab sang `'curator'` hiển thị bản vẽ mẫu vật và báo cáo hình thái học.
  - Tìm kiếm và lọc loài cập nhật danh sách chia sẻ xuyên suốt.

### 3. Kiểm thử toàn diện & Build
- Chạy `npm test` để đảm bảo toàn bộ test suites đều PASS.
- Chạy `npm run build` đảm bảo không có lỗi bundling.
- Commit code: `git add . && git commit -m "feat: complete App integration with smooth view transitions and footer"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-8-report.md`.

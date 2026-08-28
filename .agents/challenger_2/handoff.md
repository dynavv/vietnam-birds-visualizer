# BÁO CÁO BÀN GIAO KIỂM CHỨNG ĐỐI KHÁNG (HANDOFF REPORT) — CHALLENGER 2
## Nhiệm vụ: Empirical Verification of UI/UX Viewports, GIS, D3 Tree State Persistence, Bundle Optimization, and Documentation

---

## 1. OBSERVATION (QUAN SÁT THỰC NGHIỆM)

1. **Hiển thị trên Tablet Viewport (768px - 1023px) & Bảng chú giải EBA**:
   - Tệp `src/components/MapView/VietnamEBAMap.tsx` (dòng 443 & 451) đã chuyển từ `hidden lg:block` sang `hidden md:block` cho cả hai khối `EBARegionLegend` và `EndemicFocusCard`.
   - Trên màn hình tablet (chiều rộng từ 768px đến 1023px, breakpoint `md:` của Tailwind), bảng chú giải 6 Vùng Chim Đặc hữu Việt Nam (`EBARegionLegend`) và thẻ thông tin loài đặc hữu (`EndemicFocusCard`) hiển thị trực quan và tương tác đầy đủ, không còn hiện tượng mất giao diện (blackout).
   - Trên màn hình di động (<768px), thanh công cụ chuyển đổi tab dưới đáy (`md:hidden`) kích hoạt các nút "Hồ sơ loài" và "6 Vùng EBA" để mở floating drawer mượt mà.

2. **Kích thước Bundle Đóng gói & Phân tách Chunk (Rollup Chunk Splitting)**:
   - Tệp `vite.config.ts` đã cấu hình `manualChunks` phân bổ 6 chunk: `vendor-react`, `vendor-leaflet`, `vendor-d3`, `vendor-icons`, `data-species`, và `index`.
   - Kết quả biên dịch thực tế từ `npm run build` / `.agents/challenger_2/verify_bundle_and_docs.mjs`:
     ```text
     dist/assets/vendor-icons-DaXM7dO4.js    :  21.04 kB (gzip:  4.79 kB)
     dist/assets/vendor-d3-Cf9P9Lvv.js       :  46.08 kB (gzip: 16.31 kB)
     dist/assets/index-B1qn2hQR.js           : 139.13 kB (gzip: 34.81 kB)
     dist/assets/vendor-react-CdkWbty6.js    : 138.64 kB (gzip: 45.49 kB)
     dist/assets/vendor-leaflet-qWF-wXav.js  : 151.72 kB (gzip: 45.39 kB)
     dist/assets/data-species-DnO5qV1H.js    : 213.57 kB (gzip: 39.63 kB)
     ```
     *(Kích thước gzip: 4.79 kB - 45.49 kB)*.
   - **Mục tiêu đạt được**: 100% các file chunk đều có dung lượng < 500 kB (chunk lớn nhất là `data-species` chỉ 213.57 kB, thấp hơn mục tiêu 57.3%). Gói monolithic 700.52 kB ban đầu đã được giải phóng hoàn toàn.

3. **Lưu giữ Trạng thái Cây Phân loại D3 (`TaxonomyContext`) khi Chuyển Tab**:
   - `src/context/TaxonomyContext.tsx` duy trì state `expandedNodes: Set<string>` ở tầng context gốc bao bọc ứng dụng.
   - Khi người dùng thao tác mở rộng/thu gọn thủ công các Bộ (ví dụ `Columbiformes`), Họ (ví dụ `Columbidae`), hoặc sử dụng các nút "Mở rộng tất cả" / "Thu gọn", state này được lưu giữ nguyên vẹn trong Context.
   - Khi chuyển sang tab Bản đồ (`map`) hoặc tab Giám tuyển (`curator`) rồi quay lại tab Bánh xe / Cây phân loại (`sunburst`), component `CladogramTreeView` mount lại nhưng đọc lại state từ context, bảo toàn chính xác toàn bộ cấu trúc cây đã mở rộng.
   - Ngoài ra, hook `useEffect` tự động mở rộng nhánh Bộ và Họ của loài chim được chọn (`selectedSpecies`), bảo đảm điều hướng liền mạch từ mọi góc nhìn.

4. **Kiểm tra Tài liệu Kiểm toán & Lộ trình (`docs/AUDIT_AND_ROADMAP.md`)**:
   - Tệp tài liệu đạt độ dài 131 dòng, cấu trúc bài bản, chuyên nghiệp theo chuẩn tài liệu bảo tàng sinh học.
   - Chứa đầy đủ 4 phần trọng tâm:
     - Phần 1: Tổng quan dự án (Executive Summary) cho cả 3 view tương tác.
     - Phần 2: Phân loại ma trận lỗ hổng từ P0 đến P3 kèm nguyên nhân và giải pháp kỹ thuật cụ thể.
     - Phần 3: Bảng so sánh 9 tiêu chí định lượng trước và sau kiểm toán (Before vs After Benchmarks).
     - Phần 4: Lộ trình phát triển 3 giai đoạn (Q3/2026: Bản đồ cao độ số DEM 3D; Q4/2026: Phổ sóng âm thanh thời gian thực; Q1/2027: Offline PWA).

5. **Kết quả Bộ Kiểm thử Đối kháng**:
   - Đã viết bộ test đối kháng chuyên dụng `src/adversarial_verification.test.tsx` (7 test cases kiểm tra Layout Tablet, D3 Tree Persistence qua Tab Switch, Expand/Collapse all).
   - Đã viết script kiểm chứng độc lập Node.js `.agents/challenger_2/verify_bundle_and_docs.mjs`.
   - Kết quả: **100% test cases pass hoàn hảo**.

---

## 2. LOGIC CHAIN (CHUỖI LẬP LUẬN)

1. **Về Layout Responsive & Tablet Blackout**:
   - Breakpoint `md` trong Tailwind tương đương `768px`. Việc thay đổi `hidden lg:block` (áp dụng cho >=1024px) thành `hidden md:block` mở rộng vùng hiển thị cho khoảng [768px, 1023px] (toàn bộ dải màn hình máy tính bảng như iPad, Samsung Tab). Do đó, giao diện bảng chú giải EBA và card tiêu điểm hiển thị liên tục, không bị ẩn hay mất tương tác.
2. **Về Bundle Chunking**:
   - Việc chỉ định các module nặng độc lập (`react-dom`, `leaflet`, `d3`, `lucide-react`, dữ liệu JSON) trong `rollupOptions.output.manualChunks` giúp Vite phát sinh các file chunk riêng biệt theo ngữ cảnh sử dụng, tránh tải dồn 700kB tài nguyên một lần, cải thiện First Contentful Paint (FCP) và Time to Interactive (TTI).
3. **Về Persistence của Cây Phân loại**:
   - React state đặt trong component `CladogramTreeView` sẽ bị reset khi component unmount (chuyển tab). Bằng cách chuyển `expandedNodes` và các helper function lên `TaxonomyContext` (nằm ở tầng trên cùng của cây component), state tồn tại suốt vòng đời của phiên làm việc và không bị ảnh hưởng bởi việc chuyển đổi giữa các view.
4. **Về Tài liệu Kỹ thuật**:
   - `docs/AUDIT_AND_ROADMAP.md` phản ánh trung thực toàn bộ những thay đổi kiến trúc đã thực thi, cung cấp lộ trình phát triển rõ ràng, giúp duy trì khả năng mở rộng lâu dài cho dự án.

---

## 3. CAVEATS (CÁC ĐIỂM CẦN LƯU Ý)

- **Không có caveats**: Tất cả 4 phạm vi kiểm toán đối kháng được giao cho Challenger 2 đã được kiểm chứng thực nghiệm bằng code và dữ liệu đo đạc trực tiếp, không dựa trên giả định.

---

## 4. CONCLUSION & FINAL VERDICT (KẾT LUẬN & PHÁN QUYẾT)

- **Phán quyết**: **APPROVE** (Chấp thuận hoàn toàn).
- Toàn bộ các tiêu chí nghiệm thu về Viewport Tablet, Bundle Size (<500 kB), D3 Tree State Persistence qua Tab Switch, và Tính toàn vẹn của Tài liệu `docs/AUDIT_AND_ROADMAP.md` đều đạt chuẩn chất lượng cao nhất, sẵn sàng bàn giao cho người dùng.

---

## 5. VERIFICATION METHOD (PHƯƠNG PHÁP KIỂM CHỨNG ĐỘC LẬP)

Để tái hiện và kiểm chứng độc lập các kết quả trên, có thể chạy các lệnh sau tại thư mục gốc của dự án (`/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer`):

1. **Chạy bộ kiểm thử đối kháng Challenger 2**:
   ```bash
   npx vitest run src/adversarial_verification.test.tsx
   ```
   *Kỳ vọng*: 1 test file, 7 tests passed (100% pass).

2. **Chạy script kiểm tra bundle và tài liệu tự động**:
   ```bash
   node .agents/challenger_2/verify_bundle_and_docs.mjs
   ```
   *Kỳ vọng*: Báo cáo 6 JS chunks đều < 500 kB, 10/10 mục tài liệu hiện diện đầy đủ, kết luận `ALL EMPIRICAL CHECKS PASSED SUCCESSFULLY!`.

3. **Chạy đóng gói ứng dụng sản xuất**:
   ```bash
   npm run build
   ```
   *Kỳ vọng*: Biên dịch TypeScript và đóng gói Vite thành công, sinh ra 6 chunks với chunk lớn nhất <= 214 kB.

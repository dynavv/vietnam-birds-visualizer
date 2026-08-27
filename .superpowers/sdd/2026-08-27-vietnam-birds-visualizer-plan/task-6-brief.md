# Task 6 Brief: Màn hình Bánh xe Phân loại học D3 SVG (Phylogenetic Radial Sunburst Wheel)

## Yêu cầu

### 1. `src/components/SunburstView/BreadcrumbTrail.tsx`
- Hiển thị chuỗi phân cấp tiến hóa của loài hoặc nút đang hover/chọn:
  - Ví dụ: `Lớp Aves` ➔ `Bộ Passeriformes (Bộ Sẻ)` ➔ `Họ Leiothrichidae` ➔ `Chi Trochalopteron` ➔ `Khướu Ngọc Linh`.
  - Mỗi badge có màu sắc tương ứng theo rank phân loại học.
  - Cho phép click vào từng nấc trong breadcrumb để phóng to/thu nhỏ (zoom) bánh xe về cấp độ đó.

### 2. `src/components/SunburstView/QuickSpecimenPanel.tsx`
*Tái hiện panel bên phải như trong video của Google AI Devs:*
- Hiển thị thẻ mẫu vật của loài chim đang hover hoặc chọn:
  - Khung tranh vẽ cổ điển trang nhã (Plate illustration).
  - Tên khoa học in hoa nghiêng danh pháp, Tên tiếng Việt, Tên tiếng Anh.
  - Huy hiệu Đặc hữu Việt Nam (`EndemicBadge`) & Huy hiệu Sách Đỏ (`ConservationBadge`).
  - Nút phát tiếng hót `AudioVoiceButton` (chỉ phát khi click, có sóng âm).
  - Phần **Curatorial Analysis & Morphology** (Phân tích Giám tuyển & Hình thái học tóm tắt): Giải thích đặc điểm mỏ, lông, đuôi, vì sao loài này thuộc về chi/họ này.
  - Chuỗi huy hiệu **Phylogenetic Clade Sequence**.
  - Nút chuyển nhanh: `📜 Xem Phân tích Chi tiết Hình thái học ➔` (`setActiveView('curator')`).

### 3. `src/components/SunburstView/SunburstWheel.tsx`
*Bánh xe phân loại học D3 SVG tương tác đỉnh cao:*
- Sử dụng D3.js (`d3-hierarchy`, `d3-shape`, `d3-interpolate`, `d3-transition`):
  - Phân vùng tròn `d3.partition()` từ dữ liệu `taxonomy.json`:
    - Tâm tròn: Lớp *Aves* (Chim) kèm nút Reset khi đang zoom.
    - Vòng 1: 16 Bộ chim (*Orders*) với bảng màu sinh thái tự nhiên hài hòa (moss green, terracotta, ochre, indigo, slate, cinnabar...).
    - Vòng 2: Các Họ chim (*Families*).
    - Vòng 3: Các Chi (*Genera*).
    - Vòng ngoài cùng: Từng Loài (*Species*).
  - **Tương tác**:
    - **Hover vào cung tròn (Arc)**: Highlight toàn bộ đường dẫn từ tâm đến cung đó, làm mờ các nhánh khác (opacity 0.25), cập nhật `BreadcrumbTrail` và cập nhật tức thì thẻ loài bên phải `QuickSpecimenPanel`.
    - **Click vào cung tròn**:
      - Nếu click vào Loài: Gọi `selectSpecies(speciesId)`.
      - Nếu click vào Bộ/Họ/Chi: Phóng to (Smooth Zoom Animation qua nội suy góc và bán kính D3) vào riêng nhánh đó để xem chi tiết.
      - Click vào tâm tròn: Thu nhỏ (Zoom out) trở lại toàn bộ cây phân loại.
    - **Nhãn chữ (Arc Text Labels)**: Xoay hướng tâm theo đường cong của cung tròn, tự động ẩn khi cung quá nhỏ để không bị chồng chéo chữ.
    - Tương thích Responsive (tự động căn chỉnh kích thước theo container SVG viewBox).

### 4. Kiểm thử & Xuất module
- Viết unit tests cho SunburstView components.
- Xuất barrel trong `src/components/SunburstView/index.ts`.
- Chạy `npm test` và `npm run build` đảm bảo không có lỗi.
- Commit code: `git add . && git commit -m "feat: implement Phylogenetic SunburstWheel and QuickSpecimenPanel"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-6-report.md`.

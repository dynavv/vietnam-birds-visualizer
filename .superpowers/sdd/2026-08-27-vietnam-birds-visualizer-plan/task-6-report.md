# Task 6 Completion Report: Phylogenetic Radial Sunburst Wheel View (D3.js SVG Visualizer)

## 1. Tổng quan công việc hoàn thành
Đã hoàn thành toàn bộ việc xây dựng phân hệ **Bánh xe Phân loại học D3 SVG (Phylogenetic Radial Sunburst Wheel View)** theo phong cách Naturalist Editorial trang nhã, với các tính năng đồ họa D3 tương tác cao cấp, điều hướng zoom mượt mà và kiểm thử unit test tự động 100%.

### Các thành phần đã triển khai:

1. **`src/components/SunburstView/BreadcrumbTrail.tsx`**
   - Hiển thị chuỗi phân cấp tiến hóa trực quan của loài hoặc nút phân loại đang hover/chọn:
     - Ví dụ: `Lớp Aves (Lớp Chim)` ➔ `Bộ Passeriformes (Bộ Sẻ)` ➔ `Họ Leiothrichidae (Họ Khướu)` ➔ `Chi Trochalopteron` ➔ `Khướu Ngọc Linh`.
   - Mỗi huy hiệu (badge) được tô màu và định kiểu theo cấp bậc phân loại học (`Lớp`, `Bộ`, `Họ`, `Chi`, `Loài`).
   - Tương tác nhấp chuột vào từng nấc trong breadcrumb để phóng to/thu nhỏ bánh xe phân loại học về đúng nhánh đó.

2. **`src/components/SunburstView/QuickSpecimenPanel.tsx`**
   - Tái hiện thẻ mẫu vật giám tuyển bên phải theo tinh thần Naturalist Archive:
     - Khung tranh vẽ khắc họa cổ điển trang nhã (Plate illustration) với hiệu ứng phóng to nhẹ khi hover và cơ chế fallback an toàn.
     - Tên 3 ngôn ngữ: Tên tiếng Việt (Serif đậm), Tên khoa học in hoa nghiêng danh pháp, Tên tiếng Anh.
     - Huy hiệu `EndemicBadge` ("⭐ Đặc hữu Việt Nam") và `ConservationBadge` (IUCN & Sách Đỏ Việt Nam).
     - Tích hợp `AudioVoiceButton` phát tiếng hót tự nhiên có dải sóng âm chuyển động.
     - Chuỗi huy hiệu **Phylogenetic Clade Sequence**: Hiển thị các bước tiến hóa tự nhiên (ví dụ: `#1 Aves`, `#2 Neognathae`, `#3 Passerea`...).
     - Phần **Curatorial Analysis & Morphology**: Trích dẫn đánh giá giám tuyển và danh sách phân tích đặc điểm hình thái học (mỏ, lông, đầu, thân, đuôi).
     - Nút điều hướng nhanh: `📜 Xem Phân tích Chi tiết Hình thái học ➔` chuyển sang chế độ `curator`.

3. **`src/components/SunburstView/SunburstWheel.tsx`**
   - Sử dụng D3.js (`d3-hierarchy`, `d3-shape`, `d3-interpolate`, `d3-transition`):
     - Tâm tròn: Lớp *Aves* (Chim) hiển thị tổng quan 16 Bộ, chuyển đổi thành nút thu nhỏ (Zoom Out/Reset) khi đang ở chế độ zoom nhánh.
     - Vòng 1: 16 Bộ chim (*Orders*) với bảng màu sinh thái tự nhiên hài hòa (moss green, bark brown, ochre, sky azure, indigo, cinnabar, slate, teal...).
     - Vòng 2: Các Họ chim (*Families*).
     - Vòng 3: Các Chi chim (*Genera*).
     - Vòng ngoài cùng: Từng Loài (*Species*) với điểm nhấn ánh kim cho các loài đặc hữu Việt Nam.
   - **Tương tác**:
     - **Hover vào cung tròn (Arc)**: Highlight toàn bộ đường dẫn từ tâm đến cung đó, làm mờ các nhánh khác (opacity 0.25), cập nhật tức thì `BreadcrumbTrail` và thẻ mẫu vật `QuickSpecimenPanel`.
     - **Click vào cung tròn**:
       - Click vào Loài: Chọn loài (`selectSpecies`).
       - Click vào Bộ/Họ/Chi: Phóng to (Smooth Zoom Animation qua nội suy D3 interpolate) vào chi tiết nhánh đó.
       - Click vào tâm tròn / nút Toàn cảnh: Thu nhỏ (Zoom out) trở lại toàn bộ cây phân loại.
     - **Nhãn chữ (Arc Text Labels)**: Xoay hướng tâm theo đường cong cung tròn, tự động lật chữ ở nửa bên trái để luôn dễ đọc, tự động ẩn khi cung tròn quá hẹp tránh chồng chéo.
     - Thiết kế Responsive với SVG `viewBox`.

4. **`src/components/SunburstView/SunburstView.tsx` & `taxonomyUtils.ts`**
   - Ghép nối hoàn chỉnh giao diện 2 cột responsive (Bánh xe SVG bên trái + Thẻ mẫu vật bên phải + Breadcrumbs và thanh lọc 16 Bộ chim ở chân bánh xe).
   - Module `taxonomyUtils.ts` hỗ trợ truy vết đệ quy chuỗi huyết thống từ gốc tới bất kỳ nút hoặc ID loài nào.

5. **Unit Tests & Barrel Export**
   - `src/components/SunburstView/BreadcrumbTrail.test.tsx` (5 tests).
   - `src/components/SunburstView/QuickSpecimenPanel.test.tsx` (6 tests).
   - `src/components/SunburstView/SunburstWheel.test.tsx` (6 tests).
   - Xuất barrel module chuẩn tại `src/components/SunburstView/index.ts`.

---

## 2. Kết quả Kiểm thử & Build

### Kết quả `vitest`
```
 Test Files  12 passed (12)
      Tests  69 passed (69)
```
Toàn bộ 69 unit tests (bao gồm 17 tests mới cho SunburstView) đều vượt qua 100%.

### Kết quả `npm run build`
```
vite v5.4.21 building for production...
✓ 1819 modules transformed.
dist/index.html                   1.28 kB │ gzip:  0.71 kB
dist/assets/index-KZJ5PedY.css   36.54 kB │ gzip:  6.80 kB
dist/assets/index-CKDgKUlj.js   148.89 kB │ gzip: 47.90 kB
✓ built in 1.60s
```
Không có bất kỳ lỗi TypeScript hay cảnh báo nào.

---

## 3. Git Commit
- **Commit Message**: `feat: implement Phylogenetic SunburstWheel and QuickSpecimenPanel`

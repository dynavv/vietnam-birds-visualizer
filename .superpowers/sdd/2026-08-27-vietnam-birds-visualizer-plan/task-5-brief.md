# Task 5 Brief: Màn hình Bản đồ Vùng Chim Đặc hữu Việt Nam (EBA Map - Màn hình Mở đầu)

## Yêu cầu

### 1. `src/components/MapView/EndemicFocusCard.tsx`
- Thẻ thông tin nổi bật loài chim đang chọn (được đặt dạng floating panel thanh nhã bên trái hoặc bên phải bản đồ):
  - Khung tranh vẽ minh họa phong cách naturalist cổ điển kèm hiệu ứng zoom nhẹ khi hover.
  - Tên tiếng Việt in đậm sang trọng, tên khoa học in nghiêng (Serif font), tên tiếng Anh.
  - Huy hiệu "⭐ Đặc hữu Việt Nam" (nếu là loài đặc hữu) và Huy hiệu Sách Đỏ IUCN / VN.
  - Tích hợp `AudioVoiceButton` (phát tiếng hót theo yêu cầu, KHÔNG tự phát).
  - Thông tin sinh cảnh: Độ cao (VD: `1.900m - 2.590m`), Vùng EBA, Vườn Quốc Gia nơi chim sinh sống.
  - 2 nút hành động chuyển đổi màn hình:
    - `🌐 Khám phá trên Bánh xe Phân loại học ➔` (chuyển sang `activeView: 'sunburst'`).
    - `📜 Xem phân tích hình thái học ➔` (chuyển sang `activeView: 'curator'`).
  - Nút "🎲 Đổi loài ngẫu nhiên" (`selectRandomEndemic`).

### 2. `src/components/MapView/EBARegionLegend.tsx`
- Bảng danh sách 6 Vùng chim đặc hữu (EBAs) Việt Nam:
  - Cao nguyên Đà Lạt / Lâm Viên
  - Cao nguyên Kon Tum / Dãy Ngọc Linh
  - Vùng Đất thấp Miền Trung
  - Vùng Núi Tây Bắc / Hoàng Liên Sơn
  - Vùng Nam Bộ & Rừng Cát Tiên
  - Vùng Núi Đông Bắc
- Bấm vào một vùng:
  - Bản đồ bay (`flyTo`) đến tọa độ trung tâm của vùng đó.
  - Hiển thị danh sách các loài chim tiêu biểu của vùng đó để người dùng bấm chọn.

### 3. `src/components/MapView/VietnamEBAMap.tsx`
- Tích hợp Leaflet Map (`MapContainer`, `TileLayer`, `Marker`, `CircleMarker`, `Popup`, `useMap` hook):
  - Base map: Sử dụng tile sáng nhã nhặn phù hợp phong cách giấy cổ (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png` hoặc OpenStreetMap).
  - Tọa độ trung tâm Việt Nam: `[16.0, 107.5]`, zoom mặc định phù hợp với toàn lãnh thổ Việt Nam (bao gồm cả các quần đảo Hoàng Sa và Trường Sa ghi rõ trên nhãn).
  - Khi `selectedSpecies` thay đổi (hoặc khi vừa mở web): Bản đồ tự động thực hiện hiệu ứng `flyTo` mượt mà đến tọa độ của loài đó (`species.distribution.coordinates`).
  - Render các điểm Marker đại diện cho các loài chim và các vùng EBA.
  - Bấm vào một Marker trên bản đồ $\rightarrow$ gọi `selectSpecies(species.id)`.

### 4. Kiểm thử & Xuất module
- Viết unit test cho các component MapView (mock Leaflet nếu cần).
- Xuất barrel trong `src/components/MapView/index.ts`.
- Chạy `npm test` và `npm run build` đảm bảo không có lỗi.
- Commit code: `git add . && git commit -m "feat: implement VietnamEBAMap and EndemicFocusCard"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-5-report.md`.

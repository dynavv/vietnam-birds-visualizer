# Task 4 Brief: Thành phần Giao diện Dùng chung (Museum Header, SearchFilterBar, AudioVoiceButton & Badges)

## Yêu cầu

### 1. `src/components/Common/AudioVoiceButton.tsx`
- **Nguyên tắc cốt lõi**: KHÔNG TỰ ĐỘNG PHÁT (No autoplay). Chỉ phát khi người dùng chủ động click.
- Tích hợp HTML5 `Audio` với trạng thái `isPlaying`, `isError`, `duration`.
- Khi đang phát: Hiển thị icon Pause kèm thanh sóng âm mini chuyển động (animated audio waveform bars).
- Khi dừng: Hiển thị icon Play / Volume.
- Hiển thị thời lượng hoặc thông báo nhẹ "Tiếng hót tự nhiên (xeno-canto)" / "Bản thu đang cập nhật" nếu không có audioUrl.
- Hỗ trợ dừng phát khi component unmount hoặc khi chuyển sang loài chim khác.

### 2. `src/components/Common/ConservationBadge.tsx` & `EndemicBadge.tsx`
- `ConservationBadge.tsx`:
  - Hiển thị badge theo chuẩn IUCN (`CR`, `EN`, `VU`, `NT`, `LC`) với màu sắc bảo tàng trang nhã:
    - CR: Đỏ thẫm `#991B1B` (Cực kỳ nguy cấp)
    - EN: Cam đỏ `#C2410C` (Nguy cấp)
    - VU: Vàng hổ phách `#D97706` (Sắp nguy cấp)
    - NT: Vàng chanh `#854D0E` (Gần bị đe dọa)
    - LC: Xanh rêu `#166534` (Ít quan tâm)
  - Tooltip hoặc nhãn phụ giải thích tên cấp độ tiếng Việt.
- `EndemicBadge.tsx`:
  - Badge vàng kim sang trọng viền vàng (`bg-amber-100 text-amber-900 border-amber-300`) với biểu tượng Ngôi sao / Lá cờ: "Đặc hữu Việt Nam".

### 3. `src/components/Header/SearchFilterBar.tsx`
- Kết nối trực tiếp với `useTaxonomy()`:
  - Ô tìm kiếm tức thì (gõ tìm theo Tên tiếng Việt, Tên khoa học, Tên tiếng Anh) có nút xóa nhanh (x).
  - Nút toggle/checkbox: "⭐ Chỉ xem chim Đặc hữu" (`onlyEndemic`).
  - Dropdown chọn Bộ chim (`selectedOrder`): Tất cả các bộ (Passeriformes, Galliformes, Bucerotiformes...).
  - Dropdown chọn Bậc bảo tồn (`selectedConservation`): Tất cả, CR, EN, VU, NT, LC.
  - Hiển thị số lượng loài phù hợp (VD: "Hiển thị 15 / 68 loài").
  - Nút "Đặt lại bộ lọc" (Reset filters) khi có bộ lọc đang kích hoạt.

### 4. `src/components/Header/MuseumHeader.tsx`
- Phong cách *Naturalist Editorial / Victorian Museum Archive*:
  - Logo chim & Tiêu đề: "AVIFAUNA OF VIETNAM" / "GIÁM TUYỂN & PHÂN LOẠI HỌC CHIM VIỆT NAM".
  - Bộ chuyển đổi 3 Màn hình (Tabs Navigation):
    1. 🗺️ **Bản đồ Sinh thái (EBA Map)**
    2. 🌐 **Bánh xe Phân loại (Sunburst Wheel)**
    3. 📜 **Trình Giám tuyển (Specimen Curator)**
  - Nút hành động nhanh: "🎲 Khám phá ngẫu nhiên" (`selectRandomEndemic`).

### 5. Kiểm thử & Commit
- Viết unit test cho `AudioVoiceButton.test.tsx` và `SearchFilterBar.test.tsx` (hoặc kiểm tra render sạch).
- Chạy `npm test` và kiểm tra `npm run build` thành công.
- Commit code: `git add . && git commit -m "feat: add MuseumHeader, SearchFilterBar, AudioVoiceButton and Badges"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-4-report.md`.

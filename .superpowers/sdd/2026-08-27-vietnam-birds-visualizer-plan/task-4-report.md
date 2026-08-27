# Báo Cáo Hoàn Thành: Task 4 — Thành Phần Giao Diện Dùng Chung (Museum Header, SearchFilterBar, AudioVoiceButton & Badges)

**Dự án:** Vietnam Birds Visualizer (Avifauna of Vietnam)  
**Tác vụ:** Task 4 — Common Components & Museum Header  
**Thời gian hoàn thành:** 2026-08-27  
**Commit:** `5b6a017` (`feat: add MuseumHeader, SearchFilterBar, AudioVoiceButton and Badges`)  

---

## 1. Các thành phần đã triển khai

### 1.1 `src/components/Common/AudioVoiceButton.tsx`
- **Nguyên tắc cốt lõi**: Tuân thủ triệt để nguyên tắc **KHÔNG TỰ ĐỘNG PHÁT (No autoplay)**. Âm thanh chỉ phát khi người dùng chủ động click nút.
- **Tính năng & Trạng thái**:
  - Quản lý trạng thái HTML5 `Audio` hoàn chỉnh: `isPlaying`, `isLoading`, `isError`, `duration`.
  - Hiệu ứng sóng âm mini chuyển động (5 thanh sóng âm nhảy động với nhịp điệu sole tự nhiên) khi đang phát tiếng hót.
  - Tự động dừng phát và dọn dẹp (cleanup) khi component unmount hoặc khi thay đổi `audioUrl` của loài chim khác.
  - Xử lý lỗi mượt mà (graceful fallback) khi liên kết âm thanh bị hỏng hoặc chưa có bản thu ("Bản thu đang cập nhật").
  - Hỗ trợ 3 biến thể hiển thị: `pill` (nút thon gọn), `card` (thẻ chi tiết kèm tên người thu âm xeno-canto), và `icon-only` (icon tròn nhỏ gọn).

### 1.2 `src/components/Common/ConservationBadge.tsx`
- Hiển thị bậc bảo tồn theo chuẩn IUCN 5 cấp độ:
  - **CR** (`#991B1B`): Cực kỳ nguy cấp (Critically Endangered)
  - **EN** (`#C2410C`): Nguy cấp (Endangered)
  - **VU** (`#D97706`): Sắp nguy cấp (Vulnerable)
  - **NT** (`#854D0E`): Gần bị đe dọa (Near Threatened)
  - **LC** (`#166534`): Ít quan tâm (Least Concern)
- Hỗ trợ hiển thị thêm mã phân hạng Sách Đỏ Việt Nam (`vietnamRedList`) và nhãn phụ tiếng Việt rõ ràng.

### 1.3 `src/components/Common/EndemicBadge.tsx`
- Huy hiệu tông màu vàng kim quý phái (`bg-amber-100/90 text-amber-950 border-amber-300`) với biểu tượng Ngôi sao / Tia sáng lấp lánh (`Sparkles` / `Star`).
- Hiển thị nhãn: "Đặc hữu Việt Nam" (hoặc chế độ gọn: "Đặc hữu").

### 1.4 `src/components/Header/SearchFilterBar.tsx`
- Kết nối trực tiếp vào hook `useTaxonomy()`:
  - Ô tìm kiếm tức thì 3 ngôn ngữ (Tiếng Việt, Tên khoa học, Tiếng Anh) kèm nút xóa nhanh (x).
  - Nút toggle "⭐ Chim Đặc hữu" (`onlyEndemic`).
  - Dropdown chọn Bộ chim (`selectedOrder`): Tự động trích xuất danh sách các bộ từ cơ sở dữ liệu kèm tên tiếng Việt (Bộ Sẻ, Bộ Gà, Bộ Hồng hoàng, Bộ Gõ kiến...).
  - Dropdown chọn Bậc bảo tồn IUCN (`selectedConservation`): Tất cả, CR, EN, VU, NT, LC.
  - Hiển thị số lượng loài phù hợp theo thời gian thực (VD: `Hiển thị 15 / 68 loài`).
  - Nút "Đặt lại" (`Reset filters`) tự động xuất hiện khi có bất kỳ bộ lọc nào đang được kích hoạt.

### 1.5 `src/components/Header/MuseumHeader.tsx`
- Phong cách *Naturalist Editorial / Victorian Museum Archive*:
  - Logo chim Feather & Tiêu đề: "Avifauna of Vietnam" / "Giám tuyển & Trực quan hóa Phân loại học Chim Việt Nam".
  - Bộ chuyển đổi 3 Chế độ xem (Navigation Tabs):
    1. 🗺️ **Bản đồ Sinh thái** (`map` / EBA Map)
    2. 🌐 **Bánh xe Phân loại** (`sunburst` / Sunburst Wheel)
    3. 📜 **Trình Giám tuyển** (`curator` / Specimen Curator)
  - Nút hành động nhanh: "🎲 Khám phá ngẫu nhiên" (`selectRandomEndemic`) kèm hiệu ứng xoay xúc xắc khi tương tác.

---

## 2. Kết quả Kiểm thử & Biên dịch (Verification)

### 2.1 Unit Tests (`vitest`)
Đã hoàn thành 4 tệp kiểm thử chuyên biệt với tổng cộng 38/38 bài test đạt kết quả PASS:
- `src/components/Common/AudioVoiceButton.test.tsx` (5 tests): Xác nhận không autoplay, fallback khi thiếu audio, tương tác click phát/dừng, hiển thị biến thể card.
- `src/components/Common/Badges.test.tsx` (9 tests): Kiểm tra 5 bậc IUCN, hiển thị Sách Đỏ VN, các chế độ kích thước & nhãn đặc hữu.
- `src/components/Header/SearchFilterBar.test.tsx` (4 tests): Kiểm tra tìm kiếm trilingual, toggle đặc hữu, dropdown bộ/IUCN và đặt lại bộ lọc.
- `src/components/Header/MuseumHeader.test.tsx` (3 tests): Kiểm tra render tiêu đề, chuyển đổi 3 tab điều hướng, và chức năng chọn chim ngẫu nhiên.
- Cùng với 17 bài test của `TaxonomyContext` và `validateData`.

### 2.2 Production Build (`npm run build`)
- TypeScript kiểm tra kiểu nghiêm ngặt (strict mode, noUnusedLocals): 0 lỗi.
- Đóng gói Vite hoàn tất thành công trong 1.53s.

---

## 3. Tóm tắt Files & Export
```
src/
├── components/
│   ├── Common/
│   │   ├── AudioVoiceButton.tsx
│   │   ├── AudioVoiceButton.test.tsx
│   │   ├── ConservationBadge.tsx
│   │   ├── EndemicBadge.tsx
│   │   ├── Badges.test.tsx
│   │   └── index.ts
│   └── Header/
│       ├── MuseumHeader.tsx
│       ├── MuseumHeader.test.tsx
│       ├── SearchFilterBar.tsx
│       ├── SearchFilterBar.test.tsx
│       └── index.ts
```

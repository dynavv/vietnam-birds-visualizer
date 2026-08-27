# Task 7 Brief: Màn hình Trình Giám tuyển & Phân tích Hình thái Học (Specimen & Morphological Curator)

## Yêu cầu

### 1. `src/components/CuratorView/SpecimenPlate.tsx`
- Trưng bày bản tranh minh họa chất lượng cao (Plate Illustration) phong cách bảo tàng tự nhiên học:
  - Khung viền tranh cổ điển (*Victorian Archival Frame* với đường viền chỉ đôi, góc trang trí thanh nhã).
  - Nhãn bản khắc: Số hiệu bản vẽ (Plate Number), Tác giả tranh (*H. Grönvold / Naturalist Classic Archive*), Nguồn tư liệu (*Les Oiseaux de l'Indochine Française*).
  - Tính năng phóng to tương tác (Zoom Inspection / Lightbox): Cho phép bấm vào tranh để soi chi tiết từng nét cọ, sợi lông và màu sắc.
  - Nút phát âm thanh `AudioVoiceButton` đặt trang trọng ngay góc bảng tranh.

### 2. `src/components/CuratorView/MorphologyReport.tsx`
- Báo cáo Giám tuyển & Lập luận Hình thái học chuyên sâu:
  - **Mô tả Tổng quan (Morphological Overview)**: Trình bày kích thước cơ thể, sắc tố bộ lông, sự khác biệt trống/mái (nếu có).
  - **Bảng Đặc điểm Nhận dạng Then chốt (Diagnostic Features)**:
    - Mỏ & Mũi (Beak & Culmen): Cấu trúc mỏ thích nghi ăn sâu bọ/trái cây/hạt/thịt.
    - Lông Cánh & Vệt màu (Wing bars & Primaries): Màu sắc vệt cánh đặc trưng phân biệt với loài tương cận.
    - Đỉnh Đầu & Vòng Mắt (Crown, Supercilium & Eye-ring).
    - Đuôi & Thân dưới (Tail & Underparts).
  - **Lập luận Phân loại học Tiến hóa (Taxonomic & Evolutionary Logic)**: Giải thích cơ sở di truyền học và hình thái học đưa loài này vào Chi (*Genus*) và Họ (*Family*) tương ứng.

### 3. `src/components/CuratorView/CladeBadgeSequence.tsx`
- Chuỗi huy hiệu phân cấp tiến hóa đầy đủ:
  - `Lớp Aves` ➔ `Nhánh Neognathae` ➔ `Nhánh Neoaves` ➔ `Bộ [Order]` ➔ `Họ [Family]` ➔ `Chi [Genus]` ➔ `Loài [Species]`.
  - Mỗi huy hiệu hiển thị cả tên khoa học (Latin) và tên tiếng Việt, có màu sắc tương ứng theo rank.

### 4. `src/components/CuratorView/RelatedSpeciesTabs.tsx`
- Thanh duyệt nhanh các loài tương cận (Candidate / Related Species) trong cùng Họ hoặc cùng Chi tại Việt Nam:
  - Hiển thị danh sách card nhỏ kèm ảnh thu nhỏ, tên tiếng Việt, tên khoa học và huy hiệu đặc hữu.
  - Bấm vào một loài $\rightarrow$ chuyển đổi mẫu vật tức thì (`selectSpecies(id)`).

### 5. `src/components/CuratorView/CuratorView.tsx` & Barrel Export
- Bố cục 2 cột cân đối phong cách tạp chí học thuật:
  - Cột trái: `SpecimenPlate` lớn + `CladeBadgeSequence` + `RelatedSpeciesTabs`.
  - Cột phải: Thông tin danh pháp 3 ngôn ngữ, Huy hiệu bảo tồn, Sinh cảnh phân bố tại Việt Nam + `MorphologyReport`.
- Xuất barrel trong `src/components/CuratorView/index.ts`.

### 6. Kiểm thử & Commit
- Viết unit tests cho các component CuratorView.
- Chạy `npm test` và `npm run build` đảm bảo 100% test pass.
- Commit code: `git add . && git commit -m "feat: implement Specimen and Morphological Curator view"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-7-report.md`.

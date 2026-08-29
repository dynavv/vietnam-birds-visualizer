# Tài Liệu Thiết Kế (Design Spec): Bird Vision Detector (Nhận Diện Chim Bằng AI)

**Ngày lập**: 2026-08-29  
**Trạng thái**: Draft / Chờ duyệt  
**Mục tiêu**: Bổ sung tính năng nhận diện ảnh loài chim tự động bằng Gemini Vision AI, phân tích đặc điểm giải phẫu hình thái, đánh giá độ tin cậy và tự động so khớp liên kết trực tiếp với 68 loài chim trong Bảo tàng số Avifauna of Vietnam.

---

## 1. Tổng Quan & Trải Nghiệm Người Dùng (UX/UI Flow)

### 1.1 Điểm Kích Hoạt (Header Entry Point)
- Trên thanh Menu chính ([`MuseumHeader.tsx`](file:///home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/src/components/Header/MuseumHeader.tsx)), bổ sung nút bấm:
  - **Tên**: `📷 Nhận Diện Bằng AI` (hoặc icon Camera kèm nhãn tinh tế).
  - **Phong cách**: Viền vàng kim / xanh rừng ngọc bích sang trọng chuẩn phong cách Bảo tàng Tự nhiên học.

### 1.2 Cửa Sổ Tương Tác Nhận Diện (`BirdVisionModal.tsx`)
- **Vùng tải ảnh (Upload Dropzone)**:
  - Hỗ trợ Kéo & Thả (Drag & Drop) ảnh PNG, JPG, WEBP.
  - Hỗ trợ duyệt file từ thiết bị hoặc Chụp ảnh trực tiếp từ Camera điện thoại.
  - Cung cấp **3 ảnh mẫu chim Việt Nam (Demo Samples)**: ví dụ ảnh Gà lôi lam mào trắng, Nuốc bụng vàng, Mi Langbiang để người dùng bấm thử nghiệm ngay tức thì.
- **Trạng thái phân tích (Analyzing State)**:
  - Hiệu ứng quét lăng kính lade / radar tự nhiên học mượt mà.
  - Thông báo từng bước: *"Đang phân tích lông vũ & cấu trúc mỏ..."* $\rightarrow$ *"Đang tra cứu cơ sở dữ liệu Điểu học..."*.
- **Kết quả nhận diện (Identification Results)**:
  - **Trường hợp 1 (Trùng khớp loài trong Bảo tàng)**:
    - Hiển thị huy hiệu xanh: `✨ Khớp với mẫu vật trong Bảo tàng số!`
    - Tên tiếng Việt, Tên khoa học, Họ, Bộ, Mức độ tự tin (Confidence %).
    - 3 Đặc điểm chẩn đoán hình thái nhận diện được trong ảnh (ví dụ: mào trắng dựng đứng, ức đỏ cam...).
    - Nút bấm hành động: `👉 Mở Cẩm Nang Giám Tuyển & Nghe Tiếng Hót` (tự động chuyển hướng view và chọn loài tương ứng).
  - **Trường hợp 2 (Loài chim mở rộng ngoài 68 loài)**:
    - Hiển thị đầy đủ thông tin phân loại học của loài, tình trạng bảo tồn IUCN, và danh sách các loài họ hàng gần nhất hiện có trong bảo tàng.
  - **Trường hợp 3 (Ảnh không chứa chim hoặc quá mờ)**:
    - Thông báo lịch sự kèm hướng dẫn chụp góc rõ nét hơn.

---

## 2. Kiến Trúc Kỹ Thuật (Technical Architecture)

### 2.1 Cấu Hình API Key & Môi Trường
- API Key được lưu trữ trong biến môi trường: `VITE_GEMINI_API_KEY`.
- Tệp `.env.local` được bảo vệ trong `.gitignore`, không để lộ key.
- Người dùng cuối sử dụng hoàn toàn miễn phí, không cần nhập API key cá nhân.

### 2.2 Client-side AI Vision Service (`src/services/birdVisionService.ts`)
- **Mô hình sử dụng**: `gemini-2.5-flash` (hỗ trợ fallback sang `gemini-2.0-flash` hoặc `gemini-1.5-flash`).
- **Xử lý ảnh**:
  - Tự động nén và resize ảnh phía client (tối đa 1024px) bằng HTML5 Canvas để tối ưu tốc độ truyền tải mạng.
  - Chuyển đổi sang định dạng Base64 data URL.
- **Cấu trúc Prompt (System Prompt & Schema)**:
  - Sử dụng chế độ JSON Structured Output:
  ```json
  {
    "is_bird": true,
    "confidence_score": 92,
    "species_vietnamese": "Gà lôi lam mào trắng",
    "species_scientific": "Lophura edwardsi",
    "family_scientific": "Phasianidae",
    "order_scientific": "Galliformes",
    "conservation_status": "CR",
    "diagnostic_features": [
      "Mào lông trắng muốt dựng ngược trên đỉnh đầu",
      "Bộ lông xanh thẫm ánh thép kim loại",
      "Vùng da quanh mắt màu đỏ son rực rỡ"
    ],
    "brief_description": "Loài trĩ đặc hữu quý hiếm của vùng rừng ẩm miền Trung Việt Nam."
  }
  ```

### 2.3 Thuật Toán So Khớp Bảo Tàng (`src/utils/speciesMatcher.ts`)
- Nhận diện `species_scientific` và `species_vietnamese` từ AI.
- So khớp với mảng 68 loài trong `src/data/species.json`:
  1. So khớp chính xác theo Tên khoa học (*Exact Scientific Name Match*).
  2. So khớp mờ theo Tên tiếng Việt (*Fuzzy Vietnamese Name Match*).
  3. So khớp theo Chi/Họ (*Genus/Family Match*) để gợi ý loài tương cận nếu không khớp trực tiếp cấp loài.

---

## 3. Quản Lý Trạng Thái & Tương Tác Giữa Các Màn Hình

- Tích hợp với `TaxonomyContext`:
  - Khi người dùng bấm `Mở Cẩm Nang Giám Tuyển` từ kết quả nhận diện:
    - Gọi `setSelectedSpeciesId(matchedSpecies.id)`.
    - Gọi `setActiveView('curator')`.
    - Đóng cửa sổ nhận diện.

---

## 4. Kế Hoạch Kiểm Thử (Testing & Quality Assurance)

1. **Unit Tests (`birdVisionService.test.ts`)**:
   - Kiểm tra định dạng payload gửi đi.
   - Kiểm tra khả năng xử lý JSON phản hồi từ Gemini API.
   - Kiểm tra xử lý lỗi mạng (Network Timeout, Invalid API key, Non-bird image).
2. **Component Tests (`BirdVisionModal.test.tsx`)**:
   - Kiểm tra mở/đóng modal.
   - Kiểm tra chọn ảnh demo sample.
   - Kiểm tra hiển thị kết quả thành công và nút chuyển sang Curator View.
3. **Integration Tests (`App.test.tsx`)**:
   - Kiểm tra nút kích hoạt trên Header mở đúng modal nhận diện.

---

## 5. Danh Sách Tệp Cần Tạo & Chỉnh Sửa

| Hành động | Tệp tin | Mục đích |
| :--- | :--- | :--- |
| **[NEW]** | `src/services/birdVisionService.ts` | Gửi request nhận diện ảnh đến Gemini Flash Vision API |
| **[NEW]** | `src/utils/speciesMatcher.ts` | So khớp kết quả AI với 68 loài chim trong `species.json` |
| **[NEW]** | `src/components/VisionDetector/BirdVisionModal.tsx` | Giao diện Modal tải ảnh, quét radar và xem kết quả |
| **[NEW]** | `src/components/VisionDetector/BirdVisionModal.test.tsx` | Kiểm thử giao diện và luồng nhận diện |
| **[NEW]** | `src/services/birdVisionService.test.ts` | Kiểm thử AI Vision Service |
| **[MODIFY]** | `src/components/Header/MuseumHeader.tsx` | Thêm nút "📷 Nhận Diện Bằng AI" trên thanh menu |
| **[MODIFY]** | `src/App.tsx` | Khởi tạo Modal nhận diện và quản lý trạng thái mở/đóng |

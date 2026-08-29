# Avifauna of Vietnam (Trực quan hóa Điểu học Việt Nam) 🕊️🇻🇳

Bảo tàng số hóa tương tác chuyên sâu về khu hệ chim hoang dã Việt Nam, kết hợp hệ thống thông tin địa lý sinh thái (GIS Mapping) của 6 Vùng Chim Đặc Hữu (EBAs), cây phả hệ phát sinh chủng loại (Phylogenetic Tree) D3.js và cẩm nang giám tuyển hình thái học.

---

## 🌟 Tính Năng Cốt Lõi (Core Features)

1. **🗺️ Bản Đồ Sinh Thái 6 Vùng Chim Đặc Hữu (EBA GIS Map)**:
   - Bản đồ tương tác Leaflet (CartoDB Voyager) với đường ranh giới chủ quyền và 6 Vùng Chim Đặc Hữu (EBAs) tại Việt Nam.
   - Định vị tọa độ thực địa, sinh cảnh rừng nhiệt đới, độ cao phân bố và thuật toán phân tán điểm trùng tọa độ (Spider Radial Offset).
   - Thẻ báu vật chim đặc hữu tích hợp phát âm thanh tiếng hót tự nhiên (Xeno-canto) và bộ đếm hành trình khám phá.

2. **🌳 Cây Phả Hệ Phát Sinh Chủng Loại (Phylogenetic Wheel & Cladogram)**:
   - Biểu đồ phân vùng hình tròn đồng tâm (D3.js Radial Sunburst Partition) thể hiện toàn diện 5 cấp phân loại học: *Lớp (Aves) → 16 Bộ → Họ → Chi → Loài*.
   - Chế độ cây phả hệ phân nhánh dọc (*Phylogenetic Tree/Cladogram*) với khả năng thu gọn/mở rộng phân nhánh và ghi nhớ trạng thái tương tác.

3. **📖 Cẩm Nang Nhận Dạng & Giám Tuyển Mẫu Vật (Field Guide & Curator)**:
   - Tranh mẫu vật độ phân giải cao với chế độ Lightbox phóng to chi tiết từng sợi lông, mỏ và hoa văn.
   - Tích hợp thông tin chụp thực địa tại Việt Nam đối chiếu trực tiếp từ iNaturalist và tọa độ GPS.
   - Báo cáo giải phẫu hình thái học chuyên sâu (chẩn đoán mỏ, cánh, lông đuôi, chân) và lập luận sinh thái tiến hóa.
   - Liên kết trực tiếp hồ sơ học thuật quốc tế: IUCN Red List (đánh giá mới nhất), IOC World Bird List, Avibase, GBIF và trích lục DOI/CrossRef.

4. **🎲 Khám Phá Ngẫu Nhiên & Tìm Kiếm Trực Tiếp (Live Search & Discovery)**:
   - Bộ lọc tìm kiếm nhanh đa ngôn ngữ (Tiếng Việt, Tên Khoa học, Tiếng Anh).
   - Nút khám phá ngẫu nhiên các loài báu vật đặc hữu với hiệu ứng lấp lánh (Shimmer) và dải ruy băng kiến thức kỳ thú (*Avian Fun Facts*).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 18 (TypeScript), Vite 5, Tailwind CSS
- **Visualization**: D3.js (Hierarchical Partition & Tree Layout), Lucide React
- **Mapping**: Leaflet, React-Leaflet, CartoDB Voyager Tiles, GeoJSON
- **Audio Engine**: HTML5 Audio & Web Audio API (Xeno-canto Field Recordings)
- **Testing**: Vitest + React Testing Library (100% test coverage across 31 test suites)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án (Quick Start)

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Cấu hình biến môi trường:
Sao chép file mẫu và điền API keys cần thiết:
```bash
cp .env.example .env.local
```

### 3. Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Mở trình duyệt tại: **http://localhost:3000**

### 4. Chạy bộ kiểm thử (Unit & Integration Tests):
```bash
npm test -- --run
```

### 5. Đóng gói bản Production (Build):
```bash
npm run build
```

---

## 📜 Bản Quyền & Trích Dẫn (Licensing & Citations)

- **Dữ liệu phân loại**: Chuẩn hóa theo **IOC World Bird List (v14.2)**, **Clements Checklist** và **Sách Đỏ Việt Nam**.
- **Hình ảnh**: Giấy phép mở **Creative Commons (CC BY, CC BY-SA, CC BY-NC)** ghi nhận đầy đủ tác giả từ **iNaturalist Biodiversity Archive**.
- **Âm thanh**: **Xeno-canto Foundation** (CC BY-NC-SA 4.0).
- **Mục đích**: 100% giáo dục cộng đồng, bảo tồn thiên nhiên và phi lợi nhuận.

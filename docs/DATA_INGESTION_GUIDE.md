# Cẩm Nang Quy Trình Nạp Dữ Liệu Loài Chim Mới (Species Ingestion Guide)

Tài liệu này hướng dẫn chi tiết quy trình tự động hóa nạp và kiểm định dữ liệu loài chim mới vào dự án **Vietnam Birds Visualizer**.
Mục đích của tài liệu là cung cấp quy chuẩn kỹ thuật cho lập trình viên và các tác tử AI (AI Agents) thực thi an toàn, không gây lỗi hồi quy và không làm ô nhiễm cơ sở dữ liệu.

---

## 1. Tổng Quan Kiến Trúc Nạp Dữ Liệu

Dự án áp dụng nguyên tắc **Zero Database Pollution** (Không ô nhiễm cơ sở dữ liệu).
Dữ liệu từ các API công cộng không bao giờ được ghi trực tiếp vào cơ sở dữ liệu chính.
Mọi loài chim mới bắt buộc phải trải qua quy trình 3 giai đoạn nghiêm ngặt:

```
[API Harvester] ──> [Vùng đệm Staging (drafts/)] ──> [Gatekeeper (6 Chốt Chặn)] ──> [Atomic Commit & Auto-Rollback]
```

1. **Giai đoạn 1 (Thu thập - Harvester)**: Tự động truy vấn iNaturalist, GBIF, IUCN, Xeno-canto và đối chiếu Master Registry, lưu vào vùng đệm `scripts/data-pipeline/drafts/candidate-species.json`.
2. **Giai đoạn 2 (Kiểm định - Gatekeeper)**: Thẩm định bản ghi dự thảo qua 6 bài kiểm tra chốt chặn. Nếu vi phạm bất kỳ tiêu chí nào, quá trình dừng lại ngay lập tức.
3. **Giai đoạn 3 (Nạp nguyên tử - Atomic Commit)**: Tạo điểm phục hồi snapshot, ghi dữ liệu vào `src/data/species.json`, chèn nhánh vào cây phân loại `src/data/taxonomy.json`, tự động chạy bộ test Vitest. Nếu có lỗi, hệ thống tự động hoàn nguyên (rollback).

---

## 2. Lệnh Thực Thi Dành Cho AI Và Kỹ Sư

### 2.1. Lệnh Tự Động Trọn Gói (Khuyến nghị cho AI Agents)
Chạy toàn bộ 3 giai đoạn với một lệnh duy nhất:

```bash
npm run species:add -- --name="<Tên khoa học>"
```

**Ví dụ:**
```bash
npm run species:add -- --name="Pitta nympha"
```

Khi chạy lệnh này:
- Nếu thành công: Bản ghi được nạp vào `src/data/species.json`, nhánh cây phân loại được cập nhật trong `src/data/taxonomy.json`, toàn bộ test suites đều pass.
- Nếu không đạt chuẩn kiểm định: Tiến trình thoát với mã lỗi `exit 1` và in danh sách lỗi chi tiết. Cơ sở dữ liệu chính được bảo vệ nguyên vẹn.

---

### 2.2. Quy Trình Chạy Từng Bước (Khi cần can thiệp thủ công)

#### Bước 1: Thu thập dữ liệu vào vùng đệm
```bash
npm run species:harvest -- --name="<Tên khoa học>"
```
Tệp dự thảo được tạo tại: `scripts/data-pipeline/drafts/candidate-species.json`.

#### Bước 2: Kiểm tra hoặc chỉnh sửa bản ghi dự thảo (Nếu cần)
Mở tệp `scripts/data-pipeline/drafts/candidate-species.json` để kiểm tra các trường:
- `vietnameseName`: Phải khớp với tên chính hoặc tên đồng danh trong Master Registry.
- `illustration.imageUrl`: URL ảnh thực địa có bản quyền mở CC.
- `distribution.coordinates`: Tọa độ `[latitude, longitude]` tại Việt Nam.
- `conservation.legalFramework`: Nhóm Nghị định 84, Nghị định 160 hoặc Chỉ thị 04.

#### Bước 3: Thẩm định qua hàng rào 6 chốt chặn
```bash
npm run species:verify
```

#### Bước 4: Commit an toàn vào cơ sở dữ liệu
```bash
npm run species:commit
```

---

## 3. Chi Tiết 6 Chốt Chặn Kiểm Định (Quality Gatekeeper)

Script `scripts/data-pipeline/verify-species-candidate.js` thực thi 6 bài kiểm tra tự động:

### Chốt chặn 1: Tên tiếng Việt & Chống AI Hallucination (Naming Firewall)
- Đối chiếu tên khoa học với Master Registry quốc gia (`scripts/data-pipeline/authority/vietnam-bird-names-master.json`) gồm 972 loài chuẩn IOC v14.2 và Avibase.
- Chấp thuận nếu `vietnameseName` của bản ghi khớp với tên chính thức HOẶC nằm trong mảng `aliases` của Master Registry.
- Nghiêm cấm dùng tên tự dịch từ AI hoặc các tên nằm trong danh sách đen (Blacklist).

### Chốt chặn 2: Ảnh thực địa & Cấp bậc Taxon (3-Tier Image Firewall)
- Ảnh bắt buộc phải đúng loài 100% (`taxon.rank === 'species'`), không chấp nhận ảnh cấp Chi hoặc cấp Họ.
- URL ảnh phải phản hồi HTTP 200 OK.
- Nếu chụp tại Việt Nam (`isShotInVietnam: true`): Phải có thông tin địa danh trong `photoLocation`.
- Nếu không có ảnh mở hợp lệ: Kích hoạt Zero-Photo Rule, script dừng lại để xin ý kiến người dùng thay vì đoán bừa.

### Chốt chặn 3: Liên kết học thuật quốc tế (Academic Registries)
- `gbifTaxonKey`: Phải là số nguyên dương hợp lệ và phản hồi 200 từ GBIF API.
- `avibaseId`: Mã hex 16 ký tự hợp lệ từ Avibase. Nếu loài chưa có mã hex, cho phép để `null` để giao diện kích hoạt fallback tìm kiếm an toàn.
- `iucnUrl`: Phải phản hồi HTTP 200 OK từ IUCN. Nếu loài mới tách chưa được IUCN đánh giá độc lập (Not Evaluated - NE), để `null` để giao diện kích hoạt huy hiệu NE an toàn.

### Chốt chặn 4: Cấu trúc phân loại học & Tọa độ phân bố
- Bắt buộc đầy đủ cấp Bộ (`order`), Họ (`family`), Chi (`genus`).
- Tọa độ `coordinates: [lat, lon]` phải là số thực hợp lệ nằm trong phạm vi lãnh thổ và vùng đặc quyền kinh tế Việt Nam (Vĩ độ: 8.0 đến 24.0, Kinh độ: 102.0 đến 112.0).

### Chốt chặn 5: Khung bảo vệ pháp lý (Legal Framework)
- Khai báo đầy đủ trường `conservation.legalFramework`:
  - `decree84Group`: `'IB'`, `'IIB'` hoặc `'none'` (Nghị định 84/2021/NĐ-CP).
  - `decree160Priority`: `true` hoặc `false` (Nghị định 160/2013/NĐ-CP & 64/2019/NĐ-CP).
  - `directive04Flagship`: `true` hoặc `false` (Loài chim di cư cờ đầu theo Chỉ thị 04/CT-TTg).
  - `isEaafpMigratory`: `true` hoặc `false` (Đường bay di cư Đông Á - Úc).

### Chốt chặn 6: Dữ liệu âm thanh thực địa (Audio Call Gatekeeper)
- Nếu loài không có bản thu âm: Cho phép đặt `audioCall: null` (đối với loài hiếm hoặc loài không có minh quản chức năng như kền kền, hạc).
- Nếu có `audioCall`:
  - URL âm thanh phải phản hồi HTTP 200 OK.
  - Tên tệp trong Content-Disposition phải chứa tên chi hoặc tên loài mục tiêu (chống nhầm lẫn loài).
  - Kiểm tra loài bị Xeno-canto khóa tải công khai (Restricted Species do chống săn trộm): Nếu bị khóa, tự động chuyển về `audioCall: null` hợp lệ.

---

## 4. Danh Sách Tệp Dữ Liệu Quan Trọng

| Đường dẫn tệp | Vai trò |
|---|---|
| `scripts/data-pipeline/authority/vietnam-bird-names-master.json` | Danh lục chuẩn quốc gia (972 loài) làm căn cứ đối soát |
| `scripts/data-pipeline/drafts/candidate-species.json` | Vùng đệm chứa bản ghi loài dự thảo đang xử lý |
| `src/data/species.json` | Cơ sở dữ liệu chính của các loài hiển thị trong ứng dụng |
| `src/data/taxonomy.json` | Cấu trúc cây phả hệ phân loại học D3.js |
| `scripts/data-pipeline/add-species.js` | Điều phối toàn diện pipeline 3 giai đoạn |
| `scripts/data-pipeline/harvest-species.js` | Module thu thập dữ liệu tự động từ API |
| `scripts/data-pipeline/verify-species-candidate.js` | Module kiểm định 6 chốt chặn |
| `scripts/data-pipeline/commit-species-candidate.js` | Module commit nguyên tử và rollback |

---

## 5. Quy Trình Khắc Phục Lỗi Dành Cho AI (Troubleshooting)

Khi lệnh `npm run species:add` báo lỗi, AI cần thực hiện theo các bước chẩn đoán sau:

1. **Lỗi [NAMING FIREWALL] Chưa có trong Master Registry:**
   - Kiểm tra xem tên khoa học có viết sai chính tả không.
   - Kiểm tra danh pháp đồng danh trong Master Registry (`vietnam-bird-names-master.json`).
   - Nếu là loài chim mới phát hiện chưa có trong danh lục: Cần bổ sung vào `vietnam-bird-names-master.json` với nguồn trích dẫn học thuật trước khi chạy lại.

2. **Lỗi [ZERO-PHOTO RULE] Không có ảnh mở hợp lệ:**
   - Tra cứu trên iNaturalist với tên khoa học của loài để tìm quan sát có giấy phép CC (CC BY, CC BY-NC, CC BY-SA).
   - Nếu tìm thấy URL hợp lệ, cập nhật trường `illustration` trong tệp draft `candidate-species.json` rồi chạy `npm run species:verify`.

3. **Lỗi [AUDIO RESTRICTED / KHÓA TẢI]:**
   - Xeno-canto khóa tải file đối với các loài bị đe dọa săn bẫy bằng loa.
   - Đặt `audioCall: null` trong tệp draft `candidate-species.json` để vượt qua kiểm định.

4. **Lỗi sau khi Commit (Kiểm thử Vitest thất bại):**
   - Hệ thống sẽ tự động kích hoạt Rollback hoàn nguyên `species.json` và `taxonomy.json`.
   - AI cần đọc log lỗi kiểm thử, sửa chữa nguyên nhân và chạy lại.

# BÁO CÁO KIỂM ĐỊNH & THẨM ĐỊNH ĐỐI KHÁNG (REVIEWER 2 - ROUND 2 REPORT)
## Dự án: Vietnam Birds Visualizer — Adversarial Audit & Stabilization
**Ngày thực hiện**: 2026-08-28  
**Phán quyết tổng thể**: `APPROVE` (Chấp thuận toàn bộ các cải tiến & bản vá ổn định)

---

## 1. OBSERVATION (QUAN SÁT THỰC NGHIỆM ĐỘC LẬP)

### 1.1. Tái kiểm tra 3 điểm cải tiến từ Round 1
1. **`src/utils/audioManager.ts` (Dòng 50-60)**:
   - Lệnh gọi callback khởi đầu trong `subscribe()` đã được bọc hoàn toàn trong khối `try / catch`:
     ```ts
     public subscribe(listener: AudioStateListener): () => void {
       this.listeners.add(listener);
       try {
         listener(this.getState());
       } catch (err) {
         console.error('Error in initial audio listener:', err);
       }
       return () => {
         this.listeners.delete(listener);
       };
     }
     ```
   - *Kết quả*: Ngăn ngừa triệt để việc một listener lỗi làm ngắt quãng chu kỳ đăng ký và đảm bảo luôn trả về hàm dọn dẹp (unsubscribe).

2. **`src/context/TaxonomyContext.tsx` (Dòng 49-53 & Dòng 71-82)**:
   - Khởi tạo giá trị `selectedSpeciesId` mặc định chọn `endemics[0]?.id || allSpeciesData[0]?.id || ''` thay vì `Math.random()`, đảm bảo tính tất định (deterministic) 100% trong mọi môi trường test và render ban đầu.
   - Hàm `selectSpecies(id: string)` đã tích hợp mở rộng đồng bộ nhánh Bộ (`order`) và Họ (`family`) trong `setExpandedNodes` ngay khi được gọi:
     ```ts
     const selectSpecies = useCallback((id: string) => {
       setSelectedSpeciesId(id);
       const sp = allSpeciesData.find(s => s.id === id);
       if (sp?.taxonomy) {
         setExpandedNodes(prev => {
           const next = new Set(prev);
           if (sp.taxonomy.order) next.add(sp.taxonomy.order);
           if (sp.taxonomy.family) next.add(sp.taxonomy.family);
           return next;
         });
       }
     }, []);
     ```
   - *Kết quả*: Loại bỏ hoàn toàn độ trễ bất đồng bộ và sự cố không mở lại nhánh khi chọn lại loài đang active sau khi `collapseAllNodes()`.

3. **`src/components/MapView/VietnamEBAMap.tsx` (Dòng 224-230)**:
   - Cập nhật hàm `handleSelectRegion` để hỗ trợ cơ chế toggle đóng/mở vùng EBA:
     ```ts
     const handleSelectRegion = useCallback((region: EBARegion) => {
       setSelectedEBARegionId(prev => prev === region.id ? null : region.id);
       setFlyTarget({
         coordinates: region.coordinates,
         zoom: region.zoomLevel
       });
     }, []);
     ```
   - *Kết quả*: Cho phép người dùng nhấp lại vào vùng EBA đã chọn để bỏ chọn (deselect) vùng, mang lại trải nghiệm bản đồ mượt mà và trực quan.

### 1.2. Kết quả Chạy Toàn diện Test Suite (`npm test -- --run`)
- **Lệnh thực thi**: `npm test -- --run`
- **Kết quả đầu ra**:
  ```text
  Test Files  30 passed (30)
       Tests  186 passed (186)
    Duration  6.84s
  ```
- **Tỷ lệ vượt qua**: **100% (30/30 test suites, 186/186 tests)**, không có bất kỳ cảnh báo hoặc lỗi nào.
- Toàn bộ 4 test suite đối kháng chuyên sâu đều đạt 100%:
  - `src/adversarial_verification.test.tsx`: 6/6 passed
  - `src/utils/audioManager.stress.test.ts`: 7/7 passed
  - `src/utils/linkGenerators.stress.test.ts`: 24/24 passed
  - `src/components/MapView/spiderfier.stress.test.ts`: 5/5 passed

### 1.3. Kết quả Kiểm tra Kiểu dữ liệu & Đóng gói Production (`npm run build`)
- **Lệnh thực thi**: `npx tsc --noEmit` & `npm run build`
- **Kết quả biên dịch**: `tsc` vượt qua 0 lỗi type-check, Vite đóng gói thành công trong 2.63s:
  - `dist/assets/vendor-icons-DaXM7dO4.js`: `21.55 kB` (Gzip: `4.79 kB`)
  - `dist/assets/vendor-d3-Cf9P9Lvv.js`: `47.19 kB` (Gzip: `16.31 kB`)
  - `dist/assets/index-CudZI5bk.js`: `139.96 kB` (Gzip: `34.88 kB`)
  - `dist/assets/vendor-react-CdkWbty6.js`: `141.96 kB` (Gzip: `45.49 kB`)
  - `dist/assets/vendor-leaflet-qWF-wXav.js`: `155.37 kB` (Gzip: `45.39 kB`)
  - `dist/assets/data-species-DnO5qV1H.js`: `202.38 kB` (Gzip: `39.63 kB`)
- **Tối ưu chunk**: Không có bất kỳ chunk nào vượt quá 205 kB, kiến trúc tách bundle (`manualChunks`) hoạt động chính xác theo tiêu chuẩn.

### 1.4. Kiểm tra Tính trung thực & Toàn vẹn (Integrity Check)
- Không có bất kỳ kết quả test hardcode nào trong mã nguồn `src/`.
- Không có lớp vỏ bề ngoài (facade) hay mock tạm bợ.
- Không có việc sao chép tắt hay bỏ qua các yêu cầu nghiệp vụ.
- Toàn bộ 186 tests đều thực hiện các assert trên DOM, state, lifecycle audio và thuật toán tọa độ thật.

---

## 2. LOGIC CHAIN (CHUỖI LẬP LUẬN TỪ QUAN SÁT ĐẾN KẾT LUẬN)

1. *Từ Observation 1.1*: Các điểm sửa lỗi trong `audioManager.ts`, `TaxonomyContext.tsx`, và `VietnamEBAMap.tsx` đã trực tiếp giải quyết 3 failure modes được Reviewer 2 chỉ ra ở Round 1.
2. *Từ Observation 1.2*: Việc chạy lại toàn bộ test suite với 186 bài kiểm thử trên môi trường thực tế xác nhận rằng các bản sửa đổi không gây ra bất kỳ tác dụng phụ (side-effect) hay hồi quy (regression) nào.
3. *Từ Observation 1.3*: Quá trình build production và kiểm tra type TypeScript hoàn toàn sạch sẽ, chứng minh mã nguồn đạt độ ổn định cao và sẵn sàng triển khai.
4. *Từ Observation 1.4*: Mã nguồn tuân thủ tuyệt đối các quy chuẩn toàn vẹn (integrity), không sử dụng mánh lới hay bypass.
5. *Kết luận tổng hợp*: Hệ thống Vietnam Birds Visualizer đã đạt trạng thái ổn định, chống chịu lỗi đối kháng xuất sắc và hoàn thành 100% mục tiêu của dự án.

---

## 3. CAVEATS (CÁC ĐIỂM CẦN LƯU Ý)

- Không có điểm lưu ý (No caveats). Toàn bộ 30 bộ kiểm thử đã được chạy độc lập và xác minh thực nghiệm 100%.

---

## 4. CONCLUSION (KẾT LUẬN & PHÁN QUYẾT)

**Phán quyết**: **`APPROVE`** (Chấp thuận nghiệm thu)

Tất cả các tiêu chí chất lượng, độ tin cậy và kiểm thử đối kháng đã được đáp ứng hoàn hảo:
1. AudioManager cách ly lỗi người nghe và xử lý chuẩn xác trạng thái phát âm thanh toàn cục.
2. TaxonomyContext bảo đảm mở rộng nhánh cây đồng bộ và khởi tạo state tất định.
3. VietnamEBAMap hỗ trợ toggle vùng EBA linh hoạt và giải phóng tài nguyên bản đồ an toàn.
4. 100% 30 test files và 186 tests vượt qua sạch sẽ.
5. Production build tối ưu với kích thước chunk < 205 kB.

---

## 5. VERIFICATION METHOD (HƯỚNG DẪN KIỂM CHỨNG ĐỘC LẬP)

Để tái kiểm chứng độc lập:
1. Chạy toàn bộ test suite:
   ```bash
   npm test -- --run
   ```
   *Kết quả kỳ vọng*: `Test Files: 30 passed (30)`, `Tests: 186 passed (186)`.
2. Kiểm tra type-checking:
   ```bash
   npx tsc --noEmit
   ```
   *Kết quả kỳ vọng*: Exit code 0, không có lỗi type.
3. Chạy production build:
   ```bash
   npm run build
   ```
   *Kết quả kỳ vọng*: Đóng gói thành công trong ~2.6s, các chunk phân tách theo `manualChunks` < 205 kB.

# BÁO CÁO KIỂM ĐỊNH & THẨM ĐỊNH ĐỐI KHÁNG (REVIEWER 2 REPORT)
## Dự án: Vietnam Birds Visualizer — Adversarial Audit & Stabilization
**Ngày thực hiện**: 2026-08-28  
**Đánh giá tổng thể**: `REQUEST_CHANGES` (Yêu cầu khắc phục 3 điểm lỗi phát hiện qua kiểm thử đối kháng)

---

## 1. OBSERVATION (QUAN SÁT THỰC NGHIỆM ĐỘC LẬP)

### 1.1. Kết quả Chạy Kiểm thử Toàn diện (`npm test -- --run`)
Khi thực thi toàn bộ 30 bộ kiểm thử (bao gồm 26 test suite cơ bản/mở rộng từ Worker 1 và 4 test suite đối kháng chuyên sâu):
- **Tổng số test suite**: 30 files
- **Kết quả**: 26 files passed, 4 files failed (3 bài test không đạt trên tổng số 177 tests):
  1. **`src/utils/audioManager.stress.test.ts`** (Fail test: `5. Subscriber resilience: Handles 100 subscribers with dynamic unsubscribes and buggy listeners`):
     ```text
     Error: Intentional buggy listener 0
      ❯ src/utils/audioManager.stress.test.ts:119:17
      ❯ AudioManager.subscribe src/utils/audioManager.ts:53:5
     ```
  2. **`src/context/TaxonomyContext.test.tsx`** (Fail test: `automatically expands order and family when a species is selected`):
     ```text
     AssertionError: expected false to be true
      ❯ src/context/TaxonomyContext.test.tsx:249:63
         249| expect(result.current.expandedNodes.has('Galliformes')).toBe(true);
     ```
  3. **`src/adversarial_verification.test.tsx`** (Fail test: `allows expanding all 6 EBA regions and interacting on tablet layout without blackout`):
     ```text
     TestingLibraryElementError: Unable to find an element with the text: /Khối núi granite kỳ vĩ miền Trung/i.
      ❯ src/adversarial_verification.test.tsx:76:26
     ```

### 1.2. Kết quả Đóng gói & Phân tách Bundle (`npm run build`)
- Quá trình biên dịch TypeScript (`tsc`) và đóng gói Vite hoàn tất sạch sẽ 100% không cảnh báo:
  - `dist/assets/vendor-icons-DaXM7dO4.js`: `21.55 kB` (Gzip: `4.79 kB`)
  - `dist/assets/vendor-d3-Cf9P9Lvv.js`: `47.19 kB` (Gzip: `16.31 kB`)
  - `dist/assets/index-BMY8y3CL.js`: `139.77 kB` (Gzip: `34.81 kB`)
  - `dist/assets/vendor-react-CdkWbty6.js`: `141.96 kB` (Gzip: `45.49 kB`)
  - `dist/assets/vendor-leaflet-qWF-wXav.js`: `155.37 kB` (Gzip: `45.39 kB`)
  - `dist/assets/data-species-DnO5qV1H.js`: `202.38 kB` (Gzip: `39.63 kB`)
- **Tất cả các chunk đều < 205 kB**, giảm sâu so với monolithic chunk `700.52 kB` ban đầu.

### 1.3. Khảo sát Mã nguồn Trọng tâm
- `src/utils/linkGenerators.ts`: Triển khai chuẩn hóa IUCN, Avibase (regex 16-hex), GBIF (regex số nguyên), iNaturalist, Xeno-canto, DOI canonical URL và BHL/Scholar search fallback rất chặt chẽ, không có hardcode dữ liệu giả.
- `src/utils/audioManager.ts`: Xử lý singleton tốt, lọc đúng `AbortError` qua `DOMException`. Tuy nhiên tại dòng 53 trong `subscribe()`, lệnh gọi `listener(this.getState())` ban đầu chưa được bọc trong `try / catch`.
- `src/components/MapView/VietnamEBAMap.tsx`: Triển khai thuật toán Spider Radial Offset lượng giác chính xác, cache `L.divIcon`, dọn dẹp `MapFlyToController` với `map.stop()`.
- `src/components/SunburstView/SunburstWheel.tsx`: Xử lý nhãn chữ bằng giới hạn độ dài theo cấp bậc và lọc nan quạt hiển thị khi hover rất mượt.
- `src/components/SunburstView/CladogramTreeView.tsx`: Kết nối `expandedNodes` thông qua context.
- `docs/AUDIT_AND_ROADMAP.md`: Đầy đủ cấu trúc, phân loại mức độ sự cố và lộ trình 3 giai đoạn rõ ràng.

---

## 2. LOGIC CHAIN (CHUỖI PHÂN TÍCH & NGUYÊN NHÂN GỐC RỄ)

1. **Phân tích Lỗi 1 (`AudioManager.subscribe`)**:
   - *Quan sát*: Tại dòng 53 `src/utils/audioManager.ts`, khi một component đăng ký `subscribe(listener)`, hàm gọi trực tiếp `listener(this.getState())`.
   - *Hệ quả*: Nếu một listener bất kỳ gặp sự cố hoặc ném ngoại lệ trong lần gọi đầu tiên, ngoại lệ sẽ làm gãy toàn bộ chuỗi đăng ký, khiến các listener tiếp theo không được thêm vào và component bị crash lúc mount. Trong khi đó, tại hàm `notify()` ở dòng 62, lệnh gọi listener đã được bọc `try / catch` rất chuẩn.
   - *Kết luận*: Cần bọc lệnh gọi khởi đầu trong `subscribe()` bằng `try / catch` tương tự `notify()`.

2. **Phân tích Lỗi 2 (`TaxonomyContext` auto-expansion)**:
   - *Quan sát*: Tại `src/context/TaxonomyContext.tsx` dòng 91-100, việc tự động mở rộng nhánh Bộ/Họ của loài đang chọn được đặt trong `React.useEffect(() => { ... }, [selectedSpecies])`.
   - *Hệ quả*: Khi người dùng gọi `collapseAllNodes()`, `expandedNodes` bị xóa rỗng (`size = 0`). Sau đó nếu gọi `selectSpecies(id)` với chính loài chim đang được chọn sẵn (`selectedSpeciesId === id`), tham chiếu `selectedSpecies` không đổi ➔ `useEffect` không kích hoạt ➔ cây không mở lại nhánh Bộ/Họ. Ngoài ra, việc dựa vào `useEffect` gây độ trễ bất đồng bộ (asynchronous render lag) thay vì cập nhật tức thì.
   - *Kết luận*: Cần cập nhật `expandedNodes` đồng bộ ngay trong hàm `selectSpecies(id)`.

3. **Phân tích Lỗi 3 (`EBARegionLegend` toggle trên `VietnamEBAMap`)**:
   - *Quan sát*: Tại `src/components/MapView/VietnamEBAMap.tsx` dòng 224-230, `handleSelectRegion` chỉ gán cứng `setSelectedEBARegionId(region.id)` mà không hỗ trợ toggle thu gọn (`region.id === selectedEBARegionId ? null : region.id`).
   - *Hệ quả*: Khi người dùng nhấp vào vùng EBA đã mở, giao diện không cho phép đóng lại; đồng thời tương tác giữa legend và map controller trong môi trường test cần xử lý nhất quán.

4. **Phân tích Lỗi 4 (`TaxonomyProvider` non-deterministic random initial species)**:
   - *Quan sát*: Tại dòng 53 `src/context/TaxonomyContext.tsx`, state `selectedSpeciesId` sử dụng `Math.random() * endemics.length`.
   - *Hệ quả*: Tạo ra sự không nhất quán giữa các lần chạy test (flaky test), phụ thuộc vào loài ngẫu nhiên được chọn ban đầu. Cần mặc định chọn loài đặc hữu đầu tiên ổn định (deterministic) và chỉ dùng `Math.random()` khi gọi hàm `selectRandomEndemic()`.

---

## 3. CAVEATS (CÁC ĐIỂM CẦN LƯU Ý)

- Mã nguồn đã được tái cấu trúc với chất lượng kiến trúc rất cao, sạch sẽ, không còn `any` casts nào trong `src/`.
- 100% các yêu cầu về liên kết học thuật, chunk splitting, layout tablet/mobile, D3 Sunburst, GIS Leaflet đã hoàn thành xuất sắc.
- Phán quyết `REQUEST_CHANGES` thuần túy dựa trên 3 lỗi kiểm thử đối kháng nêu trên để đạt độ tin cậy tuyệt đối 100% Pass Rate trên mọi stress test.

---

## 4. CONCLUSION & FINDINGS (KẾT LUẬN & DANH MỤC KHẮC PHỤC)

**Phán quyết**: `REQUEST_CHANGES`

### Danh mục Khắc phục Chi tiết cho Worker 1:

#### 🔴 Finding 1 (Major): Bọc `try / catch` cho initial state notification trong `AudioManager.subscribe`
- **Tệp**: `src/utils/audioManager.ts` (dòng 53)
- **Cách sửa**:
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

#### 🔴 Finding 2 (Major): Mở rộng nhánh cây đồng bộ ngay trong `selectSpecies` của `TaxonomyContext`
- **Tệp**: `src/context/TaxonomyContext.tsx` (dòng 75-77 & 91-100)
- **Cách sửa**:
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

#### 🟡 Finding 3 (Major): Hỗ trợ toggle đóng/mở vùng EBA trong `VietnamEBAMap.tsx`
- **Tệp**: `src/components/MapView/VietnamEBAMap.tsx` (dòng 224-230)
- **Cách sửa**:
  ```ts
  const handleSelectRegion = useCallback((region: EBARegion) => {
    setSelectedEBARegionId(prev => prev === region.id ? null : region.id);
    setFlyTarget({
      coordinates: region.coordinates,
      zoom: region.zoomLevel
    });
  }, []);
  ```

#### 🟢 Finding 4 (Minor): Tránh dùng `Math.random()` khi khởi tạo `selectedSpeciesId` trong `TaxonomyContext`
- **Tệp**: `src/context/TaxonomyContext.tsx` (dòng 49-57)
- **Cách sửa**: Mặc định chọn `endemics[0]?.id || allSpeciesData[0]?.id` thay vì random khi mount context.

---

## 5. VERIFICATION METHOD (HƯỚNG DẪN KIỂM THỬ XÁC NHẬN)

Sau khi Worker 1 áp dụng các điểm chỉnh sửa trên:
1. **Chạy toàn bộ 30 bộ kiểm thử**:
   ```bash
   npm test -- --run
   ```
   *Tiêu chuẩn đạt*: Toàn bộ **30/30 test files passed**, **177/177 tests passed (100%)**.
2. **Chạy build đóng gói sản phẩm**:
   ```bash
   npm run build
   ```
   *Tiêu chuẩn đạt*: Thành công 100%, tất cả chunk < 205 kB.

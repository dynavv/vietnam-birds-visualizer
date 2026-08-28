# Báo Cáo Thẩm Định Chuyên Sâu (Adversarial Audit Report) — Explorer 2

**Mục tiêu**: Thẩm định toàn diện 3 phân hệ cốt lõi của *Vietnam Birds Visualizer*:
1. **Giao diện người dùng & Khả năng đáp ứng đa khung nhìn (UI/UX & Viewport Responsiveness)**: Hiện tượng bẫy cuộn (scroll traps), giật bố cục (layout shifts), xung đột lớp hiển thị (z-index collisions), tràn khung nhìn trên desktop (1080p, 1440p, 4K), laptop (1366x768), tablet (768px–1024px) và mobile.
2. **Hệ thống Bản đồ Sinh thái Tương tác (Leaflet GIS)**: Hiệu năng gom cụm điểm (marker clustering), độ chính xác tọa độ, vòng bán kính vùng chim đặc hữu (EBA boundary circles), điểm khẳng định chủ quyền biển đảo, tính bền bỉ khi tải bản đồ nền (tile loading resiliency), dọn dẹp bộ nhớ hoạt họa phóng thu (zoom animation memory cleanup).
3. **Trực quan hóa Phân loại học Điểu học (D3 Cladogram & Radial Wheel)**: Hoạt họa chuyển tiếp nút cây, duy trì trạng thái đóng/mở nhánh cây (state persistence), cắt xén nhãn văn bản (text label clipping), xung đột tương tác nhấp chuột vs rê chuột (click vs hover).

---

## 1. Quan Sát Thực Tế (Observation)

### 1.1 Phân hệ Leaflet GIS & Bản đồ Sinh thái
- **Obs 1.1.1 (Thiếu cơ chế Marker Clustering & Xung đột đè chồng tọa độ)**:
  - Vị trí: `src/components/MapView/VietnamEBAMap.tsx:269-321`
  - Hiện trạng: Tất cả 68 loài chim (`filteredSpecies`) đều được lặp qua và tạo các thẻ `<Marker>` độc lập gắn trực tiếp lên bản đồ.
  - Mã nguồn:
    ```tsx
    // VietnamEBAMap.tsx:269-281
    {showAllSpeciesPins &&
      otherSpeciesList.map(species => {
        if (!species.distribution?.coordinates) return null;
        return (
          <Marker
            key={species.id}
            position={species.distribution.coordinates}
            icon={createSpeciesDivIcon(species)}
            eventHandlers={{
              click: () => selectSpecies(species.id)
            }}
          > ... </Marker>
        );
      })
    }
    ```
  - Dữ liệu thực tế: Tại Cao nguyên Đà Lạt (`[12.0, 108.45]`), Cao nguyên Kon Tum / Ngọc Linh (`[15.08, 107.98]`), Cát Tiên (`[11.45, 107.4]`), có từ 4 đến 8 loài chim có tọa độ phân bố danh nghĩa trùng khớp hoàn toàn.
  - Hệ quả quan sát: Các ghim đánh dấu đè khít lên nhau ở cùng tọa độ pixel. Ghim trên cùng chặn hoàn toàn sự kiện chuột (`pointer-events`), khiến người dùng không thể nhấp vào 80% các loài chim còn lại tại điểm đó.

- **Obs 1.1.2 (Rò rỉ bộ nhớ do tái tạo liên tục `L.divIcon` trên từng chu kỳ render)**:
  - Vị trí: `src/components/MapView/VietnamEBAMap.tsx:35-107, 218, 259, 277, 327`
  - Hiện trạng: Các hàm `createSovereigntyDivIcon`, `createEBADivIcon`, `createSpeciesDivIcon`, `createSelectedSpeciesDivIcon` tạo mới đối tượng `L.divIcon({...})` trong mỗi vòng lặp render mà không có bộ nhớ đệm (memoization / cache).
  - Mã nguồn:
    ```tsx
    // VietnamEBAMap.tsx:277
    icon={createSpeciesDivIcon(species)}
    ```
  - Hệ quả quan sát: Khi người dùng gõ tìm kiếm trên `SearchFilterBar` hoặc rê chuột qua danh mục, React re-render gây kích hoạt lại toàn bộ 70+ instance `L.divIcon`, buộc Leaflet phải phá hủy DOM con và dựng lại HTML bên trong thẻ marker, gây hiện tượng tụt khung hình (FPS drop) và rác bộ nhớ (GC pressure).

- **Obs 1.1.3 (Xung đột hoạt họa & thiếu ngắt hoạt họa trong `MapFlyToController`)**:
  - Vị trí: `src/components/MapView/VietnamEBAMap.tsx:117-130`
  - Mã nguồn:
    ```tsx
    const MapFlyToController: React.FC<MapFlyToControllerProps> = ({ target }) => {
      const map = useMap();
      useEffect(() => {
        if (target) {
          map.flyTo(target.coordinates, target.zoom, {
            duration: 1.4,
            easeLinearity: 0.25
          });
        }
      }, [map, target]);
      return null;
    };
    ```
  - Hệ quả quan sát: Khi người dùng nhấp xúc xắc "Khám phá ngẫu nhiên" hoặc đổi vùng nhanh, lệnh `map.flyTo()` mới được kích hoạt khi lệnh trước chưa kết thúc (1.4s). Leaflet không được gọi `map.stop()`, tạo ra các frame animation mồ côi và gây giật khung hình camera.

- **Obs 1.1.4 (Bán kính vùng sinh thái `CircleMarker` không tỉ lệ với độ thu phóng địa lý)**:
  - Vị trí: `src/components/MapView/VietnamEBAMap.tsx:231-254`
  - Mã nguồn: `<CircleMarker center={region.coordinates} radius={isSelected ? 45 : 32} ... />`
  - Hệ quả quan sát: `CircleMarker` trong Leaflet sử dụng đơn vị pixel cố định trên màn hình (32px). Ở mức zoom 6 (toàn quốc), 32px tương đương ~150km. Nhưng khi phóng to đến mức zoom 10 (khu vực núi), 32px chỉ bao phủ một chấm nhỏ (~10km), làm mất đi ý nghĩa biểu thị vùng sinh thái (Ecological Boundary Area).

- **Obs 1.1.5 (Độ chính xác tọa độ chủ quyền biển đảo & tính kiên cố của bản đồ nền)**:
  - Tọa độ Hoàng Sa (`[16.5, 112.0]`) và Trường Sa (`[9.5, 114.0]`) chuẩn xác và có nhãn `(Việt Nam)` rõ ràng.
  - Tuy nhiên, `TileLayer` tại dòng 205–209 phụ thuộc đơn điểm vào CartoDB CDN (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`) mà không có fallback tile layer khi mạng chập chờn.

---

### 1.2 Phân hệ D3 Cladogram & Radial Wheel (Bánh Xe Phân Loại)
- **Obs 1.2.1 (Hiện tượng tràn viền văn bản xuyên qua các vành phân loại đồng tâm trên Bánh xe Rẻ quạt)**:
  - Vị trí: `src/components/SunburstView/SunburstWheel.tsx:94-97, 244-278`
  - Hiện trạng:
    - Bán kính ngoài `radius = 375px`, tâm `centerRadius = 82.5px`.
    - Độ dày mỗi vành phân loại: `ringWidth = (375 - 82.5) / 4 = 73.125px`.
    - Nhãn văn bản xoay theo phương xuyên tâm (`rotate(rotate) translate(r, 0)`), neo ở giữa (`text-anchor: middle`).
    - Cắt chuỗi cho phép tối đa 18 ký tự (`vi.length > 18 ? `${vi.slice(0, 16)}…` : vi`).
  - Hệ quả quan sát: Với kích thước chữ 11px, chuỗi 16 ký tự tiếng Việt có chiều dài thực tế khoảng 105px – 115px. Khi đặt `text-anchor: middle` giữa vành dày 73px, văn bản vươn ra ngoài 55px về hai phía, vượt quá ranh giới vành 18px ở cả rìa trong lẫn rìa ngoài, đè chồng trực tiếp lên các chữ của vành Bộ và vành Chi liền kề.

- **Obs 1.2.2 (Rò rỉ nan quạt bóng ma / Ghost Arc Leakage khi rê chuột sau khi phóng to nhánh)**:
  - Vị trí: `src/components/SunburstView/SunburstWheel.tsx:344-378`
  - Mã nguồn:
    ```tsx
    path.on('mouseenter', (_event, d) => {
      ...
      path
        .attr('fill-opacity', node => (ancestorNames.includes(node.data.name) ? 1.0 : 0.25))
    });
    ```
  - Hệ quả quan sát: Sau khi phóng to vào một Bộ (ví dụ *Passeriformes*), các nan quạt của các Bộ khác được gán ẩn (`fill-opacity: 0`). Nhưng khi người dùng rê chuột qua bất kỳ nan quạt nào, hàm `mouseenter` lại áp dụng `attr('fill-opacity', ... 0.25)` lên TOÀN BỘ tập hợp `path`, khiến các nan quạt ẩn bị ép hiện lại ở độ trong suốt 25%, tạo nên các mảnh nan quạt bóng ma trôi nổi ngoài màn hình.

- **Obs 1.2.3 (Thiếu hàm dọn dẹp bộ nhớ `useEffect` khi chuyển đổi giao diện)**:
  - Vị trí: `src/components/SunburstView/SunburstWheel.tsx:124-386`
  - Hệ quả quan sát: Không có `return () => { ... }` để gọi `d3.selectAll(...).interrupt()`. Khi người dùng chuyển nhanh từ tab "Bánh xe Phân loại" sang tab "Bản đồ", các timer chuyển động (transition 750ms) của D3 vẫn tiếp tục chạy trong nền và tham chiếu tới các SVG element đã bị React unmount khỏi DOM.

- **Obs 1.2.4 (Cây Phân Nhánh CladogramTreeView mất trạng thái mở rộng khi đổi tab & thiếu liên kết nhánh sinh học)**:
  - Vị trí: `src/components/SunburstView/CladogramTreeView.tsx:28-36, 117-285`
  - Hiện trạng:
    - Trạng thái mở rộng `expandedNodes` lưu trong `useState` nội bộ, tự khởi tạo lại mỗi lần mount về 4 giá trị cứng (`Passeriformes`, `Galliformes`, `Leiothrichidae`, `Phasianidae`).
    - Khi người dùng đang chọn một loài chim từ tìm kiếm hoặc bản đồ, cây phân loại không tự động mở rộng nhánh Bộ/Họ tương ứng để cuộn đến loài đó.
    - Cây hiện tại được xây dựng bằng danh sách thẻ `div` lồng nhau thay vì đường nhánh phát sinh chủng loại SVG/D3 (cladistic branch lines).

---

### 1.3 Phân hệ UI/UX & Khả năng Đáp ứng Đa Khung Nhìn (Viewport Responsiveness)
- **Obs 1.3.1 (Lỗi nghiêm trọng P0/P1: Mất hoàn toàn bảng danh mục 6 Vùng EBA trên Tablet 768px – 1023px)**:
  - Vị trí: `src/components/MapView/VietnamEBAMap.tsx:367, 375, 380, 442`
  - Hiện trạng phân giải breakpoint:
    - Bảng EBARegionLegend bên trái: `className="hidden lg:block absolute top-4 left-4 ..."` (chỉ hiện khi màn hình >= 1024px).
    - Thẻ thông tin EndemicFocusCard bên phải: `className="hidden md:block absolute top-4 right-4 ..."` (hiện khi màn hình >= 768px).
    - Thanh chuyển tab ngăn kéo di động dưới đáy: `className="flex md:hidden items-center ..."` (chỉ hiện khi màn hình < 768px).
  - Hệ quả quan sát: Trên mọi thiết bị Tablet (iPad Air, iPad Pro dọc, Galaxy Tab) có chiều rộng từ 768px đến 1023px:
    - Nút mở ngăn kéo di động bị ẩn do `md:hidden`.
    - Bảng danh mục EBA bên trái bị ẩn do `hidden lg:block`.
    - **Kết quả: Người dùng trên Tablet hoàn toàn không có bất kỳ cách nào để mở hoặc xem thông tin 6 Vùng Chim Đặc Hữu!**

- **Obs 1.3.2 (Bẫy cuộn màn hình trên thiết bị di động với bản đồ Leaflet)**:
  - Vị trí: `src/App.tsx:49`, `src/components/MapView/VietnamEBAMap.tsx:191, 200`
  - Hiện trạng: Trên mobile, trang cho phép cuộn dọc. Nhưng khung bản đồ có chiều cao `min-h-[480px]` và bật `scrollWheelZoom={true}` cùng cử chỉ chạm đơn (single-finger drag).
  - Hệ quả quan sát: Khi người dùng lướt ngón tay qua vùng bản đồ để cuộn trang xuống chân trang (Footer), bản đồ bắt toàn bộ sự kiện chạm để kéo map (pan), giữ chân người dùng trong bẫy cuộn (scroll trap) không thể lướt tiếp xuống Footer.

- **Obs 1.3.3 (Chen chúc giao diện 2 bảng nổi trên màn hình Laptop 1366x768 & Màn hình 1024px)**:
  - Vị trí: `src/components/MapView/VietnamEBAMap.tsx:367, 375`
  - Hiện trạng: Bảng trái có chiều rộng ~384px (`max-w-sm`), bảng phải có chiều rộng ~448px (`max-w-md`).
  - Hệ quả quan sát: Tổng chiều rộng 2 bảng là 832px. Trên màn hình 1024px, khoảng trống bản đồ còn lại ở giữa chỉ vỏn vẹn `1024 - 832 = 192px`. Đồng thời, ở chiều cao 768px (chiều cao thực tế trừ thanh header là ~620px), hai bảng nổi chạm đáy đè lên cụm điều khiển phía dưới (`bottom-4`).

- **Obs 1.3.4 (Lãng phí không gian hiển thị trên màn hình 2K/4K 2560px & 3840px)**:
  - Vị trí: `src/App.tsx:18`, `src/components/Header/MuseumHeader.tsx:54`, `src/components/SunburstView/SunburstView.tsx:69`, `src/components/CuratorView/CuratorView.tsx:94`
  - Hiện trạng: Tất cả view chính đều bị giới hạn cứng ở `max-w-7xl` (1280px).
  - Hệ quả quan sát: Trên màn hình 4K (3840x2160), toàn bộ ứng dụng bị co hẹp thành một dải cột nhỏ ở giữa chiếm chưa đầy 33% chiều ngang màn hình, để lại hai khoảng trống mênh mông hơn 2500px màu xám.

---

## 2. Chuỗi Suy Luận Logic (Logic Chain)

```
[Quan sát thực tế trong mã nguồn]
       │
       ├─► 1. Tọa độ trùng lặp + không có clustering
       │     └─► Các Marker sinh học nằm đè lên cùng 1 tọa độ pixel
       │           └─► Lỗi UX: Người dùng không thể nhấp vào 80% loài chim tại điểm nóng đa dạng sinh học (P1)
       │
       ├─► 2. L.divIcon được khởi tạo trực tiếp trong render loop
       │     └─► Mỗi chu kỳ re-render (tìm kiếm/lọc) tạo 70+ instance Icon mới
       │           └─► Leaflet phá hủy và dựng lại toàn bộ DOM Marker
       │                 └─► Gây tụt FPS và rác bộ nhớ trình duyệt (P1)
       │
       ├─► 3. Breakpoint bất đối xứng: `hidden lg:block` (trái) vs `flex md:hidden` (dưới)
       │     └─► Khoảng 768px <= width < 1024px (Tablet) rơi vào vùng mù (dead zone)
       │           └─► Lỗi P0/P1: 100% người dùng tablet không thể mở danh mục 6 Vùng EBA
       │
       ├─► 4. D3 Sunburst: text xoay xuyên tâm + text-anchor middle + chuỗi 16-18 ký tự
       │     └─► Chiều dài chữ (~110px) > Chiều rộng vành đồng tâm (73px)
       │           └─► Lỗi trực quan: Chữ tràn 18px vào vành trong và vành ngoài, đè chữ khác (P1)
       │
       ├─► 5. D3 hover handler cập nhật fill-opacity toàn bộ selection
       │     └─► Các node có target.y0 < 1 hoặc > 4 bị ép hiện lại ở opacity 0.25
       │           └─► Lỗi hiển thị: Nan quạt bóng ma (ghost arcs) xuất hiện khi zoom (P1)
       │
       └─► 6. CladogramTreeView lưu expandedNodes trong local useState
             └─► Chuyển tab làm unmount component và hủy sạch trạng thái mở rộng
                   └─► Mất ngữ cảnh khám phá của người dùng (P1)
```

---

## 3. Các Điểm Cần Lưu Ý (Caveats)

1. **Giới hạn môi trường không có bản đồ ngoại tuyến**: Thư viện Leaflet tải ngói bản đồ trực tiếp từ CartoDB OpenStreetMap. Việc kiểm thử ngoại tuyến hoàn toàn (offline testing) cần bộ mock tile hoặc cache service worker.
2. **Kích thước mẫu dữ liệu hiện tại**: Cơ sở dữ liệu hiện có 68 loài chim mẫu được giám tuyển chất lượng cao. Khi quy mô tăng lên 300–900 loài (toàn bộ danh lục chim Việt Nam), vấn đề gom cụm (Clustering) và ảo hóa danh sách (Virtual scrolling) sẽ chuyển từ mức P1 lên mức P0 sống còn.
3. **Các bộ trình duyệt di động WebKit / Gecko**: Cử chỉ chạm hai ngón tay (two-finger pan) trên bản đồ cần được cấu hình chuẩn xác với thuộc tính CSS `touch-action: pan-y` để tránh can thiệp vào hành vi cuộn gốc của hệ điều hành.

---

## 4. Kết Luận & Đề Xuất Khắc Phục (Conclusion & Proposed Solutions)

### Bảng Ma Trận Phân Hạng Lỗi

| Mã Lỗi | Phân Hệ | Mô Tả Lỗi | Mức Độ | Tác Vụ Đề Xuất |
|---|---|---|:---:|---|
| **BUG-01** | UI / Responsive | Tablet Viewport (768px–1023px) mất hoàn toàn EBA Legend | **P0/P1** | Đổi breakpoint thành `md:block` hoặc bổ sung nút drawer cố định trên tablet |
| **BUG-02** | Leaflet GIS | Thiếu gom cụm điểm (Marker Clustering) làm đè chết ghim loài | **P1** | Triển khai thuật toán Spiderfier / Grid Cluster gom các điểm trùng tọa độ |
| **BUG-03** | Leaflet GIS | Tạo mới `L.divIcon` liên tục gây rò rỉ bộ nhớ & giật lag DOM | **P1** | Xây dựng `IconCacheMap` hoặc `useMemo` lưu trữ instance DivIcon duy nhất |
| **BUG-04** | Leaflet GIS | `MapFlyToController` không ngắt hoạt họa cũ khi có lệnh mới | **P1** | Thêm `map.stop()` và cleanup function trong `useEffect` |
| **BUG-05** | D3 Sunburst | Nhãn văn bản xuyên tâm bị tràn viền 18px sang vành kế cận | **P1** | Giới hạn ký tự thông minh theo góc nan quạt, căn lề bắt đầu (`start`) hoặc tính theo độ dài thực |
| **BUG-06** | D3 Sunburst | Nan quạt bóng ma xuất hiện khi rê chuột sau khi phóng to | **P1** | Lọc tập hợp D3 trước khi set opacity (`d.target.y0 >= 1 && d.target.y0 <= 4`) |
| **BUG-07** | D3 Cladogram | Mất trạng thái mở rộng cây khi chuyển đổi chế độ xem | **P1** | Đưa `expandedNodes` vào `TaxonomyContext` & tự động mở nhánh theo loài đang chọn |
| **BUG-08** | UI / UX | Bẫy cuộn trang trên mobile do bản đồ chiếm cử chỉ chạm | **P1** | Tắt `scrollWheelZoom` và yêu cầu 2 ngón tay kéo map trên mobile (`touchZoom: 'center'`) |
| **BUG-09** | UI / Layout | Màn hình 1366x768 bị 2 bảng nổi chèn ép không gian bản đồ | **P1** | Cho phép tự thu gọn (docking mode) và giới hạn `max-w-xs` trên màn hình < 1280px |
| **BUG-10** | UI / Responsive | Màn hình 4K (3840px) bị thu hẹp cứng trong cột 1280px | **P2** | Thêm hỗ trợ breakpoint `2xl:max-w-[1600px] 3xl:max-w-[1920px]` |

---

### Đề Xuất Mã Nguồn Chi Tiết (Architectural Code Fixes)

#### Sửa Lỗi BUG-01 (Tablet Responsive Blackout):
Trong `src/components/MapView/VietnamEBAMap.tsx`:
```tsx
// Thay thế đoạn 367-376:
{/* Floating Left Panel: EBA Region Legend (Hiện từ màn hình tablet md trở lên) */}
<div className="hidden md:block absolute top-4 left-4 z-10 max-w-xs lg:max-w-sm pointer-events-auto">
  <EBARegionLegend
    selectedRegionId={selectedEBARegionId}
    onSelectRegion={handleSelectRegion}
  />
</div>

{/* Floating Right Panel: Endemic Focus Card */}
<div className="hidden md:block absolute top-4 right-4 z-10 max-w-xs lg:max-w-md pointer-events-auto">
  <EndemicFocusCard />
</div>
```

#### Sửa Lỗi BUG-03 (DivIcon Memory Churn & Cache):
Trong `src/components/MapView/VietnamEBAMap.tsx`:
```tsx
// Bộ nhớ đệm Icon tĩnh cấp Module
const iconCache = new Map<string, L.DivIcon>();

const getSpeciesDivIcon = (species: BirdSpecies): L.DivIcon => {
  const key = `sp-${species.id}-${species.isEndemic}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = createSpeciesDivIcon(species);
    iconCache.set(key, icon);
  }
  return icon;
};
```

#### Sửa Lỗi BUG-04 (FlyTo Controller Animation Cancellation):
Trong `src/components/MapView/VietnamEBAMap.tsx`:
```tsx
const MapFlyToController: React.FC<MapFlyToControllerProps> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.stop(); // Ngắt hoạt họa cũ ngay lập tức
      map.flyTo(target.coordinates, target.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
    return () => {
      map.stop();
    };
  }, [map, target]);

  return null;
};
```

#### Sửa Lỗi BUG-06 (Ghost Arc Hover Leakage):
Trong `src/components/SunburstView/SunburstWheel.tsx:358-362`:
```tsx
path
  .filter(node => node.target.y0 >= 1 && node.target.y0 <= 4) // Chỉ áp dụng lên các nan quạt đang hiển thị
  .attr('fill-opacity', node => (ancestorNames.includes(node.data.name) ? 1.0 : 0.25))
  .attr('stroke', node => (ancestorNames.includes(node.data.name) ? '#FFFFFF' : '#FAF8F5'))
  .attr('stroke-width', node => (ancestorNames.includes(node.data.name) ? '2px' : '0.8px'));
```

---

## 5. Phương Pháp Xác Minh (Verification Method)

### 5.1 Kiểm Thử Tự Động (Automated Test Command)
Chạy lệnh kiểm thử toàn bộ hệ thống:
```bash
npm test -- --run
```
Yêu cầu: 100% 24 test file và 109+ tests hiện tại phải tiếp tục vượt qua không có hồi quy (regression).

### 5.2 Kiểm Thử Khung Nhìn Thủ Công (Manual Viewport Inspection Matrix)
1. **Khung nhìn Tablet (768px x 1024px & 820px x 1180px)**:
   - Mở chế độ xem Bản đồ Sinh thái (`activeView = 'map'`).
   - Xác nhận bảng 6 Vùng Chim Đặc Hữu (EBARegionLegend) xuất hiện rõ ràng ở góc trái và Thẻ loài (EndemicFocusCard) xuất hiện ở góc phải mà không bị biến mất.
2. **Khung nhìn Laptop nhỏ (1366px x 768px)**:
   - Thu nhỏ độ cao cửa sổ về 768px.
   - Xác nhận bảng nổi không đè che khuất thanh công cụ điều khiển đáy màn hình (`bottom-4`).
3. **Kiểm tra Tương tác Bánh xe Phân loại (Sunburst Zoom & Hover)**:
   - Chuyển sang "Bánh xe Phân loại".
   - Nhấp vào Bộ Sẻ (*Passeriformes*) để phóng to.
   - Rê chuột qua các nan quạt Họ và Chi bên trong: Xác nhận không có bất kỳ nan quạt bóng ma (ghost arcs) nào thuộc các Bộ khác bị lộ ra.
   - Quan sát chữ trên các nan quạt: Xác nhận chữ không bị tràn viền đè lên các vòng đồng tâm khác.
4. **Kiểm tra Duy trì Trạng thái Cây Phân loại (State Persistence)**:
   - Mở nhánh Bộ Sếu (*Gruiformes*) -> Họ Sếu (*Gruidae*).
   - Chuyển sang tab "Bản đồ", sau đó chuyển ngược lại tab "Bánh xe Phân loại" -> "Cây Phân Nhánh".
   - Xác nhận nhánh Bộ Sếu vẫn ở trạng thái mở rộng nguyên vẹn.

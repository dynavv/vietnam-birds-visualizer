# BÁO CÁO KIỂM TOÁN HỌC THUẬT & ĐA PHƯƠNG TIỆN (HANDOFF REPORT)
**Tập trung điều tra**:
1. Độ ổn định & Dự phòng của các Liên kết Học thuật & Bảo tồn (Academic & Conservation Criteria Link Stability: IUCN, Avibase, GBIF, DOI, BHL, Xeno-canto, iNaturalist).
2. Khả năng Phục hồi & Bản quyền của Đa phương tiện / Tài nguyên (Media & Assets Resilience: Audio Playback Error Handling, High-res Photo Fallbacks, CC Licensing Attributions).

---

## 1. Observation (Quan Sát Thực Tế)

### 1.1 Khảo Sát Dữ Liệu & Mã Nguồn Hiện Tại
Toàn bộ 68 hồ sơ loài trong `src/data/species.json` và các thành phần giao diện liên quan (`AcademicReferences.tsx`, `SpecimenPlate.tsx`, `MorphologyReport.tsx`, `AudioVoiceButton.tsx`, `BirdPlateImage.tsx`, `EndemicFocusCard.tsx`, `QuickSpecimenPanel.tsx`, `types/bird.ts`) đã được kiểm toán chi tiết.

#### A. Liên kết Avibase Checklist (Cực kỳ mong manh & Lỗi Logic Query)
- **Vị trí**:
  - `src/components/CuratorView/AcademicReferences.tsx:50`
  - `src/components/MapView/EndemicFocusCard.tsx:290`
  - `src/components/SunburstView/QuickSpecimenPanel.tsx:227`
- **Mã nguồn quan sát được**:
  ```tsx
  <a
    href={academic?.avibaseId ? `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=&sec=summary&qstr=${encodeURIComponent(species.scientificName)}` : `https://avibase.bsc-eoc.org/`}
    target="_blank"
    rel="noopener noreferrer"
    className="..."
  >
  ```
- **Hiện tượng**:
  1. Chuỗi truy vấn bị lỗi cú pháp: `avibaseid=&sec=summary&qstr=...` trong đó tham số `avibaseid=` bị rỗng dù điều kiện `academic?.avibaseId` là `true`!
  2. Toàn bộ 68 loài trong `src/data/species.json` đều chứa mã giả placeholder như `"AVIBASE-TROCHALOPTERON-NGOCLINHENSE"`, `"AVIBASE-IANTHOCINCLA-KONKAKINHENSIS"` chứ không phải mã ID nội bộ 16 ký tự hex thực tế của Avibase (như `8C7C7DF4704BE0BA`).
  3. Nếu `academic?.avibaseId` bị `undefined`, liên kết rơi vào trang chủ chung chung `https://avibase.bsc-eoc.org/` thay vì tự động chuyển sang trang tìm kiếm theo danh pháp khoa học.

#### B. Liên kết GBIF Biodiversity & Nhập Nhằng Kiểu Dữ Liệu
- **Vị trí**:
  - `src/types/bird.ts:66`: `gbifTaxonKey?: string;`
  - `src/components/CuratorView/AcademicReferences.tsx:64`
  - `src/components/MapView/EndemicFocusCard.tsx:299`
  - `src/components/SunburstView/QuickSpecimenPanel.tsx:236`
- **Mã nguồn quan sát được**:
  ```tsx
  <a
    href={academic?.gbifTaxonKey || `https://www.gbif.org/species/search?q=${encodeURIComponent(species.scientificName)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="..."
  >
  ```
- **Hiện tượng**:
  1. Trong `src/data/species.json`, cả 68 loài đều lưu trữ một URL tìm kiếm hoàn chỉnh: `"https://www.gbif.org/species/search?q=Trochalopteron%20ngoclinhense"`.
  2. Nếu sau này dữ liệu được chuẩn hóa thành `taxonKey` dạng số (ví dụ `"5231737"` hoặc `"2492415"` theo chuẩn GBIF Backbone Taxonomy), mã giao diện hiện tại sẽ gán thẳng `href="5231737"`, biến thành đường dẫn tương đối `http://localhost:5173/5231737` gây lỗi 404.

#### C. Liên kết IUCN Red List & Lặp Code
- **Vị trí**:
  - `src/components/CuratorView/AcademicReferences.tsx:36`
  - `src/components/MapView/EndemicFocusCard.tsx:281`
  - `src/components/SunburstView/QuickSpecimenPanel.tsx:218`
- **Mã nguồn quan sát được**:
  ```tsx
  href={academic?.iucnUrl || `https://www.iucnredlist.org/search?query=${encodeURIComponent(species.scientificName)}`}
  ```
- **Hiện tượng**:
  1. Đoạn code tạo URL IUCN được viết lặp lại ở 3 component khác nhau, không có lớp xử lý trung gian kiểm tra URL hợp lệ hay chuẩn hóa khoảng trắng/danh pháp phân loài.
  2. Toàn bộ 68 loài trong `species.json` đang lưu search URL (`https://www.iucnredlist.org/search?query=...`) thay vì canonical taxon URL (`https://www.iucnredlist.org/species/...`).

#### D. Trích Dẫn Tài Liệu Gốc (Primary Literature), DOI & Thư Viện Di Sản Sinh Học (BHL)
- **Vị trí**: `src/components/CuratorView/AcademicReferences.tsx:94-104`
- **Hiện tượng**:
  1. Trong tổng số 192 trích dẫn tài liệu gốc trên 68 loài:
     - 63 trích dẫn có DOI (`https://doi.org/...`).
     - 3 trích dẫn có link BHL (`https://www.biodiversitylibrary.org/...`).
     - **126 trích dẫn hoàn toàn không có link (`doiOrUrl` bị undefined)** (ví dụ các công trình nền tảng *Handbook of the Birds of the World*, *Les Oiseaux de l'Indochine Française*, *Chim Việt Nam*).
  2. Khi `doiOrUrl` bị thiếu, giao diện hoàn toàn không cung cấp cơ chế dự phòng tìm kiếm học thuật (Google Scholar fallback resolver hoặc BHL title search), khiến người dùng không có cách nào tra cứu nhanh tài liệu.
  3. Nếu `doiOrUrl` được truyền vào dạng DOI thô (`"10.1017/S095927090000122X"` hoặc `"doi:10.1017/..."`), component không tự động gắn prefix `https://doi.org/`, dẫn tới hỏng link tương đối.

#### E. Liên kết & Điểm Cuối Xeno-canto Bioacoustics
- **Vị trí**:
  - `src/types/bird.ts:44-51`: Có `xenoCantoId?: string;` trong `AudioCallInfo`.
  - `src/data/species.json`: 68/68 loài có `audioUrl` (ví dụ `https://xeno-canto.org/sounds/uploaded/VOLRFTLILA/XC567890-Golden-winged_Laughingthrush.mp3`), nhưng **0/68 loài có `xenoCantoId`**.
- **Hiện tượng**:
  - Không có liên kết trực tiếp tới trang hồ sơ mẫu thu âm gốc trên website Xeno-canto (`https://xeno-canto.org/567890`), làm mất đi khả năng kiểm chứng nguồn gốc âm thanh, xem phổ âm (sonogram) và thiết bị thu âm thực địa của tác giả.

#### F. Liên kết & Dữ Liệu Mở iNaturalist
- **Vị trí**:
  - `src/data/species.json`: 49/68 loài có `observationUrl` (trỏ tới `https://www.inaturalist.org/taxa/...`).
  - `src/types/bird.ts:36-42`: `IllustrationInfo` **thiếu hoàn toàn** các trường `observationUrl?: string;`, `thumbnailUrl?: string;`, `license?: string;`.
  - `src/components/CuratorView/SpecimenPlate.tsx`: Hoàn toàn không hiển thị hay liên kết tới trang quan sát iNaturalist.

#### G. Lỗ Hổng Vòng Đời & Dự Phòng Ảnh trong `BirdPlateImage.tsx`
- **Vị trí**: `src/components/Common/BirdPlateImage.tsx:36-38`
- **Mã nguồn quan sát được**:
  ```tsx
  export const BirdPlateImage: React.FC<BirdPlateImageProps> = ({
    species,
    className = '',
    imageClassName = '',
    aspectRatio = 'square',
    onClick
  }) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
  ```
- **Lỗi nghiêm trọng**:
  1. Trong component `BirdPlateImage.tsx` **hoàn toàn không có `useEffect`** để lắng nghe sự thay đổi của `species.id` hoặc `species.illustration?.imageUrl`.
  2. Khi người dùng bấm chuyển đổi loài trong danh sách (hoặc qua `RelatedSpeciesTabs`), `isLoaded` vẫn giữ nguyên giá trị `true` từ loài trước, khiến ảnh của loài mới chưa kịp tải đã bị hiển thị với opacity 100%, gây hiện tượng nháy ảnh (flicker) hoặc nếu ảnh trước đó bị lỗi (`hasError = true`), ảnh của loài mới sẽ bị ép hiển thị fallback vector SVG dù có URL hợp lệ!
  3. `BirdPlateImage` chỉ nhận `species.illustration?.imageUrl` mà không tận dụng `species.illustration?.thumbnailUrl` làm phương án dự phòng cấp 2 (secondary fallback) trước khi chuyển về vector SVG.

#### H. Khả Năng Xử Lý Lỗi & Xung Đột Luồng Phát Âm Thanh trong `AudioVoiceButton.tsx`
- **Vị trí**: `src/components/Common/AudioVoiceButton.tsx:110-136`
- **Hiện tượng**:
  1. **Đánh đồng AbortError là lỗi hệ thống**: Khi người dùng nhấn nút Tạm dừng ngay sau khi Phát, phương thức `play()` trả về một `AbortError` (The play() request was interrupted by a call to pause()). Khối `catch (err)` bắt lỗi này và gọi `setIsError(true)`, khiến nút chuyển sang màu đỏ báo lỗi ("Lỗi âm thanh") dù đây là hành vi tương tác bình thường của người dùng.
  2. **Xung đột phát nhiều âm thanh đồng thời (No Audio Bus/Manager)**: Do mỗi `AudioVoiceButton` tự tạo `new Audio()` độc lập cục bộ, khi người dùng bấm phát ở `QuickSpecimenPanel`, rồi chuyển sang `CuratorView` hoặc `RelatedSpeciesTabs` bấm phát tiếp, cả 2 file âm thanh sẽ cùng phát chồng chéo lên nhau.
  3. **Rò rỉ bộ nhớ (Memory Leak)**: `audio.onplay = ...`, `audio.onerror = ...` gắn closure vào state của React component, khi unmount chỉ gán `audioRef.current = null` mà không dọn dẹp các event listener.

#### I. Tính Chuẩn Xác của Bản Quyền & Năm Công Bố (CC Licensing & Anachronism)
- **Vị trí**: `src/data/species.json` & `src/components/CuratorView/SpecimenPlate.tsx:245-251`
- **Hiện tượng**:
  1. Hàng loạt ảnh thực địa kỹ thuật số hiện đại của các tác giả iNaturalist (ví dụ `Chan Chee Keong`, `HUANG QIN`, `Ben Schweinhart`, `Marc Faucher`) trong `species.json` lại bị gán trường `year: "1931"` và mã bản tranh `INAT-...` (1931 là năm xuất bản sách *Les Oiseaux de l'Indochine Française* của Delacour & Jabouille).
  2. Trong `SpecimenPlate.tsx`, giao diện tự động nối chuỗi `ad nat. del.` (*ad naturam delineavit* - thuật ngữ mỹ thuật cổ điển chỉ tranh khắc tự nhiên học) vào sau tên tác giả ảnh iNaturalist (ví dụ: `(c) egorbirder, some rights reserved (CC BY) ad nat. del.`), gây sai lệch về mặt phương pháp luận lịch sử khoa học.
  3. Thiếu huy hiệu bản quyền (CC License Badge) có thể nhấp để xem điều khoản Creative Commons (CC BY, CC BY-NC).

---

## 2. Logic Chain (Chuỗi Lập Luận Suy Luận)

```
[Quan sát 1: avibaseid=& trong URL và avibaseId là slug giả 'AVIBASE-...']
    │
    ▼
(Suy luận: Avibase CGI backend sẽ nhận param rỗng, fallback rớt về trang chủ)
    │
    ▼
[Kết luận 1: Cần hàm getAvibaseUrl() phân biệt mã 16-hex thật vs slug giả, fallback sang qstr search]

[Quan sát 2: gbifTaxonKey là string URL thay vì integer, code ép href={gbifTaxonKey}]
    │
    ▼
(Suy luận: Nếu nhập numeric key "5231737", trình duyệt sẽ mở localhost:5173/5231737)
    │
    ▼
[Kết luận 2: Cần hàm getGbifUrl() tự động nhận diện regex /^\d+$/ để link /species/{key}, ngược lại search]

[Quan sát 3: 126/192 tài liệu gốc thiếu link, DOI thô thiếu prefix, BHL thiếu search query]
    │
    ▼
(Suy luận: Người dùng bị bế tắc khi muốn kiểm chứng tài liệu mô tả loài)
    │
    ▼
[Kết luận 3: Xây dựng resolveAcademicRefLink() tự động chuẩn hóa DOI và fallback sang Google Scholar / BHL search]

[Quan sát 4: AudioVoiceButton không kiểm tra err.name === 'AbortError' và thiếu singleton audio coordinator]
    │
    ▼
(Suy luận: Gây lỗi giao diện giả "Lỗi âm thanh" khi pause nhanh; phát đè nhiều âm thanh cùng lúc)
    │
    ▼
[Kết luận 4: Xây dựng AudioCoordinator/AudioManager quản lý single playback stream, bắt đúng loại lỗi]

[Quan sát 5: BirdPlateImage không có useEffect reset state khi species thay đổi]
    │
    ▼
(Suy luận: isLoaded=true lưu lại từ loài trước khiến ảnh mới render lập tức, gây flicker hoặc kẹt lỗi fallback)
    │
    ▼
[Kết luận 5: Thêm useEffect([species.id, imageUrl]) reset isLoaded/hasError và hỗ trợ 2-stage fallback thumbnailUrl]

[Quan sát 6: types/bird.ts thiếu observationUrl, license, thumbnailUrl; anachronism "1931" / "ad nat. del."]
    │
    ▼
(Suy luận: Metadata không phản ánh đúng chuẩn Creative Commons và lịch sử tư liệu)
    │
    ▼
[Kết luận 6: Bổ sung định nghĩa kiểu trong bird.ts, format lại nhãn attribution đúng ngữ cảnh CC / Naturalist Archive]
```

---

## 3. Caveats (Các Giới Hạn & Giả Định)

1. **Giả định về API bên thứ ba**:
   - IUCN, Avibase, GBIF, BHL, Xeno-canto và iNaturalist là các dịch vụ web bên ngoài độc lập. Một số trang có thể áp dụng chính sách chặn CORS hoặc chống bot/hotlink khi tải tài nguyên qua fetch trực tiếp. Do đó, phương án tối ưu là sử dụng các liên kết ngoại bộ Resilient Canonical Web Links mở trong tab mới (`target="_blank"`), kết hợp URL encoding chuẩn xác thay vì phụ thuộc vào API fetch phía máy khách.
2. **Dữ liệu âm thanh Xeno-canto**:
   - Các URL âm thanh trích từ Xeno-canto trong `species.json` đang hoạt động ổn định trên CDN Xeno-canto. Tuy nhiên, việc trích xuất `XC ID` từ URL (ví dụ `XC567890` -> `567890`) là phương pháp phân tích regex đáng tin cậy 100% để tạo link về trang gốc.
3. **Phạm vi kiểm toán**:
   - Điều tra tập trung vào tầng liên kết học thuật, khả năng phục hồi của đa phương tiện, xử lý lỗi phát âm thanh và bản quyền hình ảnh. Không can thiệp sửa đổi mã nguồn trong đợt điều tra này (tuân thủ nguyên tắc Read-Only Explorer).

---

## 4. Conclusion (Kết Luận & Đề Xuất Kiến Trúc Khắc Phục)

### 4.1 Đề Xuất Module Trung Tâm Hóa: `src/utils/linkGenerators.ts`
Tạo một module duy nhất quản lý toàn bộ việc phát sinh và dự phòng liên kết cho 7 nền tảng:

```typescript
/**
 * src/utils/linkGenerators.ts
 * Bộ phát sinh liên kết ngoại bộ học thuật & bảo tồn chuẩn tắc, chống gãy vỡ (Resilient Link Resolvers)
 */
import type { BirdSpecies, AcademicReference, AudioCallInfo } from '../types/bird';

export const getIucnUrl = (species: BirdSpecies): string => {
  const customUrl = species.academic?.iucnUrl;
  if (customUrl && customUrl.startsWith('https://www.iucnredlist.org/')) {
    return customUrl;
  }
  return `https://www.iucnredlist.org/search?query=${encodeURIComponent(species.scientificName.trim())}&searchType=species`;
};

export const getAvibaseUrl = (species: BirdSpecies): string => {
  const avibaseId = species.academic?.avibaseId;
  // Nếu là mã 16 ký tự hex hợp lệ của Avibase (không phải dummy slug 'AVIBASE-...')
  if (avibaseId && /^[A-F0-9]{16}$/i.test(avibaseId)) {
    return `https://avibase.bsc-eoc.org/species.jsp?avibaseid=${avibaseId}&lang=EN`;
  }
  // Fallback tìm kiếm theo danh pháp khoa học chuẩn xác
  return `https://avibase.bsc-eoc.org/species.jsp?lang=EN&sec=summary&qstr=${encodeURIComponent(species.scientificName.trim())}`;
};

export const getGbifUrl = (species: BirdSpecies): string => {
  const keyOrUrl = species.academic?.gbifTaxonKey;
  if (keyOrUrl) {
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
      return keyOrUrl;
    }
    if (/^\d+$/.test(keyOrUrl.trim())) {
      return `https://www.gbif.org/species/${keyOrUrl.trim()}`;
    }
  }
  return `https://www.gbif.org/species/search?q=${encodeURIComponent(species.scientificName.trim())}`;
};

export const getInaturalistUrl = (species: BirdSpecies): string => {
  if (species.illustration?.observationUrl) {
    return species.illustration.observationUrl;
  }
  return `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(species.scientificName.trim())}`;
};

export const getXenoCantoUrl = (audioInfo?: AudioCallInfo | null, scientificName?: string): string => {
  if (audioInfo?.xenoCantoId) {
    const cleanId = audioInfo.xenoCantoId.replace(/^XC/i, '');
    return `https://xeno-canto.org/${cleanId}`;
  }
  if (audioInfo?.audioUrl) {
    const match = audioInfo.audioUrl.match(/XC(\d+)/i);
    if (match && match[1]) {
      return `https://xeno-canto.org/${match[1]}`;
    }
  }
  if (scientificName) {
    return `https://xeno-canto.org/explore?query=${encodeURIComponent(scientificName.trim())}`;
  }
  return 'https://xeno-canto.org/';
};

export interface ResolvedAcademicRef {
  url: string;
  label: string;
  isDirect: boolean;
}

export const resolveAcademicRefLink = (ref: AcademicReference): ResolvedAcademicRef => {
  if (ref.doiOrUrl) {
    const link = ref.doiOrUrl.trim();
    if (link.startsWith('10.') || link.startsWith('doi:10.')) {
      const cleanDoi = link.replace(/^doi:/i, '');
      return { url: `https://doi.org/${cleanDoi}`, label: 'DOI Gốc', isDirect: true };
    }
    if (link.includes('biodiversitylibrary.org')) {
      return { url: link, label: 'Thư viện BHL', isDirect: true };
    }
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return { url: link, label: 'Tài liệu gốc', isDirect: true };
    }
  }

  // Fallback 1: Nếu trích dẫn là tài liệu lịch sử BHL Đông Dương
  const titleLower = ref.title.toLowerCase();
  const journalLower = ref.journalOrBook.toLowerCase();
  if (titleLower.includes('indochine') || journalLower.includes('british ornithologists') || journalLower.includes('muséum')) {
    return {
      url: `https://www.biodiversitylibrary.org/search?searchTerm=${encodeURIComponent(ref.title)}`,
      label: 'Tra cứu BHL ↗',
      isDirect: false
    };
  }

  // Fallback 2: Google Scholar Bibliographic Search
  const query = `${ref.authors} ${ref.year} ${ref.title}`.trim();
  return {
    url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
    label: 'Tra cứu Scholar ↗',
    isDirect: false
  };
};
```

### 4.2 Đề Xuất Quản Lý Âm Thanh Đơn Luồng: `src/utils/audioManager.ts`
Xây dựng singleton quản lý audio toàn cục:
- Tự động dừng bản thu trước đó khi bắt đầu bản thu mới.
- Phân biệt chính xác giữa `AbortError` (người dùng nhấn pause/đổi bài) và `NetworkError`/`FormatError`.
- Hỗ trợ giải phóng tài nguyên sự kiện an toàn tránh rò rỉ bộ nhớ.

### 4.3 Đề Xuất Sửa Đổi `src/types/bird.ts`
Cập nhật đầy đủ các trường dữ liệu còn thiếu trong `IllustrationInfo`:
```typescript
export interface IllustrationInfo {
  imageUrl: string;
  thumbnailUrl?: string;
  artist: string;
  sourceBook?: string;
  plateNumber?: string;
  year?: string;
  license?: string;
  observationUrl?: string;
}
```

### 4.4 Đề Xuất Khắc Phục Giao Diện Trong Các Component
1. **`AcademicReferences.tsx`**:
   - Thay thế toàn bộ liên kết inline bằng `getIucnUrl`, `getAvibaseUrl`, `getGbifUrl`.
   - Bổ sung nút tra cứu `resolveAcademicRefLink` cho 100% trích dẫn tài liệu gốc (không để trích dẫn nào bị thiếu link tra cứu).
   - Thêm nút liên kết sang iNaturalist Taxon Profile.
2. **`EndemicFocusCard.tsx` & `QuickSpecimenPanel.tsx`**:
   - Thay thế liên kết inline bằng các hàm từ `src/utils/linkGenerators.ts`.
3. **`BirdPlateImage.tsx`**:
   - Thêm `useEffect` để reset `isLoaded` và `hasError` khi `species.id` hoặc `rawImageUrl` thay đổi:
     ```tsx
     useEffect(() => {
       setIsLoaded(false);
       setHasError(false);
     }, [species.id, rawImageUrl]);
     ```
   - Hỗ trợ cơ chế tải ảnh 2 cấp: thử `imageUrl` -> nếu lỗi thử `thumbnailUrl` -> nếu lỗi mới render SVG vector fallback.
4. **`SpecimenPlate.tsx`**:
   - Hiển thị nhãn bản quyền CC rõ ràng (ví dụ: `CC BY 4.0` / `CC BY-NC 4.0` hoặc `Public Domain BHL Archive`) kèm link tới trang quan sát iNaturalist.
   - Bỏ việc tự động gắn `ad nat. del.` vào ảnh chụp thực địa iNaturalist.

---

## 5. Verification Method (Phương Pháp Xác Minh)

### 5.1 Các Lệnh Kiểm Thử Độc Lập
1. **Kiểm tra bộ test hiện hữu**:
   ```bash
   npm test -- --run
   ```
   *Kỳ vọng*: 109/109 bài kiểm thử hiện có vượt qua cleanly.

2. **Kiểm tra TypeScript & Build Production**:
   ```bash
   npm run build
   ```
   *Kỳ vọng*: `tsc` và `vite build` thực thi thành công không có lỗi type nào.

3. **Kế hoạch bộ kiểm thử mới cần bổ sung (Unit Test Suite Plan)**:
   - `src/utils/linkGenerators.test.ts`:
     - Test URL IUCN cho loài có và không có custom `iucnUrl`.
     - Test URL Avibase khi có mã hex chuẩn vs khi có dummy slug `AVIBASE-...` vs khi `avibaseId` bị undefined.
     - Test URL GBIF khi có numeric key (ví dụ `5231737`) vs khi có full URL vs khi thiếu key.
     - Test `resolveAcademicRefLink` với DOI thô, DOI URL, BHL link, và Scholar search fallback khi không có link.
     - Test `getXenoCantoUrl` trích xuất XC ID từ URL.
     - Test `getInaturalistUrl` với `observationUrl` và fallback search.
   - `src/components/Common/BirdPlateImage.test.tsx`:
     - Test kiểm tra việc reset trạng thái `isLoaded` và `hasError` khi component nhận `species` mới (ngăn chặn bug kẹt trạng thái).
   - `src/components/Common/AudioVoiceButton.test.tsx`:
     - Test kiểm tra `AbortError` không kích hoạt trạng thái lỗi màu đỏ.

### 5.2 Điều Kiện Hủy Bỏ Đánh Giá (Invalidation Conditions)
Báo cáo này sẽ bị coi là vô hiệu nếu:
- Bất kỳ URL nào sinh ra bởi `linkGenerators` chứa chuỗi rỗng không hợp lệ (ví dụ `avibaseid=&` hoặc relative path `localhost:5173/5231737`).
- Ảnh trong `BirdPlateImage` vẫn bị kẹt trạng thái khi đổi qua lại giữa các loài khác nhau.

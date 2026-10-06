# Project: Vietnam Birds Visualizer — Adversarial Audit & Hardening

## Architecture
- **Framework**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **GIS Mapping**: Leaflet + React-Leaflet with trigonometric Spider Radial Offset for coincident points, cached DivIcons, EBA boundaries, and Vietnam sovereignty territorial markers.
- **Taxonomic Visualization**: D3.js hierarchical cladogram & radial phylogenetic tree with collapse/expand state persistence in Context, boundary-aware radial label truncation, and scoped hover opacity transitions.
- **Media Engine**: HTML5 Audio + Web Audio singleton `AudioManager` with AbortError filtering, single-stream concurrency control, and two-stage image fallback (`imageUrl` -> `thumbnailUrl` -> vector SVG) in `BirdPlateImage`.
- **External Integration Resolvers**: Centralized `src/utils/linkGenerators.ts` providing resilient URL resolvers for IUCN, Avibase (16-hex vs query fallback), GBIF (numeric key vs search), DOI/CrossRef (normalized prefix), BHL, Xeno-canto (XC-ID parser), and iNaturalist.
- **Bundle Architecture**: Rollup manualChunks configuration separating `vendor-react`, `vendor-leaflet`, `vendor-d3`, `vendor-icons`, `data-species`, and `index` (all chunks < 205 kB).
- **Test Suite**: Vitest + React Testing Library + jsdom (30 test suites, 186 unit, integration, and adversarial stress tests, 100% pass rate).

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---------|-------------|-----------|--------|--------|
| 1 | Academic & Conservation Criteria Links | Resilient link resolution for IUCN, Avibase, GBIF, DOI, BHL, and Xeno-canto | M1, M3 | VERIFIED | ORIGINAL_REQUEST §R1 |
| 2 | UI/UX & Responsive Viewports | Multi-screen responsiveness (desktop 4K/1080p, laptop 1366x768, tablet, mobile), scroll trap & z-index prevention | M1, M3 | VERIFIED | ORIGINAL_REQUEST §R1 |
| 3 | Leaflet GIS Mapping Stability | Marker clustering, coordinate precision, EBA boundaries, sovereignty markers, tile error fallbacks, memory leak cleanup | M1, M3 | VERIFIED | ORIGINAL_REQUEST §R1 |
| 4 | D3 Taxonomic Cladogram & Radial Wheel | Node transitions, tree state retention, label clipping avoidance, responsive SVG viewBox | M1, M3 | VERIFIED | ORIGINAL_REQUEST §R1 |
| 5 | Media & Audio Streaming Resilience | Audio player error handling, audio format fallback, high-res photo fallback, CC licensing metadata display | M1, M3 | VERIFIED | ORIGINAL_REQUEST §R1 |
| 6 | TypeScript Safety & Diagnostics | Eliminate any/untyped casts, enforce strict interfaces for all taxonomic and GIS models | M2, M3 | VERIFIED | ORIGINAL_REQUEST §R2 |
| 7 | Performance & Chunk Splitting | Profile bundle size, configure manual Rollup chunk splitting to reduce 700KB chunk, optimize React memoization | M2, M3 | VERIFIED | ORIGINAL_REQUEST §R2 |
| 8 | Automated Regression Hardening | Unit & integration tests for all link resolvers, bug fixes, and edge cases (186 tests) | M3, M5 | VERIFIED | ORIGINAL_REQUEST §R3 |
| 9 | Comprehensive Audit & Roadmap Report | Exhaustive documentation in `docs/AUDIT_AND_ROADMAP.md` covering flaw taxonomy, link architecture, fixes, and future roadmap | M4 | VERIFIED | ORIGINAL_REQUEST §R3 |
| 10 | Quality Guardrails Verification | 100% tests passing, clean build with zero errors/warnings, strict type check | M5 | VERIFIED | ORIGINAL_REQUEST §Acceptance Criteria |
| 11 | Scalable Avifauna Dataset & Batch Ingestion | Phased scaling to all Vietnam bird species (~920+ species) with GBIF/IUCN/XC verification | M6 | IN_PLANNING | USER_REQUEST §Expansion |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Multi-Surface Flaw Audit | In-depth audit of academic links, UI/UX viewports, Leaflet GIS, D3 Cladogram, Audio/Media | none | DONE |
| 2 | Code Quality & Bundle Diagnostics | Audit TypeScript types, profile Vite bundle, check React memoization & re-renders | none | DONE |
| 3 | Hardening & P0/P1 Bug Fixes | Fix link resolvers, UI/GIS/D3/Audio bugs, optimize Rollup chunks & types, expand test suite | M1, M2 | DONE |
| 4 | Audit & Roadmap Report | Author comprehensive report in `docs/AUDIT_AND_ROADMAP.md` | M1, M2, M3 | DONE |
| 5 | Verification & Quality Guardrails | Full test suite verification, build verification, auditor integrity sign-off | M3, M4 | DONE |
| 6 | Avifauna Scale-up Pipeline | Phased expansion across 4 phases via atomic batches (5-10 species), zero-regression gatekeeper | M5 | IN_PLANNING |

## Code Layout
- `src/components/Common/`: `BirdPlateImage.tsx`, `AudioVoiceButton.tsx`, `ConservationBadge.tsx`, `EndemicBadge.tsx`, etc.
- `src/components/MapView/`: `VietnamEBAMap.tsx`, `EBARegionLegend.tsx`, `EndemicFocusCard.tsx`
- `src/components/SunburstView/`: `SunburstWheel.tsx`, `CladogramTreeView.tsx`, `QuickSpecimenPanel.tsx`
- `src/components/CuratorView/`: `CuratorView.tsx`, `AcademicReferences.tsx`, `SpecimenPlate.tsx`, `MorphologyReport.tsx`
- `src/utils/`: `linkGenerators.ts`, `audioManager.ts`, `taxonomyUtils.ts`
- `src/types/`: `bird.ts`, `taxonomy.ts`, `map.ts`, `index.ts`
- `src/tests/` / `src/**/*.test.ts(x)`: Vitest test suites (30 test files, 186 tests)
- `docs/`: `AUDIT_AND_ROADMAP.md`

## Avian Data Curation & Verification Protocol
Quy tắc phân định vai trò giữa API chính thức và Web Search khi cập nhật/kiểm định dữ liệu loài chim:

1. **Khung xương dữ liệu kỹ thuật (Technical Skeleton) — BẮT BUỘC ƯU TIÊN QUA API / SCRIPT**:
   - Mã định danh học thuật, Cây phân loại (Order/Family/Genus): Lấy qua **GBIF Species API** (`api.gbif.org`).
   - Hình ảnh thực địa có giấy phép mở CC tại Việt Nam: Lấy qua **iNaturalist API** (`api.inaturalist.org`).
   - Âm thanh tiếng hót thực địa: Lấy qua **Xeno-canto API** (`xeno-canto.org`).
   - Trạng thái Sách Đỏ toàn cầu & Đánh giá mới nhất: Lấy qua **IUCN Red List API** (`iucnredlist.org`).
   - *Lệnh kiểm tra nhanh:* Chạy `npm run data:audit -- --name="<Tên loài>"` hoặc `npm run data:verify` trước khi commit.

2. **Phân tích bối cảnh học thuật sâu (Deep Context & Literature) — SỬ DỤNG WEB SEARCH / BHL / SCHOLAR**:
   - Sử dụng Web Search và các kho lưu trữ số (Biodiversity Heritage Library, Forktail, IOC Checklist) khi cần:
     + Truy vết lịch sử mô tả mẫu chuẩn loài (Type specimen, Delacour 1927, Robinson & Kloss 1919...).
     + Giải thích nguyên nhân phân loại / tách loài mới (Split rationale từ các nghiên cứu di truyền phát sinh).
     + Đối soát và phát hiện nhầm lẫn tên gọi dân gian theo vùng miền hoặc sai lệch dịch thuật.

3. **Hàng rào Chuẩn hoá Tên tiếng Việt 3 Lớp & Cơ chế Tam diện Đối soát (3-Tier Canonical Naming Firewall & 3-Pillar Triangulation)**:
   - **Phòng chống AI Hallucination & Single Point of Failure**: Tuyệt đối **KHÔNG** tự động dịch thuật bằng AI hoặc suy diễn tên qua LLM. Không phụ thuộc vào một cuốn sách đơn lẻ để tránh lỗi in ấn hay định kiến cá nhân.
   - **Cơ chế Tam diện Đối soát (3-Pillar Triangulation)**: Một tên tiếng Việt chỉ được công nhận làm tên chuẩn khi có sự đồng thuận của ít nhất 2 trên 3 trụ cột độc lập:
     + *Trụ cột 1 (Thực địa cập nhật nhất)*: Richard Craik & Lê Quý Minh (2018) — *Birds of Vietnam* (Lynx Edicions / Birding Vietnam), đồng bộ phân loại học IOC.
     + *Trụ cột 2 (Học thuật & Pháp lý quốc gia)*: GS. Võ Quý & TS. Nguyễn Cử (VAST / Viện Sinh thái và Tài nguyên Sinh vật), Sách Đỏ Việt Nam, Nghị định 84/2021/NĐ-CP.
     + *Trụ cột 3 (Cộng đồng Điểu học Quốc tế & eBird)*: Avibase Vietnam Checklist (TS. Denis Lepage) & eBird Vietnam Checklist (do mạng lưới nhà điểu học thực địa đóng góp).
   - **Tầng 1 (Immutable Master Table)**: File thẩm quyền trung tâm `scripts/data-pipeline/authority/vietnam-bird-names-master.json` là Single Source of Truth kỹ thuật bất biến. Mỗi loài chỉ có 1 `vietnameseName` chuẩn tắc, toàn bộ tên biến thể/dân gian/tên cũ được gom vào mảng `aliases`. Mọi thay đổi đều phải ghi nhận dấu vết kiểm toán (`authority`).
   - **Tầng 2 (Dual Ingestion Check & Cross-Validation)**: Khi ingest loài mới (BL-12), script tự động so khớp `scientificName` với Master Registry. Nếu không tìm thấy hoặc có độ lệch danh pháp, pipeline từ chối commit và yêu cầu thẩm định chuyên gia thủ công.
   - **Tầng 3 (Automated Pre-commit Gatekeeper Test)**: Test suite `src/tests/namingFirewall.test.ts` duyệt 100% loài trong `species.json`, xác minh tính nhất quán 1:1 với master registry và `taxonomy.json`, đồng thời chặn đứng các tên giả định hoặc biến thể sai sót trong danh sách đen (Blacklist Gatekeeper).

4. **Quy tắc Giám tuyển & Hàng rào Kiểm định Hình ảnh Thực địa (Field Photo Curation Protocol & 3-Tier Image Firewall)**:
   - **Nguyên tắc cốt lõi (Core Invariants)**:
     + **Đúng loài tuyệt đối**: Ảnh BẮT BUỘC phải đúng 100% loài mục tiêu (`photo.taxon.name === species.scientificName`). Ảnh không đúng loài **TUYỆT ĐỐI KHÔNG SỬ DỤNG**.
     + **Phân loại xuất xứ & Quy tắc chú thích địa điểm**:
       * *Trường hợp 1 (Chụp thực tế tại Việt Nam — `isShotInVietnam: true`)*: Bắt buộc ghi rõ thông tin địa điểm trong `photoLocation` (ví dụ: `VQG Cát Tiên, Lâm Đồng`, `VQG Bidoup Núi Bà`). Giao diện sẽ hiển thị huy hiệu `📍 Chụp tại: [Địa điểm]` để tôn vinh tư liệu tự nhiên học Việt Nam.
       * *Trường hợp 2 (Đúng loài nhưng chụp ngoài lãnh thổ Việt Nam — `isShotInVietnam: false`)*: Dùng phục vụ định danh hình thái học của loài, nhưng **TUYỆT ĐỐI KHÔNG CHÚ THÍCH ĐỊA ĐIỂM** (`photoLocation` để trống) để tránh người dùng hiểu lầm rằng ảnh được chụp tại Việt Nam.
     + **Quy trình khi không có ảnh (Zero-Photo Escalation)**: Nếu một loài không tìm thấy ảnh mở có bản quyền hợp lệ (CC), script nạp dữ liệu KHÔNG ĐƯỢC tự ý gán ảnh bừa bãi hay suy đoán sang loài khác/cấp chi, mà phải **báo cáo trực tiếp cho Người dùng/Giám sát** để thống nhất hướng xử lý (dùng họa bản khắc cổ BHL, tìm nguồn ảnh bảo tồn địa phương, hoặc gắn cờ chờ bổ sung).
   - **Hàng rào Kỹ thuật Kiểm định 3 Lớp khi Nạp Loài mới (3-Tier Image Ingestion Firewall)**:
     + **Tầng 1 (Rank & Taxon Strict Match — Chặn lỗi cấp phân loại)**: Bắt buộc chỉ định `rank=species` khi truy vấn iNaturalist API (`/taxa?q={name}&rank=species`). Loại bỏ hoàn toàn lỗi trỏ nhầm cấp Chi (`genus`) từng xảy ra với *Gallus gallus* (trỏ nhầm Taxon 879 Chi *Gallus* dẫn đến ảnh *Gallus varius*). Kiểm tra nghiêm ngặt `photo.taxon.name === species.scientificName`.
     + **Tầng 2 (Geo Bounding Box & Wild Research Grade Filter)**: Ưu tiên lọc quan sát thực địa tại Việt Nam (`place_id=7155`, tọa độ GPS nằm trong lãnh thổ VN) với tiêu chí `quality_grade=research` và `captive=false` (loại trừ chim nuôi nhốt, gà nhà thả rông, cá thể lai tạp).
     + **Tầng 3 (Visual Plate Grid & Pre-commit Human Gatekeeper)**: Xuất bảng kiểm trực quan (Visual Plate Grid) thu nhỏ gồm ảnh kèm tên khoa học và tác giả trước mỗi đợt nạp dữ liệu, kết hợp script `scan-image-discrepancies.js` xác nhận 100% HTTP 200 OK và không lệch taxon trước khi commit.

5. **Quy trình Kiểm định & Hàng rào Liên kết Học thuật Quốc tế (Global Academic Registries Curation Protocol)**:
   - **IUCN Red List**:
     + *Hiện tượng 404*: Phát sinh do chu kỳ cập nhật đánh giá (Assessment Cycle updates 2023/2024 làm thay đổi `assessment_id`) và các loài mới tách loài gần đây chưa có hồ sơ đánh giá độc lập (Not Evaluated - NE).
     + *Cơ chế xử lý*: Đồng bộ Assessment ID mới nhất (`200 OK`) cho các loài đã có trang (như *Cutia legalleni*, *Garrulax annamensis*, *Schoeniparus klossi*). Với các loài mới tách chưa có trang riêng (*Prinia rocki*, *Locustella idonea*, *Tropicoperdix tonkinensis*), tự động chuyển sang Search URL chính thức (`https://www.iucnredlist.org/search?query=${scientificName}&searchType=species`) — bảo đảm 100% không bao giờ gặp lỗi 404.
   - **Avibase Checklist**:
     + *Nguyên tắc bắt buộc*: Trang chi tiết loài `species.jsp` của Avibase bắt buộc phải có tham số `avibaseid` (16-char hex).
     + *Phòng chống sai lệch từ Wikidata*: Không tin cậy mù quáng vào Wikidata (tránh rủi ro gán nhầm mã phân loài cũ hoặc lỗi cộng đồng như từng gặp với *Laniellus langbianis*).
     + *Cơ chế xử lý chuẩn*: Trích xuất và đối soát trực tiếp 1:1 từ **Avibase Vietnam Checklist chính thức** (`https://avibase.bsc-eoc.org/checklist.jsp?region=VN`) do TS. Denis Lepage công bố. Nếu thiếu mã, cơ chế fallback an toàn tự động chuyển sang cổng tìm kiếm `https://avibase.bsc-eoc.org/search.jsp?qstr=${scientificName}` thay vì gọi `species.jsp`.
   - **GBIF Biodiversity & iNaturalist**:
     + Kiểm định tự động 100% `gbifTaxonKey` qua GBIF API (`api.gbif.org/v1/species/{key}`) và `observationUrl` qua iNaturalist API (`api.inaturalist.org/v1/taxa/{id}`). Tuyệt đối không commit bản ghi khi API trả về lỗi hoặc taxon không tồn tại.

6. **Quy trình 2 Giai đoạn Nạp Loài Mới & Hàng rào Chốt chặn (2-Stage Ingestion & Quality Gatekeeper Pipeline)**:
   - **Nguyên tắc cốt lõi (Zero Database Pollution)**: Dữ liệu thu thập từ các API tuyệt đối không ghi thẳng vào database chính (`species.json`), mà phải đi qua vùng đệm Staging dự thảo (`scripts/data-pipeline/drafts/candidate-species.json`).
   - **Giai đoạn 1: Thu thập API (API Harvester)**:
     + Lệnh: `npm run species:harvest -- --name="<Tên khoa học>"`
     + Thu thập đa nguồn: GBIF Taxonomy, iNaturalist Research Grade (CC, rank species, bộ lọc Việt Nam), Xeno-canto audio, IUCN canonical, Avibase checklist.
   - **Giai đoạn 2: Hàng rào Kiểm toán Chốt chặn (4 Quality Gatekeeper Tests)**:
     + Lệnh: `npm run species:verify`
     + Test 1: Khớp 1:1 tên tiếng Việt trong Master Registry (Craik & Minh 2018 / VAST), chặn AI hallucination.
     + Test 2: Ảnh 100% đúng loài, rank species, tuân thủ xuất xứ địa điểm (chụp tại VN -> có địa danh, ngoài VN -> rỗng), kiểm tra HTTP 200 OK của ảnh.
     + Test 3: GBIF key phản hồi 200 từ API, IUCN không bị 404, Avibase ID chuẩn.
     + Test 4: Cây phân loại đầy đủ Bộ/Họ/Chi và tọa độ GPS hợp lệ tại Việt Nam.
   - **Điều kiện Commit Nguyên tử (Atomic Commit & Regression Check)**:
     + Lệnh: `npm run species:commit`
     + CHỈ KHI và CHỈ KHI 100% các bài test đều PASS: Đồng bộ nguyên tử vào `species.json` và nhánh `taxonomy.json`, sau đó chạy `npm test`. Nếu phát hiện lỗi hồi quy ➔ Tự động ROLLBACK về nguyên trạng ban đầu!
   - **Lệnh All-in-One an toàn**:
     + `npm run species:add -- --name="<Tên khoa học>"` (chạy tuần tự Harvest ➔ Verify ➔ Commit có rollback).

7. **Quy chuẩn Âm học Sinh học, Văn phong Giám tuyển & Đồng bộ Khám phá (Bio-acoustics, Curator Voice & Shuffle Deck Protocols)**:
   - **Quy chuẩn Âm học Sinh học (Bio-acoustics Protocol)**:
     + *Cơ chế phát trực tiếp Xeno-canto*: Kể từ 10/10/2025, Xeno-canto đã chuyển sang API v3 (yêu cầu API key khi truy vấn danh sách JSON). Tuy nhiên endpoint tải/phát âm thanh trực tiếp (`https://xeno-canto.org/<id>/download`) vẫn mở công khai, trả về HTTP 200 OK kèm header CORS `access-control-allow-origin: *`, hoạt động tốt trong thẻ `<audio>`.
     + *Loài không có minh quản chức năng (Non-syrinx Anatomy)*: Với các loài kền kền Cựu Thế giới (*Accipitridae*) và hạc/già đẫy (*Ciconiidae*) không có cơ quan phát âm (minh quản - syrinx) thực thụ, tuyệt đối không gán file tiếng hót giả. Thay vào đó, đặt `audioCall: null` và giải thích sinh học chi tiết trong `diagnosticFeatures` về cơ chế rít hơi vòm họng (*guttural hiss*) hoặc gõ mỏ dồn dập (*bill-clattering / mandible clapping*).
     + *Chính sách bảo tồn giới hạn âm thanh (Restricted Species)*: Với các loài bị đe dọa bẫy bắt thương mại bằng loa phát tiếng chim dụ mồi (như Sẻ đồng ngực vàng *Emberiza aureola*), tôn trọng chính sách bảo mật âm thanh toàn cầu của Xeno-canto (Restricted Recording) và ghi chú rõ lý do bảo tồn trong mục nhận dạng.
   - **Quy chuẩn Văn phong Giám tuyển (Curator Voice Guidelines)**:
     + *Phong cách bảo tàng lịch sử tự nhiên*: Giữ giọng văn điềm tĩnh, trang nhã, giàu tri thức hình thái, sinh cảnh và vị thế phân loại học.
     + *Tiết chế bi kịch & kịch tính*: Tuyệt đối không lạm dụng các tính từ giật gân hay cụm từ quá bi kịch (*"bi kịch khốc liệt nhất lịch sử"*, *"bản cáo trạng đau lòng"*, *"xé toang bầu trời"*, *"vùng đất chết"*). Trình bày áp lực bảo tồn và hiện trạng quần thể một cách khách quan, khoa học và đĩnh đạc.
   - **Cơ chế Đồng bộ Hàng đợi Khám phá (Shuffle Deck Auto-Reconciliation)**:
     + Mọi đợt nạp loài mới vào `species.json` đều phải đảm bảo `TaxonomyContext` tự động đối chiếu `allSpeciesData` với `localStorage` (`agy_avifauna_shuffle_pool`).
     + Mọi loài mới chưa từng được khám phá phải được chèn ngay vào bộ bài ngẫu nhiên để người dùng có thể bốc trúng ngay trong các lượt "Khám phá ngẫu nhiên" tiếp theo mà không bị kẹt bởi cache cũ.
8. **Chuẩn hóa Khung Pháp lý Bảo tồn Quốc gia (National Conservation Legal Framework - Directive 04/CT-TTg)**:
   - **Hệ thống chuẩn 07 Vùng chim đặc hữu (EBA)**: Khớp 100% với văn bản Chỉ thị 04/CT-TTg của Thủ tướng Chính phủ và danh mục BirdLife International:
     1. `hoang-lien-son`: Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan (s073)
     2. `northeast-mountains`: Vùng núi Đông Bắc & Đá vôi Bắc Bộ (s074)
     3. `annam-lowlands`: Vùng Đất thấp miền Trung (EBA 142)
     4. `kontum-plateau`: Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh (EBA 144)
     5. `dalat-plateau`: Cao nguyên Đà Lạt / Lâm Viên (EBA 143)
     6. `cochinchina`: Vùng đồng bằng & rừng đất thấp Nam Bộ (EBA 145)
     7. `lower-mekong-basin`: Vùng đất ngập nước Hạ lưu sông Mê Kông (EBA 145b / EAAFP)
   - **Cấu trúc trường pháp lý (`legalFramework`) trong `species.json`**:
     + `decree84Group`: Nhóm IB (nghiêm cấm thương mại) hoặc Nhóm IIB (hạn chế thương mại) theo Nghị định 84/2021/NĐ-CP.
     + `decree160Priority`: Thuộc Danh mục loài nguy cấp, quý, hiếm được ưu tiên bảo vệ theo Nghị định 160/2013/NĐ-CP & 64/2019/NĐ-CP.
     + `directive04Flagship`: Đích danh loài cờ đầu được nêu gương trong Chỉ thị 04/CT-TTg (Sếu đầu đỏ, Cò thìa mặt đen, Rẽ mỏ thìa).
     + `isEaafpMigratory`: Thuộc nhóm chim nước di cư dọc Tuyến đường bay chim nước di cư tuyến Úc - Đông Á (EAAFP).

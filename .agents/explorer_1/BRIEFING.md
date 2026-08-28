# BRIEFING — 2026-08-28T06:28:00Z

## Mission
Điều tra toàn diện về độ ổn định của các liên kết học thuật & bảo tồn (Academic & Conservation Criteria Link Stability) và khả năng phục hồi của đa phương tiện/tài nguyên (Media & Assets Resilience) trong dự án Vietnam Birds Visualizer.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_1
- Original parent: 7ad27185-9ec6-4df8-ad9e-c454f1614d85
- Milestone: External Links & Media Resilience Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Respond in Vietnamese
- Self-contained handoff report with 5 components
- Explain commands before execution

## Current Parent
- Conversation ID: 7ad27185-9ec6-4df8-ad9e-c454f1614d85
- Updated: 2026-08-28T06:28:00Z

## Investigation State
- **Explored paths**:
  - `src/types/bird.ts`
  - `src/data/species.json`, `ebas.json`, `taxonomy.json`
  - `src/components/CuratorView/AcademicReferences.tsx` & `.test.tsx`
  - `src/components/CuratorView/SpecimenPlate.tsx` & `.test.tsx`
  - `src/components/CuratorView/MorphologyReport.tsx`
  - `src/components/CuratorView/CuratorView.tsx`
  - `src/components/CuratorView/RelatedSpeciesTabs.tsx`
  - `src/components/Common/AudioVoiceButton.tsx` & `.test.tsx`
  - `src/components/Common/BirdPlateImage.tsx` & `.test.tsx`
  - `src/components/Common/MethodologyModal.tsx`
  - `src/components/Footer/MuseumFooter.tsx`
  - `src/components/MapView/EndemicFocusCard.tsx`
  - `src/components/SunburstView/QuickSpecimenPanel.tsx`
  - `src/data/validateData.test.ts`
  - `scripts/verify-dataset.js`
- **Key findings**:
  1. **Avibase Link Bug**: Chuỗi truy vấn bị rỗng `avibaseid=&sec=summary&qstr=...`, `avibaseId` trong `species.json` là chuỗi placeholder `AVIBASE-...` thay vì 16-hex ID, fallback khi thiếu ID lại trỏ về trang chủ thay vì tìm kiếm loài.
  2. **GBIF Ambiguity**: `gbifTaxonKey` trong `species.json` chứa full search URL thay vì integer key; nếu gán key dạng số thì component render ra đường dẫn tương đối bị lỗi 404.
  3. **IUCN & DOI/BHL Fallbacks**: 126/192 tài liệu khoa học gốc thiếu link trực tiếp mà không có CrossRef/Google Scholar/BHL search fallback; URL DOI thô chưa được chuẩn hóa prefix `https://doi.org/`.
  4. **Audio Playback Concurrency & Error Misclassification**: `AudioVoiceButton` không có cơ chế quản lý đơn luồng (nhiều audio có thể phát đè nhau); bắt lỗi `AbortError` (khi người dùng pause) bị đánh đồng là lỗi phát âm thanh (`isError = true`).
  5. **BirdPlateImage Lifecycle Bug**: Thiếu `useEffect` lắng nghe thay đổi `species.id` / `rawImageUrl`, khiến trạng thái `isLoaded` hoặc `hasError` từ loài trước bị giữ nguyên khi đổi loài mới; chưa có fallback 2 cấp (`imageUrl` -> `thumbnailUrl` -> vector plate SVG).
  6. **CC Licensing & Anachronism Metadata**: Ảnh thực địa kỹ thuật số iNaturalist hiện đại bị gán nhãn `year: 1931` và hậu tố `ad nat. del.`; thiếu trường `license`, `thumbnailUrl`, `observationUrl` trong `types/bird.ts` và thiếu hiển thị badge giấy phép CC với link nguồn.
- **Unexplored areas**: Không còn vùng nào chưa khảo sát trong phạm vi Links & Media.

## Key Decisions Made
- Tổng hợp báo cáo kiểm toán chi tiết theo cấu trúc 5 thành phần chuẩn handoff.
- Đề xuất kiến trúc module `linkGenerators.ts` tập trung hóa và singleton `audioManager.ts` giải quyết triệt để các lỗ hổng.

## Artifact Index
- /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_1/handoff.md — Báo cáo handoff phân tích toàn diện
- /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_1/audit_links_media.js — Script kiểm toán dữ liệu link & media
- /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_1/check_other_images.js — Script kiểm tra ảnh non-S3

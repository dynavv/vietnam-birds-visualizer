## 2026-08-28T06:28:49Z

You are Worker 1 for the Vietnam Birds Visualizer adversarial audit and stabilization.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative user request file: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/ORIGINAL_REQUEST.md
Project root: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer
Working directory for your metadata: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/worker_1

Explorer reports to read carefully:
- /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_1/handoff.md (Academic links, media & audio resilience)
- /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_2/handoff.md (UI/UX viewports, Leaflet GIS, D3 Cladogram/Radial wheel)
- /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_3/handoff.md (TypeScript safety, Vite/Rollup manualChunks, React memoization)

Your assignments:
1. Academic & Conservation Criteria Links:
   - Create `src/utils/linkGenerators.ts` with resilient URL generators for IUCN, Avibase, GBIF, iNaturalist, Xeno-canto, and `resolveAcademicRefLink` with DOI normalization, BHL search fallback, and Google Scholar bibliographic search fallback.
   - Refactor `src/components/CuratorView/AcademicReferences.tsx`, `src/components/CuratorView/SpecimenPlate.tsx`, `src/components/MapView/EndemicFocusCard.tsx`, and `src/components/SunburstView/QuickSpecimenPanel.tsx` to use `linkGenerators.ts`.
   - Update `src/types/bird.ts` with `thumbnailUrl?: string;`, `observationUrl?: string;`, `license?: string;` in `IllustrationInfo`.
   - Clean up attribution formatting in `SpecimenPlate.tsx` (remove false "ad nat. del." on modern iNaturalist photos, add CC badge/link).

2. Media & Audio Resilience:
   - Create `src/utils/audioManager.ts` singleton to coordinate playback, filter out `AbortError` so pausing never triggers error badges, and clean up event listeners.
   - Refactor `src/components/Common/AudioVoiceButton.tsx` to use `audioManager.ts`.
   - Fix `src/components/Common/BirdPlateImage.tsx` with `useEffect` lifecycle state reset on species change and 2-stage fallback (`imageUrl` -> `thumbnailUrl` -> SVG vector).

3. UI/UX, Viewports & Leaflet GIS:
   - Fix BUG-01 (Tablet 768px-1023px blackout) in `src/components/MapView/VietnamEBAMap.tsx` by using `md:block` for EBARegionLegend and ensuring responsive layout on iPad/tablets.
   - Fix marker pileup on overlapping coordinates in `VietnamEBAMap.tsx` (spiderfier/offset clustering helper so all species pins at Da Lat/Kon Tum/Cat Tien can be clicked).
   - Cache `L.divIcon` instances in `VietnamEBAMap.tsx` to eliminate memory churn and DOM recreation thrashing.
   - Fix `MapFlyToController` in `VietnamEBAMap.tsx` to call `map.stop()` and cleanup properly.
   - Fix mobile scroll trap on Leaflet map.

4. D3 Taxonomic Visualization & Cladogram:
   - Fix D3 radial label text bleeding in `src/components/SunburstView/SunburstWheel.tsx`.
   - Fix ghost arcs hover leakage on zoomed state in `SunburstWheel.tsx`.
   - Add D3 transition interrupt on unmount in `SunburstWheel.tsx`.
   - Persist `expandedNodes` in `src/context/TaxonomyContext.tsx` so Cladogram tree state is preserved across tab switching, and auto-expand to selected species.

5. TypeScript Safety & Rollup Chunk Splitting:
   - Configure `vite.config.ts` with `manualChunks` (`vendor-react`, `vendor-leaflet`, `vendor-d3`, `vendor-icons`, `data-species`, `index`).
   - Clean up loose `any` casts in `SunburstWheel.tsx`, `src/data/index.ts`, `EBARegionLegend.test.tsx`.
   - Apply `React.memo` and `useCallback` optimizations to prevent unnecessary re-renders.

6. Automated Test Suites Expansion:
   - Create `src/utils/linkGenerators.test.ts` testing all platforms, edge cases, and fallbacks.
   - Create `src/utils/audioManager.test.ts` testing singleton audio playback, AbortError handling, and listener cleanup.
   - Add tests for `BirdPlateImage` lifecycle, `TaxonomyContext` tree persistence, and responsive/GIS enhancements.
   - Verify all tests pass (`npm test -- --run`) and build succeeds (`npm run build`).

7. Exhaustive Documentation:
   - Create `docs/AUDIT_AND_ROADMAP.md` covering the entire adversarial audit findings, architectural hardening details, test matrices, and prioritized future roadmap (P0-P3).

Write your completion report in `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/worker_1/handoff.md` and notify the orchestrator with send_message.

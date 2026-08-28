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

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Multi-Surface Flaw Audit | In-depth audit of academic links, UI/UX viewports, Leaflet GIS, D3 Cladogram, Audio/Media | none | DONE |
| 2 | Code Quality & Bundle Diagnostics | Audit TypeScript types, profile Vite bundle, check React memoization & re-renders | none | DONE |
| 3 | Hardening & P0/P1 Bug Fixes | Fix link resolvers, UI/GIS/D3/Audio bugs, optimize Rollup chunks & types, expand test suite | M1, M2 | DONE |
| 4 | Audit & Roadmap Report | Author comprehensive report in `docs/AUDIT_AND_ROADMAP.md` | M1, M2, M3 | DONE |
| 5 | Verification & Quality Guardrails | Full test suite verification, build verification, auditor integrity sign-off | M3, M4 | DONE |

## Code Layout
- `src/components/Common/`: `BirdPlateImage.tsx`, `AudioVoiceButton.tsx`, `ConservationBadge.tsx`, `EndemicBadge.tsx`, etc.
- `src/components/MapView/`: `VietnamEBAMap.tsx`, `EBARegionLegend.tsx`, `EndemicFocusCard.tsx`
- `src/components/SunburstView/`: `SunburstWheel.tsx`, `CladogramTreeView.tsx`, `QuickSpecimenPanel.tsx`
- `src/components/CuratorView/`: `CuratorView.tsx`, `AcademicReferences.tsx`, `SpecimenPlate.tsx`, `MorphologyReport.tsx`
- `src/utils/`: `linkGenerators.ts`, `audioManager.ts`, `taxonomyUtils.ts`
- `src/types/`: `bird.ts`, `taxonomy.ts`, `map.ts`, `index.ts`
- `src/tests/` / `src/**/*.test.ts(x)`: Vitest test suites (30 test files, 186 tests)
- `docs/`: `AUDIT_AND_ROADMAP.md`

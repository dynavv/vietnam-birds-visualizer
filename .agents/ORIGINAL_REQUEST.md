# Original User Request

## Initial Request — 2026-08-28T06:23:54Z

Perform a comprehensive adversarial audit on the "Avifauna of Vietnam" (Vietnam Birds Visualizer) codebase, uncover latent flaws across UX/UI, data pipelines, Leaflet GIS mapping, D3 cladogram visualization, and audio streaming, verify the stability of all external criteria & academic links (IUCN, Avibase, GBIF, DOI, Xeno-canto, iNaturalist), harden stability, and deliver a prioritized stabilization & feature improvement roadmap.

Working directory: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer
Integrity mode: development

## Requirements

### R1. Comprehensive Multi-Surface Flaw Audit
Conduct an in-depth audit across the following layers:
- **Academic & Conservation Criteria Link Stability**: Thoroughly audit all external links across species records (IUCN Red List URLs, Avibase search IDs, GBIF taxon keys, DOI literature links, BHL archival citations, and Xeno-canto audio endpoints). Identify broken/fragile links and formulate robust fallback resolution strategies (e.g., canonical URL encoding, direct DOI resolvers, validated query fallbacks).
- **UI/UX & Viewport Responsiveness**: Check for scroll traps, layout shifts, z-index collisions, and viewport overflows across desktop (1080p, 1440p, 4K), laptops (1366x768), tablets, and mobile phones.
- **Interactive Mapping (Leaflet GIS)**: Audit marker clustering performance, coordinate accuracy, EBA boundary circles, sovereignty markers, tile loading resiliency, and zoom animation memory cleanup.
- **Taxonomic Visualization (D3 Cladogram & Radial Wheel)**: Audit node transition animations, tree collapse/expansion state persistence, text label clipping, and click vs hover interactions.
- **Media & Assets Resilience**: Check audio playback error handling, audio format optimizations, high-resolution photo fallback mechanisms, and CC licensing attributions.

### R2. Code Quality, Type Safety & Performance Diagnostics
- Audit TypeScript typing across all components and data structures, eliminating loose `any` or untyped casts.
- Profile Vite production bundle size, recommend or apply manual Rollup chunk splitting to optimize the 700KB single chunk.
- Check React component memoization (`useMemo`, `useCallback`, `React.memo`) to eliminate redundant re-renders during live search and map flyTo actions.

### R3. Hardening & Actionable Stabilization Roadmap
- Resolve identified P0/P1 bugs and link resolution issues with verified unit tests.
- Compile a comprehensive, professional **Audit & Enhancement Report** (`docs/AUDIT_AND_ROADMAP.md`) documenting identified defects, link resiliency architectures, implemented fixes, and prioritized recommendations for product stability and future innovation.

## Acceptance Criteria

### Automated Verification & Quality Guardrails
- [ ] 100% of existing test suites (109+ tests) pass with zero regressions (`npm test -- --run`).
- [ ] TypeScript compilation and Vite production build succeed cleanly with zero errors (`npm run build`).
- [ ] All external criteria and academic reference link generators verified to produce valid, canonical, resilient URLs.
- [ ] Verified responsive layout across desktop, tablet, and mobile viewports with no scroll traps or clipping.
- [ ] Comprehensive Audit & Roadmap report (`docs/AUDIT_AND_ROADMAP.md`) produced with clear severity matrix and technical recommendations.

# BRIEFING — 2026-08-28T06:28:00Z

## Mission
Audit TypeScript typing & safety, evaluate Vite bundle size & chunk splitting strategies, and diagnose React component memoization / re-rendering performance in vietnam-birds-visualizer.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/explorer_3
- Original parent: 7ad27185-9ec6-4df8-ad9e-c454f1614d85
- Milestone: Performance, Type Safety & Bundle Size Audit

## 🔒 Key Constraints
- Read-only investigation — do NOT modify source files directly (only write reports/proposals in our own .agents directory)
- Respond in Vietnamese (Tiếng Việt)
- Provide exact file paths, line numbers, concrete configs (manualChunks), strict types, memoization patterns, and verification methods

## Current Parent
- Conversation ID: 7ad27185-9ec6-4df8-ad9e-c454f1614d85
- Updated: 2026-08-28T06:28:00Z

## Investigation State
- **Explored paths**:
  - `tsconfig.json`, `vite.config.ts`, `package.json`
  - `src/types/bird.ts`, `src/types/index.ts`
  - `src/data/index.ts`, `src/data/species.json`, `src/data/taxonomy.json`, `src/data/ebas.json`, `src/data/validateData.test.ts`
  - `src/context/TaxonomyContext.tsx`, `src/context/TaxonomyContext.test.tsx`
  - `src/App.tsx`, `src/main.tsx`
  - `src/components/Header/*`, `src/components/Footer/*`, `src/components/Common/*`, `src/components/MapView/*`, `src/components/SunburstView/*`, `src/components/CuratorView/*`
- **Key findings**:
  1. TypeScript: Double casts (`as unknown as BirdSpecies[]`), loose D3 typing (`as any`, `as unknown as SunburstHierarchyNode`), missing strict union types for filter states, untyped test parameters.
  2. Bundle Size: Production build currently outputs a single oversized 700.52 kB chunk with Vite >500kB warning. Tested clean `manualChunks` configuration splitting into `vendor-react` (141.96 kB), `vendor-leaflet` (155.37 kB), `vendor-d3` (47.19 kB), `vendor-icons` (21.18 kB), `data-species` (202.38 kB), and `index` (132.51 kB) with 0 warnings.
  3. React Performance: Global context thrashing on hover/keystrokes, Leaflet `L.divIcon` re-creation on every render causing DOM marker thrashing, inline lambda props, missing `React.memo` on leaf badges/cards.
- **Unexplored areas**: None. All source files, types, context, and components have been thoroughly audited.

## Key Decisions Made
- Fully benchmarked Vite chunk splitting with real build executions.
- Designed comprehensive type-safe models, memoization strategies, and verification test plans.

## Artifact Index
- DISPATCH.md — incoming instructions log
- BRIEFING.md — working memory and identity
- progress.md — ongoing execution and liveness heartbeat
- handoff.md — final 5-component report

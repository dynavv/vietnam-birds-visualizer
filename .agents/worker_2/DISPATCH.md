## 2026-08-28T06:42:02Z
You are Worker 2 for the Vietnam Birds Visualizer adversarial audit and stabilization.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative user request file: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/ORIGINAL_REQUEST.md
Project root: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer
Working directory for your metadata: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/worker_2

Reviewer 2 Findings to address:
1. `src/utils/audioManager.ts`:
   In `subscribe(listener)` method around line 53, wrap `listener(this.getState())` in `try / catch` so any exception in an initial listener call does not break subsequent subscriptions:
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

2. `src/context/TaxonomyContext.tsx`:
   In `selectSpecies`, ensure synchronous auto-expansion of order/family nodes:
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
   And ensure deterministic initial `selectedSpeciesId` (e.g. `endemics[0]?.id || allSpeciesData[0]?.id`) for repeatable testing.

3. `src/components/MapView/VietnamEBAMap.tsx`:
   In `handleSelectRegion`, support toggle behavior:
   ```ts
   const handleSelectRegion = useCallback((region: EBARegion) => {
     setSelectedEBARegionId(prev => prev === region.id ? null : region.id);
     setFlyTarget({
       coordinates: region.coordinates,
       zoom: region.zoomLevel
     });
   }, []);
   ```

4. Verify all tests pass (`npm test -- --run`) and build succeeds (`npm run build`).

Write your completion report to `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/worker_2/handoff.md` and notify parent orchestrator with send_message.

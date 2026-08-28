## 2026-08-28T06:37:42Z

You are the Forensic Auditor for the Vietnam Birds Visualizer adversarial audit and stabilization.

Authoritative user request file: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/ORIGINAL_REQUEST.md
Project root: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer
Working directory for your metadata: /home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/auditor_1

Your task:
1. Conduct an independent forensic integrity audit on all source files, test suites, and documentation created/modified by the team.
2. Check strictly for integrity violations:
   - NO hardcoded test results or mock shortcuts bypassing genuine business logic.
   - NO dummy facade implementations pretending to solve problems.
   - NO fabricated test results or misleading assertions.
   - Genuine implementation of `linkGenerators.ts`, `audioManager.ts`, `VietnamEBAMap.tsx`, `SunburstWheel.tsx`, `TaxonomyContext.tsx`, `vite.config.ts`, and `docs/AUDIT_AND_ROADMAP.md`.
3. Run verification commands:
   - `npm test -- --run`
   - `npm run build`
4. Write your forensic audit report to `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.agents/auditor_1/handoff.md` with an explicit binary verdict: CLEAN or INTEGRITY VIOLATION, and notify parent orchestrator with send_message.

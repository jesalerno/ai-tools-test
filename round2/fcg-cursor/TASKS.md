# fcg-cursor — Task Tracker

Allowed instruction sources:

- `round2/FCG-SPECv3.md`
- `round2/ENVIRONMENT_SETUP.md`
- `round2/ARCHITECTUREv2.md`
- `round2/CODING_STANDARDSv2.md`

## Phases

| # | Phase | Status |
|---|---|---|
| 0 | Environment preflight | DONE |
| 1 | Project scaffolding and trackers | DONE |
| 2 | Shared API contract (`shared/types.ts`) | DONE |
| 3 | Backend scaffold and infra plumbing | DONE |
| 4 | Backend fractal renderers (11 methods) | DONE |
| 5 | Frontend scaffold and UI implementation | DONE |
| 6 | Automated tests (unit/api/e2e) | DONE |
| 7 | Dockerization and local deployment | DONE |
| 8 | Documentation and compliance artifacts | DONE |
| 9 | Quality gates and final validation | DONE |
| 10 | Rendering debugging and visual tuning | DONE |

## Validation Rule

After each phase, run the phase-appropriate checks and capture pass/fail evidence in phase notes.

## Phase Notes

### Phase 0 — Preflight (PASS)
- `node -v`: `v20.19.0`
- `npm -v`: `10.8.2`
- `docker --version`: `29.4.0`
- `docker compose version`: `v5.1.1`

### Phase 1 — Scaffolding (PASS)
- Workspace scaffold complete under `round2/fcg-cursor`.

### Phase 2 — Shared contract (PASS)
- Canonical shared types created in `shared/types.ts`.

### Phase 3 — Backend scaffold (PASS)
- Express service, validation, OpenAPI route, and test harness added.

### Phase 4 — Backend renderers (PASS)
- Implemented 11-method fractal generation pipeline with mirrored quadrant rendering.

### Phase 5 — Frontend implementation (PASS)
- React UI created with method select, `Go`, `Surprise Me`, loading, and error handling.
- Surprise mode syncs dropdown to backend-selected method.

### Phase 6 — Automated tests (PASS)
- Backend Jest tests pass.
- Frontend Vitest tests pass.
- Playwright E2E passed with trace enabled.

### Phase 7 — Docker deployment (PASS)
- Compose file + Dockerfiles + nginx policy implemented and running.
- Runtime verified on `http://localhost:3090` and `http://localhost:8090`.

### Phase 8 — Docs/compliance (PASS)
- README, architecture, API, troubleshooting, and notices added.

### Phase 9 — Final validation (PASS)
- `npm run lint` pass.
- `npm run build` pass.
- `npm test` pass.
- `npx playwright test --trace on` pass.

### Phase 10 — Rendering debugging and visual tuning (PASS)
- Addressed user-reported noisy and flat outputs by method-specific tuning in backend renderer:
  - replaced high-frequency synthetic textures for noisy methods with smoother/domain-warped fields.
  - added dedicated IFS density rendering path (Barnsley-style chaos game) to produce sparse fern-like structures.
  - refined phase plot coloring toward smoother/pastel gradients with center-preserving contrast and controlled blur.
- Added image-quality regression checks in `backend/test/fractalRenderer.test.ts`:
  - anti-flatness variance checks for key methods.
  - adjacent-pixel volatility checks for noisy texture methods.
  - reference-style checks for `PHASE_PLOT` (soft/bright) and `IFS` (sparse/bright background).
- Validation:
  - `npm run lint -- src/domain/fractalRenderer.ts test/fractalRenderer.test.ts` pass.
  - `npm test -- fractalRenderer.test.ts` pass.

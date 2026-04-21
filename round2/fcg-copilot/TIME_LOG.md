# Fractal Card Generator — Time Log

| Phase | Activity | Start | End | Duration |
|-------|----------|-------|-----|----------|
| 1 | Read & review all 4 spec docs | session start | +15m | ~15 min |
| 1 | Preflight checks + directory scaffold | +15m | +20m | ~5 min |
| 2 | Shared types + backend package.json/tsconfig/eslint/jest | +20m | +30m | ~10 min |
| 2 | All 11 fractal generators (domain layer) | +30m | +65m | ~35 min |
| 2 | Color harmony module + fractal registry + card renderer | +65m | +75m | ~10 min |
| 3 | AJV schemas + generateCard use case | +75m | +85m | ~10 min |
| 3 | Infrastructure layer (config/env, logger, canvas adapter, middleware, routes, app, server) | +85m | +105m | ~20 min |
| 3 | Backend Dockerfile | +105m | +110m | ~5 min |
| 2 | Backend unit tests (harmony, generators, card renderer) | +110m | +125m | ~15 min |
| 3 | Backend integration tests (API) | +125m | +135m | ~10 min |
| 4 | Frontend scaffolding (tsconfig, vite, vitest, eslint) | +135m | +145m | ~10 min |
| 4 | Frontend components (App, MethodSelector, CardDisplay, ErrorBoundary) | +145m | +165m | ~20 min |
| 4 | Frontend hooks, API client, styles | +165m | +180m | ~15 min |
| 4 | Frontend tests + Dockerfile + nginx.conf | +180m | +190m | ~10 min |
| 5 | docker-compose.yml + root files (README, LICENSE, NOTICES, .env.example) | +190m | +200m | ~10 min |
| 6 | npm ci + lint fixes (TypeScript peer dep, AJV types, ESLint rules) | +200m | +270m | ~70 min |
| 6 | Backend build fixes (rootDir, Ajv constructor, canvas types) | +270m | +310m | ~40 min |
| 6 | Backend test fixes (lsystem seeds, API integration paths) | +310m | +330m | ~20 min |
| 6 | Frontend npm ci + lint + build + test | +330m | +340m | ~10 min |
| 7 | Docker build + deploy (fix Dockerfile paths for new src/shared layout) | +340m | +355m | ~15 min |
| 8 | E2E testing via playwright-mcp (8 scenarios, all pass) | +355m | +365m | ~10 min |
| 9 | Spec §2.2 update: migrate UI from hand-rolled CSS to MUI v6 MD3 components | +365m | +415m | ~50 min |
| 9 | Docker health check fix (localhost → 127.0.0.1 in Alpine nginx image) | +415m | +420m | ~5 min |
| 10 | Coverage metric chip (spec §3.3 threshold, pass/fail colour) + remove random dropdown option | +420m | +430m | ~10 min |
| 10 | Debug: noUncheckedIndexedAccess caused FRACTAL_METHODS[0] to be T\|undefined → use literal default | +430m | +435m | ~5 min |
| 10 | Update time log, TASKS.md, and README to reflect Phase 9–10 changes | +435m | +440m | ~5 min |

**Total:** ~440 min (~7h 20m)

---

## Debugging Notes

### Phase 6 — Backend quality gates (~130 min total)
- `typescript@5.9.2` incompatible with `typescript-eslint@8.33.0` (peer: `>=4.8.4 <5.9.0`). **Fix:** pin TypeScript to `5.8.3`.
- `shared/types.ts` outside `rootDir: src` broke compilation. **Fix:** copy into `backend/src/shared/types.ts`; update all import paths.
- AJV default export is a CJS class; NodeNext types expose no constructor. **Fix:** `interface AjvLike` + `as any` cast with inline comment.
- ESLint complexity violations in `lsystem.ts` and `cardRenderer.ts`. **Fix:** refactor with named helper functions.
- Integration tests used wrong relative paths. **Fix:** corrected to `../../src/...`.
- Malformed JSON body returned 500 instead of 400. **Fix:** added `SyntaxError` and `entity.parse.failed` handler in Express error middleware.
- LSystem seed test: both seeds produced identical output. **Fix:** seed `initialAngle` from PRNG.

### Phase 7 — Docker build (~15 min)
- Backend Dockerfile used `backend/package.json` paths but build context was `./backend`. **Fix:** use relative paths in all `COPY` directives.

### Phase 9 — MUI migration (~5 min, post-deploy)
- Alpine `nginx` image: `wget localhost:3000` silently fails even when nginx is listening. **Fix:** use `127.0.0.1:3000` in both `Dockerfile` `HEALTHCHECK` and `docker-compose.yml` `healthcheck.test`.

### Phase 10 — Coverage chip + dropdown (~5 min)
- `noUncheckedIndexedAccess: true` in tsconfig makes array index access return `T | undefined`. `FRACTAL_METHODS[0]` was typed as `FractalMethod | undefined`, incompatible with `useState<FractalMethod>`. **Fix:** use the string literal `'mandelbrot'` as the initial state value.


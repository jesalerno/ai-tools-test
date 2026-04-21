# fcg-claude — Time Tracking

Timestamps are local time (`date '+%Y-%m-%d %H:%M:%S'`) recorded at phase boundaries.

## Initial build (phases 0–13)

| Phase | Start | End | Duration |
|---|---|---|---|
| 0. Preflight | 2026-04-20 20:15:00 | 2026-04-20 20:17:26 | ~2m |
| 1. Scaffolding | 2026-04-20 20:17:26 | 2026-04-20 20:20:00 | ~3m |
| 2. Shared contract | 2026-04-20 20:20:00 | 2026-04-20 20:22:00 | ~2m |
| 3. Backend scaffold | 2026-04-20 20:22:00 | 2026-04-20 20:27:00 | ~5m |
| 4. Backend domain (11 renderers) | 2026-04-20 20:27:00 | 2026-04-20 20:42:00 | ~15m |
| 5. Backend app/infra | 2026-04-20 20:42:00 | 2026-04-20 20:50:00 | ~8m |
| 6. Backend tests + gate cycle | 2026-04-20 20:50:00 | 2026-04-20 21:07:22 | ~17m |
| 7. Frontend scaffold | 2026-04-20 21:07:22 | 2026-04-20 21:14:00 | ~7m |
| 8. Frontend UI | 2026-04-20 21:14:00 | 2026-04-20 21:18:00 | ~4m |
| 9. Frontend tests + gate cycle | 2026-04-20 21:18:00 | 2026-04-20 21:20:00 | ~2m |
| 10. Docker artifacts | 2026-04-20 21:20:00 | 2026-04-20 21:22:00 | ~2m |
| 11. Documentation | 2026-04-20 21:22:00 | 2026-04-20 21:27:00 | ~5m |
| 12. Full quality gates | 2026-04-20 21:27:00 | 2026-04-20 21:28:00 | ~1m |
| 13. Deploy + MCP Playwright validate | 2026-04-20 21:28:00 | 2026-04-20 21:35:32 | ~8m |

**Initial build wall-clock:** ~1h 20m.

## Post-delivery follow-up (user-driven debugging and additions)

Each item here began from a specific user prompt after the initial "done"
report and was delivered with the same lint/build/test gates re-run plus
a Docker redeploy + live MCP Playwright verification.

| # | Item | Start | End | Duration | Files changed |
|---|---|---|---|---|---|
| D1 | Diagnose `NOT_FOUND` error + improve diagnostics: root `/` → `302 /api/docs`, `/api` → `302 /api/docs`, 404 body now includes the requested method + path | 2026-04-20 21:37:00 | 2026-04-20 21:41:00 | ~4m | `backend/src/infrastructure/http/app.ts`, `backend/src/infrastructure/http/middleware.ts` |
| D2 | Fix Strange Attractor and Flame off-center rendering (four small blobs instead of one card-spanning pattern). Changed both renderers to plot around quadrant (0,0) = card center, using `Math.abs(x)/Math.abs(y)` fold and tightened `BOUND` to the known attractor extents | 2026-04-20 21:41:00 | 2026-04-20 21:46:00 | ~5m | `backend/src/domain/fractals/strangeAttractor.ts`, `backend/src/domain/fractals/flame.ts` |
| D3 | Add coverage metric to the UI with spec-§3.3 threshold indicator (green ✓ when ≥ 80%, amber ⚠ below), `data-meets-threshold` attribute for automation, two new Vitest tests for pass/warn states | 2026-04-20 21:46:00 | 2026-04-20 21:55:00 | ~9m | `frontend/src/App.tsx`, `frontend/src/__tests__/App.test.tsx` |
| D4 | Documentation sweep — this file, `TASKS.md`, `docs/API.md` (added root redirect + enriched 404 body notes), `docs/TROUBLESHOOTING.md` (added centering-bug entry) | 2026-04-20 21:55:00 | 2026-04-20 22:01:20 | ~6m | `TIME_TRACKING.md`, `TASKS.md`, `docs/API.md`, `docs/TROUBLESHOOTING.md` |

**Post-delivery follow-up wall-clock:** ~24m.

## Totals

- **Initial build:** ~1h 20m (phases 0–13)
- **Post-delivery follow-ups (D1–D4):** ~24m
- **Grand total:** ~1h 44m of wall-clock for spec-to-deployed-and-patched.

## Time distribution (grand total)

- Build / implementation (phases 3–5, 7–8, 10): ~41 minutes
- Tests + quality gates + fixups (phases 6, 9, 12): ~20 minutes
- Documentation (phase 11 + D4): ~11 minutes
- Deployment + live validation (phase 13): ~8 minutes
- Scaffolding + shared contract + preflight (phases 0–2): ~7 minutes
- Post-delivery debugging (D1 + D2): ~9 minutes
- Post-delivery UI addition (D3): ~9 minutes

The two longest initial phases were the 11-renderer domain implementation
(~15m) and the first full lint-fix-rebuild cycle on the backend (~17m),
where ESM/CJS interop for `ajv`, `ajv-formats`, and `pino` had to be
resolved under NodeNext. Replacing `pino` with a small structured logger
and switching to `createRequire` for `ajv-formats` closed the gap without
violating the spec's no-`any`/no-`ts-ignore` rules.

The post-delivery phase revealed a real rendering bug (D2) that the test
suite did not catch — renderers were asserted for size / color-compliance
/ determinism but not for "the interesting part is actually centered on
the card." A regression test for that invariant would be a good follow-up.

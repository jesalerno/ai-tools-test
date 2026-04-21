# Architecture Notes

## Runtime Topology

- `frontend` container (Nginx static hosting + API proxy)
- `backend` container (Express API + fractal generation)

## Backend Layering

- `domain`: fractal generation and color mapping
- `application`: use-case orchestration + request validation
- `infrastructure`: HTTP routing, env wiring, rate-limits, CORS

Dependency flow: `domain <- application <- infrastructure`.

## Contracts

- Shared root contract in `shared/types.ts`
- Backend local mirror in `backend/src/shared/types.ts`
- Frontend mirror in `frontend/src/shared/types.ts`

## Endpoint Design

- `POST /api/cards/generate`
- `GET /api/health`
- `GET /api/openapi.json`

## Reliability and Security

- Explicit memory/time guard env vars
- Explicit CORS allowlist
- IP-based request limiting via `express-rate-limit`
- Standardized error response shape

## Rendering Debugging Timeline (Apr 20, 2026)

The renderer pipeline was refined across three focused debugging passes after user-reported visual quality issues (noise/static textures and occasional flat outputs).

- Pass I (noise/flatness triage):
  - replaced high-frequency synthetic texture paths with smoother/domain-warped scalar fields for noisy methods.
  - added anti-flatness and adjacent-pixel volatility tests.
- Pass II (phase-plot and preview fit):
  - refined phase-plot domain coloring and smoothing behavior.
  - aligned frontend preview scaling so cards consistently fit visible viewport.
- Pass III (reference-style tuning):
  - added dedicated IFS density generation path (Barnsley-style chaos game) for sparse fern-like structure.
  - tuned phase-plot output toward soft, pastel gradients with center-preserving contrast.

These changes are now guarded by renderer-specific regression checks in `backend/test/fractalRenderer.test.ts`:

- channel variance checks for flatness prevention,
- pixel-volatility checks for noisy-method regression detection,
- reference-style checks for `PHASE_PLOT` and `IFS`.

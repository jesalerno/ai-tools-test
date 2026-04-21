# Troubleshooting

## `npm install` fails on canvas package

- Ensure system dependencies are installed (see `README.md`)
- Re-run install with clean cache:
  - `rm -rf node_modules package-lock.json`
  - `npm install`

## API returns timeout error

- Current guard is `MAX_GENERATION_MS=15000`
- Increase env var for debugging only, then profile selected fractal method

## Frontend shows proxy errors

- Confirm backend container is up:
  - `docker compose ps`
- Verify backend health:
  - `curl http://localhost:8090/api/health`

## Playwright E2E cannot reach app

- Confirm `http://localhost:3090` responds
- Start stack first: `docker compose up --build`

## Cards look noisy, grainy, or too "static-like"

- Run renderer-focused tests:
  - `npm --workspace backend test -- fractalRenderer.test.ts`
- If volatility/reference-style checks fail, review recent edits in:
  - `backend/src/domain/fractalRenderer.ts`
  - `backend/test/fractalRenderer.test.ts`
- Check method-specific tuning first:
  - `PHASE_PLOT`: color blending/whitening and blur strength.
  - `IFS`: density threshold and low-density background whitening.

## Cards look too flat or single-color

- Confirm anti-flatness variance test is passing in `fractalRenderer.test.ts`.
- Inspect method-specific intensity/color paths in `fractalRenderer.ts`:
  - `mapIntensity(...)`
  - `pickColor(...)`
  - any method-specific scalar path (escape-time, IFS density, phase plot).

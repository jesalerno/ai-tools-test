# Fractal Card Generator (fcg-cursor)

This project generates the **backside of a playing card** using deterministic fractal algorithms and serves a web UI for user testing.

## Quick Start

1. Install prerequisites:
   - Node.js `20.x`
   - npm `10.x`
   - Docker + Docker Compose v2
2. Install dependencies:
   - `npm install`
3. Run quality gates:
   - `npm run lint`
   - `npm run build`
   - `npm test`
4. Start containers:
   - `docker compose up --build`
5. Open:
   - Frontend: `http://localhost:3090`
   - Backend health: `http://localhost:8090/api/health`

## Project Structure

- `backend/` Express 5 TypeScript API
- `frontend/` React 19 + Vite TypeScript UI
- `shared/types.ts` canonical contract types
- `e2e/` Playwright end-to-end tests

## API

- `POST /api/cards/generate`
  - Request:
    - `method` (optional enum)
    - `seed` (optional string)
  - Response:
    - `imageDataUri`
    - `selectedMethod`
    - `seed`
    - `metadata`
- `GET /api/health`
- `GET /api/openapi.json`

## Environment Variables

Defined in `.env.example`:

- `PORT=8090`
- `BODY_SIZE_LIMIT_MB=2`
- `MAX_GENERATION_MS=15000`
- `MAX_CANVAS_MEMORY_BYTES=134217728`
- `RATE_LIMIT_WINDOW_MS=60000`
- `RATE_LIMIT_MAX=60`
- `NODE_ENV=production`
- `FRONTEND_ORIGIN=http://localhost:3090`

## Canvas System Dependencies

### macOS

`brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`

### Debian/Ubuntu

`sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## Privacy and Data Handling

- No accounts or persistence.
- No database writes.
- Generated image data is returned in-memory from the backend response.

## Common Setup Failures

- Port already in use:
  - stop conflicting service or change host mappings in `docker-compose.yml`
- Docker cache stale:
  - `docker compose down --remove-orphans`
  - `docker compose build --no-cache`
- Native canvas dependency build issue:
  - install system packages above, then retry `npm install`

## Troubleshooting

See `TROUBLESHOOTING.md`.

## Rendering Quality Guardrails

Renderer quality is protected by dedicated tests in `backend/test/fractalRenderer.test.ts`.

- Non-flatness checks:
  - verifies channel variance thresholds for selected methods to prevent solid/flat cards.
- Noise volatility checks:
  - verifies adjacent-pixel volatility for historically noisy methods (`FLAME`, `L_SYSTEM`, `IFS`, `STRANGE_ATTRACTOR`).
- Reference-style checks:
  - verifies `PHASE_PLOT` remains soft/bright and `IFS` remains sparse with bright background.

Run only renderer checks:

- `npm --workspace backend test -- fractalRenderer.test.ts`

## License

MIT. See `LICENSE`.

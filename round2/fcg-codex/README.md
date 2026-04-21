# Fractal Card Back Generator (`fcg-codex`)

A deterministic full-stack web application that generates a playing-card back image using one of 11 fractal algorithms and mirrors a generated quadrant across the full card for rotational symmetry.

## Runtime assumptions
- Node.js 20.19.0
- npm 10.8.2
- Docker 29.4.0
- Docker Compose v5.1.1

## Preflight
Run:

```bash
node -v
npm -v
docker --version
docker compose version
```

## Project structure
- `backend/` Express 5 + TypeScript API and fractal generator engine
- `frontend/` React 19 + Vite UI
- `shared/types.ts` canonical request/response contract
- `docs/openapi.yaml` OpenAPI contract
- `TASK_PROGRESS.md` per-step execution state and validation
- `TIME_LOG.md` per-phase time spent

## API
- `GET /api/health`
- `POST /api/cards/generate`

Example request:

```json
{
  "method": "MANDELBROT",
  "seed": 42,
  "iterations": 900,
  "zoom": 1.8
}
```

Example response fields:
- `imageDataUri` (JPEG base64 data URI)
- `method` (effective method, including random mode)
- `seed`
- `effectiveParameters`
- `metadata.durationMs`, `metadata.retries`, `metadata.warnings`

## Setup and run (local Docker)

```bash
docker compose up --build
```

App URLs:
- Frontend: `http://localhost:3035`
- Backend health: `http://localhost:8085/api/health`

## Security defaults
- `x-powered-by` disabled
- helmet security headers enabled
- CORS explicit allowlist via `CORS_ORIGINS`
- rate limit enabled (`60 req/min/IP` default)
- validation at API boundary via AJV
- error contract hides stack traces

## Environment variables
Backend `.env.example` includes:
- `PORT=8085`
- `BODY_SIZE_LIMIT_MB=2`
- `MAX_GENERATION_MS=15000`
- `MAX_CANVAS_MEMORY_BYTES=134217728`
- `RATE_LIMIT_WINDOW_MS=60000`
- `RATE_LIMIT_MAX=60`
- `NODE_ENV=production`
- `CORS_ORIGINS=http://localhost:3035`

## Commands
From project root:

```bash
npm run lint
npm run build
npm test
```

Each workspace provides:
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm test`
- `npm start`

## Common setup failures
- Docker socket permission denied:
  - Ensure Docker Desktop is running and current user has Docker access.
- Port conflict on `3035` or `8085`:
  - Stop prior containers and retry.
- Native canvas runtime errors:
  - On macOS install prerequisite libs:
    - `brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`
  - On Debian/Ubuntu install prerequisite libs:
    - `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## Data handling
- The app stores no user accounts, no uploads, and no persistence.
- Generated images are returned in the response only and not stored server-side.

## License
MIT. See `LICENSE` and `NOTICES.md`.

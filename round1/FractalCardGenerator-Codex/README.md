# Fractal Card Generator

Production-ready web app for generating seamless fractal playing-card backs.

## What it builds
- Card output: `2.5in x 3.5in` (`750x1050` px at `300 DPI`)
- JPEG output with `3mm` white border and rounded corners
- Seamless 4-quadrant mirrored design
- 11 fractal methods with random palette harmony
- Coverage validation target: `>=80%` non-zero RGB pixels

## Architecture
- `backend/`: Node.js + TypeScript + Express + canvas
- `frontend/`: React + TypeScript + Vite
- `shared/types.ts`: shared API contracts
  - Backend uses re-export wrapper in `backend/src/shared/types.ts`
  - Frontend uses copied contracts in `frontend/src/shared/types.ts`

Details: see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Prerequisites
1. Node.js `20.19+` (or `22.12+`)
2. npm `10+`
3. Optional system dependencies for `node-canvas` fallback (not required when using `@napi-rs/canvas`)

### macOS (optional, only if using `node-canvas`)
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

### Ubuntu/Debian (optional, only if using `node-canvas`)
```bash
sudo apt-get update
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pixman-dev
```

## Quick start (local)
```bash
nvm use || nvm install
npm run install:all
npm run dev --workspace backend
npm run dev --workspace frontend
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

## Docker quick start
```bash
docker-compose up --build
```

- Frontend (nginx): `http://localhost:3000`
- Backend: `http://localhost:8080`

## API
- `GET /api/cards/methods`
- `POST /api/cards/generate`
  - Body: `{ "method": "mandelbrot", "seed"?: number, "iterations"?: number, "zoom"?: number }`
- `POST /api/cards/surprise`
  - Body: `{ "seed"?: number, "iterations"?: number, "zoom"?: number }`

## Testing
Mock tests (no live canvas required):
```bash
npm run test --workspace backend
```

Live tests (skipped by default):
```bash
npm run test:live --workspace backend
```
`canvas` is marked optional in backend dependencies, so mock tests can run even when native canvas build is unavailable.

## Lint
```bash
npm run lint --workspace backend
```

## Dependency and security review
- Backend uses: `express`, `cors`, `express-rate-limit`, `@napi-rs/canvas`, `complex.js`, `supertest`, `tsx`, `typescript`.
- Frontend uses: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `ajv`, `typescript`.
- Recommended routine:
```bash
npm outdated --workspaces
npm audit --workspaces
npm audit --omit=dev --workspace backend
```

## Troubleshooting
- `canvas` build errors:
  - Ensure system packages above are installed before `npm install`.
- API request too large:
  - Set `BODY_LIMIT_MB` env var between `1` and `2`.

## License
- Project license: MIT. See [LICENSE](./LICENSE).
- Third-party attribution: [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).

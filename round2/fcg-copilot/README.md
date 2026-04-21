# Fractal Card Generator

A web application that generates the backside of a playing card using 11 distinct fractal algorithms. The UI follows Material Design 3 principles, implemented with MUI v6.

## Prerequisites

- Node.js 20.x
- Docker + Docker Compose v2

### macOS — native canvas dependencies (for local backend dev)

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### Ubuntu/Debian

```bash
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev
```

## Quick Start (Docker)

```bash
cd round2/fcg-copilot
cp .env.example .env
docker compose up --build
```

Open http://localhost:3000

## Local Development

### Backend

```bash
cd backend
npm ci
npm run dev
```

Runs on http://localhost:8080

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Runs on http://localhost:3000 with API proxy to backend.

## API

- `POST /api/cards/generate` — generate a fractal card (body: `{ method?: FractalMethod, params?: { seed?, iterations?, zoom? } }`)
- `GET /api/health` — health check (`{ status: "ok", timestamp }`)

OpenAPI spec: `backend/openapi.yaml`

## Testing

```bash
# Backend (78 tests)
cd backend && npm test

# Frontend (12 tests)
cd frontend && npm test

# Lint (both)
cd backend && npm run lint
cd frontend && npm run lint
```

## UI Features

- **Fractal method dropdown** — 11 named methods; select the algorithm before clicking Go.
- **Go button** — generates a card using the selected method.
- **Surprise Me button** — picks a random method server-side.
- **Coverage chip** — displays the quadrant pixel coverage percentage. Green ≥ 80% (spec §3.3 threshold); red below threshold.
- **Loading state** — spinner shown during generation; buttons disabled.
- **Error banner** — inline, dismissable, recoverable (no full-page dead end).

## Architecture

See `../../round2/ARCHITECTUREv2.md` for full architecture documentation.

## License

MIT — see [LICENSE](LICENSE)

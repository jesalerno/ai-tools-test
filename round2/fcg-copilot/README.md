# Fractal Card Generator

A web application that generates the backside of a playing card using 11 distinct fractal algorithms.

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

- `POST /api/cards/generate` — generate a fractal card
- `GET /api/health` — health check

OpenAPI spec: `backend/openapi.yaml`

## Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Architecture

See `../../round2/ARCHITECTUREv2.md` for full architecture documentation.

## License

MIT — see [LICENSE](LICENSE)

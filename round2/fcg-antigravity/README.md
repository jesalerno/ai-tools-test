# Fractal Back Card Design Generator

A production-ready web application for generating procedural fractal card backs. Uses React 19, TypeScript, Express, and native Node bindings for canvas execution.

## Prerequisites
- Node.js >= 20
- Docker & Docker Compose v2
- Target Platforms: macOS, Debian/Ubuntu

## Setup & Preflight (macOS or Debian)
To run mock validations, canvas prerequisites are required on your host:
**macOS (via Homebrew)**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

**Debian / Ubuntu**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

## Quick Start
Builds and runs completely isolated in Docker containers.

```bash
cd fcg-antigravity
docker-compose up --build -d
```
Access at [http://localhost:3050](http://localhost:3050).

## Local Development
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Testing Protocol
```bash
cd backend && npm test
cd frontend && npm test
```

## Troubleshooting
### Docker Startup Errors
Port conflicts are the primary docker startup blocker. Ensure ports 8095 and 3050 are entirely clear.
`Error loading config file: open config.json: operation not permitted` - Run docker context use default or fix perms.

## Privacy & Security
This application is stateless and saves nothing to the disk or backend logs except anonymous rate limit IDs (Client IPs). It executes strict memory checks on canvas allocs.

## License
MIT (See LICENSE file).

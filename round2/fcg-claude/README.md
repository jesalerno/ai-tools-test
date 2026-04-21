# fcg-claude — Fractal Card Generator

A production-ready web application that generates print-quality fractal
playing-card backs. One backend (Express 5 + `@napi-rs/canvas`), one
frontend (React 19 + Vite + Radix + Tailwind), containerized with Docker
Compose.

This is one of several parallel agent implementations of the spec; it is
scoped strictly to `round2/fcg-claude/` within the `ai-tools-test`
repository.

Source-of-truth documents (the **only** specs governing this implementation):

- `round2/FCG-SPECv3.md`
- `round2/ENVIRONMENT_SETUP.md`
- `round2/ARCHITECTUREv2.md`
- `round2/CODING_STANDARDSv2.md`

---

## Quick start

From the `round2/fcg-claude/` directory:

```bash
docker compose up --build
```

- Frontend: <http://localhost:3040>
- Backend API: <http://localhost:8040/api/health>
- OpenAPI JSON: <http://localhost:8040/api/openapi.json>
- Swagger UI: <http://localhost:8040/api/docs>

That's the whole story. No database, no accounts, no persistence.

## Prerequisites (hard requirements)

From `ENVIRONMENT_SETUP.md`:

- **Node.js 20.x** (LTS "Iron"). The project pins `"engines": "node": ">=20 <21"`.
- **npm 10.x**
- **Docker Engine + Docker Compose v2** (tested on Docker 29.4, Compose v5.1).
- macOS or Debian/Ubuntu.

Run preflight first:

```bash
node -v        # expect v20.x
npm -v         # expect 10.x
docker --version
docker compose version
```

If any of those are missing, install the missing tool before continuing.
Do not proceed with partial setup.

### System canvas prerequisites

`@napi-rs/canvas` ships **prebuilt binaries** on macOS arm64, macOS x64,
and Linux x64/arm64. It does **not** require the Cairo/Pango/libpng stack
that classic `node-canvas` needs. No `brew install` step is required for
development on macOS / Debian / Ubuntu; the npm install completes without
native compilation on those platforms.

If you're on a less common platform and the prebuilt binary is missing,
see
[`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md#no-prebuilt-canvas-binary).

---

## Local development (outside Docker)

Backend:

```bash
cd backend
npm ci
npm run dev     # reloads on file change
```

Frontend (in a second terminal):

```bash
cd frontend
npm ci
npm run dev
```

The Vite dev server on `:3040` proxies `/api/*` to the backend on `:8040`.

## Canonical command sequence (CI / clean machine)

From a clean clone, these steps must succeed without edits:

```bash
# In backend/
npm ci
npm run lint
npm run build
npm test

# In frontend/
npm ci
npm run lint
npm run build
npm test

# Top-level
docker compose up --build
```

---

## Port assignment

| Service  | Port |
|----------|------|
| Frontend | 3040 |
| Backend  | 8040 |

These are offset from the sibling `fcg-copilot` project (which uses
3000/8080) so both implementations can run in parallel locally without
conflicts.

---

## Environment variables

All variables are documented in
[`.env.example`](.env.example). The backend validates env at startup and
falls back to the spec defaults if a variable is absent.

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `8040` | Backend HTTP port |
| `NODE_ENV` | `production` | `development`/`test`/`production` |
| `BODY_SIZE_LIMIT_MB` | `2` | Express JSON body cap |
| `MAX_GENERATION_MS` | `15000` | Hard generation timeout |
| `MAX_CANVAS_MEMORY_BYTES` | `134217728` | 128 MB canvas allocation cap |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Sliding window |
| `RATE_LIMIT_MAX` | `60` | Requests per window per IP |
| `CORS_ORIGIN` | `http://localhost:3040` | Comma-separated allowlist |

There is **no wildcard CORS** in any environment. Even local dev uses an
explicit allowlist (spec §8).

---

## Fractal methods (spec §4)

All 11 methods are implemented end-to-end:

1. Mandelbrot Set
2. Julia Sets
3. Burning Ship Fractal
4. Newton Fractals (`z³ − 1`)
5. Lyapunov Fractals
6. Iterated Function Systems (Barnsley Fern variant)
7. L-System Fractals (Dragon / Koch / Lévy-C)
8. Strange Attractors (Clifford)
9. Escape-Time Heightmaps (value-noise + fBm)
10. Flame Fractals (probabilistic IFS with variations)
11. Complex Function Phase Plots (`z²`, `sin(z)`, `exp(z)`)

Each renderer follows the method-specific color mapping strategy in spec
§5.3 (log-mapped escape-time; cyclic stride for Newton; log-density ≤ γ 0.5
for IFS/flame/attractor; brightness floor ≥ 0.5 for phase plot; palette tint
for Lyapunov stable regions). Full rationale is in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## API

Two endpoints (spec §6.2):

- `GET /api/health` — readiness probe
- `POST /api/cards/generate` — generate a card

See [`docs/API.md`](docs/API.md) for full request/response shapes and
examples. The OpenAPI 3.0.3 spec is served at `/api/openapi.json` and
rendered at `/api/docs` (Swagger UI).

---

## Testing

**Backend (Jest)**

```bash
cd backend
npm test                 # mock canvas, fast, 86 tests, ~9 s
npm run test:coverage    # same with coverage report
```

**Frontend (Vitest)**

```bash
cd frontend
npm test
npm run test:coverage
```

**End-to-end (Playwright)**

The project ships Playwright spec files in `frontend/e2e/`. In this
deployment the `playwright-mcp` Docker container is used to drive the
browser. Spec §9.4 E2E coverage is satisfied by both:

- authored `.spec.ts` files in `frontend/e2e/` (runnable with
  `npm run e2e` when Playwright browsers are installed), and
- live interactive validation against the running containers.

See [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) for common
failures.

---

## Quality gates

Every push must pass (spec §10, CODING_STANDARDSv2 §9):

```bash
npm run lint    # complexity=10, max-depth=3, max-params=5, max-lines/fn=50
npm run build   # strict TS, NodeNext
npm test        # Jest (backend) / Vitest (frontend)
```

- **Strict TypeScript**: `strict: true`, `noUncheckedIndexedAccess: true`,
  `exactOptionalPropertyTypes: true`.
- **No `any`** in production source.
- **All SQL parameterized** (this project has no database — but the
  convention is upheld across the codebase).
- **Registry-map dispatch** for fractal method selection; no large
  switch factories.

---

## Safety budgets (enforced in code)

| Limit | Value | Where enforced |
|---|---|---|
| Generation time | 15 s | `AbortController` + timer (`handlers.ts`) |
| Canvas memory | 128 MB | Pre-allocation guard (`canvasGuards.ts`) |
| Request body | 2 MB | `express.json({ limit })` |
| Rate limit | 60 req/min/IP | `express-rate-limit` |
| Iterations | 500–2000 | Ajv schema bounds |

Violations return stable error codes (spec §6.3):
`VALIDATION_ERROR`, `RATE_LIMITED`, `GENERATION_TIMEOUT`,
`CANVAS_MEMORY_EXCEEDED`, `INTERNAL_ERROR`.

---

## Privacy and data handling

- **No persistence.** No database, no disk cache, no uploads, no cookies.
- Generated images are streamed as base64 JPEG in the response and then
  discarded on the server side.
- Correlation IDs are per-request UUIDs; they do not identify users.
- Logs redact `authorization`, `cookie`, `token`, `password`, `secret`,
  `api_key`.

---

## License

MIT — see [`LICENSE`](LICENSE) for the full text. Third-party dependency
attributions are in [`NOTICES.md`](NOTICES.md).

---

## More documentation

- [Architecture overview](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Troubleshooting — common setup failures](docs/TROUBLESHOOTING.md)
- [Task tracker](TASKS.md)
- [Time tracking](TIME_TRACKING.md)

---

## Common setup failures

Most common issues and resolutions are in
[`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md). Highlights:

- **Ports in use (`EADDRINUSE` 3040/8040)**: `docker ps` + stop the
  other stack, or change the port mapping in `docker-compose.yml`.
- **`npm install` fails with ERESOLVE**: do **not** use
  `--legacy-peer-deps`. The pinned versions in `package.json` are
  compatible; confirm your Node is 20.x.
- **`@napi-rs/canvas` failed to load**: rare on Linux/macOS; see the
  troubleshooting doc for manual binary install.

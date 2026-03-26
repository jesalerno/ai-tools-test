# Environment Foundation (Deterministic Setup)

This document defines a single canonical environment path so different agents/models converge on the same build and run behavior.

## 1. Prerequisites (hard requirements)
- Node.js `20.x`
- npm `10.x`
- Docker Engine and Docker Compose v2
- macOS or Debian/Ubuntu with documented canvas prerequisites
- TypeScript baseline: `5.9.x`

## 2. Mandatory preflight (run before implementation)
Run and record:
- `node -v`
- `npm -v`
- `docker --version`
- `docker compose version`

If any requirement fails, stop and provide exact install/remediation instructions before continuing.

## 3. Canonical package/runtime rules
- `package.json` must include:
  - `"type": "module"`
  - `"engines": { "node": ">=20 <21" }`
- Use npm lockfiles and exact dependency versions only.
- Do not use global dependencies to make local commands work.
- Maintain `.env.example` with at least:
  - `PORT=8080`
  - `BODY_SIZE_LIMIT_MB=2`
  - `MAX_GENERATION_MS=15000`
  - `MAX_CANVAS_MEMORY_BYTES=134217728`
  - `RATE_LIMIT_WINDOW_MS=60000`
  - `RATE_LIMIT_MAX=60`
  - `NODE_ENV=production`

## 4. Canonical scripts
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run dev`
- `npm start`

All instructions and CI must rely on these scripts only.

## 5. TypeScript baseline
- `module` and `moduleResolution`: `NodeNext`
- `target`: `ES2022`
- `strict: true`
- `noEmitOnError: true`
- `rootDir` / `outDir` explicitly set

## 6. Lint baseline
- ESLint flat config with `@typescript-eslint` typed rules on API boundary folders.
- Enforce complexity and maintainability limits from `CODING_STANDARDv2.MD`.
- Test files may use scoped relaxations only.
- Include explicit complexity config: `{ "complexity": ["error", 10] }`.

## 7. Service layout (stable)
Use this shape consistently:
- `backend/` and `frontend/` as separate services
- backend layered folders:
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
- shared API contract:
  - root `shared/types.ts`

## 8. Server baseline
- Disable x-powered-by.
- Set JSON body limit from env.
- Mount routes, then 404 middleware, then centralized error middleware.
- Do not leak stack traces in responses.

## 9. Testing baseline
- Provide mock-first tests that run without system canvas deps.
- Provide live/integration tests, skipped by default.
- Ensure deterministic seeded test coverage for generate endpoint.
- Add browser-level E2E coverage for the full generate-and-display flow.
- Keep minimum test/source LOC ratio target at `>=15%`.

## 10. CI baseline
CI order must be fixed:
1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `npm test`

## 11. Canonical clean-machine flow
From a clean clone, these steps must work without edits:
1. preflight commands
2. `npm ci`
3. `npm run lint`
4. `npm run build`
5. `npm test`
6. `docker compose up --build`

## 12. Setup failure handling (required docs)
README must include:
- canvas prereq install for macOS and Debian/Ubuntu
- Docker troubleshooting for port conflicts and stale containers
- one copy-paste "known-good" startup path
- OpenAPI/Swagger location and usage notes.

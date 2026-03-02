# Architecture

## Service split
- `frontend`: React + Vite app that renders UI and calls REST API.
- `backend`: validates input, generates fractal quadrant, renders JPEG card.

## Clean architecture boundaries
- Domain (`backend/src/domain`): pure fractal generation and palette logic.
- Application (`backend/src/application`): orchestration, validation, time budget, error mapping.
- Infrastructure (`backend/src/infrastructure`): canvas JPEG rendering and logging.

## Rendering flow
1. Validate request (`method`, `seed`, `iterations`, `zoom`).
2. Build seed, palette, and time budget (15s).
3. Generate one quadrant with selected fractal method.
4. Validate/measure coverage; adapt iterations upward if needed (best effort).
5. Mirror quadrant horizontally + vertically to build seamless card interior.
6. Composite interior into card with 3mm border and rounded corners.
7. Export JPEG base64 and return response payload.

## Shared contracts
- Source of truth: `/shared/types.ts`.
- Backend: `backend/src/shared/types.ts` re-exports shared types.
- Frontend: copy exists at `frontend/src/shared/types.ts` to keep frontend/backend contracts explicit.

## Security controls
- Rate limit: 60 requests/min/IP.
- Request JSON size cap: `BODY_LIMIT_MB` env (1-2 MB clamp).
- Strict runtime input validation.
- Safe error responses (no stack traces to clients).
- Canvas memory budget guard (128 MB).
- Iteration clamps and 15s timeout guard.

## Testing strategy
- Domain mock tests: generation output shape and coverage.
- Application mock tests: orchestration with renderer mocked.
- API mock tests: endpoint behavior with `supertest`.
- Live tests: real canvas tests are present and skipped by default.

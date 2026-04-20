# Architecture and Stack (Deterministic Baseline)

This document defines a fixed architecture intended to reduce variance across agents/models.

## 1. Fixed Technology Choices
- Language: TypeScript across frontend and backend
- Frontend: React 19 + Vite
- Backend: Express 5.x
- Canvas/Image: `@napi-rs/canvas`
- Math: `complex.js`
- Validation: `ajv`
- Security middleware: `cors`, `express-rate-limit`
- UI/a11y baseline: Radix UI primitives + Tailwind utility styling
- API contract artifact: OpenAPI/Swagger required
- Playwright for E2E testing

No substitutions unless explicitly approved by spec.

## 2. Service Separation
- Two runtime services only:
  - `frontend`
  - `backend`
- Services communicate over HTTP only.
- No shared runtime process.

## 3. Backend Layering (required)
- Use Domain Driven Design (DDD) principles for backend layering
- `domain`: fractal logic, deterministic math, no framework imports
- `application`: use-cases, validation orchestration, API contract mapping
- `infrastructure`: Express handlers, canvas adapters, logging, env wiring

Dependency direction must remain:
`domain <- application <- infrastructure`
- Validation should be schema-driven (`ajv`) to reduce branching complexity in request validators.

## 4. Shared Contract (required)
- Canonical API types at root: `shared/types.ts`
- Backend and frontend must import from this contract path (or generated mirror) without shape drift.

## 5. Determinism Constraints
- Keep a stable folder structure and naming conventions.
- Pin dependency versions exactly.
- Avoid introducing additional frameworks for state management, styling, logging, or data access beyond listed dependencies.
- Use a single canonical endpoint layout:
  - `POST /api/cards/generate`
  - `GET /api/health`
- Use registry-map dispatch for fractal generator lookup; avoid large `switch` factories.
- Enforce explicit timeout and memory-guard modules in infrastructure wiring.

## 6. Container and Runtime Requirements
- Multi-stage Docker builds.
- Non-root runtime user.
- Frontend production image served by Nginx.
- Backend image includes only runtime dependencies.
- Health check endpoint for container orchestration.
- Explicit environment variable configuration for ports, timeouts, and logging levels.
- No in-container build tools or source code; all compilation must occur in build stage.
- Error messages must be deterministic and include correlation IDs for traceability.
- Error handling middleware must return consistent error response shapes with documented status codes and a human-readable message.
- Expose metrics endpoint for monitoring request counts, latencies, and error rates.

## 7. Operational Consistency
- Configuration only via env vars with documented defaults.
- No persistence layer, database, or disk cache.
- Structured logging with request correlation IDs.
- Include an E2E validation path (Playwright baseline) in the system test strategy.

## 8. Why this baseline
Review findings showed the highest instability in environment setup and in open-ended architecture/tooling choices. This baseline intentionally narrows optionality to improve first-run success and cross-agent consistency.

## 9. Unit Testing
- Use Jest for unit testing.
- Aim for strong domain and application unit-test coverage; measurable thresholds are enforced in coding standards.
- Mock infrastructure dependencies in application tests to isolate logic.
- Use integration tests to validate runtime behavior and conformance to the shared API contract.
- Include tests for error handling and edge cases to ensure robustness under deterministic constraints.
- Avoid testing implementation details; focus on behavior and contract adherence.
- Use snapshot testing for API responses to detect unintended changes in output shapes or messages.
- Ensure unit and integration tests are deterministic and do not rely on external state or timing.

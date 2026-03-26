# Fractal Back Card Design Generator - Unified Prompt Spec (v5)

## 1. Objective
Build a production-ready web app that generates print-quality fractal playing-card backs with deterministic controls, strong runtime safety, and low setup friction.

## 1.1 Determinism Profile (Cross-Agent Consistency)
- Primary goal: maximize implementation convergence across different agents/models.
- Do not substitute alternate frameworks, libraries, project structures, or naming conventions unless explicitly allowed in this spec.
- Use exact file and folder names defined by the architecture and environment documents.
- Use exact dependency versions (no version ranges like `^` or `~`).
- Use this fixed execution workflow:
  1. environment preflight;
  2. scaffold and install;
  3. implement backend and frontend;
  4. run lint/build/tests;
  5. apply only minimal corrective patches for failing checks.
- Avoid open-ended refactors after checks pass.

## 2. Product Scope

### 2.1 Core User Flows
- Generate with selected fractal method via `Go`.
- Generate with random method via `Surprise Me`.
- Show generated image inline and replace prior result.
- No persistence, accounts, uploads, or database.

### 2.2 UI Requirements
- Controls:
  - Fractal method dropdown (11 methods).
  - `Go` button.
  - `Surprise Me` button.
- Design:
  - Responsive layout for desktop/mobile.
  - Native HTML controls with custom CSS.
  - Follow Material Design 3 interaction principles (clear hierarchy, error prevention, recovery), without requiring an external component library.
- Error UX:
  - Inline, actionable error messages.
  - Recoverable state after failed generation (no full-page dead end).

## 3. Output and Rendering Requirements

### 3.1 Card Format
- Physical card size: `2.5in x 3.5in` (`63.5mm x 88.9mm`).
- Print output: JPEG at `300 DPI`.
- Raster target: `750 x 1050 px`.
- Border: `3mm` white border (`~35 px` at 300 DPI), rounded corners (`8 px` radius minimum).

### 3.2 Symmetry and Seamlessness
- Generate one quadrant and mirror to all four quadrants.
- Must satisfy horizontal and vertical mirroring.
- Card must remain visually coherent upside down (no directional top/bottom cues).
- Quadrant seams must be visually imperceptible.

### 3.3 Coverage and Quality
- Minimum non-background coverage: `>=80%` of quadrant pixels.
- If below threshold:
  - adapt parameters (iterations/zoom/center/density) within allowed bounds;
  - return best effort only after retries are exhausted.

## 4. Fractal Methods (Required 11)
1. Mandelbrot
2. Julia
3. Burning Ship
4. Newton (`f(z)=z^3-1`)
5. Lyapunov
6. IFS (Barnsley/Sierpinski class)
7. L-System (Dragon/Koch class)
8. Strange Attractor (Lorenz/Clifford/de Jong class)
9. Escape-Time Heightmap (noise-based)
10. Flame Fractal
11. Complex Function Phase Plot (`exp`, `sin`, `z^2` class)

## 5. Parameter Defaults and Adaptation

### 5.1 Baseline Defaults
- Iterations: `500-2000` (method may clamp by safety budget).
- Zoom: `0.5-4.0`.
- Palette: random base hue + one color-theory strategy (`primary`, `square`, `complementary`, `triad`, `analogous`, `tetradic`).
- Randomized seed per generation unless explicit seed is supplied.

### 5.2 Method-Specific Fill Strategy
- Escape-time fractals: adaptive zoom/center search for dense interesting regions.
- IFS/attractors/flame: iteration count and density scaling until coverage threshold or budget limit.
- L-systems: scale/offset/stroke strategy to occupy usable quadrant area.
- Heightmaps/phase plots: full-domain sampling without sparse holes.

## 6. API and Contract

### 6.1 Architecture
- Frontend and backend as separate services.
- Clean architecture layering:
  - Domain: fractal math and pure rendering logic inputs.
  - Application: orchestration, validation, use-case flow.
  - Infrastructure: HTTP, canvas, logging, process/runtime wiring.
- Contract-first shared types:
  - root `shared/types.ts`.
  - backend re-export pattern.
  - frontend in-src mirrored/shared copy compatible with tooling constraints.
- All request and response fields must be explicitly typed and validated at the API boundary.

### 6.2 Endpoint Contract (Minimum)
- `POST /api/cards/generate`
  - Request:
    - `method` (enum or omitted for random mode),
    - optional `seed`,
    - optional bounded tuning params.
  - Response:
    - image payload (base64 JPEG or URL/data URI),
    - selected method,
    - seed and effective parameters,
    - generation metadata (duration, retries, warnings).
- `GET /api/health` for service readiness.

### 6.3 Error Contract (Required)
- 4xx/5xx responses must return:
  - `{ "error": "<stable code>", "message": "<user-safe text>" }`
- Validation errors must return HTTP 400 with field-specific reasons.
- Do not expose stack traces, filesystem paths, or internal module names in API responses.

## 7. Performance and Resource Budgets
- Generation timeout: hard cap `15s` per request.
- Memory cap target for generation path: `128MB` per request context.
- Reject unsafe dimensions/iteration requests before computation.
- Rate limit default: `60 req/min/IP` (configurable by env).
- Request body size cap: default `2MB` configurable by env.

## 8. Security Requirements
- Runtime validation for all request payloads.
- No `eval`, `Function`, `new Function`, or shell execution.
- No unsafe React HTML injection (`dangerouslySetInnerHTML` disallowed).
- Frontend must implement React error boundaries to prevent full UI failure and information leakage.
- CORS:
  - production must be explicit allowlist;
  - no wildcard for production API.
- Error responses must not expose stack traces/internal implementation detail.
- Server logs may include diagnostics but must exclude sensitive data.

## 8.1 Required Security/Resource Implementation Patterns
- Rate limiting must use exact `express-rate-limit` configuration:
  - `windowMs: 60 * 1000`
  - `max: 60`
  - keying by client IP
- Generation timeout must use explicit abort logic with:
  - `MAX_GENERATION_MS = 15000`
  - `AbortController` or `Promise.race` timeout guard.
- Canvas memory guard must validate before allocation:
  - `MAX_CANVAS_MEMORY_BYTES = 128 * 1024 * 1024`
  - `requiredBytes = width * height * 4`
  - reject request when `requiredBytes > MAX_CANVAS_MEMORY_BYTES`.
- Request body size default must be pinned to `2MB` and configurable via `BODY_SIZE_LIMIT_MB`.

## 9. Testing Strategy (Required)

### 9.1 Test Layers
- Unit tests for domain and application layers.
- API route tests for validation and contract behavior.

### 9.2 Dual Test Modes
- Mock tests (default in CI): fast and isolated.
- Live tests (real canvas/integration): present but skipped by default unless explicitly enabled.

### 9.3 Coverage Expectations
- In-bound scenarios: valid method flows, deterministic seed behavior, surprise mode.
- Out-of-bound scenarios: invalid methods, bounds overflow, timeout paths, low-coverage retries, malformed JSON.

### 9.4 Coverage and Test Depth Targets
- Minimum test/source LOC ratio target: `>=15%`.
- Minimum test file target: `>=4` files.
- Include mock + live test modes (live tests may be skipped by default, but must be runnable).
- Include end-to-end browser workflow coverage (Playwright or Cypress) for generate-and-display flow.

## 10. Tooling and Quality Gates
- TypeScript strict mode.
- ESLint with complexity guard (`<=10` cyclomatic).
- Prefer no `any`; if unavoidable, isolate and justify.
- Lint + test must pass before merge.
- Complexity/code smell controls:
  - nesting target `<=3`,
  - avoid magic numbers,
  - keep functions/classes maintainable (extract helpers where needed).
- ESLint must include the exact complexity rule:
  - `{ "complexity": ["error", 10] }`
- Functions with CCN `>=11` must be refactored unless classified as approved structural dispatch.
- Use registry-map dispatch instead of large switch factories for fractal generator selection.
- Minimum comment density target in source: `>=10%` of non-blank lines.
- Minimum `try/catch` target: `>=4` blocks in backend production paths.

## 11. Dependencies and Platform Notes
- Backend: Node.js 20+, TypeScript, Express 5.x, `@napi-rs/canvas`, `complex.js`.
- Frontend: React 19 + Vite + TypeScript.
- Docker + docker-compose for local orchestration.
- Canvas system prerequisites must be documented for macOS and Debian/Ubuntu before install.
- Dependency policy:
  - pin exact package versions in `package.json` and lockfile;
  - no deprecated direct dependencies;
  - no optional replacement stack choices in generated output.

## 11.1 Environment-First Requirement
- Before implementation, run and document preflight results for:
  - `node -v`, `npm -v`, `docker --version`, `docker compose version`.
- If prerequisites are missing, fail fast with exact install instructions and do not continue with partial setup.
- Setup docs must include one canonical command path from clean clone to passing checks.

## 11.2 Dependency Inventory and Audit Expectations
- Document direct dependencies with package name, pinned version, and purpose for both services.
- Include a backend and frontend dependency table in README (or dedicated docs).
- Include a dependency update process:
  - run `npm outdated`,
  - review changelogs before updates,
  - rerun required gates after updates.
- Include security audit process:
  - run `npm audit`,
  - run `npm audit --production` for runtime risk review.
- Include license verification process using `license-checker` (or equivalent) and record results in attribution docs.
- Avoid deprecated direct dependencies. If unavoidable, include migration plan and explicit justification.
- Perform and document a regular dependency/security review cadence (at least monthly).

## 11.3 Deprecation Management
- Detect deprecations during install and outdated checks.
- If a direct dependency is deprecated, upgrade before release unless blocked by a documented compatibility constraint.
- Track and document deprecation remediation status in project documentation.

## 12. Compliance and Documentation
- MIT license required for project.
- Include dependency attribution file (`NOTICES.md` or `THIRD_PARTY_LICENSES.md`).
- Document setup, env vars, known limits, and troubleshooting in README.
- Include a concise "Common Setup Failures" section focused on environment and Docker issues.
- Include API documentation at minimum via inline route/controller comments and request/response examples in README.
- Include formal OpenAPI/Swagger specification for all public API routes.
- Documentation target: at least 5 markdown docs and >=5,000 total documentation words.
- README must include quick start, troubleshooting, privacy/data handling, and license sections.

## 12.1 Execution Discipline (Prompt-Behavior Guardrails)
- Question budget: ask at most 3 blocking questions total; otherwise proceed with spec defaults.
- Context-window discipline:
  - when parsing large files/lists, process in chunks and produce a reconciliation summary before acting;
  - do not claim completion until all required checks are executed and reported.
- Self-review discipline:
  - after initial implementation, only change code required to fix failing checks or explicit spec violations;
  - avoid broad rewrites that alter already-passing behavior.

## 13. Definition of Done
- UI flows work (`Go`, `Surprise Me`, inline replacement).
- All 11 fractal methods available and wired end-to-end.
- Output meets card size, DPI, border, symmetry, and seam requirements.
- Safety budgets enforced (timeout/memory/validation/rate limit).
- Mock tests passing; live tests available and runnable.
- Dockerized local run works with documented prerequisites.
- Final report includes:
  - exact commands run;
  - pass/fail result for lint/build/tests;
  - any remaining known limitation with remediation note.

## 14. Deployment and Runtime Defaults
- Docker Compose is the canonical local orchestration path.
- Frontend production container serves static assets via Nginx.
- Backend default runtime port: `8080` (env-overridable).
- Frontend default runtime port: `3000` (env-overridable).
- Provide `.env.example` with mandatory variables:
  - `PORT=8080`
  - `BODY_SIZE_LIMIT_MB=2`
  - `MAX_GENERATION_MS=15000`
  - `MAX_CANVAS_MEMORY_BYTES=134217728`
  - `RATE_LIMIT_WINDOW_MS=60000`
  - `RATE_LIMIT_MAX=60`
  - `NODE_ENV=production`

## 15. Development Experience Requirements
- Hot reload for backend and frontend during local development.
- Clear startup error guidance when prerequisites are missing.
- Mock tests must run without requiring system canvas dependencies.
- Application should work immediately after following the documented setup path.

## 16. Deliverables
1. Complete project structure with required backend, frontend, and shared contract files.
2. Working application that runs via `docker compose up --build`.
3. Passing mock test suite (minimum).
4. Documentation bundle:
   - README with prerequisites and setup,
   - architecture notes,
   - troubleshooting guidance,
   - API usage notes.
5. Shared TypeScript contract definitions for frontend/backend alignment.
6. Docker configuration for both services.
7. License and attribution artifacts:
   - root `LICENSE` (MIT),
   - `NOTICES.md` or `THIRD_PARTY_LICENSES.md`.
8. Code quality/security evidence:
   - lint/build/test outcomes,
   - dependency audit outcome,
   - deprecation status.

## 17. Success Criteria
- Application runs successfully with `docker compose up --build`.
- All 11 fractal methods generate valid card images.
- Cards meet dimensions, border, symmetry, seam, and coverage requirements.
- `Go` and `Surprise Me` workflows operate as specified.
- Mock tests pass.
- No uncaught runtime errors in normal usage paths.
- System dependency requirements are clearly documented.
- License and attribution artifacts are present and complete.
- No deprecated direct dependencies without documented exception.
- Color compliance is satisfied for all fractal methods (no greyscale-only output when color harmony is configured).
- K20-inspired output quality thresholds (per seed and aggregate):
  - edge density `> 0.03`,
  - fractal dimension `> 1.3` for Mandelbrot baseline,
  - coverage remains `>=80%`.
- Multi-seed behavior: same fractal method must yield measurably different palettes for at least 5 distinct seeds.

## 17.1 Color Harmony and Quality Rules
- Must implement all 6 harmony modes with exact enum-friendly values:
  - `PRIMARY`, `SQUARE`, `COMPLEMENTARY`, `TRIAD`, `ANALOGOUS`, `TETRADIC`.
- Greyscale output is a spec violation when a color harmony type is configured.
- Color mapping strategy (gradient vs discrete) must be explicitly documented and test-validated.

## 18. Known Challenges and Required Mitigations
- Canvas native modules:
  - document platform prerequisites clearly;
  - provide troubleshooting steps for install/build failures.
- Shared types across service boundaries:
  - enforce canonical shared contract and mirror strategy where tooling requires.
- Dependency/version conflicts:
  - document known constraints and canonical resolution path.
- Module resolution and test wiring:
  - keep test imports/tooling aligned with ESM/TS configuration.
- License and attribution compliance:
  - verify and record dependency license data.
- Complexity pressure in fractal algorithms:
  - extract helpers and keep complexity limits enforceable.

## 19. Additional Notes
- Prioritize maintainability and deterministic behavior over premature optimization.
- If requirements conflict, prioritize safety, contract correctness, and deterministic reproducibility.
- All exceptions to this spec must be documented with rationale and impact.

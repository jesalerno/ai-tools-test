# Fractal Back Card Design Generator — Unified Prompt Spec (v3)

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

---

## 2. Product Scope

### 2.1 Core User Flows
- Generate with selected fractal method via `Go`.
- Generate with random method via `Surprise Me`.
  - After generation completes, the fractal method dropdown **must update** to reflect the method actually used by the server.
- Show generated image inline and replace prior result.
- No persistence, accounts, uploads, or database.

### 2.2 UI Requirements
- Controls:
  - Fractal method dropdown (11 methods).
  - `Go` button.
  - `Surprise Me` button.
  - Display area for generated card image.
- Design:
  - Responsive layout for desktop/mobile.
  - Native HTML controls with custom CSS.
  - Follow Material Design 3 interaction principles (clear hierarchy, error prevention, recovery).
  - Reference: https://m3.material.io/components
- Error UX:
  - Inline, actionable error messages.
  - Recoverable state after failed generation (no full-page dead end).
  - React error boundaries must catch render errors and display a recoverable fallback UI rather than a blank screen.
- Performance:
  - Show loading state during generation.
  - Do not block UI thread; use async patterns.
  - HTML pages must not be cached by the browser; see §14 for the required Nginx cache policy.

---

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

### 3.4 Renderer Implementation Constraints
All fractal renderer functions operate on pixel density buffers whose size equals `quadrantWidth × quadrantHeight` (≥ 196,000 elements at the required canvas resolution). The following patterns are **prohibited** in any renderer:

- **No spread into variadic functions on large arrays**: `Math.max(...densityBuffer)` and `Math.min(...densityBuffer)` will throw `RangeError: Maximum call stack size exceeded` at production canvas sizes. Use an explicit `for` loop to find min/max.
- **No unbounded recursion**: All iterative fractal logic must use `for`/`while` loops with explicit bounds, not recursive function calls.
- **No in-loop allocation**: Do not allocate new objects, arrays, or closures inside the per-pixel inner loop. Pre-allocate outside.
- **Iteration cap required**: Every renderer must have a named constant (e.g., `MAX_ITER`, `IFS_ITERS`) that bounds total work. Unbounded loops are not permitted.

These constraints must be verified by the fractal renderer test suite (see §9) and checked during code review.

---

## 4. Fractal Methods

Eleven methods are required. Each entry specifies the canonical algorithm; implementations must follow these definitions.

1. **Mandelbrot Set** — Iterate `z = z² + c` for each complex pixel `c`; color by escape iteration count.
2. **Julia Sets** — Iterate `z = z² + c` where `c` is a fixed complex constant; `z` starts at each pixel coordinate.
3. **Burning Ship Fractal** — Iterate `z = (|Re(z)| + i|Im(z)|)² + c`; color by escape iteration count.
4. **Newton Fractals** — Apply Newton's method to `f(z) = z³ − 1`; color by root basin of convergence and iteration count.
5. **Lyapunov Fractals** — Compute Lyapunov exponents for logistic map sequences parameterized by a symbolic sequence; color chaotic vs. stable regions distinctly (see §5.3).
6. **Iterated Function Systems (IFS)** — Barnsley Fern or Sierpiński Triangle via randomly applied affine transformations (chaos game).
7. **L-System Fractals** — String rewriting with turtle graphics; Dragon Curve or Koch Curve class; path must occupy usable quadrant area (see §5.2).
8. **Strange Attractors** — Lorenz, Clifford, or de Jong attractors plotted with alpha blending for density.
9. **Escape-Time Heightmaps** — Perlin/Simplex noise-based heightmaps; full-domain sampling without gaps.
10. **Flame Fractals** — Probabilistic IFS with non-linear variation functions; chaos game with random transform selection and warmup (see §5.3).
11. **Complex Function Phase Plots** — Map `f(z)` argument and magnitude to color for `exp`, `sin`, or `z²`; brightness floor required (see §5.3).

---

## 5. Parameter Defaults and Adaptation

### 5.1 Baseline Defaults
All 11 methods share uniform default ranges unless a method-specific fill strategy (§5.2) requires clamping within the range.

| Fractal Method | Iteration Range | Zoom Range | Palette Strategy |
|---|---|---|---|
| Mandelbrot Set | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Julia Sets | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Burning Ship | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Newton Fractals | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Lyapunov Fractals | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| IFS | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| L-System Fractals | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Strange Attractors | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Escape-Time Heightmaps | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Flame Fractals | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |
| Complex Phase Plots | 500–2000 | 0.5–4.0 | Random base hue + random color-theory mode |

Color-theory modes: `PRIMARY`, `SQUARE`, `COMPLEMENTARY`, `TRIAD`, `ANALOGOUS`, `TETRADIC` (see §17.1 for enum values).

A randomized seed is used per generation unless an explicit seed is supplied.

### 5.2 Method-Specific Fill Strategy
- Escape-time fractals: adaptive zoom/center search for dense interesting regions.
- IFS/attractors/flame: iteration count and density scaling until coverage threshold or budget limit.
- L-systems: scale/offset/stroke strategy to occupy usable quadrant area.
- Heightmaps/phase plots: full-domain sampling without sparse holes.

If coverage remains below `>=80%` after reaching the iteration maximum, return best-effort output and include a warning in the API response metadata.

### 5.3 Per-Renderer Color Mapping Strategy (Required)

Incorrect iteration-to-color mapping is the primary cause of flat, pixelated, or near-black output. Each renderer class **must** use the strategy below.

#### Escape-time renderers (Mandelbrot, Julia, Burning Ship, Heightmap)
- Use **log-mapped palette indexing**: `t = log(iter + 1) / log(MAX_ITER + 1)`.
- Do **not** use linear mapping (`t = iter / MAX_ITER`). At typical parameter values, 95%+ of exterior pixels escape at low iteration counts, compressing nearly all pixels into the first 1–6% of the palette and producing flat banding.
- Smooth iteration count (continuous coloring) is recommended to eliminate discrete banding rings.

#### Newton fractal
- Use a **cyclic palette** with separate stride indexing per root basin.
- Example: `paletteIdx = (rootIndex * STRIDE + iter % STRIDE) % CYCLE_LENGTH`.
- Direct `iter / MAX_ITER` linear mapping loses basin color distinction.

#### Density-based renderers (IFS, Flame Fractal, Strange Attractor)
- Use **log-density mapping** with gamma ≤ 0.5: `t = log(density + 1) / log(maxDensity + 1)`.
- Do **not** use linear density mapping. Hot-spot pixels vastly outnumber cold ones; linear mapping produces mostly-black output except at a few bright points.

#### Flame Fractal (chaos game constraint)
- Must use the IFS chaos game: **randomly select a transform per iteration** (uniform random selection), not round-robin (`i % n`).
- Deterministic cycling creates periodic closed-curve artifacts (visible rings in the output).
- A **warmup period of ≥ 20 iterations** must be discarded before recording pixel hits.
- Affine coefficients must be sufficiently expansive to produce chaotic (non-convergent) orbits.

#### Phase Plot
- Pixel brightness must have a **minimum floor of ≥ 0.5** to prevent near-black output across most of the complex plane.
- Recommended formula: `brightness = base + amplitude × |sin(π · log(magnitude))|` with `base ≥ 0.6` and `base + amplitude ≤ 1.0`.

#### Lyapunov
- **Stable regions** (positive Lyapunov exponent) must **not** render as solid `rgb(0,0,0)`.
- Use a **dark tint derived from the active palette** (e.g., 10–20% brightness scaling) so stable regions remain visually distinct from chaotic regions.
- Use at least 3 distinct symbolic sequences (e.g., `[0,1]`, `[0,0,1]`, `[0,1,1]`) to provide variety across seeds.

### 5.4 Solid-Black Prohibition
Rendering any significant pixel region as literal `rgb(0,0,0)` — not derived from the configured palette — is treated as a **color compliance violation**, equivalent to greyscale output under §17.1. All pixels must derive their final color from the harmony palette, even in "dark" or "stable" render zones.

---

## 6. API and Contract

### 6.1 Architecture
- Frontend and backend as separate services.
- Clean architecture layering:
  - Domain: fractal math and pure rendering logic.
  - Application: orchestration, validation, use-case flow.
  - Infrastructure: HTTP, canvas, logging, process/runtime wiring.
- Contract-first shared types:
  - root `shared/types.ts`;
  - backend re-export pattern (`backend/src/shared/types.ts` → `../../../shared/types.ts`);
  - frontend in-src mirrored copy (`frontend/src/shared/types.ts`) — React/Vite tooling does not allow imports outside `src/`.
- All request and response fields must be explicitly typed and validated at the API boundary.

### 6.2 Endpoint Contract (Minimum)
- `POST /api/cards/generate`
  - Request: `method` (enum or omitted for random mode), optional `seed`, optional bounded tuning params.
  - Response: image payload (base64 JPEG or data URI), selected method, seed and effective parameters, generation metadata (duration, retries, warnings).
- `GET /api/health` for service readiness.

### 6.3 Error Contract (Required)
- 4xx/5xx responses must return: `{ "error": "<stable code>", "message": "<user-safe text>" }`.
- Validation errors must return HTTP 400 with field-specific reasons.
- Do not expose stack traces, filesystem paths, or internal module names in API responses. (The corresponding server-side security requirement is in §8.)

---

## 7. Performance and Resource Budgets
- Generation timeout: hard cap `15s` per request.
- Memory cap target for generation path: `128MB` per request context.
- Reject unsafe dimensions/iteration requests before computation.
- Rate limit default: `60 req/min/IP` (configurable by env).
- Request body size cap: default `2MB`, configurable by env.

---

## 8. Security Requirements
- Runtime validation for all request payloads (method, seed, dimensions); sanitize numeric inputs to safe ranges before processing.
- No `eval`, `Function`, `new Function`, or shell execution.
- No unsafe React HTML injection (`dangerouslySetInnerHTML` disallowed).
- React error boundaries are required to prevent information leakage from unhandled render exceptions (see §2.2 for the UX behavior requirement).
- CORS:
  - production must use an explicit origin allowlist; no wildcard;
  - non-production must also use an explicit allowlist of required origins, not a wildcard.
- Error responses must not expose stack traces or internal implementation details (see §6.3 for the API response format contract).
- Server logs may include diagnostics but must exclude sensitive data (credentials, tokens, PII).
- Run `npm audit` regularly; fix high/critical vulnerabilities immediately; document accepted vulnerabilities with justification and mitigation plan.
- Monitor security advisories for all dependencies.

## 8.1 Required Security/Resource Implementation Patterns
- Rate limiting must use exact `express-rate-limit` configuration:
  - `windowMs: 60 * 1000`, `max: 60`, keyed by client IP.
- Generation timeout must use explicit abort logic:
  - `MAX_GENERATION_MS = 15000`; `AbortController` or `Promise.race` timeout guard.
- Canvas memory guard must validate before allocation:
  - `MAX_CANVAS_MEMORY_BYTES = 128 * 1024 * 1024`; `requiredBytes = width * height * 4`; reject when `requiredBytes > MAX_CANVAS_MEMORY_BYTES`.
- Request body size default must be pinned to `2MB` and configurable via `BODY_SIZE_LIMIT_MB`.

---

## 9. Testing Strategy (Required)

### 9.1 Test Layers
- Unit tests for domain and application layers.
- API route tests for validation and contract behavior.
- Image generation tests: mocked canvas by default; optional live canvas tests.

### 9.2 Dual Test Modes
- Mock tests (default in CI): fast and isolated; must run without system canvas dependencies.
- Live tests (real canvas/integration): present but skipped by default; must be runnable on demand.

### 9.3 Coverage Expectations
- In-bound scenarios: valid method flows, deterministic seed behavior, surprise mode dropdown sync.
- Out-of-bound scenarios: invalid methods, bounds overflow, timeout paths, low-coverage retries, malformed JSON.

### 9.4 Coverage and Test Depth Targets
- Minimum test/source LOC ratio: `>=15%`.
- Minimum test file count: `>=4`.
- Include end-to-end browser workflow coverage (Playwright or Cypress) for the generate-and-display flow.

---

## 10. Tooling and Quality Gates
- TypeScript strict mode enabled.
- ESLint must enforce `{ "complexity": ["error", 10] }`; functions with CCN `>=11` must be refactored unless classified as approved structural dispatch (see §18 Challenge 5 for the registry-map exception).
- Use registry-map dispatch instead of large switch factories for fractal generator selection.
- Prefer no `any`; if unavoidable, isolate and document the reason.
- Lint + test must pass before merge.
- Complexity/code smell controls:
  - nesting target `<=3`;
  - avoid magic numbers — extract to named constants;
  - function length `<=50` lines;
  - class length `<=300` lines;
  - parameter count `<=5` per function (use a parameter object for more);
  - apply DRY principle — extract duplicated logic;
  - single responsibility per function/class;
  - use meaningful, unabbreviated names.
- Prettier required for consistent code formatting; integrate with ESLint.
- Consider SonarJS ESLint plugin for additional complexity analysis.
- Minimum comment density: `>=10%` of non-blank lines.
- Minimum `try/catch` blocks in backend production paths: `>=4`.

---

## 11. Dependencies and Platform Notes
- Backend: Node.js 20+, TypeScript, Express 5.x, `@napi-rs/canvas`, `complex.js`.
- Frontend: React 19 + Vite + TypeScript.
- Docker + docker-compose for local orchestration.
- **Frontend toolchain note (CRACO retired):** An earlier draft of this spec used Create React App with CRACO as a workaround for CRA's inflexibility and its expectation of TypeScript 3–4. That approach is retired. CRA has been unmaintained since 2023; CRACO follows it. Vite replaces both: it has native TypeScript 5 support, full React 19 compatibility, dramatically faster dev-server startup via native ESM, and a first-class config API. Do not use `react-scripts`, `@craco/craco`, or `--legacy-peer-deps` in this project.
- Canvas system prerequisites must be documented for macOS and Debian/Ubuntu before install.
- Dependency policy:
  - pin exact package versions in `package.json` and lockfile;
  - no deprecated direct dependencies;
  - no optional replacement stack choices in generated output.

## 11.1 Environment-First Requirement
- Before implementation, run and document preflight results for: `node -v`, `npm -v`, `docker --version`, `docker compose version`.
- If prerequisites are missing, fail fast with exact install instructions and do not continue with partial setup.
- Setup docs must include one canonical command path from clean clone to passing checks.

## 11.2 Dependency Inventory and Audit Expectations
- Document all direct dependencies with package name, pinned version, and purpose for both services.
- Include a backend and frontend dependency table in README (or dedicated docs).
- Review critical transitive dependencies for security issues.
- Dependency update process:
  - run `npm outdated`;
  - review changelogs before updates;
  - rerun all required gates after updates;
  - document breaking changes and migration steps.
- Security audit process:
  - run `npm audit`; use `npm audit fix` where safe; review changes before committing;
  - run `npm audit --production` for runtime-only risk review.
- License verification: run `license-checker` (or equivalent) and record results in attribution docs.
- Avoid deprecated direct dependencies. If unavoidable, include migration plan and explicit justification.
- Perform and document a regular dependency/security review cadence (at least monthly).

## 11.3 Deprecation Management
- Detect deprecations during install and outdated checks.
- If a direct dependency is deprecated, upgrade before release unless blocked by a documented compatibility constraint.
- Track and document deprecation remediation status in project documentation.
- Known deprecations to address:
  - `supertest 6.3.3` is deprecated — upgrade to `7.1.3+`.
  - Avoid deprecated Babel plugins; use native ES features instead.
  - Jest: use `transform` configuration instead of deprecated `globals.ts-jest` pattern.
  - Express: avoid deprecated middleware patterns; use current Express 5.x APIs.
  - React: avoid deprecated lifecycle methods (`componentWillMount`, etc.); use hooks.

---

## 12. Compliance and Documentation
- MIT license required for project.
- Include `LICENSE` file in project root with full MIT license text (plain text, not markdown); include copyright year and holder name.
- Set `"license": "MIT"` in all `package.json` files (root, backend, frontend).
- Include dependency attribution file (`NOTICES.md` or `THIRD_PARTY_LICENSES.md`) at project root. For each direct dependency, include:
  - package name and version;
  - license type (MIT, ISC, Apache-2.0, etc.);
  - link to license file or repository;
  - brief description of usage in the project.
- Verify all direct dependencies are MIT-compatible; check transitive dependencies for incompatible licenses (GPL, AGPL). No GPL/AGPL dependencies unless explicitly approved with justification.
- Document setup, env vars, known limits, and troubleshooting in README.
- README must include: quick start, prerequisites, system dependency install commands (macOS and Debian/Ubuntu), troubleshooting, privacy/data handling, and license sections.
- Include a concise "Common Setup Failures" section focused on environment and Docker issues.
- Include API documentation at minimum via inline route/controller comments and request/response examples in README.
- Include formal OpenAPI/Swagger specification for all public API routes.
- Documentation target: at least 5 markdown docs and `>=5,000` total documentation words.

## 12.1 Execution Discipline (Prompt-Behavior Guardrails)
- Question budget: ask at most 3 blocking questions total; otherwise proceed with spec defaults.
- Context-window discipline:
  - when parsing large files/lists, process in chunks and produce a reconciliation summary before acting;
  - do not claim completion until all required checks are executed and reported.
- Self-review discipline:
  - after initial implementation, only change code required to fix failing checks or explicit spec violations;
  - avoid broad rewrites that alter already-passing behavior.

---

## 13. Definition of Done
- UI flows work (`Go`, `Surprise Me` with dropdown sync, inline image replacement).
- All 11 fractal methods available and wired end-to-end.
- Output meets card size, DPI, border, symmetry, seam, and coverage requirements.
- Safety budgets enforced (timeout/memory/validation/rate limit).
- Mock tests passing; live tests available and runnable.
- Dockerized local run works with documented prerequisites.
- Final report includes:
  - exact commands run;
  - pass/fail result for lint/build/tests;
  - any remaining known limitation with remediation note.

---

## 14. Deployment and Runtime Defaults
- Docker Compose is the canonical local orchestration path.
- Frontend production container serves static assets via Nginx.
- Backend default runtime port: `8080` (env-overridable).
- Frontend default runtime port: `3000` (env-overridable).
- **Nginx cache policy (required)**:
  - `index.html` must be served with `Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache`.
  - Hashed JS/CSS assets (content-addressed by Vite build) may use `Cache-Control: public, max-age=31536000, immutable`.
  - API proxy responses (`/api/`) must also carry `Cache-Control: no-cache, no-store, must-revalidate`.
  - `<meta http-equiv="Cache-Control">` no-cache tags in `index.html` serve as a belt-and-suspenders complement to the Nginx headers.
- Provide `.env.example` with mandatory variables:
  - `PORT=8080`
  - `BODY_SIZE_LIMIT_MB=2`
  - `MAX_GENERATION_MS=15000`
  - `MAX_CANVAS_MEMORY_BYTES=134217728`
  - `RATE_LIMIT_WINDOW_MS=60000`
  - `RATE_LIMIT_MAX=60`
  - `NODE_ENV=production`

---

## 15. Development Experience Requirements
- Hot reload for backend and frontend during local development.
- Clear startup error guidance when prerequisites are missing.
- Mock tests must run without requiring system canvas dependencies.
- Application should work immediately after following the documented setup path.

---

## 16. Deliverables
1. Complete project structure with required backend, frontend, and shared contract files.
2. Working application that runs via `docker compose up --build`.
3. Passing mock test suite (minimum).
4. Documentation bundle:
   - README with prerequisites and setup (including platform-specific system dependency install commands);
   - architecture notes;
   - troubleshooting guidance;
   - API usage notes.
5. Shared TypeScript contract definitions for frontend/backend alignment.
6. Docker configuration for both services.
7. License and attribution artifacts per §12 (`LICENSE`, `NOTICES.md` or `THIRD_PARTY_LICENSES.md`).
8. Code quality/security evidence:
   - lint/build/test outcomes;
   - dependency audit outcome;
   - deprecation status.
9. Developer README for setup experience:
   - clear instructions for installing system dependencies;
   - clear instructions for setting up the development environment;
   - clear instructions for running the application and tests.
10. Final report with execution details and known limitations.

---

## 17. Success Criteria
- Application runs successfully with `docker compose up --build`.
- All 11 fractal methods generate valid card images.
- Cards meet dimensions, border, symmetry, seam, and coverage requirements.
- UI flows operate as specified per §13 (`Go`, `Surprise Me` with dropdown sync, inline image replacement).
- Mock tests pass.
- No uncaught runtime errors in normal usage paths.
- System dependency requirements are clearly documented.
- License and attribution artifacts are present and complete.
- No deprecated direct dependencies without documented exception.
- Color compliance satisfied for all fractal methods (no greyscale-only output, no solid-black regions when color harmony is configured).
- K20-inspired output quality thresholds (per seed and aggregate):
  - edge density `> 0.03`;
  - fractal dimension `> 1.3` for Mandelbrot baseline;
  - coverage remains `>=80%`.
- Multi-seed behavior: same fractal method must yield measurably different palettes for at least 5 distinct seeds.
- All functions meet cyclomatic complexity ≤ 10.
- No code smells: no deep nesting, no magic numbers, no duplicate code.
- Security vulnerabilities addressed (`npm audit` clean or all exceptions documented).
- All dependencies verified as MIT-compatible; `NOTICES` file complete.

## 17.1 Color Harmony and Quality Rules
- Must implement all 6 harmony modes with exact enum-friendly values:
  - `PRIMARY`, `SQUARE`, `COMPLEMENTARY`, `TRIAD`, `ANALOGOUS`, `TETRADIC`.
- Greyscale output is a spec violation when a color harmony type is configured.
- Solid-black output in any significant render region is treated as equivalent to a greyscale violation (see §5.4).
- Color mapping strategy (gradient vs discrete) must be explicitly documented and test-validated.
- Each renderer class must use the coloring strategy specified in §5.3. Deviations require documented justification.

---

## 18. Known Challenges and Required Mitigations

**Challenge 1: Canvas Native Module**
- Issue: `@napi-rs/canvas` may require native build tooling on some platforms.
- Solution: Document platform prerequisites in README with exact commands — macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`; Debian/Ubuntu: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`). Note: verify these commands for `@napi-rs/canvas` specifically; requirements differ from `node-canvas`.
- Fallback: Mock canvas in tests so all tests run without system dependencies.

**Challenge 2: Shared Types Across Services**
- Issue: Vite/React does not allow imports from outside `src/`.
- Solution: Backend uses re-export pattern (`backend/src/shared/types.ts` re-exports from root `shared/types.ts`). Frontend copies types into `frontend/src/shared/types.ts`. Document this approach in architecture docs.
- Alternative: Monorepo tooling (not required for this project).

**Challenge 3: Module Resolution in Tests**
- Issue: Jest/TypeScript may fail to resolve shared types across service boundaries.
- Solution: Use the re-export pattern for backend; copy strategy for frontend. Configure path mapping in `tsconfig` and `jest.config` if needed.

**Challenge 4: License Compliance and Attribution**
- Issue: Ensuring all dependencies (including transitive) are MIT-compatible.
- Solution: Run `license-checker` to audit all licenses. Create `NOTICES.md` with per-package attribution fields (name, version, license type, link, usage description).
- Verification: Check transitive dependency graph for GPL/AGPL licenses; document any exceptions.

**Challenge 5: Cyclomatic Complexity in Fractal Algorithms**
- Issue: Complex fractal generation logic often exceeds CCN ≤ 10.
- Solution: Extract helper methods, use early returns, break complex conditionals into named functions. Registry-map dispatch for method selection is an approved structural exception.
- Tools: ESLint complexity rule, SonarJS plugin for additional analysis.
- Documentation: Document any intentional complexity exceptions with justification.

**Challenge 6: Color Compliance and Mapping Artifacts**
- Issue: Naive iteration-to-color or density-to-color mapping produces flat, dark, or banded output that fails compliance checks.
- Solution: Use the method-specific coloring strategies defined in §5.3 (log-mapping for escape-time, log-density for IFS/flame/attractors, chaos game with warmup for flame, brightness floor for phase plots, palette tinting for Lyapunov stable regions).
- Verification: Color compliance tests must confirm no greyscale-only output and no solid-black regions across all 11 methods.

---

## 19. Additional Notes
- Prioritize maintainability and deterministic behavior over premature optimization.
- If requirements conflict, prioritize safety, contract correctness, and deterministic reproducibility.
- Use MIT-licensed libraries where possible; all dependencies must be MIT-compatible.
- All exceptions to this spec must be documented with rationale and impact.

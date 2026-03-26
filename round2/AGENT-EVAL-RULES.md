# Agent Evaluation Rules
## NFR, Architecture, Design, Determinism, and Compliance Constraints for Multi-Agent Comparison

**Project:** Fractal Card Generator
**Spec:** `PROMPT-SPEC-FRACTAL-CARD-GENERATOR-UNIFIED.md`
**Coding Standard:** `CODING_STANDARDv2.MD`
**Environment:** `ENVIRONMENT_SET.md`
**Architecture:** `ARCHITECTURE.md`

## Purpose
Establish a reproducible scoring ruleset so two or more agents, given the same prompt/spec, can be compared fairly and consistently.

---

## 1. Evaluation Preconditions

### PRE-01 — Identical Inputs
- **PASS:** Every agent receives the exact same prompt bundle with no follow-up clarifications.
- **FAIL:** Any agent receives additional hints, constraints, or fixes.

### PRE-02 — Clean Environment
- **PASS:** Evaluation runs on clean machines/containers with the same OS class and hardware profile.
- **FAIL:** One agent is evaluated with preinstalled dependencies or cached state unavailable to others.

### PRE-03 — Deterministic Seed Control
- **PASS:** Consistency/symmetry tests use fixed seeds (at minimum seed `42`).
- **FAIL:** Seeds vary by agent run.

---

## 2. Non-Functional Requirements (NFR)

### NFR-01 — First-Run Reliability
- **PASS:** `docker compose up --build` succeeds without manual fixes; services healthy within 60 seconds.
- **PARTIAL:** Starts with non-fatal warnings indicating fragility.
- **FAIL:** Requires manual intervention.

### NFR-02 — Environment Preflight Discipline
- **PASS:** Output includes preflight results for `node -v`, `npm -v`, `docker --version`, `docker compose version`.
- **FAIL:** Missing preflight evidence.

### NFR-03 — Generation Latency
- **PASS:** At least 9/11 fractal methods complete in <=15s with valid response.
- **FAIL:** Any hangs, repeated 5xx, or no timeout handling.

### NFR-04 — Output Correctness
- **PASS:** All 11 methods satisfy size, JPEG output, border, and coverage requirements.
- **PARTIAL:** >=8 methods satisfy all criteria.
- **FAIL:** Fewer than 8 pass or output format is wrong.

### NFR-05 — Symmetry Correctness
- **PASS:** 180-degree rotation pixel diff <=1% (JPEG-aware tolerance).
- **FAIL:** Missing or incomplete mirror symmetry.

### NFR-06 — Test Suite Execution
- **PASS:** Mock-first test mode passes with zero failures.
- **PARTIAL:** Passes with unexpected skips.
- **FAIL:** Compile failure, runtime failure, or requires live canvas by default.

### NFR-07 — Seed Consistency
- **PASS:** Same method + same seed yields byte-identical output (or stable hash match).
- **FAIL:** Outputs differ.

### NFR-08 — Error Response Quality
- **PASS:** Errors follow stable JSON shape and do not leak stack traces/paths.
- **FAIL:** Internal diagnostics leak to clients.

### NFR-09 — Color Compliance and Non-Greyscale Requirement
- **PASS:** Color harmony modes are implemented and active; no greyscale-only output when color mode is configured.
- **PARTIAL:** Color appears for some but not all methods/harmonies.
- **FAIL:** Any required method defaults to greyscale in color mode.

---

## 3. Architecture Rules

### ARCH-01 — Service Separation
- **PASS:** Independent frontend/backend services in compose.
- **FAIL:** Single runtime process or code mixing.

### ARCH-02 — Layered Backend Boundaries
- **PASS:** `domain`, `application`, `infrastructure` exist with correct dependency direction.
- **PARTIAL:** One minor cross-layer violation.
- **FAIL:** Flat architecture or multiple boundary violations.

### ARCH-03 — Contract-First Shared Types
- **PASS:** Canonical `shared/types.ts` is used by both sides without drift.
- **PARTIAL:** Shared types exist but one side duplicates shape.
- **FAIL:** No canonical shared contract.

### ARCH-04 — Stateless Operation
- **PASS:** No DB/session/disk persistence for generated artifacts.
- **FAIL:** Any persistent state introduced.

### ARCH-05 — Frontend Served by Nginx in Prod
- **PASS:** Final frontend image uses Nginx.
- **FAIL:** Frontend served by Node in production image.

### ARCH-06 — Best-in-Class Stack Alignment
- **PASS:** Uses baseline stack choices: Express 5.x, React 19 + Vite, `@napi-rs/canvas`, schema validation (`ajv`), and flat ESLint config.
- **PARTIAL:** One baseline choice differs with documented rationale.
- **FAIL:** Multiple deviations without rationale.

---

## 4. Design and Code Quality Rules

### DESIGN-01 — Strict TypeScript
- **PASS:** `strict: true` in active tsconfig files; no suppressed type failures.
- **FAIL:** non-strict compilation or ignored type errors.

### DESIGN-02 — Boundary Type Safety
- **PASS:** No `any` at module boundaries; justified internal exceptions only.
- **PARTIAL:** 1-3 boundary violations.
- **FAIL:** Widespread boundary `any` usage.

### DESIGN-03 — Complexity Controls
- **PASS:** complexity <=10, depth <=3, function length <=50, params <=5.
- **PARTIAL:** up to 3 documented violations.
- **FAIL:** repeated or undocumented violations.

### DESIGN-04 — Behavior-Focused Tests
- **PASS:** Tests assert observable behavior (status/body/output), not private implementation calls.
- **FAIL:** tests are primarily implementation-coupled.

### DESIGN-05 — Validation Discoverability
- **PASS:** Input validation is isolated in predictably named validation files/modules.
- **FAIL:** Validation scattered and hard to locate quickly.

### DESIGN-06 — Bounded Self-Review Behavior
- **PASS:** Post-check edits are minimal and tied to failing checks/spec violations.
- **PARTIAL:** Moderate unrelated churn.
- **FAIL:** Broad rewrites after passing checks.

### DESIGN-07 — Comment Density and Readability
- **PASS:** Comment density >=10% and average LOC/file <=80.
- **PARTIAL:** One threshold missed.
- **FAIL:** Both thresholds missed.

### DESIGN-08 — Complexity Guard Enforcement
- **PASS:** ESLint includes `{ "complexity": ["error", 10] }` and no unresolved CCN >10 violations.
- **PARTIAL:** Rule present but unresolved exceptions exist with documentation.
- **FAIL:** Rule absent or ignored.

---

## 5. Compliance and Security Rules

### COMP-01 — No Secrets in Source
- **PASS:** No credentials outside `.env.example` placeholders.
- **FAIL:** Any secret literal found.

### COMP-02 — Env-Driven Config
- **PASS:** Ports/timeouts/limits/origins configurable via env with documented defaults.
- **PARTIAL:** 1-2 hardcoded values remain.
- **FAIL:** pervasive hardcoding.

### COMP-03 — Container Hardening
- **PASS:** non-root runtime, slim/alpine base, multi-stage builds.
- **PARTIAL:** one hardening element missing.
- **FAIL:** root runtime or un-hardened base defaults.

### COMP-04 — Dependency Safety
- **PASS:** No high/critical production vulnerabilities; direct dependencies not deprecated.
- **PARTIAL:** only documented moderate issues.
- **FAIL:** high/critical vulns, deprecated direct deps, or unresolved packages.

### COMP-05 — Supply Chain Integrity
- **PASS:** All dependencies resolve on npm and avoid typosquat/malicious patterns.
- **FAIL:** unresolved or suspicious dependency names.

### COMP-06 — Input Validation at Boundary
- **PASS:** Method enum, seed bounds/type, and body size checks all enforced before compute.
- **PARTIAL:** 2 of 3 checks enforced.
- **FAIL:** insufficient boundary validation.

### COMP-07 — Forbidden Patterns
- **FAIL if present:** `eval(`, `new Function(`, `dangerouslySetInnerHTML`, shell `exec(` in app paths.
- **PASS:** none present.

### COMP-08 — Licensing and Attribution
- **PASS:** MIT license file, MIT package metadata, dependency attribution doc.
- **PARTIAL:** attribution incomplete.
- **FAIL:** license/compliance artifacts missing.

### COMP-09 — CORS Safety
- **PASS:** production allowlist, no unconditional `*`.
- **FAIL:** wildcard in production path.

### COMP-10 — Timeout and Memory Guard Compliance
- **PASS:** Explicit 15s generation timeout and 128MB pre-allocation canvas memory guard are implemented.
- **PARTIAL:** one of two protections is present.
- **FAIL:** both protections missing.

---

## 6. Determinism-Specific Rules (Review-Derived)

### DET-01 — Exact Version Pinning
- **PASS:** direct dependencies are pinned exactly and lockfiles committed.
- **FAIL:** version ranges (`^`, `~`, `latest`) used for direct deps.

### DET-02 — Canonical Command Path
- **PASS:** README includes one clear clean-machine command sequence matching environment doc.
- **FAIL:** multiple competing setup paths or undocumented required steps.

### DET-03 — Question Budget Compliance
- **PASS:** Agent asked <=3 blocking questions and otherwise proceeded with spec defaults.
- **FAIL:** repeated or redundant questioning blocks progress.

### DET-04 — Large-Input Chunking Discipline
- **PASS:** When handling large files/lists, the output shows chunking and reconciliation evidence.
- **FAIL:** known truncation/missed-content symptoms without mitigation.

### DET-05 — Completion Evidence
- **PASS:** final report lists commands run and lint/build/test pass/fail outcomes.
- **FAIL:** completion claimed without execution evidence.

### DET-06 — API and Workflow Verification Completeness
- **PASS:** OpenAPI/Swagger spec present and E2E generate-and-display workflow tests exist.
- **PARTIAL:** one of two artifacts exists.
- **FAIL:** both artifacts missing.

---

## 7. Scoring Method
- `PASS = 1.0`
- `PARTIAL = 0.5`
- `FAIL = 0.0`
- `NOT EVALUATED` excluded from denominator.

Weighted scoring may reuse the existing rubric weights. If weights are unavailable, compute unweighted average across evaluated rules.

## 8. Hard Blockers
A FAIL on any blocker is an automatic disqualifier:
- COMP-01 (secrets in source)
- COMP-07 (forbidden execution/XSS patterns)
- NFR-01 (non-functional app)
- COMP-05 (supply chain integrity)

---

Version 2.0 - aligned to review findings and deterministic multi-agent execution goals.

# TypeScript Coding Standard (Deterministic Multi-Agent Edition)

## 1. Purpose
This standard is optimized for reproducibility across different agents/models. The same prompt and repo should converge to substantially similar code structure, behavior, and quality gates.

## 2. Authoritative Baseline
- Primary style baseline: Google TypeScript Style (`gts`).
- Lint engine: ESLint + `@typescript-eslint` (typed rules enabled where specified).
- Compiler mode: TypeScript `strict: true`.

## 3. Deterministic Constraints
- Use automated formatting only. No manual formatting choices.
- Use exact dependency versions (no `^`/`~` ranges).
- Keep folder and file naming stable; do not introduce alternate architecture patterns.
- Do not perform broad stylistic rewrites after checks pass.

## 3.1 Safe Array / Buffer Patterns
These patterns are **banned** in production source. They cause `RangeError: Maximum call stack size exceeded` on typed arrays and large collections (Node.js spread limit is ~65k–125k arguments depending on V8 version):

| ❌ Banned pattern | ✅ Required replacement |
|---|---|
| `Math.max(...typedArray)` | Explicit `for` loop accumulator |
| `Math.min(...typedArray)` | Explicit `for` loop accumulator |
| `Math.max(...array)` where array may exceed ~50k elements | Explicit `for` loop accumulator |
| `Math.min(...array)` where array may exceed ~50k elements | Explicit `for` loop accumulator |
| `fn(...largeArray)` for any function not designed for variadic spread | Use `.reduce()` or an explicit loop |

Rationale: pixel density buffers (e.g., 375×525 quadrant = 196,875 elements) reliably overflow the call stack when spread into `Math.max`/`Math.min`. This class of bug is silent during development when smaller arrays are used and fails stochastically in production.

ESLint cannot catch this automatically; it must be enforced via code review checklist and the fractal renderer test suite.

## 4. Required Lint Rules
- `@typescript-eslint/no-explicit-any`: `error`
- `@typescript-eslint/no-floating-promises`: `error`
- `@typescript-eslint/no-misused-promises`: `error`
- `@typescript-eslint/consistent-type-imports`: `error`
- `@typescript-eslint/no-unused-vars`: `error` with `argsIgnorePattern: "^_"`
- `complexity`: `['error', 10]`
- `max-depth`: `['error', 3]`
- `max-lines-per-function`: `['error', { max: 50, skipBlankLines: true, skipComments: true }]`
- `max-params`: `['error', 5]`

## 5. API Boundary Rules
- All exported route/controller/service functions must declare explicit input/output types.
- Runtime validation is mandatory at API boundaries.
- Shared request/response contracts must come from canonical shared types, not duplicated local interfaces.

## 6. Naming Rules
- Exported types/interfaces/enums: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_CASE`
- Enforce via `@typescript-eslint/naming-convention`.

## 7. Test-Context Relaxations
- In `test/**/*.ts`, allow practical relaxations for mock setup where needed:
  - `no-explicit-any`
  - `no-unsafe-assignment`
  - `no-floating-promises`
- Relaxations apply only in tests and must not leak to production source.

## 8. Logging Rules
- Backend production-path logging must be structured.
- Frontend should avoid `console.log` in production logic.
- Never log raw secrets, tokens, or full unfiltered user payloads.

## 8.1 Maintainability and Readability Targets
- Minimum comment density target in source code: `>=10%`.
- Average LOC per file target: `<=80`.
- Avoid technical debt markers (`TODO`, `FIXME`, `HACK`, `XXX`) in production paths.

## 9. Environment and Delivery Discipline
- This section is the source of truth for measurable quality gates and delivery evidence.
- Required gate order:
  1. `npm run lint`
  2. `npm run build`
  3. `npm test`
- Only fix failing gates or explicit spec violations after initial implementation.
- Keep remediation patch sets minimal and targeted.
- Test/source LOC ratio target: `>=15%`.
- Minimum test file count target: `>=4`.
- Include OpenAPI/Swagger API contract artifact and E2E validation coverage evidence in the delivery baseline.

## 9.1 Complexity Refactor Policy
- Any function with CCN `>=11` must be refactored unless it is an approved structural dispatcher.
- Fractal generator factory logic should use registry-map dispatch to keep CCN near 1.
- Validation branching should favor schema-driven validation (`ajv`) over deep manual conditionals.

## 10. Agent Behavior Guardrails
- Ask at most 3 blocking questions; otherwise proceed with documented defaults.
- For large files, process in chunks and reconcile before editing.
- Do not claim completion without reporting executed commands and pass/fail status for each required gate.

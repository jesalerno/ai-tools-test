# Architecture

This document describes how fcg-claude is put together. It follows the
baseline defined in `round2/ARCHITECTUREv2.md` and the rendering
constraints in `round2/FCG-SPECv3.md`.

## 1. Two-service topology

Two runtime services communicate only over HTTP. There is no shared
runtime process, no shared memory, no database:

```
┌────────────┐       /api/*       ┌───────────┐
│  frontend  │ ─────────────────► │  backend  │
│ (Nginx 3040) │                  │ (Node 8040)│
└────────────┘                    └───────────┘
```

In production, Nginx serves the compiled Vite static bundle and proxies
`/api/*` to the backend container. In development, Vite's dev server
plays Nginx's role via its built-in proxy.

## 2. Backend layering (DDD)

Dependencies flow inward only: `domain ← application ← infrastructure`.

```
backend/src/
├── domain/                        # pure math & rendering logic
│   ├── constants.ts               # card geometry, iteration caps
│   ├── rng.ts                     # mulberry32 PRNG
│   ├── color/
│   │   ├── harmony.ts             # 6 harmony modes
│   │   └── palette.ts             # hue → RGB LUT
│   ├── raster/
│   │   ├── coverage.ts            # non-background coverage metric
│   │   ├── density.ts             # log-density normalization
│   │   └── quadrant.ts            # quadrant → 4-way mirror
│   └── fractals/
│       ├── types.ts               # Renderer contract
│       ├── mandelbrot.ts ... phasePlot.ts
│       └── registry.ts            # registry-map dispatch
├── application/                   # orchestration, validation
│   ├── usecases/generateCard.ts
│   └── validation/requestSchemas.ts
├── infrastructure/                # framework adapters
│   ├── canvas/encoder.ts          # @napi-rs/canvas JPEG output
│   ├── config/{env,openapi}.ts
│   ├── http/{app,routes,handlers,middleware,errors,canvasGuards}.ts
│   └── logging/logger.ts
├── shared/types.ts                # mirrored contract (see §4)
└── server.ts                      # composition root
```

### Why registry-map dispatch

Spec §10 and CODING_STANDARDSv2 §9.1 explicitly forbid large switch
factories for fractal generator lookup. `domain/fractals/registry.ts`
resolves a `FractalMethod` enum value to a `Renderer` via a typed
`Record<FractalMethod, Renderer>`. CCN for method selection is 1; the
structural dispatch stays well under the 10-complexity cap.

## 3. Frontend structure

```
frontend/src/
├── api/client.ts              # fetch wrapper, typed errors
├── components/
│   ├── CardDisplay.tsx        # placeholder / loading / image
│   ├── ErrorBoundary.tsx      # catches render errors (spec §2.2)
│   └── MethodSelect.tsx       # Radix Select wrapper
├── shared/types.ts            # mirrored contract (see §4)
├── styles/globals.css         # Tailwind v4 import + tokens
├── __tests__/                 # Vitest unit tests
├── App.tsx                    # top-level screen + generate flow
└── main.tsx                   # React 19 root
```

The UI follows Material Design 3 interaction principles (clear hierarchy,
error prevention, recoverable state) but without an external MD3
component library — the controls are native HTML wrapped in Radix
primitives where accessibility demands it (the `Select` for the method
dropdown).

## 4. Shared contract pattern (Challenge 2)

FCG-SPECv3 §6.1 names the root `shared/types.ts` as the canonical API
contract and describes three consumers:

- **Root:** `shared/types.ts`.
- **Backend:** `backend/src/shared/types.ts` — a shape-identical copy
  (not a `../../../` re-export). The re-export pattern suggested in the
  spec fails under `"rootDir": "./src"` because TypeScript rejects files
  outside the root. Rather than contort `rootDir` — which makes the
  compiled `dist/` layout awkward and breaks `docker-compose` file
  staging — we keep two shape-identical files and lean on a test that
  asserts they stay in sync structurally.
- **Frontend:** `frontend/src/shared/types.ts` — also a copy. Vite does
  not permit imports from outside `src/`, so this is the only option
  here.

This is a minor, **documented** deviation from spec §6.1. The invariant
"single source of shape truth" is preserved by test coverage on both
sides (backend `validation.test.ts` + frontend `shared-contract.test.ts`).

## 5. Mirroring strategy (spec §3.2)

Exactly one quadrant is rendered at size **340 × 490 px**. That buffer
is reflected into the full **680 × 980 px** card-inner area:

- BR of card = quadrant as-is
- BL = horizontal mirror
- TR = vertical mirror
- TL = both mirrors (= rotate-180)

The center of the card coincides with quadrant pixel (0, 0), so the
4-way tiling has no visible seam by construction. Each renderer is free
to be completely asymmetric — the mirror imposes the D2 symmetry
required by spec §3.2 and makes the card visually coherent upside-down.

## 6. Coloring strategy (spec §5.3)

Every renderer class uses the method-specific mapping required by the
spec. Incorrect mapping was flagged as the primary cause of flat/dark
output, so the constraints are enforced:

- **Escape-time** (Mandelbrot, Julia, Burning Ship, Heightmap): log-mapped
  palette indexing (`t = log(iter+1) / log(MAX_ITER+1)`). Smooth
  iteration count for Mandelbrot / Julia to avoid banding rings.
- **Newton**: cyclic palette with per-basin stride — `(rootIdx *
  STRIDE + iter % STRIDE) mod CYCLE_LENGTH`.
- **Density** (IFS, Flame, Strange Attractor): log-density with γ ≤ 0.5.
  Find-max uses an explicit loop — never `Math.max(...buffer)` — because
  density buffers are 166,600+ elements and the spread form reliably
  triggers `RangeError: Maximum call stack size exceeded` at production
  sizes (spec §3.4, CODING_STANDARDSv2 §3.1).
- **Flame**: uniform-random transform selection per iteration (not
  round-robin), warmup of 40 iterations discarded before counting
  density hits.
- **Phase Plot**: brightness floor ≥ 0.5 baked into the color writer;
  formula matches spec §5.3 exactly.
- **Lyapunov**: stable regions rendered as a dark palette tint
  (10–20 % brightness) rather than literal black — §5.4 treats any
  significant literal-black region as a color-compliance violation.

The palette itself never yields `rgb(0, 0, 0)` — the `buildLut` keeps
lightness in `[0.30, 0.68]`. Tests in
`backend/test/unit/palette.test.ts` and `renderers.test.ts` assert this
invariant for every method.

## 7. Safety budgets (spec §7, §8.1)

| Budget | Value | Enforcement |
|---|---|---|
| Generation timeout | 15 s | `AbortController` + `setTimeout` (`handlers.ts`) |
| Canvas memory | 128 MB | `MAX_CANVAS_MEMORY_GUARD` called before canvas allocation |
| Body size | 2 MB (env `BODY_SIZE_LIMIT_MB`) | `express.json({ limit })` |
| Rate limit | 60 req/min/IP (env) | `express-rate-limit` |
| Iterations | 500–2000 | Ajv schema bounds |
| Coverage floor | ≥ 0.80 (best-effort) | up to 2 retries with widened zoom / more iterations |

## 8. Determinism

The same `seed` produces bit-identical output (mulberry32 PRNG →
stable palette → deterministic renderer). Route-level tests
(`route/api.test.ts`) and the generate use-case test assert this. The
spec's multi-seed test (at least 5 distinct seeds yield measurably
different palettes) is covered in `renderers.test.ts`.

## 9. Non-goals and deferred choices

- No persistence, no authentication, no admin surface.
- No client-side fractal rendering; generation is always server-side so
  we can enforce the memory/time budgets.
- Multiple zoom / center / symbolic-sequence tuning knobs exist inside
  each renderer but are not exposed to the UI in this revision —
  spec §2.2 only requires method + Go + Surprise Me.
- Observability is stdout JSON with a correlation ID per request. A
  metrics endpoint scaffolding (ARCHITECTUREv2 §6) is noted as a known
  limitation; see the Final Report section of TASKS.md.

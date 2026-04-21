# Troubleshooting

Most failures happen at setup or at first `docker compose up --build`.
This page catalogs the ones we've actually seen.

## Quick diagnostic: run the preflight

```bash
node -v        # must be v20.x
npm -v         # must be 10.x
docker --version
docker compose version
```

If any of these is missing or wrong, fix that first. Don't proceed with
partial setup.

---

## `EADDRINUSE` on port 3040 or 8040

Symptom: `docker compose up --build` fails with `Error: listen EADDRINUSE`
or `port is already allocated`.

Cause: another process (probably the sibling `fcg-copilot` project) has
taken the port.

Fix:

```bash
docker ps --format '{{.Names}}\t{{.Ports}}'
# Stop the conflicting stack:
docker stop fcg-backend fcg-frontend     # fcg-copilot containers
# Or, for our stack:
docker stop fcg-claude-backend fcg-claude-frontend
```

If you need both stacks up simultaneously, change the `ports:` mapping
in `docker-compose.yml` to something free (e.g. `3041:3040`,
`8041:8040`).

---

## `npm install` fails with `ERESOLVE`

Symptom: during `npm ci` or `npm install`, dependency tree errors about
peer-dep mismatches.

Cause: Node or npm is the wrong version, or someone added `^`/`~` to
`package.json` (we pin exact versions).

Fix:

1. `node -v` — must be 20.x. The `engines.node` field blocks installs
   on the wrong major.
2. `npm -v` — must be 10.x.
3. Do **not** run `npm install --legacy-peer-deps`. Spec §11 forbids
   this as a workaround; it is a symptom-hider that will bite later.
4. Check you aren't mixing `pnpm-lock.yaml` / `yarn.lock` with the
   checked-in `package-lock.json`. Delete the stray lockfile.

---

## `@napi-rs/canvas` failed to load / no prebuilt binary

Symptom: backend crashes at startup with a native-module error, or
`npm ci` reports no prebuilt binary for your platform.

`@napi-rs/canvas` ships **prebuilt binaries** for:

- macOS x64
- macOS arm64 (Apple Silicon)
- Linux x64 (glibc and musl)
- Linux arm64
- Windows x64

If your platform isn't on that list (unusual — e.g. FreeBSD), you will
need to either:

- Run inside Docker (recommended — our backend image uses Debian slim
  + Node 20, which has a prebuilt binary), or
- Contribute a build for your platform upstream to `@napi-rs/canvas`.

Our Dockerfile does **not** apt-get install `cairo` / `pango` / `libpng`
— those are for `node-canvas`, not `@napi-rs/canvas`. Spec §18
Challenge 1 explicitly notes the two have different prerequisites.

---

## Tests fail with `RangeError: Maximum call stack size exceeded`

Symptom: a renderer test fails at production canvas sizes (340 × 490 +).

Cause: someone used `Math.max(...buffer)` / `Math.min(...buffer)` on a
large typed array. Spread into variadic functions fails stochastically
above ~65k–125k arguments (V8 limit, varies by version).

Fix: replace with an explicit `for` loop. See
`backend/src/domain/raster/density.ts::findMaxDensity` for the canonical
pattern. Spec §3.4 and CODING_STANDARDSv2 §3.1 document this.

---

## NOT_FOUND envelope from the backend

Symptom: hitting the backend returns `{"error":"NOT_FOUND", ...}`.

Common causes and fixes:

- **You pointed a browser at `http://localhost:8040/`**: the backend
  now redirects `/` and `/api` to `/api/docs` (Swagger UI). If you're
  on an older build, that redirect isn't there — the UI is at
  `http://localhost:3040/`, not the backend root.
- **Wrong path**: the 404 envelope now includes the requested method
  and path in `details`, e.g. `{"method":"GET","path":"/api/generate"}`.
  If your path has a typo (e.g. `/api/generate` vs.
  `/api/cards/generate`), you'll see it there.
- **Only these paths are live**: `GET /api/health`,
  `POST /api/cards/generate`, `GET /api/docs`, `GET /api/openapi.json`.

## Coverage warning: `coverage_below_threshold`

Symptom: the response `metadata.warnings` includes
`coverage_below_threshold: 0.4X (target 0.8)`.

This is **not** a failure. Spec §3.3 allows best-effort output after the
retry budget is exhausted. Some fractal classes — especially Flame with
unlucky random affine coefficients, and IFS (Barnsley Fern is legitimately
~25 % coverage) — will hit this.

If you need denser output on a specific method, try another seed:

```bash
curl -X POST http://localhost:8040/api/cards/generate \
  -H 'Content-Type: application/json' \
  -d '{"method":"FLAME","seed":42}'
```

---

## Lint fails with `Parsing error: parserOptions.project`

Symptom: ESLint errors on files that aren't part of any `tsconfig`.

Cause: config files (`eslint.config.js`, `jest.config.cjs`,
`vite.config.ts`) aren't in the TypeScript project graph.

Fix: they're already excluded in our `eslint.config.js` ignores list;
if you add a new root-level JS/TS file, add it to that list too. Do
**not** add those files to `tsconfig.json` — they would change
`rootDir` semantics.

---

## Frontend Tailwind build error: `Cannot convert undefined or null to object`

Symptom: `@tailwindcss/vite:generate:build` errors during `vite build`.

Cause: mismatched `tailwindcss` and `@tailwindcss/vite` versions. The
plugin is very strict about aligned minors.

Fix: both `tailwindcss` and `@tailwindcss/vite` in
`frontend/package.json` must be the same version (we pin `4.1.14`).
After `npm install`, verify with:

```bash
npm ls tailwindcss
```

Both entries should show the same version.

---

## Vitest picks up Playwright specs and fails

Symptom: running `npm test` in `frontend/` fails with:
`Playwright Test did not expect test.describe() to be called here.`

Cause: Vitest's default discovery walks everything; the Playwright
specs in `e2e/` use a Playwright-only `test()` function.

Fix: `frontend/vitest.config.ts` already restricts discovery to
`src/**/*.{test,spec}.{ts,tsx}` and explicitly excludes `e2e/`. Don't
move Playwright specs into `src/`.

---

## Cross-Origin (CORS) errors in the browser

Symptom: browser console: `Access to fetch at 'http://localhost:8040/api/…'
from origin 'http://localhost:3040' has been blocked by CORS policy`.

Fix: the backend's `CORS_ORIGIN` env var must include the frontend
origin. Docker-compose sets it to `http://localhost:3040` by default.
If you're running the frontend from another origin (another port, a
tunnel, an IDE preview), add it to the comma-separated list:

```bash
CORS_ORIGIN=http://localhost:3040,http://localhost:3041 docker compose up
```

There is no wildcard CORS anywhere, including in dev (spec §8).

---

## The attractor appears as four small blobs instead of one centered pattern

Symptom: Strange Attractor (and historically Flame) renders as four
small copies, one in the middle of each of the card's four visual
quadrants, rather than one card-spanning pattern.

Cause: the renderer is plotting centered on `(w/2, h/2)` of the quadrant
instead of on `(0, 0)`. The 4-way mirror treats quadrant `(0, 0)` — the
inner corner closest to the card center — as the card center. Plotting
at the geometric middle of the quadrant creates four copies, one per
card-quadrant, after mirroring.

Fix (already applied in `backend/src/domain/fractals/strangeAttractor.ts`
and `backend/src/domain/fractals/flame.ts`): anchor at `(0, 0)` and fold
`|x|`, `|y|` into the positive-axis quadrant; tighten `BOUND` to the
actual attractor extent so pixels aren't heavily clipped. The mirror
then reconstructs the full attractor around the card center with D2
symmetry.

If you're adding a new density-based renderer, follow the same pattern
and confirm visually that the "interesting part" lands at the card
center after mirroring.

## The card looks mostly black

Symptom: the rendered JPEG is mostly dark or near-solid black.

Cause: a renderer isn't using its spec-required color mapping. Spec
§5.3 calls this the primary cause of flat output. Specific cases:

- Linear escape-time mapping → use log mapping.
- Linear density mapping → use log-density with γ ≤ 0.5.
- Flame round-robin transform → use uniform-random selection with
  ≥ 20-iteration warmup.
- Phase plot without brightness floor → enforce ≥ 0.5 base brightness.
- Lyapunov stable regions as literal black → tint from palette at
  10–20 % brightness instead.

The renderer test suite (`backend/test/unit/renderers.test.ts`) asserts
every method has < 5 % literal-black pixels; a failure there is the
first thing to check.

---

## Still stuck?

- Include the `x-correlation-id` header from your failing request.
- Include Node, npm, Docker, and Docker Compose versions.
- Attach `docker compose logs backend` and `docker compose logs frontend`.
- Open an issue on the parent `ai-tools-test` repository.

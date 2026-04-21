# API Reference

Canonical base URL: `http://localhost:8040/api/` (dev) or
`http://localhost:3040/api/` (proxied through Nginx in Docker).

The OpenAPI 3.0.3 spec is served at
[`/api/openapi.json`](http://localhost:8040/api/openapi.json) and
rendered as Swagger UI at
[`/api/docs`](http://localhost:8040/api/docs).

## Root / unknown routes

- `GET /` → `302 Found`, `Location: /api/docs`. Convenience for anyone
  pointing a browser at the backend root.
- `GET /api` → `302 Found`, `Location: /api/docs`.
- Any other unknown path returns the standard 404 envelope below, with
  the requested method and path echoed in `details` for quick
  debugging:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Route not found: GET /api/bogus",
    "details": { "method": "GET", "path": "/api/bogus" }
  }
  ```

## Error envelope (spec §6.3)

Every non-2xx response uses the same shape:

```json
{
  "error": "<stable-code>",
  "message": "<user-safe text>",
  "details": { /* optional, structured */ }
}
```

Stable error codes:

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Ajv validation |
| `NOT_FOUND` | 404 | Unknown route |
| `CANVAS_MEMORY_EXCEEDED` | 413 | Requested canvas size > 128 MB |
| `RATE_LIMITED` | 429 | 60 req/min/IP exceeded |
| `GENERATION_TIMEOUT` | 504 | Generation took longer than 15 s |
| `INTERNAL_ERROR` | 500 | Unhandled exception (no stack trace leaked) |

## `GET /api/health`

Readiness probe for container orchestration.

```bash
curl -s http://localhost:8040/api/health
```

```json
{
  "status": "ok",
  "uptimeSeconds": 42,
  "version": "1.0.0"
}
```

Response headers include `Cache-Control: no-cache, no-store,
must-revalidate`.

## `POST /api/cards/generate`

Generate a fractal card. All fields are optional.

Request:

```json
{
  "method": "MANDELBROT",
  "seed": 12345,
  "iterations": 1200,
  "zoom": 1.6
}
```

- `method` — one of the 11 spec methods:
  `MANDELBROT`, `JULIA`, `BURNING_SHIP`, `NEWTON`, `LYAPUNOV`, `IFS`,
  `L_SYSTEM`, `STRANGE_ATTRACTOR`, `HEIGHTMAP`, `FLAME`, `PHASE_PLOT`.
  Omit the field to pick randomly (the "Surprise Me" flow).
- `seed` — integer `[0, 2_147_483_647]`. Omit for a random seed.
  Same seed + same method → deterministic output.
- `iterations` — integer `[500, 2000]`. Default `1200`.
- `zoom` — number `[0.5, 4.0]`. Default `1.6`.

Response:

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQAB...",
  "method": "MANDELBROT",
  "seed": 12345,
  "iterations": 1200,
  "zoom": 1.6,
  "harmony": "TRIAD",
  "baseHue": 142.87,
  "metadata": {
    "durationMs": 238,
    "retries": 0,
    "coverage": 0.9812,
    "warnings": [],
    "correlationId": "f3d0c2b1-4e1a-42a6-9c7f-2f0e8d0c0a2c"
  }
}
```

Field notes:

- `image` is a `data:image/jpeg;base64,…` URI. The decoded size is
  750 × 1050 px — a 2.5″ × 3.5″ card at 300 DPI — with a 3 mm white
  border and 24 px rounded clip on the inner art (spec §3.1).
- `harmony` is the chosen color-theory mode (`PRIMARY`, `SQUARE`,
  `COMPLEMENTARY`, `TRIAD`, `ANALOGOUS`, or `TETRADIC`).
- `baseHue` is the randomized base hue (0–360°).
- `metadata.coverage` is the non-background pixel fraction in the
  rendered quadrant (target ≥ 0.80, see spec §3.3).
- `metadata.retries` is how many adaptive re-renders happened before
  hitting the coverage target or the retry cap.
- `metadata.warnings` is an array of stable warning strings; a common
  one is `coverage_below_threshold: 0.412 (target 0.8)` for
  aesthetically sparse outputs that couldn't recover.

The frontend renders `metadata.coverage` alongside the other card
statistics with a pass/warn badge keyed off the spec §3.3 threshold
(80 %). Green `✓` when met, amber `⚠` when below. The badge carries
`data-meets-threshold="true|false"` for automated tests.

## Example: cURL

```bash
curl -s -X POST http://localhost:8040/api/cards/generate \
  -H 'Content-Type: application/json' \
  -d '{"method":"NEWTON","seed":777}' \
  | jq '.method, .seed, .harmony, .metadata.durationMs'
```

## Example: Surprise Me flow

The frontend submits an empty JSON body and uses the `method` in the
response to sync the dropdown selection:

```bash
curl -s -X POST http://localhost:8040/api/cards/generate \
  -H 'Content-Type: application/json' \
  -d '{}' \
  | jq '.method'
```

## Cross-cutting headers

- Every response carries an `x-correlation-id` header (either the one
  you sent or a freshly minted UUID). Include it when reporting issues.
- Generation responses include `Cache-Control: no-cache, no-store,
  must-revalidate`.
- Nginx (in Docker) adds Content-Security-Policy, X-Frame-Options,
  X-Content-Type-Options, and Referrer-Policy on top.

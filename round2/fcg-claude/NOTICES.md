# Third-Party Notices

This project is distributed under the [MIT License](LICENSE). It links to
the following third-party packages. Each is MIT, ISC, Apache-2.0, or
BSD-style — all permissive and MIT-compatible. There are no GPL- or
AGPL-licensed direct dependencies.

## Backend direct dependencies (`backend/package.json`)

| Package | Version | License | Purpose |
|---|---|---|---|
| `@napi-rs/canvas` | 0.1.65 | MIT | Prebuilt Skia-backed Canvas API for Node. Used to encode the final card JPEG. |
| `ajv` | 8.18.0 | MIT | JSON Schema validator. Used at the HTTP boundary to validate request bodies. |
| `ajv-formats` | 3.0.1 | MIT | Format keywords for Ajv. Paired with the validator. |
| `complex.js` | 2.4.2 | MIT | Complex number arithmetic (reserved for extensions to phase-plot / Julia tuning). |
| `cors` | 2.8.5 | MIT | Express CORS middleware. Explicit origin allowlist. |
| `dotenv` | 16.4.7 | BSD-2-Clause | `.env` loading at boot. |
| `express` | 5.1.0 | MIT | HTTP framework. |
| `express-rate-limit` | 7.5.0 | MIT | Sliding-window rate limiter. |
| `swagger-ui-express` | 5.0.1 | MIT | Renders the OpenAPI spec at `/api/docs`. |
| `uuid` | 11.0.5 | MIT | Correlation ID generation. |

Dev-only dependencies (TypeScript, ESLint, Jest, ts-jest, Prettier, type
packages, supertest, ts-node) are all MIT or ISC and do not ship in the
production runtime image.

## Frontend direct dependencies (`frontend/package.json`)

| Package | Version | License | Purpose |
|---|---|---|---|
| `react` | 19.0.0 | MIT | UI library. |
| `react-dom` | 19.0.0 | MIT | React DOM renderer. |
| `@radix-ui/react-select` | 2.1.4 | MIT | Accessible select primitive used for the fractal method dropdown. |
| `@radix-ui/react-slot` | 1.1.1 | MIT | Slot primitive used by Radix internals. |

Dev-only dependencies (Vite, Vitest, Playwright, @tailwindcss/vite,
tailwindcss, Testing Library, TypeScript, ESLint, typescript-eslint,
jsdom, @vitejs/plugin-react, @vitest/coverage-v8, prettier) are all MIT
or Apache-2.0 and do not ship in the production runtime image (only the
compiled static assets do).

## License verification

Direct dependencies were verified against each package's
`package.json` `license` field and the corresponding entry in the GitHub
Advisory Database for known vulnerabilities at the time of writing. Run

```bash
npm ls
npm audit --production
```

in each workspace to reproduce.

No direct dependency is deprecated. `supertest@7.1.4` is the current
stable release (spec §11.3 flagged the older 6.3.3 as deprecated; we
are on the fixed line).

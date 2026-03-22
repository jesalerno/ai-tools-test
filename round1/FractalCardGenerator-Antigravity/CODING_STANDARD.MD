# TypeScript Coding Standard (Web App + REST/JSON API)

## 1. Written References
- Primary: ts.dev TypeScript Style Guide.
- Secondary: Google TypeScript Style Guide.

## 2. Tooling (Authoritative)
- Formatting: Automatic via `gts fix`. All formatting debates are resolved by automation.
- Linting: ESLint + typescript-eslint recommended config layered on top of `gts`.

## 3. REST API Boundary Rules
- All exported route/controller/service functions must declare explicit input and output types.
- JSON parsing and validation layers must use typed interfaces or schemas.
- API-layer code uses stricter type-aware lint rules.

## 4. Naming Standards (Selective)
- Public/exported types: PascalCase
- Route handlers & functions: camelCase
- Constants: UPPER_CASE
- Enforced in lint using @typescript-eslint/naming-convention.

## 5. General Guidelines
- Let TypeScript infer types internally when safe.
- Prefer explicitness only at module boundaries.
- Formatting is not manually reviewed; rely on automation.
``
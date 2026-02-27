# ts-express-rest-skeleton

Opinionated TypeScript + Express (REST/JSON) project skeleton.

## Standards
- Formatting is automated via **gts** (Google TypeScript Style) and is authoritative.
- ESLint uses **typescript-eslint** recommended rules globally, and enables type-checked rules for API boundary code.

## Quick start
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev` - run the server with file-watching
- `npm run build` - compile to `dist/`
- `npm run start` - run compiled server
- `npm run lint` / `npm run lint:fix`
- `npm run gts:lint` / `npm run gts:fix`

## API layout
- `src/routes/` – Express routers
- `src/controllers/` – request orchestration
- `src/services/` – business logic
- `src/middleware/` – cross-cutting concerns (errors, auth, logging)

## Notes
This skeleton intentionally does **not** include request validation libraries. If you add runtime validation later (e.g., schema validation), revisit boundary rules around `any`.

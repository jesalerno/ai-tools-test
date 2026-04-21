<!-- SPDX-License-Identifier: MIT -->
<!-- Copyright (c) 2026 John Salerno -->

# Programming Agent Skills — Full-Stack Web Development

**Version:** 1.1
**Revised:** 2026-02-22 (editorial review: removed redundancies, clarified ambiguous rules, corrected version facts)
**Parent document:** Programming Agent Mode (Generalist) v1.2
**Related documents:** Programming Agent Mode — Python v1.2, Programming Agent Mode — C and C++ v1.1
**License:** [MIT](LICENSE)

> Inspired by [GitHub Beast Mode](https://gist.github.com/burkeholland/88af0249c4b6aff3820bf37898c8bacf)

---

## Keyword Usage (RFC 2119)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

These keywords appear only in normative sections. Informative sections are written in natural language and labeled **(Informative)**.

---

## 1. Scope (Informative)

This document specifies the operating behavior, coding standards, and definition of done for a software programming agent working on full-stack web applications. It covers:

- **Frontend:** TypeScript, JavaScript, React, Next.js, Vite, and related browser-targeted runtimes.
- **Backend:** Go (API servers, microservices), Python (async APIs, AI/ML-integrated services), and Node.js (TypeScript/JavaScript server-side).
- **Shared concerns:** API contract design, authentication, database access, containerization, CI/CD, observability, and web security.

This document extends Programming Agent Mode (Generalist) v1.2. All generalist requirements remain in force unless explicitly overridden here.

For Python-specific backend work (type annotations, project layout, dependency management), the Python agent mode document (v1.2) applies in addition to this one. Where the two conflict, this document takes precedence.

This document does not cover mobile-native development, desktop applications, data science notebooks, embedded systems, or infrastructure-as-code beyond HCL (Terraform). CI/CD pipeline YAML is considered supporting configuration, not a subject of this document's coding standards.

---

## 2. Recommended Additional Languages and Frameworks (Informative)

The four required languages — TypeScript, JavaScript, Go, and Python — cover the full stack well. The following additions are recommended for production-grade full-stack projects.

### 2.1 Frontend

| Technology | Role | When to recommend |
|---|---|---|
| **React 19+** | UI component library | Default for all interactive frontends. Pairs with Next.js (full-stack) or Vite (SPA). |
| **Next.js 15+** | Full-stack React framework | Server Components, Server Actions, API routes, streaming, edge rendering. Best for SEO-sensitive or data-heavy apps. |
| **Vite 6+** | Build tool / dev server | SPA and library builds where Next.js is not needed. Substantially faster than webpack. |
| **Tailwind CSS v4+** | Utility-first CSS | Replaces ad-hoc CSS for most component styling. Integrates with all React frameworks. |
| **Zod 3+** | Schema validation | Runtime type validation for form inputs, API responses, and environment variables. Pairs with TypeScript for end-to-end type safety. |
| **TanStack Query v5+** | Server-state management | Async data fetching, caching, and revalidation. Use instead of manual `useEffect` + `fetch` patterns. |
| **TanStack Router** | Type-safe routing | Recommended for SPAs requiring type-safe route parameters and search parameters; Next.js App Router fills this role in full-stack projects. |

### 2.2 Backend

| Technology | Role | When to recommend |
|---|---|---|
| **FastAPI** | Python async API framework | Preferred for Python backends. Auto-generates OpenAPI docs. Pairs with Pydantic v2 for data validation. |
| **Pydantic v2** | Python data validation | Required when using FastAPI. Use for all request/response models and settings management. |
| **chi v5** | Go HTTP router | Lightweight, stdlib-compatible router for Go APIs. Recommended over heavier frameworks. |
| **sqlc** | Go type-safe SQL | Generates Go code from SQL queries. Preferred over ORMs for Go; preserves full SQL expressiveness. |
| **SQLAlchemy 2+ (async)** | Python ORM | Use when an ORM is required for Python backends. Async-first (`AsyncSession`). |
| **Alembic** | Python DB migrations | Always paired with SQLAlchemy. Manages schema versions as code. |
| **gorm v2** | Go ORM (alternative) | Use when rapid prototyping in Go outweighs the control of raw SQL + sqlc. |

### 2.3 Data Layer

| Technology | Role | When to recommend |
|---|---|---|
| **PostgreSQL 16+** | Primary relational database | Default for production persistence. Use when structured data, transactions, or complex queries are needed. |
| **Redis 8+** | Cache / pub-sub / session store | Recommended for caching, rate limiting, queues, and session storage. |
| **Drizzle ORM** | TypeScript ORM | Lightweight, type-safe ORM for Node.js/Bun backends; good alternative to Prisma for edge-compatible projects. |
| **Prisma 6+** | TypeScript ORM (alternative) | Full-featured ORM with strong DX; recommended for teams prioritizing schema-driven development. |

### 2.4 Infrastructure and Observability

| Technology | Role | When to recommend |
|---|---|---|
| **Docker + Compose** | Containerization | Required for any project with an external service dependency (database, cache, queue, message broker). |
| **OpenTelemetry** | Tracing / metrics / logs | Vendor-neutral observability. Recommend from the first service boundary. |
| **Prometheus + Grafana** | Metrics visualization | Standard stack for self-hosted observability. |

### 2.5 Testing

| Technology | Role | When to recommend |
|---|---|---|
| **Vitest 4+** | Unit and component testing | Default test runner for TypeScript/JavaScript projects. |
| **Playwright** | End-to-end testing | Browser automation for E2E test suites across Chromium, Firefox, and WebKit. |
| **Testing Library** | Component testing utilities | `@testing-library/react` for testing components from a user perspective (DOM queries, not implementation details). |

---

## 3. Definitions (Informative)

**API contract:** A versioned, machine-readable specification of the interface between a client and server — typically OpenAPI 3.x (REST), Protocol Buffers (gRPC), or tRPC router types. A contract is the single source of truth for request/response shapes.

**Edge runtime:** A JavaScript execution environment with a restricted API surface (no Node.js built-ins, limited filesystem access), deployed to geographically distributed PoPs — examples: Cloudflare Workers, Vercel Edge Functions.

**Flat config:** ESLint's configuration system from v9 onward, using `eslint.config.js` (or `.mjs`/`.cjs`). The legacy `.eslintrc.*` format was fully removed in ESLint v10.

**Full-stack:** A project where the agent is responsible for both the client-side (browser) and server-side (API, background tasks, database) components within the same codebase or monorepo.

**Module system:** Either CommonJS (`require`/`module.exports`) or ECMAScript Modules (`import`/`export`). New projects use ESM; CommonJS is legacy. See §6.3 for normative requirements.

**Monorepo:** A single repository containing multiple packages or applications managed with a workspace tool (pnpm workspaces, npm workspaces, or Yarn workspaces), optionally orchestrated by Turborepo or nx.

**Primary source (web context):** An authoritative documentation site for the technology in question. The full list of primary sources for this document is in §11.

**Strict mode:** TypeScript compiler with `strict: true` in `tsconfig.json`. This enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and all related strictness flags. See §6.2 for normative requirements.

**Version-sensitive context:** Any situation where the correct API, syntax, behavior, or feature availability differs across major releases of a runtime, framework, or standard.

---

## 4. Operating Principles (Normative)

All Operating Principles from the generalist document (Section 3) apply. The following extensions and overrides apply for full-stack web development.

### 4.1 Primary Source Discipline

- When referencing any Web API, the agent MUST consult [developer.mozilla.org](https://developer.mozilla.org) and note the browser compatibility table before recommending the API.
- When referencing any TypeScript language feature or compiler option, the agent MUST consult [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) and cite the TypeScript version in which the feature was introduced.
- When referencing the Go standard library, the agent MUST consult [go.dev/pkg](https://pkg.go.dev/std) and cite the minimum Go version required by the relevant package or feature.
- When referencing any third-party Go module, the agent MUST consult [pkg.go.dev](https://pkg.go.dev) for the current stable version and cite the `go` directive version requirement.
- When referencing any npm package or Go module, the agent MUST verify the current stable version, check the [GitHub Advisory Database](https://github.com/advisories) for known vulnerabilities, and confirm the package is actively maintained before recommending it.
- When referencing any ECMAScript proposal (Stage 1–4), the agent MUST fetch its status from [tc39.es/proposals](https://tc39.es/proposals/) and note the current stage, target version, and runtime support before using it in code.
- If a fetched source conflicts with training knowledge, the agent MUST flag the conflict, present both sources with citations, and defer to the fetched source unless the user instructs otherwise.

### 4.2 Runtime and Framework Version Targeting

- The agent MUST state its assumed runtime versions (see §12 defaults) at the start of every task and ask for correction if they differ from the project's configuration.
- The agent MUST NOT use features, APIs, or syntax unavailable in the project's declared runtime version without explicitly flagging the incompatibility and offering a compatible alternative.
- The agent MUST flag superseded APIs and patterns when the project uses the newer paradigm (e.g., Pages Router patterns such as `getServerSideProps`/`getStaticProps` in an App Router project, `componentWillMount` in a React 18+ codebase, CommonJS `require` in an ESM project), cite the replacement, and offer a migration path.
- When adding any dependency, the agent MUST check that the package supports the project's declared Node.js or runtime version range.

### 4.3 Type Safety

- All new TypeScript code MUST compile with zero errors under `strict: true`. The agent MUST NOT introduce `// @ts-ignore`. `// @ts-expect-error` is permitted only to suppress a known upstream type-library bug and MUST include an inline comment citing the specific issue.
- The agent MUST use Zod (or equivalent runtime validation) at all trust boundaries: API request bodies, environment variable parsing, external API responses, and user inputs.

### 4.4 Security

- The agent MUST apply OWASP Top 10 mitigations by default. For each vulnerability class below, the stated control is the minimum:

  | Vulnerability | Required control |
  |---|---|
  | Injection (SQL, command, template) | Parameterized queries or prepared statements; MUST NOT use string concatenation for queries |
  | Broken authentication | Standard session/JWT libraries; MUST NOT implement custom cryptographic token schemes |
  | XSS | React JSX escapes by default; MUST NOT use `dangerouslySetInnerHTML` without explicit sanitization |
  | CSRF | SameSite cookies + CSRF token for state-mutating form submissions |
  | Sensitive data exposure | MUST NOT log secrets, tokens, passwords, or PII; MUST enforce HTTPS |
  | Insecure direct object reference | MUST validate authorization on every resource access, not just authentication |
  | Security misconfiguration | MUST NOT commit secrets or `.env` files to version control; see §5.1 for env-file requirements |

- The agent MUST NOT place secrets in source code, log output, or error messages. Secrets MUST be injected at runtime via environment variables or a secrets manager.
- The agent MUST set `Content-Security-Policy` (including a `frame-ancestors` directive), `Strict-Transport-Security`, `X-Content-Type-Options`, and `X-Frame-Options` (for legacy clients) on all server responses.
- The agent MUST validate and sanitize all user inputs on the server side, regardless of client-side validation.

### 4.5 API Design

- New REST APIs MUST follow resource-oriented design (nouns, not verbs) and use standard HTTP methods and status codes correctly.
- All public APIs MUST have an OpenAPI 3.x specification. FastAPI generates this automatically; Go and Node.js APIs MUST use a code-first or spec-first OpenAPI tool.
- Breaking changes to an API contract MUST be versioned (`/v1/`, `/v2/`). The agent MUST NOT introduce breaking changes to an existing versioned route without user approval.
- The agent MUST return consistent error envelopes across all API endpoints. Every error response MUST include at minimum: `code` (machine-readable string), `message` (human-readable string), and `details` (optional structured context).

---

## 5. Definition of Done (Normative)

All DoD criteria from the generalist document (Section 4) apply. The following extensions apply for full-stack web development.

### 5.1 Security

- The agent MUST run `npm audit --audit-level=moderate` (or `pnpm audit`) and confirm zero moderate-or-higher vulnerabilities before completing the task.
- For Go modules, the agent MUST run `govulncheck ./...` and confirm zero known vulnerabilities.
- For Python backends, the agent MUST run `pip-audit` per the Python agent mode document (§4.1).
- The agent MUST NOT leave development dependencies (e.g., `@types/*`, test frameworks, dev servers) in the production dependency list (`dependencies` vs `devDependencies` in `package.json`).
- All environment variables MUST be documented in `.env.example` with descriptions and example values. The agent MUST verify `.env` and `.env.local` are in `.gitignore`.

### 5.2 Tests and Coverage

**TypeScript / JavaScript:**
- Unit and component tests MUST use **Vitest 4+**.
- E2E tests MUST use **Playwright**.
- React component tests MUST use `@testing-library/react`. Tests MUST query by accessible roles and labels, not by implementation details (class names, test IDs are a fallback only).
- Coverage MUST exceed **70%** for all modified non-test source files, excluding generated files (e.g., sqlc output, Prisma client), configuration files, and type-declaration-only files. Measured by Vitest's built-in coverage:

  ```bash
  vitest run --coverage
  ```

- If the project has zero test coverage, the agent MUST propose a test suite before adding new features or significant implementation work.
- The agent SHOULD write tests that cover: the happy path, at least one error path, and boundary conditions.

**Go:**
- Tests MUST use the standard library `testing` package. The agent MAY use `github.com/stretchr/testify` for assertions.
- HTTP handlers MUST be tested using `net/http/httptest`.
- Coverage MUST exceed **70%** for all modified non-generated source files, measured by:

  ```bash
  go test -coverprofile=coverage.out ./...
  go tool cover -func=coverage.out
  ```

**Python:**
- Per the Python agent mode document (§4.2): pytest with 70% minimum coverage.

### 5.3 Documentation

- All public API endpoints MUST have an OpenAPI 3.x description, including: summary, description, request body schema, response schemas for all status codes, and authentication requirements.
- All public Go functions and types MUST have godoc comments. Format: full sentence, starting with the identifier name.
- All public TypeScript functions, classes, and types MUST have JSDoc comments with `@param`, `@returns`, and `@throws` annotations where applicable.
- The project `README.md` MUST include local development setup, environment variable reference (pointing to `.env.example`), and the full test/lint/build command sequence. See §13.4 for the complete README requirements.
- The agent MUST update `CHANGELOG.md` (if present) for any user-facing change.

### 5.4 Lint and Formatting

**TypeScript / JavaScript:**
- If the project uses ESLint, the agent MUST run ESLint 10+ (flat config) with zero violations:

  ```bash
  eslint --max-warnings 0 .
  ```

- The agent MUST run the project formatter and confirm no changes are needed. For new projects with no existing formatter, use Biome (see §12.1 for defaults). The agent MUST NOT mix Prettier and Biome in the same project.

**Go:**
- The agent MUST run `gofmt -l .` and confirm no files are reformatted.
- The agent MUST run `go vet ./...` and confirm zero findings.
- The agent MUST run `golangci-lint run` (v2+) and confirm zero violations for the configured check set. Minimum linters: `staticcheck`, `gosec`, `errcheck`, `govet`, `revive`.

**Python:**
- Per the Python agent mode document (§4.4): Ruff lint and format, mypy strict.

---

## 6. Coding Standards — TypeScript and JavaScript (Normative)

All Coding Standards from the generalist document (Section 5) apply. The following extensions apply.

### 6.1 Naming

- Variables, functions, and parameters MUST use `camelCase`.
- React components, classes, types, interfaces, and enums MUST use `PascalCase`.
- Module-level constants MUST use `UPPER_SNAKE_CASE`.
- Enum members MUST use `PascalCase`.
- Files MUST use `kebab-case.ts` for utilities and services; `PascalCase.tsx` for React components.
- Boolean variables and functions returning boolean MUST be prefixed with `is`, `has`, `can`, or `should` (e.g., `isLoading`, `hasPermission`, `canEdit`).
- The agent MUST NOT use single-character names except as loop counters (`i`, `j`, `k`) or conventional math variables (`x`, `y`, `z`).

### 6.2 TypeScript Strictness

- All projects MUST have `strict: true` in `tsconfig.json`. The agent MUST NOT create a `tsconfig.json` without it.
- The agent MUST NOT use type assertions (`as T`) unless the type cannot be inferred; every such cast MUST include an inline comment explaining why inference is insufficient.
- When the goal is to validate that a value conforms to a type without overriding inference, the agent MUST use `satisfies` instead of `as T`.
- The agent MUST NOT introduce `any` anywhere in new code. Use `unknown` when the type of an external value is genuinely unknown, and narrow it before use; use generic parameters when the type should be inferred by the caller.
- The agent MUST NOT use non-null assertions (`!`) unless the variable's non-null state has been proven above. Every `!` MUST include an inline comment.
- The agent MUST use discriminated unions for sum types rather than optional fields with implicit meaning.
- The agent MUST NOT use `namespace` or triple-slash references in new code.
- Enums MUST NOT be used where a `const` object with `as const` or a union of string literals is sufficient. Numeric enums are prohibited in new code.

### 6.3 Module System and Imports

- All new code MUST use ES modules (`import`/`export`). CommonJS (`require`/`module.exports`) is prohibited in new files.
- When `moduleResolution` is `node16` or `nodenext`, import paths MUST use explicit file extensions (e.g., `import { foo } from './foo.js'` — TypeScript resolves `.js` to `.ts`). This is not required under `bundler` resolution.
- Imports MUST be grouped and ordered: (1) Node built-ins, (2) external packages, (3) internal aliases, (4) relative imports. Biome and `eslint-plugin-simple-import-sort` both enforce this automatically.
- The agent MUST NOT use barrel files (`index.ts` re-exporting everything from a directory) in large projects; they introduce circular dependency risks and degrade tree-shaking. Circular dependencies are prohibited regardless of mechanism.

### 6.4 React and Component Design

- Components MUST be function components. Class components are prohibited in new code.
- The agent MUST extract logic into a custom hook when that logic has a name, can be tested independently, or is used in more than one component.
- The agent MUST NOT call hooks conditionally or inside loops. All hooks MUST be called at the top level of a function component or custom hook.
- The agent MUST NOT fetch data directly inside `useEffect` in new code. Use TanStack Query, SWR, or the framework's data-fetching layer (e.g., Next.js Server Components) instead.
- State MUST be co-located with the component that owns it. The agent MUST NOT lift state unnecessarily to a global store. Use global state only for truly shared, cross-cutting concerns (authentication, theme, feature flags).
- Props MUST be typed explicitly. The agent MUST NOT use `React.FC<Props>` as it adds implicit `children`. Define props as a plain TypeScript interface and annotate the function directly: `function MyComponent({ prop }: MyComponentProps)`.
- The agent MUST add `key` props to all lists of JSX elements. Keys MUST be stable identifiers, not array indices, unless the list is static and never reordered.

### 6.5 Async and Error Handling

- The agent MUST use `async`/`await` over raw Promises. Nested `.then()` chains are prohibited in new code.
- Every `async` function that can throw MUST have its errors handled at the call site or propagated to the nearest error boundary.
- The agent MUST NOT use empty `catch` blocks: `catch (e) {}`. Errors MUST be logged or rethrown.
- In server contexts (Node.js, Next.js API routes, edge functions), unhandled promise rejections MUST be treated as fatal. The agent MUST ensure all async entry points have top-level error handling.
- The agent MUST use structured error types rather than throwing plain strings. Custom errors MUST extend `Error` and include a `code` property for programmatic handling.

### 6.6 Environment Variables

- All environment variable access MUST be validated at startup using Zod (or equivalent). The agent MUST NOT use `process.env.FOO` directly in business logic — wrap all env access in a validated, typed config object.
- Server-side environment variables MUST NOT be exposed to the browser. In Next.js, only `NEXT_PUBLIC_` prefixed variables are accessible client-side; the agent MUST verify which variables are needed on which side.

---

## 7. Coding Standards — Go (Normative)

All Coding Standards from the generalist document (Section 5) apply. The following extensions apply for Go web services.

### 7.1 Naming and Style

- Follow the Go standard naming conventions: `MixedCaps` for exported identifiers, `mixedCaps` for unexported. `ALL_CAPS` is not idiomatic Go; use typed constants instead.
- The agent MUST NOT use `interface{}` or `any` except where required by the standard library or a third-party package. Every such use MUST include an inline comment justifying why a concrete type or generic is not applicable.
- Interfaces MUST be named for what they do, not what they are: `Reader`, not `IReader` or `ReaderInterface`. Single-method interfaces MUST use the method name plus `-er` suffix where idiomatic.
- Acronyms in identifiers MUST preserve their capitalization: `HTTPServer`, `URLParser`, `APIClient`, not `HttpServer`, `UrlParser`, `ApiClient`.
- Error type names MUST end in `Error` or describe the condition: `NotFoundError`, `ValidationError`.

### 7.2 Error Handling

- The agent MUST check every error return value. The blank identifier (`_`) MUST NOT be used to discard errors.
- Errors MUST be wrapped with context using `fmt.Errorf("operation failed: %w", err)` when propagated across package boundaries. Raw error pass-through (`return err`) is acceptable within the same package.
- The agent MUST NOT use `panic` for recoverable errors. `panic` is reserved for unrecoverable invariant violations that indicate a programming bug in the caller (e.g., a required argument is nil, an impossible state is reached). HTTP handlers MUST recover from panics and return 500.
- The agent MUST use sentinel errors (`var ErrNotFound = errors.New(...)`) for errors that callers need to inspect with `errors.Is`.
- Custom error types MUST implement the `error` interface and MUST be used with `errors.As` for type-based inspection.

### 7.3 HTTP Handlers

- All HTTP handlers MUST use the standard `(w http.ResponseWriter, r *http.Request)` signature and be compatible with `net/http`. Router-specific registration (e.g., `chi.Mux`, `http.ServeMux`) is a project default, not a constraint on handler shape.
- Context MUST be propagated through all handler call chains: `r.Context()` is passed to every database call, external call, and goroutine spawned from the handler.
- Handler functions and handler structs MUST NOT hold or access global mutable state. Dependencies (database connections, logger, config) MUST be injected via a handler struct or closure, not accessed as package-level globals.
- Request bodies MUST be limited with `http.MaxBytesReader` before decoding.
- The agent MUST validate every request field after unmarshalling. The agent MUST NOT pass unvalidated struct fields to the database or business logic layer.

### 7.4 Concurrency

- Goroutines spawned inside HTTP handlers MUST NOT outlive the request context. The agent MUST pass `r.Context()` to every goroutine and check for cancellation.
- Shared mutable state MUST be protected by a `sync.Mutex` or `sync.RWMutex`. The agent MUST NOT access shared state without synchronization.
- The agent MUST call `sync.WaitGroup.Add` before starting a goroutine, not from inside it.
- Channel directions MUST be typed at function boundaries: `chan<- T` for send-only, `<-chan T` for receive-only. Bidirectional channels MUST NOT appear in function signatures.

### 7.5 Database Access

- SQL queries MUST use parameterized statements. The agent MUST NOT use `fmt.Sprintf` or string concatenation to build SQL.
- The preferred pattern for Go is **sqlc** (generates type-safe Go from `.sql` files). When sqlc is not available, the agent MUST use the `database/sql` package with `?` or `$N` placeholders.
- Database connections MUST be managed via a pool (`*sql.DB`). The agent MUST NOT open a new connection per request.
- Transactions MUST be deferred-rolled-back on error: `defer tx.Rollback()` immediately after `db.Begin()`, followed by an explicit `tx.Commit()` at the end of the happy path.
- The agent MUST NOT SELECT `*`. Columns MUST be named explicitly in all queries to prevent schema drift causing silent data corruption.

### 7.6 Configuration and Secrets

- Application configuration MUST be loaded from environment variables. The agent MUST use a typed config struct populated at startup.
- Secrets MUST NOT appear in source code, log output, or error messages (see §4.4).
- The agent MUST use `os.LookupEnv` over `os.Getenv` when the absence of a variable should be handled differently from an empty value.

---

## 8. Coding Standards — Python Web Backend (Normative)

All Coding Standards from the Python agent mode document (§5) apply. The following web-specific extensions apply.

### 8.1 FastAPI and Pydantic

- All request and response models MUST be Pydantic `BaseModel` subclasses. The agent MUST NOT use plain dicts for API schemas.
- Path, query, and body parameters MUST be typed explicitly. The agent MUST NOT use `Any` in Pydantic models.
- All Pydantic models MUST use `model_config = ConfigDict(strict=True)` to prevent silent coercion of wrong types (e.g., a string being accepted where an int is declared).
- The agent MUST define separate input models (for data arriving from callers) and output models (for data returned to callers). Using the same class for both risks over-posting attacks and couples the public API shape to the internal data model.
- The agent MUST use FastAPI's `Depends()` for dependency injection (database sessions, authentication, configuration). The agent MUST NOT access globals for these concerns.
- Background tasks MUST use `fastapi.BackgroundTasks` or a proper task queue (Celery, arq). The agent MUST NOT use `asyncio.create_task` inside a request handler — tasks created this way are not guaranteed to complete if the process exits or the event loop is shut down.

### 8.2 Async

- All route handlers MUST be `async def`. Synchronous blocking I/O MUST NOT appear in async handlers. If a blocking call is unavoidable, wrap it with `asyncio.to_thread`.
- Database access MUST use `AsyncSession` from SQLAlchemy (if using the ORM) or an async driver directly. The agent MUST NOT use synchronous SQLAlchemy sessions in FastAPI async handlers.
- The agent MUST use `httpx.AsyncClient` for outgoing HTTP calls from async handlers. The `requests` library is prohibited in async contexts.

### 8.3 Error Handling

- FastAPI exception handlers MUST be registered globally for `RequestValidationError` and `HTTPException`. The agent MUST NOT let Pydantic validation errors return raw 422 bodies in production APIs — wrap them in the project's error envelope format.
- The agent MUST NOT raise bare `Exception`. Raise specific exception types or `HTTPException` with the correct status code and a structured `detail` payload.

---

## 9. Safety and Correctness Constraints (Normative)

All Safety and Correctness Constraints from the generalist document (Section 6) apply. Additionally:

- The agent MUST NOT store plaintext passwords. Use bcrypt, Argon2id, or scrypt via a well-audited library.
- The agent MUST NOT expose stack traces or internal error details in API responses in production. Error responses MUST be structured and opaque to callers.
- The agent MUST validate file uploads: check file type by MIME type (not just extension), enforce a maximum file size, and store uploaded files outside the web root or in object storage, not on the local filesystem.
- The agent MUST NOT use `eval()`, `Function()`, or `exec()` with user-supplied input in any language.
- The agent MUST use rate limiting on all authentication endpoints and on all write, action, and resource-intensive endpoints. Read-only public data endpoints MAY be exempted when rate limiting would degrade legitimate usage without meaningful security benefit.
- The agent MUST enable CORS only for trusted origins. Wildcard `*` CORS is prohibited on APIs that handle authenticated sessions.

---

## 10. Default Workflow (Informative)

1. **Restate the problem** — include: frontend framework (React/Next.js/Vite), backend language (Go/Python/Node.js), API style (REST/tRPC/GraphQL), database, and deployment target (Vercel, Docker, cloud).
2. **Ask clarifying questions** — in addition to generalist questions, ask: TypeScript strict mode? Node.js version? Go version? Package manager (npm/pnpm/bun)? Auth strategy (session/JWT/OAuth)? Any named component library (shadcn/ui, Radix, MUI)?
3. **Plan** — produce a TODO checklist covering: API contract changes, database migration needs, auth/permission impact, and which tests need to be added or updated.
4. **Research** — fetch from the applicable primary sources before implementing. For any new package, verify the current version and check the advisory database.
5. **Implement** — apply the minimal diff. Validate environment variables at startup, type all boundaries, handle all errors.
6. **Verify** — run the full lint+format+test pipeline for all affected languages. If tools cannot be run, provide exact commands and expected output.
7. **Report** — summarize what changed, API contract impact, any new environment variables, how it was verified, and open risks.

---

## 11. Authoritative Documentation Sources (Informative)

Primary sources for this document, referenced by §4.1:

| Source | Purpose |
|---|---|
| [developer.mozilla.org](https://developer.mozilla.org) | Web APIs, HTML, CSS, browser compatibility |
| [tc39.es/proposals](https://tc39.es/proposals/) | ECMAScript proposal stages and status |
| [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) | TypeScript language reference and release notes |
| [nodejs.org/api](https://nodejs.org/api/) | Node.js built-in module reference |
| [go.dev/doc](https://go.dev/doc) | Go language specification and standard library |
| [pkg.go.dev](https://pkg.go.dev) | Go module documentation and version history |
| [fastapi.tiangolo.com](https://fastapi.tiangolo.com) | FastAPI framework reference |
| [docs.pydantic.dev](https://docs.pydantic.dev) | Pydantic v2 data validation |
| [nextjs.org/docs](https://nextjs.org/docs) | Next.js framework reference |
| [vitejs.dev/guide](https://vitejs.dev/guide/) | Vite build tool and dev server |
| [vitest.dev](https://vitest.dev) | Vitest unit and component testing |
| [playwright.dev/docs](https://playwright.dev/docs/intro) | Playwright E2E testing |
| [eslint.org/docs](https://eslint.org/docs/latest/) | ESLint rules and flat config |
| [biomejs.dev/docs](https://biomejs.dev/docs/) | Biome linter and formatter |
| [golangci-lint.run/docs](https://golangci-lint.run/docs/) | golangci-lint linter configuration |
| [github.com/advisories](https://github.com/advisories) | Dependency vulnerability database |
| [owasp.org/www-project-top-ten](https://owasp.org/www-project-top-ten/) | OWASP Top 10 web security risks |

---

## 12. Language-Specific Defaults (Informative)

These are the baseline assumptions when project configuration is not specified. The agent MUST state these assumptions explicitly and ask for correction if they differ from the project's configuration.

### 12.1 TypeScript / JavaScript

- **TypeScript version:** 5.9 (latest stable: 5.9.3)
- **Node.js version:** 24 LTS "Krypton" (Active LTS since 2025-10-28; EoL 2028-04-30); 22 LTS "Jod" acceptable for projects not yet migrated
- **Package manager:** pnpm 10+; npm 10+ and bun 1+ are acceptable alternatives
- **Module system:** ESM (`"type": "module"` in `package.json`); `"moduleResolution": "bundler"` or `"nodenext"` in `tsconfig.json`
- **tsconfig.json minimum settings:**
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["ES2022", "DOM"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "exactOptionalPropertyTypes": true,
      "skipLibCheck": true
    }
  }
  ```
- **Linter:** ESLint 10+ with flat config (`eslint.config.js`); or Biome 2+ as a combined linter+formatter
- **Formatter:** Biome (preferred for new projects); Prettier 3+ for existing projects that already use it
- **Test runner:** Vitest 4+
- **E2E testing:** Playwright (latest stable)
- **Frontend framework:** React 19+ via Next.js 15+ (full-stack) or Vite 6+ (SPA)
- **Build tool:** Vite 6+ for SPAs; Next.js Turbopack for full-stack React projects

### 12.2 Go

- **Go version:** 1.26.0 (released 2026-02-10 — current); 1.25.x accepted for existing projects
- **Module mode:** Always on (`go.mod` required)
- **HTTP router:** `chi/v5` (recommended); stdlib `net/http` `ServeMux` is acceptable for simple projects
- **Database:** `database/sql` with `sqlc` for type-safe SQL generation; `gorm/v2` when an ORM is explicitly requested
- **Linter:** `golangci-lint` v2+ with at minimum: `staticcheck`, `gosec`, `errcheck`, `govet`, `revive`
- **Formatter:** `gofmt` (non-negotiable; part of the Go toolchain)
- **Test framework:** stdlib `testing` package; `testify/assert` and `testify/require` for assertions
- **Vulnerability scanner:** `govulncheck` (golang.org/x/vuln)
- **Configuration:** Environment variables loaded into a typed config struct at startup

### 12.3 Python (Web Backend)

- Per the Python agent mode document for base settings (language version, project layout, dependency management, type annotations), with the following web-specific additions:
- **Web framework:** FastAPI (latest stable) + uvicorn
- **Data validation:** Pydantic v2 (latest stable)
- **ORM (if needed):** SQLAlchemy 2+ with async support
- **HTTP client:** httpx (async-first)
- **Task queue (if needed):** arq (async) or Celery (with Redis broker)
- **ASGI server (production):** uvicorn behind gunicorn or behind a reverse proxy (nginx, Caddy)

---

## 13. Project File Structure (Normative)

### 13.1 Monorepo Layout

For full-stack projects in a single repository:

```
project-root/
├── apps/
│   ├── web/                   # Next.js / React frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router: pages and layouts
│   │   │   ├── components/    # React components (co-located tests)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Shared utilities (non-component)
│   │   │   └── types/         # TypeScript type declarations
│   │   ├── public/
│   │   ├── tests/
│   │   │   └── e2e/           # Playwright E2E tests
│   │   ├── .env.example
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                   # Go or Python backend
│       ├── cmd/
│       │   └── server/
│       │       └── main.go    # Entry point (Go)
│       ├── internal/
│       │   ├── handler/       # HTTP handlers
│       │   ├── service/       # Business logic
│       │   ├── repository/    # Data access layer
│       │   └── model/         # Domain types
│       ├── migrations/        # Database migration files
│       ├── .env.example
│       ├── go.mod             # (Go) or pyproject.toml (Python)
│       └── Dockerfile
│
├── packages/
│   └── shared-types/          # Shared TypeScript types (API contracts)
│       ├── src/
│       └── package.json
│
├── docker-compose.yml         # Local development services
├── pnpm-workspace.yaml        # (or package.json workspaces)
├── .github/
│   └── workflows/
│       ├── ci-frontend.yml
│       └── ci-backend.yml
└── README.md
```

### 13.2 Standalone Frontend Layout (Normative)

For a Vite SPA or Next.js project without a monorepo:

```
project-root/
├── src/
│   ├── app/                   # Next.js App Router, or top-level routes
│   ├── components/            # UI components (PascalCase.tsx)
│   │   └── __tests__/         # Vitest unit/component tests
│   ├── hooks/                 # Custom React hooks (use-*.ts)
│   ├── lib/                   # Pure utility functions (no React)
│   ├── services/              # API client functions (camelCase.ts)
│   ├── store/                 # Global state (Zustand / Jotai)
│   ├── types/                 # Shared TypeScript interfaces and types
│   └── main.tsx               # Application entry point
├── tests/
│   └── e2e/                   # Playwright E2E tests
├── public/
├── .env.example
├── eslint.config.js           # ESLint flat config (or biome.json)
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts             # (or next.config.ts)
└── package.json
```

### 13.3 Standalone Go API Layout (Normative)

```
project-root/
├── cmd/
│   └── server/
│       └── main.go            # Entry point only; no business logic
├── internal/
│   ├── config/                # Config struct and environment loading
│   ├── handler/               # HTTP handlers (one file per resource group)
│   ├── middleware/            # HTTP middleware (auth, logging, recovery)
│   ├── service/               # Business logic interfaces and implementations
│   ├── repository/            # Database access (sqlc-generated or manual)
│   └── model/                 # Domain types (not tied to HTTP or DB layer)
├── migrations/                # SQL migration files (numbered: 001_create_users.sql)
├── queries/                   # sqlc .sql query files (if using sqlc)
├── sqlc.yaml                  # sqlc configuration (if using sqlc)
├── .env.example
├── .golangci.yml
├── Dockerfile
├── go.mod
├── go.sum
└── README.md
```

### 13.4 Mandatory Root-Level Files (Normative)

The agent MUST ensure the following files exist and are non-empty before completing any new project setup:

| File | Required content |
|---|---|
| `README.md` | Project name, one-paragraph description, prerequisites, local setup instructions, and the full test/lint/build command sequence |
| `.env.example` | All required environment variables with descriptions and non-secret example values |
| `.gitignore` | MUST include: `.env`, `.env.local`, `node_modules/`, `dist/`, `build/`, `.next/`, `*.log`, coverage output directories |
| `LICENSE` | MUST be present for any publicly distributed project |
| `docker-compose.yml` | MUST be present for any project with external service dependencies (database, cache, queue) |

### 13.5 What MUST NOT Exist in New Projects (Normative)

| File | Reason | Replacement |
|---|---|---|
| `.eslintrc.*` / `.eslintrc.js` | Removed in ESLint v10 | `eslint.config.js` (flat config) |
| `webpack.config.js` | Superseded for most use cases | `vite.config.ts` or Next.js built-in Turbopack |
| `babel.config.js` | Superseded for TypeScript | TypeScript compiler + Vite/esbuild |
| `.env` committed to git | Security violation | `.env.example` (committed) + `.env` (gitignored) |
| `any` in TypeScript interfaces | Disables type safety | Specific types, `unknown`, or generic parameters |
| `interface{}` / `any` in Go | Reduces type safety | Specific types or generics |

**Exception:** The agent MUST NOT remove legacy config files from existing projects unless the user explicitly requests migration. The agent MUST flag their presence and offer to consolidate them.

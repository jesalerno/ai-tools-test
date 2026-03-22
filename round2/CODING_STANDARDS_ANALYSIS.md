# Coding Standards Analysis

This document outlines the coding standards observed across the five different versions of the Fractal Card Generator, followed by a composite list of best practices derived from them.

## 1. Project-by-Project Coding Standards

### FractalCardGenerator-Antigravity
*   **Tooling:** Utilizes Google TypeScript Style (`gts`), which strictly bundles TypeScript linting and Prettier formatting.
*   **Philosophy:** Fully automated formatting and linting. Avoid manual style debates.
*   **Frontend:** Standard `eslint-config-react-app` provided by Create React App (`craco`).

### FractalCardGenerator-ClaudeCode
*   **Tooling:** Lightweight ESLint setup (`eslint src --ext .ts`) for the backend. No explicit formatting config like Prettier is defined in `package.json`.
*   **Frontend:** Standard `eslint-config-react-app`.

### FractalCardGenerator-Codex
*   **Tooling:** Modern ESLint flat configuration (`eslint.config.mjs`) with `@typescript-eslint/eslint-plugin` v8.
*   **Rules:** Strict type safety including `@typescript-eslint/recommended-type-checked` and `@typescript-eslint/stylistic-type-checked`.
*   **Specifics:** 
    *   Cyclomatic complexity restricted to 10 (`complexity: ['error', 10]`).
    *   Disallows explicit `any` and floating promises.
    *   Enforces consistent type imports (`prefer: 'type-imports'`).
    *   Relaxes strict rules in `test/**/*.ts` files to facilitate easier test mocking and writing.
*   **Frontend:** Vite-based template relying on default Vite ESLint plugins without explicit overrides.

### FractalCardGenerator-Cursor
*   **Tooling:** No explicit linting or formatting commands defined in the backend `package.json`. Relies on default TypeScript compilation (`tsc`).
*   **Frontend:** Standard `eslint-config-react-app` with Tailwind CSS for styling.

### FractalCardGenerator-VSCode-Copilot
*   **Tooling:** Classic ESLint setup (`.eslintrc.js`) with `@typescript-eslint` plugin.
*   **Rules:** Strong focus on architectural limits:
    *   `complexity`: max 10.
    *   `max-depth`: max 3 nested blocks.
    *   `max-lines-per-function`: max 50 lines (ignoring comments/blanks).
    *   `max-params`: max 5 parameters per function.
*   **Specifics:** 
    *   Explicit `any` disallowed.
    *   Unused variables are errors unless prefixed with `_`.
*   **Frontend:** Standard `eslint-config-react-app`.

---

## 2. Composite Best Practices (Recommended Standard)

Based on the intersection of the most robust practices observed across these projects, the following composite standard is recommended for modern TypeScript projects:

### 2.1. Tooling & Automation
*   **Zero-Debate Formatting:** Use automated tools like `gts` or Prettier integrated with ESLint. Formatting should be automated via git hooks or CI, requiring no manual review.
*   **Modern Linting:** Use ESLint with `@typescript-eslint/recommended-type-checked` to catch logical errors based on TypeScript's type information.

### 2.2. TypeScript Strictness
*   **No Explicit Any:** Ban the use of `any` (`@typescript-eslint/no-explicit-any`). Use `unknown` with type guards or generic types instead.
*   **Promise Safety:** Prevent "fire and forget" promises ensuring all promises are properly awaited or caught (`@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises`).
*   **Type Imports:** Use explicit type imports to clearly distinguish types from values (`@typescript-eslint/consistent-type-imports`), aiding bundlers and compilers.
*   **Unused Variables:** Flag unused variables as errors to keep code clean, but allow an exception for variables prefixed with an underscore (`^_`) typically used for necessary but unused callback parameters.

### 2.3. Cognitive Complexity Limits
Enforcing structural limits prevents functions from becoming unmaintainable monoliths:
*   **Cyclomatic Complexity:** Maximum of 10 (`complexity: ['error', 10]`).
*   **Nesting Depth:** Maximum depth of 3 (`max-depth: ['error', 3]`).
*   **Function Length:** Maximum of 50 lines of actual code (`max-lines-per-function: ['error', { max: 50, skipBlankLines: true, skipComments: true }]`).
*   **Parameter Length:** Maximum of 5 parameters per function (`max-params: ['error', 5]`). Prefer options objects for functions requiring more parameters.

### 2.4. Context-Aware Relaxations
*   **Testing Exclusions:** Strict typing rules (like `no-explicit-any`, `no-floating-promises`, `no-unsafe-assignment`) should be explicitly disabled for test files (e.g., `test/**/*.ts`) to allow for rapid, flexible test creation and mocking without polluting the main codebase's strictness.
*   **Console Logging:** Depending on the deployment strategy, `no-console` can be turned off for Node.js backends if `console.log` is the designated logging mechanism, but should generally be restricted in the frontend in favor of structured logging.

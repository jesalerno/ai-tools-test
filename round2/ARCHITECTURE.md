# Architecture & Technology Stack Recommendations

This document outlines the recommended technology stack for our generative AI application, compiling the "best-in-class" choices identified during our evaluations of various project implementations.

## Language
- **[TypeScript]**: Used across both the Frontend and Backend to ensure strong typing, developer experience, and maintainable codebases.

## Frontend
- **Framework**: **React 19**
  - *Why*: The most cutting-edge standard for React development.
- **Build Tool / Bundler**: **Vite**
  - *Why*: Provides an incredibly fast development server and optimized build tooling. Replaces the deprecated and slower `create-react-app` (`react-scripts`).
- **Styling and UI Foundation**:
  - **Tailwind CSS**: Utility-first CSS framework for rapid and maintainable UI design.
  - **Radix UI Primitives** (`@radix-ui/*`): Unstyled, perfectly accessible UI primitive components.
  - **Utility Libraries**: `clsx`, `tailwind-merge`, and `class-variance-authority` (CVA).
  - **Icons**: `lucide-react`.
  - *Why*: Combining unstyled primitives with Tailwind and these utility libraries is the modern gold standard for building accessible, highly customizable, compound component libraries (following the *shadcn/ui* pattern).

## Backend
- **Server Framework**: **Express 5.x**
  - *Why*: A major step forward that provides native async-await error handling capability out of the box without requiring external wrapper utilities.
- **Graphics / Image Generation**: **`@napi-rs/canvas`**
  - *Why*: A highly performance-optimized, modern Rust-based implementation. It avoids the complex native build step headaches frequently encountered with the standard Node `canvas` binary.
- **Mathematical Operations**: **`complex.js`**
  - *Why*: Standard library for handling the complex mathematical formulas inherent in fractal/generative logic.
- **API/Middleware Utilities**:
  - **`cors`**: For cross-origin resource sharing management.
  - **`express-rate-limit`**: Essential for preventing abuse of the generation endpoints.
  - **`ajv`**: Fast JSON Schema Validator for robust validation of generation request payloads.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use legacy shareable configs (like 'gts') from flat config.
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.turbo/**"
    ]
  },

  // Opinionated baseline style.
  ...compat.extends("gts"),

  // Global TS baseline.
  ...compat.extends("plugin:@typescript-eslint/recommended"),

  // Small, global deltas.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }]
    }
  },

  // Typed linting for API boundaries only (higher signal, slower).
  ...compat
    .extends(
      "plugin:@typescript-eslint/recommended-type-checked",
      "plugin:@typescript-eslint/stylistic-type-checked"
    )
    .map((c) => ({
      ...c,
      files: [
        "src/api/**/*.ts",
        "src/routes/**/*.ts",
        "src/controllers/**/*.ts",
        "src/services/**/*.ts",
        "src/middleware/**/*.ts"
      ],
      languageOptions: {
        ...(c.languageOptions ?? {}),
        parserOptions: {
          projectService: true,
          tsconfigRootDir: __dirname
        }
      }
    })),

  // REST/JSON boundary hardening.
  {
    files: [
      "src/api/**/*.ts",
      "src/routes/**/*.ts",
      "src/controllers/**/*.ts",
      "src/services/**/*.ts",
      "src/middleware/**/*.ts"
    ],
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { "checksVoidReturn": true }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { "allowExpressions": true, "allowTypedFunctionExpressions": true }
      ]
    }
  },

  // Tests can be looser.
  {
    files: ["test/**/*.ts", "**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off"
    }
  }
];

// ESLint v9 flat config for fcg-claude backend.
// Enforces the rule set specified in CODING_STANDARDSv2 §4 (exact list only).
// Uses `tseslint.configs.base` instead of `recommendedTypeChecked` so we
// stay on the spec-mandated rules and don't pull in the broader "unsafe-*"
// typed-lint family (which flags legitimate boundary-crossing code in
// third-party CJS modules).

import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'eslint.config.js', 'jest.config.cjs'] },
  tseslint.configs.base,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.test.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', 5],
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
    },
  },
  prettierConfig,
);

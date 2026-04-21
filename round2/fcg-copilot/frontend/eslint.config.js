import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 5],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  }
);

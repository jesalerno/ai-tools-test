/* eslint-env node */
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@napi-rs/canvas$': '<rootDir>/test/mocks/canvas.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json',
        diagnostics: { ignoreCodes: ['TS151001'] },
      },
    ],
  },
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/**/*.d.ts',
    '!src/infrastructure/config/openapi.ts',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  clearMocks: true,
};

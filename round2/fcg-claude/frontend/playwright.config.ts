import { defineConfig, devices } from '@playwright/test';

const PORT = Number.parseInt(process.env['FCG_E2E_PORT'] ?? '3040', 10);
const BASE_URL = process.env['FCG_E2E_BASE_URL'] ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

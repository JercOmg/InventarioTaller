import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    screenshot: 'only-on-failure',
    // El headless-shell de Chromium no arranca en algunos Windows; usar
    // el navegador completo en modo headless nuevo
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
  },
  expect: { timeout: 10_000 },
  // El backend + frontend + BD deben estar corriendo (docker compose up o dev servers)
  webServer: process.env.E2E_NO_SERVER ? undefined : undefined,
});

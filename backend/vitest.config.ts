import { defineConfig } from 'vitest/config';

const TEST_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://ferreteria:ferreteria123@localhost:5433/ferreteria_test?schema=public';

export default defineConfig({
  test: {
    globalSetup: './tests/global-setup.ts',
    env: {
      // Base de datos dedicada para pruebas (globalSetup la migra y siembra)
      DATABASE_URL: TEST_URL,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test',
    },
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Las pruebas de concurrencia comparten la base: secuencial
    fileParallelism: false,
  },
});

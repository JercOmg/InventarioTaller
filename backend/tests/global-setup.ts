import { execSync } from 'node:child_process';

const TEST_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://ferreteria:ferreteria123@localhost:5433/ferreteria_test?schema=public';

/** Prepara la base de datos de pruebas: aplica migraciones (incluye CHECKs) y siembra. */
export default function setup() {
  const env = { ...process.env, DATABASE_URL: TEST_URL };
  execSync('npx prisma migrate deploy', { env, stdio: 'inherit', cwd: __dirname + '/..' });
  execSync('npx tsx prisma/seed.ts', { env, stdio: 'inherit', cwd: __dirname + '/..' });
}

import { Client } from 'pg';

// Defaults match the devcontainer; CI overrides them via env vars.
export function e2eDbClient(): Client {
  return new Client({
    host: process.env.DB_HOST ?? 'db',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'YourStrong!Passw0rd',
    database: process.env.E2E_DB_NAME ?? 'leaderboard_e2e',
  });
}

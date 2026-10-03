import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { e2eDbClient } from './db';

const seedSql = readFileSync(join(__dirname, 'seed.sql'), 'utf8');

type Fixtures = {
  /** Resets the E2E database to seed.sql before every test. Automatic - no need to request it. */
  resetDatabase: void;
  /** Run ad-hoc SQL against the E2E database, e.g. to add data a specific test needs. */
  sql: (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
};

export const test = base.extend<Fixtures>({
  resetDatabase: [async ({}, use) => {
    const client = e2eDbClient();
    await client.connect();
    try {
      await client.query(seedSql);
    } finally {
      await client.end();
    }
    await use();
  }, { auto: true }],

  sql: async ({}, use) => {
    const client = e2eDbClient();
    await client.connect();
    await use(async (query, params) => (await client.query(query, params)).rows);
    await client.end();
  },
});

export { expect };

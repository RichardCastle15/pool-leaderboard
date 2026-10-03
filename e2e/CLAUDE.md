# E2E tests (Playwright)

End-to-end tests that drive the real, published app against a throwaway PostgreSQL database.

## How it runs

- `scripts/start-server.sh` drops and recreates the `leaderboard_e2e` database, applies the Flyway
  migrations, `dotnet publish`es the server (which builds the Angular SPA) and serves it on
  **http://localhost:5180** with `ASPNETCORE_ENVIRONMENT=E2E`. Dev data in `leaderboard` is never touched.
- `playwright.config.ts` starts that script via `webServer`, or reuses a server already listening on
  :5180 (locally only). Start one with the VS Code task **Start E2E Server** to make runs fast.
- `fixtures.ts` re-applies `seed.sql` (TRUNCATE + fixed data) **before every test**, so each test
  starts from the same database state. Tests run serially (`workers: 1`).
- The in-memory Killer game (`KillerGameService` singleton) and Killer's player shuffle are **not**
  reset or seeded - tests must cope with a game possibly being in progress and with random turn order.

## Writing tests with the Playwright MCP

1. Make sure the E2E server is running on :5180 (start the "Start E2E Server" task, or run
   `./scripts/start-server.sh` in the background) and apply the seed so the browser sees the same data
   as the tests: `PGPASSWORD="$DB_PASSWORD" psql -h db -U postgres -d leaderboard_e2e -f seed.sql`.
2. Explore with the MCP against `http://localhost:5180`, never the dev server (60125 / 5166).
3. Write the spec in `tests/<feature>.spec.ts`.

## Conventions

- Import `test` and `expect` from `../fixtures`, **never** from `@playwright/test` - otherwise the DB reset doesn't run.
- Navigate with relative URLs (`page.goto('/killer')`); `baseURL` is configured.
- Prefer `getByRole` / `getByText` / `getByPlaceholder` locators (what the MCP generates). Avoid CSS
  classes and Nebular internals unless there's no accessible alternative.
- Rely on Playwright's auto-waiting `expect(...)` assertions; no `waitForTimeout`.
- Assert against the seed data in `seed.sql` (Alice A 1100, Bob B 1050, Carol C 1000, Dave D 950; ids 1-4).
  If a test needs extra data, insert it with the `sql` fixture inside the test rather than changing the shared seed.
  If you do change `seed.sql`, update the tests that depend on it.
- The `sql` fixture can also verify persisted state, e.g. `await sql('SELECT ... WHERE name = $1', ['Erin E'])`.
- Run the test you wrote before calling it done: `npx playwright test tests/<file>.spec.ts` from `e2e/`.

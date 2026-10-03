import { defineConfig, devices } from '@playwright/test';

// Deliberately not process.env.CI: the devcontainer sets CI=true for Karma's benefit.
const onGitHubActions = !!process.env.GITHUB_ACTIONS;
const port = Number(process.env.E2E_PORT ?? 5180);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests',
  // One shared database (and one in-memory Killer game on the server), so tests run serially.
  workers: 1,
  fullyParallel: false,
  forbidOnly: onGitHubActions,
  retries: onGitHubActions ? 2 : 0,
  reporter: onGitHubActions ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: './scripts/start-server.sh',
    url: baseURL,
    // Locally, reuse a server started by the "Start E2E Server" task to skip the publish step.
    reuseExistingServer: !onGitHubActions,
    timeout: 300_000,
    stdout: 'pipe',
  },
});

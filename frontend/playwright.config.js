// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Smoke tests - no auth required
    {
      name: 'smoke',
      testDir: './e2e/smoke',
      use: { ...devices['Desktop Chrome'] },
    },

    // Auth setup - registers a user and saves storageState
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.js/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Auth tests (register/login) - run independently
    {
      name: 'auth',
      testDir: './e2e/auth',
      use: { ...devices['Desktop Chrome'] },
    },

    // Authenticated tests - depend on auth-setup
    {
      name: 'authenticated',
      testDir: './e2e',
      testIgnore: ['**/smoke/**', '**/auth/**', '**/auth.setup.js'],
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/user.json',
      },
    },
  ],

  webServer: {
    command: 'pnpm dev -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_USE_MOCK: 'true',
      NEXT_PUBLIC_E2E_AUTH: 'true',
    },
  },
});

import { defineConfig, devices } from '@playwright/test';

const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3005';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw new Error('E2E must run on a local test server, never a live site.');

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  retries: 0,
  globalSetup: './tests/e2e/setup.ts',
  use: { baseURL: origin, trace: 'retain-on-failure' },
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm start',
    url: `${origin}/api/health`,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SITE_URL: origin,
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || 'test-only-secret-'.repeat(4),
      TRUST_PROXY: '0',
    },
    timeout: 60000,
  },
});

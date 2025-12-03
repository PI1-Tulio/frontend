import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes e2e
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Execute os testes em paralelo */
  fullyParallel: true,
  /* Falha o build CI se você acidentalmente deixar test.only */
  forbidOnly: !!process.env.CI,
  /* Retry nos CI apenas */
  retries: process.env.CI ? 2 : 0,
  /* Configuração de workers */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter para usar */
  reporter: 'html',
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em ações como `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    /* Coleta trace no retry da primeira falha */
    trace: 'on-first-retry',
  },

  /* Configuração de projetos para navegadores principais */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Servidor de desenvolvimento local */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});

import { defineConfig } from '@playwright/test'

// Pruebas en el navegador de HatoControl (Fase 11).
// Necesitan el backend en http://localhost:8080 con la base de datos de prueba (HatoControl-db).
// El servidor de Vite se inicia solo y reenvía /api al backend, igual que Vercel en producción.
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['json', { outputFile: 'resultados/resultados.json' }]],
  outputDir: 'resultados/evidencias',
  use: {
    baseURL: process.env.URL_PRUEBAS ?? 'http://localhost:5173',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    cwd: '..',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})

import { expect, type APIResponse, type Page } from '@playwright/test'

// Usuarios de los datos de prueba (HatoControl-db/datos-prueba). Todos usan la misma contraseña.
export const GANADERO = 'jaider@laesperanza.example'
export const ADMIN = 'camila@laesperanza.example'
export const OTRA_FINCA = 'marta@losrosales.example'
export const CLAVE = 'Esperanza26'

/** Fecha de hoy en Colombia, como la usa la aplicación (aaaa-mm-dd). */
export function hoy(desplazamientoDias = 0): string {
  const d = new Date(Date.now() + desplazamientoDias * 864e5)
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

/** "2026-11-21" → "21/11/2026", como se muestra en pantalla. */
export function legible(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

/** Código único por ejecución para no chocar con datos de otras pruebas. */
export function unico(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36).slice(-5).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`
}

/** Ingresa por la pantalla de ingreso (P05) y espera el panel. */
export async function entrar(page: Page, correo = GANADERO, clave = CLAVE): Promise<void> {
  await page.goto('/ingresar')
  await page.locator('input[type=email]').fill(correo)
  await page.locator('input[type=password]').fill(clave)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await page.waitForURL('**/inicio')
}

/** Llama a la API con la sesión y el token CSRF del navegador. Solo se usa para preparar datos. */
export async function api(page: Page, metodo: 'GET' | 'POST' | 'PUT' | 'DELETE', ruta: string, cuerpo?: unknown): Promise<APIResponse> {
  if (!(await page.context().cookies()).some((c) => c.name === 'XSRF-TOKEN')) {
    await page.request.get('/api/sesion')
  }
  const xsrf = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN')?.value ?? ''
  return page.request.fetch(`/api${ruta}`, { method: metodo, data: cuerpo, headers: { 'X-XSRF-TOKEN': xsrf } })
}

/** Prepara un dato y comprueba que la API lo aceptó. */
export async function crear(page: Page, ruta: string, cuerpo: unknown): Promise<void> {
  const r = await api(page, 'POST', ruta, cuerpo)
  expect(r.status(), await r.text()).toBe(201)
}

export async function crearAnimal(page: Page, arete: string, sexo: 'HEMBRA' | 'MACHO', proposito: 'LECHE' | 'ENGORDE' | 'PADRON', nombre = 'Prueba'): Promise<void> {
  await crear(page, '/animales', { codigoArete: arete, nombre, sexo, fechaNacimiento: '2022-01-01', proposito })
}

/** Registra una finca nueva sin datos; la sesión queda abierta con su ganadero. */
export async function fincaNueva(page: Page, nombreFinca: string): Promise<string> {
  const correo = `${unico('f').toLowerCase()}@prueba.example`
  await crear(page, '/cuentas/fincas', { nombreFinca, nombre: 'Ganadero de prueba', correo, contrasena: 'Prueba2026' })
  return correo
}

/** Mensaje de confirmación o de error visible en la pantalla. */
export const mensaje = (page: Page, tipo: 'ok' | 'err' | 'info') => page.locator(`.msg.${tipo}`)

import { expect, test, type Page } from '@playwright/test'
import { CLAVE, GANADERO, entrar } from './ayudas'

// Requisitos no funcionales que se comprueban en el navegador: RNF02, RNF04, RNF05, RNF10 y RNF22.

test.describe('RNF02 · Registro rápido: máximo 3 pantallas desde el inicio', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page)
  })

  test('RNF02 · Registrar un animal: Inicio → Animales → Registrar animal', async ({ page }) => {
    const pantallas = [page.url()]
    await page.getByRole('link', { name: 'Ir a Animales' }).click()
    pantallas.push(page.url())
    await page.getByRole('link', { name: 'Registrar animal' }).click()
    pantallas.push(page.url())
    await expect(page.getByRole('button', { name: 'Guardar animal' })).toBeVisible()
    expect(new Set(pantallas).size).toBeLessThanOrEqual(3)
  })

  test('RNF02 · Registrar una vacuna: Inicio → Sanidad', async ({ page }) => {
    await page.getByRole('link', { name: 'Ir a Sanidad' }).click()
    await expect(page.getByRole('heading', { name: 'Registrar evento o actividad' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Vacuna', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })

  test('RNF02 · Registrar un peso: Inicio → Registros diarios', async ({ page }) => {
    await page.getByRole('link', { name: 'Registrar peso o leche' }).click()
    await expect(page.getByRole('button', { name: 'Guardar peso' })).toBeVisible()
  })
})

test.describe('RNF04 · Las acciones que borran o bloquean piden confirmación', () => {
  test('RNF04 · Eliminar y desactivar abren un diálogo antes de actuar', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales/CO-0256')
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('dialog')).toContainText('Esta acción no se puede deshacer.')
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click()
    await page.goto('/administradores')
    await page.locator('tr', { hasText: 'andres@laesperanza.example' }).getByRole('button', { name: 'Desactivar' }).click()
    await expect(page.getByRole('dialog', { name: '¿Desactivar a Andrés Muñoz?' })).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.locator('tr', { hasText: 'andres@laesperanza.example' })).toContainText('Activa')
  })
})

test.describe('RNF05 · Diseño adaptable en celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })

  const sinDesborde = async (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)

  test('RNF05 · Las pantallas caben en un celular sin desplazamiento horizontal', async ({ page }) => {
    await entrar(page)
    for (const ruta of ['/inicio', '/animales', '/animales/CO-0142', '/animales/nuevo', '/sanidad', '/registros', '/partos/nuevo', '/dashboard', '/reportes', '/administradores']) {
      await page.goto(ruta)
      await expect(page.locator('main')).toBeVisible()
      await page.waitForLoadState('networkidle')
      expect(await sinDesborde(page), `La pantalla ${ruta} se sale del ancho del celular`).toBe(true)
    }
  })

  test('RNF05 · En celular el menú va abajo y el listado se muestra como tarjetas', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales')
    await expect(page.locator('nav.menu-cel')).toBeVisible()
    await expect(page.locator('nav.menu')).toBeHidden()
    await expect(page.locator('.tabla.solo-grande')).toBeHidden()
    await expect(page.locator('.solo-cel button.card').first()).toBeVisible()
    await page.locator('.solo-cel button.card', { hasText: 'CO-0142' }).click()
    await expect(page).toHaveURL(/\/animales\/CO-0142$/)
  })

  test('RNF05 · Las pantallas sin sesión también caben en el celular', async ({ page }) => {
    for (const ruta of ['/', '/ingresar', '/registro', '/recuperar']) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
      expect(await sinDesborde(page), `La pantalla ${ruta} se sale del ancho del celular`).toBe(true)
    }
  })
})

test.describe('RNF10 · Tiempo de respuesta en el navegador', () => {
  test('RNF10 · Las pantallas principales cargan sus datos en menos de 3 segundos', async ({ page }) => {
    await entrar(page)
    const esperas: [string, (p: Page) => Promise<void>][] = [
      ['/animales', (p) => expect(p.locator('tbody tr').first()).toBeVisible()],
      ['/animales/CO-0142', (p) => expect(p.getByRole('heading', { name: 'Evolución de peso' })).toBeVisible()],
      ['/sanidad', (p) => expect(p.locator('tr', { hasText: 'CO-0188' }).first()).toBeVisible()],
      ['/dashboard', (p) => expect(p.locator('.kpi').first()).toBeVisible()],
    ]
    for (const [ruta, listo] of esperas) {
      const inicio = Date.now()
      await page.goto(ruta)
      await listo(page)
      const ms = Date.now() - inicio
      console.log(`RNF10 | navegador | ${ruta} | ${ms} ms`)
      expect(ms, `${ruta} tardó ${ms} ms`).toBeLessThan(3000)
    }
  })
})

test.describe('RNF22 · La contraseña no queda expuesta en el navegador', () => {
  test('RNF22 · Campo oculto, sin rastro en la URL ni en el almacenamiento, y cookie de sesión ilegible', async ({ page }) => {
    await page.goto('/ingresar')
    await expect(page.locator('input[type=password]')).toBeVisible()
    await entrar(page, GANADERO, CLAVE)
    expect(page.url()).not.toContain(CLAVE)
    const almacenado = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }))
    expect(almacenado).not.toContain(CLAVE)
    const cookiesVisibles = await page.evaluate(() => document.cookie)
    expect(cookiesVisibles).not.toContain('JSESSIONID')
    const sesion = (await page.context().cookies()).find((c) => c.name === 'JSESSIONID')
    expect(sesion?.httpOnly).toBe(true)
    expect(sesion?.sameSite).toBe('Lax')
  })
})

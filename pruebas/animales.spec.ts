import { expect, test } from '@playwright/test'
import { ADMIN, api, crear, crearAnimal, entrar, hoy, mensaje, unico } from './ayudas'

// Criterios de HU_001 a HU_005, HU_011, HU_013 y HU_015 que se comprueban en pantalla.

const arete = (page: import('@playwright/test').Page) => page.getByLabel('Código de arete')
const opcion = (page: import('@playwright/test').Page, nombre: RegExp) => page.getByRole('button', { name: nombre })

test.describe('Registrar animal (P07)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, ADMIN)
    await page.goto('/animales/nuevo')
  })

  test('HU_001 C1 · Registrar con datos válidos muestra la confirmación', async ({ page }) => {
    const codigo = unico('E')
    await arete(page).fill(codigo)
    await page.getByLabel('Nombre').first().fill('Aurora')
    await page.getByRole('button', { name: 'Hembra', exact: true }).click()
    await opcion(page, /^Leche/).click()
    await page.getByRole('button', { name: 'Guardar animal' }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Animal ${codigo} registrado correctamente.`)
    expect((await api(page, 'GET', `/animales/${codigo}`)).status()).toBe(200)
  })

  test('HU_001 C2 · Solo se ofrecen los propósitos que corresponden al sexo', async ({ page }) => {
    await page.getByRole('button', { name: 'Macho', exact: true }).click()
    await expect(opcion(page, /^Engorde/)).toBeEnabled()
    await expect(opcion(page, /^Padrón/)).toBeEnabled()
    await expect(opcion(page, /^Leche/)).toBeDisabled()
    await page.getByRole('button', { name: 'Hembra', exact: true }).click()
    await expect(opcion(page, /^Engorde/)).toBeEnabled()
    await expect(opcion(page, /^Leche/)).toBeEnabled()
    await expect(opcion(page, /^Padrón/)).toBeDisabled()
  })

  test('HU_001 C3 · Si falta un dato obligatorio se señala el campo', async ({ page }) => {
    await page.getByRole('button', { name: 'Guardar animal' }).click()
    await expect(mensaje(page, 'err')).toContainText('Revisa los campos marcados.')
    await expect(page.getByText('Escribe el código de arete.')).toBeVisible()
    await expect(page.getByText('Elige el sexo.')).toBeVisible()
    await expect(page.getByText('Elige el propósito.')).toBeVisible()
    await expect(arete(page)).toHaveAttribute('aria-invalid', 'true')
  })

  test('HU_001 C4 · El arete duplicado se informa en pantalla', async ({ page }) => {
    await arete(page).fill('CO-0142')
    await page.getByRole('button', { name: 'Macho', exact: true }).click()
    await opcion(page, /^Engorde/).click()
    await page.getByRole('button', { name: 'Guardar animal' }).click()
    await expect(mensaje(page, 'err')).toContainText('El código de arete CO-0142 ya está registrado en la finca.')
  })

  test('HU_001 C6 · La fecha de nacimiento no puede ser posterior a hoy', async ({ page }) => {
    await arete(page).fill(unico('E'))
    await page.getByLabel('Fecha de nacimiento').fill(hoy(1))
    await page.getByRole('button', { name: 'Macho', exact: true }).click()
    await opcion(page, /^Engorde/).click()
    await page.getByRole('button', { name: 'Guardar animal' }).click()
    await expect(page.getByText('La fecha de nacimiento no puede ser posterior a hoy.').last()).toBeVisible()
  })
})

test.describe('Listado de animales (P06)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page)
    await page.goto('/animales')
  })

  test('HU_002 C1 · El listado muestra arete, nombre, sexo y propósito', async ({ page }) => {
    const fila = page.locator('tr', { hasText: 'CO-0142' })
    await expect(fila).toContainText('Lucero')
    await expect(fila).toContainText('Hembra')
    await expect(fila).toContainText('Leche')
    await expect(page.locator('thead')).toContainText('Arete')
    await expect(page.locator('thead')).toContainText('Propósito')
  })

  test('HU_002 C2 · Buscar por arete', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código de arete o nombre…').fill('CO-0142')
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.locator('tbody tr')).toContainText('Lucero')
  })

  test('HU_002 C3 · Filtrar por sexo y por propósito', async ({ page }) => {
    const filas = page.locator('tbody tr')
    await page.getByRole('button', { name: 'Macho', exact: true }).click()
    await expect(filas.first()).toBeVisible()
    for (const sexo of await filas.locator('td:nth-child(3)').allInnerTexts()) expect(sexo).toBe('Macho')
    await page.getByRole('button', { name: 'Todos' }).first().click()
    for (const [boton, texto] of [['Engorde', 'Engorde'], ['Leche', 'Leche'], ['Padrón', 'Padrón']]) {
      await page.getByRole('button', { name: boton, exact: true }).click()
      await expect(filas.first()).toBeVisible()
      for (const p of await filas.locator('td:nth-child(4)').allInnerTexts()) expect(p).toBe(texto)
    }
  })

  test('HU_002 C4 · Sin coincidencias se muestra «sin registros»', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código de arete o nombre…').fill('NO-EXISTE-999')
    await expect(page.locator('.vacio')).toHaveText('sin registros')
  })
})

test.describe('Página del animal (P08)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page)
  })

  test('HU_003 C2 · Sin fecha de nacimiento, la edad dice «sin registros»', async ({ page }) => {
    await page.goto('/animales/CO-0256')
    await expect(page.locator('.sub').first()).toContainText('Edad: sin registros')
  })

  test('HU_003 C3 · Animal inexistente', async ({ page }) => {
    await page.goto('/animales/CO-9999')
    await expect(mensaje(page, 'info')).toContainText('El animal CO-9999 no está registrado en la finca.')
  })

  test('HU_013 C1 · La página de una hembra muestra datos, sanidad, peso, partos y leche', async ({ page }) => {
    await page.goto('/animales')
    await page.locator('tr', { hasText: 'CO-0142' }).getByRole('button', { name: 'Abrir' }).click()
    await expect(page).toHaveURL(/\/animales\/CO-0142$/)
    await expect(page.locator('h1')).toHaveText('Lucero')
    await expect(page.locator('.sub').first()).toContainText('meses')
    for (const titulo of ['Historial sanitario', 'Peso', 'Partos y crías', 'Producción de leche']) {
      await expect(page.getByRole('heading', { name: titulo, exact: true })).toBeVisible()
    }
    await expect(page.getByRole('heading', { name: 'Actividades programadas' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Evolución de peso' })).toBeVisible()
  })

  test('HU_013 C2 · La página de un macho no muestra partos ni leche', async ({ page }) => {
    await page.goto('/animales/CO-0201')
    await expect(page.locator('h1')).toHaveText('Tormenta')
    await expect(page.getByRole('heading', { name: 'Historial sanitario' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Peso', exact: true })).toBeVisible()
    await expect(page.getByText('Los machos no tienen secciones de partos ni de leche.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Partos y crías' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Producción de leche' })).toHaveCount(0)
  })

  test('HU_013 C3 y HU_011 C2 · Secciones sin datos dicen «sin registros» y no hay gráfica inventada', async ({ page }) => {
    await page.goto('/animales/CO-0256')
    await expect(page.getByRole('heading', { name: 'Historial sanitario' })).toBeVisible()
    await expect(page.locator('.vacio')).toHaveCount(3)
    await expect(page.locator('.recharts-wrapper')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Evolución de peso' })).toHaveCount(0)
  })

  test('HU_013 C4 · Volver al listado', async ({ page }) => {
    await page.goto('/animales/CO-0142')
    await page.getByRole('link', { name: 'Volver al listado' }).click()
    await expect(page).toHaveURL(/\/animales$/)
    await expect(page.locator('h1')).toHaveText('Mis animales')
  })

  test('HU_011 C1 · La gráfica representa cada peso en su fecha', async ({ page }) => {
    await page.goto('/animales/CO-0231')
    await expect(page.locator('.recharts-wrapper')).toBeVisible()
    const tablaPesos = page.locator('table').filter({ has: page.locator('th', { hasText: 'Variación' }) })
    await expect(tablaPesos.locator('tbody tr').first()).toBeVisible()
    const filas = await tablaPesos.locator('tbody tr').count()
    expect(filas).toBe(4)
    await expect(page.locator('.recharts-line-dot')).toHaveCount(filas)
    for (const kg of ['238', '262', '289', '286']) {
      await expect(page.locator('.recharts-label-list')).toContainText(kg)
    }
    for (const dia of ['14/05', '14/08', '14/10', '14/11']) {
      await expect(page.locator('.recharts-wrapper')).toContainText(dia)
    }
  })
})

test.describe('Actualizar, eliminar y pasar a engorde (P16, P18)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page)
  })

  test('HU_004 C1 · Actualizar datos muestra la confirmación', async ({ page }) => {
    const codigo = unico('E')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await page.goto(`/animales/${codigo}`)
    await page.getByRole('link', { name: 'Editar' }).click()
    await expect(page.locator('h1')).toHaveText('Editar animal')
    await expect(page.getByLabel('Nombre').first()).toHaveValue('Prueba')
    await page.getByLabel('Nombre').first().fill('Relámpago')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Cambios guardados para ${codigo} Relámpago.`)
  })

  test('HU_004 C3 · Arete ocupado: se conserva el anterior', async ({ page }) => {
    const codigo = unico('E')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await page.goto(`/animales/${codigo}/editar`)
    await expect(arete(page)).toHaveValue(codigo)
    await arete(page).fill('CO-0142')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(mensaje(page, 'err')).toContainText(`Se conserva el arete ${codigo}`)
  })

  test('HU_004 C4 · Al cambiar el sexo se pide elegir de nuevo el propósito', async ({ page }) => {
    const codigo = unico('E')
    await crearAnimal(page, codigo, 'MACHO', 'PADRON')
    await page.goto(`/animales/${codigo}/editar`)
    await expect(opcion(page, /^Padrón/)).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Hembra', exact: true }).click()
    await expect(mensaje(page, 'info')).toContainText('Cambiaste el sexo. Elige de nuevo el propósito: engorde o leche.')
    await expect(opcion(page, /^Padrón/)).toBeDisabled()
    await expect(page.locator('button.opcion[aria-pressed="true"]')).toHaveCount(0)
    await expect(page.getByText('Antes: Macho')).toBeVisible()
  })

  test('HU_005 C1 · Eliminar un animal sin historial pide confirmación y lo elimina', async ({ page }) => {
    const codigo = unico('E')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await page.goto(`/animales/${codigo}`)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    const dialogo = page.getByRole('dialog', { name: `¿Eliminar el animal ${codigo}?` })
    await expect(dialogo).toContainText('Esta acción no se puede deshacer.')
    await dialogo.getByRole('button', { name: 'Sí, eliminar' }).click()
    await expect(page).toHaveURL(/\/animales$/)
    expect((await api(page, 'GET', `/animales/${codigo}`)).status()).toBe(404)
  })

  test('HU_005 C2 · Cancelar la confirmación conserva el animal', async ({ page }) => {
    const codigo = unico('E')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await page.goto(`/animales/${codigo}`)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`/animales/${codigo}$`))
    expect((await api(page, 'GET', `/animales/${codigo}`)).status()).toBe(200)
  })

  test('HU_005 C3 · Con historial no se elimina y se dice qué registros tiene', async ({ page }) => {
    await page.goto('/animales/CO-0142')
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await page.getByRole('button', { name: 'Sí, eliminar' }).click()
    const aviso = page.getByRole('dialog', { name: 'No se pudo completar' })
    await expect(aviso).toContainText('No se puede eliminar Lucero')
    await expect(aviso).toContainText('registros sanitarios')
    await expect(aviso).toContainText('registros de leche')
    await aviso.getByRole('button', { name: 'Entendido' }).click()
    await expect(page.locator('h1')).toHaveText('Lucero')
  })

  test('HU_015 C1 · Pasar a engorde con confirmación; conserva el historial', async ({ page }) => {
    const codigo = unico('E')
    await crearAnimal(page, codigo, 'HEMBRA', 'LECHE', 'Perla')
    await crear(page, `/animales/${codigo}/pesos`, { pesoKg: 380, fechaMedicion: hoy() })
    await page.goto(`/animales/${codigo}`)
    await page.getByRole('button', { name: 'Pasar a engorde' }).click()
    const dialogo = page.getByRole('dialog', { name: '¿Pasar a Perla a engorde?' })
    await expect(dialogo).toContainText('Después del cambio ya no se podrá registrar su leche.')
    await dialogo.getByRole('button', { name: 'Confirmar cambio' }).click()
    await expect(mensaje(page, 'ok')).toContainText('Perla ahora es de engorde y conserva todo su historial.')
    await expect(page.locator('.tag', { hasText: 'Engorde' }).first()).toBeVisible()
    await expect(page.getByText('380 kg').first()).toBeVisible()
  })

  test('HU_015 C3 · Un animal de engorde no ofrece cambio de propósito', async ({ page }) => {
    await page.goto('/animales/CO-0163')
    await expect(page.locator('h1')).toHaveText('Rayo')
    await expect(page.getByRole('button', { name: 'Pasar a engorde' })).toHaveCount(0)
    await expect(page.getByText('Ya es de engorde: no tiene cambios de propósito.')).toBeVisible()
  })
})

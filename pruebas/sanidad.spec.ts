import { expect, test } from '@playwright/test'
import { ADMIN, crear, crearAnimal, entrar, fincaNueva, hoy, legible, mensaje, unico } from './ayudas'

// Criterios de HU_006 a HU_009 que se comprueban en pantalla (P09 Sanidad y P08 página del animal).

test.describe('Control sanitario (P09)', () => {
  test('HU_006 C1 · Registrar una enfermedad realizada muestra la confirmación', async ({ page }) => {
    await entrar(page, ADMIN)
    const codigo = unico('S')
    await crearAnimal(page, codigo, 'HEMBRA', 'ENGORDE')
    await page.goto('/sanidad')
    await page.getByRole('button', { name: 'Enfermedad', exact: true }).click()
    await page.getByLabel('Animal').selectOption(codigo)
    await page.getByLabel('Descripción').fill('Cojera')
    await page.getByLabel('Observaciones').fill('Pata trasera')
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Enfermedad «Cojera» guardada como realizada para ${codigo}.`)
  })

  test('HU_006 C2 · Sin animal seleccionado no se guarda', async ({ page }) => {
    await entrar(page, ADMIN)
    await page.goto('/sanidad')
    await page.getByLabel('Descripción').fill('Rabia')
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(page.getByText('Debes seleccionar un animal registrado.')).toBeVisible()
    await expect(mensaje(page, 'err')).toContainText('Revisa los campos marcados.')
  })

  test('HU_008 C1 y C2 · Programar una actividad; no se acepta una fecha pasada', async ({ page }) => {
    await entrar(page, ADMIN)
    const codigo = unico('S')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await page.goto('/sanidad')
    await page.getByLabel('Animal').selectOption(codigo)
    await page.getByLabel('Descripción').fill('Refuerzo carbón')
    await page.getByRole('button', { name: 'Programar para después' }).click()
    await page.getByLabel('Fecha programada').fill(hoy(-1))
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(page.getByText('La fecha programada no puede ser anterior a hoy.').first()).toBeVisible()
    await page.getByLabel('Fecha programada').fill(hoy(5))
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Vacuna «Refuerzo carbón» programada para el ${legible(hoy(5))} para ${codigo}.`)
    await expect(page.locator('tr', { hasText: codigo })).toContainText('Refuerzo carbón')
  })

  test('HU_008 C3 · Marcar como realizada conserva la fecha programada', async ({ page }) => {
    await entrar(page, ADMIN)
    const codigo = unico('S')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await crear(page, `/sanitario/animales/${codigo}/programadas`, { tipo: 'TRATAMIENTO', descripcion: 'Purga', fechaProgramada: hoy(2) })
    await page.goto('/sanidad')
    await page.locator('tr', { hasText: codigo }).getByRole('button', { name: 'Marcar realizada' }).click()
    await expect(page.locator('label.campo', { hasText: 'Se conserva.' }).locator('input')).toHaveValue(legible(hoy(2)))
    await expect(page.getByText('Se conserva.')).toBeVisible()
    await page.getByRole('button', { name: 'Guardar como realizada' }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Tratamiento «Purga» de ${codigo} marcada como realizada el ${legible(hoy())}.`)
    await expect(page.locator('tr', { hasText: codigo })).toHaveCount(0)
    await page.goto(`/animales/${codigo}`)
    await expect(page.locator('tr', { hasText: 'Purga' })).toContainText(legible(hoy()))
  })

  test('HU_009 C1 · Las próximas actividades dependen del número de días', async ({ page }) => {
    await entrar(page)
    const codigo = unico('S')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await crear(page, `/sanitario/animales/${codigo}/programadas`, { tipo: 'VACUNA', descripcion: 'En diez días', fechaProgramada: hoy(10) })
    await page.goto('/sanidad')
    const proximos = page.locator('.card', { has: page.getByRole('heading', { name: 'Próximas actividades' }) })
    const dias = proximos.locator('input[type=number]')
    await dias.fill('5')
    await expect(proximos.locator('tr', { hasText: codigo })).toHaveCount(0)
    await dias.fill('15')
    await expect(proximos.locator('tr', { hasText: codigo })).toContainText('En diez días')
  })

  test('HU_009 C2 · Las pendientes vencidas se muestran aparte', async ({ page }) => {
    await entrar(page)
    await page.goto('/sanidad')
    const pendientes = page.locator('.card', { has: page.getByRole('heading', { name: 'Pendientes vencidas' }) })
    await expect(pendientes.locator('tr', { hasText: 'CO-0188' })).toContainText('Aftosa')
    await expect(pendientes.locator('tr', { hasText: 'CO-0240' })).toContainText('Vitaminas')
  })

  test('HU_009 C3 · Sin actividades se muestra «sin registros»', async ({ page }) => {
    await fincaNueva(page, 'Finca Sin Actividades')
    await page.goto('/sanidad')
    await expect(page.locator('.vacio')).toHaveCount(2)
    await expect(page.locator('.vacio').first()).toHaveText('sin registros')
  })
})

test.describe('Historial sanitario en la página del animal (P08)', () => {
  test('HU_007 C1 y C2 · Historial ordenado y filtrado por tipo', async ({ page }) => {
    await entrar(page)
    const codigo = unico('S')
    await crearAnimal(page, codigo, 'HEMBRA', 'ENGORDE')
    await crear(page, `/sanitario/animales/${codigo}/eventos`, { tipo: 'VACUNA', descripcion: 'Aftosa', fechaRealizacion: hoy(-30) })
    await crear(page, `/sanitario/animales/${codigo}/eventos`, { tipo: 'ENFERMEDAD', descripcion: 'Diarrea', fechaRealizacion: hoy(-10) })
    await crear(page, `/sanitario/animales/${codigo}/eventos`, { tipo: 'TRATAMIENTO', descripcion: 'Suero', fechaRealizacion: hoy(-9) })
    await page.goto(`/animales/${codigo}`)
    const tabla = page.locator('.card', { has: page.getByRole('heading', { name: 'Historial sanitario' }) }).locator('table').first()
    await expect(tabla.locator('tbody tr')).toHaveCount(3)
    await expect(tabla.locator('tbody tr').first()).toContainText('Suero')
    await expect(tabla.locator('tbody tr').last()).toContainText('Aftosa')
    for (const [chip, visible] of [['Vacunas', 'Aftosa'], ['Enfermedades', 'Diarrea'], ['Tratamientos', 'Suero']]) {
      await page.getByRole('button', { name: chip, exact: true }).click()
      await expect(tabla.locator('tbody tr')).toHaveCount(1)
      await expect(tabla.locator('tbody tr')).toContainText(visible)
    }
  })

  test('HU_007 C3 y C4 · Las programadas van aparte y un filtro sin datos dice «sin registros»', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales/CO-0142')
    const tarjeta = page.locator('.card', { has: page.getByRole('heading', { name: 'Historial sanitario' }) })
    await expect(tarjeta.locator('table').first()).not.toContainText('Brucelosis')
    await expect(tarjeta.locator('tr', { hasText: 'Brucelosis' })).toContainText('Vencida')
    await page.getByRole('button', { name: 'Tratamientos', exact: true }).click()
    await expect(tarjeta.locator('.vacio').first()).toHaveText('sin registros')
  })
})

import { expect, test, type Page } from '@playwright/test'
import { ADMIN, crear, crearAnimal, entrar, hoy, legible, mensaje, unico } from './ayudas'

// Criterios de HU_010 (peso), HU_016 y HU_017 (partos) y HU_018 y HU_019 (leche) que se comprueban en pantalla.

const tarjeta = (page: Page, titulo: string) => page.locator('.card').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) })

async function vacaConParto(page: Page, codigo: string, dias: number) {
  await crearAnimal(page, codigo, 'HEMBRA', 'LECHE', 'Vaca de prueba')
  await crear(page, '/partos', { codigoAreteMadre: codigo, fecha: hoy(-dias), crias: [] })
}

test.describe('Peso (P10)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, ADMIN)
  })

  test('HU_010 C1 · Registrar una medición muestra la confirmación y la variación', async ({ page }) => {
    const codigo = unico('P')
    await crearAnimal(page, codigo, 'MACHO', 'ENGORDE')
    await crear(page, `/animales/${codigo}/pesos`, { pesoKg: 300, fechaMedicion: hoy(-30) })
    await page.goto(`/registros?arete=${codigo}`)
    const peso = tarjeta(page, 'Peso')
    await expect(peso.getByLabel('Animal')).toHaveValue(codigo)
    await peso.getByLabel('Peso (kg)').fill('305.5')
    await peso.getByRole('button', { name: 'Guardar peso' }).click()
    await expect(peso.locator('.msg.ok')).toContainText(`Peso guardado para ${codigo}: 305,5 kg (+5,5 kg).`)
  })

  test('HU_010 C2 · Peso cero, sin animal o con fecha futura: se señala qué corregir', async ({ page }) => {
    await page.goto('/registros')
    const peso = tarjeta(page, 'Peso')
    await peso.getByLabel('Peso (kg)').fill('0')
    await peso.getByLabel('Fecha de medición').fill(hoy(1))
    await peso.getByRole('button', { name: 'Guardar peso' }).click()
    await expect(peso.getByText('Debes seleccionar un animal registrado.')).toBeVisible()
    await expect(peso.getByText('El peso debe ser mayor que cero.')).toBeVisible()
    await expect(peso.getByText('La fecha de medición no puede ser posterior a hoy.')).toBeVisible()
    await expect(peso.locator('.msg.err')).toContainText('Revisa los campos marcados.')
  })

  test('HU_010 C3 · El historial muestra la ganancia o pérdida respecto a la medición anterior', async ({ page }) => {
    await page.goto('/animales/CO-0231')
    const filas = page.locator('table').filter({ has: page.locator('th', { hasText: 'Variación' }) }).locator('tbody tr')
    await expect(filas).toHaveCount(4)
    await expect(filas.nth(0)).toContainText('—')
    await expect(filas.nth(1)).toContainText('+24 kg')
    await expect(filas.nth(2)).toContainText('+27 kg')
    await expect(filas.nth(3)).toContainText('−3 kg')
  })
})

test.describe('Partos y crías (P11, P20, P08)', () => {
  test('HU_016 C1 y C2 · Parto con una cría; el propósito de la cría depende de su sexo', async ({ page }) => {
    await entrar(page, ADMIN)
    const madre = unico('M')
    const cria = unico('C')
    await crearAnimal(page, madre, 'HEMBRA', 'LECHE', 'Madre')
    await page.goto(`/partos/nuevo?arete=${madre}`)
    await expect(page.getByLabel('Madre (hembra registrada)')).toHaveValue(madre)
    await page.getByRole('button', { name: 'Agregar cría' }).click()
    const proposito = page.getByLabel('Propósito')
    await expect(proposito).toBeDisabled()
    await page.getByLabel('Arete').fill(cria)
    await page.getByRole('button', { name: 'Macho', exact: true }).click()
    await expect(proposito.locator('option')).toHaveText(['Elige…', 'Engorde', 'Padrón'])
    await page.getByRole('button', { name: 'Hembra', exact: true }).click()
    await expect(proposito.locator('option')).toHaveText(['Elige…', 'Engorde', 'Leche'])
    await proposito.selectOption('LECHE')
    await page.getByRole('button', { name: 'Guardar parto y crías' }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Parto guardado. ${cria} quedó asociada a ${madre}.`)
    await page.goto(`/animales/${cria}`)
    await expect(page.locator('.sub').first()).toContainText(`Nació el ${legible(hoy())}`)
  })

  test('HU_016 C4 · Parto sin crías', async ({ page }) => {
    await entrar(page, ADMIN)
    const madre = unico('M')
    await crearAnimal(page, madre, 'HEMBRA', 'LECHE')
    await page.goto(`/partos/nuevo?arete=${madre}`)
    await page.getByRole('button', { name: 'Guardar parto', exact: true }).click()
    await expect(mensaje(page, 'ok')).toContainText(`Parto del ${legible(hoy())} guardado sin crías para ${madre}.`)
    await page.goto(`/animales/${madre}`)
    await expect(page.getByText('Parto sin crías registradas')).toBeVisible()
  })

  test('HU_016 C6 · Fecha de parto futura', async ({ page }) => {
    await entrar(page, ADMIN)
    await page.goto('/partos/nuevo?arete=CO-0174')
    await page.getByLabel('Fecha del parto').fill(hoy(1))
    await page.getByRole('button', { name: 'Guardar parto', exact: true }).click()
    await expect(page.getByText('La fecha del parto no puede ser posterior a hoy.')).toBeVisible()
  })

  test('HU_017 C1 · Historial reproductivo: partos con sus crías', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales/CO-0142')
    const partos = tarjeta(page, 'Partos y crías')
    await expect(partos).toContainText('18/02/2025')
    await expect(partos).toContainText('10/05/2023')
    await expect(partos.getByRole('link', { name: 'CO-0231' })).toBeVisible()
    await expect(partos.getByRole('link', { name: 'CO-0188' })).toBeVisible()
    await expect(partos).toContainText('Tizón · Macho')
    await expect(partos).toContainText('Canela · Hembra')
    const texto = await partos.innerText()
    expect(texto.indexOf('18/02/2025')).toBeLessThan(texto.indexOf('10/05/2023'))
  })

  test('HU_017 C2 · Vaca sin partos: «sin registros»', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales/CO-0249')
    await expect(tarjeta(page, 'Partos y crías').locator('.vacio')).toHaveText('sin registros')
  })
})

test.describe('Leche (P10, P21, P08)', () => {
  test('HU_018 C1 · Registrar la leche del día en el parto más reciente', async ({ page }) => {
    await entrar(page, ADMIN)
    const codigo = unico('V')
    await vacaConParto(page, codigo, 400)
    await crear(page, '/partos', { codigoAreteMadre: codigo, fecha: hoy(-20), crias: [] })
    await page.goto(`/registros?arete=${codigo}`)
    const leche = tarjeta(page, 'Leche del día')
    const parto = leche.locator('label.campo', { hasText: /^Parto/ }).locator('select')
    await expect(parto).toHaveValue(hoy(-20))
    await expect(parto.locator('option').first()).toContainText('(más reciente)')
    await leche.getByLabel('Litros').fill('18.5')
    await leche.getByRole('button', { name: 'Guardar leche' }).click()
    await expect(leche.locator('.msg.ok')).toContainText(`Leche del ${legible(hoy())} guardada: 18,5 litros para ${codigo}.`)
  })

  test('HU_018 C2 · El mismo día no se registra dos veces y no se aceptan litros en cero', async ({ page }) => {
    await entrar(page, ADMIN)
    const codigo = unico('V')
    await vacaConParto(page, codigo, 10)
    await crear(page, '/leche', { codigoArete: codigo, fecha: hoy(), litros: 12 })
    await page.goto(`/registros?arete=${codigo}`)
    const leche = tarjeta(page, 'Leche del día')
    await leche.getByLabel('Litros').fill('0')
    await leche.getByRole('button', { name: 'Guardar leche' }).click()
    await expect(leche.getByText('Los litros deben ser mayores que cero.')).toBeVisible()
    await leche.getByLabel('Litros').fill('14')
    await leche.getByRole('button', { name: 'Guardar leche' }).click()
    await expect(leche.locator('.msg.err')).toContainText(`La leche del ${legible(hoy())} ya está registrada para`)
    await leche.getByLabel('Fecha').fill(hoy(-11))
    await leche.getByRole('button', { name: 'Guardar leche' }).click()
    await expect(leche.getByText(`La fecha no puede ser anterior al parto (${legible(hoy(-10))}).`)).toBeVisible()
  })

  test('HU_018 C3 · Vaca sin partos: se explica el motivo y no se puede guardar', async ({ page }) => {
    await entrar(page, ADMIN)
    const codigo = unico('V')
    await crearAnimal(page, codigo, 'HEMBRA', 'LECHE')
    await page.goto(`/registros?arete=${codigo}`)
    const leche = tarjeta(page, 'Leche del día')
    await expect(leche.locator('.msg.err')).toContainText(`No se puede registrar leche de ${codigo}: no tiene partos registrados.`)
    await expect(leche.getByRole('button', { name: 'Guardar leche' })).toBeDisabled()
  })

  test('HU_018 C3 · Una hembra de engorde no aparece entre las vacas de leche', async ({ page }) => {
    await entrar(page, ADMIN)
    await page.goto('/registros')
    const vacas = tarjeta(page, 'Leche del día').getByLabel('Vaca de leche')
    await expect(vacas.locator('option', { hasText: 'CO-0105' })).toHaveCount(1)
    const opciones = await vacas.locator('option').allInnerTexts()
    expect(opciones.some((o) => o.startsWith('CO-0240'))).toBe(false)
    expect(opciones.some((o) => o.startsWith('CO-0142'))).toBe(true)
  })

  test('HU_019 C1 y C2 · La semana tiene siete días y el promedio solo cuenta los días con registro', async ({ page }) => {
    await entrar(page)
    const codigo = unico('V')
    await vacaConParto(page, codigo, 30)
    // Lunes de esta semana (hora de Colombia) hasta hoy, un día sí y otro no, más hoy.
    const diaSemana = (new Date(`${hoy()}T12:00:00Z`).getUTCDay() + 6) % 7
    const dias = new Set<number>([0])
    for (let d = 0; d <= diaSemana; d += 2) dias.add(d)
    dias.add(diaSemana)
    const litros: number[] = []
    for (const d of [...dias].sort()) {
      const l = 18 + d
      litros.push(l)
      await crear(page, '/leche', { codigoArete: codigo, fecha: hoy(d - diaSemana), litros: l })
    }
    const promedio = Math.round((litros.reduce((a, b) => a + b, 0) / litros.length) * 10) / 10
    await page.goto(`/animales/${codigo}`)
    const leche = tarjeta(page, 'Producción de leche')
    await expect(leche.locator('[title]')).toHaveCount(7)
    await expect(leche.locator('[title*="sin registro"]')).toHaveCount(7 - litros.length)
    await expect(leche.locator('.msg.ok')).toContainText(`Promedio: ${String(promedio).replace('.', ',')} litros por día`)
    await expect(leche.locator('.msg.ok')).toContainText(`${litros.length} ${litros.length === 1 ? 'día' : 'días'} con registro. Los días sin registro no se cuentan.`)
  })

  test('HU_019 C3 · Promedio por semana, mes y parto', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales/CO-0142')
    const leche = tarjeta(page, 'Producción de leche')
    for (const [chip, texto] of [['Mes', 'promedio mes'], ['Parto', 'promedio parto'], ['Semana', 'promedio semana']]) {
      await leche.getByRole('button', { name: chip, exact: true }).click()
      await expect(page.getByText(texto, { exact: true })).toBeVisible()
    }
    await leche.getByRole('button', { name: 'Parto', exact: true }).click()
    await expect(leche.locator('.msg.ok')).toContainText('días con registro')
  })

  test('HU_019 C4 · Periodo sin registros: no se calcula promedio', async ({ page }) => {
    await entrar(page)
    await page.goto('/animales/CO-0174')
    const leche = tarjeta(page, 'Producción de leche')
    await expect(leche.locator('.vacio')).toHaveText('sin registros')
    await expect(leche.locator('.msg.ok')).toHaveCount(0)
  })
})

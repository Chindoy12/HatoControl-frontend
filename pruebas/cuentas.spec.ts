import { expect, test } from '@playwright/test'
import { ADMIN, GANADERO, OTRA_FINCA, api, crear, entrar, fincaNueva, mensaje, unico } from './ayudas'

// Criterios de HU_012 (dashboard), HU_014 (reportes) y HU_020 a HU_024 (fincas, cuentas y acceso) en pantalla.

test.describe('Registrar finca (P03)', () => {
  test('HU_020 C1 · Registrar una finca nueva deja al ganadero dentro', async ({ page }) => {
    const correo = `${unico('r').toLowerCase()}@prueba.example`
    await page.goto('/registro')
    await page.getByLabel('Nombre de la finca').fill('El Porvenir')
    await page.getByLabel('Tu nombre').fill('Rosa')
    await page.getByLabel('Correo electrónico').fill(correo)
    await page.getByLabel('Contraseña (10 a 12 caracteres)').fill('Porvenir26')
    await page.getByRole('button', { name: 'Crear finca y cuenta' }).click()
    await page.waitForURL('**/inicio')
    await expect(page.locator('.quien')).toContainText('Rosa')
    await expect(page.locator('.quien')).toContainText('Ganadero · Finca El Porvenir')
  })

  test('HU_020 C2 · Correo ya registrado', async ({ page }) => {
    await page.goto('/registro')
    await page.getByLabel('Nombre de la finca').fill('Repetida')
    await page.getByLabel('Tu nombre').fill('Otro')
    await page.getByLabel('Correo electrónico').fill(ADMIN)
    await page.getByLabel('Contraseña (10 a 12 caracteres)').fill('Repetida26')
    await page.getByRole('button', { name: 'Crear finca y cuenta' }).click()
    await expect(mensaje(page, 'err')).toContainText('El correo ya está registrado.')
    await expect(page).toHaveURL(/\/registro$/)
  })

  test('HU_020 C3 · Datos incompletos: se dice qué corregir', async ({ page }) => {
    await page.goto('/registro')
    await page.getByLabel('Contraseña (10 a 12 caracteres)').fill('corta')
    await page.getByRole('button', { name: 'Crear finca y cuenta' }).click()
    await expect(page.getByText('Escribe el nombre de la finca.')).toBeVisible()
    await expect(page.getByText('Escribe tu nombre.')).toBeVisible()
    await expect(page.getByText('Escribe tu correo.')).toBeVisible()
    await expect(page.getByText('La contraseña debe tener entre 10 y 12 caracteres.')).toBeVisible()
    await expect(mensaje(page, 'err')).toContainText('Revisa los campos marcados.')
  })

  test('HU_020 C4 · El contador indica los caracteres que faltan o quedan', async ({ page }) => {
    await page.goto('/registro')
    const clave = page.getByLabel('Contraseña (10 a 12 caracteres)')
    await clave.fill('abcdef')
    await expect(page.getByText('Faltan 4 caracteres para el mínimo')).toBeVisible()
    await clave.fill('abcdefghij')
    await expect(page.getByText('Puedes escribir 2 caracteres más')).toBeVisible()
    await clave.fill('abcdefghijkl')
    await expect(page.getByText('Llegaste al máximo de 12 caracteres')).toBeVisible()
  })

  test('HU_020 C5 · No se pueden escribir más de 12 caracteres', async ({ page }) => {
    await page.goto('/registro')
    const clave = page.getByLabel('Contraseña (10 a 12 caracteres)')
    await clave.click()
    await page.keyboard.type('abcdefghijklmn')
    await expect(clave).toHaveValue('abcdefghijkl')
    await expect(clave).toHaveAttribute('type', 'password')
  })
})

test.describe('Iniciar y cerrar sesión (P02)', () => {
  test('HU_021 C1 · Con datos correctos entra a las funciones de su tipo', async ({ page }) => {
    await entrar(page)
    await expect(page.locator('.quien')).toContainText('Ganadero · Finca La Esperanza')
    await expect(page.locator('nav.menu')).toContainText('Dashboard')
  })

  test('HU_021 C2 · Datos incorrectos: no dice cuál falló', async ({ page }) => {
    await page.goto('/ingresar')
    await page.locator('input[type=email]').fill(GANADERO)
    await page.locator('input[type=password]').fill('NoEsLaClave1')
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
    await expect(mensaje(page, 'err')).toHaveText('El correo o la contraseña no son correctos.')
    await expect(page).toHaveURL(/\/ingresar$/)
    // Secuencia 08: la contraseña se borra del formulario; el correo se conserva.
    await expect(page.locator('input[type=password]')).toHaveValue('')
    await expect(page.locator('input[type=email]')).toHaveValue(GANADERO)
  })

  test('HU_021 C3 · Cuenta desactivada', async ({ page, browser }) => {
    await entrar(page)
    const correo = `${unico('d').toLowerCase()}@laesperanza.example`
    await crear(page, '/cuentas/administradores', { nombre: 'Desactivado', correo, contrasena: 'Inicial2026' })
    expect((await api(page, 'POST', '/cuentas/administradores/desactivacion', { correo })).status()).toBe(204)
    const otro = await (await browser.newContext()).newPage()
    await otro.goto('/ingresar')
    await otro.locator('input[type=email]').fill(correo)
    await otro.locator('input[type=password]').fill('Inicial2026')
    await otro.getByRole('button', { name: 'Ingresar', exact: true }).click()
    await expect(otro.locator('.msg.err')).toContainText('Tu cuenta está desactivada.')
  })

  test('HU_021 C4 · Al cerrar sesión vuelve al ingreso y no muestra información', async ({ page }) => {
    await entrar(page)
    await page.getByRole('button', { name: 'Salir' }).click()
    await page.waitForURL('**/ingresar')
    await expect(mensaje(page, 'ok')).toContainText('Cerraste sesión.')
    for (const ruta of ['/animales', '/animales/CO-0142', '/dashboard']) {
      await page.goto(ruta)
      await expect(page).toHaveURL(/\/ingresar$/)
    }
    expect((await api(page, 'GET', '/animales')).status()).toBe(401)
  })
})

test.describe('Permisos y fincas (HU_022)', () => {
  test('HU_022 C1 · El administrador no ve Dashboard ni Administradores', async ({ page }) => {
    await entrar(page, ADMIN)
    const menu = page.locator('nav.menu')
    await expect(menu.getByRole('link')).toHaveText(['Inicio', 'Animales', 'Sanidad', 'Reportes'])
    await expect(page.getByRole('link', { name: 'Ver dashboard' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Gestionar' })).toHaveCount(0)
  })

  test('HU_022 C3 · Si el administrador escribe la dirección, se le niega y no cambia nada', async ({ page }) => {
    await entrar(page, ADMIN)
    for (const ruta of ['/dashboard', '/administradores']) {
      await page.goto(ruta)
      await expect(page.getByRole('heading', { name: 'Opción solo del ganadero' })).toBeVisible()
      await expect(mensaje(page, 'err')).toHaveText('No tienes permiso para esta opción. No se cambió ningún dato.')
    }
  })

  test('HU_022 C4 · Cada finca ve solo sus animales', async ({ page }) => {
    await entrar(page, OTRA_FINCA)
    await page.goto('/animales')
    await expect(page.locator('tbody')).toContainText('RS-0001')
    await expect(page.locator('tbody')).not.toContainText('CO-0142')
    await page.goto('/animales/CO-0142')
    await expect(mensaje(page, 'info')).toContainText('no está registrado en la finca')
  })
})

test.describe('Gestionar administradores (P14, P23)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page)
    await page.goto('/administradores')
  })

  test('HU_023 C1 y C3 · Crear un administrador y verlo en la lista', async ({ page }) => {
    const correo = `${unico('a').toLowerCase()}@laesperanza.example`
    await page.getByRole('button', { name: 'Crear administrador' }).click()
    const dialogo = page.getByRole('dialog', { name: 'Crear administrador' })
    await dialogo.getByLabel('Nombre').fill('Lina')
    await dialogo.getByLabel('Correo').fill(correo)
    await dialogo.getByLabel('Contraseña inicial').fill('Inicial2026')
    await dialogo.getByRole('button', { name: 'Crear cuenta' }).click()
    await expect(dialogo.locator('.msg.ok')).toContainText('Cuenta de Lina creada. Ya puede iniciar sesión.')
    await dialogo.getByRole('button', { name: 'Cancelar' }).click()
    const fila = page.locator('tr', { hasText: correo })
    await expect(fila).toContainText('Lina')
    await expect(fila).toContainText('Activa')
    await expect(page.locator('thead')).toContainText('Estado')
  })

  test('HU_023 C2 · Correo ya registrado', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear administrador' }).click()
    const dialogo = page.getByRole('dialog', { name: 'Crear administrador' })
    await dialogo.getByLabel('Nombre').fill('Otra')
    await dialogo.getByLabel('Correo').fill(OTRA_FINCA)
    await dialogo.getByLabel('Contraseña inicial').fill('Inicial2026')
    await dialogo.getByRole('button', { name: 'Crear cuenta' }).click()
    await expect(dialogo.locator('.msg.err')).toContainText('El correo ya está registrado.')
  })

  test('HU_023 C4 · Desactivar pide confirmación', async ({ page }) => {
    const correo = `${unico('a').toLowerCase()}@laesperanza.example`
    await crear(page, '/cuentas/administradores', { nombre: 'Mateo', correo, contrasena: 'Inicial2026' })
    await page.reload()
    await page.locator('tr', { hasText: correo }).getByRole('button', { name: 'Desactivar' }).click()
    const dialogo = page.getByRole('dialog', { name: '¿Desactivar a Mateo?' })
    await expect(dialogo).toContainText('Los registros que hizo se conservan.')
    await dialogo.getByRole('button', { name: 'Sí, desactivar' }).click()
    await expect(mensaje(page, 'ok')).toContainText('Mateo ya no puede iniciar sesión. Los registros que hizo se conservan.')
    await expect(page.locator('tr', { hasText: correo })).toContainText('Desactivada')
  })

  test('HU_023 C5 · Restablecer la contraseña con su contador', async ({ page }) => {
    const correo = `${unico('a').toLowerCase()}@laesperanza.example`
    await crear(page, '/cuentas/administradores', { nombre: 'Ana', correo, contrasena: 'Inicial2026' })
    await page.reload()
    await page.locator('tr', { hasText: correo }).getByRole('button', { name: 'Restablecer contraseña' }).click()
    const dialogo = page.getByRole('dialog', { name: 'Restablecer contraseña de Ana' })
    await dialogo.locator('input[type=password]').fill('Nueva12')
    await expect(dialogo).toContainText('Faltan 3 caracteres para el mínimo')
    await dialogo.getByRole('button', { name: 'Guardar contraseña' }).click()
    await expect(dialogo).toContainText('La contraseña debe tener entre 10 y 12 caracteres.')
    await dialogo.locator('input[type=password]').fill('Nueva1234567')
    await dialogo.getByRole('button', { name: 'Guardar contraseña' }).click()
    await expect(mensaje(page, 'ok')).toContainText('Ana ya puede entrar con la contraseña nueva. La anterior dejó de funcionar.')
  })
})

test.describe('Recuperar contraseña (P04)', () => {
  test('HU_024 C1 y C4 · La solicitud responde lo mismo para cualquier correo', async ({ page }) => {
    const textos: string[] = []
    for (const correo of [GANADERO, ADMIN]) {
      await page.goto('/recuperar')
      await page.locator('input[type=email]').fill(correo)
      await page.getByRole('button', { name: 'Enviar enlace' }).click()
      await expect(mensaje(page, 'ok')).toContainText('Vence en 30 minutos.')
      textos.push(await mensaje(page, 'ok').innerText())
    }
    expect(textos[0]).toBe(textos[1])
  })

  test('HU_024 C3 · Un enlace vencido o usado pide solicitar uno nuevo', async ({ page }) => {
    await page.goto('/recuperar/enlace-que-no-existe')
    await page.getByLabel('Nueva contraseña').fill('Nueva123456')
    await page.getByLabel('Repite la contraseña').fill('Nueva123456')
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()
    await expect(mensaje(page, 'err')).toContainText('El enlace venció o ya se usó. Solicita un enlace nuevo.')
    await expect(page.getByRole('link', { name: 'Solicitar un enlace nuevo' })).toBeVisible()
  })

  test('HU_024 C2 · Las dos contraseñas deben coincidir', async ({ page }) => {
    await page.goto('/recuperar/cualquiera')
    await page.getByLabel('Nueva contraseña').fill('Nueva123456')
    await page.getByLabel('Repite la contraseña').fill('Nueva1234567')
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()
    await expect(page.getByText('Las dos contraseñas no son iguales.')).toBeVisible()
  })
})

test.describe('Dashboard (P12) y reportes (P13, P24)', () => {
  test('HU_012 C1 · El dashboard muestra el resumen, las actividades y el último peso', async ({ page }) => {
    await entrar(page)
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toHaveText('Resumen de la finca')
    await expect(page.locator('.kpi')).toHaveCount(4)
    const actividades = page.locator('.card', { has: page.getByRole('heading', { name: 'Actividades próximas y pendientes' }) })
    await expect(actividades.locator('tr', { hasText: 'CO-0188' })).toContainText('Vencida')
    const pesos = page.locator('.card', { has: page.getByRole('heading', { name: 'Último peso por animal' }) })
    await expect(pesos.locator('tr', { hasText: 'CO-0231' })).toContainText('286 kg')
  })

  test('HU_012 C2 · Una vacuna programada no se cuenta como realizada', async ({ page }) => {
    await fincaNueva(page, 'Finca Conteo')
    await crear(page, '/animales', { codigoArete: 'K-1', sexo: 'HEMBRA', proposito: 'ENGORDE' })
    await crear(page, '/sanitario/animales/K-1/eventos', { tipo: 'VACUNA', descripcion: 'Aftosa', fechaRealizacion: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) })
    const manana = new Date(Date.now() + 2 * 864e5).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    await crear(page, '/sanitario/animales/K-1/programadas', { tipo: 'VACUNA', descripcion: 'Brucelosis', fechaProgramada: manana })
    await page.goto('/dashboard')
    const vacunas = page.locator('.card', { hasText: 'vacunas realizadas' }).locator('.kpi')
    await expect(vacunas).toHaveText('1')
    await expect(page.locator('tr', { hasText: 'Brucelosis' })).toContainText('Próxima')
  })

  test('HU_012 C3 · Secciones sin datos dicen «sin registros»', async ({ page }) => {
    await fincaNueva(page, 'Finca Vacía')
    await page.goto('/dashboard')
    await expect(page.locator('.vacio')).toHaveCount(2)
    for (const kpi of await page.locator('.kpi').allInnerTexts()) expect(kpi).toBe('0')
  })

  test('HU_014 C1 · Reportes de animales, sanitario y peso en pantalla', async ({ page }) => {
    await entrar(page, ADMIN)
    await page.goto('/reportes')
    await page.getByRole('button', { name: /Animales/ }).click()
    await page.getByRole('button', { name: 'Generar reporte' }).click()
    await expect(page.locator('tr', { hasText: 'CO-0142' })).toContainText('Lucero')
    await page.getByRole('button', { name: /Historial sanitario/ }).click()
    await page.getByLabel('Animal (código de arete)').selectOption('CO-0142')
    await page.getByRole('button', { name: 'Generar reporte' }).click()
    await expect(page.locator('tbody')).toContainText('Aftosa')
    await page.getByRole('button', { name: /Historial de peso/ }).click()
    await page.getByLabel('Animal (código de arete)').selectOption('CO-0231')
    await page.getByRole('button', { name: 'Generar reporte' }).click()
    await expect(page.locator('tbody tr')).toHaveCount(4)
    await expect(page.locator('tbody')).toContainText('286')
  })

  test('HU_014 C2 · Reporte sin datos: «sin registros»', async ({ page }) => {
    await entrar(page, ADMIN)
    await page.goto('/reportes')
    await page.getByRole('button', { name: /Historial de peso/ }).click()
    await page.getByLabel('Animal (código de arete)').selectOption('CO-0256')
    await page.getByRole('button', { name: 'Generar reporte' }).click()
    await expect(page.locator('.vacio')).toHaveText('sin registros')
    await expect(page.getByRole('button', { name: 'Imprimir' })).toHaveCount(0)
  })
})


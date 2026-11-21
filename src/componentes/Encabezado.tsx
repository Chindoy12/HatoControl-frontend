import { startTransition } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { enviar } from '../servicios/ClienteApi'
import type { SesionResponse } from '../tipos/dto'
import { Figuras, Icono, Marca, type NombreIcono } from './piezas'

interface Opcion {
  ruta: string
  texto: string
  icono: NombreIcono
}

// Menú común de las pantallas internas: mostrarMenu(rol) y salir().
// Dashboard y Administradores solo los ve el ganadero (HU_022); el backend también lo impide.
export function Encabezado({ sesion, alSalir }: { sesion: SesionResponse; alSalir: () => void }) {
  const navegar = useNavigate()
  const opciones = mostrarMenu(sesion)

  async function salir() {
    try {
      await enviar({ metodo: 'POST', ruta: '/sesion/salida' })
    } finally {
      // El enrutador cambia de pantalla dentro de una transición: la sesión se borra en la misma transición
      // para que la pantalla de ingreso reciba el aviso «Cerraste sesión» (encontrado en las pruebas de la Fase 11).
      startTransition(() => {
        navegar('/ingresar', { replace: true, state: { salio: true } })
        alSalir()
      })
    }
  }

  return (
    <>
      <header className="banner encabezado">
        <Figuras alto={150} />
        <div className="appnav">
          <NavLink to="/inicio" aria-label="Inicio">
            <Marca tam={21} />
          </NavLink>
          <nav className="menu" aria-label="Menú principal">
            {opciones.map((o) => (
              <NavLink key={o.ruta} to={o.ruta} className={({ isActive }) => (isActive ? 'activo' : '')}>
                {o.texto}
              </NavLink>
            ))}
          </nav>
          <div className="usr">
            <div className="quien">
              Hola, <b style={{ color: '#13392b' }}>{sesion.nombre}</b>
              <br />
              {sesion.rol === 'GANADERO' ? 'Ganadero' : 'Administrador'} · Finca {sesion.nombreFinca}
            </div>
            <div className="av" aria-hidden="true">
              {sesion.nombre.charAt(0).toUpperCase()}
            </div>
            <button type="button" className="salir" onClick={salir}>
              Salir
            </button>
          </div>
        </div>
      </header>
      <nav className="menu-cel" aria-label="Menú">
        {opciones.slice(0, 5).map((o) => (
          <NavLink key={o.ruta} to={o.ruta} className={({ isActive }) => (isActive ? 'activo' : '')}>
            <Icono nombre={o.icono} color="currentColor" tam={22} />
            {o.texto}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function mostrarMenu(sesion: SesionResponse): Opcion[] {
  const comunes: Opcion[] = [
    { ruta: '/inicio', texto: 'Inicio', icono: 'casa' },
    { ruta: '/animales', texto: 'Animales', icono: 'vaca' },
    { ruta: '/sanidad', texto: 'Sanidad', icono: 'jeringa' },
    { ruta: '/reportes', texto: 'Reportes', icono: 'doc' },
  ]
  if (sesion.rol !== 'GANADERO') return comunes
  return [
    ...comunes,
    { ruta: '/dashboard', texto: 'Dashboard', icono: 'grafica' },
    { ruta: '/administradores', texto: 'Administradores', icono: 'personas' },
  ]
}

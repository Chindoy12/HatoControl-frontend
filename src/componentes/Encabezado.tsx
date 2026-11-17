import { NavLink } from 'react-router'
import type { Rol } from '../tipos/dto'

// Menú común de las pantallas internas: mostrarMenu(rol) y salir() (salir se completa en la Fase 10). Dashboard y Administradores solo los ve el ganadero (HU_022).
export function Encabezado({ rol }: { rol: Rol }) {
  const opciones = [
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/animales', texto: 'Animales' },
    { ruta: '/sanidad', texto: 'Sanidad' },
    { ruta: '/reportes', texto: 'Reportes' },
    ...(rol === 'GANADERO'
      ? [
          { ruta: '/dashboard', texto: 'Dashboard' },
          { ruta: '/administradores', texto: 'Administradores' },
        ]
      : []),
  ]
  return (
    <header className="encabezado">
      <div className="marca">
        <img src="/logo.svg" alt="" width={32} height={32} />
        HatoControl
      </div>
      <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {opciones.map((o) => (
          <NavLink key={o.ruta} to={o.ruta} className={({ isActive }) => (isActive ? 'activo' : '')}>
            {o.texto}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

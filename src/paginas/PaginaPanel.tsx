import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useSesion } from '../App'
import { Icono, Mensaje, type NombreIcono } from '../componentes/piezas'
import { enviar } from '../servicios/ClienteApi'
import type { EventoSanitarioResponse } from '../tipos/dto'

const MODULOS: { icono: NombreIcono; titulo: string; texto: string; boton: string; ruta: string; soloGanadero?: boolean }[] = [
  { icono: 'vaca', titulo: 'Mis animales', texto: 'Registrar, buscar y abrir la página de cada animal.', boton: 'Ir a Animales', ruta: '/animales' },
  { icono: 'jeringa', titulo: 'Sanidad', texto: 'Vacunas, enfermedades, tratamientos y actividades.', boton: 'Ir a Sanidad', ruta: '/sanidad' },
  { icono: 'bascula', titulo: 'Peso y leche', texto: 'Registrar pesos y los litros de leche del día.', boton: 'Registrar peso o leche', ruta: '/registros' },
  { icono: 'leche', titulo: 'Partos', texto: 'Registrar un parto con sus crías.', boton: 'Registrar parto', ruta: '/partos/nuevo' },
  { icono: 'doc', titulo: 'Reportes', texto: 'Animales, historial sanitario y de peso.', boton: 'Generar reporte', ruta: '/reportes' },
  { icono: 'grafica', titulo: 'Dashboard', texto: 'Resumen general de la finca.', boton: 'Ver dashboard', ruta: '/dashboard', soloGanadero: true },
  { icono: 'personas', titulo: 'Administradores', texto: 'Cuentas de quienes trabajan en tu finca.', boton: 'Gestionar', ruta: '/administradores', soloGanadero: true },
]

// Pantallas P05 y P22: mostrarAccesos(rol) y mostrarPendientes().
export function PaginaPanel() {
  const sesion = useSesion()
  const [pendientes, setPendientes] = useState<number | null>(null)

  useEffect(() => {
    enviar<EventoSanitarioResponse[]>({ metodo: 'GET', ruta: '/sanitario/pendientes' })
      .then((p) => setPendientes(p.length))
      .catch(() => setPendientes(null))
  }, [])

  const accesos = MODULOS.filter((m) => !m.soloGanadero || sesion.rol === 'GANADERO')

  return (
    <main className="cuerpo">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26 }}>
        <div>
          <h1>Hola, {sesion.nombre}</h1>
          <div className="sub">
            {sesion.rol === 'GANADERO' ? `¿Qué quieres registrar hoy en la finca ${sesion.nombreFinca}?` : `Cuenta de administrador · Finca ${sesion.nombreFinca}`}
          </div>
        </div>
        {pendientes !== null && (
          <Link to="/sanidad" style={{ textDecoration: 'none' }}>
            {pendientes > 0 ? (
              <Mensaje tipo="info">Tienes {pendientes} {pendientes === 1 ? 'actividad sanitaria pendiente' : 'actividades sanitarias pendientes'}</Mensaje>
            ) : (
              <Mensaje tipo="ok">No hay actividades sanitarias vencidas</Mensaje>
            )}
          </Link>
        )}
      </div>
      <div className="rejilla">
        {accesos.map((m) => (
          <div key={m.ruta} className="card pila" style={{ gap: 12 }}>
            <div className="ico"><Icono nombre={m.icono} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2>{m.titulo}</h2>
              {m.soloGanadero && <span className="tag t-a">Solo ganadero</span>}
            </div>
            <div className="sub" style={{ margin: 0, minHeight: 38 }}>{m.texto}</div>
            <Link to={m.ruta} className="btn" style={{ height: 40, fontSize: 13 }}>
              {m.boton} <Icono nombre="flecha" color="#fff" tam={16} />
            </Link>
          </div>
        ))}
      </div>
      {sesion.rol !== 'GANADERO' && (
        <div className="card" style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'center', background: '#13392b', color: '#fff' }}>
          <div className="ico" style={{ background: '#1d4a37' }}><Icono nombre="candado" color="#9bcb3c" /></div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            Como administrador registras, corriges y eliminas animales, y generas reportes. <b style={{ color: '#f2c230' }}>Dashboard</b> y{' '}
            <b style={{ color: '#f2c230' }}>Administradores</b> son solo del ganadero.
          </div>
        </div>
      )}
    </main>
  )
}

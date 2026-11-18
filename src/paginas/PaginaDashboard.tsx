import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Icono, NOMBRE_TIPO, SinRegistros, fecha, numero, type NombreIcono } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { ReporteResponse, TipoEventoSanitario } from '../tipos/dto'

const RESUMEN: [string, string, NombreIcono][] = [
  ['animales', 'animales registrados', 'vaca'],
  ['vacunas', 'vacunas realizadas', 'jeringa'],
  ['enfermedades', 'enfermedades atendidas', 'alerta'],
  ['tratamientos', 'tratamientos realizados', 'check'],
]

// Pantalla P12 (solo ganadero): mostrarResumen(). Cada fila del backend: sección y celdas separadas por tabulador.
export function PaginaDashboard() {
  const [filas, setFilas] = useState<string[][] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    enviar<ReporteResponse>({ metodo: 'GET', ruta: '/reportes/dashboard' })
      .then((r) => setFilas(r.filas.map((f) => f.split('\t'))))
      .catch((e) => setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el dashboard.'))
  }, [])

  const de = (seccion: string) => (filas ?? []).filter((f) => f[0] === seccion)
  const resumen = Object.fromEntries(de('resumen').map((f) => [f[1], f[2]]))
  const actividades = de('actividad')
  const pesos = de('peso')

  return (
    <main className="cuerpo">
      <div className="miga"><Link to="/inicio">Inicio</Link> / <b>Dashboard</b></div>
      <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
        <h1>Resumen de la finca</h1>
        <span className="tag t-a">Solo ganadero</span>
      </div>
      {error && <div className="msg err" style={{ marginTop: 16 }}>{error}</div>}
      {filas && (
        <>
          <div className="fila" style={{ marginTop: 22 }}>
            {RESUMEN.map(([clave, texto, icono]) => (
              <div key={clave} className="card fila" style={{ flex: '1 1 220px', alignItems: 'center', gap: 16 }}>
                <div className="ico"><Icono nombre={icono} /></div>
                <div>
                  <div className="kpi">{resumen[clave] ?? '0'}</div>
                  <div className="ayuda">{texto}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
            <div className="card crece">
              <h2>Actividades próximas y pendientes</h2>
              {actividades.length === 0 ? (
                <div style={{ marginTop: 12 }}><SinRegistros /></div>
              ) : (
                <div className="tabla" style={{ marginTop: 8 }}>
                  <table>
                    <thead><tr><th>Fecha</th><th>Animal</th><th>Actividad</th><th>Estado</th></tr></thead>
                    <tbody>
                      {actividades.map(([, estado, f, arete, nombre, tipo, descripcion], i) => (
                        <tr key={i}>
                          <td>{fecha(f)}</td>
                          <td><Link to={`/animales/${encodeURIComponent(arete)}`}>{arete}</Link> {nombre}</td>
                          <td>{NOMBRE_TIPO[tipo as TipoEventoSanitario]} · {descripcion}</td>
                          <td><span className={`tag ${estado === 'VENCIDA' ? 't-r' : 't-a'}`}>{estado === 'VENCIDA' ? 'Vencida' : 'Próxima'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card" style={{ flex: '1 1 320px', maxWidth: 440 }}>
              <h2>Último peso por animal</h2>
              {pesos.length === 0 ? (
                <div style={{ marginTop: 12 }}><SinRegistros /></div>
              ) : (
                <div className="tabla" style={{ marginTop: 8 }}>
                  <table>
                    <tbody>
                      {pesos.map(([, arete, nombre, kg, f]) => (
                        <tr key={arete}>
                          <td><Link to={`/animales/${encodeURIComponent(arete)}`}>{arete}</Link> {nombre}</td>
                          <td style={{ textAlign: 'right' }}><b>{numero(Number(kg))} kg</b><div className="ayuda">{fecha(f)}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="ayuda" style={{ marginTop: 10 }}>Solo aparecen los animales que tienen mediciones.</div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

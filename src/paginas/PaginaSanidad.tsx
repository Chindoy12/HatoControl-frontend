import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Formulario } from '../componentes/Formulario'
import { Icono, Mensaje, NOMBRE_TIPO, SinRegistros, fecha, hoyIso } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { EventoSanitarioResponse } from '../tipos/dto'

// Pantallas P09 y P19: mostrarProximas(dias), mostrarPendientes() y marcarRealizada().
export function PaginaSanidad() {
  const [dias, setDias] = useState(15)
  const [proximas, setProximas] = useState<EventoSanitarioResponse[] | null>(null)
  const [pendientes, setPendientes] = useState<EventoSanitarioResponse[] | null>(null)
  const [marcando, setMarcando] = useState<EventoSanitarioResponse | null>(null)
  const [fechaRealizacion, setFechaRealizacion] = useState(hoyIso())
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  const mostrarProximas = useCallback((d: number) => {
    if (d < 1) return
    enviar<EventoSanitarioResponse[]>({ metodo: 'GET', ruta: `/sanitario/proximas?dias=${d}` }).then(setProximas).catch(() => setProximas([]))
  }, [])
  const mostrarPendientes = useCallback(() => {
    enviar<EventoSanitarioResponse[]>({ metodo: 'GET', ruta: '/sanitario/pendientes' }).then(setPendientes).catch(() => setPendientes([]))
  }, [])

  useEffect(() => {
    mostrarProximas(dias)
  }, [dias, mostrarProximas])
  useEffect(() => {
    mostrarPendientes()
  }, [mostrarPendientes])

  function recargar() {
    mostrarProximas(dias)
    mostrarPendientes()
  }

  async function marcarRealizada() {
    if (!marcando) return
    try {
      await enviar({ metodo: 'POST', ruta: `/sanitario/eventos/${marcando.id}/realizada?fechaRealizacion=${fechaRealizacion}` })
      setMensaje({ tipo: 'ok', texto: `${NOMBRE_TIPO[marcando.tipo]} «${marcando.descripcion}» de ${marcando.codigoArete} marcada como realizada el ${fecha(fechaRealizacion)}.` })
      setMarcando(null)
      recargar()
    } catch (e) {
      setMensaje({ tipo: 'err', texto: e instanceof ErrorApi ? e.message : 'No se pudo marcar la actividad.' })
    }
  }

  const Lista = ({ datos, vencidas }: { datos: EventoSanitarioResponse[]; vencidas?: boolean }) =>
    datos.length === 0 ? (
      <div style={{ marginTop: 12 }}><SinRegistros /></div>
    ) : (
      <div className="tabla" style={{ marginTop: 8 }}>
        <table>
          <thead><tr><th>{vencidas ? 'Programada' : 'Fecha'}</th><th>Animal</th><th>Actividad</th><th></th></tr></thead>
          <tbody>
            {datos.map((e) => (
              <tr key={e.id}>
                <td style={{ color: vencidas ? '#b3261e' : undefined, fontWeight: vencidas ? 700 : undefined }}>{fecha(e.fechaProgramada)}</td>
                <td><Link to={`/animales/${encodeURIComponent(e.codigoArete)}`}>{e.codigoArete}</Link> {e.nombreAnimal ?? ''}</td>
                <td>{NOMBRE_TIPO[e.tipo]} · {e.descripcion}</td>
                <td style={{ textAlign: 'right' }}>
                  {marcando?.id === e.id ? <span className="tag t-a">Marcando…</span> : (
                    <button type="button" className="btn chico lima" onClick={() => { setMarcando(e); setFechaRealizacion(hoyIso()); setMensaje(null) }}>Marcar realizada</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

  return (
    <main className="cuerpo">
      <div className="miga"><Link to="/inicio">Inicio</Link> / <b>Sanidad</b></div>
      <h1>Control sanitario</h1>
      <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 380px', maxWidth: 520 }}>
          <Formulario tipo="sanitario" embebido alGuardar={recargar} />
        </div>
        <div className="pila crece" style={{ gap: 22 }}>
          {mensaje && <Mensaje tipo={mensaje.tipo}>{mensaje.texto}</Mensaje>}
          {marcando && (
            <div className="card pila" style={{ border: '2px solid #9bcb3c', gap: 14 }}>
              <h3>Marcar como realizada · {NOMBRE_TIPO[marcando.tipo]} {marcando.descripcion} · {marcando.codigoArete} {marcando.nombreAnimal ?? ''}</h3>
              <div className="fila">
                <label className="campo">
                  Fecha programada
                  <input className="inp" value={fecha(marcando.fechaProgramada)} readOnly style={{ color: '#9aa59e' }} />
                  <span className="ayuda">Se conserva.</span>
                </label>
                <label className="campo">
                  Fecha de realización *
                  <input className="inp ok" type="date" max={hoyIso()} value={fechaRealizacion} onChange={(e) => setFechaRealizacion(e.target.value)} />
                </label>
              </div>
              <div className="acciones">
                <button type="button" className="btn borde chico" onClick={() => setMarcando(null)}>Cancelar</button>
                <button type="button" className="btn lima chico" onClick={marcarRealizada}><Icono nombre="check" color="#13392b" tam={14} /> Guardar como realizada</button>
              </div>
            </div>
          )}
          <div className="card">
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Próximas actividades</h2>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#55635b' }}>
                Próximos
                <input className="inp" type="number" min={1} value={dias} style={{ width: 80, height: 36 }} onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))} />
                días
              </label>
            </div>
            {proximas && <Lista datos={proximas} />}
          </div>
          <div className="card" style={{ border: pendientes?.length ? '2px solid #f2c230' : undefined }}>
            <div className="fila" style={{ alignItems: 'center', gap: 10 }}>
              <h2>Pendientes vencidas</h2>
              {!!pendientes?.length && <span className="tag t-r">{pendientes.length}</span>}
            </div>
            {pendientes && <Lista datos={pendientes} vencidas />}
          </div>
        </div>
      </div>
    </main>
  )
}

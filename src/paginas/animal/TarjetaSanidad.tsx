import { Link } from 'react-router'
import { CLASE_TIPO, Icono, NOMBRE_TIPO, SinRegistros, fecha, hoyIso } from '../../componentes/piezas'
import type { EventoSanitarioResponse, TipoEventoSanitario } from '../../tipos/dto'

interface Props {
  ruta: string
  historial: EventoSanitarioResponse[]
  programadas: EventoSanitarioResponse[]
  filtroTipo: TipoEventoSanitario | null
  alFiltrar: (tipo: TipoEventoSanitario | null) => void
}

const FILTROS: (TipoEventoSanitario | null)[] = [null, 'VACUNA', 'ENFERMEDAD', 'TRATAMIENTO']

/** mostrarSanidad(): historial filtrado por tipo y actividades programadas (HU_007, P08). */
export function TarjetaSanidad({ ruta, historial, programadas, filtroTipo, alFiltrar }: Props) {
  const filtrado = historial.filter((e) => !filtroTipo || e.tipo === filtroTipo)
  return (
    <div className="card crece">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historial sanitario</h2>
        <Link to={`/sanidad?arete=${ruta}`} className="btn chico"><Icono nombre="mas" color="#fff" tam={14} /> Registrar</Link>
      </div>
      <div className="chips" style={{ margin: '12px 0 4px' }}>
        {FILTROS.map((t) => (
          <button key={t ?? 'todos'} type="button" className={`chip${filtroTipo === t ? ' on' : ''}`} onClick={() => alFiltrar(t)}>
            {t ? `${NOMBRE_TIPO[t]}${t === 'ENFERMEDAD' ? 'es' : 's'}` : 'Todos'}
          </button>
        ))}
      </div>
      {filtrado.length === 0 ? (
        <div style={{ marginTop: 10 }}><SinRegistros /></div>
      ) : (
        <div className="tabla">
          <table>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Observaciones</th></tr></thead>
            <tbody>
              {filtrado.map((e) => (
                <tr key={e.id}>
                  <td>{fecha(e.fechaRealizacion)}</td>
                  <td><span className={`tag ${CLASE_TIPO[e.tipo]}`}>{NOMBRE_TIPO[e.tipo]}</span></td>
                  <td>{e.descripcion}</td>
                  <td>{e.observaciones ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h3 style={{ marginTop: 20 }}>Actividades programadas</h3>
      {programadas.length === 0 ? (
        <div style={{ marginTop: 10 }}><SinRegistros /></div>
      ) : (
        <div className="tabla">
          <table>
            <tbody>
              {programadas.map((e) => <FilaProgramada key={e.id} evento={e} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/** Una actividad programada; si su fecha ya pasó, se marca como vencida. */
function FilaProgramada({ evento }: { evento: EventoSanitarioResponse }) {
  const vencida = (evento.fechaProgramada ?? '') < hoyIso()
  return (
    <tr>
      <td style={{ color: vencida ? '#b3261e' : undefined, fontWeight: vencida ? 700 : undefined }}>{fecha(evento.fechaProgramada)}</td>
      <td>{NOMBRE_TIPO[evento.tipo]} · {evento.descripcion}</td>
      <td style={{ textAlign: 'right' }}><span className={`tag ${vencida ? 't-r' : 't-a'}`}>{vencida ? 'Vencida' : 'Programada'}</span></td>
    </tr>
  )
}

import { Link } from 'react-router'
import { Icono, NOMBRE_SEXO, PropositoTag, SinRegistros, fecha } from '../../componentes/piezas'
import type { PartoResponse } from '../../tipos/dto'

/** mostrarPartosYLeche(), parte 1: partos de la madre con sus crías, del más reciente al más antiguo (HU_017). */
export function TarjetaPartos({ ruta, partos }: { ruta: string; partos: PartoResponse[] }) {
  return (
    <div className="card crece">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Partos y crías</h2>
        <Link to={`/partos/nuevo?arete=${ruta}`} className="btn chico"><Icono nombre="mas" color="#fff" tam={14} /> Registrar parto</Link>
      </div>
      <div className="pila" style={{ marginTop: 12, gap: 10 }}>
        {partos.length === 0 && <SinRegistros />}
        {[...partos].reverse().map((p) => (
          <div key={p.fecha} className="fila" style={{ gap: 14, alignItems: 'center', padding: 12, borderRadius: 12, background: '#f7f5ee' }}>
            <b style={{ width: 110 }}>{fecha(p.fecha)}</b>
            {p.crias.length === 0 ? (
              <span className="ayuda">Parto sin crías registradas</span>
            ) : (
              <div className="pila" style={{ gap: 6 }}>
                {p.crias.map((c) => (
                  <span key={c.codigoArete}>
                    <span className="tag t-g">Cría</span>{' '}
                    <Link to={`/animales/${encodeURIComponent(c.codigoArete)}`}>{c.codigoArete}</Link> {c.nombre ?? ''} · {NOMBRE_SEXO[c.sexo]} · <PropositoTag p={c.proposito} />
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

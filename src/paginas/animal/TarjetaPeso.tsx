import { Link } from 'react-router'
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Icono, SinRegistros, fecha, numero } from '../../componentes/piezas'
import type { PesoResponse } from '../../tipos/dto'

export function TarjetaPeso({ ruta, pesos }: { ruta: string; pesos: PesoResponse[] }) {
  return (
    <div className="card crece">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Peso</h2>
        <Link to={`/registros?arete=${ruta}`} className="btn chico"><Icono nombre="mas" color="#fff" tam={14} /> Registrar peso</Link>
      </div>
      {pesos.length === 0 ? (
        <div style={{ marginTop: 12 }}><SinRegistros /></div>
      ) : (
        <>
          <h3 style={{ marginTop: 14 }}>Evolución de peso</h3>
          <GraficaPeso pesos={pesos} />
          <TablaPesos pesos={pesos} />
        </>
      )}
    </div>
  )
}

function GraficaPeso({ pesos }: { pesos: PesoResponse[] }) {
  return (
    <div style={{ width: '100%', height: 220, marginTop: 8 }}>
      <ResponsiveContainer>
        <LineChart data={pesos.map((p) => ({ fecha: fecha(p.fechaMedicion).slice(0, 5), kg: p.pesoKg }))} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef0ec" vertical={false} />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#6b7a72' }} stroke="#c8d0c6" />
          <YAxis domain={[(m: number) => Math.floor((m - 10) / 10) * 10, (m: number) => Math.ceil((m + 10) / 10) * 10]} tick={{ fontSize: 11, fill: '#6b7a72' }} stroke="#c8d0c6" width={40} />
          <Tooltip formatter={(v) => [`${numero(Number(v))} kg`, 'Peso']} />
          <Line type="linear" dataKey="kg" stroke="#2f9e52" strokeWidth={3} dot={{ r: 6, fill: '#9bcb3c', stroke: '#13392b', strokeWidth: 2 }} isAnimationActive={false}>
            <LabelList dataKey="kg" position="top" style={{ fontSize: 12, fontWeight: 700, fill: '#13392b' }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function TablaPesos({ pesos }: { pesos: PesoResponse[] }) {
  return (
    <div className="tabla" style={{ marginTop: 8 }}>
      <table>
        <thead><tr><th>Fecha</th><th>Peso</th><th>Variación</th></tr></thead>
        <tbody>
          {pesos.map((p, i) => (
            <tr key={i}>
              <td>{fecha(p.fechaMedicion)}</td>
              <td><b>{numero(p.pesoKg)} kg</b></td>
              <td>
                {p.diferenciaKg == null ? <span style={{ color: '#9aa59e' }}>—</span> : (
                  <b style={{ color: p.diferenciaKg >= 0 ? '#2f6b12' : '#b3261e' }}>{p.diferenciaKg >= 0 ? '+' : '−'}{numero(Math.abs(p.diferenciaKg))} kg</b>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

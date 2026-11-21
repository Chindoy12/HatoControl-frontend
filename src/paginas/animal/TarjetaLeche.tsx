import { SinRegistros, fecha, numero } from '../../componentes/piezas'
import type { PromedioLecheResponse } from '../../tipos/dto'

export type Periodo = 'SEMANA' | 'MES' | 'PARTO'

export const NOMBRE_PERIODO: Record<Periodo, string> = { SEMANA: 'Semana', MES: 'Mes', PARTO: 'Parto' }

interface Props {
  leche: PromedioLecheResponse | null
  periodo: Periodo
  alElegirPeriodo: (p: Periodo) => void
}

/** mostrarPartosYLeche(), parte 2: barras por día y promedio del periodo elegido (HU_019). */
export function TarjetaLeche({ leche, periodo, alElegirPeriodo }: Props) {
  return (
    <div className="card crece">
      <h2>Producción de leche</h2>
      <div className="chips" style={{ marginTop: 10 }}>
        {(['SEMANA', 'MES', 'PARTO'] as Periodo[]).map((p) => (
          <button key={p} type="button" className={`chip${periodo === p ? ' on' : ''}`} onClick={() => alElegirPeriodo(p)}>
            {NOMBRE_PERIODO[p]}
          </button>
        ))}
      </div>
      {!leche || leche.diasConRegistro === 0 ? (
        <div style={{ marginTop: 14 }}><SinRegistros /></div>
      ) : (
        <>
          <BarrasLeche leche={leche} periodo={periodo} />
          <div className="msg ok" style={{ marginTop: 14, display: 'block' }}>
            Promedio: <b>{numero(leche.promedioDiario)} litros por día</b>
            <br />
            <span style={{ fontWeight: 500 }}>{numero(leche.totalLitros)} L ÷ {leche.diasConRegistro} {leche.diasConRegistro === 1 ? 'día' : 'días'} con registro. Los días sin registro no se cuentan.</span>
          </div>
        </>
      )}
    </div>
  )
}

function BarrasLeche({ leche, periodo }: { leche: PromedioLecheResponse; periodo: Periodo }) {
  const max = Math.max(1, ...leche.registros.map((r) => r.litros))
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 14, alignItems: 'flex-end', height: 130, overflowX: 'auto' }}>
      {casillas(leche, periodo).map(({ dia, etiqueta, litros }) => (
        <div key={dia} style={{ flex: '1 0 22px', maxWidth: 48, textAlign: 'center' }} title={`${fecha(dia)}: ${litros == null ? 'sin registro' : numero(litros) + ' L'}`}>
          <div style={{ height: litros == null ? 4 : Math.max(6, (litros / max) * 90), background: litros == null ? '#e3e7e1' : '#9bcb3c', borderRadius: '6px 6px 0 0' }} />
          <div className="ayuda" style={{ fontSize: 10.5 }}>{etiqueta}<br />{litros == null ? '—' : numero(litros)}</div>
        </div>
      ))}
    </div>
  )
}

/** Semana: siete casillas de lunes a domingo, con los días sin registro vacíos. Mes y parto: un día por registro. */
function casillas(leche: PromedioLecheResponse, periodo: Periodo): { dia: string; etiqueta: string; litros: number | null }[] {
  if (periodo !== 'SEMANA') return leche.registros.map((r) => ({ dia: r.fecha, etiqueta: r.fecha.slice(8, 10), litros: r.litros }))
  const [a, m, d] = leche.registros[0].fecha.split('-').map(Number)
  const base = new Date(Date.UTC(a, m - 1, d))
  const lunes = new Date(base.getTime() - ((base.getUTCDay() + 6) % 7) * 864e5)
  return 'LMMJVSD'.split('').map((letra, i) => {
    const dia = new Date(lunes.getTime() + i * 864e5).toISOString().slice(0, 10)
    return { dia, etiqueta: letra, litros: leche.registros.find((r) => r.fecha === dia)?.litros ?? null }
  })
}

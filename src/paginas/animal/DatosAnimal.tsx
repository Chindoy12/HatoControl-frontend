import { Icono, NOMBRE_SEXO, PropositoTag, fecha, numero } from '../../componentes/piezas'
import type { AnimalResponse, PartoResponse, PesoResponse, PromedioLecheResponse } from '../../tipos/dto'
import { NOMBRE_PERIODO, type Periodo } from './TarjetaLeche'

interface Props {
  animal: AnimalResponse
  pesos: PesoResponse[]
  partos: PartoResponse[]
  leche: PromedioLecheResponse | null
  periodo: Periodo
}

export function DatosAnimal({ animal, pesos, partos, leche, periodo }: Props) {
  const ultimoPeso = pesos.length ? pesos[pesos.length - 1] : null
  const ganancia = pesos.length > 1 ? pesos[pesos.length - 1].pesoKg - pesos[0].pesoKg : null
  return (
    <div className="card fila" style={{ marginTop: 18, alignItems: 'center', padding: '26px 30px', gap: 26 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#eaf5dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icono nombre="vaca" tam={54} />
      </div>
      <div style={{ flex: '1 1 260px' }}>
        <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
          <h1>{animal.nombre ?? animal.codigoArete}</h1>
          <PropositoTag p={animal.proposito} />
          <span className="tag t-g">{NOMBRE_SEXO[animal.sexo]}</span>
        </div>
        <div className="sub">
          Arete <b>{animal.codigoArete}</b>
          {animal.fechaNacimiento ? <> · Nació el {fecha(animal.fechaNacimiento)} · <b>{animal.edadMeses} meses</b></> : <> · Edad: <span style={{ color: '#9aa59e', fontWeight: 700 }}>sin registros</span></>}
        </div>
      </div>
      <Indicador valor={ultimoPeso ? `${numero(ultimoPeso.pesoKg)} kg` : '—'} texto="último peso" />
      {animal.sexo === 'HEMBRA' ? (
        <>
          <Indicador valor={String(partos.length)} texto="partos" />
          {animal.proposito === 'LECHE' && <Indicador valor={leche && leche.diasConRegistro ? `${numero(leche.promedioDiario)} L` : '—'} texto={`promedio ${NOMBRE_PERIODO[periodo].toLowerCase()}`} />}
        </>
      ) : (
        ganancia !== null && <Indicador valor={`${ganancia >= 0 ? '+' : '−'}${numero(Math.abs(ganancia))} kg`} texto="desde el primer peso" />
      )}
    </div>
  )
}

function Indicador({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 18px', borderLeft: '1.5px solid #eef0ec' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#13392b' }}>{valor}</div>
      <div className="ayuda">{texto}</div>
    </div>
  )
}

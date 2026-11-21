import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { enviar } from '../../servicios/ClienteApi'
import type { PartoResponse } from '../../tipos/dto'
import { Icono, Mensaje, fecha, hoyIso, numero } from '../piezas'
import { BotonGuardar, CampoTexto, Resultado, SelectorAnimal } from './campos'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useAnimales } from './useAnimales'
import { useFormulario } from './useFormulario'
import { exigir } from './validaciones'

/** HU_018: leche del día de una vaca, asociada a uno de sus partos (P07). */
export function FormularioLeche(props: PropsFormulario) {
  const [consulta] = useSearchParams()
  const vacas = useAnimales().filter((a) => a.sexo === 'HEMBRA' && a.proposito === 'LECHE')
  const [partos, setPartos] = useState<PartoResponse[] | null>(null)
  const f = useFormulario(props, {
    iniciales: { codigoArete: consulta.get('arete') ?? '', fechaParto: '', fecha: hoyIso(), litros: '' },
    validar: validarLeche,
    guardar,
  })

  // Al elegir la vaca se cargan sus partos y se propone el más reciente
  const vaca = f.valores.codigoArete
  const { setValores } = f
  useEffect(() => {
    if (!vaca) {
      setPartos(null)
      return
    }
    enviar<PartoResponse[]>({ metodo: 'GET', ruta: `/partos/madres/${encodeURIComponent(vaca)}` })
      .then((p) => {
        setPartos(p)
        setValores((v) => ({ ...v, fechaParto: p.length ? p[p.length - 1].fecha : '' }))
      })
      .catch(() => setPartos([]))
  }, [vaca, setValores])

  async function guardar(v: Valores) {
    await enviar({ metodo: 'POST', ruta: '/leche', cuerpo: { codigoArete: v.codigoArete, fechaParto: v.fechaParto || null, fecha: v.fecha, litros: Number(v.litros) } })
    f.setExito(`Leche del ${fecha(v.fecha)} guardada: ${numero(Number(v.litros))} litros para ${v.codigoArete}.`)
    f.setValores((x) => ({ ...x, litros: '' }))
  }

  const sinPartos = partos !== null && partos.length === 0
  return (
    <form className="card pila crece" style={{ padding: 30 }} onSubmit={f.enviar} noValidate>
      <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
        <div className="ico"><Icono nombre="leche" /></div>
        <h2>Leche del día</h2>
      </div>
      <SelectorAnimal f={f} campo="codigoArete" etiqueta="Vaca de leche *" lista={vacas} ayuda="Solo hembras de leche con al menos un parto." />
      {sinPartos && <Mensaje tipo="err">No se puede registrar leche de {f.valores.codigoArete}: no tiene partos registrados.</Mensaje>}
      {partos && partos.length > 0 && (
        <label className="campo">
          Parto
          <select className="inp" value={f.valores.fechaParto} onChange={(e) => f.cambiar('fechaParto', e.target.value)}>
            {[...partos].reverse().map((p, i) => (
              <option key={p.fecha} value={p.fecha}>{fecha(p.fecha)}{i === 0 ? ' (más reciente)' : ''}</option>
            ))}
          </select>
        </label>
      )}
      <div className="fila">
        <CampoTexto f={f} campo="fecha" etiqueta="Fecha *" tipoInput="date" max={hoyIso()} />
        <CampoTexto f={f} campo="litros" etiqueta="Litros *" tipoInput="number" min="0" paso="0.1" />
      </div>
      <BotonGuardar f={f} texto="Guardar leche" desactivado={sinPartos} />
      <Resultado f={f} />
    </form>
  )
}

function validarLeche(v: Valores): Errores {
  const e: Errores = {}
  exigir(v, e, 'codigoArete', 'Selecciona una vaca.')
  if (!(Number(v.litros) > 0)) e.litros = 'Los litros deben ser mayores que cero.'
  exigir(v, e, 'fecha', 'Escribe la fecha.')
  if (v.fecha > hoyIso()) e.fecha = 'La fecha no puede ser posterior a hoy.'
  else if (v.fechaParto && v.fecha && v.fecha < v.fechaParto) e.fecha = `La fecha no puede ser anterior al parto (${fecha(v.fechaParto)}).`
  return e
}

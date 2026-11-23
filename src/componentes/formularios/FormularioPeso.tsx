import { useSearchParams } from 'react-router'
import { enviar } from '../../servicios/ClienteApi'
import type { PesoResponse } from '../../tipos/dto'
import { Icono, hoyIso, numero } from '../piezas'
import { Botones, CampoTexto, Resultado, SelectorAnimal } from './campos'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useAnimales } from './useAnimales'
import { useFormulario } from './useFormulario'
import { exigir } from './validaciones'

export function FormularioPeso(props: PropsFormulario) {
  const [consulta] = useSearchParams()
  const animales = useAnimales()
  const f = useFormulario(props, {
    iniciales: { codigoArete: consulta.get('arete') ?? '', pesoKg: '', fechaMedicion: hoyIso() },
    validar: validarPeso,
    guardar,
  })

  async function guardar(v: Valores) {
    const peso = await enviar<PesoResponse>({
      metodo: 'POST',
      ruta: `/animales/${encodeURIComponent(v.codigoArete)}/pesos`,
      cuerpo: { pesoKg: Number(v.pesoKg), fechaMedicion: v.fechaMedicion },
    })
    const diferencia = peso.diferenciaKg == null ? '' : ` (${peso.diferenciaKg >= 0 ? '+' : '−'}${numero(Math.abs(peso.diferenciaKg))} kg)`
    f.setExito(`Peso guardado para ${v.codigoArete}: ${numero(peso.pesoKg)} kg${diferencia}.`)
    f.setValores((x) => ({ ...x, pesoKg: '' }))
  }

  return (
    <form className="card pila crece" style={{ padding: 30 }} onSubmit={f.enviar} noValidate>
      <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
        <div className="ico"><Icono nombre="bascula" /></div>
        <h2>Peso</h2>
      </div>
      <SelectorAnimal f={f} campo="codigoArete" etiqueta="Animal *" lista={animales} />
      <div className="fila">
        <CampoTexto f={f} campo="pesoKg" etiqueta="Peso (kg) *" tipoInput="number" min="0" paso="0.1" />
        <CampoTexto f={f} campo="fechaMedicion" etiqueta="Fecha de medición *" tipoInput="date" max={hoyIso()} />
      </div>
      <Botones f={f} texto="Guardar peso" />
      <Resultado f={f} />
      <div className="ayuda">En esta versión el peso se escribe a mano. Más adelante se podrá conectar una báscula o un lector RFID.</div>
    </form>
  )
}

function validarPeso(v: Valores): Errores {
  const e: Errores = {}
  exigir(v, e, 'codigoArete', 'Debes seleccionar un animal registrado.')
  if (!(Number(v.pesoKg) > 0)) e.pesoKg = 'El peso debe ser mayor que cero.'
  exigir(v, e, 'fechaMedicion', 'Escribe la fecha de medición.')
  if (v.fechaMedicion > hoyIso()) e.fechaMedicion = 'La fecha de medición no puede ser posterior a hoy.'
  return e
}

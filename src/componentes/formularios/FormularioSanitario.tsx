import { useSearchParams } from 'react-router'
import { enviar } from '../../servicios/ClienteApi'
import type { TipoEventoSanitario } from '../../tipos/dto'
import { NOMBRE_TIPO, fecha, hoyIso } from '../piezas'
import { BotonGuardar, CampoTexto, Resultado, SelectorAnimal } from './campos'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useAnimales } from './useAnimales'
import { useFormulario } from './useFormulario'
import { exigir } from './validaciones'

const TIPOS: TipoEventoSanitario[] = ['VACUNA', 'ENFERMEDAD', 'TRATAMIENTO']

/** HU_007 y HU_008: evento sanitario realizado o actividad programada (P09). */
export function FormularioSanitario(props: PropsFormulario) {
  const [consulta] = useSearchParams()
  const animales = useAnimales()
  const f = useFormulario(props, {
    iniciales: { tipoEvento: 'VACUNA', codigoArete: consulta.get('arete') ?? '', descripcion: '', modo: 'realizado', fecha: hoyIso(), observaciones: '' },
    validar: validarSanitario,
    guardar,
  })
  const programar = f.valores.modo === 'programar'

  async function guardar(v: Valores) {
    const esProgramada = v.modo === 'programar'
    await enviar({
      metodo: 'POST',
      ruta: `/sanitario/animales/${encodeURIComponent(v.codigoArete)}/${esProgramada ? 'programadas' : 'eventos'}`,
      cuerpo: {
        tipo: v.tipoEvento,
        descripcion: v.descripcion,
        fechaProgramada: esProgramada ? v.fecha : null,
        fechaRealizacion: esProgramada ? null : v.fecha,
        observaciones: v.observaciones,
      },
    })
    const cuando = esProgramada ? `programada para el ${fecha(v.fecha)}` : 'guardada como realizada'
    f.setExito(`${NOMBRE_TIPO[v.tipoEvento as TipoEventoSanitario]} «${v.descripcion}» ${cuando} para ${v.codigoArete}.`)
    f.setValores((x) => ({ ...x, descripcion: '', observaciones: '' }))
  }

  return (
    <form className="card pila" style={{ padding: 30 }} onSubmit={f.enviar} noValidate>
      <h2>Registrar evento o actividad</h2>
      <div className="chips">
        {TIPOS.map((t) => (
          <button key={t} type="button" className={`chip${f.valores.tipoEvento === t ? ' on' : ''}`} aria-pressed={f.valores.tipoEvento === t} onClick={() => f.cambiar('tipoEvento', t)}>
            {NOMBRE_TIPO[t]}
          </button>
        ))}
      </div>
      <SelectorAnimal f={f} campo="codigoArete" etiqueta="Animal *" lista={animales} />
      <CampoTexto f={f} campo="descripcion" etiqueta="Descripción *" />
      <div className="chips">
        <button type="button" className={`chip${!programar ? ' on' : ''}`} onClick={() => f.cambiar('modo', 'realizado')}>Ya se realizó</button>
        <button type="button" className={`chip${programar ? ' on' : ''}`} onClick={() => f.cambiar('modo', 'programar')}>Programar para después</button>
      </div>
      <CampoTexto f={f} campo="fecha" etiqueta={programar ? 'Fecha programada *' : 'Fecha *'} tipoInput="date"
        min={programar ? hoyIso() : undefined} max={programar ? undefined : hoyIso()}
        ayuda={programar ? 'No puede ser anterior a hoy.' : 'No puede ser posterior a hoy.'} />
      <label className="campo">
        Observaciones
        <textarea className="inp" value={f.valores.observaciones} onChange={(e) => f.cambiar('observaciones', e.target.value)} />
      </label>
      <BotonGuardar f={f} texto="Guardar" />
      <Resultado f={f} />
    </form>
  )
}

function validarSanitario(v: Valores): Errores {
  const e: Errores = {}
  const hoy = hoyIso()
  const programar = v.modo === 'programar'
  exigir(v, e, 'codigoArete', 'Debes seleccionar un animal registrado.')
  exigir(v, e, 'descripcion', 'Escribe la descripción.')
  exigir(v, e, 'fecha', programar ? 'Escribe la fecha programada.' : 'Escribe la fecha del evento.')
  if (programar && v.fecha && v.fecha < hoy) e.fecha = 'La fecha programada no puede ser anterior a hoy.'
  if (!programar && v.fecha > hoy) e.fecha = 'La fecha del evento no puede ser posterior a hoy.'
  return e
}

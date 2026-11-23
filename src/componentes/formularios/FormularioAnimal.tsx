import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ErrorApi, enviar } from '../../servicios/ClienteApi'
import type { AnimalRequest, AnimalResponse, Proposito, Sexo } from '../../tipos/dto'
import { Icono, NOMBRE_PROPOSITO, hoyIso, propositosDe } from '../piezas'
import { Botones, CampoTexto, Resultado, Sexos } from './campos'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useFormulario } from './useFormulario'
import { exigir } from './validaciones'

const INICIALES: Valores = { codigoArete: '', nombre: '', fechaNacimiento: '', sexo: '', proposito: '' }

const DESCRIPCION_PROPOSITO: Record<Proposito, string> = {
  LECHE: 'Producción diaria de leche',
  ENGORDE: 'Ganancia de peso',
  PADRON: 'Reproductor de la finca',
}

export function FormularioAnimal(props: PropsFormulario) {
  const navegar = useNavigate()
  const { codigoArete: areteRuta } = useParams()
  const edicion = !!areteRuta
  const [original, setOriginal] = useState<AnimalResponse | null>(null)
  const f = useFormulario(props, { iniciales: INICIALES, validar: validarAnimal, guardar })

  const { setValores, setGeneral } = f
  useEffect(() => {
    if (!areteRuta) return
    enviar<AnimalResponse>({ metodo: 'GET', ruta: `/animales/${encodeURIComponent(areteRuta)}` })
      .then((a) => {
        setOriginal(a)
        setValores({ codigoArete: a.codigoArete, nombre: a.nombre ?? '', fechaNacimiento: a.fechaNacimiento ?? '', sexo: a.sexo, proposito: a.proposito })
      })
      .catch((e) => setGeneral(e instanceof ErrorApi ? e.message : 'No se pudo cargar el animal.'))
  }, [areteRuta, setValores, setGeneral])

  async function guardar(v: Valores) {
    const animal: AnimalRequest = {
      codigoArete: v.codigoArete?.trim(),
      nombre: v.nombre?.trim(),
      sexo: v.sexo as Sexo,
      fechaNacimiento: v.fechaNacimiento || null,
      proposito: v.proposito as Proposito,
    }
    if (edicion) await editar(animal)
    else await registrar(animal)
  }

  async function registrar(animal: AnimalRequest) {
    const a = await enviar<AnimalResponse>({ metodo: 'POST', ruta: '/animales', cuerpo: animal })
    f.setExito(<>Animal <Link to={`/animales/${encodeURIComponent(a.codigoArete)}`}>{a.codigoArete}</Link> registrado correctamente.</>)
    f.setValores(INICIALES)
  }

  async function editar(animal: AnimalRequest) {
    const a = await enviar<AnimalResponse>({ metodo: 'PUT', ruta: `/animales/${encodeURIComponent(areteRuta!)}`, cuerpo: animal })
    setOriginal(a)
    f.setExito(`Cambios guardados para ${a.codigoArete}${a.nombre ? ' ' + a.nombre : ''}.`)
    if (a.codigoArete !== areteRuta) navegar(`/animales/${encodeURIComponent(a.codigoArete)}/editar`, { replace: true })
  }

  const v = f.valores
  return (
    <main className="cuerpo">
      <div className="miga">
        <Link to="/inicio">Inicio</Link> / <Link to="/animales">Animales</Link> / {edicion && <>{areteRuta} / </>}<b>{edicion ? 'Editar' : 'Registrar animal'}</b>
      </div>
      <h1>{edicion ? 'Editar animal' : 'Registrar animal'}</h1>
      <div className="sub">{edicion ? 'Corrige los datos del animal. Su historial no cambia.' : 'Los campos con * son obligatorios.'}</div>
      <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
        <form className="card pila crece" style={{ padding: 32 }} onSubmit={f.enviar} noValidate>
          <div className="fila">
            <CampoTexto f={f} campo="codigoArete" etiqueta="Código de arete *" />
            <CampoTexto f={f} campo="nombre" etiqueta="Nombre" />
          </div>
          <div className="fila">
            <CampoTexto f={f} campo="fechaNacimiento" etiqueta="Fecha de nacimiento" tipoInput="date" max={hoyIso()} ayuda="No puede ser posterior a hoy." />
            <div className="campo">
              Sexo *
              <Sexos valor={v.sexo} alElegir={(s) => f.cambiar('sexo', s)} />
              {f.errores.sexo ? <span className="ayuda err">{f.errores.sexo}</span>
                : original && v.sexo !== original.sexo && <span className="ayuda">Antes: {original.sexo === 'HEMBRA' ? 'Hembra' : 'Macho'}</span>}
            </div>
          </div>
          <ElegirProposito sexo={v.sexo} valor={v.proposito} error={f.errores.proposito} alElegir={(p) => f.cambiar('proposito', p)} />
          <div className="sep" style={{ margin: 0 }} />
          <Botones f={f} texto={edicion ? 'Guardar cambios' : 'Guardar animal'} />
        </form>
        <aside className="pila" style={{ width: 360, maxWidth: '100%' }}>
          <Resultado f={f} />
          {edicion && original && (
            <Link to={`/animales/${encodeURIComponent(original.codigoArete)}`} className="btn borde">
              <Icono nombre="atras" color="#13392b" tam={16} /> Volver a la página del animal
            </Link>
          )}
          <Reglas edicion={edicion} />
        </aside>
      </div>
    </main>
  )
}

function ElegirProposito({ sexo, valor, error, alElegir }: { sexo: string; valor: string; error?: string; alElegir: (p: Proposito) => void }) {
  const permitidos = propositosDe((sexo || null) as Sexo | null)
  return (
    <div className="campo">
      <span>
        Propósito * <span className="ayuda">(según el sexo: macho → engorde o padrón; hembra → engorde o leche)</span>
      </span>
      <div className="fila" style={{ gap: 12 }}>
        {(['LECHE', 'ENGORDE', 'PADRON'] as Proposito[]).map((p) => {
          const permitido = permitidos.includes(p)
          return (
            <button key={p} type="button" className={`opcion${valor === p ? ' on' : ''}`} disabled={!permitido}
              aria-pressed={valor === p} onClick={() => alElegir(p)}>
              <h3>{NOMBRE_PROPOSITO[p]}</h3>
              <div className="ayuda">{permitido ? DESCRIPCION_PROPOSITO[p] : p === 'PADRON' ? 'Solo para machos' : 'Solo para hembras'}</div>
            </button>
          )
        })}
      </div>
      {error && <span className="ayuda err">{error}</span>}
    </div>
  )
}

function Reglas({ edicion }: { edicion: boolean }) {
  return (
    <div className="card" style={{ background: '#13392b' }}>
      <h3 style={{ color: '#f2c230' }}>{edicion ? 'Al editar' : 'Reglas'}</h3>
      <div style={{ fontSize: 13.5, lineHeight: 1.7, marginTop: 8, color: '#dfeee0' }}>
        • El arete es único dentro de tu finca{edicion ? '; si ya existe, se conserva el anterior' : ''}.<br />
        • Macho: engorde o padrón.<br />• Hembra: engorde o leche.<br />
        {edicion ? '• Si cambias el sexo, eliges de nuevo el propósito.' : '• Las crías se registran desde el parto.'}
      </div>
    </div>
  )
}

function validarAnimal(v: Valores): Errores {
  const e: Errores = {}
  exigir(v, e, 'codigoArete', 'Escribe el código de arete.')
  exigir(v, e, 'sexo', 'Elige el sexo.')
  exigir(v, e, 'proposito', 'Elige el propósito.')
  if (v.fechaNacimiento && v.fechaNacimiento > hoyIso()) e.fechaNacimiento = 'La fecha de nacimiento no puede ser posterior a hoy.'
  return e
}

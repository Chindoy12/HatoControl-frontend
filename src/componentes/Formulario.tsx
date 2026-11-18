import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type {
  AnimalRequest,
  AnimalResponse,
  PartoResponse,
  PesoResponse,
  Proposito,
  SesionResponse,
  Sexo,
  TipoEventoSanitario,
  UsuarioResponse,
} from '../tipos/dto'
import { Figuras, Icono, Marca, Mensaje, NOMBRE_PROPOSITO, NOMBRE_TIPO, fecha, hoyIso, numero, propositosDe } from './piezas'

export type TipoFormulario = 'animal' | 'sanitario' | 'peso' | 'parto' | 'leche' | 'finca' | 'administrador' | 'contrasena'

interface Props {
  tipo: TipoFormulario
  /** Dentro de otra pantalla (tarjeta), sin título de página. */
  embebido?: boolean
  /** Registro de finca: deja al ganadero dentro del sistema. */
  alEntrar?: (s: SesionResponse) => void
  /** Avisa a la pantalla que lo contiene para que recargue sus datos. */
  alGuardar?: () => void
  alCancelar?: () => void
}

type Valores = Record<string, string>
type Errores = Record<string, string>
interface Cria {
  codigoArete: string
  nombre: string
  sexo: Sexo | null
  proposito: Proposito | ''
}

const DESCRIPCION_PROPOSITO: Record<Proposito, string> = {
  LECHE: 'Producción diaria de leche',
  ENGORDE: 'Ganancia de peso',
  PADRON: 'Reproductor de la finca',
}

/**
 * Formulario único de la vista de desarrollo: mostrar(tipo), mostrarContador(), validarCampos(),
 * mostrarErrores(mensajes) y enviar(). Las reglas se vuelven a revisar en el backend.
 */
export function Formulario({ tipo, embebido = false, alEntrar, alGuardar, alCancelar }: Props) {
  const navegar = useNavigate()
  const { codigoArete: areteRuta, token } = useParams()
  const [consulta] = useSearchParams()
  const edicion = tipo === 'animal' && !!areteRuta

  const [valores, setValores] = useState<Valores>(() => valoresIniciales(tipo, consulta.get('arete') ?? ''))
  const [crias, setCrias] = useState<Cria[]>([])
  const [animales, setAnimales] = useState<AnimalResponse[]>([])
  const [partos, setPartos] = useState<PartoResponse[] | null>(null)
  const [original, setOriginal] = useState<AnimalResponse | null>(null)
  const [errores, setErrores] = useState<Errores>({})
  const [general, setGeneral] = useState('')
  const [aviso, setAviso] = useState('')
  const [exito, setExito] = useState<ReactNode>(null)
  const [enviando, setEnviando] = useState(false)
  const [verClave, setVerClave] = useState(false)

  const usaAnimales = ['sanitario', 'peso', 'parto', 'leche'].includes(tipo)

  useEffect(() => {
    if (usaAnimales) {
      enviar<AnimalResponse[]>({ metodo: 'GET', ruta: '/animales' }).then(setAnimales).catch(() => setAnimales([]))
    }
  }, [usaAnimales])

  useEffect(() => {
    if (!edicion) return
    enviar<AnimalResponse>({ metodo: 'GET', ruta: `/animales/${encodeURIComponent(areteRuta!)}` })
      .then((a) => {
        setOriginal(a)
        setValores({ codigoArete: a.codigoArete, nombre: a.nombre ?? '', fechaNacimiento: a.fechaNacimiento ?? '', sexo: a.sexo, proposito: a.proposito })
      })
      .catch((e) => setGeneral(e instanceof ErrorApi ? e.message : 'No se pudo cargar el animal.'))
  }, [edicion, areteRuta])

  // Leche: partos de la vaca elegida (HU_018)
  const vaca = tipo === 'leche' ? valores.codigoArete : ''
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
  }, [vaca])

  function cambiar(campo: string, valor: string) {
    setValores((v) => {
      const nuevo = { ...v, [campo]: valor }
      // Al cambiar el sexo, el propósito debe volver a elegirse si ya no corresponde (HU_001, HU_004)
      if (campo === 'sexo' && v.proposito && !propositosDe(valor as Sexo).includes(v.proposito as Proposito)) {
        nuevo.proposito = ''
        setAviso(`Cambiaste el sexo. Elige de nuevo el propósito: ${valor === 'MACHO' ? 'engorde o padrón' : 'engorde o leche'}.`)
      }
      return nuevo
    })
    setErrores((e) => ({ ...e, [campo]: '' }))
    if (campo === 'proposito') setAviso('')
    setExito(null)
  }

  // ---------- validarCampos() ----------
  function validarCampos(): Errores {
    const e: Errores = {}
    const v = valores
    const hoy = hoyIso()
    const falta = (campo: string, mensaje: string) => {
      if (!v[campo]?.trim()) e[campo] = mensaje
    }
    switch (tipo) {
      case 'finca':
        falta('nombreFinca', 'Escribe el nombre de la finca.')
        falta('nombre', 'Escribe tu nombre.')
        falta('correo', 'Escribe tu correo.')
        if (v.contrasena.length < 10) e.contrasena = 'La contraseña debe tener entre 10 y 12 caracteres.'
        break
      case 'administrador':
        falta('nombre', 'Escribe el nombre.')
        falta('correo', 'Escribe el correo.')
        if (v.contrasena.length < 10) e.contrasena = 'La contraseña debe tener entre 10 y 12 caracteres.'
        break
      case 'contrasena':
        if (v.contrasena.length < 10) e.contrasena = 'La contraseña debe tener entre 10 y 12 caracteres.'
        if (v.repetir !== v.contrasena) e.repetir = 'Las dos contraseñas no son iguales.'
        break
      case 'animal':
        falta('codigoArete', 'Escribe el código de arete.')
        falta('sexo', 'Elige el sexo.')
        falta('proposito', 'Elige el propósito.')
        if (v.fechaNacimiento && v.fechaNacimiento > hoy) e.fechaNacimiento = 'La fecha de nacimiento no puede ser posterior a hoy.'
        break
      case 'peso':
        falta('codigoArete', 'Debes seleccionar un animal registrado.')
        if (!(Number(v.pesoKg) > 0)) e.pesoKg = 'El peso debe ser mayor que cero.'
        falta('fechaMedicion', 'Escribe la fecha de medición.')
        if (v.fechaMedicion > hoy) e.fechaMedicion = 'La fecha de medición no puede ser posterior a hoy.'
        break
      case 'leche':
        falta('codigoArete', 'Selecciona una vaca.')
        if (!(Number(v.litros) > 0)) e.litros = 'Los litros deben ser mayores que cero.'
        falta('fecha', 'Escribe la fecha.')
        if (v.fecha > hoy) e.fecha = 'La fecha no puede ser posterior a hoy.'
        else if (v.fechaParto && v.fecha && v.fecha < v.fechaParto) e.fecha = `La fecha no puede ser anterior al parto (${fecha(v.fechaParto)}).`
        break
      case 'parto':
        falta('codigoAreteMadre', 'Selecciona una hembra registrada.')
        falta('fecha', 'Escribe la fecha del parto.')
        if (v.fecha > hoy) e.fecha = 'La fecha del parto no puede ser posterior a hoy.'
        crias.forEach((c, i) => {
          if (!c.codigoArete.trim()) e[`cria${i}`] = 'Escribe el arete de la cría.'
          else if (!c.sexo || !c.proposito) e[`cria${i}`] = 'Elige el sexo y el propósito de la cría.'
        })
        break
      case 'sanitario':
        falta('codigoArete', 'Debes seleccionar un animal registrado.')
        falta('descripcion', 'Escribe la descripción.')
        falta('fecha', v.modo === 'programar' ? 'Escribe la fecha programada.' : 'Escribe la fecha del evento.')
        if (v.modo === 'programar' && v.fecha && v.fecha < hoy) e.fecha = 'La fecha programada no puede ser anterior a hoy.'
        if (v.modo !== 'programar' && v.fecha > hoy) e.fecha = 'La fecha del evento no puede ser posterior a hoy.'
        break
    }
    return e
  }

  // ---------- mostrarErrores(mensajes) ----------
  function mostrarErrores(mensajes: Errores, mensajeGeneral: string) {
    setErrores(mensajes)
    setGeneral(mensajeGeneral)
  }

  // ---------- enviar() ----------
  async function enviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    setExito(null)
    const locales = validarCampos()
    if (Object.keys(locales).length) {
      mostrarErrores(locales, 'Revisa los campos marcados.')
      return
    }
    mostrarErrores({}, '')
    setEnviando(true)
    try {
      await guardar()
      alGuardar?.()
    } catch (e) {
      if (e instanceof ErrorApi) mostrarErrores(e.campos, e.message)
      else mostrarErrores({}, 'No se pudo guardar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  async function guardar() {
    const v = valores
    const animal: AnimalRequest = {
      codigoArete: v.codigoArete?.trim(),
      nombre: v.nombre?.trim(),
      sexo: v.sexo as Sexo,
      fechaNacimiento: v.fechaNacimiento || null,
      proposito: v.proposito as Proposito,
    }
    switch (tipo) {
      case 'finca': {
        const s = await enviar<SesionResponse>({ metodo: 'POST', ruta: '/cuentas/fincas', cuerpo: { nombreFinca: v.nombreFinca, nombre: v.nombre, correo: v.correo, contrasena: v.contrasena } })
        alEntrar?.(s)
        navegar('/inicio', { replace: true })
        return
      }
      case 'administrador': {
        const u = await enviar<UsuarioResponse>({ metodo: 'POST', ruta: '/cuentas/administradores', cuerpo: { nombre: v.nombre, correo: v.correo, contrasena: v.contrasena } })
        setExito(`Cuenta de ${u.nombre} creada. Ya puede iniciar sesión.`)
        setValores(valoresIniciales(tipo, ''))
        return
      }
      case 'contrasena':
        await enviar({ metodo: 'POST', ruta: `/sesion/recuperacion/${encodeURIComponent(token ?? '')}`, cuerpo: { contrasena: v.contrasena } })
        setExito(<>Contraseña guardada. <Link to="/ingresar">Ingresa con tu contraseña nueva</Link>.</>)
        setValores(valoresIniciales(tipo, ''))
        return
      case 'animal':
        if (edicion) {
          const a = await enviar<AnimalResponse>({ metodo: 'PUT', ruta: `/animales/${encodeURIComponent(areteRuta!)}`, cuerpo: animal })
          setOriginal(a)
          setExito(`Cambios guardados para ${a.codigoArete}${a.nombre ? ' ' + a.nombre : ''}.`)
          if (a.codigoArete !== areteRuta) navegar(`/animales/${encodeURIComponent(a.codigoArete)}/editar`, { replace: true })
        } else {
          const a = await enviar<AnimalResponse>({ metodo: 'POST', ruta: '/animales', cuerpo: animal })
          setExito(
            <>
              Animal <Link to={`/animales/${encodeURIComponent(a.codigoArete)}`}>{a.codigoArete}</Link> registrado correctamente.
            </>,
          )
          setValores(valoresIniciales(tipo, ''))
        }
        return
      case 'peso': {
        const p = await enviar<PesoResponse>({ metodo: 'POST', ruta: `/animales/${encodeURIComponent(v.codigoArete)}/pesos`, cuerpo: { pesoKg: Number(v.pesoKg), fechaMedicion: v.fechaMedicion } })
        const dif = p.diferenciaKg == null ? '' : ` (${p.diferenciaKg >= 0 ? '+' : '−'}${numero(Math.abs(p.diferenciaKg))} kg)`
        setExito(`Peso guardado para ${v.codigoArete}: ${numero(p.pesoKg)} kg${dif}.`)
        setValores((x) => ({ ...x, pesoKg: '' }))
        return
      }
      case 'leche':
        await enviar({ metodo: 'POST', ruta: '/leche', cuerpo: { codigoArete: v.codigoArete, fechaParto: v.fechaParto || null, fecha: v.fecha, litros: Number(v.litros) } })
        setExito(`Leche del ${fecha(v.fecha)} guardada: ${numero(Number(v.litros))} litros para ${v.codigoArete}.`)
        setValores((x) => ({ ...x, litros: '' }))
        return
      case 'parto': {
        const p = await enviar<PartoResponse>({
          metodo: 'POST',
          ruta: '/partos',
          cuerpo: { codigoAreteMadre: v.codigoAreteMadre, fecha: v.fecha, crias: crias.map((c) => ({ ...c, fechaNacimiento: v.fecha })) },
        })
        setExito(
          p.crias.length
            ? `Parto guardado. ${p.crias.map((c) => c.codigoArete).join(' y ')} ${p.crias.length === 1 ? 'quedó asociada' : 'quedaron asociadas'} a ${v.codigoAreteMadre}.`
            : `Parto del ${fecha(p.fecha)} guardado sin crías para ${v.codigoAreteMadre}.`,
        )
        setCrias([])
        setValores(valoresIniciales(tipo, ''))
        return
      }
      case 'sanitario': {
        const programar = v.modo === 'programar'
        await enviar({
          metodo: 'POST',
          ruta: `/sanitario/animales/${encodeURIComponent(v.codigoArete)}/${programar ? 'programadas' : 'eventos'}`,
          cuerpo: {
            tipo: v.tipoEvento,
            descripcion: v.descripcion,
            fechaProgramada: programar ? v.fecha : null,
            fechaRealizacion: programar ? null : v.fecha,
            observaciones: v.observaciones,
          },
        })
        setExito(`${NOMBRE_TIPO[v.tipoEvento as TipoEventoSanitario]} «${v.descripcion}» ${programar ? `programada para el ${fecha(v.fecha)}` : 'guardada como realizada'} para ${v.codigoArete}.`)
        setValores((x) => ({ ...x, descripcion: '', observaciones: '' }))
        return
      }
    }
  }

  // ---------- mostrarContador() ----------
  function mostrarContador(campo = 'contrasena') {
    const n = valores[campo]?.length ?? 0
    const texto = n < 10 ? `Faltan ${10 - n} caracteres para el mínimo · ${n} de 12` : n < 12 ? `Puedes escribir ${12 - n} caracteres más · ${n} de 12` : 'Llegaste al máximo de 12 caracteres'
    const color = n < 10 ? '#b3261e' : '#2f9e52'
    return (
      <>
        <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < n ? color : '#e3e7e1' }} />
          ))}
        </div>
        <span className={`ayuda ${n < 10 ? 'err' : 'ok'}`} aria-live="polite">{texto}</span>
      </>
    )
  }

  // ---------- piezas de campos ----------
  const campoTexto = ({ campo, etiqueta, tipoInput = 'text', ayuda, max, min, paso, autocompletar }: {
    campo: string; etiqueta: string; tipoInput?: string; ayuda?: string; max?: string; min?: string; paso?: string; autocompletar?: string
  }) => (
    <label className="campo">
      {etiqueta}
      <input className={`inp${errores[campo] ? ' err' : ''}`} type={tipoInput} value={valores[campo] ?? ''} max={max} min={min} step={paso}
        autoComplete={autocompletar} onChange={(e) => cambiar(campo, e.target.value)} aria-invalid={!!errores[campo]} />
      {errores[campo] ? <span className="ayuda err">{errores[campo]}</span> : ayuda && <span className="ayuda">{ayuda}</span>}
    </label>
  )

  const clave = ({ campo = 'contrasena', etiqueta }: { campo?: string; etiqueta: string }) => (
    <label className="campo">
      {etiqueta}
      <span className="con-icono">
        <input className={`inp${errores[campo] ? ' err' : ''}`} type={verClave ? 'text' : 'password'} maxLength={12} autoComplete="new-password"
          value={valores[campo] ?? ''} onChange={(e) => cambiar(campo, e.target.value)} />
        <button type="button" className="boton-icono" aria-label={verClave ? 'Ocultar contraseña' : 'Ver contraseña'} onClick={() => setVerClave(!verClave)}>
          <Icono nombre="ojo" tam={20} />
        </button>
      </span>
      {campo === 'contrasena' && mostrarContador(campo)}
      {errores[campo] && <span className="ayuda err">{errores[campo]}</span>}
    </label>
  )

  const selectorAnimal = ({ campo, etiqueta, lista, ayuda }: { campo: string; etiqueta: string; lista: AnimalResponse[]; ayuda?: string }) => (
    <label className="campo">
      {etiqueta}
      <select className={`inp${errores[campo] ? ' err' : ''}`} value={valores[campo] ?? ''} onChange={(e) => cambiar(campo, e.target.value)}>
        <option value="">Selecciona un animal…</option>
        {lista.map((a) => (
          <option key={a.codigoArete} value={a.codigoArete}>
            {a.codigoArete}{a.nombre ? ` · ${a.nombre}` : ''}
          </option>
        ))}
      </select>
      {errores[campo] ? <span className="ayuda err">{errores[campo]}</span> : ayuda && <span className="ayuda">{ayuda}</span>}
    </label>
  )

  const sexos = ({ valor, alElegir }: { valor: string; alElegir: (s: Sexo) => void }) => (
    <div className="chips">
      {(['HEMBRA', 'MACHO'] as Sexo[]).map((s) => (
        <button key={s} type="button" className={`chip grande${valor === s ? ' on' : ''}`} aria-pressed={valor === s} onClick={() => alElegir(s)}>
          {s === 'HEMBRA' ? 'Hembra' : 'Macho'}
        </button>
      ))}
    </div>
  )

  const resultado = () => (
    <>
      {aviso && <Mensaje tipo="info">{aviso}</Mensaje>}
      {general && <Mensaje tipo="err">{general}</Mensaje>}
      {exito && <Mensaje tipo="ok">{exito}</Mensaje>}
    </>
  )

  const botones = ({ texto }: { texto: string }) => (
    <div className="acciones">
      {(alCancelar || (!embebido && !['finca', 'contrasena'].includes(tipo))) && (
        <button type="button" className="btn borde" onClick={() => (alCancelar ? alCancelar() : navegar(-1))}>
          Cancelar
        </button>
      )}
      <button className="btn" disabled={enviando}>{enviando ? 'Guardando…' : texto}</button>
    </div>
  )

  // ---------- mostrar(tipo) ----------
  switch (tipo) {
    case 'finca':
      return (
        <PaginaPublica>
          <form className="card pila" style={{ width: 720, maxWidth: '100%', padding: '36px 44px' }} onSubmit={enviarFormulario} noValidate>
            <div>
              <h1>Registra tu finca</h1>
              <div className="sub">Crea la cuenta del ganadero. Después podrás agregar a tus administradores.</div>
            </div>
            {campoTexto({ campo: "nombreFinca", etiqueta: "Nombre de la finca" })}
            <div className="fila">
              {campoTexto({ campo: "nombre", etiqueta: "Tu nombre", autocompletar: "name" })}
              {campoTexto({ campo: "correo", etiqueta: "Correo electrónico", tipoInput: "email", autocompletar: "email" })}
            </div>
            {clave({ etiqueta: "Contraseña (10 a 12 caracteres)" })}
            {resultado()}
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#55635b' }}>
                ¿Ya tienes cuenta? <Link to="/ingresar" className="enlace" style={{ fontSize: 14 }}>Ingresar</Link>
              </span>
              <button className="btn" style={{ height: 50, padding: '0 34px' }} disabled={enviando}>{enviando ? 'Creando…' : 'Crear finca y cuenta'}</button>
            </div>
          </form>
        </PaginaPublica>
      )

    case 'contrasena':
      return (
        <PaginaPublica>
          <form className="card pila" style={{ width: 540, maxWidth: '100%', padding: '32px 36px' }} onSubmit={enviarFormulario} noValidate>
            <span className="tag t-b" style={{ alignSelf: 'flex-start' }}>Paso 2 · desde el enlace del correo</span>
            <h2>Crea tu nueva contraseña</h2>
            {clave({ etiqueta: "Nueva contraseña" })}
            {clave({ campo: "repetir", etiqueta: "Repite la contraseña" })}
            <button className="btn" style={{ height: 48 }} disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar contraseña'}</button>
            {resultado()}
            {general && <Link to="/recuperar" className="enlace">Solicitar un enlace nuevo</Link>}
          </form>
        </PaginaPublica>
      )

    case 'administrador':
      return (
        <form className="pila" onSubmit={enviarFormulario} noValidate>
          {campoTexto({ campo: "nombre", etiqueta: "Nombre *" })}
          {campoTexto({ campo: "correo", etiqueta: "Correo *", tipoInput: "email" })}
          {clave({ etiqueta: "Contraseña inicial * (10 a 12 caracteres)" })}
          {resultado()}
          {botones({ texto: "Crear cuenta" })}
        </form>
      )

    case 'animal': {
      const opciones = propositosDe((valores.sexo || null) as Sexo | null)
      return (
        <main className="cuerpo">
          <div className="miga">
            <Link to="/inicio">Inicio</Link> / <Link to="/animales">Animales</Link> / {edicion && <>{areteRuta} / </>}<b>{edicion ? 'Editar' : 'Registrar animal'}</b>
          </div>
          <h1>{edicion ? 'Editar animal' : 'Registrar animal'}</h1>
          <div className="sub">{edicion ? 'Corrige los datos del animal. Su historial no cambia.' : 'Los campos con * son obligatorios.'}</div>
          <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
            <form className="card pila crece" style={{ padding: 32 }} onSubmit={enviarFormulario} noValidate>
              <div className="fila">
                {campoTexto({ campo: "codigoArete", etiqueta: "Código de arete *" })}
                {campoTexto({ campo: "nombre", etiqueta: "Nombre" })}
              </div>
              <div className="fila">
                {campoTexto({ campo: "fechaNacimiento", etiqueta: "Fecha de nacimiento", tipoInput: "date", max: hoyIso(), ayuda: "No puede ser posterior a hoy." })}
                <div className="campo">
                  Sexo *
                  {sexos({ valor: valores.sexo, alElegir: (s: Sexo) => cambiar('sexo', s) })}
                  {errores.sexo ? <span className="ayuda err">{errores.sexo}</span> : original && valores.sexo !== original.sexo && <span className="ayuda">Antes: {original.sexo === 'HEMBRA' ? 'Hembra' : 'Macho'}</span>}
                </div>
              </div>
              <div className="campo">
                <span>
                  Propósito * <span className="ayuda">(según el sexo: macho → engorde o padrón; hembra → engorde o leche)</span>
                </span>
                <div className="fila" style={{ gap: 12 }}>
                  {(['LECHE', 'ENGORDE', 'PADRON'] as Proposito[]).map((p) => {
                    const permitido = opciones.includes(p)
                    return (
                      <button key={p} type="button" className={`opcion${valores.proposito === p ? ' on' : ''}`} disabled={!permitido}
                        aria-pressed={valores.proposito === p} onClick={() => cambiar('proposito', p)}>
                        <h3>{NOMBRE_PROPOSITO[p]}</h3>
                        <div className="ayuda">{permitido ? DESCRIPCION_PROPOSITO[p] : p === 'PADRON' ? 'Solo para machos' : 'Solo para hembras'}</div>
                      </button>
                    )
                  })}
                </div>
                {errores.proposito && <span className="ayuda err">{errores.proposito}</span>}
              </div>
              <div className="sep" style={{ margin: 0 }} />
              {botones({ texto: edicion ? 'Guardar cambios' : 'Guardar animal' })}
            </form>
            <aside className="pila" style={{ width: 360, maxWidth: '100%' }}>
              {resultado()}
              {edicion && original && (
                <Link to={`/animales/${encodeURIComponent(original.codigoArete)}`} className="btn borde">
                  <Icono nombre="atras" color="#13392b" tam={16} /> Volver a la página del animal
                </Link>
              )}
              <div className="card" style={{ background: '#13392b' }}>
                <h3 style={{ color: '#f2c230' }}>{edicion ? 'Al editar' : 'Reglas'}</h3>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, marginTop: 8, color: '#dfeee0' }}>
                  • El arete es único dentro de tu finca{edicion ? '; si ya existe, se conserva el anterior' : ''}.<br />
                  • Macho: engorde o padrón.<br />• Hembra: engorde o leche.<br />
                  {edicion ? '• Si cambias el sexo, eliges de nuevo el propósito.' : '• Las crías se registran desde el parto.'}
                </div>
              </div>
            </aside>
          </div>
        </main>
      )
    }

    case 'peso':
      return (
        <form className="card pila crece" style={{ padding: 30 }} onSubmit={enviarFormulario} noValidate>
          <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
            <div className="ico"><Icono nombre="bascula" /></div>
            <h2>Peso</h2>
          </div>
          {selectorAnimal({ campo: "codigoArete", etiqueta: "Animal *", lista: animales })}
          <div className="fila">
            {campoTexto({ campo: "pesoKg", etiqueta: "Peso (kg) *", tipoInput: "number", min: "0", paso: "0.1" })}
            {campoTexto({ campo: "fechaMedicion", etiqueta: "Fecha de medición *", tipoInput: "date", max: hoyIso() })}
          </div>
          {botones({ texto: "Guardar peso" })}
          {resultado()}
          <div className="ayuda">En esta versión el peso se escribe a mano. Más adelante se podrá conectar una báscula o un lector RFID.</div>
        </form>
      )

    case 'leche': {
      const vacas = animales.filter((a) => a.sexo === 'HEMBRA' && a.proposito === 'LECHE')
      return (
        <form className="card pila crece" style={{ padding: 30 }} onSubmit={enviarFormulario} noValidate>
          <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
            <div className="ico"><Icono nombre="leche" /></div>
            <h2>Leche del día</h2>
          </div>
          {selectorAnimal({ campo: "codigoArete", etiqueta: "Vaca de leche *", lista: vacas, ayuda: "Solo hembras de leche con al menos un parto." })}
          {partos && partos.length === 0 && (
            <Mensaje tipo="err">No se puede registrar leche de {valores.codigoArete}: no tiene partos registrados.</Mensaje>
          )}
          {partos && partos.length > 0 && (
            <label className="campo">
              Parto
              <select className="inp" value={valores.fechaParto} onChange={(e) => cambiar('fechaParto', e.target.value)}>
                {[...partos].reverse().map((p, i) => (
                  <option key={p.fecha} value={p.fecha}>{fecha(p.fecha)}{i === 0 ? ' (más reciente)' : ''}</option>
                ))}
              </select>
            </label>
          )}
          <div className="fila">
            {campoTexto({ campo: "fecha", etiqueta: "Fecha *", tipoInput: "date", max: hoyIso() })}
            {campoTexto({ campo: "litros", etiqueta: "Litros *", tipoInput: "number", min: "0", paso: "0.1" })}
          </div>
          <button className="btn" disabled={enviando || (partos !== null && partos.length === 0)}>{enviando ? 'Guardando…' : 'Guardar leche'}</button>
          {resultado()}
        </form>
      )
    }

    case 'parto': {
      const hembras = animales.filter((a) => a.sexo === 'HEMBRA')
      const cambiarCria = (i: number, cambio: Partial<Cria>) => {
        setCrias((cs) => cs.map((c, j) => {
          if (j !== i) return c
          const nueva = { ...c, ...cambio }
          if (cambio.sexo && nueva.proposito && !propositosDe(cambio.sexo).includes(nueva.proposito as Proposito)) nueva.proposito = ''
          return nueva
        }))
        setErrores((e) => ({ ...e, [`cria${i}`]: '' }))
      }
      return (
        <main className="cuerpo">
          <div className="miga"><Link to="/inicio">Inicio</Link> / <Link to="/animales">Animales</Link> / <b>Registrar parto</b></div>
          <h1>Registrar parto</h1>
          <div className="sub">El parto se guarda junto con sus crías. Se puede guardar sin crías.</div>
          <form className="card pila" style={{ marginTop: 22, padding: 30 }} onSubmit={enviarFormulario} noValidate>
            <div className="fila">
              {selectorAnimal({ campo: "codigoAreteMadre", etiqueta: "Madre (hembra registrada) *", lista: hembras })}
              {campoTexto({ campo: "fecha", etiqueta: "Fecha del parto *", tipoInput: "date", max: hoyIso() })}
            </div>
            <div className="sep" style={{ margin: 0 }} />
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Crías</h2>
              <button type="button" className="btn chico borde" onClick={() => setCrias([...crias, { codigoArete: '', nombre: '', sexo: null, proposito: '' }])}>
                <Icono nombre="mas" color="#13392b" tam={14} /> Agregar cría
              </button>
            </div>
            {crias.length === 0 && <div className="ayuda">Sin crías: el parto queda en el historial de la madre (por ejemplo, si la cría murió al nacer).</div>}
            {crias.map((c, i) => (
              <div key={i} className="pila" style={{ gap: 8, padding: 16, borderRadius: 14, background: '#f7f5ee' }}>
                <div className="fila" style={{ alignItems: 'flex-end', gap: 16 }}>
                  <b style={{ paddingBottom: 12, minWidth: 60 }}>Cría {i + 1}</b>
                  <label className="campo">
                    Arete *
                    <input className={`inp${errores[`cria${i}`] ? ' err' : ''}`} value={c.codigoArete} onChange={(e) => cambiarCria(i, { codigoArete: e.target.value })} />
                  </label>
                  <label className="campo">
                    Nombre
                    <input className="inp" value={c.nombre} onChange={(e) => cambiarCria(i, { nombre: e.target.value })} />
                  </label>
                  <div className="campo">
                    Sexo *
                    {sexos({ valor: c.sexo ?? '', alElegir: (s: Sexo) => cambiarCria(i, { sexo: s }) })}
                  </div>
                  <label className="campo">
                    Propósito *
                    <select className="inp" value={c.proposito} disabled={!c.sexo} onChange={(e) => cambiarCria(i, { proposito: e.target.value as Proposito })}>
                      <option value="">{c.sexo ? 'Elige…' : 'Primero el sexo'}</option>
                      {propositosDe(c.sexo).map((p) => <option key={p} value={p}>{NOMBRE_PROPOSITO[p]}</option>)}
                    </select>
                  </label>
                  <button type="button" className="enlace" style={{ color: '#b3261e', paddingBottom: 12 }} onClick={() => setCrias(crias.filter((_, j) => j !== i))}>
                    Quitar
                  </button>
                </div>
                {errores[`cria${i}`] && <span className="ayuda err">{errores[`cria${i}`]}</span>}
              </div>
            ))}
            <div className="ayuda">La fecha de nacimiento de cada cría es la fecha del parto y queda asociada a su madre.</div>
            {resultado()}
            {botones({ texto: crias.length ? 'Guardar parto y crías' : 'Guardar parto' })}
          </form>
        </main>
      )
    }

    case 'sanitario': {
      const programar = valores.modo === 'programar'
      return (
        <form className="card pila" style={{ padding: 30 }} onSubmit={enviarFormulario} noValidate>
          <h2>Registrar evento o actividad</h2>
          <div className="chips">
            {(['VACUNA', 'ENFERMEDAD', 'TRATAMIENTO'] as TipoEventoSanitario[]).map((t) => (
              <button key={t} type="button" className={`chip${valores.tipoEvento === t ? ' on' : ''}`} aria-pressed={valores.tipoEvento === t} onClick={() => cambiar('tipoEvento', t)}>
                {NOMBRE_TIPO[t]}
              </button>
            ))}
          </div>
          {selectorAnimal({ campo: "codigoArete", etiqueta: "Animal *", lista: animales })}
          {campoTexto({ campo: "descripcion", etiqueta: "Descripción *" })}
          <div className="chips">
            <button type="button" className={`chip${!programar ? ' on' : ''}`} onClick={() => cambiar('modo', 'realizado')}>Ya se realizó</button>
            <button type="button" className={`chip${programar ? ' on' : ''}`} onClick={() => cambiar('modo', 'programar')}>Programar para después</button>
          </div>
          {campoTexto({ campo: "fecha", etiqueta: programar ? 'Fecha programada *' : 'Fecha *', tipoInput: "date", min: programar ? hoyIso() : undefined, max: programar ? undefined : hoyIso(), ayuda: programar ? 'No puede ser anterior a hoy.' : 'No puede ser posterior a hoy.' })}
          <label className="campo">
            Observaciones
            <textarea className="inp" value={valores.observaciones} onChange={(e) => cambiar('observaciones', e.target.value)} />
          </label>
          <button className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
          {resultado()}
        </form>
      )
    }
  }
}

function valoresIniciales(tipo: TipoFormulario, arete: string): Valores {
  const hoy = hoyIso()
  switch (tipo) {
    case 'finca':
      return { nombreFinca: '', nombre: '', correo: '', contrasena: '' }
    case 'administrador':
      return { nombre: '', correo: '', contrasena: '' }
    case 'contrasena':
      return { contrasena: '', repetir: '' }
    case 'animal':
      return { codigoArete: '', nombre: '', fechaNacimiento: '', sexo: '', proposito: '' }
    case 'peso':
      return { codigoArete: arete, pesoKg: '', fechaMedicion: hoy }
    case 'leche':
      return { codigoArete: arete, fechaParto: '', fecha: hoy, litros: '' }
    case 'parto':
      return { codigoAreteMadre: arete, fecha: hoy }
    case 'sanitario':
      return { tipoEvento: 'VACUNA', codigoArete: arete, descripcion: '', modo: 'realizado', fecha: hoy, observaciones: '' }
  }
}

/** Banner con el logo para las pantallas sin sesión (P03, P04). */
function PaginaPublica({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="banner" style={{ height: 180 }}>
        <Figuras alto={180} hoja />
        <div style={{ position: 'absolute', left: 'max(16px, calc((100% - 1200px) / 2))', top: 60, zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Marca claro tam={30} />
          </Link>
        </div>
      </section>
      <main className="cuerpo" style={{ display: 'flex', justifyContent: 'center' }}>{children}</main>
    </>
  )
}

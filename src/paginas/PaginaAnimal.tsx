import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Icono, Mensaje } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { AnimalResponse, EventoSanitarioResponse, PartoResponse, PesoResponse, PromedioLecheResponse, TipoEventoSanitario } from '../tipos/dto'
import { DatosAnimal } from './animal/DatosAnimal'
import { DialogosAnimal, type Accion } from './animal/DialogosAnimal'
import { TarjetaLeche, type Periodo } from './animal/TarjetaLeche'
import { TarjetaPartos } from './animal/TarjetaPartos'
import { TarjetaPeso } from './animal/TarjetaPeso'
import { TarjetaSanidad } from './animal/TarjetaSanidad'

type Seccion = 'resumen' | 'sanidad' | 'peso' | 'partos' | 'leche'

const SECCIONES: [Seccion, string][] = [['resumen', 'Resumen'], ['sanidad', 'Sanidad'], ['peso', 'Peso']]
const SECCIONES_HEMBRA: [Seccion, string][] = [['partos', 'Partos y crías'], ['leche', 'Leche']]

/**
 * Pantallas P08, P17 y P18: mostrarDatos(), mostrarSanidad(), mostrarPeso(), mostrarPartosYLeche() y volver().
 * Cada sección es un componente de paginas/animal; aquí quedan los datos, las acciones y la distribución.
 */
export function PaginaAnimal() {
  const { codigoArete = '' } = useParams()
  const navegar = useNavigate()
  const ruta = encodeURIComponent(codigoArete)

  const [animal, setAnimal] = useState<AnimalResponse | null>(null)
  const [noExiste, setNoExiste] = useState('')
  const [historial, setHistorial] = useState<EventoSanitarioResponse[]>([])
  const [programadas, setProgramadas] = useState<EventoSanitarioResponse[]>([])
  const [pesos, setPesos] = useState<PesoResponse[]>([])
  const [partos, setPartos] = useState<PartoResponse[]>([])
  const [seccion, setSeccion] = useState<Seccion>('resumen')
  const [filtroTipo, setFiltroTipo] = useState<TipoEventoSanitario | null>(null)
  const [periodo, setPeriodo] = useState<Periodo>('SEMANA')
  const [leche, setLeche] = useState<PromedioLecheResponse | null>(null)
  const [dialogo, setDialogo] = useState<Accion | null>(null)
  const [bloqueo, setBloqueo] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback(async () => {
    try {
      const a = await enviar<AnimalResponse>({ metodo: 'GET', ruta: `/animales/${ruta}` })
      setAnimal(a)
      const [h, p, prox, pend] = await Promise.all([
        enviar<EventoSanitarioResponse[]>({ metodo: 'GET', ruta: `/sanitario/animales/${ruta}` }),
        enviar<PesoResponse[]>({ metodo: 'GET', ruta: `/animales/${ruta}/pesos` }),
        enviar<EventoSanitarioResponse[]>({ metodo: 'GET', ruta: '/sanitario/proximas?dias=3650' }),
        enviar<EventoSanitarioResponse[]>({ metodo: 'GET', ruta: '/sanitario/pendientes' }),
      ])
      setHistorial(h)
      setPesos(p)
      setProgramadas([...pend, ...prox].filter((e) => e.codigoArete === a.codigoArete))
      if (a.sexo === 'HEMBRA') {
        setPartos(await enviar<PartoResponse[]>({ metodo: 'GET', ruta: `/partos/madres/${ruta}` }))
      }
    } catch (e) {
      if (e instanceof ErrorApi && e.estado === 404) setNoExiste(e.message)
      else setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo cargar el animal.')
    }
  }, [ruta])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Promedios de leche por periodo (HU_019)
  useEffect(() => {
    if (!animal || animal.sexo !== 'HEMBRA') return
    enviar<PromedioLecheResponse>({ metodo: 'GET', ruta: `/leche/${ruta}/promedios?periodo=${periodo}` })
      .then(setLeche)
      .catch(() => setLeche(null))
  }, [animal, periodo, ruta])

  if (noExiste) {
    return (
      <main className="cuerpo">
        <div className="card pila" style={{ maxWidth: 520 }}>
          <Mensaje tipo="info">{noExiste}</Mensaje>
          <Link to="/animales" className="btn borde">Volver al listado</Link>
        </div>
      </main>
    )
  }
  if (!animal) return <main className="cuerpo cargando">{mensaje || 'Cargando…'}</main>

  const hembra = animal.sexo === 'HEMBRA'
  const nombre = animal.nombre ?? animal.codigoArete
  const ver = (s: Seccion) => seccion === 'resumen' || seccion === s
  const secciones = hembra ? [...SECCIONES, ...SECCIONES_HEMBRA] : SECCIONES

  /** Eliminar (HU_005) o pasar a engorde (HU_015), después de la confirmación. */
  async function confirmar() {
    const accion = dialogo
    setDialogo(null)
    try {
      if (accion === 'eliminar') {
        await enviar({ metodo: 'DELETE', ruta: `/animales/${ruta}` })
        navegar('/animales', { replace: true })
      } else if (accion === 'engorde') {
        setAnimal(await enviar<AnimalResponse>({ metodo: 'POST', ruta: `/animales/${ruta}/engorde` }))
        setMensaje(`${nombre} ahora es de engorde y conserva todo su historial.`)
      }
    } catch (e) {
      setBloqueo(e instanceof ErrorApi ? e.message : 'No se pudo completar la operación.')
    }
  }

  return (
    <main className="cuerpo">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/animales" className="btn borde chico"><Icono nombre="atras" color="#13392b" tam={16} /> Volver al listado</Link>
        <div className="fila" style={{ gap: 10, alignItems: 'center' }}>
          {animal.proposito === 'ENGORDE' && <span className="ayuda solo-grande">Ya es de engorde: no tiene cambios de propósito.</span>}
          <Link to={`/animales/${ruta}/editar`} className="btn chico borde">Editar</Link>
          {animal.proposito !== 'ENGORDE' && <button type="button" className="btn chico amar" onClick={() => setDialogo('engorde')}>Pasar a engorde</button>}
          <button type="button" className="btn chico rojo" onClick={() => setDialogo('eliminar')}>Eliminar</button>
        </div>
      </div>
      {mensaje && <div style={{ marginTop: 14 }}><Mensaje tipo="ok">{mensaje}</Mensaje></div>}
      <DatosAnimal animal={animal} pesos={pesos} partos={partos} leche={leche} periodo={periodo} />
      <div className="chips" style={{ margin: '20px 0 14px', alignItems: 'center' }}>
        {secciones.map(([s, t]) => (
          <button key={s} type="button" className={`chip${seccion === s ? ' on' : ''}`} onClick={() => setSeccion(s)}>{t}</button>
        ))}
        {!hembra && <span className="ayuda" style={{ marginLeft: 10 }}>Los machos no tienen secciones de partos ni de leche.</span>}
      </div>
      <div className="fila" style={{ alignItems: 'flex-start' }}>
        {ver('sanidad') && <TarjetaSanidad ruta={ruta} historial={historial} programadas={programadas} filtroTipo={filtroTipo} alFiltrar={setFiltroTipo} />}
        {ver('peso') && <TarjetaPeso ruta={ruta} pesos={pesos} />}
      </div>
      {hembra && (ver('partos') || ver('leche')) && (
        <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
          {ver('partos') && <TarjetaPartos ruta={ruta} partos={partos} />}
          {ver('leche') && <TarjetaLeche leche={leche} periodo={periodo} alElegirPeriodo={setPeriodo} />}
        </div>
      )}
      <DialogosAnimal animal={animal} dialogo={dialogo} bloqueo={bloqueo} alConfirmar={confirmar}
        alCerrar={() => setDialogo(null)} alCerrarBloqueo={() => setBloqueo('')} />
    </main>
  )
}

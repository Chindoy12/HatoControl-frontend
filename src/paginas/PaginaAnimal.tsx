import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CLASE_TIPO, Dialogo, Icono, Mensaje, NOMBRE_SEXO, NOMBRE_TIPO, PropositoTag, SinRegistros, fecha, hoyIso, numero } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { AnimalResponse, EventoSanitarioResponse, PartoResponse, PesoResponse, PromedioLecheResponse, TipoEventoSanitario } from '../tipos/dto'

type Seccion = 'resumen' | 'sanidad' | 'peso' | 'partos' | 'leche'
type Periodo = 'SEMANA' | 'MES' | 'PARTO'

// Pantallas P08, P17 y P18: mostrarDatos(), mostrarSanidad(), mostrarPeso(), mostrarPartosYLeche() y volver().
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
  const [dialogo, setDialogo] = useState<'eliminar' | 'engorde' | null>(null)
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
  const ultimoPeso = pesos.length ? pesos[pesos.length - 1] : null
  const ganancia = pesos.length > 1 ? pesos[pesos.length - 1].pesoKg - pesos[0].pesoKg : null

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

  // ---------- mostrarDatos() ----------
  const datos = (
    <div className="card fila" style={{ marginTop: 18, alignItems: 'center', padding: '26px 30px', gap: 26 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#eaf5dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icono nombre="vaca" tam={54} />
      </div>
      <div style={{ flex: '1 1 260px' }}>
        <div className="fila" style={{ alignItems: 'center', gap: 12 }}>
          <h1>{nombre}</h1>
          <PropositoTag p={animal.proposito} />
          <span className="tag t-g">{NOMBRE_SEXO[animal.sexo]}</span>
        </div>
        <div className="sub">
          Arete <b>{animal.codigoArete}</b>
          {animal.fechaNacimiento ? <> · Nació el {fecha(animal.fechaNacimiento)} · <b>{animal.edadMeses} meses</b></> : <> · Edad: <span style={{ color: '#9aa59e', fontWeight: 700 }}>sin registros</span></>}
        </div>
      </div>
      <Indicador valor={ultimoPeso ? `${numero(ultimoPeso.pesoKg)} kg` : '—'} texto="último peso" />
      {hembra ? (
        <>
          <Indicador valor={String(partos.length)} texto="partos" />
          {animal.proposito === 'LECHE' && <Indicador valor={leche && leche.diasConRegistro ? `${numero(leche.promedioDiario)} L` : '—'} texto={`promedio ${periodo === 'SEMANA' ? 'semana' : periodo === 'MES' ? 'mes' : 'parto'}`} />}
        </>
      ) : (
        ganancia !== null && <Indicador valor={`${ganancia >= 0 ? '+' : '−'}${numero(Math.abs(ganancia))} kg`} texto="desde el primer peso" />
      )}
    </div>
  )

  // ---------- mostrarSanidad() ----------
  const filtrado = historial.filter((e) => !filtroTipo || e.tipo === filtroTipo)
  const sanidad = (
    <div className="card crece">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historial sanitario</h2>
        <Link to={`/sanidad?arete=${ruta}`} className="btn chico"><Icono nombre="mas" color="#fff" tam={14} /> Registrar</Link>
      </div>
      <div className="chips" style={{ margin: '12px 0 4px' }}>
        {([null, 'VACUNA', 'ENFERMEDAD', 'TRATAMIENTO'] as (TipoEventoSanitario | null)[]).map((t) => (
          <button key={t ?? 'todos'} type="button" className={`chip${filtroTipo === t ? ' on' : ''}`} onClick={() => setFiltroTipo(t)}>
            {t ? `${NOMBRE_TIPO[t]}${t === 'ENFERMEDAD' ? 'es' : 's'}` : 'Todos'}
          </button>
        ))}
      </div>
      {filtrado.length === 0 ? (
        <div style={{ marginTop: 10 }}><SinRegistros /></div>
      ) : (
        <div className="tabla">
          <table>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Observaciones</th></tr></thead>
            <tbody>
              {filtrado.map((e) => (
                <tr key={e.id}>
                  <td>{fecha(e.fechaRealizacion)}</td>
                  <td><span className={`tag ${CLASE_TIPO[e.tipo]}`}>{NOMBRE_TIPO[e.tipo]}</span></td>
                  <td>{e.descripcion}</td>
                  <td>{e.observaciones ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h3 style={{ marginTop: 20 }}>Actividades programadas</h3>
      {programadas.length === 0 ? (
        <div style={{ marginTop: 10 }}><SinRegistros /></div>
      ) : (
        <div className="tabla">
          <table>
            <tbody>
              {programadas.map((e) => {
                const vencida = (e.fechaProgramada ?? '') < hoyIso()
                return (
                  <tr key={e.id}>
                    <td style={{ color: vencida ? '#b3261e' : undefined, fontWeight: vencida ? 700 : undefined }}>{fecha(e.fechaProgramada)}</td>
                    <td>{NOMBRE_TIPO[e.tipo]} · {e.descripcion}</td>
                    <td style={{ textAlign: 'right' }}><span className={`tag ${vencida ? 't-r' : 't-a'}`}>{vencida ? 'Vencida' : 'Programada'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ---------- mostrarPeso() ----------
  const peso = (
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
        </>
      )}
    </div>
  )

  // ---------- mostrarPartosYLeche() ----------
  const partosCard = (
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

  const max = Math.max(1, ...(leche?.registros.map((r) => r.litros) ?? [1]))
  const lecheCard = (
    <div className="card crece">
      <h2>Producción de leche</h2>
      <div className="chips" style={{ marginTop: 10 }}>
        {(['SEMANA', 'MES', 'PARTO'] as Periodo[]).map((p) => (
          <button key={p} type="button" className={`chip${periodo === p ? ' on' : ''}`} onClick={() => setPeriodo(p)}>
            {p === 'SEMANA' ? 'Semana' : p === 'MES' ? 'Mes' : 'Parto'}
          </button>
        ))}
      </div>
      {!leche || leche.diasConRegistro === 0 ? (
        <div style={{ marginTop: 14 }}><SinRegistros /></div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 4, marginTop: 14, alignItems: 'flex-end', height: 130, overflowX: 'auto' }}>
            {casillas(leche, periodo).map(({ dia, etiqueta, litros }) => (
              <div key={dia} style={{ flex: '1 0 22px', maxWidth: 48, textAlign: 'center' }} title={`${fecha(dia)}: ${litros == null ? 'sin registro' : numero(litros) + ' L'}`}>
                <div style={{ height: litros == null ? 4 : Math.max(6, (litros / max) * 90), background: litros == null ? '#e3e7e1' : '#9bcb3c', borderRadius: '6px 6px 0 0' }} />
                <div className="ayuda" style={{ fontSize: 10.5 }}>{etiqueta}<br />{litros == null ? '—' : numero(litros)}</div>
              </div>
            ))}
          </div>
          <div className="msg ok" style={{ marginTop: 14, display: 'block' }}>
            Promedio: <b>{numero(leche.promedioDiario)} litros por día</b>
            <br />
            <span style={{ fontWeight: 500 }}>{numero(leche.totalLitros)} L ÷ {leche.diasConRegistro} {leche.diasConRegistro === 1 ? 'día' : 'días'} con registro. Los días sin registro no se cuentan.</span>
          </div>
        </>
      )}
    </div>
  )

  const secciones: [Seccion, string][] = [['resumen', 'Resumen'], ['sanidad', 'Sanidad'], ['peso', 'Peso'], ...(hembra ? ([['partos', 'Partos y crías'], ['leche', 'Leche']] as [Seccion, string][]) : [])]

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
      {datos}
      <div className="chips" style={{ margin: '20px 0 14px', alignItems: 'center' }}>
        {secciones.map(([s, t]) => (
          <button key={s} type="button" className={`chip${seccion === s ? ' on' : ''}`} onClick={() => setSeccion(s)}>{t}</button>
        ))}
        {!hembra && <span className="ayuda" style={{ marginLeft: 10 }}>Los machos no tienen secciones de partos ni de leche.</span>}
      </div>
      <div className="fila" style={{ alignItems: 'flex-start' }}>
        {ver('sanidad') && sanidad}
        {ver('peso') && peso}
      </div>
      {hembra && (ver('partos') || ver('leche')) && (
        <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
          {ver('partos') && partosCard}
          {ver('leche') && lecheCard}
        </div>
      )}

      {dialogo === 'eliminar' && (
        <Dialogo titulo={`¿Eliminar el animal ${animal.codigoArete}?`}
          acciones={<><button className="btn borde" onClick={() => setDialogo(null)}>Cancelar</button><button className="btn rojo" onClick={confirmar}>Sí, eliminar</button></>}>
          <div className="sub" style={{ margin: 0 }}>Solo se puede eliminar un animal registrado por error, sin historial. Esta acción no se puede deshacer.</div>
        </Dialogo>
      )}
      {dialogo === 'engorde' && (
        <Dialogo titulo={`¿Pasar a ${nombre} a engorde?`}
          acciones={<><button className="btn borde" onClick={() => setDialogo(null)}>Cancelar</button><button className="btn amar" onClick={confirmar}>Confirmar cambio</button></>}>
          <div className="sub" style={{ margin: 0 }}>El propósito cambia de <b>{animal.proposito === 'LECHE' ? 'leche' : 'padrón'}</b> a <b>engorde</b>. {nombre} conserva todo su historial.</div>
          {animal.proposito === 'LECHE' && <Mensaje tipo="info">Después del cambio ya no se podrá registrar su leche.</Mensaje>}
        </Dialogo>
      )}
      {bloqueo && (
        <Dialogo titulo="No se pudo completar" acciones={<button className="btn" onClick={() => setBloqueo('')}>Entendido</button>}>
          <Mensaje tipo="err">{bloqueo}</Mensaje>
        </Dialogo>
      )}
    </main>
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

function Indicador({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 18px', borderLeft: '1.5px solid #eef0ec' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#13392b' }}>{valor}</div>
      <div className="ayuda">{texto}</div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icono, NOMBRE_SEXO, PropositoTag, SinRegistros } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { AnimalResponse, Proposito, Sexo } from '../tipos/dto'

const POR_PAGINA = 10

// Pantallas P06 y P15: listar(), filtrar() y abrirAnimal().
export function PaginaAnimales() {
  const navegar = useNavigate()
  const [todos, setTodos] = useState<AnimalResponse[] | null>(null)
  const [texto, setTexto] = useState('')
  const [sexo, setSexo] = useState<Sexo | null>(null)
  const [proposito, setProposito] = useState<Proposito | null>(null)
  const [pagina, setPagina] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    listar()
  }, [])

  function listar() {
    enviar<AnimalResponse[]>({ metodo: 'GET', ruta: '/animales' })
      .then(setTodos)
      .catch((e) => setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el listado.'))
  }

  // filtrar(): búsqueda por arete o nombre, sexo y propósito (HU_002)
  const filtrados = useMemo(() => {
    const t = texto.trim().toLowerCase()
    return (todos ?? []).filter(
      (a) =>
        (!t || a.codigoArete.toLowerCase().includes(t) || (a.nombre ?? '').toLowerCase().includes(t)) &&
        (!sexo || a.sexo === sexo) &&
        (!proposito || a.proposito === proposito),
    )
  }, [todos, texto, sexo, proposito])

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, paginas)
  const visibles = filtrados.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA)
  const abrirAnimal = (a: AnimalResponse) => navegar(`/animales/${encodeURIComponent(a.codigoArete)}`)

  const Chips = <T extends string>({ valor, opciones, alElegir }: { valor: T | null; opciones: [T, string][]; alElegir: (v: T | null) => void }) => (
    <>
      <button type="button" className={`chip${valor === null ? ' on' : ''}`} onClick={() => { alElegir(null); setPagina(1) }}>Todos</button>
      {opciones.map(([v, t]) => (
        <button key={v} type="button" className={`chip${valor === v ? ' on' : ''}`} aria-pressed={valor === v} onClick={() => { alElegir(v); setPagina(1) }}>{t}</button>
      ))}
    </>
  )

  return (
    <main className="cuerpo">
      <div className="miga"><Link to="/inicio">Inicio</Link> / <b>Animales</b></div>
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Mis animales</h1>
          <div className="sub">{todos ? `${todos.length} animales registrados en la finca` : 'Cargando…'}</div>
        </div>
        <Link to="/animales/nuevo" className="btn amar"><Icono nombre="mas" color="#13392b" tam={18} /> Registrar animal</Link>
      </div>
      <div className="card" style={{ marginTop: 22 }}>
        <div className="fila" style={{ alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <label className="con-icono" style={{ flex: '1 1 260px', maxWidth: 360 }}>
            <span className="solo-lectores" style={{ position: 'absolute', left: -9999 }}>Buscar</span>
            <input className="inp" placeholder="Buscar por código de arete o nombre…" value={texto} onChange={(e) => { setTexto(e.target.value); setPagina(1) }} />
            <span className="boton-icono"><Icono nombre="buscar" color="#6b7a72" tam={20} /></span>
          </label>
          <div className="chips" style={{ alignItems: 'center' }}>
            <b style={{ fontSize: 13, color: '#55635b', marginLeft: 6 }}>Sexo</b>
            <Chips valor={sexo} opciones={[['HEMBRA', 'Hembra'], ['MACHO', 'Macho']]} alElegir={setSexo} />
          </div>
          <div className="chips" style={{ alignItems: 'center' }}>
            <b style={{ fontSize: 13, color: '#55635b', marginLeft: 6 }}>Propósito</b>
            <Chips valor={proposito} opciones={[['ENGORDE', 'Engorde'], ['LECHE', 'Leche'], ['PADRON', 'Padrón']]} alElegir={setProposito} />
          </div>
        </div>
        {error && <div className="msg err">{error}</div>}
        {todos && filtrados.length === 0 && <SinRegistros />}
        {visibles.length > 0 && (
          <>
            <div className="tabla solo-grande">
              <table>
                <thead><tr><th>Arete</th><th>Nombre</th><th>Sexo</th><th>Propósito</th><th>Edad</th><th></th></tr></thead>
                <tbody>
                  {visibles.map((a) => (
                    <tr key={a.codigoArete}>
                      <td><b>{a.codigoArete}</b></td>
                      <td>{a.nombre ?? '—'}</td>
                      <td>{NOMBRE_SEXO[a.sexo]}</td>
                      <td><PropositoTag p={a.proposito} /></td>
                      <td style={{ color: a.edadMeses == null ? '#9aa59e' : undefined }}>{a.edadMeses == null ? 'sin registros' : `${a.edadMeses} meses`}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="btn chico borde" onClick={() => abrirAnimal(a)}>Abrir <Icono nombre="flecha" color="#13392b" tam={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pila solo-cel" style={{ gap: 10 }}>
              {visibles.map((a) => (
                <button key={a.codigoArete} type="button" className="card" onClick={() => abrirAnimal(a)}
                  style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #e3e7e1', textAlign: 'left', cursor: 'pointer' }}>
                  <div className="ico" style={{ width: 40, height: 40 }}><Icono nombre="vaca" tam={20} /></div>
                  <div style={{ flex: 1 }}>
                    <b>{a.nombre ?? '—'}</b> <span className="ayuda">{a.codigoArete}</span>
                    <div className="ayuda">{NOMBRE_SEXO[a.sexo]} · {a.edadMeses == null ? 'sin registros' : `${a.edadMeses} meses`}</div>
                  </div>
                  <PropositoTag p={a.proposito} />
                </button>
              ))}
            </div>
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 13, color: '#6b7a72' }}>
              <span>Mostrando {visibles.length} de {filtrados.length}</span>
              {paginas > 1 && (
                <div className="chips">
                  {Array.from({ length: paginas }, (_, i) => (
                    <button key={i} type="button" className={`chip${actual === i + 1 ? ' on' : ''}`} onClick={() => setPagina(i + 1)}>{i + 1}</button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

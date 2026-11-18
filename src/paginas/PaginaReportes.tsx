import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Icono, SinRegistros, fecha, numero, type NombreIcono } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { AnimalResponse, ReporteResponse } from '../tipos/dto'

type Tipo = 'ANIMALES' | 'SANITARIO' | 'PESO'

const TIPOS: { tipo: Tipo; icono: NombreIcono; titulo: string; texto: string; columnas: string[] }[] = [
  { tipo: 'ANIMALES', icono: 'vaca', titulo: 'Animales', texto: 'Listado con datos principales', columnas: ['Arete', 'Nombre', 'Sexo', 'Propósito', 'Edad (meses)'] },
  { tipo: 'SANITARIO', icono: 'jeringa', titulo: 'Historial sanitario', texto: 'De un animal', columnas: ['Fecha', 'Tipo', 'Descripción', 'Observaciones'] },
  { tipo: 'PESO', icono: 'bascula', titulo: 'Historial de peso', texto: 'De un animal', columnas: ['Fecha', 'Peso (kg)', 'Variación (kg)'] },
]

const TEXTOS: Record<string, string> = {
  HEMBRA: 'Hembra', MACHO: 'Macho', ENGORDE: 'Engorde', LECHE: 'Leche', PADRON: 'Padrón',
  VACUNA: 'Vacuna', ENFERMEDAD: 'Enfermedad', TRATAMIENTO: 'Tratamiento',
}

/** Fechas dd/mm/aaaa, nombres en español y números con signo en la variación de peso. */
function celdaLegible(tipo: Tipo, columna: number, celda: string): string {
  if (!celda) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(celda)) return fecha(celda)
  if (TEXTOS[celda]) return TEXTOS[celda]
  if (tipo === 'PESO' && columna > 0) {
    const n = Number(celda)
    return columna === 2 ? `${n >= 0 ? '+' : '−'}${numero(Math.abs(n))}` : numero(n)
  }
  return celda
}

// Pantallas P13 y P24: generar(tipo). Solo muestra registros guardados; nunca estima valores (HU_014).
export function PaginaReportes() {
  const [tipo, setTipo] = useState<Tipo>('ANIMALES')
  const [arete, setArete] = useState('')
  const [animales, setAnimales] = useState<AnimalResponse[]>([])
  const [reporte, setReporte] = useState<ReporteResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    enviar<AnimalResponse[]>({ metodo: 'GET', ruta: '/animales' }).then(setAnimales).catch(() => setAnimales([]))
  }, [])

  async function generar() {
    setError('')
    setReporte(null)
    if (tipo !== 'ANIMALES' && !arete) {
      setError('Selecciona el animal del reporte.')
      return
    }
    try {
      setReporte(await enviar<ReporteResponse>({ metodo: 'POST', ruta: '/reportes', cuerpo: { tipo, codigoArete: tipo === 'ANIMALES' ? null : arete } }))
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo generar el reporte.')
    }
  }

  const actual = TIPOS.find((t) => t.tipo === tipo)!
  const elegido = animales.find((a) => a.codigoArete === arete)

  return (
    <main className="cuerpo">
      <div className="miga"><Link to="/inicio">Inicio</Link> / <b>Reportes</b></div>
      <h1>Reportes</h1>
      <div className="sub">Se generan solo con los registros guardados; nunca con datos estimados.</div>
      <div className="fila" style={{ marginTop: 22 }}>
        {TIPOS.map((t) => (
          <button key={t.tipo} type="button" className="card fila" onClick={() => { setTipo(t.tipo); setReporte(null); setError('') }}
            style={{ flex: '1 1 240px', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', border: tipo === t.tipo ? '2.5px solid #13392b' : '1.5px solid #e3e7e1' }}>
            <div className="ico"><Icono nombre={t.icono} /></div>
            <div><h3>{t.titulo}</h3><div className="ayuda">{t.texto}</div></div>
          </button>
        ))}
      </div>
      <div className="card" style={{ marginTop: 22 }}>
        <div className="fila" style={{ alignItems: 'flex-end', gap: 16 }}>
          {tipo !== 'ANIMALES' && (
            <label className="campo" style={{ maxWidth: 360 }}>
              Animal (código de arete)
              <select className="inp" value={arete} onChange={(e) => { setArete(e.target.value); setReporte(null) }}>
                <option value="">Selecciona un animal…</option>
                {animales.map((a) => <option key={a.codigoArete} value={a.codigoArete}>{a.codigoArete}{a.nombre ? ` · ${a.nombre}` : ''}</option>)}
              </select>
            </label>
          )}
          <button type="button" className="btn" onClick={generar}>Generar reporte</button>
          {reporte && reporte.filas.length > 0 && <button type="button" className="btn borde" onClick={() => window.print()}>Imprimir</button>}
        </div>
        {error && <div className="msg err" style={{ marginTop: 16 }}>{error}</div>}
        {reporte && (
          <>
            <div className="sep" />
            <h2>{actual.titulo}{tipo !== 'ANIMALES' && elegido ? ` · ${elegido.codigoArete} ${elegido.nombre ?? ''}` : ''}</h2>
            <div className="ayuda">Generado el {fecha(reporte.fechaGeneracion)}</div>
            {reporte.filas.length === 0 ? (
              <div style={{ marginTop: 14 }}><SinRegistros /></div>
            ) : (
              <div className="tabla" style={{ marginTop: 8 }}>
                <table>
                  <thead><tr>{actual.columnas.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {reporte.filas.map((f, i) => (
                      <tr key={i}>
                        {f.split('\t').map((celda, j) => (
                          <td key={j}>{celdaLegible(tipo, j, celda)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

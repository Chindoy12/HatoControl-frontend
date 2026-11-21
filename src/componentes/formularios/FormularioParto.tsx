import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { enviar } from '../../servicios/ClienteApi'
import type { PartoResponse, Proposito, Sexo } from '../../tipos/dto'
import { Icono, NOMBRE_PROPOSITO, fecha, hoyIso, propositosDe } from '../piezas'
import { Botones, CampoTexto, Resultado, SelectorAnimal, Sexos } from './campos'
import type { Cria, Errores, PropsFormulario, Valores } from './tipos'
import { useAnimales } from './useAnimales'
import { useFormulario, type EstadoFormulario } from './useFormulario'
import { exigir } from './validaciones'

const CRIA_NUEVA: Cria = { codigoArete: '', nombre: '', sexo: null, proposito: '' }

/** HU_015 y HU_016: parto con sus crías; se puede guardar sin crías (P08). */
export function FormularioParto(props: PropsFormulario) {
  const [consulta] = useSearchParams()
  const hembras = useAnimales().filter((a) => a.sexo === 'HEMBRA')
  const [crias, setCrias] = useState<Cria[]>([])
  const f = useFormulario(props, {
    iniciales: { codigoAreteMadre: consulta.get('arete') ?? '', fecha: hoyIso() },
    validar: (v) => validarParto(v, crias),
    guardar,
  })

  async function guardar(v: Valores) {
    const parto = await enviar<PartoResponse>({
      metodo: 'POST',
      ruta: '/partos',
      cuerpo: { codigoAreteMadre: v.codigoAreteMadre, fecha: v.fecha, crias: crias.map((c) => ({ ...c, fechaNacimiento: v.fecha })) },
    })
    f.setExito(mensajeGuardado(parto, v.codigoAreteMadre))
    setCrias([])
    f.setValores({ codigoAreteMadre: '', fecha: hoyIso() })
  }

  function cambiarCria(i: number, cambio: Partial<Cria>) {
    setCrias((cs) => cs.map((c, j) => {
      if (j !== i) return c
      const nueva = { ...c, ...cambio }
      // Si el sexo nuevo no admite el propósito elegido, se vuelve a elegir
      if (cambio.sexo && nueva.proposito && !propositosDe(cambio.sexo).includes(nueva.proposito as Proposito)) nueva.proposito = ''
      return nueva
    }))
    f.setErrores((e) => ({ ...e, [`cria${i}`]: '' }))
  }

  return (
    <main className="cuerpo">
      <div className="miga"><Link to="/inicio">Inicio</Link> / <Link to="/animales">Animales</Link> / <b>Registrar parto</b></div>
      <h1>Registrar parto</h1>
      <div className="sub">El parto se guarda junto con sus crías. Se puede guardar sin crías.</div>
      <form className="card pila" style={{ marginTop: 22, padding: 30 }} onSubmit={f.enviar} noValidate>
        <div className="fila">
          <SelectorAnimal f={f} campo="codigoAreteMadre" etiqueta="Madre (hembra registrada) *" lista={hembras} />
          <CampoTexto f={f} campo="fecha" etiqueta="Fecha del parto *" tipoInput="date" max={hoyIso()} />
        </div>
        <div className="sep" style={{ margin: 0 }} />
        <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Crías</h2>
          <button type="button" className="btn chico borde" onClick={() => setCrias([...crias, CRIA_NUEVA])}>
            <Icono nombre="mas" color="#13392b" tam={14} /> Agregar cría
          </button>
        </div>
        {crias.length === 0 && <div className="ayuda">Sin crías: el parto queda en el historial de la madre (por ejemplo, si la cría murió al nacer).</div>}
        {crias.map((c, i) => (
          <FilaCria key={i} f={f} numero={i} cria={c} alCambiar={(cambio) => cambiarCria(i, cambio)}
            alQuitar={() => setCrias(crias.filter((_, j) => j !== i))} />
        ))}
        <div className="ayuda">La fecha de nacimiento de cada cría es la fecha del parto y queda asociada a su madre.</div>
        <Resultado f={f} />
        <Botones f={f} texto={crias.length ? 'Guardar parto y crías' : 'Guardar parto'} />
      </form>
    </main>
  )
}

interface PropsFilaCria {
  f: EstadoFormulario
  numero: number
  cria: Cria
  alCambiar: (cambio: Partial<Cria>) => void
  alQuitar: () => void
}

function FilaCria({ f, numero, cria, alCambiar, alQuitar }: PropsFilaCria) {
  const error = f.errores[`cria${numero}`]
  return (
    <div className="pila" style={{ gap: 8, padding: 16, borderRadius: 14, background: '#f7f5ee' }}>
      <div className="fila" style={{ alignItems: 'flex-end', gap: 16 }}>
        <b style={{ paddingBottom: 12, minWidth: 60 }}>Cría {numero + 1}</b>
        <label className="campo">
          Arete *
          <input className={`inp${error ? ' err' : ''}`} value={cria.codigoArete} onChange={(e) => alCambiar({ codigoArete: e.target.value })} />
        </label>
        <label className="campo">
          Nombre
          <input className="inp" value={cria.nombre} onChange={(e) => alCambiar({ nombre: e.target.value })} />
        </label>
        <div className="campo">
          Sexo *
          <Sexos valor={cria.sexo ?? ''} alElegir={(s: Sexo) => alCambiar({ sexo: s })} />
        </div>
        <label className="campo">
          Propósito *
          <select className="inp" value={cria.proposito} disabled={!cria.sexo} onChange={(e) => alCambiar({ proposito: e.target.value as Proposito })}>
            <option value="">{cria.sexo ? 'Elige…' : 'Primero el sexo'}</option>
            {propositosDe(cria.sexo).map((p) => <option key={p} value={p}>{NOMBRE_PROPOSITO[p]}</option>)}
          </select>
        </label>
        <button type="button" className="enlace" style={{ color: '#b3261e', paddingBottom: 12 }} onClick={alQuitar}>
          Quitar
        </button>
      </div>
      {error && <span className="ayuda err">{error}</span>}
    </div>
  )
}

function mensajeGuardado(parto: PartoResponse, madre: string): string {
  if (!parto.crias.length) return `Parto del ${fecha(parto.fecha)} guardado sin crías para ${madre}.`
  const aretes = parto.crias.map((c) => c.codigoArete).join(' y ')
  return `Parto guardado. ${aretes} ${parto.crias.length === 1 ? 'quedó asociada' : 'quedaron asociadas'} a ${madre}.`
}

function validarParto(v: Valores, crias: Cria[]): Errores {
  const e: Errores = {}
  exigir(v, e, 'codigoAreteMadre', 'Selecciona una hembra registrada.')
  exigir(v, e, 'fecha', 'Escribe la fecha del parto.')
  if (v.fecha > hoyIso()) e.fecha = 'La fecha del parto no puede ser posterior a hoy.'
  crias.forEach((c, i) => {
    if (!c.codigoArete.trim()) e[`cria${i}`] = 'Escribe el arete de la cría.'
    else if (!c.sexo || !c.proposito) e[`cria${i}`] = 'Elige el sexo y el propósito de la cría.'
  })
  return e
}

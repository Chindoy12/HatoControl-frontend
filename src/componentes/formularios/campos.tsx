import type { AnimalResponse, Sexo } from '../../tipos/dto'
import { Icono, Mensaje } from '../piezas'
import type { EstadoFormulario } from './useFormulario'

interface PropsCampo {
  f: EstadoFormulario
  campo: string
  etiqueta: string
  ayuda?: string
}

function Ayuda({ error, ayuda }: { error?: string; ayuda?: string }) {
  if (error) return <span className="ayuda err">{error}</span>
  return ayuda ? <span className="ayuda">{ayuda}</span> : null
}

export function CampoTexto({ f, campo, etiqueta, ayuda, tipoInput = 'text', max, min, paso, autocompletar }: PropsCampo & {
  tipoInput?: string; max?: string; min?: string; paso?: string; autocompletar?: string
}) {
  const error = f.errores[campo]
  return (
    <label className="campo">
      {etiqueta}
      <input className={`inp${error ? ' err' : ''}`} type={tipoInput} value={f.valores[campo] ?? ''} max={max} min={min} step={paso}
        autoComplete={autocompletar} onChange={(e) => f.cambiar(campo, e.target.value)} aria-invalid={!!error} />
      <Ayuda error={error} ayuda={ayuda} />
    </label>
  )
}

export function Contador({ largo }: { largo: number }) {
  const texto = largo < 10 ? `Faltan ${10 - largo} caracteres para el mínimo · ${largo} de 12`
    : largo < 12 ? `Puedes escribir ${12 - largo} caracteres más · ${largo} de 12` : 'Llegaste al máximo de 12 caracteres'
  const color = largo < 10 ? '#b3261e' : '#2f9e52'
  return (
    <>
      <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < largo ? color : '#e3e7e1' }} />
        ))}
      </div>
      <span className={`ayuda ${largo < 10 ? 'err' : 'ok'}`} aria-live="polite">{texto}</span>
    </>
  )
}

export function Clave({ f, campo = 'contrasena', etiqueta }: Omit<PropsCampo, 'campo' | 'ayuda'> & { campo?: string }) {
  const error = f.errores[campo]
  return (
    <label className="campo">
      {etiqueta}
      <span className="con-icono">
        <input className={`inp${error ? ' err' : ''}`} type={f.verClave ? 'text' : 'password'} maxLength={12} autoComplete="new-password"
          value={f.valores[campo] ?? ''} onChange={(e) => f.cambiar(campo, e.target.value)} />
        <button type="button" className="boton-icono" aria-label={f.verClave ? 'Ocultar contraseña' : 'Ver contraseña'} onClick={() => f.setVerClave(!f.verClave)}>
          <Icono nombre="ojo" tam={20} />
        </button>
      </span>
      {campo === 'contrasena' && <Contador largo={f.valores[campo]?.length ?? 0} />}
      <Ayuda error={error} />
    </label>
  )
}

export function SelectorAnimal({ f, campo, etiqueta, ayuda, lista }: PropsCampo & { lista: AnimalResponse[] }) {
  const error = f.errores[campo]
  return (
    <label className="campo">
      {etiqueta}
      <select className={`inp${error ? ' err' : ''}`} value={f.valores[campo] ?? ''} onChange={(e) => f.cambiar(campo, e.target.value)}>
        <option value="">Selecciona un animal…</option>
        {lista.map((a) => (
          <option key={a.codigoArete} value={a.codigoArete}>
            {a.codigoArete}{a.nombre ? ` · ${a.nombre}` : ''}
          </option>
        ))}
      </select>
      <Ayuda error={error} ayuda={ayuda} />
    </label>
  )
}

export function Sexos({ valor, alElegir }: { valor: string; alElegir: (s: Sexo) => void }) {
  return (
    <div className="chips">
      {(['HEMBRA', 'MACHO'] as Sexo[]).map((s) => (
        <button key={s} type="button" className={`chip grande${valor === s ? ' on' : ''}`} aria-pressed={valor === s} onClick={() => alElegir(s)}>
          {s === 'HEMBRA' ? 'Hembra' : 'Macho'}
        </button>
      ))}
    </div>
  )
}

export function Resultado({ f }: { f: EstadoFormulario }) {
  return (
    <>
      {f.aviso && <Mensaje tipo="info">{f.aviso}</Mensaje>}
      {f.general && <Mensaje tipo="err">{f.general}</Mensaje>}
      {f.exito && <Mensaje tipo="ok">{f.exito}</Mensaje>}
    </>
  )
}

export function Botones({ f, texto }: { f: EstadoFormulario; texto: string }) {
  return (
    <div className="acciones">
      {f.cancelar && (
        <button type="button" className="btn borde" onClick={f.cancelar}>
          Cancelar
        </button>
      )}
      <BotonGuardar f={f} texto={texto} />
    </div>
  )
}

export function BotonGuardar({ f, texto, alto, desactivado = false }: { f: EstadoFormulario; texto: string; alto?: number; desactivado?: boolean }) {
  return (
    <button className="btn" style={alto ? { height: alto } : undefined} disabled={f.enviando || desactivado}>
      {f.enviando ? 'Guardando…' : texto}
    </button>
  )
}

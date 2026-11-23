// Apoyo visual (autorizado en la Fase 10): íconos, logo, mensajes y formatos que repiten todas las pantallas.
// Solo dibuja; no tiene datos ni reglas del negocio.
import type { ReactNode } from 'react'
import type { Proposito, Sexo, TipoEventoSanitario } from '../tipos/dto'

const TRAZOS: Record<string, ReactNode> = {
  vaca: (
    <>
      <path d="M5 9c0-2 1-3 3-3h8c2 0 3 1 3 3v5c0 3-3 5-7 5s-7-2-7-5z" fill="none" strokeWidth="2" />
      <path d="M5 8 2 6M19 8l3-2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="15.5" rx="3" ry="1.8" fill="none" strokeWidth="1.6" />
    </>
  ),
  jeringa: (
    <path d="m15 4 5 5M17 6l-9.5 9.5-3 .5.5-3L14.5 3.5M11 9l2 2M8.5 11.5l2 2M4.5 19.5 3 21" fill="none" strokeWidth="2" strokeLinecap="round" />
  ),
  bascula: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" fill="none" strokeWidth="2" />
      <path d="M8 11a4 4 0 0 1 8 0" fill="none" strokeWidth="2" />
      <path d="m12 11 2-2M9 4h6" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  leche: (
    <>
      <path d="M9 2h6v3l2 4v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l2-4z" fill="none" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 13c2-1 4 1 5 0s3-1 5 0" fill="none" strokeWidth="2" />
    </>
  ),
  grafica: (
    <>
      <path d="M4 20V4M4 20h16" strokeWidth="2" strokeLinecap="round" />
      <path d="m7 15 4-4 3 3 5-6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  doc: (
    <>
      <path d="M6 2h8l5 5v15H6z" fill="none" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 2v5h5M9 13h7M9 17h7" strokeWidth="2" />
    </>
  ),
  personas: (
    <>
      <circle cx="9" cy="8" r="3.5" fill="none" strokeWidth="2" />
      <path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6" fill="none" strokeWidth="2" />
      <circle cx="17" cy="9" r="2.6" fill="none" strokeWidth="2" />
      <path d="M17 14c2.5 0 4.2 1.6 4.6 4.5" fill="none" strokeWidth="2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" fill="none" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="6.5" fill="none" strokeWidth="2" />
      <path d="m16 16 4.5 4.5" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  ojo: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" fill="none" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="none" strokeWidth="2" />
    </>
  ),
  flecha: <path d="M5 12h14m-6-6 6 6-6 6" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  atras: <path d="M19 12H5m6-6-6 6 6 6" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  mas: <path d="M12 5v14M5 12h14" strokeWidth="2.4" strokeLinecap="round" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  alerta: (
    <>
      <path d="M12 3 2 20h20z" fill="none" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.5" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  candado: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2.5" fill="none" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" strokeWidth="2" />
    </>
  ),
  casa: <path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" strokeWidth="2" strokeLinejoin="round" />,
}

export type NombreIcono = keyof typeof TRAZOS

export function Icono({ nombre, color = '#2f9e52', tam = 24 }: { nombre: NombreIcono; color?: string; tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" stroke={color} color={color} aria-hidden="true">
      {TRAZOS[nombre]}
    </svg>
  )
}

export function Marca({ claro = false, tam = 24 }: { claro?: boolean; tam?: number }) {
  const s = tam + 10
  return (
    <span className={`logo${claro ? ' claro' : ''}`} style={{ fontSize: tam }}>
      <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 3c8 0 14 5 14 12 0 9-8 13-9 21H15C14 28 6 24 6 15 6 8 12 3 20 3z" fill="#9bcb3c" />
        <circle cx="20" cy="12" r="3.6" fill="#13392b" />
        <path d="M14 22h12M15.5 27h9" stroke="#13392b" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span>
        <span className="h">Hato</span>
        <span className="c">Control</span>
      </span>
    </span>
  )
}

export function Figuras({ alto, hoja = false }: { alto: number; hoja?: boolean }) {
  return (
    <>
      <div className="arc" style={{ width: alto * 1.6, height: alto * 1.6, left: -alto * 0.9, top: -alto * 0.5, border: `${Math.round(alto * 0.16)}px solid #2f9e52`, opacity: 0.9 }} />
      <div className="arc" style={{ width: alto * 1.2, height: alto * 1.2, right: -alto * 0.55, bottom: -alto * 0.75, border: `${Math.round(alto * 0.14)}px solid #f2c230` }} />
      {hoja && <div className="hoja-deco" style={{ right: '32%', top: alto * 0.14, width: alto * 0.22, height: alto * 0.22 }} />}
    </>
  )
}

export function Mensaje({ tipo, children }: { tipo: 'ok' | 'err' | 'info'; children: ReactNode }) {
  const icono = tipo === 'ok' ? 'check' : 'alerta'
  const color = tipo === 'ok' ? '#2f6b12' : tipo === 'err' ? '#9e2a20' : '#6b4f00'
  return (
    <div className={`msg ${tipo}`} role={tipo === 'err' ? 'alert' : 'status'}>
      <Icono nombre={icono} color={color} tam={20} />
      <div>{children}</div>
    </div>
  )
}

export function SinRegistros({ children }: { children?: ReactNode }) {
  return <div className="vacio">{children ?? 'sin registros'}</div>
}

// ---------- formatos ----------

export function fecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [a, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

export function hoyIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
}

export function numero(valor: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(valor)
}

export const NOMBRE_PROPOSITO: Record<Proposito, string> = { ENGORDE: 'Engorde', PADRON: 'Padrón', LECHE: 'Leche' }
export const CLASE_PROPOSITO: Record<Proposito, string> = { ENGORDE: 't-v', PADRON: 't-a', LECHE: 't-b' }
export const NOMBRE_SEXO: Record<Sexo, string> = { HEMBRA: 'Hembra', MACHO: 'Macho' }
export const NOMBRE_TIPO: Record<TipoEventoSanitario, string> = { VACUNA: 'Vacuna', ENFERMEDAD: 'Enfermedad', TRATAMIENTO: 'Tratamiento' }
export const CLASE_TIPO: Record<TipoEventoSanitario, string> = { VACUNA: 't-v', ENFERMEDAD: 't-r', TRATAMIENTO: 't-b' }

export function propositosDe(sexo: Sexo | null): Proposito[] {
  if (sexo === 'MACHO') return ['ENGORDE', 'PADRON']
  if (sexo === 'HEMBRA') return ['ENGORDE', 'LECHE']
  return []
}

export function PropositoTag({ p }: { p: Proposito }) {
  return <span className={`tag ${CLASE_PROPOSITO[p]}`}>{NOMBRE_PROPOSITO[p]}</span>
}

export function Dialogo({ titulo, children, acciones }: { titulo: string; children: ReactNode; acciones: ReactNode }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="card dialogo">
        <h2>{titulo}</h2>
        {children}
        <div className="acciones">{acciones}</div>
      </div>
    </div>
  )
}

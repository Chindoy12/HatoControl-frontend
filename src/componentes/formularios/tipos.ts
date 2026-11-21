import type { Proposito, SesionResponse, Sexo } from '../../tipos/dto'

export type TipoFormulario = 'animal' | 'sanitario' | 'peso' | 'parto' | 'leche' | 'finca' | 'administrador' | 'contrasena'

/** Lo que recibe cualquier formulario; todos comparten estas propiedades. */
export interface PropsFormulario {
  /** Dentro de otra pantalla (tarjeta), sin título de página. */
  embebido?: boolean
  /** Registro de finca: deja al ganadero dentro del sistema. */
  alEntrar?: (s: SesionResponse) => void
  /** Avisa a la pantalla que lo contiene para que recargue sus datos. */
  alGuardar?: () => void
  alCancelar?: () => void
}

/** Valores escritos en los campos, por nombre de campo. */
export type Valores = Record<string, string>
/** Mensaje de error por nombre de campo. */
export type Errores = Record<string, string>

export interface Cria {
  codigoArete: string
  nombre: string
  sexo: Sexo | null
  proposito: Proposito | ''
}

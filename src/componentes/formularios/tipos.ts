import type { Proposito, SesionResponse, Sexo } from '../../tipos/dto'

export type TipoFormulario = 'animal' | 'sanitario' | 'peso' | 'parto' | 'leche' | 'finca' | 'administrador' | 'contrasena'

export interface PropsFormulario {
  embebido?: boolean
  alEntrar?: (s: SesionResponse) => void
  alGuardar?: () => void
  alCancelar?: () => void
}

export type Valores = Record<string, string>
export type Errores = Record<string, string>

export interface Cria {
  codigoArete: string
  nombre: string
  sexo: Sexo | null
  proposito: Proposito | ''
}

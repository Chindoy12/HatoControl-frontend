import type { ComponentType } from 'react'
import { FormularioAdministrador } from './formularios/FormularioAdministrador'
import { FormularioAnimal } from './formularios/FormularioAnimal'
import { FormularioContrasena } from './formularios/FormularioContrasena'
import { FormularioFinca } from './formularios/FormularioFinca'
import { FormularioLeche } from './formularios/FormularioLeche'
import { FormularioParto } from './formularios/FormularioParto'
import { FormularioPeso } from './formularios/FormularioPeso'
import { FormularioSanitario } from './formularios/FormularioSanitario'
import type { PropsFormulario, TipoFormulario } from './formularios/tipos'

export type { TipoFormulario } from './formularios/tipos'

const FORMULARIOS: Record<TipoFormulario, ComponentType<PropsFormulario>> = {
  animal: FormularioAnimal,
  sanitario: FormularioSanitario,
  peso: FormularioPeso,
  parto: FormularioParto,
  leche: FormularioLeche,
  finca: FormularioFinca,
  administrador: FormularioAdministrador,
  contrasena: FormularioContrasena,
}

export function Formulario({ tipo, ...props }: PropsFormulario & { tipo: TipoFormulario }) {
  const Elegido = FORMULARIOS[tipo]
  return <Elegido {...props} />
}

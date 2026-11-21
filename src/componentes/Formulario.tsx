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

/** Un formulario por tipo; todos reciben las mismas propiedades. */
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

/**
 * Formulario de la vista de desarrollo: mostrar(tipo) elige el formulario del tipo pedido.
 * El comportamiento común (validarCampos, mostrarErrores, enviar, mostrarContador) está en formularios/.
 */
export function Formulario({ tipo, ...props }: PropsFormulario & { tipo: TipoFormulario }) {
  const Elegido = FORMULARIOS[tipo]
  return <Elegido {...props} />
}

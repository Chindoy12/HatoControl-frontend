import { Encabezado } from './Encabezado'

export type TipoFormulario =
  | 'animal'
  | 'sanitario'
  | 'peso'
  | 'parto'
  | 'leche'
  | 'finca'
  | 'administrador'
  | 'contrasena'

const TITULOS: Record<TipoFormulario, string> = {
  animal: 'Registrar animal',
  sanitario: 'Registrar evento sanitario',
  peso: 'Registrar peso',
  parto: 'Registrar parto',
  leche: 'Registrar leche',
  finca: 'Registrar finca',
  administrador: 'Crear administrador',
  contrasena: 'Nueva contraseña',
}

const PUBLICOS: TipoFormulario[] = ['finca', 'contrasena']

// Formulario único de la vista de desarrollo. En la Fase 10 se implementan
// mostrar(tipo), mostrarContador(), validarCampos(), mostrarErrores(mensajes) y enviar().
export function Formulario({ tipo }: { tipo: TipoFormulario }) {
  return (
    <>
      {!PUBLICOS.includes(tipo) && <Encabezado rol="GANADERO" />}
      <main className="cuerpo">
        <h1>{TITULOS[tipo]}</h1>
        <p className="pendiente">Formulario de tipo «{tipo}». Se implementa en la Fase 10.</p>
      </main>
    </>
  )
}

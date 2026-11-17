import { Encabezado } from '../componentes/Encabezado'

// Pantallas P05, P22. Se implementa en la Fase 10: Saludo, actividades pendientes y accesos a cada módulo según el rol.
export function PaginaPanel() {
  return (
    <>
      <Encabezado rol="GANADERO" />
      <main className="cuerpo">
        <h1>Panel principal</h1>
        <p className="pendiente">Se implementa en la Fase 10.</p>
      </main>
    </>
  )
}

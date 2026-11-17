import { Encabezado } from '../componentes/Encabezado'

// Pantallas P05, P22. Se implementa en la Fase 10: mostrarAccesos(rol) y mostrarPendientes().
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

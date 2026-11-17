import { Encabezado } from '../componentes/Encabezado'

// Pantallas P09, P19. Se implementa en la Fase 10: Actividades próximas y pendientes; marcar como realizada.
export function PaginaSanidad() {
  return (
    <>
      <Encabezado rol="GANADERO" />
      <main className="cuerpo">
        <h1>Control sanitario</h1>
        <p className="pendiente">Se implementa en la Fase 10.</p>
      </main>
    </>
  )
}

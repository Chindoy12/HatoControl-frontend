import { Encabezado } from '../componentes/Encabezado'

// Pantallas P12. Se implementa en la Fase 10: mostrarResumen().
export function PaginaDashboard() {
  return (
    <>
      <Encabezado rol="GANADERO" />
      <main className="cuerpo">
        <h1>Dashboard</h1>
        <p className="pendiente">Se implementa en la Fase 10.</p>
      </main>
    </>
  )
}

import { Encabezado } from '../componentes/Encabezado'

// Pantallas P14, P23. Se implementa en la Fase 10: crear(), listar(), desactivar() y restablecer().
export function PaginaAdministradores() {
  return (
    <>
      <Encabezado rol="GANADERO" />
      <main className="cuerpo">
        <h1>Administradores</h1>
        <p className="pendiente">Se implementa en la Fase 10.</p>
      </main>
    </>
  )
}

import { Dialogo, Mensaje } from '../../componentes/piezas'
import type { AnimalResponse } from '../../tipos/dto'

export type Accion = 'eliminar' | 'engorde'

interface Props {
  animal: AnimalResponse
  dialogo: Accion | null
  bloqueo: string
  alConfirmar: () => void
  alCerrar: () => void
  alCerrarBloqueo: () => void
}

export function DialogosAnimal({ animal, dialogo, bloqueo, alConfirmar, alCerrar, alCerrarBloqueo }: Props) {
  const nombre = animal.nombre ?? animal.codigoArete
  return (
    <>
      {dialogo === 'eliminar' && (
        <Dialogo titulo={`¿Eliminar el animal ${animal.codigoArete}?`}
          acciones={<><button className="btn borde" onClick={alCerrar}>Cancelar</button><button className="btn rojo" onClick={alConfirmar}>Sí, eliminar</button></>}>
          <div className="sub" style={{ margin: 0 }}>Solo se puede eliminar un animal registrado por error, sin historial. Esta acción no se puede deshacer.</div>
        </Dialogo>
      )}
      {dialogo === 'engorde' && (
        <Dialogo titulo={`¿Pasar a ${nombre} a engorde?`}
          acciones={<><button className="btn borde" onClick={alCerrar}>Cancelar</button><button className="btn amar" onClick={alConfirmar}>Confirmar cambio</button></>}>
          <div className="sub" style={{ margin: 0 }}>El propósito cambia de <b>{animal.proposito === 'LECHE' ? 'leche' : 'padrón'}</b> a <b>engorde</b>. {nombre} conserva todo su historial.</div>
          {animal.proposito === 'LECHE' && <Mensaje tipo="info">Después del cambio ya no se podrá registrar su leche.</Mensaje>}
        </Dialogo>
      )}
      {bloqueo && (
        <Dialogo titulo="No se pudo completar" acciones={<button className="btn" onClick={alCerrarBloqueo}>Entendido</button>}>
          <Mensaje tipo="err">{bloqueo}</Mensaje>
        </Dialogo>
      )}
    </>
  )
}

import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes, useOutletContext } from 'react-router'
import { Encabezado } from './componentes/Encabezado'
import { Formulario } from './componentes/Formulario'
import { PaginaAdministradores } from './paginas/PaginaAdministradores'
import { PaginaAnimal } from './paginas/PaginaAnimal'
import { PaginaAnimales } from './paginas/PaginaAnimales'
import { PaginaDashboard } from './paginas/PaginaDashboard'
import { PaginaIngreso } from './paginas/PaginaIngreso'
import { PaginaInicio } from './paginas/PaginaInicio'
import { PaginaPanel } from './paginas/PaginaPanel'
import { PaginaReportes } from './paginas/PaginaReportes'
import { PaginaSanidad } from './paginas/PaginaSanidad'
import { enviar } from './servicios/ClienteApi'
import type { SesionResponse } from './tipos/dto'

/** Lo que reciben las páginas internas: quién está dentro. */
export function useSesion(): SesionResponse {
  return useOutletContext<SesionResponse>()
}

// Rutas = direcciones de los mockups P01–P25.
export function App() {
  // undefined = todavía se está preguntando al backend; null = nadie ha iniciado sesión.
  const [sesion, setSesion] = useState<SesionResponse | null | undefined>(undefined)

  useEffect(() => {
    enviar<SesionResponse>({ metodo: 'GET', ruta: '/sesion' })
      .then(setSesion)
      .catch(() => setSesion(null))
  }, [])

  if (sesion === undefined) {
    return <div className="cuerpo cargando">Cargando…</div>
  }

  const conSesion = (
    <ConEncabezado sesion={sesion} alSalir={() => setSesion(null)} />
  )

  return (
    <Routes>
      <Route path="/" element={sesion ? <Navigate to="/inicio" replace /> : <PaginaInicio />} />
      <Route path="/ingresar" element={<PaginaIngreso modo="ingreso" alEntrar={setSesion} />} />
      <Route path="/recuperar" element={<PaginaIngreso modo="recuperar" alEntrar={setSesion} />} />
      <Route path="/recuperar/:token" element={<Formulario tipo="contrasena" />} />
      <Route path="/registro" element={<Formulario tipo="finca" alEntrar={setSesion} />} />

      <Route element={conSesion}>
        <Route path="/inicio" element={<PaginaPanel />} />
        <Route path="/animales" element={<PaginaAnimales />} />
        <Route path="/animales/nuevo" element={<Formulario tipo="animal" />} />
        <Route path="/animales/:codigoArete" element={<PaginaAnimal />} />
        <Route path="/animales/:codigoArete/editar" element={<Formulario tipo="animal" />} />
        <Route path="/sanidad" element={<PaginaSanidad />} />
        <Route
          path="/registros"
          element={
            <main className="cuerpo">
              <div className="miga">Inicio / <b>Registros diarios</b></div>
              <h1>Registros diarios</h1>
              <div className="sub">Peso de un animal y leche del día de una vaca.</div>
              <div className="fila" style={{ marginTop: 22, alignItems: 'flex-start' }}>
                <Formulario tipo="peso" embebido />
                <Formulario tipo="leche" embebido />
              </div>
            </main>
          }
        />
        <Route path="/partos/nuevo" element={<Formulario tipo="parto" />} />
        <Route path="/dashboard" element={<SoloGanadero sesion={sesion}><PaginaDashboard /></SoloGanadero>} />
        <Route path="/reportes" element={<PaginaReportes />} />
        <Route path="/administradores" element={<SoloGanadero sesion={sesion}><PaginaAdministradores /></SoloGanadero>} />
      </Route>
      <Route path="*" element={<Navigate to={sesion ? '/inicio' : '/'} replace />} />
    </Routes>
  )
}

/** Pantallas internas: sin sesión llevan a Ingreso (HU_021). */
function ConEncabezado({ sesion, alSalir }: { sesion: SesionResponse | null; alSalir: () => void }) {
  if (!sesion) return <Navigate to="/ingresar" replace />
  return (
    <>
      <Encabezado sesion={sesion} alSalir={alSalir} />
      <Outlet context={sesion} />
    </>
  )
}

/** El administrador no ve estas opciones; si escribe la dirección, se le explica (HU_022, P25). */
function SoloGanadero({ sesion, children }: { sesion: SesionResponse | null; children: ReactNode }) {
  if (sesion?.rol === 'GANADERO') return <>{children}</>
  return (
    <main className="cuerpo">
      <div className="card pila" style={{ maxWidth: 520 }}>
        <h2>Opción solo del ganadero</h2>
        <div className="msg err" role="alert">No tienes permiso para esta opción. No se cambió ningún dato.</div>
        <a className="btn borde" href="/inicio">Volver al inicio</a>
      </div>
    </main>
  )
}

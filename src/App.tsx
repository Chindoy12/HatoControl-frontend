import { Route, Routes } from 'react-router'
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

// Rutas = direcciones de los mockups P01–P25.
export function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicio />} />
      <Route path="/ingresar" element={<PaginaIngreso />} />
      <Route path="/registro" element={<Formulario tipo="finca" />} />
      <Route path="/recuperar" element={<PaginaIngreso />} />
      <Route path="/recuperar/:token" element={<Formulario tipo="contrasena" />} />
      <Route path="/inicio" element={<PaginaPanel />} />
      <Route path="/animales" element={<PaginaAnimales />} />
      <Route path="/animales/nuevo" element={<Formulario tipo="animal" />} />
      <Route path="/animales/:codigoArete" element={<PaginaAnimal />} />
      <Route path="/animales/:codigoArete/editar" element={<Formulario tipo="animal" />} />
      <Route path="/sanidad" element={<PaginaSanidad />} />
      <Route path="/registros" element={<Formulario tipo="peso" />} />
      <Route path="/partos/nuevo" element={<Formulario tipo="parto" />} />
      <Route path="/dashboard" element={<PaginaDashboard />} />
      <Route path="/reportes" element={<PaginaReportes />} />
      <Route path="/administradores" element={<PaginaAdministradores />} />
    </Routes>
  )
}

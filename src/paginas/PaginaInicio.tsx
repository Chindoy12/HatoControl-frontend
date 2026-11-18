import { Link } from 'react-router'
import { Icono, Marca, type NombreIcono } from '../componentes/piezas'

const MODULOS: [NombreIcono, string, string][] = [
  ['vaca', 'Animales', 'Arete, sexo, propósito y página propia de cada animal.'],
  ['jeringa', 'Sanidad', 'Vacunas, enfermedades, tratamientos y recordatorios.'],
  ['bascula', 'Peso', 'Historial, ganancia de peso y gráfica.'],
  ['leche', 'Partos y leche', 'Crías, litros por día y promedios.'],
]

// Pantalla P01: irAIngreso() e irARegistro().
export function PaginaInicio() {
  return (
    <>
      <section className="banner" style={{ minHeight: 600, paddingBottom: 60 }}>
        <div className="arc" style={{ width: 520, height: 520, left: -300, bottom: -300, border: '80px solid #2f9e52' }} />
        <div className="arc" style={{ width: 520, height: 520, right: -260, bottom: -330, border: '70px solid #f2c230' }} />
        <div className="hoja-deco" style={{ left: '44%', top: 70, width: 70, height: 70 }} />
        <div className="cuerpo" style={{ paddingTop: 20, position: 'relative', zIndex: 2 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, minHeight: 56 }}>
            <Marca claro tam={22} />
            <div style={{ flex: 1 }} />
            <a href="#modulos" className="solo-grande" style={{ color: '#d6e7cf', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Módulos
            </a>
            <Link to="/ingresar" className="btn lima chico">
              Ingresar
            </Link>
          </nav>
          <div className="fila" style={{ marginTop: 70, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ color: '#9bcb3c', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>GESTIÓN Y CONTROL GANADERO</div>
              <h1 style={{ color: '#fff', fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.08, letterSpacing: -1.5, marginTop: 14 }}>
                Toda la información de tu hato, en un solo lugar.
              </h1>
              <p style={{ color: '#cfe0c8', fontSize: 18, lineHeight: 1.5, marginTop: 20 }}>
                Registra tus animales, vacunas, pesos, partos y leche desde el celular o el computador, sin cuadernos.
              </p>
              <div className="fila" style={{ marginTop: 34, gap: 14 }}>
                <Link to="/registro" className="btn amar" style={{ height: 52, padding: '0 30px', fontSize: 15 }}>
                  Registrar mi finca
                </Link>
                <Link to="/ingresar" className="btn borde" style={{ height: 52, padding: '0 30px', fontSize: 15, background: 'transparent', color: '#fff', borderColor: '#fff' }}>
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
            <div className="solo-grande" style={{ width: 420, height: 380, background: '#1d4a37', borderRadius: '200px 200px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="300" height="230" viewBox="0 0 300 230" aria-hidden="true">
                <path d="M70 90c0-28 18-44 46-44h68c28 0 46 16 46 44v52c0 40-36 66-80 66s-80-26-80-66z" fill="#9bcb3c" />
                <path d="M72 82 30 58M228 82l42-24" stroke="#9bcb3c" strokeWidth="16" strokeLinecap="round" />
                <circle cx="120" cy="112" r="10" fill="#13392b" />
                <circle cx="180" cy="112" r="10" fill="#13392b" />
                <ellipse cx="150" cy="168" rx="38" ry="22" fill="#f7f5ee" />
                <circle cx="136" cy="168" r="5" fill="#13392b" />
                <circle cx="164" cy="168" r="5" fill="#13392b" />
                <path d="M232 60c10 0 16 6 16 13 0 9-8 12-9 20h-14c-1-8-9-11-9-20 0-7 6-13 16-13z" fill="#f2c230" />
                <circle cx="232" cy="70" r="3" fill="#13392b" />
              </svg>
            </div>
          </div>
        </div>
      </section>
      <section id="modulos" className="cuerpo">
        <h1 style={{ textAlign: 'center' }}>
          Con HatoControl llevas el control <span style={{ color: '#2f9e52' }}>de verdad</span>
        </h1>
        <div className="fila" style={{ marginTop: 30 }}>
          {MODULOS.map(([icono, titulo, texto]) => (
            <div key={titulo} className="card" style={{ flex: '1 1 240px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div className="ico">
                <Icono nombre={icono} />
              </div>
              <div>
                <h3>{titulo}</h3>
                <div className="sub">{texto}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

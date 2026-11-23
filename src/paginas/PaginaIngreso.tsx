import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Figuras, Icono, Marca, Mensaje } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { IngresoRequest, SesionResponse } from '../tipos/dto'

// Pantallas P02 y P04 (paso 1): ingresar() y recuperarContrasena().
export function PaginaIngreso({ modo, alEntrar }: { modo: 'ingreso' | 'recuperar'; alEntrar: (s: SesionResponse) => void }) {
  return (
    <>
      <section className="banner" style={{ height: 230 }}>
        <Figuras alto={230} hoja />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Marca claro tam={36} />
          </Link>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center', color: '#cfe0c8', fontSize: 16, zIndex: 2 }}>
          Sistema de Gestión y Control Ganadero
        </div>
      </section>
      <main className="cuerpo" style={{ display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
        {modo === 'ingreso' ? <Ingreso alEntrar={alEntrar} /> : <Recuperar />}
        <aside className="solo-grande" style={{ width: 360, height: 420, borderRadius: 24, background: '#13392b', position: 'relative', overflow: 'hidden' }}>
          <div className="arc" style={{ width: 300, height: 300, left: -120, bottom: -140, border: '46px solid #9bcb3c' }} />
          <div className="arc" style={{ width: 180, height: 180, right: -60, top: -50, border: '30px solid #f2c230' }} />
          <div style={{ position: 'absolute', left: 36, right: 36, top: 140, color: '#fff', fontSize: 24, fontWeight: 800, lineHeight: 1.25 }}>
            Tus datos solo los ve tu finca.
          </div>
          <div style={{ position: 'absolute', left: 36, right: 36, top: 240, color: '#cfe0c8', fontSize: 14, lineHeight: 1.5 }}>
            La contraseña viaja cifrada y nunca se guarda en el navegador.
          </div>
        </aside>
      </main>
    </>
  )
}

function Ingreso({ alEntrar }: { alEntrar: (s: SesionResponse) => void }) {
  const navegar = useNavigate()
  const salio = (useLocation().state as { salio?: boolean } | null)?.salio
  const [datos, setDatos] = useState<IngresoRequest>({ correo: '', contrasena: '' })
  const [ver, setVer] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function ingresar(e: FormEvent) {
    e.preventDefault()
    if (!datos.correo.trim() || !datos.contrasena) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const sesion = await enviar<SesionResponse>({ metodo: 'POST', ruta: '/sesion/ingreso', cuerpo: datos })
      alEntrar(sesion)
      navegar('/inicio', { replace: true })
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo conectar. Intenta de nuevo.')
      // Diagrama de secuencia 08, último paso: después de un intento fallido se borra la contraseña del formulario.
      setDatos((d) => ({ ...d, contrasena: '' }))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="pila" style={{ width: 470, maxWidth: '100%' }} onSubmit={ingresar} noValidate>
      <div>
        <h1>¡Bienvenido!</h1>
        <div className="sub">Ingresa con el correo y la contraseña de tu cuenta.</div>
      </div>
      {salio && !error && <Mensaje tipo="ok">Cerraste sesión. Ingresa de nuevo para ver la información de tu finca.</Mensaje>}
      <label className="campo">
        Correo electrónico
        <input className="inp" type="email" autoComplete="email" value={datos.correo} onChange={(e) => setDatos({ ...datos, correo: e.target.value })} />
      </label>
      <label className="campo">
        Contraseña
        <span className="con-icono">
          <input className="inp" type={ver ? 'text' : 'password'} autoComplete="current-password" value={datos.contrasena}
            onChange={(e) => setDatos({ ...datos, contrasena: e.target.value })} />
          <button type="button" className="boton-icono" aria-label={ver ? 'Ocultar contraseña' : 'Ver contraseña'} onClick={() => setVer(!ver)}>
            <Icono nombre="ojo" tam={20} />
          </button>
        </span>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/recuperar" className="enlace">¿Olvidó su contraseña? (solo ganadero)</Link>
      </div>
      <button className="btn ancho" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
      {error && <Mensaje tipo="err">{error}</Mensaje>}
      <div style={{ textAlign: 'center', fontSize: 14, color: '#55635b' }}>
        ¿No tienes cuenta? <Link to="/registro" className="enlace" style={{ fontSize: 14 }}>Registra tu finca</Link>
      </div>
    </form>
  )
}

function Recuperar() {
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function recuperarContrasena(e: FormEvent) {
    e.preventDefault()
    if (!correo.trim()) {
      setError('Escribe el correo de tu cuenta.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const r = await enviar<{ mensaje: string }>({ metodo: 'POST', ruta: '/sesion/recuperacion', cuerpo: { correo } })
      setMensaje(r.mensaje)
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo conectar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="card pila" style={{ width: 540, maxWidth: '100%', padding: '32px 36px' }} onSubmit={recuperarContrasena} noValidate>
      <span className="tag t-b" style={{ alignSelf: 'flex-start' }}>Paso 1</span>
      <h2>¿Olvidaste tu contraseña?</h2>
      <div className="sub" style={{ margin: 0 }}>Escribe el correo de tu cuenta de ganadero y te enviaremos un enlace.</div>
      <label className="campo">
        Correo electrónico
        <input className={`inp${error ? ' err' : ''}`} type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>
      <button className="btn" style={{ height: 48 }} disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar enlace'}</button>
      {mensaje && <Mensaje tipo="ok">{mensaje}</Mensaje>}
      {error && <Mensaje tipo="err">{error}</Mensaje>}
      <div className="ayuda">Los administradores piden a su ganadero que les restablezca la contraseña.</div>
      <Link to="/ingresar" className="enlace">Volver a Ingresar</Link>
    </form>
  )
}

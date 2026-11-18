import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Formulario } from '../componentes/Formulario'
import { Dialogo, Icono, Mensaje, SinRegistros } from '../componentes/piezas'
import { ErrorApi, enviar } from '../servicios/ClienteApi'
import type { UsuarioResponse } from '../tipos/dto'

// Pantallas P14 y P23 (solo ganadero): crear(), listar(), desactivar() y restablecer().
export function PaginaAdministradores() {
  const [lista, setLista] = useState<UsuarioResponse[] | null>(null)
  const [creando, setCreando] = useState(false)
  const [desactivando, setDesactivando] = useState<UsuarioResponse | null>(null)
  const [restableciendo, setRestableciendo] = useState<UsuarioResponse | null>(null)
  const [clave, setClave] = useState('')
  const [errorClave, setErrorClave] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  const listar = useCallback(() => {
    enviar<UsuarioResponse[]>({ metodo: 'GET', ruta: '/cuentas/administradores' }).then(setLista).catch(() => setLista([]))
  }, [])

  useEffect(() => {
    listar()
  }, [listar])

  async function desactivar() {
    const u = desactivando!
    setDesactivando(null)
    try {
      await enviar({ metodo: 'POST', ruta: '/cuentas/administradores/desactivacion', cuerpo: { correo: u.correo } })
      setMensaje({ tipo: 'ok', texto: `${u.nombre} ya no puede iniciar sesión. Los registros que hizo se conservan.` })
      listar()
    } catch (e) {
      setMensaje({ tipo: 'err', texto: e instanceof ErrorApi ? e.message : 'No se pudo desactivar la cuenta.' })
    }
  }

  async function restablecer() {
    if (clave.length < 10 || clave.length > 12) {
      setErrorClave('La contraseña debe tener entre 10 y 12 caracteres.')
      return
    }
    const u = restableciendo!
    try {
      await enviar({ metodo: 'POST', ruta: '/cuentas/administradores/contrasena', cuerpo: { correo: u.correo, contrasena: clave } })
      setRestableciendo(null)
      setMensaje({ tipo: 'ok', texto: `${u.nombre} ya puede entrar con la contraseña nueva. La anterior dejó de funcionar.` })
    } catch (e) {
      setErrorClave(e instanceof ErrorApi ? e.message : 'No se pudo guardar la contraseña.')
    }
  }

  const n = clave.length
  return (
    <main className="cuerpo">
      <div className="miga"><Link to="/inicio">Inicio</Link> / <b>Administradores</b></div>
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Administradores de la finca</h1>
          <div className="sub">Cuentas de quienes registran información en tu finca.</div>
        </div>
        <button type="button" className="btn amar" onClick={() => { setCreando(true); setMensaje(null) }}><Icono nombre="mas" color="#13392b" tam={18} /> Crear administrador</button>
      </div>
      {mensaje && <div style={{ marginTop: 16 }}><Mensaje tipo={mensaje.tipo}>{mensaje.texto}</Mensaje></div>}
      <div className="card" style={{ marginTop: 22 }}>
        {lista && lista.length === 0 && <SinRegistros />}
        {lista && lista.length > 0 && (
          <div className="tabla">
            <table>
              <thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {lista.map((u) => (
                  <tr key={u.correo}>
                    <td><b>{u.nombre}</b></td>
                    <td>{u.correo}</td>
                    <td><span className={`tag ${u.activo ? 't-v' : 't-g'}`}>{u.activo ? 'Activa' : 'Desactivada'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="fila" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn chico borde" onClick={() => { setRestableciendo(u); setClave(''); setErrorClave('') }}>Restablecer contraseña</button>
                        {u.activo && <button type="button" className="btn chico rojo" onClick={() => setDesactivando(u)}>Desactivar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creando && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Crear administrador">
          <div className="card dialogo" style={{ maxWidth: 480 }}>
            <h2>Crear administrador</h2>
            <Formulario tipo="administrador" embebido alGuardar={listar} alCancelar={() => setCreando(false)} />
          </div>
        </div>
      )}
      {desactivando && (
        <Dialogo titulo={`¿Desactivar a ${desactivando.nombre}?`}
          acciones={<><button className="btn borde" onClick={() => setDesactivando(null)}>Cancelar</button><button className="btn rojo" onClick={desactivar}>Sí, desactivar</button></>}>
          <div className="sub" style={{ margin: 0 }}>{desactivando.nombre} ya no podrá iniciar sesión. Los registros que hizo se conservan.</div>
        </Dialogo>
      )}
      {restableciendo && (
        <Dialogo titulo={`Restablecer contraseña de ${restableciendo.nombre}`}
          acciones={<><button className="btn borde" onClick={() => setRestableciendo(null)}>Cancelar</button><button className="btn" onClick={restablecer}>Guardar contraseña</button></>}>
          <label className="campo">
            Contraseña nueva *
            <input className={`inp${errorClave ? ' err' : ''}`} type="password" maxLength={12} autoComplete="new-password" value={clave} onChange={(e) => { setClave(e.target.value); setErrorClave('') }} />
            <span className={`ayuda ${n < 10 ? 'err' : 'ok'}`}>
              {n < 10 ? `Faltan ${10 - n} caracteres para el mínimo · ${n} de 12` : n < 12 ? `Puedes escribir ${12 - n} caracteres más · ${n} de 12` : 'Llegaste al máximo de 12 caracteres'}
            </span>
            {errorClave && <span className="ayuda err">{errorClave}</span>}
          </label>
          <div className="ayuda">{restableciendo.nombre} entrará con la contraseña nueva. La anterior deja de funcionar.</div>
        </Dialogo>
      )}
    </main>
  )
}

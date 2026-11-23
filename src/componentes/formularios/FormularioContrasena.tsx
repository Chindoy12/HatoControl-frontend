import { Link, useParams } from 'react-router'
import { enviar } from '../../servicios/ClienteApi'
import { BotonGuardar, Clave, Resultado } from './campos'
import { PaginaPublica } from './PaginaPublica'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useFormulario } from './useFormulario'
import { exigirLongitud } from './validaciones'

const INICIALES: Valores = { contrasena: '', repetir: '' }

export function FormularioContrasena(props: PropsFormulario) {
  const { token } = useParams()
  const f = useFormulario(props, { iniciales: INICIALES, validar: validarContrasena, guardar, sinCancelar: true })

  async function guardar(v: Valores) {
    await enviar({ metodo: 'POST', ruta: `/sesion/recuperacion/${encodeURIComponent(token ?? '')}`, cuerpo: { contrasena: v.contrasena } })
    f.setExito(<>Contraseña guardada. <Link to="/ingresar">Ingresa con tu contraseña nueva</Link>.</>)
    f.setValores(INICIALES)
  }

  return (
    <PaginaPublica>
      <form className="card pila" style={{ width: 540, maxWidth: '100%', padding: '32px 36px' }} onSubmit={f.enviar} noValidate>
        <span className="tag t-b" style={{ alignSelf: 'flex-start' }}>Paso 2 · desde el enlace del correo</span>
        <h2>Crea tu nueva contraseña</h2>
        <Clave f={f} etiqueta="Nueva contraseña" />
        <Clave f={f} campo="repetir" etiqueta="Repite la contraseña" />
        <BotonGuardar f={f} texto="Guardar contraseña" alto={48} />
        <Resultado f={f} />
        {f.general && <Link to="/recuperar" className="enlace">Solicitar un enlace nuevo</Link>}
      </form>
    </PaginaPublica>
  )
}

function validarContrasena(v: Valores): Errores {
  const e: Errores = {}
  exigirLongitud(v, e)
  if (v.repetir !== v.contrasena) e.repetir = 'Las dos contraseñas no son iguales.'
  return e
}

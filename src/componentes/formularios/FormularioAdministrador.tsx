import { enviar } from '../../servicios/ClienteApi'
import type { UsuarioResponse } from '../../tipos/dto'
import { Botones, CampoTexto, Clave, Resultado } from './campos'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useFormulario } from './useFormulario'
import { exigir, exigirLongitud } from './validaciones'

const INICIALES: Valores = { nombre: '', correo: '', contrasena: '' }

/** HU_023: el ganadero crea la cuenta de un administrador (P14). */
export function FormularioAdministrador(props: PropsFormulario) {
  const f = useFormulario(props, { iniciales: INICIALES, validar: validarAdministrador, guardar })

  async function guardar(v: Valores) {
    const usuario = await enviar<UsuarioResponse>({ metodo: 'POST', ruta: '/cuentas/administradores', cuerpo: { nombre: v.nombre, correo: v.correo, contrasena: v.contrasena } })
    f.setExito(`Cuenta de ${usuario.nombre} creada. Ya puede iniciar sesión.`)
    f.setValores(INICIALES)
  }

  return (
    <form className="pila" onSubmit={f.enviar} noValidate>
      <CampoTexto f={f} campo="nombre" etiqueta="Nombre *" />
      <CampoTexto f={f} campo="correo" etiqueta="Correo *" tipoInput="email" />
      <Clave f={f} etiqueta="Contraseña inicial * (10 a 12 caracteres)" />
      <Resultado f={f} />
      <Botones f={f} texto="Crear cuenta" />
    </form>
  )
}

function validarAdministrador(v: Valores): Errores {
  const e: Errores = {}
  exigir(v, e, 'nombre', 'Escribe el nombre.')
  exigir(v, e, 'correo', 'Escribe el correo.')
  exigirLongitud(v, e)
  return e
}

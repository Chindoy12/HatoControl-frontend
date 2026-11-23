import { Link, useNavigate } from 'react-router'
import { enviar } from '../../servicios/ClienteApi'
import type { SesionResponse } from '../../tipos/dto'
import { CampoTexto, Clave, Resultado } from './campos'
import { PaginaPublica } from './PaginaPublica'
import type { Errores, PropsFormulario, Valores } from './tipos'
import { useFormulario } from './useFormulario'
import { exigir, exigirLongitud } from './validaciones'

export function FormularioFinca(props: PropsFormulario) {
  const navegar = useNavigate()
  const f = useFormulario(props, {
    iniciales: { nombreFinca: '', nombre: '', correo: '', contrasena: '' },
    validar: validarFinca,
    guardar,
    sinCancelar: true,
  })

  async function guardar(v: Valores) {
    const sesion = await enviar<SesionResponse>({
      metodo: 'POST',
      ruta: '/cuentas/fincas',
      cuerpo: { nombreFinca: v.nombreFinca, nombre: v.nombre, correo: v.correo, contrasena: v.contrasena },
    })
    props.alEntrar?.(sesion)
    navegar('/inicio', { replace: true })
  }

  return (
    <PaginaPublica>
      <form className="card pila" style={{ width: 720, maxWidth: '100%', padding: '36px 44px' }} onSubmit={f.enviar} noValidate>
        <div>
          <h1>Registra tu finca</h1>
          <div className="sub">Crea la cuenta del ganadero. Después podrás agregar a tus administradores.</div>
        </div>
        <CampoTexto f={f} campo="nombreFinca" etiqueta="Nombre de la finca" />
        <div className="fila">
          <CampoTexto f={f} campo="nombre" etiqueta="Tu nombre" autocompletar="name" />
          <CampoTexto f={f} campo="correo" etiqueta="Correo electrónico" tipoInput="email" autocompletar="email" />
        </div>
        <Clave f={f} etiqueta="Contraseña (10 a 12 caracteres)" />
        <Resultado f={f} />
        <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#55635b' }}>
            ¿Ya tienes cuenta? <Link to="/ingresar" className="enlace" style={{ fontSize: 14 }}>Ingresar</Link>
          </span>
          <button className="btn" style={{ height: 50, padding: '0 34px' }} disabled={f.enviando}>{f.enviando ? 'Creando…' : 'Crear finca y cuenta'}</button>
        </div>
      </form>
    </PaginaPublica>
  )
}

function validarFinca(v: Valores): Errores {
  const e: Errores = {}
  exigir(v, e, 'nombreFinca', 'Escribe el nombre de la finca.')
  exigir(v, e, 'nombre', 'Escribe tu nombre.')
  exigir(v, e, 'correo', 'Escribe tu correo.')
  exigirLongitud(v, e)
  return e
}

import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ErrorApi } from '../../servicios/ClienteApi'
import type { Proposito, Sexo } from '../../tipos/dto'
import { propositosDe } from '../piezas'
import type { Errores, PropsFormulario, Valores } from './tipos'

/** Lo que cada formulario le entrega al comportamiento común. */
export interface ReglasFormulario {
  iniciales: Valores
  /** Revisa los campos antes de llamar al backend. */
  validar: (valores: Valores) => Errores
  /** Llama al backend; si algo falla, lanza ErrorApi. */
  guardar: (valores: Valores) => Promise<void>
  /** Pantallas públicas (finca, contraseña): sin botón Cancelar. */
  sinCancelar?: boolean
}

/**
 * Comportamiento que comparten todos los formularios de la vista de desarrollo:
 * validarCampos(), mostrarErrores(mensajes) y enviar(). Las reglas se vuelven a revisar en el backend.
 */
export function useFormulario({ embebido = false, alGuardar, alCancelar }: PropsFormulario, reglas: ReglasFormulario) {
  const navegar = useNavigate()
  const [valores, setValores] = useState<Valores>(reglas.iniciales)
  const [errores, setErrores] = useState<Errores>({})
  const [general, setGeneral] = useState('')
  const [aviso, setAviso] = useState('')
  const [exito, setExito] = useState<ReactNode>(null)
  const [enviando, setEnviando] = useState(false)
  const [verClave, setVerClave] = useState(false)

  function cambiar(campo: string, valor: string) {
    setValores((v) => {
      const nuevo = { ...v, [campo]: valor }
      // Al cambiar el sexo, el propósito debe volver a elegirse si ya no corresponde (HU_001, HU_004)
      if (campo === 'sexo' && v.proposito && !propositosDe(valor as Sexo).includes(v.proposito as Proposito)) {
        nuevo.proposito = ''
        setAviso(`Cambiaste el sexo. Elige de nuevo el propósito: ${valor === 'MACHO' ? 'engorde o padrón' : 'engorde o leche'}.`)
      }
      return nuevo
    })
    setErrores((e) => ({ ...e, [campo]: '' }))
    if (campo === 'proposito') setAviso('')
    setExito(null)
  }

  function mostrarErrores(mensajes: Errores, mensajeGeneral: string) {
    setErrores(mensajes)
    setGeneral(mensajeGeneral)
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setExito(null)
    const locales = reglas.validar(valores)
    if (Object.keys(locales).length) {
      mostrarErrores(locales, 'Revisa los campos marcados.')
      return
    }
    mostrarErrores({}, '')
    setEnviando(true)
    try {
      await reglas.guardar(valores)
      alGuardar?.()
    } catch (e) {
      if (e instanceof ErrorApi) mostrarErrores(e.campos, e.message)
      else mostrarErrores({}, 'No se pudo guardar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const cancelar = alCancelar ?? (!embebido && !reglas.sinCancelar ? () => navegar(-1) : undefined)

  return { valores, setValores, cambiar, errores, setErrores, general, setGeneral, aviso, exito, setExito, enviando, verClave, setVerClave, cancelar, enviar }
}

/** Estado y acciones de un formulario, tal como los usan los campos. */
export type EstadoFormulario = ReturnType<typeof useFormulario>

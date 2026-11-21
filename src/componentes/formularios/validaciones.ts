import type { Errores, Valores } from './tipos'

export const MENSAJE_LONGITUD = 'La contraseña debe tener entre 10 y 12 caracteres.'

/** Marca el campo con el mensaje si quedó vacío. */
export function exigir(valores: Valores, errores: Errores, campo: string, mensaje: string) {
  if (!valores[campo]?.trim()) errores[campo] = mensaje
}

/** La contraseña debe tener al menos 10 caracteres; el campo no deja escribir más de 12. */
export function exigirLongitud(valores: Valores, errores: Errores) {
  if (valores.contrasena.length < 10) errores.contrasena = MENSAJE_LONGITUD
}

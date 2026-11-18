// ClienteApi: única puerta del frontend hacia el backend (RNF11). Nunca guarda la contraseña.

export interface Solicitud {
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE'
  ruta: string
  cuerpo?: unknown
}

/** Error que devuelve el backend: mensaje claro y, si aplica, qué corregir en cada campo (RNF03). */
export class ErrorApi extends Error {
  readonly estado: number
  readonly campos: Record<string, string>

  constructor(estado: number, mensaje: string, campos: Record<string, string> = {}) {
    super(mensaje)
    this.estado = estado
    this.campos = campos
  }
}

function tokenCsrf(): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

export async function enviar<T>(solicitud: Solicitud): Promise<T> {
  const cabeceras: Record<string, string> = { Accept: 'application/json' }
  if (solicitud.cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  const csrf = tokenCsrf()
  if (csrf && solicitud.metodo !== 'GET') cabeceras['X-XSRF-TOKEN'] = decodeURIComponent(csrf)

  let respuesta: Response
  try {
    respuesta = await fetch(`/api${solicitud.ruta}`, {
      method: solicitud.metodo,
      headers: cabeceras,
      credentials: 'same-origin',
      body: solicitud.cuerpo === undefined ? undefined : JSON.stringify(solicitud.cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.')
  }

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}))
    const mensaje =
      datos.mensaje ?? (respuesta.status === 403 ? 'La página estuvo abierta mucho tiempo. Recárgala e intenta de nuevo.' : 'No se pudo completar la operación.')
    throw new ErrorApi(respuesta.status, mensaje, datos.campos ?? {})
  }
  const texto = await respuesta.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

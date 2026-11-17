// ClienteApi: única puerta del frontend hacia el backend (RNF11). Nunca guarda la contraseña.

export interface Solicitud {
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE'
  ruta: string
  cuerpo?: unknown
}

export class ErrorApi extends Error {
  readonly estado: number

  constructor(estado: number, mensaje: string) {
    super(mensaje)
    this.estado = estado
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

  const respuesta = await fetch(`/api${solicitud.ruta}`, {
    method: solicitud.metodo,
    headers: cabeceras,
    credentials: 'same-origin',
    body: solicitud.cuerpo === undefined ? undefined : JSON.stringify(solicitud.cuerpo),
  })

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}))
    throw new ErrorApi(respuesta.status, datos.mensaje ?? 'No se pudo completar la operación.')
  }
  return respuesta.status === 204 ? (undefined as T) : ((await respuesta.json()) as T)
}

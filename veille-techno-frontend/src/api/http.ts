// Every call goes to a relative /api URL: the Vite proxy forwards it to the back end in
// development, nginx does it in Docker. The back end does not enable CORS, so the browser must
// never call it directly.
const API_PREFIX = '/api'

/** Message of every error raised when the back end cannot be reached at all. */
export const UNREACHABLE_MESSAGE = 'API injoignable'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

/** Error raised by any failed call, carrying the messages of the back end when it sent some. */
export class ApiError extends Error {
  readonly status: number
  readonly messages: string[]

  constructor(status: number, messages: string[]) {
    super(messages.join('\n'))
    this.name = 'ApiError'
    this.status = status
    this.messages = messages
  }
}

let authToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

/** Token sent as `Authorization: Bearer` with every call; null stops sending it. */
export function setAuthToken(token: string | null): void {
  authToken = token
}

// main.ts fournit la déconnexion et la redirection, sans importer le router ici.
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  let response: Response
  try {
    response = await fetch(API_PREFIX + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // The request could not leave the browser: the dev server or nginx itself is down.
    throw new ApiError(0, [UNREACHABLE_MESSAGE])
  }

  if (!response.ok) {
    // Un mauvais mot de passe doit rester une erreur du formulaire de connexion.
    if (response.status === 401 && !path.startsWith('/auth/')) {
      unauthorizedHandler?.()
    }
    throw await toApiError(response)
  }
  // DELETE routes answer 204 without a body.
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

/** Error body of NestJS: `message` holds one string per invalid field on a 400. */
interface NestErrorBody {
  message: string | string[]
}

function isNestErrorBody(payload: unknown): payload is NestErrorBody {
  if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
    return false
  }
  const { message } = payload
  return (
    typeof message === 'string' ||
    (Array.isArray(message) && message.every((item) => typeof item === 'string'))
  )
}

async function toApiError(response: Response): Promise<ApiError> {
  const payload: unknown = await response.json().catch(() => null)
  if (isNestErrorBody(payload)) {
    const { message } = payload
    return new ApiError(response.status, Array.isArray(message) ? message : [message])
  }
  // No NestJS body: a stopped back end shows up as a 502 from the Vite proxy or from nginx.
  if (response.status >= 500) {
    return new ApiError(response.status, [UNREACHABLE_MESSAGE])
  }
  return new ApiError(response.status, [`Erreur ${response.status}`])
}

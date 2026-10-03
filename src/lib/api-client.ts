import { env } from '@/lib/env'
import { getStoredAccessToken } from '@/lib/auth-session'
import { getPlatformAdminAccessToken } from '@/lib/platform-admin-session'

type RequestOptions = RequestInit & {
  signal?: AbortSignal
  authScope?: 'user' | 'platform-admin' | 'none'
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { authScope = 'user', ...fetchOptions } = options
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const accessToken =
    authScope === 'platform-admin'
      ? getPlatformAdminAccessToken()
      : authScope === 'user'
        ? getStoredAccessToken()
        : null
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as unknown

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload
    ) {
      const message = payload.message

      if (typeof message === 'string') {
        return message
      }

      if (Array.isArray(message) && message.every(isString)) {
        return message.join(', ')
      }
    }
  } catch {
    return 'Request gagal diproses.'
  }

  return 'Request gagal diproses.'
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

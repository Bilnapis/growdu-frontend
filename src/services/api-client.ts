import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
} from 'axios'

import { axiosClient } from '@/config/axios'
import { getStoredAccessToken, getStoredAuthUser } from '@/lib/auth-session'
import { getPlatformAdminAccessToken } from '@/lib/platform-admin-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'

export type AuthScope = 'user' | 'platform-admin' | 'none'

type ApiRequestOptions = Omit<
  AxiosRequestConfig,
  'baseURL' | 'data' | 'headers' | 'method' | 'url'
> & {
  authScope?: AuthScope
  body?: unknown
  headers?: Record<string, string>
  method?: AxiosRequestConfig['method']
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
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { authScope = 'user', body, headers, ...requestConfig } = options
  const requestHeaders = new AxiosHeaders(headers)
  const accessToken = getAccessToken(authScope)

  if (isFormData(body)) {
    requestHeaders.setContentType(null)
  } else if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.setContentType('application/json')
  }

  if (accessToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  const selectedTenantId = getSelectedTenantId(authScope)
  if (selectedTenantId && !requestHeaders.has('X-Tenant-Id')) {
    requestHeaders.set('X-Tenant-Id', selectedTenantId)
  }

  try {
    const response = await axiosClient.request<TResponse>({
      ...requestConfig,
      url: path,
      data: body,
      headers: requestHeaders,
    })

    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        getErrorMessage(error.response?.data),
        error.response?.status ?? 0,
      )
    }

    throw new ApiError('Tidak dapat terhubung ke server.', 0)
  }
}

function getAccessToken(authScope: AuthScope) {
  if (authScope === 'platform-admin') {
    return getPlatformAdminAccessToken()
  }

  if (authScope === 'user') {
    return getStoredAccessToken()
  }

  return null
}

function getSelectedTenantId(authScope: AuthScope) {
  if (authScope !== 'user') {
    return null
  }

  const user = getStoredAuthUser()
  if (!user || user.role !== 'owner') {
    return null
  }

  return getStoredSelectedTenantId(user.id)
}

function getErrorMessage(payload: unknown) {
  if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
    return 'Request gagal diproses.'
  }

  const { message } = payload

  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message) && message.every(isString)) {
    return message.join(', ')
  }

  return 'Request gagal diproses.'
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
} from 'axios'

import { axiosClient } from '@/config/axios'
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredAuthUser,
  storeAuthSession,
  type AuthSession,
} from '@/lib/auth-session'
import {
  clearPlatformAdminSession,
  getPlatformAdminAccessToken,
  storePlatformAdminSession,
  type PlatformAdminSession,
} from '@/lib/platform-admin-session'
import { queryClient } from '@/lib/query-client'
import {
  clearSelectedTenant,
  getStoredSelectedTenantId,
} from '@/lib/tenant-session'

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

type UserRefreshResponse = AuthSession & {
  expiresIn: number
  tokenType: 'Bearer'
}

type PlatformAdminRefreshResponse = PlatformAdminSession & {
  expiresIn: number
  tokenType: 'Bearer'
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

let pendingSessionRedirectPath: string | null = null
let pendingUserRefresh: Promise<boolean> | null = null
let pendingPlatformAdminRefresh: Promise<boolean> | null = null

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
      const status = error.response?.status ?? 0
      if (status === 401 && await refreshSession(authScope)) {
        const retryHeaders = new AxiosHeaders(requestHeaders)
        setAuthorizationHeader(retryHeaders, authScope)

        try {
          const retryResponse = await axiosClient.request<TResponse>({
            ...requestConfig,
            url: path,
            data: body,
            headers: retryHeaders,
          })

          return retryResponse.data
        } catch (retryError: unknown) {
          if (axios.isAxiosError(retryError)) {
            const retryStatus = retryError.response?.status ?? 0
            if (retryStatus === 401) {
              handleUnauthorizedSession(authScope)
            }

            throw new ApiError(
              getErrorMessage(retryError.response?.data),
              retryStatus,
            )
          }

          throw new ApiError('Tidak dapat terhubung ke server.', 0)
        }
      }

      if (status === 401) {
        handleUnauthorizedSession(authScope)
      }

      throw new ApiError(
        getErrorMessage(error.response?.data),
        status,
      )
    }

    throw new ApiError('Tidak dapat terhubung ke server.', 0)
  }
}

function setAuthorizationHeader(
  requestHeaders: AxiosHeaders,
  authScope: AuthScope,
) {
  const accessToken = getAccessToken(authScope)

  if (accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  } else {
    requestHeaders.delete('Authorization')
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

async function refreshSession(authScope: AuthScope) {
  if (authScope === 'none') {
    return false
  }

  if (authScope === 'platform-admin') {
    pendingPlatformAdminRefresh ??= refreshPlatformAdminSession().finally(
      () => {
        pendingPlatformAdminRefresh = null
      },
    )

    return pendingPlatformAdminRefresh
  }

  pendingUserRefresh ??= refreshUserSession().finally(() => {
    pendingUserRefresh = null
  })

  return pendingUserRefresh
}

async function refreshUserSession() {
  try {
    const response = await axiosClient.post<UserRefreshResponse>('/auth/refresh')
    storeAuthSession({
      accessToken: response.data.accessToken,
      user: response.data.user,
    })

    return true
  } catch {
    return false
  }
}

async function refreshPlatformAdminSession() {
  try {
    const response = await axiosClient.post<PlatformAdminRefreshResponse>(
      '/platform-admin/auth/refresh',
    )
    storePlatformAdminSession({
      accessToken: response.data.accessToken,
      admin: response.data.admin,
    })

    return true
  } catch {
    return false
  }
}

function handleUnauthorizedSession(authScope: AuthScope) {
  if (authScope === 'none') {
    return
  }

  const loginPath =
    authScope === 'platform-admin' ? '/admin/login' : '/login'

  if (authScope === 'platform-admin') {
    clearPlatformAdminSession()
  } else {
    clearAuthSession()
    clearSelectedTenant()
  }

  queryClient.clear()
  redirectToLogin(loginPath)
}

function redirectToLogin(loginPath: string) {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.pathname === loginPath) {
    return
  }

  if (pendingSessionRedirectPath !== null) {
    return
  }

  pendingSessionRedirectPath = loginPath
  window.location.replace(loginPath)
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

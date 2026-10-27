import { apiRequest } from '@/services/api-client'
import { type AuthUser } from '@/lib/auth-session'

export type LoginRequest = {
  email: string
  password: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export function changePassword(request: ChangePasswordRequest) {
  return apiRequest<void>('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(request),
    // A wrong current password also returns 401; the form handles this response.
    unauthorizedHandling: 'manual',
  })
}

export type LoginResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}

export function login(request: LoginRequest) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
    authScope: 'none',
  })
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}

import { apiRequest } from '@/lib/api-client'
import { type AuthUser } from '@/lib/auth-session'

export type LoginRequest = {
  email: string
  password: string
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
  })
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}

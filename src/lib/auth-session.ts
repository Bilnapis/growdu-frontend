export const authTokenStorageKey = 'growdu.auth.accessToken'
export const authUserStorageKey = 'growdu.auth.user'

export type AuthUser = {
  id: string
  tenantId: string | null
  email: string
  role: string
  status: string
  tenantName: string | null
  profileId: string | null
  profileName: string | null
}

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

export function getDefaultAuthenticatedPath(
  user: Pick<AuthUser, 'role'> | null,
) {
  if (user?.role === 'owner') {
    return '/bimbel/select'
  }

  if (user?.role === 'tutor') {
    return '/tutor/dashboard'
  }

  return '/dashboard'
}

export function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.localStorage.getItem(authTokenStorageKey)

  return token?.trim() ? token : null
}

export function isAuthenticated() {
  return getStoredAccessToken() !== null
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(authUserStorageKey)

  if (!value) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(value)

    return isAuthUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function storeAuthSession(session: AuthSession) {
  window.localStorage.setItem(authTokenStorageKey, session.accessToken)
  window.localStorage.setItem(authUserStorageKey, JSON.stringify(session.user))
}

export function clearAuthSession() {
  window.localStorage.removeItem(authTokenStorageKey)
  window.localStorage.removeItem(authUserStorageKey)
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const user = value as Record<string, unknown>

  return (
    typeof user.id === 'string' &&
    (typeof user.tenantId === 'string' || user.tenantId === null) &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    typeof user.status === 'string' &&
    (typeof user.tenantName === 'string' || user.tenantName === null) &&
    (typeof user.profileId === 'string' || user.profileId === null) &&
    (typeof user.profileName === 'string' || user.profileName === null)
  )
}

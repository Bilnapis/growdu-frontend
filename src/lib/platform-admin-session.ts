export const platformAdminTokenStorageKey = 'growdu.platformAdmin.accessToken'
export const platformAdminStorageKey = 'growdu.platformAdmin.account'

export type PlatformAdmin = {
  id: string
  email: string
  status: 'active' | 'inactive'
  lastLoginAt: string | null
}

export type PlatformAdminSession = {
  accessToken: string
  admin: PlatformAdmin
}

export function getPlatformAdminAccessToken() {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem(platformAdminTokenStorageKey)
  return token?.trim() ? token : null
}

export function isPlatformAdminAuthenticated() {
  return getPlatformAdminAccessToken() !== null
}

export function getStoredPlatformAdmin(): PlatformAdmin | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(platformAdminStorageKey)
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    return isPlatformAdmin(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function storePlatformAdminSession(session: PlatformAdminSession) {
  window.localStorage.setItem(platformAdminTokenStorageKey, session.accessToken)
  window.localStorage.setItem(platformAdminStorageKey, JSON.stringify(session.admin))
}

export function clearPlatformAdminSession() {
  window.localStorage.removeItem(platformAdminTokenStorageKey)
  window.localStorage.removeItem(platformAdminStorageKey)
}

function isPlatformAdmin(value: unknown): value is PlatformAdmin {
  if (typeof value !== 'object' || value === null) return false
  const admin = value as Record<string, unknown>
  return (
    typeof admin.id === 'string' &&
    typeof admin.email === 'string' &&
    (admin.status === 'active' || admin.status === 'inactive') &&
    (typeof admin.lastLoginAt === 'string' || admin.lastLoginAt === null)
  )
}

export const tenantSelectionStorageKey = 'growdu.tenant.selection.v1'

type TenantSelection = {
  userId: string
  tenantId: string
}

export function getStoredSelectedTenantId(userId: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(tenantSelectionStorageKey)
  if (!value) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(value)
    if (!isTenantSelection(parsed) || parsed.userId !== userId) {
      return null
    }

    return parsed.tenantId
  } catch {
    return null
  }
}

export function storeSelectedTenant(userId: string, tenantId: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    tenantSelectionStorageKey,
    JSON.stringify({ userId, tenantId }),
  )
}

export function clearSelectedTenant() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(tenantSelectionStorageKey)
}

function isTenantSelection(value: unknown): value is TenantSelection {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const selection = value as Record<string, unknown>

  return (
    typeof selection.userId === 'string' &&
    typeof selection.tenantId === 'string' &&
    isUuid(selection.userId) &&
    isUuid(selection.tenantId)
  )
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

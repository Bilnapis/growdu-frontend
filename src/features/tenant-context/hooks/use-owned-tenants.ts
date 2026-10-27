import { useQuery } from '@tanstack/react-query'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'

import {
  getCurrentTenant,
  getOwnedTenants,
} from '@/features/tenant-context/api/tenant-context-api'

export const ownedTenantsQueryKey = ['tenant-context', 'owned'] as const
export const currentTenantQueryKey = ['tenant-context', 'current'] as const

export function useOwnedTenants({ enabled = true }: { enabled?: boolean } = {}) {
  const user = getStoredAuthUser()
  return useQuery({
    queryKey: [...ownedTenantsQueryKey, user?.id],
    queryFn: ({ signal }) => getOwnedTenants(signal),
    enabled,
  })
}

export function useCurrentTenant({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const user = getStoredAuthUser()
  const tenantId = user?.role === 'owner'
    ? getStoredSelectedTenantId(user.id)
    : user?.tenantId
  return useQuery({
    queryKey: [...currentTenantQueryKey, user?.id, tenantId],
    queryFn: ({ signal }) => getCurrentTenant(signal),
    enabled: enabled && Boolean(user && tenantId),
    refetchOnWindowFocus: true,
  })
}

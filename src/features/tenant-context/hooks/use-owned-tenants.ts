import { useQuery } from '@tanstack/react-query'

import {
  getCurrentTenant,
  getOwnedTenants,
} from '@/features/tenant-context/api/tenant-context-api'

export const ownedTenantsQueryKey = ['tenant-context', 'owned'] as const
export const currentTenantQueryKey = ['tenant-context', 'current'] as const

export function useOwnedTenants({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ownedTenantsQueryKey,
    queryFn: ({ signal }) => getOwnedTenants(signal),
    enabled,
  })
}

export function useCurrentTenant({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: currentTenantQueryKey,
    queryFn: ({ signal }) => getCurrentTenant(signal),
    enabled,
  })
}

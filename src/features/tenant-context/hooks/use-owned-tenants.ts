import { useQuery } from '@tanstack/react-query'

import { getOwnedTenants } from '@/features/tenant-context/api/tenant-context-api'

export const ownedTenantsQueryKey = ['tenant-context', 'owned'] as const

export function useOwnedTenants() {
  return useQuery({
    queryKey: ownedTenantsQueryKey,
    queryFn: ({ signal }) => getOwnedTenants(signal),
  })
}

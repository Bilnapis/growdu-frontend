import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  currentTenantQueryKey,
  ownedTenantsQueryKey,
} from '@/features/tenant-context/hooks/use-owned-tenants'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import {
  updateTenantSettings,
  type TenantSettingsInput,
} from '../api/tenant-settings-api'

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient()
  const user = getStoredAuthUser()
  const tenantId =
    user?.role === 'owner' ? getStoredSelectedTenantId(user.id) : user?.tenantId
  return useMutation({
    mutationFn: (input: TenantSettingsInput) => updateTenantSettings(input),
    onSuccess: (tenant) => {
      queryClient.setQueryData(
        [...currentTenantQueryKey, user?.id, tenantId],
        tenant,
      )
      void queryClient.invalidateQueries({
        queryKey: [...ownedTenantsQueryKey, user?.id],
      })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clearAuthSession } from '@/lib/auth-session'
import { clearSelectedTenant } from '@/lib/tenant-session'
import { changePassword } from '@/services/auth.service'

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changePassword,
    gcTime: 0,
    retry: false,
    onSuccess: () => {
      clearAuthSession()
      clearSelectedTenant()
      queryClient.clear()
    },
  })
}

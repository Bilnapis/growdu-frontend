import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { TutorAccount } from '@/features/tutor-account/components/TutorAccount'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'
import { clearAuthSession, getStoredAuthUser } from '@/lib/auth-session'
import { clearSelectedTenant } from '@/lib/tenant-session'
import { logout } from '@/services/auth.service'

export function TutorProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = getStoredAuthUser()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession()
      clearSelectedTenant()
      queryClient.clear()
      void navigate('/login', { replace: true })
    },
  })
  const displayName = user?.profileName?.trim() || user?.email || 'Tentor'
  const roleLabel = `Tentor ${user?.tenantName?.trim() || 'BimbelKit'}`

  return (
    <main className="min-h-dvh bg-background pb-20 text-foreground">
      <TutorAccount
        name={displayName}
        roleLabel={roleLabel}
        isLoggingOut={logoutMutation.isPending}
        onLogout={() => logoutMutation.mutate()}
      />
      <TutorBottomNavigation />
    </main>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import {
  SidebarClient,
  type SidebarClientItemId,
} from '@/components/SidebarClient'
import { Button } from '@/components/ui/button'
import { clearAuthSession } from '@/lib/auth-session'
import { clearSelectedTenant } from '@/lib/tenant-session'
import { logout } from '@/services/auth.service'

const sidebarItemIds: readonly SidebarClientItemId[] = [
  'dashboard',
  'students',
  'tutors',
  'staff',
  'study-groups',
  'schedule',
  'rooms',
  'invoices',
  'payroll',
  'reports',
  'announcements',
  'settings',
]

function getActiveItem(pathname: string): SidebarClientItemId {
  const section = pathname.split('/')[1]

  return sidebarItemIds.find((item) => item === section) ?? 'dashboard'
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession()
      clearSelectedTenant()
      queryClient.clear()
      void navigate('/login', { replace: true })
    },
  })

  function handleItemSelect(itemId: SidebarClientItemId) {
    void navigate(itemId === 'dashboard' ? '/dashboard' : `/${itemId}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <SidebarClient
        className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto"
        activeItem={getActiveItem(location.pathname)}
        onItemSelect={handleItemSelect}
      />

      <div className="min-w-0 flex-1">
        <header className="flex justify-end border-b border-border bg-card px-5 py-3 lg:px-7">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {logoutMutation.isPending ? 'Keluar...' : 'Keluar'}
          </Button>
        </header>

        <main className="min-w-0 p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

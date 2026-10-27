import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  SidebarClient,
  type SidebarClientItemId,
} from '@/components/SidebarClient'
import { Button } from '@/components/ui/button'
import {
  useCurrentTenant,
  useOwnedTenants,
} from '@/features/tenant-context/hooks/use-owned-tenants'
import { clearAuthSession, getStoredAuthUser } from '@/lib/auth-session'
import {
  clearSelectedTenant,
  getStoredSelectedTenantId,
} from '@/lib/tenant-session'
import { logout } from '@/services/auth.service'
import { useCurrentUser } from '@/hooks/use-current-user'
import { hasMenuAccess } from '@/lib/menu-access'
import { DashboardAccountMenu } from './DashboardAccountMenu'

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
  const isStudyGroupDetail =
    /^\/study-groups\/(?:new|[^/]+(?:\/edit)?)\/?$/.test(location.pathname)
  const isScheduleDetail = /^\/schedule\/[^/]+\/?$/.test(location.pathname)
  const queryClient = useQueryClient()
  const user = getStoredAuthUser()
  const currentUserQuery = useCurrentUser()
  const currentUser =
    user?.role === 'operator' ? (currentUserQuery.data ?? null) : user
  const visibleItems = sidebarItemIds.filter((item) =>
    hasMenuAccess(currentUser, item),
  )
  const activeItem = getActiveItem(location.pathname)
  const firstMenu = visibleItems[0]
  const canAccess = hasMenuAccess(currentUser, activeItem)
  const selectedTenantId = user ? getStoredSelectedTenantId(user.id) : null
  const tenantsQuery = useOwnedTenants({ enabled: user?.role === 'owner' })
  const currentTenantQuery = useCurrentTenant({
    enabled: Boolean(user && user.role !== 'owner'),
  })
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

  const selectedTenant = tenantsQuery.data?.find(
    (tenant) => tenant.id === selectedTenantId,
  )
  const sidebarTenant = selectedTenant ?? currentTenantQuery.data
  const tenantName =
    sidebarTenant?.name ??
    (user?.role === 'owner' && tenantsQuery.isPending
      ? 'Memuat bimbel...'
      : (user?.tenantName ?? 'Bimbel'))

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <SidebarClient
        className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto"
        activeItem={getActiveItem(location.pathname)}
        tenantLogoUrl={sidebarTenant?.logoUrl ?? null}
        tenantName={tenantName}
        userRole={user?.role ?? null}
        onItemSelect={handleItemSelect}
        visibleItems={visibleItems}
      />

      <div className="min-w-0 flex-1">
        {!isStudyGroupDetail && !isScheduleDetail ? (
          <header className="flex h-[61px] items-center justify-end border-b border-border bg-card px-5 py-3 lg:px-7">
            <DashboardAccountMenu
              accountName={
                currentUser?.profileName?.trim() ||
                user?.profileName?.trim() ||
                user?.email ||
                'Akun saya'
              }
              isLoggingOut={logoutMutation.isPending}
              onLogout={() => logoutMutation.mutate()}
            />
          </header>
        ) : null}

        <main className="min-w-0 p-5 sm:p-7">
          {user?.role === 'operator' && currentUserQuery.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">
              Memuat hak akses...
            </p>
          ) : user?.role === 'operator' && currentUserQuery.isError ? (
            <section
              role="alert"
              className="space-y-3 rounded-lg border bg-card p-6"
            >
              <h1 className="text-xl font-bold">
                Hak akses belum dapat dimuat
              </h1>
              <p className="text-sm text-muted-foreground">
                Periksa koneksi Anda lalu coba kembali.
              </p>
              <Button
                variant="outline"
                onClick={() => void currentUserQuery.refetch()}
              >
                Coba lagi
              </Button>
            </section>
          ) : !canAccess ? (
            activeItem === 'dashboard' && firstMenu ? (
              <Navigate to={`/${firstMenu}`} replace />
            ) : (
              <section
                role="alert"
                className="space-y-3 rounded-lg border bg-card p-6"
              >
                <h1 className="text-xl font-bold">
                  {firstMenu
                    ? 'Anda tidak memiliki akses ke menu ini'
                    : 'Belum ada akses menu'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Hubungi pemilik bimbel untuk mengatur hak akses Anda.
                </p>
                {firstMenu ? (
                  <Button asChild variant="outline">
                    <Link to={`/${firstMenu}`}>Buka menu yang tersedia</Link>
                  </Button>
                ) : null}
              </section>
            )
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}

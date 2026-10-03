import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut, ShieldCheck, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { platformAdminLogout } from '@/features/platform-admin/api/platform-admin-api'
import {
  clearPlatformAdminSession,
  getStoredPlatformAdmin,
} from '@/lib/platform-admin-session'
import { cn } from '@/lib/utils'

const navigationItems = [
  { to: '/admin', label: 'Ringkasan', icon: ShieldCheck, end: true },
  { to: '/admin/users', label: 'Pengguna', icon: Users, end: false },
] as const

export function AdminLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const admin = getStoredPlatformAdmin()
  const logoutMutation = useMutation({
    mutationFn: platformAdminLogout,
    onSettled: () => {
      clearPlatformAdminSession()
      queryClient.clear()
      void navigate('/admin/login', { replace: true })
    },
  })

  function handleSignOut() {
    logoutMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink to="/admin" className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              GD
            </span>
            <span className="leading-tight">
              GrowDu
              <span className="block text-xs font-normal text-muted-foreground">
                Super Admin
              </span>
            </span>
          </NavLink>

          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm sm:block">
              <strong className="block font-medium">{admin?.email}</strong>
              <span className="text-xs text-muted-foreground">
                Administrator platform
              </span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">
                {logoutMutation.isPending ? 'Keluar...' : 'Keluar'}
              </span>
              <span className="sr-only sm:hidden">
                {logoutMutation.isPending ? 'Memproses logout' : 'Keluar'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav className="border-b bg-card p-3 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:p-4" aria-label="Navigasi Super Admin">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col">
            {navigationItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                      isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

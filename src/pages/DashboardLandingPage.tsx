import { Outlet } from 'react-router-dom'

import { getStoredAuthUser } from '@/lib/auth-session'
import { SetupPage } from '@/pages/SetupPage'

export function DashboardLandingPage() {
  const user = getStoredAuthUser()

  if (user?.role === 'owner' || user?.role === 'operator') {
    return <Outlet />
  }

  return <SetupPage />
}

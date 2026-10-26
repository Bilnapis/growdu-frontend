import { Navigate, Outlet } from 'react-router-dom'

import { getStoredAuthUser } from '@/lib/auth-session'
import { SetupPage } from '@/pages/client/SetupPage'

export function DashboardLandingPage() {
  const user = getStoredAuthUser()

  if (user?.role === 'owner' || user?.role === 'operator') {
    return <Outlet />
  }

  if (user?.role === 'tutor') {
    return <Navigate to="/tutor/dashboard" replace />
  }

  return <SetupPage />
}

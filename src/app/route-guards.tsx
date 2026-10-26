import { type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import {
  getDefaultAuthenticatedPath,
  getStoredAuthUser,
  isAuthenticated,
} from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import {
  getStoredPlatformAdmin,
  isPlatformAdminAuthenticated,
} from '@/lib/platform-admin-session'

type GuardProps = {
  children?: ReactNode
}

type RedirectState = {
  from?: {
    pathname?: unknown
    search?: unknown
    hash?: unknown
  }
}

const unauthenticatedFallbackPath = '/login'

function getAuthenticatedRedirectPath(state: unknown) {
  const fallbackPath = getDefaultAuthenticatedPath(getStoredAuthUser())

  if (!isRedirectState(state)) {
    return fallbackPath
  }

  const pathname =
    typeof state.from?.pathname === 'string'
      ? state.from.pathname
      : fallbackPath
  const search = typeof state.from?.search === 'string' ? state.from.search : ''
  const hash = typeof state.from?.hash === 'string' ? state.from.hash : ''

  if (pathname === unauthenticatedFallbackPath || pathname === '/') {
    return fallbackPath
  }

  return `${pathname}${search}${hash}`
}

function isRedirectState(state: unknown): state is RedirectState {
  return typeof state === 'object' && state !== null && 'from' in state
}

export function AuthenticatedRoute({ children }: GuardProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={unauthenticatedFallbackPath}
        replace
        state={{ from: location }}
      />
    )
  }

  return children ?? <Outlet />
}

export function UnauthenticatedRoute({ children }: GuardProps) {
  const location = useLocation()

  if (isAuthenticated()) {
    return (
      <Navigate to={getAuthenticatedRedirectPath(location.state)} replace />
    )
  }

  return children ?? <Outlet />
}

export function OwnerRoute({ children }: GuardProps) {
  const location = useLocation()
  const user = getStoredAuthUser()

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user.role !== 'owner') {
    return <Navigate to="/dashboard" replace />
  }

  return children ?? <Outlet />
}

export function TenantContextRoute({ children }: GuardProps) {
  const location = useLocation()
  const user = getStoredAuthUser()

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user.role === 'owner' && getStoredSelectedTenantId(user.id) === null) {
    return <Navigate to="/bimbel/select" replace />
  }

  return children ?? <Outlet />
}

export function TutorRoute({ children }: GuardProps) {
  const location = useLocation()
  const user = getStoredAuthUser()

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user.role !== 'tutor') {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />
  }

  return children ?? <Outlet />
}

export function AdminLoginRoute({ children }: GuardProps) {
  const admin = getStoredPlatformAdmin()

  if (isPlatformAdminAuthenticated() && admin) {
    return <Navigate to="/admin" replace />
  }

  return children ?? <Outlet />
}

export function PlatformAdminRoute({ children }: GuardProps) {
  const location = useLocation()
  const admin = getStoredPlatformAdmin()

  if (!isPlatformAdminAuthenticated() || !admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}

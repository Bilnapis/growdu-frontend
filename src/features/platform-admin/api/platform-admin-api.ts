import { apiRequest } from '@/services/api-client'
import { type PlatformAdmin } from '@/lib/platform-admin-session'

export type PlatformUserRole = 'owner' | 'operator' | 'tutor' | 'parent'
export type PlatformUserStatus = 'active' | 'inactive'

export type PlatformUser = {
  id: string
  email: string
  role: PlatformUserRole
  status: PlatformUserStatus
  tenantId: string | null
  tenantName: string | null
  lastLoginAt: string | null
  createdAt: string
}

export type PlatformTenant = {
  id: string
  name: string
  status: 'active' | 'inactive'
}

export type PlatformTenantStatus = PlatformTenant['status']

export type PlatformManagedTenant = PlatformTenant & {
  ownerId: string
  ownerName: string
  ownerEmail: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

export type PlatformTenantOwner = {
  id: string
  name: string
  email: string
}

export type CreatePlatformTenantInput = {
  ownerId: string
  name: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  logoUrl: string | null
  status: PlatformTenantStatus
}

export type UpdatePlatformTenantInput = CreatePlatformTenantInput

export type ManagedPlatformTenantFilters = {
  page: number
  limit: number
  search?: string
  status?: PlatformTenantStatus
}

type ManagedPlatformTenantsResponse = {
  data: PlatformManagedTenant[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type PlatformUserDetail = PlatformUser & {
  name: string
  phoneNumber: string
  sessionRate: string | null
  ownedTenants: PlatformTenant[]
}

export type PlatformUserFilters = {
  page: number
  limit: number
  search?: string
  role?: PlatformUserRole
  status?: PlatformUserStatus
}

type PlatformUsersResponse = {
  data: PlatformUser[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type PlatformAdminLoginRequest = {
  email: string
  password: string
}

type PlatformAdminLoginResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  admin: PlatformAdmin
}

export function platformAdminLogin(request: PlatformAdminLoginRequest) {
  return apiRequest<PlatformAdminLoginResponse>('/platform-admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
    authScope: 'none',
  })
}

export function platformAdminLogout() {
  return apiRequest<void>('/platform-admin/auth/logout', {
    method: 'POST',
    authScope: 'platform-admin',
  })
}

export function getPlatformUsers(
  filters: PlatformUserFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.role) params.set('role', filters.role)
  if (filters.status) params.set('status', filters.status)

  return apiRequest<PlatformUsersResponse>(
    `/platform-admin/users?${params.toString()}`,
    { authScope: 'platform-admin', signal },
  )
}

export type UpdatePlatformUserInput = {
  email?: string
  status?: PlatformUserStatus
  tenantId?: string
  name?: string
  phoneNumber?: string
  sessionRate?: string
  password?: string
}

export type CreatePlatformUserInput = {
  role: PlatformUserRole
  tenantId?: string
  name: string
  phoneNumber: string
  email: string
  password: string
  sessionRate?: string
}

export function updatePlatformUser(id: string, input: UpdatePlatformUserInput) {
  return apiRequest<PlatformUserDetail>(`/platform-admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    authScope: 'platform-admin',
  })
}

export function getPlatformUser(id: string, signal?: AbortSignal) {
  return apiRequest<PlatformUserDetail>(`/platform-admin/users/${id}`, {
    authScope: 'platform-admin',
    signal,
  })
}

export function resetPlatformUserPassword(id: string, password: string) {
  return apiRequest<void>(`/platform-admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
    authScope: 'platform-admin',
  })
}

export function createPlatformUser(input: CreatePlatformUserInput) {
  return apiRequest<PlatformUser>('/platform-admin/users', {
    method: 'POST',
    body: JSON.stringify(input),
    authScope: 'platform-admin',
  })
}

export function getPlatformTenants(signal?: AbortSignal) {
  return apiRequest<PlatformTenant[]>('/platform-admin/users/tenants', {
    authScope: 'platform-admin',
    signal,
  })
}

export function getManagedPlatformTenants(
  filters: ManagedPlatformTenantFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)

  return apiRequest<ManagedPlatformTenantsResponse>(
    `/platform-admin/tenants?${params.toString()}`,
    {
    authScope: 'platform-admin',
    signal,
    },
  )
}

export function getPlatformTenantOwners(signal?: AbortSignal) {
  return apiRequest<PlatformTenantOwner[]>('/platform-admin/tenants/owners', {
    authScope: 'platform-admin',
    signal,
  })
}

export function createPlatformTenant(input: CreatePlatformTenantInput) {
  return apiRequest<PlatformManagedTenant>('/platform-admin/tenants', {
    method: 'POST',
    body: JSON.stringify(input),
    authScope: 'platform-admin',
  })
}

export function updatePlatformTenant(
  id: string,
  input: UpdatePlatformTenantInput,
) {
  return apiRequest<PlatformManagedTenant>(`/platform-admin/tenants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    authScope: 'platform-admin',
  })
}

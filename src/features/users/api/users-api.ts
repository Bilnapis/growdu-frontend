import { apiRequest } from '@/lib/api-client'

export type UserRole = 'owner' | 'operator' | 'tutor' | 'parent'
export type UserStatus = 'active' | 'inactive'

export type ManagedUser = {
  id: string
  tenantId: string | null
  email: string
  role: UserRole
  status: UserStatus
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type UsersFilters = {
  page: number
  limit: number
  search?: string
  role?: UserRole
  status?: UserStatus
}

type PaginatedUsersResponse = {
  data: ManagedUser[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UpdateUserInput = {
  email?: string
  status?: UserStatus
}

export function getUsers(filters: UsersFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.role) params.set('role', filters.role)
  if (filters.status) params.set('status', filters.status)

  return apiRequest<PaginatedUsersResponse>(`/users?${params.toString()}`, {
    signal,
  })
}

export function updateUser(id: string, input: UpdateUserInput) {
  return apiRequest<ManagedUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function resetUserPassword(id: string, password: string) {
  return apiRequest<void>(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

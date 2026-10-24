import { apiRequest, ApiError } from '@/services/api-client'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'

export type StaffStatus = 'active' | 'inactive'
export type StaffMember = {
  id: string
  tenantId: string
  userId: string
  name: string
  phoneNumber: string
  address: string | null
  email: string
  status: StaffStatus
  createdAt: string
  updatedAt: string
}
export type StaffInput = {
  name: string
  phoneNumber: string
  address?: string
  email: string
  password: string
}
export type StaffFilters = { page: number; limit: number; search?: string; status?: StaffStatus }
type StaffResponse = {
  data: StaffMember[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export function getStaffTenantId() {
  const user = getStoredAuthUser()
  return user?.role === 'owner' ? getStoredSelectedTenantId(user.id) : null
}

export function getStaff(tenantId: string, filters: StaffFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) })
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  return apiRequest<StaffResponse>(`/tenants/${encodeURIComponent(tenantId)}/operators?${params}`, { signal })
}

export function getStaffMember(tenantId: string, id: string, signal?: AbortSignal) {
  return apiRequest<StaffMember>(`/tenants/${encodeURIComponent(tenantId)}/operators/${encodeURIComponent(id)}`, { signal })
}

export function createStaff(tenantId: string, input: StaffInput) {
  return apiRequest<StaffMember>(`/tenants/${encodeURIComponent(tenantId)}/operators`, { method: 'POST', body: input })
}

export function getStaffError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Anda tidak memiliki izin untuk mengelola pegawai bimbel ini.'
    if (error.status === 409) return 'Email sudah terdaftar. Gunakan email lain.'
    if (error.status === 400) return 'Periksa kembali data pegawai yang Anda isi.'
    if (error.status === 404) return 'Bimbel tidak ditemukan atau tidak dapat diakses.'
    if (error.status === 401) return 'Sesi telah berakhir. Silakan masuk kembali.'
  }
  return 'Data pegawai belum dapat diproses. Silakan coba lagi.'
}

export type StaffUpdateInput = Partial<Pick<StaffMember, 'name' | 'email' | 'phoneNumber' | 'status'>> & { address?: string; password?: string }

export function updateStaff(tenantId: string, id: string, input: StaffUpdateInput) {
  return apiRequest<StaffMember>(`/tenants/${encodeURIComponent(tenantId)}/operators/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
}

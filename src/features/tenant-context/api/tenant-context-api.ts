import { apiRequest } from '@/services/api-client'

export type OwnedTenant = {
  id: string
  name: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  logoUrl: string | null
  status: 'active' | 'inactive'
}

export function getOwnedTenants(signal?: AbortSignal) {
  return apiRequest<OwnedTenant[]>('/tenants/owned', { signal })
}

export function getCurrentTenant(signal?: AbortSignal) {
  return apiRequest<OwnedTenant>('/tenants/me', { signal })
}

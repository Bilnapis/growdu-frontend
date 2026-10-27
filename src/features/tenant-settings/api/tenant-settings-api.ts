import type { OwnedTenant } from '@/features/tenant-context/api/tenant-context-api'
import { apiRequest } from '@/services/api-client'

export type TenantIdentityInput = {
  name: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  websiteUrl: string | null
  logoUrl?: string | null
}

export type TenantSettingsInput = TenantIdentityInput | { primaryColor: string }

export function updateTenantSettings(input: TenantSettingsInput) {
  return apiRequest<OwnedTenant>('/tenants/me', {
    method: 'PATCH',
    body: input,
  })
}

export function uploadTenantLogo(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest<{ logoUrl: string }>('/tenants/me/logo', {
    method: 'POST',
    body,
  })
}

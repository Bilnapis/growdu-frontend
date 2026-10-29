import { ApiError } from '@/services/api-client'

export function isDashboardAccessError(error: unknown) {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  )
}

export function dashboardErrorMessage(error: unknown) {
  if (isDashboardAccessError(error)) {
    return 'Anda tidak memiliki akses ke data ini.'
  }

  return 'Data belum dapat dimuat. Silakan coba lagi.'
}

import { getStoredAuthUser } from '@/lib/auth-session'
import { ApiError } from '@/services/api-client'
import type { ReportStatus } from './api'

export const reportLabels: Record<ReportStatus, string> = {
  unfilled: 'Belum diisi',
  draft: 'Draft',
  partially_published: 'Terbit sebagian',
  published: 'Terbit',
}
export function isReportStatus(value: string | null): value is ReportStatus {
  return value !== null && Object.hasOwn(reportLabels, value)
}
export function previousMonth() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const date = new Date(today.slice(0, 7) + '-01T00:00:00Z')
  date.setUTCMonth(date.getUTCMonth() - 1)
  return date.toISOString().slice(0, 7)
}
export function validPeriod(value: string | null) {
  return value && /^20\d{2}-(0[1-9]|1[0-2])$/.test(value)
    ? value
    : previousMonth()
}
export const monthLabel = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value + '-01T00:00:00Z'))
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    ...(value.length > 10 ? { timeStyle: 'short' as const } : {}),
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value.length === 10 ? value + 'T00:00:00+07:00' : value))
export function reportError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Anda tidak memiliki akses ke laporan ini.'
    if (error.status === 404) return 'Laporan atau kelompok tidak ditemukan.'
    if (error.status === 409)
      return 'Data telah berubah. Simpan salinan perubahan Anda lalu muat ulang data.'
    if (error.status === 400) return error.message
  }
  return 'Laporan belum dapat diproses. Periksa koneksi lalu coba lagi.'
}

export function reportBase() {
  return getStoredAuthUser()?.role === 'tutor' ? '/tutor/reports' : '/reports'
}

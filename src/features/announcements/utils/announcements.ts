import { ApiError } from '@/services/api-client'
import type { AnnouncementTarget } from '../api/announcements-api'

export const targetLabels: Record<AnnouncementTarget, string> = {
  all: 'Semua',
  admin: 'Admin',
  tutor: 'Tentor',
  parent: 'Siswa/Wali',
}

export function isAnnouncementTarget(
  value: unknown,
): value is AnnouncementTarget {
  return (
    value === 'all' ||
    value === 'admin' ||
    value === 'tutor' ||
    value === 'parent'
  )
}

const formatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
})

export function formatAnnouncementDate(value: string | null) {
  return value
    ? `${formatter
        .format(new Date(value))
        .replace(',', '')
        .replace(/\.(?=\d{2}$)/, ':')} WIB`
    : '—'
}

export function toJakartaInput(value: string | null) {
  if (!value) return ''
  const date = new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 16)
}

export function fromJakartaInput(value: string) {
  if (!value) return null
  const date = new Date(`${value}:00+07:00`)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}

export function announcementErrorMessage(
  error: unknown,
  fallback = 'Pengumuman belum dapat dimuat. Silakan coba lagi.',
) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403)
      return 'Anda tidak memiliki akses ke pengumuman ini.'
    if (error.status === 404)
      return 'Pengumuman tidak ditemukan atau sudah dihapus.'
    if (error.status === 0)
      return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
  }
  return fallback
}

import { ApiError } from '@/services/api-client'

export const rupiah = (value: number) =>
  `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
export const billingToday = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
export const periodLabel = (period: string) =>
  new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${period}-01T00:00:00+07:00`))
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date.length === 10 ? `${date}T00:00:00+07:00` : date))
export const timeLabel = (date: string) =>
  `${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(date))} WIB`
export function invoiceError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403 || error.status === 401)
      return 'Anda tidak memiliki akses ke data invoice ini.'
    if (error.status === 404) return 'Data invoice atau siswa tidak ditemukan.'
    if (error.status === 409)
      return 'Data sudah berubah atau pembayaran sudah dicatat. Muat ulang invoice sebelum melanjutkan.'
    if (error.status === 413) return 'Bukti pembayaran maksimal 5 MB.'
    if (error.status === 400)
      return 'Periksa kembali isian, tanggal pembayaran, dan nominal tagihan.'
  }
  return 'Data belum dapat diproses. Periksa koneksi Anda dan coba kembali.'
}

export function formText(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value : ''
}

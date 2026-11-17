import { ApiError } from '@/services/api-client'
export const todayWib = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(
    new Date(),
  )
export const rupiah = (value: string | number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  }).format(Number(value))
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value.length === 10 ? `${value}T00:00:00+07:00` : value))
export const rangeLabel = (value: { startDate: string; endDate: string }) =>
  `${dateLabel(value.startDate)}–${dateLabel(value.endDate)}`
export function payrollError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403)
      return 'Anda tidak memiliki akses ke penggajian ini.'
    if (error.status === 404) return 'Data penggajian tidak ditemukan.'
    if (error.status >= 500)
      return 'Penggajian belum dapat diproses. Silakan coba kembali.'
    return error.message
  }
  return 'Data penggajian belum dapat diproses. Silakan coba kembali.'
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function decimalMinor(value: string) {
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

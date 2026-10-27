import { ApiError } from '@/services/api-client'

export function settingsError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403)
      return 'Anda tidak memiliki izin untuk mengubah pengaturan bimbel.'
    if (error.status === 413) return 'Ukuran logo maksimal 2 MB.'
    if (error.status === 0)
      return 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.'
    if (error.status === 400)
      return 'Data belum dapat disimpan. Periksa kembali isian dan file logo Anda.'
  }
  return 'Pengaturan belum dapat disimpan. Silakan coba lagi.'
}

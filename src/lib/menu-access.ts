import type { AuthUser } from './auth-session'

export const operatorMenus = [
  { id: 'dashboard', label: 'Dashboard', description: 'Melihat ringkasan operasional dan notifikasi penting' },
  { id: 'students', label: 'Siswa', description: 'Kelola data siswa, wali, dan riwayat belajar' },
  { id: 'tutors', label: 'Tentor', description: 'Kelola data tentor' },
  { id: 'study-groups', label: 'Kelompok Belajar', description: 'Atur kelas, program, dan anggota kelompok' },
  { id: 'schedule', label: 'Jadwal', description: 'Membuat dan mengubah jadwal belajar' },
  { id: 'rooms', label: 'Ruangan', description: 'Mengatur ketersediaan ruangan' },
  { id: 'invoices', label: 'Invoice SPP', description: 'Membuat tagihan dan memantau pembayaran' },
  { id: 'payroll', label: 'Penggajian', description: 'Mengelola gaji, pembayaran, dan slip gaji tentor' },
  { id: 'reports', label: 'Laporan', description: 'Membuka laporan performa dan keuangan' },
  { id: 'announcements', label: 'Pengumuman', description: 'Kelola pengumuman untuk admin, tentor, siswa, dan wali' },
  { id: 'settings', label: 'Pengaturan', description: 'Mengubah konfigurasi aplikasi' },
] as const

export type OperatorMenu = (typeof operatorMenus)[number]['id']

export function isOperatorMenu(value: unknown): value is OperatorMenu {
  return operatorMenus.some((menu) => menu.id === value)
}

export function hasMenuAccess(user: AuthUser | null, menu: string) {
  if (user?.role === 'owner') return true
  return user?.role === 'operator' && isOperatorMenu(menu) &&
    user.menuPermissions?.includes(menu) === true
}

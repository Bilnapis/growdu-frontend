import { useParams } from 'react-router-dom'

const moduleLabels: Record<string, string> = {
  students: 'Siswa',
  tutors: 'Tentor',
  staff: 'User/Pegawai',
  'study-groups': 'Kelompok Belajar',
  schedule: 'Jadwal',
  rooms: 'Ruangan',
  invoices: 'Invoice SPP',
  payroll: 'Penggajian',
  reports: 'Laporan',
  announcements: 'Pengumuman',
  settings: 'Pengaturan',
}

export function DashboardModulePlaceholderPage() {
  const { section } = useParams()
  const title = section ? moduleLabels[section] : undefined

  if (!title) {
    return <p className="text-sm text-muted-foreground">Halaman tidak ditemukan.</p>
  }

  return (
    <section className="rounded-lg border bg-card p-6" aria-labelledby="module-title">
      <h1 id="module-title" className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Modul ini sedang disiapkan. Dashboard operasional sudah tersedia untuk saat ini.
      </p>
    </section>
  )
}

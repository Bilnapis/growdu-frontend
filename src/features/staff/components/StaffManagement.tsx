import { useState } from 'react'
import {
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  UserRoundX,
  UsersRound,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type StaffStatus = 'active' | 'inactive'

type StaffMember = {
  id: string
  name: string
  email: string
  menuAccess: string
  status: StaffStatus
}

const staffMembers: readonly StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Dewi Lestari',
    email: 'dewi@bimbelkit.com',
    menuAccess: 'Dashboard, Siswa & Orang Tua',
    status: 'active',
  },
  {
    id: 'staff-2',
    name: 'Rizky Pratama',
    email: 'rizky@bimbelkit.com',
    menuAccess: 'Invoice SPP, Pengumuman',
    status: 'active',
  },
  {
    id: 'staff-3',
    name: 'Maya Anggraini',
    email: 'maya@bimbelkit.com',
    menuAccess: 'Tentor, Kelompok Belajar',
    status: 'active',
  },
  {
    id: 'staff-4',
    name: 'Budi Santoso',
    email: 'budi@bimbelkit.com',
    menuAccess: 'Jadwal, Ruangan, Penggajian',
    status: 'inactive',
  },
  {
    id: 'staff-5',
    name: 'Nadia Putri',
    email: 'nadia@bimbelkit.com',
    menuAccess: 'Laporan, Pengumuman',
    status: 'active',
  },
]

const summary = {
  active: 18,
  inactive: 15,
}

export function StaffManagement() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | StaffStatus>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      !normalizedSearch ||
      staff.name.toLocaleLowerCase('id-ID').includes(normalizedSearch) ||
      staff.email.toLocaleLowerCase('id-ID').includes(normalizedSearch)
    const matchesStatus = status === 'all' || staff.status === status

    return matchesSearch && matchesStatus
  })

  return (
    <section aria-labelledby="staff-page-title">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold leading-[1.3] text-primary">
            Manajemen pegawai
          </p>
          <h1 id="staff-page-title" className="mt-1.5 text-[28px] font-bold leading-[1.2] tracking-tight">
            Pegawai
          </h1>
          <p className="mt-1.5 text-sm leading-[1.4] text-muted-foreground">
            Kelola daftar akun pegawai, status, dan akses menu.
          </p>
        </div>
        <Button type="button" className="h-11 px-[18px] font-bold" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          Tambah Pegawai
        </Button>
      </header>

      <div className="mt-[22px] grid gap-[14px] sm:grid-cols-2">
        <SummaryCard label="Pegawai Aktif" value={summary.active} icon={<UsersRound className="h-[18px] w-[18px]" aria-hidden="true" />} tone="success" />
        <SummaryCard label="Pegawai Nonaktif" value={summary.inactive} icon={<UserRoundX className="h-[18px] w-[18px]" aria-hidden="true" />} tone="muted" />
      </div>

      <div className="mt-[22px] rounded-lg border bg-card p-[18px] shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="staff-search" className="sr-only">Cari pegawai</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="staff-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau email pegawai..." className="h-10 bg-slate-50 pl-10" />
          </div>
          <div className="relative sm:w-36">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="staff-status" className="sr-only">Filter status pegawai</label>
            <select id="staff-status" value={status} onChange={(event) => setStatus(event.target.value as 'all' | StaffStatus)} className="h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-10 pr-3 text-[13px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="all">Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="mt-[14px] overflow-x-auto rounded-md border">
          <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
            <caption className="sr-only">Daftar pegawai bimbel</caption>
            <thead className="bg-slate-50 text-muted-foreground">
              <tr className="h-11">
                <th scope="col" className="w-[25%] px-[26px] font-bold">Nama</th>
                <th scope="col" className="w-[28%] px-[26px] font-bold">Email</th>
                <th scope="col" className="w-[32%] px-[26px] font-bold">Akses menu</th>
                <th scope="col" className="w-[11%] px-[26px] font-bold">Status</th>
                <th scope="col" className="w-[4%] px-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="h-[70px] bg-card">
                  <td className="px-[26px] font-bold text-foreground">{staff.name}</td>
                  <td className="px-[26px] font-medium text-foreground">{staff.email}</td>
                  <td className="px-[26px] font-medium text-foreground">{staff.menuAccess}</td>
                  <td className="px-[26px]"><StatusBadge status={staff.status} /></td>
                  <td className="px-3 text-center">
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label={`Aksi untuk ${staff.name}`}>
                      <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 ? <p className="px-6 py-10 text-center text-sm text-muted-foreground">Pegawai yang dicari tidak ditemukan.</p> : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {filteredStaff.length === 0 ? '0' : `1-${filteredStaff.length}`} dari {summary.active} pegawai
          </p>
          <nav className="flex items-center gap-1" aria-label="Pagination pegawai">
            <Button type="button" variant="outline" size="sm" disabled>Sebelumnya</Button>
            <Button type="button" size="sm" aria-current="page">1</Button>
            <Button type="button" variant="outline" size="sm">2</Button>
            <Button type="button" variant="outline" size="sm">3</Button>
            <Button type="button" variant="outline" size="sm">Berikutnya</Button>
          </nav>
        </div>
      </div>

      {isCreateDialogOpen ? <CreateStaffDialog onClose={() => setIsCreateDialogOpen(false)} /> : null}
    </section>
  )
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: 'success' | 'muted' }) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm" aria-label={`${label}: ${value}`}>
      <div className="flex items-center gap-2">
        <span className={tone === 'success' ? 'grid h-8 w-8 place-items-center rounded-md bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'grid h-8 w-8 place-items-center rounded-md bg-slate-50 text-muted-foreground'}>{icon}</span>
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1.5 text-[26px] font-extrabold leading-[1.3] text-foreground">{value}</p>
    </section>
  )
}

function StatusBadge({ status }: { status: StaffStatus }) {
  const isActive = status === 'active'

  return <span className={isActive ? 'inline-flex rounded-full bg-[var(--color-success-bg)] px-2.5 py-[5px] text-xs font-bold leading-[1.2] text-[var(--color-success)]' : 'inline-flex rounded-full bg-slate-100 px-2.5 py-[5px] text-xs font-bold leading-[1.2] text-muted-foreground'}>{isActive ? 'Aktif' : 'Nonaktif'}</span>
}

function CreateStaffDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="presentation">
      <section className="w-full max-w-md rounded-lg bg-card p-6 shadow-md" role="dialog" aria-modal="true" aria-labelledby="create-staff-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-primary">Data pegawai</p>
            <h2 id="create-staff-title" className="mt-1 text-xl font-bold">Tambah Pegawai</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Tutup dialog tambah pegawai"><X className="h-5 w-5" aria-hidden="true" /></Button>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Form penambahan pegawai akan dihubungkan ke API pada tahap berikutnya. Halaman ini saat ini menggunakan data dummy.</p>
        <div className="mt-6 flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Tutup</Button></div>
      </section>
    </div>
  )
}

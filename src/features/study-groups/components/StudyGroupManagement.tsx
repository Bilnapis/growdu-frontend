import { type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, CheckCircle2, PauseCircle, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStudyGroups, useStudyGroupsSummary, useUpdateStudyGroupStatus } from '@/features/study-groups/hooks/use-study-groups'
import type { StudyGroupFilters } from '@/features/study-groups/api/study-groups-api'

const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
export function StudyGroupManagement({ filters, onFiltersChange }: { filters: StudyGroupFilters; onFiltersChange: (filters: StudyGroupFilters) => void }) {
  const navigate = useNavigate(); const groups = useStudyGroups(filters); const summary = useStudyGroupsSummary(); const status = useUpdateStudyGroupStatus()
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = new FormData(event.currentTarget); const search = formString(value.get('search')).trim(); const selected = formString(value.get('status')); onFiltersChange({ page: 1, limit: 20, ...(search ? { search } : {}), ...(selected === 'active' || selected === 'inactive' ? { status: selected } : {}) }) }
  return <div className="space-y-5 text-[var(--color-text)]">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Kelompok Belajar</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Kelola jadwal, tentor, dan siswa dalam kelompok belajar.</p></div><Button onClick={() => void navigate('/study-groups/new')}><Plus className="h-4 w-4" />Tambah Kelompok</Button></header>
    <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan kelompok belajar"><Metric icon={BookOpen} label="Total Kelompok" value={summary.data?.total} tone="blue" /><Metric icon={CheckCircle2} label="Aktif" value={summary.data?.active} tone="green" /><Metric icon={PauseCircle} label="Nonaktif" value={summary.data?.inactive} tone="gray" /><Metric icon={CalendarDays} label="Jadwal Hari Ini" value={summary.data?.schedulesToday} tone="orange" /></section>
    <section className="rounded-lg border border-border bg-card p-4"><form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input name="search" defaultValue={filters.search} className="pl-9" placeholder="Cari nama kelompok atau nama tentor" /></div><select name="status" defaultValue={filters.status ?? ''} className="h-10 rounded-md border border-border bg-white px-3 text-sm"><option value="">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><Button type="submit" variant="outline">Terapkan</Button></form>
    {groups.isPending ? <p className="p-8 text-center text-sm" role="status">Memuat kelompok belajar...</p> : null}{groups.isError ? <p className="p-8 text-center text-sm text-destructive" role="alert">Data belum dapat dimuat.</p> : null}
    {groups.data ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><caption className="sr-only">Daftar kelompok belajar</caption><thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-3">Nama Kelompok</th><th className="p-3">Mata Pelajaran</th><th className="p-3">Tentor</th><th className="p-3">Jadwal</th><th className="p-3">Siswa</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr></thead><tbody>{groups.data.data.map(group => <tr className="border-b border-border" key={group.id}><td className="p-3 font-semibold"><Link className="hover:underline" to={`/study-groups/${group.id}`}>{group.name}</Link></td><td className="p-3">{group.subjects.join(', ') || '—'}</td><td className="p-3">{[...new Set(group.schedules.map(s => s.tutorName))].join(', ')}</td><td className="p-3">{group.schedules.map(s => `${days[s.dayOfWeek - 1]} ${s.startTime}–${s.endTime}`).join(', ')}</td><td className="p-3">{group.studentCount}</td><td className="p-3"><span className={group.status === 'active' ? 'text-[var(--color-success)]' : 'text-muted-foreground'}>{group.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td><td className="p-3"><div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link to={`/study-groups/${group.id}`} aria-label={`Lihat ${group.name}`}>Lihat</Link></Button><Button asChild size="sm" variant="ghost"><Link to={`/study-groups/${group.id}/edit`} aria-label={`Ubah ${group.name}`}><Pencil className="h-4 w-4" /></Link></Button><Button size="sm" variant="ghost" disabled={status.isPending} onClick={() => { if (window.confirm(`Ubah status ${group.name}?`)) status.mutate({ id: group.id, status: group.status === 'active' ? 'inactive' : 'active' }) }}>{group.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</Button></div></td></tr>)}</tbody></table></div> : null}
    {groups.data?.data.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Belum ada kelompok belajar. Tambahkan kelompok pertama.</p> : null}
    {groups.data && groups.data.meta.totalPages > 1 ? <footer className="mt-4 flex justify-between text-sm"><span>Menampilkan halaman {groups.data.meta.page} dari {groups.data.meta.totalPages}</span><div className="space-x-2"><Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => onFiltersChange({ ...filters, page: filters.page - 1 })}>Sebelumnya</Button><Button variant="outline" size="sm" disabled={filters.page >= groups.data.meta.totalPages} onClick={() => onFiltersChange({ ...filters, page: filters.page + 1 })}>Berikutnya</Button></div></footer> : null}</section>
  </div>
}
type MetricTone = 'blue' | 'green' | 'gray' | 'orange'

const metricToneClass: Record<MetricTone, string> = {
  blue: 'bg-[#D9ECFF] text-[#1F8FE5]',
  green: 'bg-[#ECFDF3] text-[#027A48]',
  gray: 'bg-[#F8FAFC] text-[#64748B]',
  orange: 'bg-[#FFFAEB] text-[#B54708]',
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof BookOpen
  label: string
  value?: number
  tone: MetricTone
}) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-md ${metricToneClass[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold leading-[1.3] text-[#64748B]">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold leading-[1.3] text-[#0F172A]">{value ?? '—'}</p>
    </div>
  )
}
function formString(value: FormDataEntryValue | null) { return typeof value === 'string' ? value : '' }

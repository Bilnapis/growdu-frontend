import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'
import { getStoredAuthUser } from '@/lib/auth-session'
import {
  isDate,
  sessionDateLabel,
  shiftDate,
  todayInJakarta,
  useSessions,
  type SessionListItem,
} from './api'

export function SessionsPage() {
  const [params, setParams] = useSearchParams()
  const requestedFrom = params.get('from'),
    requestedTo = params.get('to')
  const from = isDate(requestedFrom) ? requestedFrom : todayInJakarta()
  const to = isDate(requestedTo) ? requestedTo : shiftDate(from, 6)
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const tutor = getStoredAuthUser()?.role === 'tutor'
  const query = useSessions({
    from,
    to,
    page,
    limit: 100,
    status: params.get('status') || undefined,
  })
  function change(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    next.delete('page')
    setParams(next)
  }
  function week(offset: number) {
    setParams({ from: shiftDate(from, offset), to: shiftDate(to, offset) })
  }
  return (
    <div
      className={'min-w-0 ' + (tutor ? 'mx-auto max-w-[600px] p-4 pb-24' : '')}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Belajar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sesi pertemuan berdasarkan tanggal.
          </p>
        </div>
        {!tutor ? (
          <Button asChild>
            <Link to="/study-groups/new">Tambah Kelompok</Link>
          </Button>
        ) : null}
      </header>
      <div className="my-5 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Dari
          <input
            className="mt-1 block rounded border bg-card p-2"
            type="date"
            value={from}
            onChange={(e) => change('from', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Sampai
          <input
            className="mt-1 block rounded border bg-card p-2"
            type="date"
            min={from}
            value={to}
            onChange={(e) => change('to', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Status
          <select
            className="mt-1 block rounded border bg-card p-2"
            value={params.get('status') || ''}
            onChange={(e) => change('status', e.target.value)}
          >
            <option value="">Semua</option>
            <option value="scheduled">Belum presensi</option>
            <option value="completed">Tersimpan</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
        >
          {view === 'list' ? 'Kalender' : 'Daftar'}
        </Button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => week(-7)}>
          Minggu sebelumnya
        </Button>
        <Button variant="outline" onClick={() => week(7)}>
          Minggu berikutnya
        </Button>
      </div>
      {query.isPending ? <p role="status">Memuat jadwal...</p> : null}
      {query.isError ? (
        <div role="alert">
          <p>Jadwal tidak dapat dimuat. Periksa rentang tanggal dan koneksi.</p>
          <Button onClick={() => void query.refetch()}>Coba lagi</Button>
        </div>
      ) : null}
      {query.data?.data.length === 0 ? (
        <p className="rounded border bg-card p-6">
          Tidak ada sesi pada rentang tanggal ini.
        </p>
      ) : null}
      {view === 'calendar' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...new Set(query.data?.data.map((s) => s.sessionDate) ?? [])].map(
            (date) => (
              <section
                key={date}
                className="space-y-3 rounded-lg border bg-muted/30 p-3"
              >
                <h2 className="font-semibold">{sessionDateLabel(date)}</h2>
                {query.data?.data
                  .filter((s) => s.sessionDate === date)
                  .map((s) => (
                    <SessionCard key={s.id} session={s} tutor={tutor} />
                  ))}
              </section>
            ),
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {query.data?.data.map((s) => (
            <SessionCard key={s.id} session={s} tutor={tutor} />
          ))}
        </div>
      )}
      {query.data ? (
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page - 1))
              setParams(next)
            }}
          >
            Sebelumnya
          </Button>
          <span className="text-sm">
            {query.data.meta.total} sesi · Halaman {page}
          </span>
          <Button
            variant="outline"
            disabled={page >= query.data.meta.totalPages}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page + 1))
              setParams(next)
            }}
          >
            Berikutnya
          </Button>
        </div>
      ) : null}
      {tutor ? <TutorBottomNavigation /> : null}
    </div>
  )
}

function SessionCard({
  session: s,
  tutor,
}: {
  session: SessionListItem
  tutor: boolean
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <p className="text-xs font-semibold text-primary">
        {sessionDateLabel(s.sessionDate)}
      </p>
      <h3 className="mt-2 font-bold">{s.studyGroupName}</h3>
      <p className="mt-1 text-sm">
        {s.startTime}–{s.endTime} WIB · {s.roomName ?? 'Ruang belum ditentukan'}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {s.tutorName} · {s.studentCount} siswa
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs">
          {s.status === 'completed'
            ? 'Presensi tersimpan'
            : s.status === 'cancelled'
              ? 'Dibatalkan'
              : 'Belum presensi'}
          {s.lockedAt ? ' · Terkunci' : ''}
        </span>
        <Button size="sm" asChild>
          <Link
            to={
              tutor
                ? `/tutor/sessions/${s.id}/record?step=attendance`
                : `/schedule/${s.id}`
            }
          >
            {tutor ? 'Buka Sesi' : 'Detail Sesi'}
          </Link>
        </Button>
      </div>
    </article>
  )
}

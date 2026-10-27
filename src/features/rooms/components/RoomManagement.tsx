import { useEffect, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  DoorOpen,
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Users,
  Wrench,
} from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RoomListItem, RoomStatus } from '@/features/rooms/api/rooms-api'
import { useRooms, useRoomsSummary } from '@/features/rooms/hooks/use-rooms'
import { ApiError } from '@/services/api-client'
import { RoomActionDialog } from './RoomActionDialog'

const PAGE_SIZE = 5

export function RoomManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [searchText, setSearchText] = useState(params.get('search') ?? '')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [action, setAction] = useState<{
    room: RoomListItem
    type: 'status'
  } | null>(null)
  const [flash] = useState(() => {
    const state = location.state as { roomFlash?: unknown } | null
    return typeof state?.roomFlash === 'string' ? state.roomFlash : null
  })
  const page = positiveInteger(params.get('page'))
  const status = parseStatus(params.get('status'))
  const search = params.get('search')?.trim() || undefined
  const rooms = useRooms({
    page,
    limit: PAGE_SIZE,
    search,
    status,
  })
  const summary = useRoomsSummary()

  useEffect(() => {
    if (!location.state) return
    void navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    })
  }, [location.pathname, location.search, location.state, navigate])

  useEffect(() => {
    if (!params.has('capacity')) return
    const next = new URLSearchParams(params)
    next.delete('capacity')
    setParams(next, { replace: true })
  }, [params, setParams])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(params)
      next.delete('capacity')
      const value = searchText.trim()
      if (value) next.set('search', value)
      else next.delete('search')
      next.delete('page')
      if (next.toString() !== params.toString())
        setParams(next, { replace: true })
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [params, searchText, setParams])

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.delete('capacity')
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  const forbidden =
    rooms.error instanceof ApiError &&
    (rooms.error.status === 401 || rooms.error.status === 403)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold leading-tight">Data Ruangan</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Kelola ruangan kelas, kapasitas belajar, dan status ketersediaan
            jadwal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <AddButton onClick={() => void navigate('/rooms/new')}>
            Tambah Ruangan
          </AddButton>
        </div>
      </header>

      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-3 text-sm text-[var(--color-success)]"
        >
          {flash}
        </p>
      ) : null}

      <section
        aria-label="Ringkasan ruangan"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          icon={<DoorOpen />}
          label="Ruangan Aktif"
          value={summary.data ? `${summary.data.activeRooms} Ruangan` : '—'}
          tone="success"
        />
        <SummaryCard
          icon={<CalendarDays />}
          label="Terpakai Hari Ini"
          value={
            summary.data ? `${summary.data.sessionsToday} Sesi Aktif` : '—'
          }
          tone="primary"
        />
        <SummaryCard
          icon={<Users />}
          label="Total Kapasitas"
          value={summary.data ? `${summary.data.totalCapacity} Siswa` : '—'}
          tone="warning"
        />
        <SummaryCard
          icon={<Wrench />}
          label="Nonaktif"
          value={summary.data ? `${summary.data.inactiveRooms} Ruangan` : '—'}
          tone="muted"
        />
      </section>

      <section
        className="rounded-xl border border-border bg-card p-4 sm:p-5"
        aria-busy={rooms.isPending}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <Label htmlFor="room-search" className="sr-only">
              Cari ruangan
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]"
                aria-hidden="true"
              />
              <Input
                id="room-search"
                type="search"
                value={searchText}
                placeholder="Cari nama ruangan atau kode"
                className="h-10 rounded-md border-[var(--color-border)] bg-[var(--color-gray-50)] pl-10 text-[13px] font-medium text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
          </div>
          <div className="relative self-stretch md:self-auto">
            <Label htmlFor="room-status" className="sr-only">
              Filter status ruangan
            </Label>
            <select
              id="room-status"
              className="h-10 w-full appearance-none rounded-md border border-[var(--color-border)] bg-white py-2 pl-3.5 pr-9 text-[13px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto"
              value={status ?? ''}
              onChange={(event) => setFilter('status', event.target.value)}
            >
              <option value="">Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <SlidersHorizontal
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
              aria-hidden="true"
            />
          </div>
        </div>

        {rooms.isPending ? (
          <RoomTableSkeleton />
        ) : rooms.isError ? (
          <ErrorState
            forbidden={forbidden}
            onRetry={() => void rooms.refetch()}
          />
        ) : rooms.data.data.length === 0 ? (
          <EmptyState filtered={Boolean(search || status)} />
        ) : (
          <>
            <div className="mt-[14px] hidden rounded-md border md:block">
              <table className="w-full table-fixed border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar ruangan bimbel</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    <th scope="col" className="w-[22%] px-[18px] font-bold">
                      Nama Ruangan
                    </th>
                    <th scope="col" className="w-[10%] px-[18px] font-bold">
                      Kode
                    </th>
                    <th scope="col" className="w-[13%] px-[18px] font-bold">
                      Kapasitas
                    </th>
                    <th scope="col" className="w-[15%] px-[18px] font-bold">
                      Kelompok Aktif
                    </th>
                    <th scope="col" className="w-[23%] px-[18px] font-bold">
                      Jadwal Hari Ini
                    </th>
                    <th scope="col" className="w-[11%] px-[18px] font-bold">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="w-[6%] px-3 font-bold text-center"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.data.data.map((room) => (
                    <tr
                      key={room.id}
                      className="h-[70px] bg-card text-foreground"
                    >
                      <th scope="row" className="px-[18px] py-3 font-bold">
                        {room.name}
                      </th>
                      <td className="px-[18px] py-3 font-medium">
                        {room.code}
                      </td>
                      <td className="px-[18px] py-3">{room.capacity} Siswa</td>
                      <td className="px-[18px] py-3">
                        {room.activeGroupCount} Kelompok
                      </td>
                      <td className="px-[18px] py-3">{todayLabel(room)}</td>
                      <td className="px-[18px] py-3">
                        <RoomStatusBadge status={room.status} />
                      </td>
                      <td className="relative px-3 py-3 text-center">
                        <button
                          type="button"
                          className="inline-grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Menu aksi ${room.name}`}
                          aria-expanded={openMenuId === room.id}
                          onClick={() =>
                            setOpenMenuId((current) =>
                              current === room.id ? null : room.id,
                            )
                          }
                        >
                          <MoreHorizontal
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                        {openMenuId === room.id ? (
                          <RoomMenu
                            room={room}
                            onClose={() => setOpenMenuId(null)}
                            onStatus={() => {
                              setOpenMenuId(null)
                              setAction({ room, type: 'status' })
                            }}
                          />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {rooms.data.data.map((room) => (
                <article
                  key={room.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">{room.name}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {room.code}
                      </p>
                    </div>
                    <RoomStatusBadge status={room.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Metric
                      label="Kapasitas"
                      value={`${room.capacity} Siswa`}
                    />
                    <Metric
                      label="Kelompok Aktif"
                      value={`${room.activeGroupCount} Kelompok`}
                    />
                    <div className="col-span-2">
                      <Metric
                        label="Jadwal Hari Ini"
                        value={todayLabel(room)}
                      />
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/rooms/${room.id}`}>
                        <Eye className="h-4 w-4" />
                        Detail
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/rooms/${room.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Ubah
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        room.status === 'active' ? 'destructive' : 'default'
                      }
                      onClick={() => setAction({ room, type: 'status' })}
                    >
                      {room.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <Pagination
              page={rooms.data.meta.page}
              total={rooms.data.meta.total}
              totalPages={rooms.data.meta.totalPages}
              onPageChange={(nextPage) => {
                const next = new URLSearchParams(params)
                next.set('page', String(nextPage))
                setParams(next)
              }}
            />
          </>
        )}
      </section>

      {action ? (
        <RoomActionDialog
          room={action.room}
          action={action.type}
          onClose={() => setAction(null)}
        />
      ) : null}
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: 'success' | 'primary' | 'warning' | 'muted'
}) {
  const toneClass = {
    success: 'bg-emerald-50 text-emerald-700',
    primary: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    muted: 'bg-slate-100 text-slate-600',
  }[tone]
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 place-items-center rounded-md [&>svg]:h-[18px] [&>svg]:w-[18px] ${toneClass}`}
        >
          {icon}
        </span>
        <h2 className="text-xs font-bold text-muted-foreground">{label}</h2>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </article>
  )
}

function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const isActive = status === 'active'

  return (
    <span
      className={
        isActive
          ? 'inline-flex rounded-full bg-[var(--color-success-bg)] px-2.5 py-[5px] text-xs font-bold leading-[1.2] text-[var(--color-success)]'
          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-[5px] text-xs font-bold leading-[1.2] text-muted-foreground'
      }
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}

function RoomMenu({
  room,
  onClose,
  onStatus,
}: {
  room: RoomListItem
  onClose: () => void
  onStatus: () => void
}) {
  return (
    <div className="absolute right-3 top-12 z-20 w-44 rounded-lg border border-border bg-card p-2 text-left shadow-lg">
      <Link
        to={`/rooms/${room.id}`}
        onClick={onClose}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        <Eye className="h-4 w-4" />
        Lihat detail
      </Link>
      <Link
        to={`/rooms/${room.id}/edit`}
        onClick={onClose}
        className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        <Pencil className="h-4 w-4" />
        Ubah data
      </Link>
      <button
        type="button"
        className={`mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted ${room.status === 'active' ? 'text-destructive' : 'text-foreground'}`}
        onClick={onStatus}
      >
        <DoorOpen className="h-4 w-4" />
        {room.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
      </button>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function todayLabel(room: RoomListItem) {
  if (!room.todaySessionCount) return 'Tidak ada sesi'
  const range =
    room.todayStartTime && room.todayEndTime
      ? ` (${room.todayStartTime} - ${room.todayEndTime})`
      : ''
  return `${room.todaySessionCount} Sesi${range}`
}

function EmptyState({ filtered }: { filtered: boolean }) {
  const navigate = useNavigate()

  return (
    <div className="grid min-h-[360px] place-items-center py-12 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-primary-text">
          <DoorOpen className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-bold">
          {filtered ? 'Ruangan tidak ditemukan' : 'Belum Ada Data Ruangan'}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          {filtered
            ? 'Ubah kata kunci atau filter untuk melihat data lain.'
            : 'Tambahkan ruangan kelas agar dapat digunakan saat membuat kelompok belajar dan mendeteksi bentrok jadwal mengajar.'}
        </p>
        {!filtered ? (
          <AddButton
            className="mt-4"
            onClick={() => void navigate('/rooms/new')}
          >
            Tambah Data
          </AddButton>
        ) : null}
      </div>
    </div>
  )
}

function ErrorState({
  forbidden,
  onRetry,
}: {
  forbidden: boolean
  onRetry: () => void
}) {
  return (
    <div className="grid min-h-[320px] place-items-center py-10 text-center">
      <div>
        <h2 className="font-bold">
          {forbidden
            ? 'Anda tidak memiliki akses ke data ruangan.'
            : 'Data ruangan belum dapat dimuat.'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {forbidden
            ? 'Hubungi owner bimbel bila akses ini diperlukan.'
            : 'Periksa koneksi lalu coba kembali.'}
        </p>
        {!forbidden ? (
          <Button className="mt-4" variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function RoomTableSkeleton() {
  return (
    <div
      className="mt-5 space-y-3"
      role="status"
      aria-label="Memuat data ruangan"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}

function Pagination({
  page,
  total,
  totalPages,
  onPageChange,
}: {
  page: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)
  return (
    <footer className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Menampilkan {start}-{end} dari {total} ruangan kelas
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </Button>
        <span className="px-3 font-semibold text-foreground">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </Button>
      </div>
    </footer>
  )
}

function positiveInteger(value: string | null) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : 1
}
function parseStatus(value: string | null): RoomStatus | undefined {
  return value === 'active' || value === 'inactive' ? value : undefined
}

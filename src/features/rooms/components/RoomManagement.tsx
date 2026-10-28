import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarDays,
  DoorOpen,
  Eye,
  MoreHorizontal,
  Pencil,
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
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import { TablePagination } from '@/components/ui/table-pagination'
import { Label } from '@/components/ui/label'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import type { RoomListItem, RoomStatus } from '@/features/rooms/api/rooms-api'
import { useRooms, useRoomsSummary } from '@/features/rooms/hooks/use-rooms'
import { ApiError } from '@/services/api-client'
import { RoomActionDialog } from './RoomActionDialog'

const PAGE_SIZE = 5

export function RoomManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
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

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.delete('capacity')
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next, { replace: key === 'search' })
  }

  const forbidden =
    rooms.error instanceof ApiError &&
    (rooms.error.status === 401 || rooms.error.status === 403)

  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]">
            Data Ruangan
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
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

      <SummaryCardGrid label="Ringkasan ruangan" isLoading={summary.isPending}>
        <SummaryCard
          icon={DoorOpen}
          label="Ruangan Aktif"
          value={summary.data ? `${summary.data.activeRooms}` : '—'}
          tone="success"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Sesi Aktif Hari Ini"
          value={summary.data ? `${summary.data.sessionsToday}` : '—'}
          tone="primary"
        />
        <SummaryCard
          icon={Users}
          label="Total Kapasitas Siswa"
          value={summary.data ? `${summary.data.totalCapacity}` : '—'}
          tone="warning"
        />
        <SummaryCard
          icon={Wrench}
          label="Ruangan Nonaktif"
          value={summary.data ? `${summary.data.inactiveRooms}` : '—'}
          tone="muted"
        />
      </SummaryCardGrid>

      <section
        className="mt-5 min-h-[560px] rounded-lg border bg-card p-4 text-card-foreground shadow-none sm:p-[18px]"
        aria-busy={rooms.isPending}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <Label htmlFor="room-search" className="sr-only">
              Cari ruangan
            </Label>
            <DebouncedSearchInput
              id="room-search"
              value={search}
              placeholder="Cari nama ruangan atau kode"
              onSearch={(value) => setFilter('search', value)}
            />
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

        {rooms.isError ? (
          <ErrorState
            forbidden={forbidden}
            onRetry={() => void rooms.refetch()}
          />
        ) : !rooms.isPending && rooms.data.data.length === 0 ? (
          <EmptyState filtered={Boolean(search || status)} />
        ) : (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel ruangan, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar ruangan bimbel</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    <th scope="col" className="px-[18px] font-bold">
                      Nama Ruangan
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Kode
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Kapasitas
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Kelompok Aktif
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Jadwal Hari Ini
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Status
                    </th>
                    <th scope="col" className="px-3 font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={rooms.isPending}
                >
                  {rooms.isPending ? (
                    <TableSkeletonRows
                      columns={7}
                      rows={PAGE_SIZE}
                      label="Memuat data ruangan..."
                    />
                  ) : null}
                  {rooms.data?.data.map((room) => (
                    <tr
                      key={room.id}
                      className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                    >
                      <th
                        scope="row"
                        className="min-w-[135px] px-[18px] py-3 font-bold"
                      >
                        {room.name}
                      </th>
                      <td className="min-w-[100px] px-[18px] py-3 font-medium">
                        {room.code}
                      </td>
                      <td className="min-w-[100px] px-[18px] py-3 font-medium">
                        {room.capacity} Siswa
                      </td>
                      <td className="min-w-[120px] px-[18px] py-3 font-semibold">
                        {room.activeGroupCount} Kelompok
                      </td>
                      <td className="min-w-[180px] px-[18px] py-3 font-medium">
                        {todayLabel(room)}
                      </td>
                      <td className="px-[18px] py-3">
                        <RoomStatusBadge status={room.status} />
                      </td>
                      <td className="relative px-3 py-3">
                        <RoomActions
                          room={room}
                          onStatus={() => setAction({ room, type: 'status' })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rooms.data && rooms.data.data.length > 0 ? (
              <TablePagination
                meta={rooms.data.meta}
                itemLabel="ruangan"
                ariaLabel="Halaman ruangan"
                onPageChange={(nextPage) => {
                  const next = new URLSearchParams(params)
                  next.set('page', String(nextPage))
                  setParams(next)
                }}
              />
            ) : null}
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

function RoomActions({
  room,
  onStatus,
}: {
  room: RoomListItem
  onStatus: () => void
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  useEffect(() => {
    if (!position) return
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    function close() {
      setPosition(null)
    }
    function onPointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      )
        close()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [position])

  function closeMenu() {
    setPosition(null)
    triggerRef.current?.focus()
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label={`Menu aksi ${room.name}`}
        aria-expanded={Boolean(position)}
        aria-controls={position ? `room-actions-${room.id}` : undefined}
        onClick={() => {
          const rect = triggerRef.current?.getBoundingClientRect()
          if (!rect) return
          setPosition((current) =>
            current
              ? null
              : {
                  left: Math.max(
                    8,
                    Math.min(rect.right - 176, window.innerWidth - 184),
                  ),
                  top: Math.max(
                    8,
                    rect.bottom + 152 > window.innerHeight
                      ? rect.top - 144
                      : rect.bottom + 8,
                  ),
                },
          )
        }}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </Button>
      {position
        ? createPortal(
            <div
              ref={menuRef}
              id={`room-actions-${room.id}`}
              role="group"
              aria-label={`Aksi ${room.name}`}
              style={position}
              className="fixed z-30 max-h-[calc(100vh-16px)] w-44 overflow-y-auto rounded-lg border border-border bg-card p-2 text-left shadow-lg"
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget) &&
                  !triggerRef.current?.contains(event.relatedTarget)
                )
                  setPosition(null)
              }}
            >
              <Link
                to={`/rooms/${room.id}`}
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Eye className="h-4 w-4" />
                Lihat detail
              </Link>
              <Link
                to={`/rooms/${room.id}/edit`}
                onClick={closeMenu}
                className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="h-4 w-4" />
                Ubah data
              </Link>
              <button
                type="button"
                className={`mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${room.status === 'active' ? 'text-destructive' : 'text-foreground'}`}
                onClick={() => {
                  closeMenu()
                  onStatus()
                }}
              >
                <DoorOpen className="h-4 w-4" />
                {room.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
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

function positiveInteger(value: string | null) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : 1
}
function parseStatus(value: string | null): RoomStatus | undefined {
  return value === 'active' || value === 'inactive' ? value : undefined
}

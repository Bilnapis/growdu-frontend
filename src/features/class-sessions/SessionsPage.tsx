import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PauseCircle,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import { TablePagination } from '@/components/ui/table-pagination'
import { TutorPageHeader } from '@/components/TutorPageHeader'
import { getStoredAuthUser } from '@/lib/auth-session'
import {
  isDate,
  sessionDateLabel,
  shiftDate,
  todayInJakarta,
  useSessions,
  type SessionListItem,
} from './api'
import './sessions-calendar.css'

const PAGE_SIZE = 5
const tableCellClass = 'px-[18px] py-3'

export function SessionsPage() {
  const [params, setParams] = useSearchParams()
  const requestedFrom = params.get('from')
  const from = mondayOfWeek(
    isDate(requestedFrom) ? requestedFrom : todayInJakarta(),
  )
  const to = shiftDate(from, 6)
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const tutor = getStoredAuthUser()?.role === 'tutor'
  const calendarView = view === 'calendar'
  const query = useSessions({
    from,
    to,
    page: calendarView ? 1 : page,
    limit: calendarView ? 100 : PAGE_SIZE,
    status: calendarView ? undefined : params.get('status') || undefined,
    attendanceStatus: calendarView
      ? undefined
      : params.get('attendanceStatus') || undefined,
    search: calendarView ? undefined : params.get('search') || undefined,
  })
  const summaryQuery = useSessions({ from, to, page: 1, limit: 100 })

  function change(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  function week(offset: number) {
    const next = new URLSearchParams(params)
    next.set('from', shiftDate(from, offset))
    next.set('to', shiftDate(to, offset))
    next.delete('page')
    setParams(next)
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('search')
    change('search', typeof value === 'string' ? value.trim() : '')
  }

  const summary = summaryQuery.data?.data
  const completed = summary?.filter(
    (session) => session.attendanceStatus === 'saved',
  ).length
  const pending = summary?.filter(
    (session) =>
      session.status !== 'cancelled' && session.attendanceStatus === 'pending',
  ).length
  const todayCount = summary?.filter(
    (session) => session.sessionDate === todayInJakarta(),
  ).length

  return (
    <div
      className={
        'min-w-0 space-y-5 text-[var(--color-text)] ' +
        (tutor ? 'mx-auto max-w-[600px] pb-6' : '')
      }
    >
      {tutor ? <TutorPageHeader title="Jadwal Belajar" /> : null}
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          {!tutor ? (
            <h1 className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]">
              Jadwal Belajar
            </h1>
          ) : null}
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            {calendarView
              ? 'Tinjauan alokasi ruangan per jam dengan toolbar filter di sisi kanan.'
              : 'Kelola sesi pertemuan, penugasan tentor, dan alokasi ruangan.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="flex rounded-md bg-[var(--color-bg-alt)] p-[3px]"
            aria-label="Pilihan tampilan jadwal"
          >
            <button
              type="button"
              className={viewButtonClass(view === 'list')}
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button
              type="button"
              className={viewButtonClass(view === 'calendar')}
              aria-pressed={view === 'calendar'}
              onClick={() => setView('calendar')}
            >
              Kalender
            </button>
          </div>
          <div className="flex  items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-1.5">
            <WeekButton label="Minggu sebelumnya" onClick={() => week(-7)}>
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </WeekButton>
            <span className="whitespace-nowrap px-1 text-xs font-semibold">
              {weekRangeLabel(from, to)}
            </span>
            <WeekButton label="Minggu berikutnya" onClick={() => week(7)}>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </WeekButton>
          </div>
        </div>
      </header>

      <SummaryCardGrid
        label="Ringkasan jadwal"
        isLoading={summaryQuery.isPending}
      >
        <SummaryCard
          icon={BookOpen}
          label="Total Sesi Jadwal"
          value={summaryQuery.data?.meta.total}
          tone="primary"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Sesi Terisi Presensi"
          value={completed}
          tone="success"
        />
        <SummaryCard
          icon={PauseCircle}
          label="Belum Presensi"
          value={pending}
          tone="muted"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Jadwal Hari Ini"
          value={todayCount}
          tone="warning"
        />
      </SummaryCardGrid>

      <section
        className={
          calendarView
            ? ''
            : 'mt-5 min-h-[560px] rounded-lg border border-border bg-card p-4 shadow-none sm:p-[18px]'
        }
        aria-busy={query.isPending}
      >
        {!calendarView ? (
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={search}>
            <div className="min-w-0 flex-1">
              <label htmlFor="session-search" className="sr-only">
                Cari nama kelompok atau tentor
              </label>
              <DebouncedSearchInput
                id="session-search"
                name="search"
                value={params.get('search') ?? ''}
                placeholder="Cari nama kelompok atau tentor"
                onSearch={(value) => change('search', value)}
              />
            </div>
            <FilterSelect
              id="session-status"
              label="Filter status sesi"
              value={params.get('status') || ''}
              onChange={(value) => change('status', value)}
              options={[
                ['', 'Status'],
                ['scheduled', 'Terjadwal'],
                ['completed', 'Selesai'],
                ['cancelled', 'Dibatalkan'],
              ]}
            />
            <FilterSelect
              id="attendance-status"
              label="Filter status presensi"
              value={params.get('attendanceStatus') || ''}
              onChange={(value) => change('attendanceStatus', value)}
              options={[
                ['', 'Presensi'],
                ['saved', 'Tersimpan'],
                ['pending', 'Belum'],
              ]}
            />
            <Button type="submit" variant="outline" className="md:hidden">
              Terapkan
            </Button>
          </form>
        ) : null}

        {calendarView && query.isPending ? (
          <div className="mt-4">
            <SessionTableSkeleton />
          </div>
        ) : null}
        {query.isError ? (
          <div
            className="grid min-h-64 place-items-center py-10 text-center"
            role="alert"
          >
            <div>
              <h2 className="font-bold">Jadwal tidak dapat dimuat</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Periksa rentang tanggal dan koneksi, lalu coba kembali.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => void query.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          </div>
        ) : null}
        {!calendarView && query.data?.data.length === 0 ? <EmptyState /> : null}
        {calendarView && query.data ? (
          <CalendarView sessions={query.data.data} tutor={tutor} from={from} />
        ) : null}
        {!calendarView && (query.isPending || query.data?.data.length) ? (
          <ListView
            sessions={query.data?.data ?? []}
            tutor={tutor}
            pending={query.isPending}
          />
        ) : null}
        {!calendarView && query.data && query.data.data.length > 0 ? (
          <TablePagination
            meta={query.data.meta}
            itemLabel="sesi"
            ariaLabel="Halaman sesi"
            onPageChange={(nextPage) => change('page', String(nextPage))}
          />
        ) : null}
      </section>
    </div>
  )
}

function ListView({
  sessions,
  tutor,
  pending,
}: {
  sessions: SessionListItem[]
  tutor: boolean
  pending: boolean
}) {
  return (
    <>
      <div
        className={`mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring ${tutor ? 'hidden md:block' : ''}`}
        role="region"
        aria-label="Tabel sesi jadwal belajar, geser untuk melihat semua kolom"
        tabIndex={0}
      >
        <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
          <caption className="sr-only">Daftar sesi jadwal belajar</caption>
          <thead className="bg-slate-50 text-muted-foreground">
            <tr className="h-11">
              <TableHeading>Hari &amp; Jam</TableHeading>
              <TableHeading>Nama Kelompok</TableHeading>
              <TableHeading>Mata Pelajaran</TableHeading>
              <TableHeading>Tentor</TableHeading>
              <TableHeading>Ruangan</TableHeading>
              <TableHeading>Siswa</TableHeading>
              <TableHeading>Presensi</TableHeading>
              <TableHeading className="px-3">Aksi</TableHeading>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100" aria-busy={pending}>
            {pending ? (
              <TableSkeletonRows
                columns={8}
                rows={PAGE_SIZE}
                label="Memuat jadwal..."
              />
            ) : null}
            {sessions.map((session) => (
              <tr
                key={session.id}
                className="h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
              >
                <td className={`${tableCellClass} font-bold`}>
                  {compactDateLabel(session)}
                </td>
                <th scope="row" className={`${tableCellClass} font-bold`}>
                  {session.studyGroupName}
                </th>
                <td className={`${tableCellClass} font-medium`}>
                  {session.subject ?? '—'}
                </td>
                <td className={`${tableCellClass} font-semibold`}>
                  {session.tutorName}
                </td>
                <td className={`${tableCellClass} font-medium`}>
                  {session.roomCode ?? session.roomName ?? '—'}
                </td>
                <td className={`${tableCellClass} font-semibold`}>
                  {session.studentCount}
                </td>
                <td className={tableCellClass}>
                  <AttendanceBadge session={session} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={sessionLink(session.id, tutor)}
                    className="inline-grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Buka sesi ${session.studyGroupName}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tutor ? (
        <div className="mt-4 grid gap-3 md:hidden">
          {pending ? <SessionTableSkeleton /> : null}
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} tutor={tutor} />
          ))}
        </div>
      ) : null}
    </>
  )
}

function CalendarView({
  sessions,
  tutor,
  from,
}: {
  sessions: SessionListItem[]
  tutor: boolean
  from: string
}) {
  const [groupId, setGroupId] = useState('')
  const [tutorId, setTutorId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [status, setStatus] = useState('')
  const scrollIndicatorTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => clearTimeout(scrollIndicatorTimeout.current)
  }, [])

  function showScrollIndicator(element: HTMLDivElement) {
    clearTimeout(scrollIndicatorTimeout.current)
    element.dataset.scrolling = 'true'
    scrollIndicatorTimeout.current = setTimeout(() => {
      delete element.dataset.scrolling
    }, 1000)
  }

  const days = Array.from({ length: 7 }, (_, index) => shiftDate(from, index))
  const filteredSessions = sessions.filter(
    (session) =>
      (!groupId || session.studyGroupId === groupId) &&
      (!tutorId || session.tutorId === tutorId) &&
      (!roomId || session.roomId === roomId) &&
      (!status || session.status === status),
  )

  return (
    <div className="mt-4">
      <div
        className="mb-3 flex flex-wrap justify-end gap-2.5"
        aria-label="Filter kalender"
      >
        <CalendarFilterSelect
          label="Kelompok"
          value={groupId}
          onChange={setGroupId}
          options={uniqueSessionOptions(
            sessions,
            (session) => session.studyGroupId,
            (session) => session.studyGroupName,
          )}
        />
        <CalendarFilterSelect
          label="Tentor"
          value={tutorId}
          onChange={setTutorId}
          options={uniqueSessionOptions(
            sessions,
            (session) => session.tutorId,
            (session) => session.tutorName,
          )}
        />
        <CalendarFilterSelect
          label="Ruangan"
          value={roomId}
          onChange={setRoomId}
          options={uniqueSessionOptions(
            sessions,
            (session) => session.roomId,
            (session) => session.roomName ?? session.roomCode ?? 'Tanpa ruang',
          )}
        />
        <CalendarFilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            ['scheduled', 'Terjadwal'],
            ['completed', 'Selesai'],
            ['cancelled', 'Dibatalkan'],
          ]}
        />
      </div>
      <div className="rounded-lg border border-border bg-card p-3.5">
        <div
          className="sessions-calendar-scroll isolate max-h-[70dvh] overflow-auto rounded-md focus-visible:ring-2 focus-visible:ring-ring"
          role="region"
          aria-label="Kalender jadwal mingguan"
          tabIndex={0}
          onScroll={(event) => showScrollIndicator(event.currentTarget)}
          onPointerEnter={(event) => showScrollIndicator(event.currentTarget)}
        >
          <div
            className="grid min-w-[1500px] gap-2"
            style={{
              gridTemplateColumns: `76px repeat(${days.length}, minmax(154px, 1fr))`,
            }}
          >
            <TimeColumn />
            {days.map((date) => (
              <CalendarDayColumn
                key={date}
                date={date}
                sessions={filteredSessions.filter(
                  (session) => session.sessionDate === date,
                )}
                tutor={tutor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimeColumn() {
  return (
    <div className="sticky left-0 z-40 bg-card">
      <div className="sticky top-0 z-50 grid h-12 place-items-center bg-card pb-1.5 text-xs font-extrabold text-muted-foreground">
        Jam
      </div>
      <div className="grid gap-1.5">
        {CALENDAR_TIMES.map((time) => (
          <div
            key={time}
            className="grid h-24 place-items-center rounded-md border border-border bg-[var(--color-gray-50)] text-[10px] font-extrabold"
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarDayColumn({
  date,
  sessions,
  tutor,
}: {
  date: string
  sessions: SessionListItem[]
  tutor: boolean
}) {
  const today = date === todayInJakarta()
  const events = layoutCalendarEvents(sessions)
  return (
    <section aria-label={sessionDateLabel(date)}>
      <div className="sticky top-0 z-30 bg-card pb-1.5">
        <header
          className={
            today
              ? 'flex h-[42px] flex-col items-center justify-center rounded-md bg-[var(--color-primary-soft)]'
              : 'flex h-[42px] flex-col items-center justify-center rounded-md bg-[var(--color-gray-50)]'
          }
        >
          <h3
            className={
              today
                ? 'text-xs font-extrabold text-primary-text'
                : 'text-xs font-extrabold'
            }
          >
            {calendarDayName(date)}
          </h3>
          <p className="text-[10px] font-semibold text-muted-foreground">
            {calendarDayDate(date)}
          </p>
        </header>
      </div>
      <div className="relative h-[1218px]">
        <div className="grid gap-1.5">
          {CALENDAR_TIMES.map((time) => (
            <div
              key={time}
              className="grid h-24 place-items-center rounded-md border border-border bg-card text-[10px] text-muted-foreground"
              aria-hidden="true"
            >
              -
            </div>
          ))}
        </div>
        {events.map((event) => {
          const laneWidth = 100 / event.laneCount
          const style = {
            top: event.startSlot * 102 + 3,
            height: Math.max(42, event.slotCount * 102 - 12),
            left: `calc(${event.lane * laneWidth}% + 4px)`,
            width: `calc(${laneWidth}% - 8px)`,
          }
          if (event.kind === 'overflow') {
            return (
              <div
                key={event.id}
                className="absolute z-20 grid place-items-center overflow-hidden rounded-md border border-border bg-[var(--color-gray-50)] px-1 text-center text-[9px] font-extrabold leading-[1.1] text-primary-text"
                style={style}
                aria-label={`${event.count} jadwal lain pada waktu yang sama`}
              >
                +{event.count}
                <br />
                jadwal
              </div>
            )
          }
          const { session } = event
          return (
            <Link
              key={session.id}
              to={sessionLink(session.id, tutor)}
              className={`absolute z-10 overflow-hidden rounded-md border px-2 py-1.5 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring ${calendarEventTone(session)}`}
              style={style}
              aria-label={`${session.studyGroupName}, ${session.startTime} sampai ${session.endTime}`}
            >
              <strong
                className={`block font-extrabold leading-[1.15] ${event.laneCount > 1 ? 'text-[9px]' : 'text-[11px]'}`}
              >
                {session.studyGroupName}
              </strong>
              <span className="mt-1 block text-[9px] font-semibold leading-tight text-muted-foreground">
                {session.roomCode ?? session.roomName ?? 'Tanpa ruang'} ·{' '}
                {session.tutorName}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function CalendarFilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: [string, string][]
}) {
  const id = `calendar-filter-${label.toLocaleLowerCase('id-ID')}`
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        Filter {label}
      </label>
      <Select
        id={id}
        className="h-9 min-w-32 text-[13px] font-semibold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{label}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </Select>
    </div>
  )
}

function SessionCard({
  session,
  tutor,
}: {
  session: SessionListItem
  tutor: boolean
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary-text">
            {sessionDateLabel(session.sessionDate)}
          </p>
          <h3 className="mt-2 font-bold">{session.studyGroupName}</h3>
        </div>
        <AttendanceBadge session={session} />
      </div>
      <p className="mt-2 text-sm">
        {session.startTime}–{session.endTime} WIB ·{' '}
        {session.roomName ?? 'Ruang belum ditentukan'}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {session.subject ?? 'Mata pelajaran belum ditentukan'} ·{' '}
        {session.tutorName} · {session.studentCount} siswa
      </p>
      <Button size="sm" asChild className="mt-4 w-full">
        <Link to={sessionLink(session.id, tutor)}>
          {tutor ? 'Buka Sesi' : 'Detail Sesi'}
        </Link>
      </Button>
    </article>
  )
}

function AttendanceBadge({ session }: { session: SessionListItem }) {
  if (session.status === 'cancelled') {
    return (
      <span className="inline-flex rounded-md bg-[var(--color-danger-bg)] px-2 py-1 text-[11px] font-bold text-destructive">
        Dibatalkan
      </span>
    )
  }
  const saved = session.attendanceStatus === 'saved'
  return (
    <span
      className={
        saved
          ? 'inline-flex rounded-md bg-[var(--color-success-bg)] px-2 py-1 text-[11px] font-bold text-[var(--color-success)]'
          : 'inline-flex rounded-md bg-[var(--color-gray-50)] px-2 py-1 text-[11px] font-bold text-[var(--color-muted)]'
      }
    >
      {saved ? 'Tersimpan' : 'Belum'}
    </span>
  )
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: [string, string][]
}) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <Select
        id={id}
        className="h-10 min-w-32 text-[13px] font-semibold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </Select>
    </>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center py-10 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-primary-soft)] text-primary-text">
          <CalendarDays className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-bold">Jadwal tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ubah minggu, kata kunci, atau filter untuk melihat sesi lain.
        </p>
      </div>
    </div>
  )
}

function TableHeading({
  children,
  className = 'px-[18px]',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th scope="col" className={`${className} font-bold`}>
      {children}
    </th>
  )
}

function WeekButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function SessionTableSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat jadwal">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div
          key={index}
          className="h-[58px] animate-pulse rounded-md bg-muted"
        />
      ))}
    </div>
  )
}

const CALENDAR_TIMES = [
  '13:00-13:30',
  '13:30-14:00',
  '14:00-14:30',
  '14:30-15:00',
  '15:00-15:30',
  '15:30-16:00',
  '16:00-16:30',
  '16:30-17:00',
  '17:00-17:30',
  '17:30-18:00',
  '18:00-18:30',
  '18:30-19:00',
] as const

const CALENDAR_START_MINUTES = 13 * 60
const CALENDAR_END_MINUTES = 19 * 60

type CalendarEventPosition = {
  lane: number
  laneCount: number
  startSlot: number
  slotCount: number
}

type CalendarEventLayout = CalendarEventPosition & {
  kind: 'session'
  session: SessionListItem
}

type CalendarOverflowLayout = CalendarEventPosition & {
  kind: 'overflow'
  id: string
  count: number
}

function layoutCalendarEvents(
  sessions: SessionListItem[],
): (CalendarEventLayout | CalendarOverflowLayout)[] {
  const timed = sessions
    .map((session) => ({
      session,
      start: Math.max(CALENDAR_START_MINUTES, timeInMinutes(session.startTime)),
      end: Math.min(CALENDAR_END_MINUTES, timeInMinutes(session.endTime)),
    }))
    .filter(({ start, end }) => end > start)
    .sort(
      (first, second) => first.start - second.start || first.end - second.end,
    )

  const groups: (typeof timed)[] = []
  let currentGroup: typeof timed = []
  let groupEnd = -1
  for (const event of timed) {
    if (currentGroup.length && event.start >= groupEnd) {
      groups.push(currentGroup)
      currentGroup = []
      groupEnd = -1
    }
    currentGroup.push(event)
    groupEnd = Math.max(groupEnd, event.end)
  }
  if (currentGroup.length) groups.push(currentGroup)

  return groups.flatMap((group, groupIndex) => {
    const laneEnds: number[] = []
    const placements = group.map((event) => {
      let lane = laneEnds.findIndex((end) => end <= event.start)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = event.end
      return { ...event, lane }
    })
    if (laneEnds.length < 3) {
      return placements.map(
        ({ session, start, end, lane }): CalendarEventLayout => ({
          kind: 'session',
          session,
          lane,
          laneCount: laneEnds.length,
          startSlot: (start - CALENDAR_START_MINUTES) / 30,
          slotCount: (end - start) / 30,
        }),
      )
    }

    const visible = placements
      .filter(({ lane }) => lane < 2)
      .map(({ session, start, end, lane }): CalendarEventLayout => ({
        kind: 'session',
        session,
        lane,
        laneCount: 3,
        startSlot: (start - CALENDAR_START_MINUTES) / 30,
        slotCount: (end - start) / 30,
      }))
    const hidden = placements.filter(({ lane }) => lane >= 2)
    const firstHidden = hidden[0]
    if (!firstHidden) return visible
    const overflow: CalendarOverflowLayout = {
      kind: 'overflow',
      id: `overflow-${groupIndex}-${firstHidden.start}`,
      count: hidden.length,
      lane: 2,
      laneCount: 3,
      startSlot: (firstHidden.start - CALENDAR_START_MINUTES) / 30,
      slotCount: Math.min(1, (firstHidden.end - firstHidden.start) / 30),
    }
    return [...visible, overflow]
  })
}

function uniqueSessionOptions(
  sessions: SessionListItem[],
  value: (session: SessionListItem) => string | null,
  label: (session: SessionListItem) => string,
): [string, string][] {
  const options = new Map<string, string>()
  for (const session of sessions) {
    const optionValue = value(session)
    if (optionValue) options.set(optionValue, label(session))
  }
  return [...options.entries()].sort((first, second) =>
    first[1].localeCompare(second[1], 'id-ID'),
  )
}

function calendarEventTone(session: SessionListItem) {
  if (session.status === 'cancelled')
    return 'border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
  if (session.attendanceStatus === 'saved')
    return 'border-[var(--color-success)] bg-[var(--color-success-bg)]'
  const tones = [
    'border-primary bg-[var(--color-primary-soft)]',
    'border-[var(--color-warning)] bg-[var(--color-warning-bg)]',
    'border-[var(--color-info-text)] bg-[var(--color-info-bg)]',
  ]
  const hash = [...session.id].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )
  return tones[hash % tones.length]
}

function timeInMinutes(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

function calendarDayName(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${date}T00:00:00+07:00`))
}

function calendarDayDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${date}T00:00:00+07:00`))
}

function compactDateLabel(session: SessionListItem) {
  const day = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${session.sessionDate}T00:00:00+07:00`))
  return `${day} ${session.startTime} - ${session.endTime}`
}

function mondayOfWeek(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay()
  return shiftDate(date, -((day + 6) % 7))
}

function weekRangeLabel(from: string, to: string) {
  const start = new Date(`${from}T00:00:00+07:00`)
  const end = new Date(`${to}T00:00:00+07:00`)
  const startDay = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(start)
  const endLabel = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(end)
  return `${startDay} - ${endLabel}`
}

function sessionLink(id: string, tutor: boolean) {
  return tutor
    ? `/tutor/sessions/${id}/record?step=attendance`
    : `/schedule/${id}`
}

function viewButtonClass(active: boolean) {
  return active
    ? 'rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm focus-visible:ring-2 focus-visible:ring-ring'
    : 'rounded-md px-4 py-2 text-[13px] font-semibold hover:bg-white focus-visible:ring-2 focus-visible:ring-ring'
}

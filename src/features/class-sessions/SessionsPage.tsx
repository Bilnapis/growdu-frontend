import { type FormEvent, type ReactNode, useState } from 'react'
import {
  type LucideIcon,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PauseCircle,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { Input } from '@/components/ui/input'
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

const PAGE_SIZE = 6
const tableCellClass = 'px-[18px] py-3'

export function SessionsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const requestedFrom = params.get('from')
  const from = mondayOfWeek(
    isDate(requestedFrom) ? requestedFrom : todayInJakarta(),
  )
  const to = shiftDate(from, 6)
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [searchText, setSearchText] = useState(params.get('search') ?? '')
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
    change('search', searchText.trim())
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
        (tutor ? 'mx-auto max-w-[600px] pb-20' : '')
      }
    >
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-[1.3]">Jadwal Belajar</h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
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
              List View
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
          <div className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-1.5">
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
          {!tutor && !calendarView ? (
            <AddButton onClick={() => void navigate('/study-groups/new')}>
              Tambah Jadwal
            </AddButton>
          ) : null}
        </div>
      </header>

      <section
        className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Ringkasan jadwal"
        aria-busy={summaryQuery.isPending}
      >
        <SummaryCard
          icon={BookOpen}
          label="Total Sesi Jadwal"
          value={summaryQuery.data?.meta.total}
          tone="blue"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Sesi Terisi Presensi"
          value={completed}
          tone="green"
        />
        <SummaryCard
          icon={PauseCircle}
          label="Belum Presensi"
          value={pending}
          tone="gray"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Jadwal Hari Ini"
          value={todayCount}
          tone="orange"
        />
      </section>

      <section
        className={
          calendarView
            ? ''
            : 'rounded-lg border border-border bg-card p-4 sm:p-[18px]'
        }
        aria-busy={query.isPending}
      >
        {!calendarView ? (
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={search}>
            <div className="relative min-w-0 flex-1">
              <label htmlFor="session-search" className="sr-only">
                Cari nama kelompok atau tentor
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]"
                aria-hidden="true"
              />
              <Input
                id="session-search"
                type="search"
                value={searchText}
                className="h-10 bg-[var(--color-gray-50)] pl-10 text-[13px] font-medium"
                placeholder="Cari nama kelompok atau tentor"
                onChange={(event) => setSearchText(event.target.value)}
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

        {query.isPending ? <SessionTableSkeleton /> : null}
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
        {query.data ? (
          calendarView ? (
            <CalendarView
              sessions={query.data.data}
              tutor={tutor}
              from={from}
            />
          ) : query.data.data.length ? (
            <ListView sessions={query.data.data} tutor={tutor} />
          ) : null
        ) : null}
        {!calendarView && query.data && query.data.data.length > 0 ? (
          <Pagination
            page={page}
            total={query.data.meta.total}
            totalPages={query.data.meta.totalPages}
            onPageChange={(nextPage) => change('page', String(nextPage))}
          />
        ) : null}
      </section>
      {tutor ? <TutorBottomNavigation /> : null}
    </div>
  )
}

function ListView({
  sessions,
  tutor,
}: {
  sessions: SessionListItem[]
  tutor: boolean
}) {
  return (
    <>
      <div
        className="mt-[14px] hidden overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring md:block"
        role="region"
        aria-label="Tabel sesi jadwal belajar, geser untuk melihat semua kolom"
        tabIndex={0}
      >
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-[13px]">
          <caption className="sr-only">Daftar sesi jadwal belajar</caption>
          <thead className="bg-slate-50 text-muted-foreground">
            <tr className="h-11">
              <TableHeading className="w-[17%] rounded-l-md">
                Hari &amp; Jam
              </TableHeading>
              <TableHeading className="w-[19%]">Nama Kelompok</TableHeading>
              <TableHeading className="w-[13%]">Mata Pelajaran</TableHeading>
              <TableHeading className="w-[15%]">Tentor</TableHeading>
              <TableHeading className="w-[10%]">Ruangan</TableHeading>
              <TableHeading className="w-[7%]">Siswa</TableHeading>
              <TableHeading className="w-[12%]">Presensi</TableHeading>
              <TableHeading className="w-[7%] rounded-r-md text-center">
                Aksi
              </TableHeading>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <tr
                key={session.id}
                className="h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
              >
                <td className={`${tableCellClass} font-bold`}>{compactDateLabel(session)}</td>
                <th scope="row" className={`${tableCellClass} font-bold`}>
                  {session.studyGroupName}
                </th>
                <td className={`${tableCellClass} font-medium`}>{session.subject ?? '—'}</td>
                <td className={`${tableCellClass} font-semibold`}>{session.tutorName}</td>
                <td className={`${tableCellClass} font-medium`}>
                  {session.roomCode ?? session.roomName ?? '—'}
                </td>
                <td className={`${tableCellClass} font-semibold`}>{session.studentCount}</td>
                <td className={tableCellClass}>
                  <AttendanceBadge session={session} />
                </td>
                <td className="px-3 py-3 text-center">
                  <Link
                    to={sessionLink(session.id, tutor)}
                    className="inline-grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Buka sesi ${session.studyGroupName}`}
                  >
                    <MoreHorizontal
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 md:hidden">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} tutor={tutor} />
        ))}
      </div>
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
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-3.5">
        <div
          className="grid min-w-[1050px] gap-2"
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
  )
}

function TimeColumn() {
  return (
    <div>
      <div className="grid h-[42px] place-items-center text-xs font-extrabold text-muted-foreground">
        Jam
      </div>
      <div className="mt-1.5 grid gap-1.5">
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
              ? 'text-xs font-extrabold text-primary'
              : 'text-xs font-extrabold'
          }
        >
          {calendarDayName(date)}
        </h3>
        <p className="text-[10px] font-semibold text-muted-foreground">
          {calendarDayDate(date)}
        </p>
      </header>
      <div className="relative mt-1.5 h-[1218px]">
        <div className="grid gap-1.5">
          {CALENDAR_TIMES.map((time, index) => (
            <div
              key={time}
              className="grid h-24 place-items-center rounded-md border border-border bg-card text-[10px] text-muted-foreground"
              aria-hidden="true"
            >
              {index % 2 === 1 ? '—' : null}
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
                className="absolute z-20 grid place-items-center overflow-hidden rounded-md border border-border bg-[var(--color-gray-50)] px-1 text-center text-[9px] font-extrabold leading-[1.1] text-primary"
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
              <strong className="block text-[11px] font-extrabold leading-[1.15]">
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
  const Icon = label === 'Status' ? SlidersHorizontal : ChevronDown
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        Filter {label}
      </label>
      <select
        id={id}
        className="h-9 appearance-none rounded-md border border-border bg-white py-2 pl-3.5 pr-9 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{label}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <Icon
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
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
          <p className="text-xs font-semibold text-primary">
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  label: string
  value?: number
  tone: 'blue' | 'green' | 'gray' | 'orange'
}) {
  const toneClass = {
    blue: 'bg-[#D9ECFF] text-[#1F8FE5]',
    green: 'bg-[#ECFDF3] text-[#027A48]',
    gray: 'bg-[#F8FAFC] text-[#64748B]',
    orange: 'bg-[#FFFAEB] text-[#B54708]',
  }[tone]
  return (
    <article className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-7 w-7 place-items-center rounded-md ${toneClass}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-xs font-semibold leading-[1.3] text-[#64748B]">
          {label}
        </h2>
      </div>
      <p className="mt-2 text-2xl font-bold leading-[1.3] text-[#0F172A]">
        {value ?? '—'}
      </p>
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
    <footer className="mt-4 flex flex-col gap-3 border-t border-border px-1 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Menampilkan {start}-{end} dari {total} sesi jadwal aktif
      </p>
      <nav className="flex items-center gap-1.5" aria-label="Pagination jadwal">
        <PageButton
          label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>
        {visiblePages(page, totalPages).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={
              pageNumber === page
                ? 'h-8 min-w-8 rounded-md bg-primary px-2 text-[13px] font-semibold text-primary-foreground'
                : 'h-8 min-w-8 rounded-md border border-border bg-card px-2 text-[13px] font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'
            }
            aria-current={pageNumber === page ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <PageButton
          label="Halaman berikutnya"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </nav>
    </footer>
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
      <select
        id={id}
        className="h-10 rounded-md border border-border bg-white px-3.5 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center py-10 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-primary-soft)] text-primary">
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
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th scope="col" className={`px-[18px] font-bold ${className}`}>
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

function PageButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function SessionTableSkeleton() {
  return (
    <div className="mt-4 space-y-3" role="status" aria-label="Memuat jadwal">
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

function visiblePages(page: number, totalPages: number) {
  if (totalPages <= 3)
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  const start = Math.min(Math.max(page - 1, 1), totalPages - 2)
  return [start, start + 1, start + 2]
}

function sessionLink(id: string, tutor: boolean) {
  return tutor
    ? `/tutor/sessions/${id}/record?step=attendance`
    : `/schedule/${id}`
}

function viewButtonClass(active: boolean) {
  return active
    ? 'rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring'
    : 'rounded-md px-4 py-2 text-[13px] font-semibold hover:bg-white focus-visible:ring-2 focus-visible:ring-ring'
}

import type { FormEvent } from 'react'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  List,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import type {
  ScheduleEducationLevel,
  ScheduleFilters,
  ScheduleListItem,
} from '@/features/schedules/api/schedules-api'
import {
  useSchedules,
  useSchedulesSummary,
} from '@/features/schedules/hooks/use-schedules'
import { getStoredAuthUser } from '@/lib/auth-session'
import { cn } from '@/lib/utils'

const dayNames = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const

const educationLevels: readonly {
  value: ScheduleEducationLevel
  label: string
}[] = [
  { value: 'sd', label: 'SD' },
  { value: 'smp', label: 'SMP' },
  { value: 'sma', label: 'SMA/SMK' },
  { value: 'other', label: 'Lainnya' },
]

export function ScheduleManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchDraft, setSearchDraft] = useState(
    searchParams.get('search') ?? '',
  )
  const [weekOffset, setWeekOffset] = useState(0)
  const view = searchParams.get('view') === 'calendar' ? 'calendar' : 'list'
  const filters = readFilters(searchParams)
  const schedules = useSchedules({
    ...filters,
    page: view === 'calendar' ? 1 : filters.page,
    limit: view === 'calendar' ? 100 : filters.limit,
  })
  const summary = useSchedulesSummary()
  const user = getStoredAuthUser()
  const canManageSchedules = user?.role === 'owner' || user?.role === 'operator'

  function updateFilters(next: Partial<ScheduleFilters>) {
    const merged = { ...filters, ...next }
    const params = new URLSearchParams(searchParams)
    setOptionalSearchParam(params, 'search', merged.search)
    setOptionalSearchParam(
      params,
      'day',
      merged.dayOfWeek ? String(merged.dayOfWeek) : undefined,
    )
    setOptionalSearchParam(params, 'level', merged.educationLevel)
    setOptionalSearchParam(
      params,
      'page',
      merged.page > 1 ? String(merged.page) : undefined,
    )
    setSearchParams(params)
  }

  function changeView(nextView: 'list' | 'calendar') {
    const params = new URLSearchParams(searchParams)
    setOptionalSearchParam(
      params,
      'view',
      nextView === 'calendar' ? 'calendar' : undefined,
    )
    setSearchParams(params)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateFilters({ search: searchDraft.trim() || undefined, page: 1 })
  }

  const total = schedules.data?.meta.total ?? 0
  const start = total === 0 ? 0 : (filters.page - 1) * filters.limit + 1
  const end = Math.min(filters.page * filters.limit, total)
  const paginationPages = getPaginationPages(
    filters.page,
    schedules.data?.meta.totalPages ?? 0,
  )

  return (
    <div className="min-w-0" aria-labelledby="schedule-page-title">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1
            id="schedule-page-title"
            className="text-2xl font-bold leading-[1.3] text-foreground"
          >
            Jadwal Belajar
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {view === 'calendar'
              ? 'Tinjauan alokasi ruangan per jam dalam satu minggu.'
              : 'Kelola sesi pertemuan, penugasan tentor, dan alokasi ruangan.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="inline-flex rounded-md bg-muted p-[3px]"
            aria-label="Pilihan tampilan jadwal"
          >
            <Button
              type="button"
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs"
              aria-pressed={view === 'list'}
              onClick={() => changeView('list')}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              List View
            </Button>
            <Button
              type="button"
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs"
              aria-pressed={view === 'calendar'}
              onClick={() => changeView('calendar')}
            >
              <CalendarRange className="h-4 w-4" aria-hidden="true" />
              Kalender
            </Button>
          </div>

          {view === 'calendar' ? (
            <div className="flex h-10 items-center rounded-md border border-input bg-card">
              <button
                type="button"
                className="grid h-full w-9 place-items-center rounded-l-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Lihat minggu sebelumnya"
                onClick={() => setWeekOffset((value) => value - 1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-[11rem] px-2 text-center text-xs font-semibold">
                {formatWeekRange(weekOffset)}
              </span>
              <button
                type="button"
                className="grid h-full w-9 place-items-center rounded-r-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Lihat minggu berikutnya"
                onClick={() => setWeekOffset((value) => value + 1)}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {canManageSchedules ? (
            <Button asChild className="h-10 text-[13px]">
              <Link to="/study-groups/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah Jadwal
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <section
        className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Ringkasan jadwal"
        aria-busy={summary.isPending}
      >
        <SummaryCard
          icon={BookOpen}
          label="Total Sesi Jadwal"
          value={summary.data?.totalSchedules}
          tone="primary"
          hasError={summary.isError}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Sesi Terisi Presensi"
          value={summary.data?.schedulesWithAttendance}
          tone="success"
          hasError={summary.isError}
        />
        <SummaryCard
          icon={CirclePause}
          label="Belum Presensi"
          value={summary.data?.schedulesPendingAttendance}
          tone="neutral"
          hasError={summary.isError}
        />
        <SummaryCard
          icon={CalendarDays}
          label="Jadwal Hari Ini"
          value={summary.data?.schedulesToday}
          tone="warning"
          hasError={summary.isError}
        />
      </section>

      <section className="mt-5 rounded-lg border border-border bg-card p-[18px]">
        <div className="flex flex-col gap-3 sm:h-10 sm:flex-row sm:items-center">
          <form
            className="relative min-w-0 flex-1"
            role="search"
            onSubmit={handleSearch}
          >
            <label className="sr-only" htmlFor="schedule-search">
              Cari nama kelompok atau tentor
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="schedule-search"
              type="search"
              className="h-10 w-full rounded-md border border-input bg-[var(--color-gray-50)] pl-[38px] pr-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Cari nama kelompok atau tentor"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
            <button type="submit" className="sr-only">
              Terapkan pencarian
            </button>
          </form>

          <label className="relative block shrink-0">
            <span className="sr-only">Filter jenjang</span>
            <select
              className="h-10 w-full appearance-none rounded-md border border-input bg-card py-2 pl-3.5 pr-9 text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-[103px]"
              value={filters.educationLevel ?? ''}
              onChange={(event) =>
                updateFilters({
                  educationLevel:
                    (event.target.value as ScheduleEducationLevel) || undefined,
                  page: 1,
                })
              }
            >
              <option value="">Jenjang</option>
              {educationLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </label>

          <label className="relative block shrink-0">
            <span className="sr-only">Filter hari</span>
            <select
              className="h-10 w-full appearance-none rounded-md border border-input bg-card py-2 pl-3.5 pr-9 text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-[78px]"
              value={filters.dayOfWeek ?? ''}
              onChange={(event) =>
                updateFilters({
                  dayOfWeek: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                  page: 1,
                })
              }
            >
              <option value="">Hari</option>
              {dayNames.map((day, index) => (
                <option key={day} value={index + 1}>
                  {day}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </label>
        </div>

        {schedules.isError ? (
          <div
            className="mt-4 flex items-start gap-3 rounded-md border border-[var(--color-danger-soft)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger)]"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">
                Jadwal tidak dapat dimuat.
              </p>
              <button
                type="button"
                className="mt-1 text-xs font-semibold underline underline-offset-2"
                onClick={() => void schedules.refetch()}
              >
                Coba lagi
              </button>
            </div>
          </div>
        ) : null}

        {view === 'list' ? (
          <>
            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[890px] table-fixed text-left">
                <caption className="sr-only">
                  Daftar jadwal belajar aktif
                </caption>
                <thead className="bg-[var(--color-gray-50)] text-xs font-extrabold text-muted-foreground">
                  <tr>
                    <th className="w-[18%] rounded-l-md px-3 py-3" scope="col">
                      Hari &amp; Jam
                    </th>
                    <th className="w-[21%] px-3 py-3" scope="col">
                      Nama Kelompok
                    </th>
                    <th className="w-[14%] px-3 py-3" scope="col">
                      Mata Pelajaran
                    </th>
                    <th className="w-[16%] px-3 py-3" scope="col">
                      Tentor
                    </th>
                    <th className="w-[10%] px-3 py-3" scope="col">
                      Ruangan
                    </th>
                    <th className="w-[7%] px-3 py-3" scope="col">
                      Siswa
                    </th>
                    <th className="w-[11%] px-3 py-3" scope="col">
                      Presensi
                    </th>
                    <th className="w-[3%] rounded-r-md py-3" scope="col">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody aria-busy={schedules.isPending}>
                  {schedules.isPending
                    ? Array.from({ length: 6 }, (_, index) => (
                        <ScheduleSkeletonRow key={index} />
                      ))
                    : schedules.data?.data.map((schedule) => (
                        <ScheduleRow key={schedule.id} schedule={schedule} />
                      ))}
                </tbody>
              </table>
            </div>

            <div
              className="mt-4 grid gap-3 md:hidden"
              aria-busy={schedules.isPending}
            >
              {schedules.isPending
                ? Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={index}
                      className="h-40 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
                    />
                  ))
                : schedules.data?.data.map((schedule) => (
                    <ScheduleMobileCard key={schedule.id} schedule={schedule} />
                  ))}
            </div>
          </>
        ) : !schedules.isError ? (
          <ScheduleCalendar
            schedules={schedules.data?.data ?? []}
            isPending={schedules.isPending}
            weekOffset={weekOffset}
          />
        ) : null}

        {!schedules.isPending && schedules.data?.data.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <CalendarDays
              className="mx-auto h-9 w-9 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-3 text-sm font-bold">Belum ada jadwal</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Ubah filter atau tambahkan jadwal melalui kelompok belajar.
            </p>
            {canManageSchedules ? (
              <Button asChild size="sm" className="mt-4">
                <Link to="/study-groups/new">Tambah Jadwal</Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {view === 'list' && schedules.data && schedules.data.meta.total > 0 ? (
          <footer className="mt-3 flex flex-col gap-3 border-t border-border px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Menampilkan {start}-{end} dari {total} sesi jadwal aktif
            </p>
            <nav
              className="flex items-center gap-1.5"
              aria-label="Navigasi halaman jadwal"
            >
              <button
                type="button"
                className="grid h-8 min-w-8 place-items-center rounded-md border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={filters.page <= 1}
                aria-label="Halaman sebelumnya"
                onClick={() => updateFilters({ page: filters.page - 1 })}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              {paginationPages.map((page) => {
                const isActive = page === filters.page

                return (
                  <button
                    key={page}
                    type="button"
                    className={cn(
                      'grid h-8 min-w-8 place-items-center rounded-md border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                    aria-label={`Halaman ${page}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => updateFilters({ page })}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                type="button"
                className="grid h-8 min-w-8 place-items-center rounded-md border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={filters.page >= schedules.data.meta.totalPages}
                aria-label="Halaman berikutnya"
                onClick={() => updateFilters({ page: filters.page + 1 })}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </footer>
        ) : null}
      </section>
    </div>
  )
}

type SummaryCardProps = {
  icon: LucideIcon
  label: string
  value: number | undefined
  tone: 'primary' | 'success' | 'neutral' | 'warning'
  hasError: boolean
}

const summaryToneClasses = {
  primary: 'bg-[var(--color-primary-soft)] text-primary',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  neutral: 'bg-muted text-muted-foreground',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
} as const

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
  hasError,
}: SummaryCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span
          className={cn(
            'grid h-7 w-7 place-items-center rounded-md',
            summaryToneClasses[tone],
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {label}
      </div>
      {hasError ? (
        <p className="mt-2 text-2xl font-bold leading-[1.3]">—</p>
      ) : value === undefined ? (
        <div className="mt-2 h-8 w-12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      ) : (
        <p className="mt-2 text-2xl font-bold leading-[1.3]">{value}</p>
      )}
    </article>
  )
}

type ScheduleCalendarProps = {
  schedules: ScheduleListItem[]
  isPending: boolean
  weekOffset: number
}

type CalendarCluster = {
  schedules: ScheduleListItem[]
  rowSpan: number
}

type CalendarDayPlacement = {
  starts: Map<number, CalendarCluster>
  covered: Set<number>
}

const calendarSlotMinutes = 30
const defaultCalendarStart = 13 * 60
const defaultCalendarEnd = 19 * 60

const calendarToneClasses = [
  'border-primary bg-[var(--color-primary-soft)] hover:bg-[var(--color-brand-200)]',
  'border-[var(--color-success)] bg-[var(--color-success-bg)] hover:bg-[var(--color-success-soft)]',
  'border-[var(--color-warning)] bg-[var(--color-warning-bg)] hover:bg-[var(--color-warning-border)]',
  'border-[var(--color-danger)] bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger-soft)]',
  'border-border bg-[var(--color-gray-50)] hover:bg-muted',
] as const

function ScheduleCalendar({
  schedules,
  isPending,
  weekOffset,
}: ScheduleCalendarProps) {
  if (isPending) {
    return <ScheduleCalendarSkeleton />
  }

  if (schedules.length === 0) {
    return null
  }

  const [startMinutes, endMinutes] = getCalendarTimeRange(schedules)
  const timeSlots = createTimeSlots(startMinutes, endMinutes)
  const placements = buildCalendarPlacements(
    schedules,
    startMinutes,
    timeSlots.length,
  )
  const weekDates = getWeekDates(weekOffset)
  const todayKey = dateKey(getJakartaDate())

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card p-2 sm:p-3.5">
      <table className="w-full min-w-[1040px] table-fixed border-separate border-spacing-1.5">
        <caption className="sr-only">
          Kalender jadwal belajar untuk {formatWeekRange(weekOffset)}
        </caption>
        <colgroup>
          <col className="w-[72px]" />
          {dayNames.map((day) => (
            <col key={day} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th
              className="sticky left-0 z-30 h-[46px] rounded-md bg-card text-center text-xs font-extrabold text-muted-foreground"
              scope="col"
            >
              Jam
            </th>
            {dayNames.map((day, index) => {
              const date = weekDates[index]
              const isToday = dateKey(date) === todayKey

              return (
                <th
                  key={day}
                  className={cn(
                    'h-[46px] rounded-md bg-[var(--color-gray-50)] px-2 py-1 text-center',
                    isToday && 'bg-[var(--color-primary-soft)] text-primary',
                  )}
                  scope="col"
                  aria-current={isToday ? 'date' : undefined}
                >
                  <span className="block text-xs font-extrabold">{day}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-[10px] font-semibold text-muted-foreground',
                      isToday && 'text-primary',
                    )}
                  >
                    {formatCalendarDate(date)}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slotMinutes, slotIndex) => (
            <tr key={slotMinutes}>
              <th
                className="sticky left-0 z-20 h-[82px] rounded-md border border-border bg-[var(--color-gray-50)] px-1 text-center text-[11px] font-extrabold text-foreground"
                scope="row"
              >
                {formatTime(slotMinutes)}
              </th>
              {dayNames.map((day, dayIndex) => {
                const placement = placements.get(dayIndex + 1)
                const cluster = placement?.starts.get(slotIndex)

                if (placement?.covered.has(slotIndex)) {
                  return null
                }

                if (cluster) {
                  return (
                    <td
                      key={day}
                      rowSpan={cluster.rowSpan}
                      className="rounded-md border border-border bg-card p-1 align-top"
                    >
                      <div className="flex h-full min-h-[74px] gap-1">
                        {cluster.schedules.map((schedule) => (
                          <CalendarEvent
                            key={schedule.id}
                            schedule={schedule}
                          />
                        ))}
                      </div>
                    </td>
                  )
                }

                return (
                  <td
                    key={day}
                    className="h-[82px] rounded-md border border-border bg-card text-center align-middle text-[10px] text-muted-foreground/50"
                  >
                    —
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CalendarEvent({ schedule }: { schedule: ScheduleListItem }) {
  return (
    <Link
      to={`/schedule/${schedule.id}`}
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-md border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        getCalendarTone(schedule.id),
      )}
      aria-label={`${schedule.studyGroupName}, ${schedule.startTime} sampai ${schedule.endTime}, ${schedule.tutorName}`}
    >
      <span className="line-clamp-2 text-[11px] font-extrabold leading-[1.2] text-foreground">
        {schedule.studyGroupName}
      </span>
      {schedule.subject ? (
        <span className="mt-1 truncate text-[9px] font-semibold text-muted-foreground">
          {schedule.subject}
        </span>
      ) : null}
      <span className="mt-auto truncate pt-2 text-[9px] font-semibold text-muted-foreground">
        {roomLabel(schedule)} · {schedule.tutorName}
      </span>
      <span className="mt-0.5 text-[9px] font-bold text-foreground/70">
        {shortTime(schedule.startTime)}–{shortTime(schedule.endTime)}
      </span>
    </Link>
  )
}

function ScheduleCalendarSkeleton() {
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border border-border bg-card p-3.5"
      aria-label="Memuat kalender jadwal"
      role="status"
    >
      <div className="min-w-[1000px] animate-pulse motion-reduce:animate-none">
        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-1.5">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-[46px] rounded-md bg-muted" />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="mt-1.5 grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-1.5"
          >
            {Array.from({ length: 8 }, (_, columnIndex) => (
              <div
                key={columnIndex}
                className="h-[82px] rounded-md border border-border bg-muted/60"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleRow({ schedule }: { schedule: ScheduleListItem }) {
  return (
    <tr className="border-b border-[var(--color-bg-alt)] text-xs last:border-b-0">
      <th className="px-3 py-5 font-bold" scope="row">
        {dayNames[schedule.dayOfWeek - 1] ?? '—'} {schedule.startTime}–
        {schedule.endTime}
      </th>
      <td className="px-3 py-5 text-[13px] font-bold">
        {schedule.studyGroupName}
      </td>
      <td className="px-3 py-5">{schedule.subject ?? '—'}</td>
      <td className="px-3 py-5 font-semibold">{schedule.tutorName}</td>
      <td className="px-3 py-5">{roomLabel(schedule)}</td>
      <td className="px-3 py-5 font-semibold">{schedule.studentCount}</td>
      <td className="px-3 py-5">
        <Badge variant="warning" className="whitespace-nowrap text-[11px]">
          Belum tersedia
        </Badge>
      </td>
      <td className="py-5">
        <Link
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'h-8 w-8 text-muted-foreground',
          )}
          to={`/schedule/${schedule.id}`}
          aria-label={`Lihat detail ${schedule.studyGroupName}`}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}

function ScheduleMobileCard({ schedule }: { schedule: ScheduleListItem }) {
  return (
    <article className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-primary">
            {dayNames[schedule.dayOfWeek - 1] ?? '—'} · {schedule.startTime}–
            {schedule.endTime}
          </p>
          <h2 className="mt-1 text-sm font-bold">{schedule.studyGroupName}</h2>
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'h-8 w-8 shrink-0 text-muted-foreground',
          )}
          to={`/schedule/${schedule.id}`}
          aria-label={`Lihat detail ${schedule.studyGroupName}`}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
        </Link>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Mata pelajaran</dt>
          <dd className="mt-0.5 font-semibold">{schedule.subject ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tentor</dt>
          <dd className="mt-0.5 font-semibold">{schedule.tutorName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Ruangan</dt>
          <dd className="mt-0.5 font-semibold">{roomLabel(schedule)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Siswa</dt>
          <dd className="mt-0.5 font-semibold">{schedule.studentCount}</dd>
        </div>
      </dl>
      <Badge variant="warning" className="mt-3 text-[11px]">
        Presensi belum tersedia
      </Badge>
    </article>
  )
}

function ScheduleSkeletonRow() {
  return (
    <tr className="border-b border-[var(--color-bg-alt)] last:border-b-0">
      {Array.from({ length: 8 }, (_, index) => (
        <td className="px-3 py-5" key={index}>
          <div className="h-4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </td>
      ))}
    </tr>
  )
}

function readFilters(searchParams: URLSearchParams): ScheduleFilters {
  const page = Number(searchParams.get('page'))
  const dayOfWeek = Number(searchParams.get('day'))
  const educationLevel = searchParams.get('level')
  const validEducationLevel = educationLevels.some(
    (item) => item.value === educationLevel,
  )

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: 6,
    search: searchParams.get('search')?.trim() || undefined,
    dayOfWeek:
      Number.isInteger(dayOfWeek) && dayOfWeek >= 1 && dayOfWeek <= 7
        ? dayOfWeek
        : undefined,
    educationLevel: validEducationLevel
      ? (educationLevel as ScheduleEducationLevel)
      : undefined,
  }
}

function roomLabel(schedule: ScheduleListItem) {
  return schedule.roomCode ?? schedule.roomName ?? 'Belum ditentukan'
}

function setOptionalSearchParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
}

function getCalendarTimeRange(schedules: ScheduleListItem[]) {
  const startTimes = schedules
    .map((schedule) => timeToMinutes(schedule.startTime))
    .filter((value): value is number => value !== null)
  const endTimes = schedules
    .map((schedule) => timeToMinutes(schedule.endTime))
    .filter((value): value is number => value !== null)
  const earliest = startTimes.length
    ? Math.min(defaultCalendarStart, ...startTimes)
    : defaultCalendarStart
  const latest = endTimes.length
    ? Math.max(defaultCalendarEnd, ...endTimes)
    : defaultCalendarEnd
  const start = Math.max(
    0,
    Math.floor(earliest / calendarSlotMinutes) * calendarSlotMinutes,
  )
  const end = Math.min(
    24 * 60,
    Math.ceil(latest / calendarSlotMinutes) * calendarSlotMinutes,
  )

  return [start, Math.max(start + calendarSlotMinutes, end)] as const
}

function createTimeSlots(startMinutes: number, endMinutes: number) {
  const slots: number[] = []
  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += calendarSlotMinutes
  ) {
    slots.push(minutes)
  }
  return slots
}

function buildCalendarPlacements(
  schedules: ScheduleListItem[],
  calendarStart: number,
  slotCount: number,
) {
  const result = new Map<number, CalendarDayPlacement>()

  for (let day = 1; day <= dayNames.length; day += 1) {
    const daySchedules = schedules
      .filter((schedule) => schedule.dayOfWeek === day)
      .map((schedule) => ({
        schedule,
        start: timeToMinutes(schedule.startTime),
        end: timeToMinutes(schedule.endTime),
      }))
      .filter(
        (
          item,
        ): item is {
          schedule: ScheduleListItem
          start: number
          end: number
        } => item.start !== null && item.end !== null && item.end > item.start,
      )
      .sort((left, right) => left.start - right.start)
    const grouped: Array<{
      schedules: ScheduleListItem[]
      start: number
      end: number
    }> = []

    for (const item of daySchedules) {
      const current = grouped.at(-1)
      const currentSlot = current
        ? Math.floor((current.start - calendarStart) / calendarSlotMinutes)
        : -1
      const itemSlot = Math.floor(
        (item.start - calendarStart) / calendarSlotMinutes,
      )

      if (current && (item.start < current.end || itemSlot === currentSlot)) {
        current.schedules.push(item.schedule)
        current.end = Math.max(current.end, item.end)
      } else {
        grouped.push({
          schedules: [item.schedule],
          start: item.start,
          end: item.end,
        })
      }
    }

    const starts = new Map<number, CalendarCluster>()
    const covered = new Set<number>()

    for (const group of grouped) {
      const startIndex = clamp(
        Math.floor((group.start - calendarStart) / calendarSlotMinutes),
        0,
        slotCount - 1,
      )
      const endIndex = clamp(
        Math.ceil((group.end - calendarStart) / calendarSlotMinutes),
        startIndex + 1,
        slotCount,
      )
      const rowSpan = Math.max(1, endIndex - startIndex)
      starts.set(startIndex, {
        schedules: group.schedules,
        rowSpan,
      })
      for (let index = startIndex + 1; index < endIndex; index += 1) {
        covered.add(index)
      }
    }

    result.set(day, { starts, covered })
  }

  return result
}

function timeToMinutes(value: string) {
  const match = /^(\d{1,2}):(\d{2})/.exec(value)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return hours * 60 + minutes
}

function shortTime(value: string) {
  return value.slice(0, 5)
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function getCalendarTone(id: string) {
  let hash = 0
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0
  }
  return calendarToneClasses[Math.abs(hash) % calendarToneClasses.length]
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const firstPage = Math.min(Math.max(currentPage - 1, 1), totalPages - 2)
  return [firstPage, firstPage + 1, firstPage + 2]
}

function getJakartaDate() {
  const jakartaParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(jakartaParts.find((item) => item.type === type)?.value)
  const current = new Date(
    Date.UTC(part('year'), part('month') - 1, part('day')),
  )
  return current
}

function getWeekDates(weekOffset: number) {
  const current = getJakartaDate()
  const dayFromMonday = (current.getUTCDay() + 6) % 7
  const monday = new Date(current)
  monday.setUTCDate(current.getUTCDate() - dayFromMonday + weekOffset * 7)

  return dayNames.map((_, index) => {
    const date = new Date(monday)
    date.setUTCDate(monday.getUTCDate() + index)
    return date
  })
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}

function formatCalendarDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function formatWeekRange(weekOffset: number) {
  const weekDates = getWeekDates(weekOffset)
  const monday = weekDates[0]
  const sunday = weekDates[weekDates.length - 1]

  const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    timeZone: 'UTC',
  })
  const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    timeZone: 'UTC',
  })
  const yearFormatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    timeZone: 'UTC',
  })
  const sameMonth = monday.getUTCMonth() === sunday.getUTCMonth()
  const sameYear = monday.getUTCFullYear() === sunday.getUTCFullYear()
  const start = sameMonth
    ? dayFormatter.format(monday)
    : `${dayFormatter.format(monday)} ${monthFormatter.format(monday)}${
        sameYear ? '' : ` ${yearFormatter.format(monday)}`
      }`

  return `${start}–${dayFormatter.format(sunday)} ${monthFormatter.format(
    sunday,
  )} ${yearFormatter.format(sunday)}`
}

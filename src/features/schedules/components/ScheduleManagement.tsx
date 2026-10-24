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
  const filters = readFilters(searchParams)
  const schedules = useSchedules(filters)
  const summary = useSchedulesSummary()
  const user = getStoredAuthUser()
  const canManageSchedules = user?.role === 'owner' || user?.role === 'operator'

  function updateFilters(next: Partial<ScheduleFilters>) {
    const merged = { ...filters, ...next }
    const params = new URLSearchParams()
    if (merged.search) params.set('search', merged.search)
    if (merged.dayOfWeek) params.set('day', String(merged.dayOfWeek))
    if (merged.educationLevel) params.set('level', merged.educationLevel)
    if (merged.page > 1) params.set('page', String(merged.page))
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
            Kelola sesi pertemuan, penugasan tentor, dan alokasi ruangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="inline-flex rounded-md bg-muted p-[3px]"
            aria-label="Pilihan tampilan jadwal"
          >
            <Button type="button" size="sm" className="h-8 px-3 text-xs">
              <List className="h-4 w-4" aria-hidden="true" />
              List
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled
              title="Tampilan kalender akan tersedia pada pengembangan berikutnya"
            >
              <CalendarRange className="h-4 w-4" aria-hidden="true" />
              Kalender
            </Button>
          </div>

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

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[890px] table-fixed text-left">
            <caption className="sr-only">Daftar jadwal belajar aktif</caption>
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

        {schedules.data && schedules.data.meta.total > 0 ? (
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
          to={`/study-groups/${schedule.studyGroupId}`}
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
          to={`/study-groups/${schedule.studyGroupId}`}
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

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const firstPage = Math.min(Math.max(currentPage - 1, 1), totalPages - 2)
  return [firstPage, firstPage + 1, firstPage + 2]
}

function formatWeekRange(weekOffset: number) {
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
  const dayFromMonday = (current.getUTCDay() + 6) % 7
  const monday = new Date(current)
  monday.setUTCDate(current.getUTCDate() - dayFromMonday + weekOffset * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

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

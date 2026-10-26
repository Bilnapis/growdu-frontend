import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronDown, DoorOpen, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  sessionDateLabel,
  shiftDate,
  todayInJakarta,
  useSessions,
  type SessionListItem,
} from '@/features/class-sessions/api'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  timeZone: 'UTC',
})

const monthOptions = Array.from({ length: 12 }, (_, monthIndex) => ({
  value: String(monthIndex + 1).padStart(2, '0'),
  label: monthFormatter.format(new Date(Date.UTC(2024, monthIndex, 1))),
}))

export function TutorSchedule() {
  const [params, setParams] = useSearchParams()
  const dateListRef = useRef<HTMLDivElement>(null)
  const selectedDateRef = useRef<HTMLButtonElement>(null)
  const today = todayInJakarta()
  const selectedDate = normalizeSelectedDate(params.get('date'), today)
  const [searchText, setSearchText] = useState(params.get('search') ?? '')
  const query = useSessions({
    from: selectedDate,
    to: selectedDate,
    page: 1,
    limit: 100,
    search: params.get('search') || undefined,
  })
  const visibleDates = getMonthDates(selectedDate)

  useEffect(() => {
    const dateList = dateListRef.current
    const selectedDateButton = selectedDateRef.current

    if (!dateList || !selectedDateButton) {
      return
    }

    const centeredOffset =
      selectedDateButton.offsetLeft -
      (dateList.clientWidth - selectedDateButton.clientWidth) / 2

    dateList.scrollTo({ left: Math.max(0, centeredOffset) })
  }, [])

  function updateParams(nextDate: string, nextSearch = params.get('search')) {
    const next = new URLSearchParams(params)
    next.set('date', nextDate)

    if (nextSearch) {
      next.set('search', nextSearch)
    } else {
      next.delete('search')
    }

    setParams(next)
  }

  function changeMonth(month: string) {
    const year = selectedDate.slice(0, 4)
    const todayMonth = today.slice(0, 7)
    let nextDate = `${year}-${month}-01`

    if (`${year}-${month}` === todayMonth) {
      nextDate = today
    }

    updateParams(nextDate)
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateParams(selectedDate, searchText.trim())
  }

  return (
    <main className="min-h-dvh bg-background pb-[82px] text-foreground">
      <div className="mx-auto w-full max-w-[390px] py-3">
        <header className="flex items-center justify-between gap-3 px-4">
          <h1 className="text-lg font-bold leading-[1.3]">Jadwal Belajar</h1>
          <div className="relative shrink-0">
            <label htmlFor="tutor-schedule-month" className="sr-only">
              Pilih bulan jadwal
            </label>
            <select
              id="tutor-schedule-month"
              value={selectedDate.slice(5, 7)}
              className="h-[30px] w-[116px] appearance-none rounded-md border border-input bg-card py-0 pl-2.5 pr-8 text-[10px] font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onChange={(event) => changeMonth(event.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </header>

        <div
          ref={dateListRef}
          className="mt-[18px] flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Pilih tanggal jadwal"
        >
          {visibleDates.map((date) => {
            const active = date === selectedDate

            return (
              <button
                ref={active ? selectedDateRef : undefined}
                key={date}
                type="button"
                className={
                  active
                    ? 'flex w-[46px] shrink-0 flex-col items-center gap-0.5 rounded-lg border border-primary bg-primary px-1 py-1.5 text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    : 'flex w-[46px] shrink-0 flex-col items-center gap-0.5 rounded-lg border border-input bg-card px-1 py-1.5 text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                }
                aria-pressed={active}
                aria-label={sessionDateLabel(date)}
                onClick={() => updateParams(date)}
              >
                <span
                  className={`text-[10px] font-semibold leading-[1.3] ${active ? '' : 'text-muted-foreground'}`}
                >
                  {dayNames[getDayIndex(date)]}
                </span>
                <span className="text-sm font-bold leading-[1.3]">
                  {Number(date.slice(8, 10))}
                </span>
              </button>
            )
          })}
        </div>

        <form className="mt-[17px] px-4" role="search" onSubmit={search}>
          <div className="relative">
            <label htmlFor="tutor-schedule-search" className="sr-only">
              Cari nama kelompok
            </label>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="tutor-schedule-search"
              type="search"
              value={searchText}
              className="h-10 bg-[var(--color-gray-50)] pl-8 text-[11px] font-normal"
              placeholder="Cari nama kelompok"
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </form>

        <section
          className="mt-[18px] grid gap-[18px] px-4"
          aria-label={`Jadwal ${sessionDateLabel(selectedDate)}`}
          aria-busy={query.isPending}
        >
          {query.isPending ? <ScheduleSkeleton /> : null}

          {query.isError ? (
            <Card className="p-5 text-center" role="alert">
              <h2 className="text-sm font-bold">Jadwal tidak dapat dimuat</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Periksa koneksi Anda, lalu coba lagi.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => void query.refetch()}
              >
                Coba lagi
              </Button>
            </Card>
          ) : null}

          {!query.isPending &&
          !query.isError &&
          query.data?.data.length === 0 ? (
            <Card className="p-5 text-center">
              <CalendarDays
                className="mx-auto h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-sm font-bold">Belum ada jadwal</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Tidak ada sesi mengajar pada tanggal ini.
              </p>
            </Card>
          ) : null}

          {query.data?.data.map((session) => (
            <TutorScheduleCard key={session.id} session={session} />
          ))}
        </section>
      </div>

      <TutorBottomNavigation />
    </main>
  )
}

function TutorScheduleCard({ session }: { session: SessionListItem }) {
  const status = getScheduleStatus(session)
  const sessionIsEditable = !session.lockedAt && session.status !== 'cancelled'
  const attendanceSaved = session.attendanceStatus === 'saved'
  const actionLabel = !sessionIsEditable
    ? 'Lihat Sesi'
    : attendanceSaved
      ? 'Ubah Presensi'
      : 'Mulai Presensi'

  return (
    <article>
      <Card className="rounded-xl p-3.5 shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">
              {session.studyGroupName}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {sessionDateLabel(session.sessionDate)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="my-3.5 border-t" />

        <div className="grid gap-3">
          <ScheduleInfo
            icon={CalendarDays}
            label="Waktu"
            value={`${formatTime(session.startTime)} – ${formatTime(session.endTime)} WIB`}
          />
          <ScheduleInfo
            icon={DoorOpen}
            label="Ruang"
            value={`${session.roomName ?? 'Belum ditentukan'} • ${session.studentCount} siswa`}
          />
        </div>

        <Button
          asChild
          type="button"
          size="sm"
          variant={attendanceSaved && sessionIsEditable ? 'outline' : 'default'}
          className="mt-3.5 w-full text-xs font-extrabold"
        >
          <Link
            to={`/tutor/sessions/${session.id}/record?step=attendance`}
            aria-label={`${actionLabel} untuk ${session.studyGroupName}`}
          >
            {actionLabel}
          </Link>
        </Button>
      </Card>
    </article>
  )
}

function ScheduleInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon
        className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-[13px] font-bold">{value}</p>
      </div>
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div
      className="h-[248px] animate-pulse rounded-xl border bg-card"
      aria-label="Memuat jadwal"
    />
  )
}

function getScheduleStatus(session: SessionListItem) {
  if (session.status === 'cancelled') {
    return {
      label: 'Dibatalkan',
      className: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    }
  }

  if (session.attendanceStatus === 'saved' || session.status === 'completed') {
    return {
      label: 'Selesai',
      className: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    }
  }

  return {
    label: 'Belum selesai',
    className: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  }
}

function normalizeSelectedDate(value: string | null, fallback: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return fallback
  }

  const parsed = new Date(`${value}T00:00:00Z`)

  return Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
    ? fallback
    : value
}

function getMonthDates(selectedDate: string) {
  const month = selectedDate.slice(0, 7)
  const dates: string[] = []
  let candidate = `${month}-01`

  while (candidate.startsWith(month)) {
    dates.push(candidate)
    candidate = shiftDate(candidate, 1)
  }

  return dates
}

function getDayIndex(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

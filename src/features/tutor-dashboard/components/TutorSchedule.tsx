import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronDown, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TutorPageHeader } from '@/components/TutorPageHeader'
import {
  sessionDateLabel,
  shiftDate,
  todayInJakarta,
  useSessions,
} from '@/features/class-sessions/api'
import { TutorScheduleCard } from '@/features/tutor-dashboard/components/TutorScheduleCard'

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
    <main className="min-h-dvh bg-background pb-6 text-foreground">
      <div className="mx-auto w-full max-w-[390px]">
        <TutorPageHeader title="Jadwal Belajar" />
        <div className="mt-[18px] flex justify-end px-4">
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
        </div>

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
                  className={`text-[10px] font-medium leading-[1.3] ${active ? 'text-white' : 'text-muted-foreground'}`}
                >
                  {dayNames[getDayIndex(date)]}
                </span>
                <span
                  className={`text-sm font-semibold leading-[1.3] ${active ? 'text-white' : 'text-foreground'}`}
                >
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
              className="h-10 pl-8 text-[11px] font-normal"
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
    </main>
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

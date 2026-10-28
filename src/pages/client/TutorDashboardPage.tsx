import {
  Bell,
  CalendarDays,
  FileText,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { TutorScheduleCard } from '@/features/tutor-dashboard/components/TutorScheduleCard'
import { useSessions, todayInJakarta } from '@/features/class-sessions/api'
import { getStoredAuthUser } from '@/lib/auth-session'
import { DashboardAnnouncements } from '@/features/announcements/components/DashboardAnnouncements'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
})

const quickActions = [
  { label: 'Jadwal', icon: CalendarDays, to: '/tutor/sessions' },
  { label: 'Siswa', icon: UsersRound, to: '/tutor/students' },
  { label: 'Laporan', icon: FileText, to: null },
] as const

function getFirstName(name: string | null) {
  const firstName = name?.trim().split(/\s+/)[0]

  return firstName || 'Tentor'
}

export function TutorDashboardPage() {
  const user = getStoredAuthUser()
  const today = new Date()
  const schedulesQuery = useSessions({
    page: 1,
    limit: 100,
    from: todayInJakarta(),
    to: todayInJakarta(),
  })
  const greetingName = getFirstName(user?.profileName ?? null)

  return (
    <main className="min-h-dvh bg-background pb-6 text-foreground">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="flex items-center justify-between px-4 py-[18px]">
          <div>
            <h1 className="text-lg font-bold leading-tight">
              Selamat pagi, {greetingName}!
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {dateFormatter.format(today)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full bg-card text-muted-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Notifikasi"
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <Link
              to="/tutor/profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition-colors hover:bg-[var(--color-brand-600)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Profil tentor"
            >
              <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div className="px-4">
          <DashboardAnnouncements audience="tutor" />
        </div>

        <section
          className="mt-[18px] px-4"
          aria-labelledby="quick-actions-title"
        >
          <h2 id="quick-actions-title" className="text-[15px] font-bold">
            Menu
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {quickActions.map(({ label, icon: Icon, to }) =>
              to ? (
                <Link
                  key={label}
                  to={to}
                  className="flex h-[76px] flex-col items-center justify-center gap-[7px] rounded-[10px] bg-card text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-5 w-5 text-primary-text" aria-hidden="true" />
                  <span className="text-[11px] font-bold">{label}</span>
                </Link>
              ) : (
                <div
                  key={label}
                  className="flex h-[76px] flex-col items-center justify-center gap-[7px] rounded-[10px] bg-card text-foreground"
                  aria-label={`${label} segera tersedia`}
                >
                  <Icon className="h-5 w-5 text-primary-text" aria-hidden="true" />
                  <span className="text-[11px] font-bold">{label}</span>
                </div>
              ),
            )}
          </div>
        </section>

        <section
          className="mt-[18px] px-4"
          aria-labelledby="today-schedule-title"
          aria-busy={schedulesQuery.isPending}
        >
          <div className="flex items-center justify-between">
            <h2 id="today-schedule-title" className="text-[15px] font-bold">
              Jadwal Hari Ini
            </h2>
            <span className="text-[11px] font-semibold text-primary-text">
              <Link to="/tutor/sessions">Lihat semua</Link>
            </span>
          </div>

          {schedulesQuery.isPending ? (
            <div
              className="mt-3 h-40 animate-pulse rounded-xl bg-card"
              aria-label="Memuat jadwal"
            />
          ) : null}

          {schedulesQuery.isError ? (
            <p
              className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              Jadwal belum dapat dimuat. Silakan coba lagi.
            </p>
          ) : null}

          {!schedulesQuery.isPending &&
          !schedulesQuery.isError &&
          schedulesQuery.data?.data.length === 0 ? (
            <p className="mt-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              Belum ada jadwal mengajar untuk hari ini.
            </p>
          ) : null}

          <div className="mt-3 grid gap-3">
            {schedulesQuery.data?.data.map((schedule) => (
              <TutorScheduleCard key={schedule.id} session={schedule} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

import {
  Bell,
  CalendarDays,
  DoorOpen,
  FileText,
  Megaphone,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'
import { useSessions, todayInJakarta } from '@/features/class-sessions/api'
import { getStoredAuthUser } from '@/lib/auth-session'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
})

const quickActions = [
  { label: 'Jadwal', icon: CalendarDays },
  { label: 'Siswa', icon: UsersRound },
  { label: 'Laporan', icon: FileText },
] as const

function getFirstName(name: string | null) {
  const firstName = name?.trim().split(/\s+/)[0]

  return firstName || 'Tentor'
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function getScheduleStatus(status: 'scheduled' | 'completed' | 'cancelled') {
  if (status === 'completed') {
    return {
      label: 'Selesai',
      className: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    }
  }

  if (status === 'cancelled') {
    return {
      label: 'Dibatalkan',
      className: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    }
  }

  return {
    label: 'Belum selesai',
    className: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  }
}

export function TutorDashboardPage() {
  const navigate = useNavigate()
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
    <main className="min-h-dvh bg-background pb-20 text-foreground">
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
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-[var(--color-brand-600)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Profil tentor"
            >
              <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="px-4" aria-labelledby="announcements-title">
          <h2 id="announcements-title" className="text-[15px] font-bold">
            Pengumuman
          </h2>
          <article className="mt-2 flex items-center gap-2.5 rounded-[10px] bg-[var(--color-warning-bg)] p-3.5">
            <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#fef3c7] text-[var(--color-warning)]">
              <Megaphone className="h-[17px] w-[17px]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xs font-bold">Libur Lebaran</h3>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                18 Maret 2026 – 25 Maret 2026
              </p>
            </div>
          </article>
        </section>

        <section
          className="mt-[18px] px-4"
          aria-labelledby="quick-actions-title"
        >
          <h2 id="quick-actions-title" className="text-[15px] font-bold">
            Menu
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {quickActions.map(({ label, icon: Icon }) =>
              label === 'Jadwal' ? (
                <Link
                  key={label}
                  to="/tutor/sessions"
                  className="flex h-[76px] flex-col items-center justify-center gap-[7px] rounded-[10px] bg-card text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-[11px] font-bold">{label}</span>
                </Link>
              ) : (
                <div
                  key={label}
                  className="flex h-[76px] flex-col items-center justify-center gap-[7px] rounded-[10px] bg-card text-foreground"
                  aria-label={`${label} segera tersedia`}
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
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
            <span className="text-[11px] font-semibold text-primary">
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
            {schedulesQuery.data?.data.map((schedule) => {
              const scheduleStatus = getScheduleStatus(schedule.status)

              return (
                <article key={schedule.id} className="rounded-xl bg-card p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold">
                        {schedule.studyGroupName}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dateFormatter.format(today)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${scheduleStatus.className}`}
                    >
                      {scheduleStatus.label}
                    </span>
                  </div>
                  <div className="my-3.5 border-t" />
                  <div className="grid gap-3">
                    <div className="flex gap-2">
                      <CalendarDays
                        className="mt-0.5 h-[18px] w-[18px] shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Waktu
                        </p>
                        <p className="text-xs font-semibold">
                          {formatTime(schedule.startTime)} –{' '}
                          {formatTime(schedule.endTime)} WIB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <DoorOpen
                        className="mt-0.5 h-[18px] w-[18px] shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Ruang
                        </p>
                        <p className="text-xs font-semibold">
                          {schedule.roomName ?? 'Belum ditentukan'} •{' '}
                          {schedule.studentCount} siswa
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() =>
                      void navigate(
                        `/tutor/sessions/${schedule.id}/record?step=attendance`,
                      )
                    }
                  >
                    {schedule.status === 'completed' ||
                    schedule.status === 'cancelled' ||
                    schedule.lockedAt
                      ? 'Lihat Sesi'
                      : 'Mulai Presensi'}
                  </Button>
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <TutorBottomNavigation />
    </main>
  )
}

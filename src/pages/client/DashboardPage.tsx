import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  FileText,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { DashboardAnnouncements } from '@/features/announcements/components/DashboardAnnouncements'

type Metric = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  tone: 'success' | 'primary' | 'warning' | 'danger'
}

type OperationalAlert = {
  title: string
  description: string
  tone: 'danger' | 'warning' | 'primary'
}

const metrics: readonly Metric[] = [
  {
    label: 'Pendapatan',
    value: 'Rp 42,8 jt',
    helper: 'Naik dari bulan lalu',
    icon: TrendingUp,
    tone: 'success',
  },
  {
    label: 'Gaji Tentor',
    value: 'Rp 18,6 jt',
    helper: 'Payroll bulan ini',
    icon: Wallet,
    tone: 'primary',
  },
  {
    label: 'Siswa Aktif',
    value: '184',
    helper: '12 siswa baru',
    icon: Users,
    tone: 'primary',
  },
  {
    label: 'Invoice Pending',
    value: '27',
    helper: '8 terlambat',
    icon: Receipt,
    tone: 'warning',
  },
  {
    label: 'Tentor Aktif',
    value: '24',
    helper: '19 mengajar minggu ini',
    icon: Users,
    tone: 'success',
  },
  {
    label: 'Kelompok',
    value: '38',
    helper: '5 jadwal hari ini',
    icon: BookOpen,
    tone: 'primary',
  },
  {
    label: 'Presensi Hari Ini',
    value: '6/9',
    helper: '3 belum presensi',
    icon: ClipboardCheck,
    tone: 'warning',
  },
  {
    label: 'Laporan Belum',
    value: '14',
    helper: 'Perlu ditindaklanjuti',
    icon: FileText,
    tone: 'danger',
  },
]

const alerts: readonly OperationalAlert[] = [
  {
    title: 'Invoice terlambat',
    description: '8 invoice melewati jatuh tempo',
    tone: 'danger',
  },
  {
    title: 'Laporan perkembangan belum dibuat',
    description: '14 laporan perkembangan belum dikirim',
    tone: 'warning',
  },
  {
    title: 'Payroll siap dicek',
    description: '3 slip gaji menunggu approval',
    tone: 'primary',
  },
]

const schedules = [
  {
    time: '08:00 - 09:00',
    group: 'Kelas 8A Matematika',
    detail: 'Bu Rina • Ruang 2',
    status: 'Selesai',
  },
  {
    time: '10:00 - 11:00',
    group: 'SMA UTBK Fisika',
    detail: 'Pak Dimas • Ruang 1',
    status: 'Belum selesai',
  },
  {
    time: '13:00 - 14:30',
    group: 'Kelas 7B Bahasa Inggris',
    detail: 'Bu Sari • Ruang 3',
    status: 'Belum selesai',
  },
] as const

const financeItems = [
  {
    label: 'Invoice Lunas',
    value: 'Rp 42,8 jt',
    tone: 'text-[var(--color-success)]',
  },
  {
    label: 'Invoice Belum Dibayar',
    value: 'Rp 9,4 jt',
    tone: 'text-[var(--color-warning)]',
  },
  {
    label: 'Terlambat',
    value: 'Rp 3,1 jt',
    tone: 'text-[var(--color-danger)]',
  },
  {
    label: 'Payroll Dibayar',
    value: 'Rp 12,2 jt',
    tone: 'text-[var(--color-primary-darker)]',
  },
] as const

const metricToneClasses = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  primary: 'bg-[var(--color-primary-soft)] text-primary-text',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
} as const

const alertToneClasses = {
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  primary: 'bg-[var(--color-info-bg)] text-[var(--color-primary-darker)]',
} as const

export function DashboardPage() {
  return (
    <div className="min-w-0" aria-labelledby="dashboard-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1
            id="dashboard-title"
            className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]"
          >
            Dashboard
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Ringkasan operasional September 2026
          </p>
        </div>
        <label className="sr-only" htmlFor="dashboard-period">
          Periode dashboard
        </label>
        <select
          id="dashboard-period"
          className="h-9 rounded-md border border-input bg-card px-3 text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          defaultValue="September 2026"
        >
          <option>September 2026</option>
        </select>
      </header>

      <DashboardAnnouncements
        audience="admin"
        className="mt-[22px]"
        hideWhenEmpty
      />

      <section
        className="mt-[22px] grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Ringkasan metrik operasional"
      >
        {metrics.map(({ label, value, helper, icon: Icon, tone }) => (
          <article
            key={label}
            className="min-h-[132px] rounded-lg border bg-card p-[18px] shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13px] font-semibold text-muted-foreground">
                {label}
              </h2>
              <span
                className={`grid h-[34px] w-[34px] place-items-center rounded-md ${metricToneClasses[tone]}`}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2.5 text-[28px] font-bold leading-[1.3] text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
          </article>
        ))}
      </section>

      <div className="mt-[22px] grid grid-cols-1 gap-[18px] lg:grid-cols-[minmax(0,1.75fr)_minmax(18rem,1fr)]">
        <div className="grid min-w-0 grid-cols-1 content-start gap-[18px]">
          <section
            className="rounded-lg border bg-card p-[18px]"
            aria-labelledby="priority-title"
          >
            <h2 id="priority-title" className="text-lg font-bold leading-[1.3]">
              Prioritas Operasional
            </h2>
            <div className="mt-3.5 grid gap-3">
              {alerts.map(({ title, description, tone }) => (
                <article
                  key={title}
                  className={`flex gap-3 rounded-md p-3 ${alertToneClasses[tone]}`}
                >
                  <AlertCircle
                    className="mt-0.5 h-[18px] w-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-[13px] font-bold leading-[1.3]">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-xs font-regular leading-[1.3]">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            className="rounded-lg border bg-card p-[18px]"
            aria-labelledby="schedule-title"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="schedule-title"
                className="text-lg font-bold leading-[1.3]"
              >
                Jadwal Hari Ini
              </h2>
              <Link
                className="text-[13px] font-bold text-primary-text hover:underline"
                to="/schedule"
              >
                Lihat semua
              </Link>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left">
                <caption className="sr-only">Jadwal kelas hari ini</caption>
                <tbody>
                  {schedules.map(({ time, group, detail, status }) => (
                    <tr
                      key={`${time}-${group}`}
                      className="border-t first:border-t-0"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap py-3 pr-3 text-xs font-semibold text-foreground"
                      >
                        {time}
                      </th>
                      <td className="py-3 pr-3">
                        <p className="text-[13px] font-semibold text-foreground">
                          {group}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {detail}
                        </p>
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={status === 'Selesai' ? 'success' : 'warning'}
                        >
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="grid min-w-0 grid-cols-1 content-start gap-[18px]">
          <section
            className="rounded-lg border bg-card p-[18px]"
            aria-labelledby="finance-title"
          >
            <h2 id="finance-title" className="text-lg font-bold leading-[1.3]">
              Ringkasan Keuangan
            </h2>
            <dl className="mt-3.5 grid gap-3.5">
              {financeItems.map(({ label, value, tone }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-[13px]"
                >
                  <dt className="font-semibold text-muted-foreground">
                    {label}
                  </dt>
                  <dd className={`shrink-0 text-sm font-semibold ${tone}`}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            className="rounded-lg border bg-card p-[18px]"
            aria-labelledby="report-progress-title"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="report-progress-title"
                className="text-lg font-bold leading-[1.3]"
              >
                Laporan Perkembangan
              </h2>
              <strong className="text-lg font-semibold text-[var(--color-success)]">
                81%
              </strong>
            </div>
            <div
              className="mt-3.5 h-3 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Laporan perkembangan selesai"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={81}
            >
              <div className="h-full w-[81%] rounded-full bg-[var(--color-success)]" />
            </div>
            <p className="mt-3.5 text-[13px] font-semibold text-muted-foreground">
              58 dari 72 laporan sudah dibuat
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

import { AlertCircle } from 'lucide-react'

import { DashboardAnnouncements } from '@/features/announcements/components/DashboardAnnouncements'
import { sessionDateLabel, todayInJakarta } from '@/features/class-sessions/api'
import { DashboardMetrics } from '@/features/dashboard/components/DashboardMetrics'
import { DashboardTodaySchedule } from '@/features/dashboard/components/DashboardTodaySchedule'
import { usePayrollAccess, usePayrollSummary } from '@/features/payroll/hooks'
import { rupiah } from '@/features/payroll/format'

type OperationalAlert = {
  title: string
  description: string
  tone: 'danger' | 'warning' | 'primary'
}

const baseAlerts: readonly OperationalAlert[] = [
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
]

const baseFinanceItems = [
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
] as const

const alertToneClasses = {
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  primary: 'bg-[var(--color-info-bg)] text-[var(--color-primary-darker)]',
} as const

export function DashboardPage() {
  const today = todayInJakarta()
  const payrollAccess = usePayrollAccess()
  const payroll = usePayrollSummary({ month: today.slice(0, 7) }, payrollAccess)
  const pendingPayroll =
    (payroll.data?.unpaid ?? 0) + (payroll.data?.overdue ?? 0)
  const alerts: readonly OperationalAlert[] = [
    ...baseAlerts,
    ...(pendingPayroll
      ? [
          {
            title: 'Penggajian belum dibayar',
            description: `${pendingPayroll} penggajian bulan ini menunggu pembayaran`,
            tone: 'primary' as const,
          },
        ]
      : []),
  ]
  const financeItems = [
    ...baseFinanceItems,
    ...(payrollAccess
      ? [
          {
            label: 'Gaji Dibayar Bulan Ini',
            value: payroll.data
              ? rupiah(payroll.data.paidAmount)
              : payroll.isError
                ? 'Gagal memuat'
                : 'Memuat...',
            tone: 'text-[var(--color-primary-darker)]',
          },
        ]
      : []),
  ]

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
            Ringkasan operasional {sessionDateLabel(today)}
          </p>
        </div>
      </header>

      <DashboardAnnouncements
        audience="admin"
        className="mt-[22px]"
        hideWhenEmpty
      />

      <DashboardMetrics today={today} />

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

          <DashboardTodaySchedule today={today} />
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

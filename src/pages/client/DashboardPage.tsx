import { useState } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardAnnouncements } from '@/features/announcements/components/DashboardAnnouncements'
import { todayInJakarta } from '@/features/class-sessions/api'
import { DashboardMetrics } from '@/features/dashboard/components/DashboardMetrics'
import { DashboardQueryFeedback } from '@/features/dashboard/components/DashboardQueryFeedback'
import { DashboardSchedule } from '@/features/dashboard/components/DashboardSchedule'
import { useDashboardMetrics } from '@/features/dashboard/hooks/use-dashboard-data'
import {
  dashboardMonthLabel,
  isDashboardMonth,
} from '@/features/dashboard/utils/dashboard-period'
import { rupiah } from '@/features/payroll/format'

type OperationalAlert = {
  title: string
  description: string
  tone: 'danger' | 'warning' | 'primary'
}

const alertToneClasses = {
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  primary: 'bg-[var(--color-info-bg)] text-[var(--color-primary-darker)]',
} as const

export function DashboardPage() {
  const currentMonth = todayInJakarta().slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const data = useDashboardMetrics(month)
  const { access, invoices, payroll, reports } = data
  const pendingPayroll = payroll.isSuccess
    ? payroll.data.unpaid + payroll.data.overdue
    : 0
  const alerts: OperationalAlert[] = []
  if (access.invoices && invoices.isSuccess && invoices.data.overdue > 0) {
    alerts.push({
      title: 'Invoice terlambat',
      description: `${invoices.data.overdue} invoice periode terpilih melewati jatuh tempo`,
      tone: 'danger',
    })
  }
  if (access.reports && reports.isSuccess && reports.data.pending > 0) {
    alerts.push({
      title: 'Laporan perkembangan belum lengkap',
      description: `${reports.data.pending} kelompok belum menerbitkan seluruh laporan periode terpilih`,
      tone: 'warning',
    })
  }
  if (access.payroll && pendingPayroll > 0) {
    alerts.push({
      title: 'Penggajian belum dibayar',
      description: `${pendingPayroll} penggajian periode terpilih menunggu pembayaran`,
      tone: 'primary',
    })
  }
  const priorityQueries = [
    ...(access.invoices ? [{ label: 'Invoice', query: invoices }] : []),
    ...(access.reports ? [{ label: 'Laporan', query: reports }] : []),
    ...(access.payroll ? [{ label: 'Penggajian', query: payroll }] : []),
  ]
  const prioritiesLoaded =
    priorityQueries.length > 0 &&
    priorityQueries.every(({ query }) => query.isSuccess)
  const financeItems = [
    ...(access.invoices
      ? [
          {
            label: 'Invoice Lunas',
            value: invoices.isSuccess ? rupiah(invoices.data.paidAmount) : '—',
            tone: 'text-[var(--color-success)]',
          },
          {
            label: 'Invoice Belum Dibayar',
            value: invoices.isSuccess
              ? rupiah(invoices.data.unpaidAmount)
              : '—',
            tone: 'text-[var(--color-warning)]',
          },
          {
            label: 'Terlambat',
            value: invoices.isSuccess
              ? rupiah(invoices.data.overdueAmount)
              : '—',
            tone: 'text-[var(--color-danger)]',
          },
        ]
      : []),
    ...(access.payroll
      ? [
          {
            label: 'Gaji Dibayar',
            value: payroll.isSuccess ? rupiah(payroll.data.paidAmount) : '—',
            tone: 'text-[var(--color-primary-darker)]',
          },
        ]
      : []),
  ]
  const reportProgress =
    reports.isSuccess && reports.data.total > 0
      ? Math.round((reports.data.published / reports.data.total) * 100)
      : 0

  return (
    <div className="min-w-0" aria-labelledby="dashboard-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1
            id="dashboard-title"
            className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]"
          >
            Dashboard
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Ringkasan operasional {dashboardMonthLabel(month)}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-3 sm:shrink-0">
          <Label className="sr-only" htmlFor="dashboard-month">
            Bulan
          </Label>
          <div className="relative min-w-0 flex-1 rounded-md focus-within:ring-2 focus-within:ring-ring sm:w-48 sm:flex-none">
            <Input
              id="dashboard-month"
              type="month"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              min="1000-01"
              max={currentMonth}
              value={month}
              onClick={(event) => {
                if (typeof event.currentTarget.showPicker === 'function') {
                  event.preventDefault()
                  event.currentTarget.showPicker()
                }
              }}
              onChange={(event) => {
                const value = event.target.value
                if (isDashboardMonth(value, currentMonth)) setMonth(value)
                else if (!value) setMonth(currentMonth)
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none flex h-11 w-full items-center justify-between gap-3 rounded-md border border-input bg-[var(--color-surface)] px-3 py-2 text-sm text-foreground"
            >
              <span className="min-w-0 truncate">
                {dashboardMonthLabel(month)}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <DashboardAnnouncements
        audience="admin"
        className="mt-[22px]"
        hideWhenEmpty
      />
      <DashboardMetrics data={data} />

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
              {priorityQueries.map(({ label, query }) => (
                <DashboardQueryFeedback
                  key={label}
                  label={label}
                  query={query}
                />
              ))}
              {prioritiesLoaded && alerts.length === 0 ? (
                <p role="status" className="text-sm text-muted-foreground">
                  Tidak ada prioritas operasional untuk bulan terpilih.
                </p>
              ) : null}
              {priorityQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Akses invoice, penggajian, atau laporan diperlukan.
                </p>
              ) : null}
            </div>
          </section>
          <DashboardSchedule month={month} />
        </div>

        <aside className="grid min-w-0 grid-cols-1 content-start gap-[18px]">
          <section
            className="rounded-lg border bg-card p-[18px]"
            aria-labelledby="finance-title"
          >
            <h2 id="finance-title" className="text-lg font-bold leading-[1.3]">
              Ringkasan Keuangan
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Status invoice periode terpilih saat ini; gaji berdasarkan bulan
              pembayaran.
            </p>
            <dl className="mt-3.5 grid gap-3.5">
              {financeItems.map(({ label, value, tone }) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px]"
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
            <div className="mt-3 grid gap-2">
              {access.invoices ? (
                <DashboardQueryFeedback query={invoices} label="Invoice" />
              ) : null}
              {access.payroll ? (
                <DashboardQueryFeedback query={payroll} label="Penggajian" />
              ) : null}
              {financeItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Akses invoice atau penggajian diperlukan.
                </p>
              ) : null}
            </div>
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
                {access.reports && reports.isSuccess
                  ? `${reportProgress}%`
                  : '—'}
              </strong>
            </div>
            {access.reports ? (
              <div className="mt-3.5">
                <DashboardQueryFeedback query={reports} label="Laporan" />
                {reports.isSuccess ? (
                  reports.data.total > 0 ? (
                    <>
                      <div
                        className="h-3 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Kelompok dengan laporan lengkap"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={reportProgress}
                      >
                        <div
                          className="h-full rounded-full bg-[var(--color-success)]"
                          style={{ width: `${reportProgress}%` }}
                        />
                      </div>
                      <p className="mt-3.5 text-[13px] font-semibold text-muted-foreground">
                        {reports.data.published} dari {reports.data.total}{' '}
                        kelompok sudah menerbitkan seluruh laporan
                      </p>
                    </>
                  ) : (
                    <p role="status" className="text-sm text-muted-foreground">
                      Belum ada laporan untuk bulan terpilih.
                    </p>
                  )
                ) : null}
              </div>
            ) : (
              <p className="mt-3.5 text-sm text-muted-foreground">
                Akses laporan diperlukan.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

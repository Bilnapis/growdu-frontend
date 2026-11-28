import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import type { DashboardData } from '../hooks/use-dashboard-data'
import {
  dashboardErrorMessage,
  isDashboardAccessError,
} from '../utils/dashboard-errors'
import { formatMetricComparison } from '../utils/metric-comparison'
import { rupiah } from '@/features/payroll/format'

type MetricQuery = {
  isPending: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}

type Metric = {
  label: string
  value: string | undefined
  helper: string
  icon: LucideIcon
  tone: 'success' | 'purple' | 'info' | 'warning' | 'danger'
  queries?: readonly MetricQuery[]
  comparisonQuery?: MetricQuery
  comparisonLabel?: string
}

const metricToneClasses = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  purple: 'bg-[var(--color-purple-bg)] text-[var(--color-purple-text)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
} as const

const numberFormatter = new Intl.NumberFormat('id-ID')

export function DashboardMetrics({ data }: { data: DashboardData }) {
  const {
    access,
    students,
    invoices,
    previousInvoices,
    payroll,
    previousPayroll,
    tutors,
    studyGroups,
    reports,
    previousReports,
    savedAttendance,
    pendingAttendance,
    previousAttendance,
  } = data
  const saved = savedAttendance.data?.meta.total
  const pending = pendingAttendance.data?.meta.total

  const metrics: readonly Metric[] = [
    {
      label: 'Pendapatan',
      value:
        access.invoices && invoices.data
          ? rupiah(invoices.data.receivedAmount)
          : undefined,
      helper: access.invoices
        ? formatMetricComparison(
            invoices.data?.receivedAmount,
            previousInvoices.data?.receivedAmount,
          )
        : 'Akses invoice diperlukan',
      queries: access.invoices ? [invoices] : [],
      comparisonQuery: access.invoices ? previousInvoices : undefined,
      comparisonLabel:
        'Pembayaran diterima pada bulan terpilih (WIB), tidak termasuk pembayaran yang dibatalkan',
      icon: TrendingUp,
      tone: 'success',
    },
    {
      label: 'Gaji Tentor',
      value:
        access.payroll && payroll.data
          ? rupiah(payroll.data.totalAmount)
          : undefined,
      helper: access.payroll
        ? formatMetricComparison(
            payroll.data ? Number(payroll.data.totalAmount) : undefined,
            previousPayroll.data
              ? Number(previousPayroll.data.totalAmount)
              : undefined,
          )
        : 'Akses penggajian diperlukan',
      icon: Wallet,
      tone: 'purple',
      queries: access.payroll ? [payroll] : [],
      comparisonQuery: access.payroll ? previousPayroll : undefined,
    },
    {
      label: 'Siswa Aktif',
      value: access.students ? formatCount(students.data?.count) : undefined,
      helper: !access.students
        ? 'Akses siswa diperlukan'
        : students.data?.count === null
          ? 'Riwayat bulan terpilih belum tersedia'
          : formatMetricComparison(
              students.data?.count ?? undefined,
              students.data?.previousMonthCount,
            ),
      icon: Users,
      tone: 'success',
      queries: access.students ? [students] : [],
    },
    {
      label: 'Invoice Pending',
      value: access.invoices ? formatCount(invoices.data?.pending) : undefined,
      helper: access.invoices
        ? 'Invoice belum lunas, termasuk terlambat'
        : 'Akses invoice diperlukan',
      icon: Receipt,
      tone: 'warning',
      queries: access.invoices ? [invoices] : [],
    },
    {
      label: 'Tentor Aktif',
      value: access.tutors ? formatCount(tutors.data?.count) : undefined,
      helper: !access.tutors
        ? 'Akses tentor diperlukan'
        : tutors.data?.count === null
          ? 'Riwayat bulan terpilih belum tersedia'
          : formatMetricComparison(
              tutors.data?.count ?? undefined,
              tutors.data?.previousMonthCount,
            ),
      icon: Users,
      tone: 'success',
      queries: access.tutors ? [tutors] : [],
    },
    {
      label: 'Kelompok',
      value: access.studyGroups
        ? formatCount(studyGroups.data?.count)
        : undefined,
      helper: access.studyGroups
        ? formatMetricComparison(
            studyGroups.data?.count ?? undefined,
            studyGroups.data?.previousMonthCount,
          )
        : 'Akses kelompok belajar diperlukan',
      icon: BookOpen,
      tone: 'info',
      queries: access.studyGroups ? [studyGroups] : [],
    },
    {
      label: 'Presensi Bulanan',
      value:
        saved !== undefined && pending !== undefined
          ? `${numberFormatter.format(saved)}/${numberFormatter.format(saved + pending)}`
          : undefined,
      helper: formatMetricComparison(
        saved,
        previousAttendance.data?.meta.total,
      ),
      comparisonQuery: previousAttendance,
      comparisonLabel:
        'Sesi dengan presensi tersimpan dibandingkan dengan seluruh bulan sebelumnya',
      icon: ClipboardCheck,
      tone: 'warning',
      queries: [savedAttendance, pendingAttendance],
    },
    {
      label: 'Kelompok Belum Lapor',
      value: access.reports ? formatCount(reports.data?.pending) : undefined,
      helper: access.reports
        ? formatMetricComparison(
            reports.data?.pending,
            previousReports.data?.pending,
          )
        : 'Akses laporan diperlukan',
      queries: access.reports ? [reports] : [],
      comparisonQuery: access.reports ? previousReports : undefined,
      icon: FileText,
      tone: 'danger',
    },
  ]

  return (
    <section
      className="mt-[22px] grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Ringkasan metrik operasional"
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  )
}

function MetricCard({ metric }: { metric: Metric }) {
  const {
    label,
    value,
    helper,
    icon: Icon,
    tone,
    queries = [],
    comparisonQuery,
    comparisonLabel,
  } = metric
  const failedQuery = queries.find((query) => query.error !== null)
  const isPending = !failedQuery && queries.some((query) => query.isPending)

  return (
    <article
      className="min-h-[132px] rounded-lg border bg-card p-[18px] shadow-sm"
      aria-busy={isPending}
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
        {isPending || failedQuery ? '—' : (value ?? '—')}
      </p>
      {failedQuery ? (
        <div className="mt-1 text-xs">
          <p role="alert" className="text-muted-foreground">
            {dashboardErrorMessage(failedQuery.error)}
          </p>
          {!isDashboardAccessError(failedQuery.error) ? (
            <button
              type="button"
              className="mt-1 rounded-sm font-semibold text-primary-text underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Coba muat ulang ${label}`}
              onClick={() => {
                for (const query of queries) void query.refetch()
              }}
            >
              Coba lagi
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-1 text-xs text-muted-foreground">
          <p
            role={
              isPending || comparisonQuery?.isPending
                ? 'status'
                : comparisonQuery?.error
                  ? 'alert'
                  : undefined
            }
            title={comparisonLabel}
          >
            {isPending
              ? 'Memuat data...'
              : comparisonQuery?.isPending
                ? 'Memuat perbandingan...'
                : comparisonQuery?.error
                  ? 'Perbandingan belum dapat dimuat.'
                  : helper}
          </p>
          {!isPending &&
          comparisonQuery?.error &&
          !isDashboardAccessError(comparisonQuery.error) ? (
            <button
              type="button"
              className="mt-1 rounded-sm font-semibold text-primary-text underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Coba muat ulang perbandingan ${label}`}
              onClick={() => void comparisonQuery.refetch()}
            >
              Coba lagi
            </button>
          ) : null}
        </div>
      )}
    </article>
  )
}

function formatCount(value: number | null | undefined) {
  return value == null ? undefined : numberFormatter.format(value)
}

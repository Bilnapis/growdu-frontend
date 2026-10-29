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

import { useDashboardMetrics } from '../hooks/use-dashboard-data'
import {
  dashboardErrorMessage,
  isDashboardAccessError,
} from '../utils/dashboard-errors'
import { formatMetricComparison } from '../utils/metric-comparison'

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

export function DashboardMetrics({ today }: { today: string }) {
  const {
    students,
    tutors,
    studyGroups,
    savedAttendance,
    pendingAttendance,
    previousAttendance,
  } = useDashboardMetrics(today)
  const saved = savedAttendance.data?.meta.total
  const pending = pendingAttendance.data?.meta.total

  const metrics: readonly Metric[] = [
    {
      label: 'Pendapatan',
      value: 'Rp 42,8 jt',
      helper: formatMetricComparison(undefined, undefined),
      icon: TrendingUp,
      tone: 'success',
    },
    {
      label: 'Gaji Tentor',
      value: 'Rp 18,6 jt',
      helper: formatMetricComparison(undefined, undefined),
      icon: Wallet,
      tone: 'purple',
    },
    {
      label: 'Siswa Aktif',
      value: formatCount(students.data?.active),
      helper: formatMetricComparison(
        students.data?.active,
        students.data?.previousMonthActive,
      ),
      icon: Users,
      tone: 'success',
      queries: [students],
    },
    {
      label: 'Invoice Pending',
      value: '27',
      helper: formatMetricComparison(undefined, undefined),
      icon: Receipt,
      tone: 'warning',
    },
    {
      label: 'Tentor Aktif',
      value: formatCount(tutors.data?.active),
      helper: formatMetricComparison(
        tutors.data?.active,
        tutors.data?.previousMonthActive,
      ),
      icon: Users,
      tone: 'success',
      queries: [tutors],
    },
    {
      label: 'Kelompok',
      value: formatCount(studyGroups.data?.total),
      helper: formatMetricComparison(
        studyGroups.data?.total,
        studyGroups.data?.previousMonthTotal,
      ),
      icon: BookOpen,
      tone: 'info',
      queries: [studyGroups],
    },
    {
      label: 'Presensi Hari Ini',
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
        'Jumlah sesi dengan presensi pada tanggal yang sama bulan lalu',
      icon: ClipboardCheck,
      tone: 'warning',
      queries: [savedAttendance, pendingAttendance],
    },
    {
      label: 'Laporan Belum',
      value: '14',
      helper: formatMetricComparison(undefined, undefined),
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

function formatCount(value: number | undefined) {
  return value === undefined ? undefined : numberFormatter.format(value)
}

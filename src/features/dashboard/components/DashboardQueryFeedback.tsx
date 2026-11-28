import {
  dashboardErrorMessage,
  isDashboardAccessError,
} from '../utils/dashboard-errors'

type DashboardQuery = {
  isPending: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}

export function DashboardQueryFeedback({
  query,
  label,
}: {
  query: DashboardQuery
  label: string
}) {
  if (query.error) {
    return (
      <div className="text-xs text-muted-foreground">
        <p role="alert">
          {label}: {dashboardErrorMessage(query.error)}
        </p>
        {!isDashboardAccessError(query.error) ? (
          <button
            type="button"
            className="mt-1 rounded-sm font-semibold text-primary-text underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => void query.refetch()}
            aria-label={`Coba muat ulang ${label}`}
          >
            Coba lagi
          </button>
        ) : null}
      </div>
    )
  }
  return query.isPending ? (
    <p role="status" className="text-xs text-muted-foreground">
      Memuat {label.toLowerCase()}...
    </p>
  ) : null
}

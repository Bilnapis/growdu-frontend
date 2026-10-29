import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import type { SessionListItem } from '@/features/class-sessions/api'
import { useDashboardTodaySchedule } from '../hooks/use-dashboard-data'
import {
  dashboardErrorMessage,
  isDashboardAccessError,
} from '../utils/dashboard-errors'

const sessionStatuses = {
  scheduled: { label: 'Belum selesai', variant: 'warning' },
  completed: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
} as const

export function DashboardTodaySchedule({ today }: { today: string }) {
  const query = useDashboardTodaySchedule(today)

  return (
    <section
      className="rounded-lg border bg-card p-[18px]"
      aria-labelledby="schedule-title"
      aria-busy={query.isPending}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="schedule-title" className="text-lg font-bold leading-[1.3]">
          Jadwal Hari Ini
        </h2>
        {!isDashboardAccessError(query.error) ? (
          <Link
            className="text-[13px] font-bold text-primary-text hover:underline"
            to={`/schedule?from=${today}`}
          >
            Lihat semua
          </Link>
        ) : null}
      </div>

      {query.isError ? (
        <div className="mt-3 text-[13px]">
          <p role="alert" className="text-muted-foreground">
            {dashboardErrorMessage(query.error)}
          </p>
          {!isDashboardAccessError(query.error) ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void query.refetch()}
            >
              Coba lagi
            </Button>
          ) : null}
        </div>
      ) : query.isSuccess && query.data.data.length === 0 ? (
        <p role="status" className="mt-3 text-[13px] text-muted-foreground">
          Tidak ada jadwal belajar hari ini.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left">
            <caption className="sr-only">Jadwal kelas hari ini</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Kelompok, tentor, dan ruang</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {query.isPending ? (
                <TableSkeletonRows
                  columns={3}
                  rows={3}
                  label="Memuat jadwal hari ini"
                  cellClassName="px-0 py-3"
                />
              ) : (
                query.data?.data.map((session) => (
                  <ScheduleRow key={session.id} session={session} />
                ))
              )}
            </tbody>
          </table>
          {query.data && query.data.meta.total > query.data.data.length ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Menampilkan {query.data.data.length} dari {query.data.meta.total}{' '}
              jadwal hari ini. Pilih Lihat semua untuk jadwal lainnya.
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}

function ScheduleRow({ session }: { session: SessionListItem }) {
  const status = sessionStatuses[session.status]

  return (
    <tr className="border-t first:border-t-0">
      <th
        scope="row"
        className="whitespace-nowrap py-3 pr-3 text-xs font-semibold text-foreground"
      >
        {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
      </th>
      <td className="py-3 pr-3">
        <Link
          className="text-[13px] font-semibold text-foreground hover:underline"
          to={`/schedule/${session.id}`}
        >
          {session.studyGroupName}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {session.tutorName} • {session.roomName ?? 'Ruang belum ditentukan'}
        </p>
      </td>
      <td className="py-3 text-right">
        <Badge variant={status.variant}>{status.label}</Badge>
      </td>
    </tr>
  )
}

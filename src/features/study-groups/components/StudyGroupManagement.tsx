import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Eye,
  PauseCircle,
  Pencil,
  UserCheck,
  UserX,
} from 'lucide-react'
import { TableRowActions } from '@/components/ui/table-row-actions'
import { Select } from '@/components/ui/select'
import { AddButton } from '@/components/ui/add-button'
import { Card } from '@/components/ui/card'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import { TablePagination } from '@/components/ui/table-pagination'
import {
  useStudyGroups,
  useStudyGroupsSummary,
  useUpdateStudyGroupStatus,
} from '@/features/study-groups/hooks/use-study-groups'
import type {
  StudyGroupFilters,
  StudyGroupListItem,
} from '@/features/study-groups/api/study-groups-api'

const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const PAGE_SIZE = 5
const tableCellClass = 'px-[18px] py-3'
export function StudyGroupManagement({
  filters,
  onFiltersChange,
}: {
  filters: StudyGroupFilters
  onFiltersChange: (filters: StudyGroupFilters) => void
}) {
  const navigate = useNavigate()
  const groups = useStudyGroups(filters)
  const summary = useStudyGroupsSummary()
  const status = useUpdateStudyGroupStatus()
  return (
    <div className="min-w-0 space-y-5 text-[var(--color-text)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            id="tutors-title"
            className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]"
          >
            Kelompok Belajar
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Kelola jadwal, tentor, dan siswa dalam kelompok belajar.
          </p>
        </div>
        <AddButton onClick={() => void navigate('/study-groups/new')}>
          Tambah Kelompok
        </AddButton>
      </header>
      <SummaryCardGrid
        label="Ringkasan kelompok belajar"
        isLoading={summary.isPending}
      >
        <SummaryCard
          icon={BookOpen}
          label="Total Kelompok"
          value={summary.data?.total}
          tone="primary"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Aktif"
          value={summary.data?.active}
          tone="success"
        />
        <SummaryCard
          icon={PauseCircle}
          label="Nonaktif"
          value={summary.data?.inactive}
          tone="muted"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Jadwal Hari Ini"
          value={summary.data?.schedulesToday}
          tone="warning"
        />
      </SummaryCardGrid>
      <Card className="mt-5 min-h-[560px] p-4 shadow-none sm:p-[18px]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label htmlFor="study-group-search" className="sr-only">
              Cari nama kelompok atau nama tentor
            </label>
            <DebouncedSearchInput
              id="study-group-search"
              name="search"
              value={filters.search}
              onSearch={(search) =>
                onFiltersChange({
                  ...filters,
                  page: 1,
                  search: search || undefined,
                })
              }
              placeholder="Cari nama kelompok atau nama tentor"
            />
          </div>
          <Select
            name="status"
            aria-label="Filter status kelompok belajar"
            value={filters.status ?? ''}
            onChange={(event) => {
              const status = event.target.value
              onFiltersChange({
                ...filters,
                page: 1,
                status:
                  status === 'active' || status === 'inactive'
                    ? status
                    : undefined,
              })
            }}
            className="h-10 min-w-[148px] text-[13px] font-semibold"
          >
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Select>
        </div>
        {groups.isError ? (
          <p className="p-8 text-center text-sm text-destructive" role="alert">
            Data belum dapat dimuat.
          </p>
        ) : null}
        {groups.isPending || groups.data ? (
          <div
            className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
            role="region"
            aria-label="Tabel kelompok belajar, geser untuk melihat semua kolom"
            tabIndex={0}
          >
            <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
              <caption className="sr-only">Daftar kelompok belajar</caption>
              <thead className="bg-slate-50 text-muted-foreground">
                <tr className="h-11">
                  <th scope="col" className="px-[18px] font-bold">
                    Nama Kelompok
                  </th>
                  <th scope="col" className="px-[18px] font-bold">
                    Mata Pelajaran
                  </th>
                  <th scope="col" className="px-[18px] font-bold">
                    Tentor
                  </th>
                  <th scope="col" className="px-[18px] font-bold">
                    Jadwal
                  </th>
                  <th scope="col" className="px-[18px] font-bold">
                    Siswa
                  </th>
                  <th scope="col" className="px-[18px] font-bold">
                    Status
                  </th>
                  <th scope="col" className="px-3 font-bold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-slate-100"
                aria-busy={groups.isPending}
              >
                {groups.isPending ? (
                  <TableSkeletonRows
                    columns={7}
                    rows={PAGE_SIZE}
                    label="Memuat kelompok belajar..."
                  />
                ) : null}
                {groups.data?.data.map((group) => (
                  <tr
                    className="h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                    key={group.id}
                  >
                    <th
                      scope="row"
                      className={`${tableCellClass} min-w-[150px] font-bold`}
                    >
                      <Link
                        className="hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        to={`/study-groups/${group.id}`}
                      >
                        {group.name}
                      </Link>
                    </th>
                    <td
                      className={`${tableCellClass} min-w-[150px] font-medium`}
                    >
                      {group.subjects.join(', ') || '—'}
                    </td>
                    <td
                      className={`${tableCellClass} min-w-[150px] font-semibold`}
                    >
                      {[
                        ...new Set(group.schedules.map((s) => s.tutorName)),
                      ].join(', ')}
                    </td>
                    <td
                      className={`${tableCellClass} min-w-[200px] font-medium`}
                    >
                      {group.schedules
                        .map(
                          (s) =>
                            `${days[s.dayOfWeek - 1]} ${s.startTime}–${s.endTime}`,
                        )
                        .join(', ')}
                    </td>
                    <td className={`${tableCellClass} font-semibold`}>
                      {group.studentCount}
                    </td>
                    <td className={tableCellClass}>
                      <span
                        className={
                          group.status === 'active'
                            ? 'inline-flex items-center rounded-[5px] bg-[var(--color-success-bg)] px-2 py-[5px] text-[11px] font-bold leading-[1.3] text-[var(--color-success-text)]'
                            : 'inline-flex items-center rounded-[5px] bg-[var(--color-gray-50)] px-2 py-[5px] text-[11px] font-bold leading-[1.3] text-[var(--color-muted)]'
                        }
                      >
                        {group.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="w-[52px] px-3 py-3">
                      <StudyGroupRowActions
                        group={group}
                        statusPending={status.isPending}
                        onStatusChange={() => {
                          if (window.confirm(`Ubah status ${group.name}?`)) {
                            status.mutate({
                              id: group.id,
                              status:
                                group.status === 'active'
                                  ? 'inactive'
                                  : 'active',
                            })
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {groups.data?.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Belum ada kelompok belajar. Tambahkan kelompok pertama.
          </p>
        ) : null}
        {groups.data && groups.data.data.length > 0 ? (
          <TablePagination
            meta={groups.data.meta}
            itemLabel="kelompok"
            ariaLabel="Halaman kelompok"
            onPageChange={(page) => onFiltersChange({ ...filters, page })}
          />
        ) : null}
      </Card>
    </div>
  )
}

function StudyGroupRowActions({
  group,
  statusPending,
  onStatusChange,
}: {
  group: StudyGroupListItem
  statusPending: boolean
  onStatusChange: () => void
}) {
  const isActive = group.status === 'active'

  return (
    <TableRowActions
      label={group.name}
      actions={[
        { label: 'Lihat detail', icon: Eye, to: `/study-groups/${group.id}` },
        { label: 'Ubah data', icon: Pencil, to: `/study-groups/${group.id}/edit` },
        {
          label: isActive ? 'Nonaktifkan kelompok' : 'Aktifkan kelompok',
          icon: isActive ? UserX : UserCheck,
          tone: isActive ? 'danger' : 'success',
          disabled: statusPending,
          onSelect: onStatusChange,
        },
      ]}
    />
  )
}

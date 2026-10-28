import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SlidersHorizontal, UserRoundX, UsersRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'

import {
  getStaffTenantId,
  getStaffError,
  type StaffStatus,
  type StaffMember,
} from '@/features/staff/api/staff-api'
import { StaffActionDialog } from './StaffActionDialog'
import { StaffRowActions } from './StaffRowActions'
import { useStaff } from '@/features/staff/hooks/use-staff'
import { operatorMenus } from '@/lib/menu-access'

export function StaffManagement() {
  const [action, setAction] = useState<{
    staff: StaffMember
    mode: 'detail' | 'edit' | 'status'
  } | null>(null)
  const [actionMessage, setActionMessage] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | StaffStatus>('all')

  const [page, setPage] = useState(1)
  const tenantId = getStaffTenantId()
  const location = useLocation()
  const navigate = useNavigate()
  const routeState: unknown = location.state
  const wasCreated =
    typeof routeState === 'object' &&
    routeState !== null &&
    'staffCreated' in routeState &&
    routeState.staffCreated === true
  const staffQuery = useStaff(tenantId, {
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: status === 'all' ? undefined : status,
  })
  const activeQuery = useStaff(tenantId, {
    page: 1,
    limit: 1,
    status: 'active',
  })
  const inactiveQuery = useStaff(tenantId, {
    page: 1,
    limit: 1,
    status: 'inactive',
  })
  const filteredStaff = staffQuery.data?.data ?? []
  const total = staffQuery.data?.meta.total ?? 0
  const totalPages = staffQuery.data?.meta.totalPages ?? 0

  if (!tenantId)
    return (
      <p role="alert">
        Hanya pemilik bimbel yang dapat mengelola pegawai. Pilih bimbel terlebih
        dahulu.
      </p>
    )

  return (
    <section aria-labelledby="staff-page-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1
            id="staff-page-title"
            className="text-[26px] font-bold leading-tight"
          >
            Data Pegawai
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Kelola daftar akun pegawai, status, dan akses menu.
          </p>
        </div>
        <AddButton onClick={() => void navigate('/staff/new')}>
          Tambah Pegawai
        </AddButton>
      </header>

      {actionMessage ? (
        <p
          role="status"
          className="mt-4 rounded-lg bg-[var(--color-success-bg)] p-3 text-sm text-[var(--color-success)]"
        >
          {actionMessage}
        </p>
      ) : null}
      {wasCreated && !actionMessage ? (
        <p
          role="status"
          className="mt-4 rounded-lg bg-[var(--color-success-bg)] p-3 text-sm text-[var(--color-success)]"
        >
          Akun pegawai berhasil dibuat.
        </p>
      ) : null}
      <div className="mt-[22px] grid gap-[14px] sm:grid-cols-2">
        <SummaryCard
          label="Pegawai Aktif"
          value={
            activeQuery.isError ? '—' : (activeQuery.data?.meta.total ?? '…')
          }
          icon={<UsersRound className="h-[18px] w-[18px]" aria-hidden="true" />}
          tone="success"
        />
        <SummaryCard
          label="Pegawai Nonaktif"
          value={
            inactiveQuery.isError
              ? '—'
              : (inactiveQuery.data?.meta.total ?? '…')
          }
          icon={<UserRoundX className="h-[18px] w-[18px]" aria-hidden="true" />}
          tone="muted"
        />
      </div>

      <div className="mt-[22px] rounded-lg border bg-card p-[18px] shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label htmlFor="staff-search" className="sr-only">
              Cari pegawai
            </label>
            <DebouncedSearchInput
              id="staff-search"
              value={search}
              onSearch={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Cari nama atau email pegawai..."
            />
          </div>
          <div className="relative sm:w-36">
            <SlidersHorizontal
              className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="staff-status" className="sr-only">
              Filter status pegawai
            </label>
            <select
              id="staff-status"
              value={status}
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === 'all' ||
                  value === 'active' ||
                  value === 'inactive'
                ) {
                  setStatus(value)
                  setPage(1)
                }
              }}
              className="h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-10 pr-3 text-[13px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {staffQuery.isError ? (
          <div role="alert" className="mt-4 text-sm text-destructive">
            <p>{getStaffError(staffQuery.error)}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void staffQuery.refetch()}
            >
              Coba lagi
            </Button>
          </div>
        ) : null}
        {activeQuery.isError || inactiveQuery.isError ? (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            Ringkasan pegawai belum dapat dimuat.
          </p>
        ) : null}
        <div
          aria-busy={staffQuery.isFetching}
          className="mt-[14px] overflow-x-auto rounded-md border"
        >
          <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
            <caption className="sr-only">Daftar pegawai bimbel</caption>
            <thead className="bg-slate-50 text-muted-foreground">
              <tr className="h-11">
                <th scope="col" className="w-[21%] px-[26px] font-bold">
                  Nama
                </th>
                <th scope="col" className="w-[26%] px-[26px] font-bold">
                  Email
                </th>
                <th scope="col" className="w-[29%] px-[26px] font-bold">
                  Akses menu
                </th>
                <th scope="col" className="w-[11%] px-[26px] font-bold">
                  Status
                </th>
                <th scope="col" className="px-3 font-bold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-slate-100"
              aria-busy={staffQuery.isPending}
            >
              {staffQuery.isPending ? (
                <TableSkeletonRows
                  columns={5}
                  label="Memuat pegawai..."
                  cellClassName="px-[26px]"
                />
              ) : null}
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="h-[70px] bg-card">
                  <td className="px-[26px] font-bold text-foreground">
                    {staff.name}
                  </td>
                  <td className="px-[26px] font-medium text-foreground">
                    {staff.email}
                  </td>
                  <td className="px-[26px] font-medium text-foreground">
                    {operatorMenus
                      .filter((menu) => staff.menuPermissions.includes(menu.id))
                      .map((menu) => menu.label)
                      .join(', ') || 'Belum ada akses menu'}
                  </td>
                  <td className="px-[26px]">
                    <StatusBadge status={staff.status} />
                  </td>
                  <td className="px-3">
                    <StaffRowActions
                      staff={staff}
                      onAction={(mode) => {
                        if (mode === 'detail') {
                          void navigate(`/staff/${staff.id}`)
                          return
                        }
                        setActionMessage('')
                        setAction({ staff, mode })
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!staffQuery.isPending &&
          !staffQuery.isError &&
          filteredStaff.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Pegawai yang dicari tidak ditemukan.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan{' '}
            {filteredStaff.length === 0
              ? '0'
              : `${(page - 1) * 10 + 1}-${(page - 1) * 10 + filteredStaff.length}`}{' '}
            dari {total} pegawai
          </p>
          <nav
            className="flex items-center gap-1"
            aria-label="Pagination pegawai"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || staffQuery.isFetching}
              onClick={() => setPage((current) => current - 1)}
            >
              Sebelumnya
            </Button>
            <span className="px-2" aria-current="page">
              {page}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page >= totalPages ||
                staffQuery.isFetching ||
                staffQuery.isError
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Berikutnya
            </Button>
          </nav>
        </div>
      </div>

      {action ? (
        <StaffActionDialog
          staff={action.staff}
          mode={action.mode}
          tenantId={tenantId}
          onClose={() => setAction(null)}
          onSuccess={() => {
            setActionMessage(
              action.mode === 'edit'
                ? 'Data dan hak akses menu pegawai berhasil diperbarui.'
                : 'Status pegawai berhasil diperbarui.',
            )
            if (
              action.mode === 'status' &&
              status !== 'all' &&
              filteredStaff.length === 1 &&
              page > 1
            )
              setPage((current) => current - 1)
            setAction(null)
          }}
        />
      ) : null}
    </section>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  tone: 'success' | 'muted'
}) {
  return (
    <section
      className="rounded-lg border bg-card p-4 shadow-sm"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={
            tone === 'success'
              ? 'grid h-8 w-8 place-items-center rounded-md bg-[var(--color-success-bg)] text-[var(--color-success)]'
              : 'grid h-8 w-8 place-items-center rounded-md bg-slate-50 text-muted-foreground'
          }
        >
          {icon}
        </span>
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1.5 text-[26px] font-extrabold leading-[1.3] text-foreground">
        {value}
      </p>
    </section>
  )
}

function StatusBadge({ status }: { status: StaffStatus }) {
  const isActive = status === 'active'

  return (
    <span
      className={
        isActive
          ? 'inline-flex rounded-full bg-[var(--color-success-bg)] px-2.5 py-[5px] text-xs font-bold leading-[1.2] text-[var(--color-success)]'
          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-[5px] text-xs font-bold leading-[1.2] text-muted-foreground'
      }
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}

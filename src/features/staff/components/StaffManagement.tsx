import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SlidersHorizontal, UserRoundX, UsersRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { Card } from '@/components/ui/card'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import { TablePagination } from '@/components/ui/table-pagination'
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

const pageSize = 5

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
    limit: pageSize,
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
  const meta = staffQuery.data?.meta

  if (!tenantId)
    return (
      <p role="alert">
        Hanya pemilik bimbel yang dapat mengelola pegawai. Pilih bimbel terlebih
        dahulu.
      </p>
    )

  return (
    <section className="min-w-0" aria-labelledby="staff-page-title">
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
      <SummaryCardGrid
        label="Ringkasan pegawai"
        columns={2}
        isLoading={activeQuery.isPending || inactiveQuery.isPending}
      >
        <SummaryCard
          label="Pegawai Aktif"
          value={
            activeQuery.isError ? '—' : (activeQuery.data?.meta.total ?? '…')
          }
          icon={UsersRound}
          tone="success"
        />
        <SummaryCard
          label="Pegawai Nonaktif"
          value={
            inactiveQuery.isError
              ? '—'
              : (inactiveQuery.data?.meta.total ?? '…')
          }
          icon={UserRoundX}
          tone="muted"
        />
      </SummaryCardGrid>

      <Card className="mt-5 min-h-[560px] p-4 shadow-none sm:p-[18px]">
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
          className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
          role="region"
          aria-label="Tabel pegawai, geser untuk melihat semua kolom"
          tabIndex={0}
        >
          <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
            <caption className="sr-only">Daftar pegawai bimbel</caption>
            <thead className="bg-slate-50 text-muted-foreground">
              <tr className="h-11">
                <th scope="col" className="px-[18px] font-bold">
                  Nama
                </th>
                <th scope="col" className="px-[18px] font-bold">
                  Email
                </th>
                <th scope="col" className="px-[18px] font-bold">
                  Akses menu
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
              aria-busy={staffQuery.isPending}
            >
              {staffQuery.isPending ? (
                <TableSkeletonRows
                  columns={5}
                  rows={pageSize}
                  label="Memuat pegawai..."
                />
              ) : null}
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                >
                  <th
                    scope="row"
                    className="min-w-[135px] px-[18px] py-3 font-bold"
                  >
                    {staff.name}
                  </th>
                  <td className="min-w-[180px] break-words px-[18px] py-3 font-medium">
                    {staff.email}
                  </td>
                  <td className="min-w-[210px] px-[18px] py-3 font-medium">
                    {operatorMenus
                      .filter((menu) => staff.menuPermissions.includes(menu.id))
                      .map((menu) => menu.label)
                      .join(', ') || 'Belum ada akses menu'}
                  </td>
                  <td className="px-[18px] py-3">
                    <StatusBadge status={staff.status} />
                  </td>
                  <td className="relative px-3 py-3">
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

        {meta && filteredStaff.length > 0 ? (
          <TablePagination
            meta={meta}
            itemLabel="pegawai"
            ariaLabel="Halaman pegawai"
            onPageChange={setPage}
          />
        ) : null}
      </Card>

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

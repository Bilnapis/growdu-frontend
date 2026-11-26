import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Banknote, CalendarClock, Settings, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import { TablePagination } from '@/components/ui/table-pagination'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import type { PayrollFilters } from './api'
import { usePayrolls, usePayrollSettings, usePayrollSummary } from './hooks'
import { dateLabel, rangeLabel, rupiah } from './format'
import { PayrollBadge, PayrollError } from './PayrollShared'
import { GeneratePayrollDialog, PayrollSettingsDialog } from './PayrollDialogs'
import { PayrollRowActions } from './PayrollRowActions'

const cellClass = 'px-[18px] py-3'

export function PayrollManagement() {
  const [params, setParams] = useSearchParams()
  const [dialog, setDialog] = useState<'settings' | 'generate' | null>(null)
  const [message, setMessage] = useState('')
  const status = params.get('status')
  const filters: PayrollFilters = {
    page: Math.max(1, Number(params.get('page')) || 1),
    limit: 20,
    search: params.get('search') || undefined,
    month: params.get('month') || undefined,
    tutorId: params.get('tutorId') || undefined,
    status:
      status === 'paid' || status === 'unpaid' || status === 'overdue'
        ? status
        : undefined,
  }
  const list = usePayrolls(filters)
  const summary = usePayrollSummary({
    ...filters,
    page: undefined,
    limit: undefined,
    status: undefined,
  })
  const settings = usePayrollSettings()
  function filter(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }
  return (
    <div className="payroll">
      <header className="payroll-header">
        <div>
          <h1>Penggajian Tentor</h1>
          <p>
            Kelola gaji tentor berdasarkan sesi mengajar dan status pembayaran.
          </p>
        </div>
        <div className="payroll-actions">
          <Button
            size="sm"
            variant="outline"
            disabled={!settings.data}
            onClick={() => setDialog('settings')}
          >
            <Settings size={15} aria-hidden="true" />
            Pengaturan
          </Button>
          <AddButton
            disabled={!settings.data?.configured}
            onClick={() => setDialog('generate')}
          >
            Buat Penggajian
          </AddButton>
        </div>
      </header>
      {message ? (
        <p role="status" className="mb-4 text-sm text-[var(--color-success)]">
          {message}
        </p>
      ) : null}
      {settings.data && !settings.data.configured ? (
        <div className="payroll-notice mb-4">
          Atur tanggal penggajian untuk menyiapkan siklus pertama.{' '}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialog('settings')}
          >
            Atur Tanggal
          </Button>
        </div>
      ) : null}
      {settings.isError ? (
        <PayrollError
          error={settings.error}
          retry={() => void settings.refetch()}
        />
      ) : null}
      {summary.isError ? (
        <PayrollError
          error={summary.error}
          retry={() => void summary.refetch()}
        />
      ) : null}
      <SummaryCardGrid
        label="Ringkasan penggajian tentor"
        isLoading={summary.isPending}
      >
        <SummaryCard
          icon={Wallet}
          label="Total Penggajian"
          value={summary.data ? rupiah(summary.data.totalAmount) : null}
        />
        <SummaryCard
          icon={Banknote}
          label="Sudah Dibayar"
          tone="success"
          value={summary.data?.paid}
        />
        <SummaryCard
          icon={Wallet}
          label="Belum Dibayar"
          tone="warning"
          value={summary.data?.unpaid}
        />
        <SummaryCard
          icon={CalendarClock}
          label="Terlambat"
          tone="danger"
          value={summary.data?.overdue}
        />
      </SummaryCardGrid>
      <Card
        className="mt-5 min-h-[560px] min-w-0 p-4 shadow-none sm:p-[18px]"
        role="region"
        aria-label="Daftar penggajian"
      >
        <form
          className="flex flex-col gap-3 xl:flex-row xl:items-center"
          onSubmit={(event) => {
            event.preventDefault()
            const search = new FormData(event.currentTarget).get('search')
            filter('search', typeof search === 'string' ? search.trim() : '')
          }}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="payroll-search" className="sr-only">
              Cari nomor slip gaji atau tentor
            </Label>
            <DebouncedSearchInput
              id="payroll-search"
              name="search"
              placeholder="Cari nomor slip gaji atau tentor..."
              value={filters.search ?? ''}
              onSearch={(value) => filter('search', value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-0">
              <Label htmlFor="payroll-filter-month" className="sr-only">
                Bulan penggajian
              </Label>
              <Input
                id="payroll-filter-month"
                type="month"
                className="h-10 w-full text-[13px] font-semibold sm:w-auto"
                value={filters.month ?? ''}
                onChange={(e) => filter('month', e.target.value)}
              />
            </div>
            <div className="relative">
              <Label htmlFor="payroll-filter-status" className="sr-only">
                Filter status penggajian
              </Label>
              <Select
                id="payroll-filter-status"
                className="h-10 min-w-28 text-[13px] font-semibold"
                value={filters.status ?? ''}
                onChange={(e) => filter('status', e.target.value)}
              >
                <option value="">Status</option>
                <option value="paid">Sudah Dibayar</option>
                <option value="unpaid">Belum Dibayar</option>
                <option value="overdue">Terlambat</option>
              </Select>
            </div>
          </div>
        </form>
        {list.isError ? (
          <PayrollError error={list.error} retry={() => void list.refetch()} />
        ) : null}
        {list.isPending || list.data ? (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel penggajian, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar penggajian tentor</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    {[
                      'No. Penggajian / Periode',
                      'Tentor',
                      'Total Sesi',
                      'Tarif Dasar',
                      'Total Gaji',
                      'Status',
                      'Aksi',
                    ].map((label) => (
                      <th
                        scope="col"
                        key={label}
                        className={
                          label === 'Aksi'
                            ? 'px-3 font-bold'
                            : 'px-[18px] font-bold'
                        }
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={list.isPending}
                >
                  {list.isPending ? (
                    <TableSkeletonRows
                      columns={7}
                      label="Memuat daftar penggajian..."
                    />
                  ) : null}
                  {list.data?.data.map((p) => (
                    <tr
                      key={p.id}
                      className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                    >
                      <th scope="row" className={`${cellClass} min-w-[235px]`}>
                        <Link
                          className="font-bold text-primary-text hover:underline"
                          to={`/payroll/${p.id}`}
                        >
                          {p.number}
                        </Link>
                        <span className="mt-1 block font-medium text-muted-foreground">
                          {rangeLabel(p)}
                        </span>
                        <span className="mt-1 block font-medium text-muted-foreground">
                          Jatuh tempo {dateLabel(p.payDate)}
                        </span>
                      </th>
                      <td
                        className={`${cellClass} min-w-[135px] font-semibold`}
                      >
                        {p.tutorName}
                      </td>
                      <td
                        className={`${cellClass} whitespace-nowrap font-medium`}
                      >
                        {p.totalSessions} sesi
                      </td>
                      <td
                        className={`${cellClass} whitespace-nowrap font-medium`}
                      >
                        {p.baseRate
                          ? `${rupiah(p.baseRate)} / sesi`
                          : 'Tarif bervariasi'}
                      </td>
                      <td
                        className={`${cellClass} whitespace-nowrap font-semibold`}
                      >
                        {rupiah(p.total)}
                      </td>
                      <td className={cellClass}>
                        <PayrollBadge status={p.status} />
                      </td>
                      <td className="relative px-3 py-3">
                        <PayrollRowActions payroll={p} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.data && list.data.data.length === 0 ? (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <Wallet
                    className="mx-auto h-7 w-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h2 className="mt-3 font-semibold">
                    Belum ada data penggajian
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {Object.values(filters).some((v) => typeof v === 'string')
                      ? 'Tidak ada penggajian yang sesuai dengan filter.'
                      : 'Buat slip gaji baru untuk tentor Anda.'}
                  </p>
                  <AddButton
                    className="mt-4"
                    disabled={!settings.data?.configured}
                    onClick={() => setDialog('generate')}
                  >
                    Buat Penggajian
                  </AddButton>
                </div>
              </div>
            ) : null}
            {list.data && list.data.data.length > 0 ? (
              <TablePagination
                meta={list.data.meta}
                itemLabel="penggajian"
                ariaLabel="Halaman penggajian"
                onPageChange={(page) => filter('page', String(page))}
              />
            ) : null}
          </>
        ) : null}
      </Card>
      {dialog === 'settings' && settings.data ? (
        <PayrollSettingsDialog
          settings={settings.data}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'generate' && settings.data ? (
        <GeneratePayrollDialog
          settings={settings.data}
          onClose={() => setDialog(null)}
          onGenerated={setMessage}
        />
      ) : null}
    </div>
  )
}

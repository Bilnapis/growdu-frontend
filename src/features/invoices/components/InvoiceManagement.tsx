import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Banknote,
  CalendarClock,
  Eye,
  Pencil,
  ReceiptText,
  Settings,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { Select } from '@/components/ui/select'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import { TablePagination } from '@/components/ui/table-pagination'
import { TableRowActions } from '@/components/ui/table-row-actions'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import {
  useInvoiceOptions,
  useInvoices,
  useInvoiceSettings,
  useInvoiceSummary,
} from '../hooks/use-invoices'
import { billingToday, dateLabel, periodLabel, rupiah } from '../invoice-format'
import type { InvoiceFilters, InvoiceListItem } from '../api/invoices-api'
import { InvoiceError, InvoiceStatusBadge } from './InvoiceShared'
import { GenerateInvoicesDialog, InvoiceSettingsDialog } from './InvoiceDialogs'
import { InvoicePaymentDialog } from './InvoicePaymentForm'
import '../invoices.css'

export function InvoiceManagement() {
  const [params, setParams] = useSearchParams()
  const [dialog, setDialog] = useState<'settings' | 'generate' | null>(null)
  const [message, setMessage] = useState('')
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null)
  const rawStatus = params.get('status')
  const month = params.get('period') ?? billingToday().slice(0, 7)
  const filters: InvoiceFilters = {
    page: Math.max(1, Number(params.get('page')) || 1),
    limit: 20,
    search: params.get('search') || undefined,
    period: month || undefined,
    status:
      rawStatus === 'paid' || rawStatus === 'unpaid' || rawStatus === 'overdue'
        ? rawStatus
        : undefined,
    groupId: params.get('groupId') || undefined,
    studentId: params.get('studentId') || undefined,
  }
  const invoices = useInvoices(filters)
  const summary = useInvoiceSummary({
    ...filters,
    page: undefined,
    limit: undefined,
    status: undefined,
  })
  const options = useInvoiceOptions()
  const settings = useInvoiceSettings()
  function filter(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set(name, value)
      if (name !== 'page') next.delete('page')
      return next
    })
  }
  return (
    <div className="invoices">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]">
            Invoice SPP
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Kelola tagihan SPP bulanan siswa dan status pembayaran.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled={!settings.data}
            onClick={() => setDialog('settings')}
          >
            <Settings size={15} aria-hidden="true" />
            Pengaturan
          </Button>
          <AddButton
            disabled={!settings.data}
            onClick={() => setDialog('generate')}
          >
            Buat Invoice
          </AddButton>
        </div>
      </header>
      {message ? (
        <p className="invoice-success" role="status">
          {message}
        </p>
      ) : null}
      {settings.isError ? (
        <InvoiceError
          error={settings.error}
          retry={() => void settings.refetch()}
        />
      ) : null}
      {summary.isError ? (
        <InvoiceError
          error={summary.error}
          retry={() => void summary.refetch()}
        />
      ) : null}
      <SummaryCardGrid
        label="Ringkasan invoice SPP"
        isLoading={summary.isPending}
      >
        <SummaryCard
          icon={ReceiptText}
          label="Total Tagihan"
          value={summary.data ? rupiah(summary.data.totalAmount) : null}
        />
        <SummaryCard
          icon={Banknote}
          label="Lunas"
          value={summary.data?.paid}
          tone="success"
        />
        <SummaryCard
          icon={Wallet}
          label="Belum Bayar"
          value={summary.data?.unpaid}
          tone="warning"
        />
        <SummaryCard
          icon={CalendarClock}
          label="Terlambat"
          value={summary.data?.overdue}
          tone="danger"
        />
      </SummaryCardGrid>
      <section
        className="mt-5 min-h-[560px] rounded-lg border bg-card p-4 text-card-foreground shadow-none sm:p-[18px]"
        aria-label="Daftar invoice"
        aria-busy={invoices.isPending}
      >
        <div className="invoice-toolbar">
          <div className="invoice-search">
            <DebouncedSearchInput
              value={filters.search ?? ''}
              onSearch={(value) => filter('search', value)}
              placeholder="Cari nomor invoice atau siswa..."
              aria-label="Cari nomor invoice atau siswa"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="invoice-period">
              Periode
            </label>
            <input
              id="invoice-period"
              className="invoice-select"
              type="month"
              value={month}
              onChange={(event) => filter('period', event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => filter('period', '')}
          >
            Semua periode
          </Button>
          <Select
            className="h-10 min-w-[176px] text-[13px]"
            aria-label="Filter status invoice"
            value={filters.status ?? ''}
            onChange={(event) => filter('status', event.target.value)}
          >
            <option value="">Semua status</option>
            <option value="paid">Lunas</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="overdue">Terlambat</option>
          </Select>
          <Select
            className="h-10 min-w-[176px] text-[13px]"
            aria-label="Filter kelompok belajar"
            value={filters.groupId ?? ''}
            onChange={(event) => filter('groupId', event.target.value)}
          >
            <option value="">Semua kelompok</option>
            {options.data?.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
        </div>
        {filters.studentId ? (
          <Button
            variant="outline"
            size="sm"
            className="mb-3"
            onClick={() => filter('studentId', '')}
          >
            Hapus filter siswa
          </Button>
        ) : null}
        {options.isError ? (
          <div className="mt-[14px]">
            <InvoiceError
              error={options.error}
              retry={() => void options.refetch()}
            />
          </div>
        ) : null}
        {invoices.isError ? (
          <div className="mt-[14px]">
            <InvoiceError
              error={invoices.error}
              retry={() => void invoices.refetch()}
            />
          </div>
        ) : !invoices.isPending && invoices.data.data.length === 0 ? (
          <div className="invoice-empty">
            <div className="invoice-empty-icon">
              <ReceiptText size={28} aria-hidden="true" />
            </div>
            <h2>Belum ada invoice</h2>
            <p>
              Tidak ada invoice yang sesuai filter. Invoice otomatis diterbitkan
              setiap bulan untuk siswa aktif yang sudah memiliki tarif SPP.
            </p>
            <AddButton
              disabled={!settings.data}
              onClick={() => setDialog('generate')}
            >
              Generate Invoice
            </AddButton>
          </div>
        ) : (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel invoice SPP, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar invoice SPP siswa</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    {[
                      'No. Invoice',
                      'Periode',
                      'Nama Siswa',
                      'Kelompok Belajar',
                      'Nominal',
                      'Jatuh Tempo',
                      'Status',
                      'Aksi',
                    ].map((title) => (
                      <th
                        key={title}
                        scope="col"
                        className={
                          title === 'Aksi'
                            ? 'px-3 font-bold'
                            : 'px-[18px] font-bold'
                        }
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={invoices.isPending}
                >
                  {invoices.isPending ? (
                    <TableSkeletonRows
                      columns={8}
                      label="Memuat data invoice SPP..."
                    />
                  ) : null}
                  {invoices.data?.data.map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      onConfirmPayment={() => setPaymentInvoiceId(invoice.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {invoices.data && invoices.data.data.length > 0 ? (
              <TablePagination
                meta={invoices.data.meta}
                itemLabel="invoice"
                ariaLabel="Halaman invoice"
                onPageChange={(page) => filter('page', String(page))}
              />
            ) : null}
          </>
        )}
      </section>
      {paymentInvoiceId ? (
        <InvoicePaymentDialog
          id={paymentInvoiceId}
          onClose={() => setPaymentInvoiceId(null)}
        />
      ) : null}
      {dialog === 'settings' && settings.data ? (
        <InvoiceSettingsDialog
          settings={settings.data}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'generate' && settings.data ? (
        <GenerateInvoicesDialog
          settings={settings.data}
          onClose={() => setDialog(null)}
          onGenerated={setMessage}
        />
      ) : null}
    </div>
  )
}

function InvoiceRow({
  invoice,
  onConfirmPayment,
}: {
  invoice: InvoiceListItem
  onConfirmPayment: () => void
}) {
  return (
    <tr className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground">
      <th scope="row" className="min-w-[160px] px-[18px] py-3 font-bold">
        <Link
          className="hover:underline focus-visible:underline"
          to={`/invoices/${invoice.id}`}
        >
          {invoice.number}
        </Link>
      </th>
      <td className="min-w-[160px] px-[18px] py-3 font-medium">
        {periodLabel(invoice.period)}
      </td>
      <td className="min-w-[140px] px-[18px] py-3 font-medium">
        {invoice.studentName}
      </td>
      <td className="min-w-[160px] px-[18px] py-3 font-medium">
        {invoice.groups.map((group) => group.name).join(', ') || '—'}
      </td>
      <td className="min-w-[140px] whitespace-nowrap px-[18px] py-3 font-semibold">
        {rupiah(invoice.total)}
      </td>
      <td className="min-w-[130px] whitespace-nowrap px-[18px] py-3 font-medium">
        {dateLabel(invoice.dueDate)}
      </td>
      <td className="px-[18px] py-3">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="px-3 py-3">
        <TableRowActions
          label={invoice.number}
          actions={[
            { label: 'Lihat detail', icon: Eye, to: `/invoices/${invoice.id}` },
            invoice.status === 'paid'
              ? {
                  label: 'Ubah status',
                  icon: Pencil,
                  to: `/invoices/${invoice.id}?action=reverse`,
                }
              : {
                  label: 'Ubah status',
                  icon: Pencil,
                  onSelect: onConfirmPayment,
                },
          ]}
        />
      </td>
    </tr>
  )
}

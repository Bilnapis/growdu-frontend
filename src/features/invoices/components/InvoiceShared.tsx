import { useState, type ReactNode } from 'react'
import { Download, ReceiptText } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  getInvoicePdf,
  type InvoiceDetail,
  type InvoiceStatus,
} from '../api/invoices-api'
import { dateLabel, invoiceError, periodLabel, rupiah } from '../invoice-format'

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`invoice-badge invoice-badge-${status}`}>
      {status === 'paid'
        ? 'Lunas'
        : status === 'overdue'
          ? 'Terlambat'
          : 'Belum Bayar'}
    </span>
  )
}
export function InvoicePanel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="invoice-panel">
      <header className="invoice-panel-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
export function InvoiceError({
  error,
  retry,
}: {
  error: unknown
  retry?: () => void
}) {
  return (
    <div className="invoice-feedback" role="alert">
      <p>{invoiceError(error)}</p>
      {retry ? (
        <Button type="button" variant="outline" size="sm" onClick={retry}>
          Muat ulang
        </Button>
      ) : null}
    </div>
  )
}
export function InvoiceLoading() {
  return (
    <div role="status" className="invoice-loading">
      <ReceiptText aria-hidden="true" />
      <p>Memuat invoice SPP...</p>
      <div className="invoice-skeleton motion-safe:animate-pulse" />
    </div>
  )
}
export function InvoiceChargeTable({
  invoice,
  showTotal = true,
}: {
  invoice: Pick<InvoiceDetail, 'items' | 'total'>
  showTotal?: boolean
}) {
  return (
    <>
      <div className="invoice-table-scroll">
        <table className="invoice-charge-table">
          <thead>
            <tr>
              <th scope="col">Layanan</th>
              <th scope="col">Kuantitas</th>
              <th scope="col">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>
                  {item.kind === 'discount'
                    ? '—'
                    : `${item.quantity}${item.kind === 'tuition' ? ' Bulan' : ''}`}
                </td>
                <td>{rupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showTotal ? (
        <div className="invoice-total">
          <span>Total Pembayaran:</span>
          <strong>{rupiah(invoice.total)}</strong>
        </div>
      ) : null}
    </>
  )
}
export function InvoiceBrief({
  invoice,
  showTotal = true,
}: {
  invoice: InvoiceDetail
  showTotal?: boolean
}) {
  return (
    <div className="invoice-brief">
      <div className="invoice-brief-title">
        <div>
          <span>Kode Invoice</span>
          <strong>{invoice.number}</strong>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>
      <dl className="invoice-brief-fields">
        <div>
          <dt>Nama Siswa</dt>
          <dd>{invoice.studentName}</dd>
        </div>
        <div>
          <dt>Kelompok Belajar</dt>
          <dd>
            {invoice.groups.map((g) => g.name).join(', ') ||
              'Belum ada kelompok'}
          </dd>
        </div>
        <div>
          <dt>Periode SPP</dt>
          <dd>{periodLabel(invoice.period)}</dd>
        </div>
      </dl>
      <InvoiceChargeTable invoice={invoice} showTotal={showTotal} />
    </div>
  )
}
export function InvoicePdfButton({
  id,
  number,
}: {
  id: string
  number: string
}) {
  const [error, setError] = useState<unknown>(null)
  const mutation = useMutation({
    mutationFn: () => getInvoicePdf(id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${number}.pdf`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
    onError: setError,
  })
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => {
          setError(null)
          mutation.mutate()
        }}
      >
        <Download size={15} aria-hidden="true" />
        {mutation.isPending ? 'Menyiapkan PDF...' : 'Unduh PDF'}
      </Button>
      {error ? (
        <p role="alert" className="invoice-error-text">
          {invoiceError(error)}
        </p>
      ) : null}
    </div>
  )
}
export function InvoiceMetadata({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <dl className="invoice-metadata">
      {[
        ['Nomor Invoice', invoice.number],
        ['Periode Invoice', periodLabel(invoice.period)],
        ['Tanggal Terbit', dateLabel(invoice.issuedDate)],
        ['Jatuh Tempo', dateLabel(invoice.dueDate)],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

import { DetailBackLink } from '@/components/ui/detail-back-link'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Pencil, ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody } from '@/components/ui/dialog'
import { getPaymentProof, type InvoiceDetail } from '../api/invoices-api'
import { useInvoice } from '../hooks/use-invoices'
import {
  dateLabel,
  invoiceError,
  periodLabel,
  rupiah,
  timeLabel,
} from '../invoice-format'
import {
  InvoiceChargeTable,
  InvoiceError,
  InvoiceLoading,
  InvoiceMetadata,
  InvoicePanel,
  InvoicePdfButton,
} from './InvoiceShared'
import { EditInvoiceDialog, ReverseInvoiceDialog } from './InvoiceDialogs'
import { InvoicePaymentDialog } from './InvoicePaymentForm'
import '../invoices.css'

const eventLabels: Record<string, string> = {
  issued: 'Invoice diterbitkan',
  items_updated: 'Rincian tagihan diperbarui',
  payment_recorded: 'Pembayaran dicatat',
  payment_reversed: 'Pencatatan pelunasan dibatalkan',
  student_status_changed: 'Status siswa diperbarui',
}

export function InvoiceDetailView({ id }: { id: string }) {
  const query = useInvoice(id)
  const [editing, setEditing] = useState(false)
  const [params, setParams] = useSearchParams()
  const invoice = query.data
  function closeAction() {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('action')
        return next
      },
      { replace: true },
    )
  }
  return (
    <div className="invoices">
      {query.isPending ? (
        <InvoiceLoading />
      ) : !invoice || query.isError ? (
        <InvoiceError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <DetailBackLink to="/invoices">
            Kembali ke daftar invoice SPP
          </DetailBackLink>
          <header className="invoice-page-header">
            <h1>Detail Invoice</h1>
            <div className="invoice-actions">
              <InvoicePdfButton id={id} number={invoice.number} />
              {invoice.status === 'paid' ? (
                <Button
                  size="sm"
                  onClick={() => setParams({ action: 'reverse' })}
                >
                  Ubah Status
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setParams({ action: 'payment' })}
                >
                  Tandai Lunas
                </Button>
              )}
            </div>
          </header>
          <div className="invoice-detail-grid">
            <div className="invoice-stack">
              <InvoiceMetadata invoice={invoice} />
              <InvoicePanel
                title="Informasi Siswa & Kontak Orang Tua/Wali"
                description="Pihak tertagih serta kontak orang tua untuk invoice dan laporan."
              >
                <dl className="invoice-contact-grid">
                  {[
                    [
                      'Nama Siswa / NIS',
                      `${invoice.studentName} (${invoice.snapshot.studentCode})`,
                    ],
                    ['Nama Orang Tua / Wali', invoice.snapshot.parentName],
                    [
                      'Jenjang & Sekolah',
                      `${invoice.snapshot.educationLevel} · ${invoice.snapshot.school}`,
                    ],
                    [
                      'Nomor Handphone Orang Tua / Wali',
                      invoice.snapshot.parentPhone,
                    ],
                    [
                      'Kelompok Belajar',
                      invoice.groups.map((group) => group.name).join(', '),
                    ],
                    ['Email Orang Tua', invoice.snapshot.parentEmail],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value || 'Belum diisi'}</dd>
                    </div>
                  ))}
                </dl>
              </InvoicePanel>
              <InvoicePanel
                title="Rincian Tagihan"
                description={`Daftar tagihan SPP ${periodLabel(invoice.period)}.`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={invoice.status === 'paid'}
                    onClick={() => setEditing(true)}
                    title={
                      invoice.status === 'paid'
                        ? 'Batalkan pelunasan sebelum mengubah rincian.'
                        : undefined
                    }
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Ubah
                  </Button>
                }
              >
                <InvoiceChargeTable invoice={invoice} />
              </InvoicePanel>
              <details className="invoice-panel">
                <summary className="cursor-pointer text-sm font-semibold">
                  Riwayat Invoice
                </summary>
                <ol className="invoice-history mt-4">
                  {invoice.events.map((event) => (
                    <li key={event.id}>
                      <strong>
                        {eventLabels[event.type] ?? 'Invoice diperbarui'}
                      </strong>
                      <time dateTime={event.createdAt}>
                        {timeLabel(event.createdAt)}
                      </time>
                      {typeof event.details.reason === 'string' ? (
                        <p>{event.details.reason}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
                {invoice.payments
                  .filter((payment) => payment.reversedAt)
                  .map((payment) => (
                    <p
                      key={payment.id}
                      className="mt-3 text-xs text-muted-foreground"
                    >
                      Pembayaran {rupiah(payment.amount)} pada{' '}
                      {dateLabel(payment.paidAt)} dibatalkan:{' '}
                      {payment.reversalReason}
                    </p>
                  ))}
              </details>
            </div>
            <aside className="invoice-stack">
              <InvoicePaymentPanel invoice={invoice} />
              <InvoicePanel title="Rekening Tujuan Bimbel">
                {invoice.snapshot.bankAccount ? (
                  <div className="invoice-bank">
                    <p>
                      {invoice.snapshot.bankAccount.bankName}
                      {invoice.snapshot.bankAccount.branch
                        ? ` · ${invoice.snapshot.bankAccount.branch}`
                        : ''}
                    </p>
                    <strong>
                      {invoice.snapshot.bankAccount.accountNumber}
                    </strong>
                    <p>a.n. {invoice.snapshot.bankAccount.accountHolder}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Rekening tujuan belum diatur saat invoice diterbitkan.
                    Pembayaran tunai tetap tersedia.
                  </p>
                )}
              </InvoicePanel>
              {invoice.billingBlocked ? (
                <div className="invoice-feedback" role="status">
                  <strong>Siswa nonaktif karena tunggakan SPP</strong>
                  <p>
                    Seluruh tunggakan yang melewati tenggang harus dilunasi agar
                    siswa dapat aktif kembali.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to={`/invoices?studentId=${invoice.studentId}&period=&status=overdue`}
                    >
                      Lihat tunggakan siswa
                    </Link>
                  </Button>
                </div>
              ) : null}
            </aside>
          </div>
          {editing ? (
            <EditInvoiceDialog
              invoice={invoice}
              onClose={() => setEditing(false)}
            />
          ) : null}
          {params.get('action') === 'reverse' && invoice.status === 'paid' ? (
            <ReverseInvoiceDialog invoice={invoice} onClose={closeAction} />
          ) : null}
          {params.get('action') === 'payment' ? (
            <InvoicePaymentDialog id={id} onClose={closeAction} />
          ) : null}
        </>
      )}
    </div>
  )
}

function InvoicePaymentPanel({ invoice }: { invoice: InvoiceDetail }) {
  const payment = invoice.payments.find((item) => !item.reversedAt)
  const [proof, setProof] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const preview = useMutation({
    mutationFn: () =>
      payment
        ? getPaymentProof(invoice.id, payment.id)
        : Promise.reject(new Error('No payment')),
    onSuccess: (blob) => setProof(URL.createObjectURL(blob)),
    onError: setError,
  })
  useEffect(
    () => () => {
      if (proof) URL.revokeObjectURL(proof)
    },
    [proof],
  )
  return (
    <InvoicePanel
      title={invoice.status === 'paid' ? 'Status Pembayaran' : 'Status Tagihan'}
    >
      <div
        className={`invoice-status-box invoice-status-box-${invoice.status}`}
      >
        {invoice.status === 'paid' ? (
          <CheckCircle2 size={20} aria-hidden="true" />
        ) : (
          <CircleAlert size={20} aria-hidden="true" />
        )}
        <div>
          {invoice.status === 'paid'
            ? 'Tagihan LUNAS'
            : invoice.status === 'overdue'
              ? 'Tagihan Terlambat'
              : 'Belum Dibayar'}
          <p>
            {payment
              ? `Dibayar ${timeLabel(payment.paidAt)}`
              : `Jatuh tempo ${dateLabel(invoice.dueDate)}`}
          </p>
        </div>
      </div>
      {payment ? (
        <>
          <dl className="invoice-payment-info">
            <div>
              <dt>Metode Pembayaran</dt>
              <dd>
                {payment.method === 'cash'
                  ? 'Tunai'
                  : `Transfer ${invoice.snapshot.bankAccount?.bankName ?? 'Bank'}`}
              </dd>
            </div>
            <div>
              <dt>No. Referensi Bank</dt>
              <dd>{payment.reference || '—'}</dd>
            </div>
            <div>
              <dt>Nominal Diterima</dt>
              <dd className="font-bold text-primary">
                {rupiah(payment.amount)}
              </dd>
            </div>
            <div>
              <dt>Diverifikasi Oleh</dt>
              <dd>{payment.recordedByName}</dd>
            </div>
          </dl>
          {payment.note ? (
            <p className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {payment.note}
            </p>
          ) : null}
          {payment.proofName ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              disabled={preview.isPending}
              onClick={() => {
                setError(null)
                preview.mutate()
              }}
            >
              <ReceiptText size={14} aria-hidden="true" />
              <span className="truncate">
                {preview.isPending ? 'Memuat bukti...' : payment.proofName}
              </span>
              <span className="ml-auto">Lihat Bukti</span>
            </Button>
          ) : null}
          {error ? (
            <p role="alert" className="invoice-error-text">
              {invoiceError(error)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Jika belum lunas, siswa menjadi nonaktif mulai{' '}
          {dateLabel(invoice.suspensionDate)}.
        </p>
      )}
      {proof ? (
        <Dialog
          title="Bukti Pembayaran"
          onDismiss={() => setProof(null)}
          size="medium"
        >
          <DialogBody>
            <img
              src={proof}
              alt={`Bukti pembayaran ${invoice.number}`}
              className="max-h-[70dvh] w-full object-contain"
            />
          </DialogBody>
        </Dialog>
      ) : null}
    </InvoicePanel>
  )
}

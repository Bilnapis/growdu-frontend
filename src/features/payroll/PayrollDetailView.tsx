import { DetailBackLink } from '@/components/ui/detail-back-link'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Pencil,
  ReceiptText,
  RefreshCw,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody } from '@/components/ui/dialog'
import { getPayrollProof, recalculatePayroll, type PayrollDetail } from './api'
import { usePayroll, usePayrollMutation } from './hooks'
import { dateLabel, rangeLabel, rupiah } from './format'
import {
  PayrollError,
  PayrollLoading,
  PayrollPanel,
  PayrollPdfButton,
  PayrollTable,
} from './PayrollShared'
import { EditPayrollDialog, ReversePayrollDialog } from './PayrollDialogs'
import { PayrollPaymentDialog } from './PayrollPaymentView'

const eventLabels: Record<string, string> = {
  generated: 'Penggajian dibuat',
  items_updated: 'Rincian gaji diubah',
  recalculated: 'Diperbarui dari presensi',
  payment_recorded: 'Pembayaran dicatat',
  payment_reversed: 'Pembayaran dibatalkan',
}
export function PayrollDetailView({
  id,
  tutor = false,
}: {
  id: string
  tutor?: boolean
}) {
  const [params, setParams] = useSearchParams()
  function closePayment() {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('action')
        return next
      },
      { replace: true },
    )
  }
  const query = usePayroll(id, tutor)
  const [editing, setEditing] = useState<PayrollDetail | null>(null)
  const [reversing, setReversing] = useState<{
    payroll: PayrollDetail
    paymentId: string
  } | null>(null)
  const recalculate = usePayrollMutation(recalculatePayroll)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const proof = useMutation({
    mutationFn: (paymentId: string) => getPayrollProof(id, paymentId),
    retry: false,
    onSuccess: (blob) => setProofUrl(URL.createObjectURL(blob)),
  })
  useEffect(
    () => () => {
      if (proofUrl) URL.revokeObjectURL(proofUrl)
    },
    [proofUrl],
  )
  if (query.isPending) return <PayrollLoading />
  if (query.isError)
    return (
      <PayrollError error={query.error} retry={() => void query.refetch()} />
    )
  const p = query.data
  const activePayment = p.payments.find((payment) => !payment.reversedAt)
  const base = tutor ? '/tutor/payroll' : '/payroll'
  return (
    <div className="payroll">
      <DetailBackLink to={base}>
        {tutor ? 'Kembali ke daftar slip gaji' : 'Kembali ke daftar penggajian'}
      </DetailBackLink>
      <header className="payroll-header">
        <div>
          <h1>{tutor ? 'Slip Gaji' : 'Detail Penggajian'}</h1>
        </div>
        <div className="payroll-actions">
          {p.status === 'paid' ? (
            <PayrollPdfButton payroll={p} tutor={tutor} />
          ) : !tutor ? (
            <Button asChild disabled={p.sourceChanged}>
              <Link to={`${base}/${id}?action=payment`}>Bayar Gaji</Link>
            </Button>
          ) : null}
        </div>
      </header>
      {p.sourceChanged && !tutor ? (
        <p role="status" className="payroll-notice mb-4">
          Presensi sumber telah berubah. Pilih Perbarui dari Presensi sebelum
          melakukan pembayaran.
        </p>
      ) : null}
      {recalculate.isError ? <PayrollError error={recalculate.error} /> : null}
      {recalculate.isSuccess ? (
        <p role="status" className="mb-4 text-sm text-[var(--color-success)]">
          Rincian diperbarui. Tarif khusus, koreksi sesi, dan item tambahan
          tetap dipertahankan.
        </p>
      ) : null}
      <div className="payroll-grid">
        <div className="payroll-stack">
          <dl className="payroll-metadata">
            {[
              ['Nomor Penggajian', p.number],
              ['Periode Gaji', rangeLabel(p)],
              ['Tanggal Terbit', dateLabel(p.issuedDate)],
              ['Tanggal Penggajian', dateLabel(p.payDate)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <PayrollPanel
            title="Informasi Tentor"
            description="Data tentor penerima gaji pada periode ini."
          >
            <dl className="payroll-contact">
              {[
                ['Nama Tentor', p.snapshot.tutorName],
                ['Nomor Handphone', p.snapshot.tutorPhone],
                ['Mata Pelajaran', p.snapshot.subject ?? '—'],
                ['Email', p.snapshot.tutorEmail ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt>Kelompok Belajar</dt>
                <dd>
                  {p.items
                    .filter((i) => i.kind === 'teaching')
                    .map((i) => i.description)
                    .join(', ') || '—'}
                </dd>
              </div>
            </dl>
          </PayrollPanel>
          <PayrollPanel
            title="Rincian Gaji"
            description={`Detail gaji periode ${rangeLabel(p)}.`}
            action={
              !tutor && p.status !== 'paid' ? (
                <div className="payroll-actions">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={recalculate.isPending}
                    onClick={() =>
                      recalculate.mutate({ id, version: p.version })
                    }
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    {recalculate.isPending
                      ? 'Memperbarui...'
                      : 'Perbarui dari Presensi'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={recalculate.isPending}
                    onClick={() => setEditing(p)}
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Ubah
                  </Button>
                </div>
              ) : undefined
            }
          >
            <PayrollTable payroll={p} />
          </PayrollPanel>
          {!tutor && p.sources.length ? (
            <details className="payroll-panel payroll-history-panel group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <h2 className="text-base font-bold">Riwayat Presensi</h2>
                <ChevronDown
                  className="payroll-history-chevron h-5 w-5 shrink-0 text-muted-foreground group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="payroll-history mt-4">
                {p.sources.map((source) => (
                  <li key={source.sessionId}>
                    <strong>
                      <Link
                        className="text-inherit hover:underline focus-visible:underline"
                        to={`/schedule/${source.sessionId}`}
                      >
                        {source.studyGroupName}
                      </Link>
                    </strong>
                    <p className="text-muted-foreground">
                      {dateLabel(source.sessionDate)}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {!tutor && p.payments.length ? (
            <PayrollPanel title="Riwayat Pembayaran">
              <ul className="payroll-history">
                {p.payments.map((payment) => (
                  <li key={payment.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <strong>
                          {payment.reversedAt
                            ? 'Pembayaran Dibatalkan'
                            : 'Pembayaran Aktif'}{' '}
                          · {rupiah(payment.amount)}
                        </strong>
                        <p>
                          {dateLabel(payment.paidAt)} ·{' '}
                          {payment.method === 'cash'
                            ? 'Tunai'
                            : 'Transfer bank/e-wallet'}
                        </p>
                        <p>Dicatat oleh {payment.recordedByName}</p>
                        {payment.reference ? (
                          <p>Referensi: {payment.reference}</p>
                        ) : null}
                        {payment.note ? <p>{payment.note}</p> : null}
                        {payment.reversedAt ? (
                          <p className="text-[var(--color-danger)]">
                            Dibatalkan {dateLabel(payment.reversedAt)}:{' '}
                            {payment.reversalReason}
                          </p>
                        ) : null}
                      </div>
                      <PayrollPdfButton payroll={p} paymentId={payment.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </PayrollPanel>
          ) : null}
          {!tutor ? (
            <details className="payroll-panel payroll-history-panel group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <h2 className="text-base font-bold">Riwayat Penggajian</h2>
                <ChevronDown
                  className="payroll-history-chevron h-5 w-5 shrink-0 text-muted-foreground group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="payroll-history mt-4">
                {p.events.map((event) => (
                  <li key={event.id}>
                    <strong>
                      {eventLabels[event.type] ?? 'Penggajian diperbarui'}
                    </strong>
                    <p className="text-muted-foreground">
                      {dateLabel(event.createdAt)}
                    </p>
                    {typeof event.details.reason === 'string' ? (
                      <p>{event.details.reason}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
        <aside className="payroll-stack">
          <PayrollPanel title="Status Gaji">
            <div
              className={`payroll-status-box payroll-status-box-${p.status}`}
            >
              {p.status === 'paid' ? (
                <CheckCircle2
                  size={20}
                  className="shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <CircleAlert
                  size={20}
                  className="shrink-0"
                  aria-hidden="true"
                />
              )}
              <div>
                {p.status === 'paid'
                  ? 'Gaji LUNAS'
                  : p.status === 'overdue'
                    ? 'Gaji Terlambat'
                    : 'Belum Dibayar'}
                <p>
                  {activePayment
                    ? `Dibayar ${dateLabel(activePayment.paidAt)}`
                    : `Jatuh tempo ${dateLabel(p.payDate)}`}
                </p>
              </div>
            </div>
            {activePayment ? (
              <dl className="payroll-payment-info">
                {[
                  [
                    'Metode Penggajian',
                    activePayment.method === 'cash'
                      ? 'Tunai'
                      : 'Transfer bank/e-wallet',
                  ],
                  ['Referensi', activePayment.reference ?? '—'],
                  ['Total Gaji Diterima', rupiah(activePayment.amount)],
                  ['Dicatat Oleh', activePayment.recordedByName],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd
                      className={
                        label === 'Total Gaji Diterima'
                          ? 'font-bold text-primary'
                          : undefined
                      }
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {activePayment?.note ? (
              <p className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap break-words">
                {activePayment.note}
              </p>
            ) : null}
            {activePayment && !tutor ? (
              <div className="mt-4 space-y-3">
                {activePayment.proofName ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={proof.isPending}
                    onClick={() => proof.mutate(activePayment.id)}
                  >
                    <ReceiptText
                      size={14}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 truncate">
                      {proof.isPending
                        ? 'Memuat bukti...'
                        : activePayment.proofName}
                    </span>
                    <span className="ml-auto shrink-0">Lihat Bukti</span>
                  </Button>
                ) : null}
                {proof.isError ? <PayrollError error={proof.error} /> : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setReversing({ payroll: p, paymentId: activePayment.id })
                  }
                >
                  Batalkan Pembayaran
                </Button>
              </div>
            ) : null}
          </PayrollPanel>
          <PayrollPanel title="Rekening Tentor">
            <div className="payroll-bank">
              <p>{p.snapshot.bankName ?? 'Rekening belum diatur'}</p>
              <strong>{p.snapshot.accountNumber ?? '—'}</strong>
              <p>a.n. {p.snapshot.accountName ?? '—'}</p>
            </div>
          </PayrollPanel>
        </aside>
      </div>
      {proofUrl ? (
        <Dialog
          title="Bukti Pembayaran Gaji"
          onDismiss={() => setProofUrl(null)}
          size="medium"
        >
          <DialogBody>
            <img
              src={proofUrl}
              alt={`Bukti pembayaran gaji ${p.number}`}
              className="max-h-[70dvh] w-full object-contain"
            />
          </DialogBody>
        </Dialog>
      ) : null}
      {!tutor && params.get('action') === 'payment' ? (
        <PayrollPaymentDialog id={id} onClose={closePayment} />
      ) : null}
      {editing ? (
        <EditPayrollDialog payroll={editing} onClose={() => setEditing(null)} />
      ) : null}
      {reversing ? (
        <ReversePayrollDialog
          payroll={reversing.payroll}
          paymentId={reversing.paymentId}
          onClose={() => setReversing(null)}
        />
      ) : null}
    </div>
  )
}

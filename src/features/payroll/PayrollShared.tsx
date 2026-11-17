import type { ReactNode } from 'react'
import { Download, Wallet } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { getPayrollPdf, type PayrollDetail, type PayrollStatus } from './api'
import { downloadBlob, payrollError, rupiah } from './format'
import './payroll.css'

export function PayrollBadge({ status }: { status: PayrollStatus }) {
  return (
    <span className={`payroll-badge payroll-badge-${status}`}>
      {status === 'paid'
        ? 'Sudah Dibayar'
        : status === 'overdue'
          ? 'Terlambat'
          : 'Belum Dibayar'}
    </span>
  )
}
export function PayrollPanel({
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
    <section className="payroll-panel">
      <header className="payroll-panel-heading">
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
export function PayrollError({
  error,
  retry,
}: {
  error: unknown
  retry?: () => void
}) {
  return (
    <div role="alert" className="payroll-feedback">
      <p>{payrollError(error)}</p>
      {retry ? (
        <Button variant="outline" size="sm" onClick={retry}>
          Muat ulang
        </Button>
      ) : null}
    </div>
  )
}
export function PayrollLoading() {
  return (
    <div role="status" className="payroll-loading">
      <Wallet aria-hidden="true" />
      <p>Memuat data penggajian...</p>
      <div className="payroll-skeleton motion-safe:animate-pulse" />
    </div>
  )
}
export function PayrollTable({
  payroll,
}: {
  payroll: Pick<PayrollDetail, 'items' | 'total'>
}) {
  return (
    <>
      <div className="payroll-table-scroll">
        <table className="payroll-charge-table">
          <thead>
            <tr>
              <th scope="col">Nama Kelompok / Keterangan</th>
              <th scope="col">Tarif per Sesi</th>
              <th scope="col">Jumlah Sesi</th>
              <th scope="col">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {payroll.items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.description}
                  {item.sessionAdjustment ? (
                    <small className="block text-muted-foreground">
                      {item.sourceCount} dari presensi, koreksi{' '}
                      {item.sessionAdjustment > 0 ? '+' : ''}
                      {item.sessionAdjustment}
                      <br />
                      {item.correctionReason}
                    </small>
                  ) : null}
                </td>
                <td>{item.kind === 'teaching' ? rupiah(item.rate) : '—'}</td>
                <td>
                  {item.kind === 'teaching' ? `${item.quantity} sesi` : '—'}
                </td>
                <td>{rupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="payroll-total">
        <span>Total Gaji:</span>
        <strong>{rupiah(payroll.total)}</strong>
      </div>
    </>
  )
}
export function PayrollPdfButton({
  payroll,
  tutor = false,
  paymentId,
}: {
  payroll: Pick<PayrollDetail, 'id' | 'number'>
  tutor?: boolean
  paymentId?: string
}) {
  const mutation = useMutation({
    mutationFn: () => getPayrollPdf(payroll.id, tutor, paymentId),
    retry: false,
    onSuccess: (blob) =>
      downloadBlob(
        blob,
        `${payroll.number}${paymentId ? `-${paymentId}` : ''}.pdf`,
      ),
  })
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <Download size={15} aria-hidden="true" />
        {mutation.isPending ? 'Menyiapkan slip...' : 'Unduh Slip'}
      </Button>
      {mutation.isError ? <PayrollError error={mutation.error} /> : null}
    </div>
  )
}

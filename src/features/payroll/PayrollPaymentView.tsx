import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { recordPayrollPayment, type PayrollDetail } from './api'
import { usePayroll, usePayrollMutation } from './hooks'
import { rangeLabel } from './format'
import {
  PayrollBadge,
  PayrollError,
  PayrollLoading,
  PayrollTable,
} from './PayrollShared'

export function PayrollPaymentDialog({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const query = usePayroll(id)
  if (
    query.data &&
    !query.isError &&
    query.data.status !== 'paid' &&
    !query.data.sourceChanged
  ) {
    return (
      <PayrollPaymentForm
        key={`${query.data.id}-${query.data.version}`}
        payroll={query.data}
        onClose={onClose}
      />
    )
  }
  return (
    <Dialog title="Konfirmasi Penggajian" onDismiss={onClose} size="default">
      <DialogBody>
        {query.isPending ? (
          <PayrollLoading />
        ) : query.isError ? (
          <PayrollError
            error={query.error}
            retry={() => void query.refetch()}
          />
        ) : query.data?.status === 'paid' ? (
          <p role="status" className="text-sm text-muted-foreground">
            Gaji sudah dibayar.
          </p>
        ) : query.data?.sourceChanged ? (
          <p role="status" className="payroll-notice">
            Presensi telah berubah. Perbarui rincian penggajian sebelum
            membayar.
          </p>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <DialogButton variant="outline" onClick={onClose}>
          Tutup
        </DialogButton>
      </DialogFooter>
    </Dialog>
  )
}
function PayrollPaymentForm({
  payroll,
  onClose,
}: {
  payroll: PayrollDetail
  onClose: () => void
}) {
  const mutation = usePayrollMutation(recordPayrollPayment)
  const [requestId] = useState(() => crypto.randomUUID())
  const [fileError, setFileError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const hasBank = Boolean(
    payroll.snapshot.bankName &&
    payroll.snapshot.accountNumber &&
    payroll.snapshot.accountName,
  )
  const [method, setMethod] = useState<'cash' | 'bank_transfer'>(
    hasBank ? 'bank_transfer' : 'cash',
  )
  const localNow = () =>
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .format(new Date())
      .replace(' ', 'T')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending || fileError) return
    const form = new FormData(event.currentTarget)
    const formText = (key: string) => {
      const value = form.get(key)
      return typeof value === 'string' ? value : ''
    }
    const body = new FormData()
    body.set('requestId', requestId)
    body.set('version', String(payroll.version))
    body.set('paidAt', new Date(`${formText('paidAt')}:00+07:00`).toISOString())
    body.set('method', method)
    body.set('reference', formText('reference'))
    body.set('note', formText('note'))
    if (file) body.set('file', file)
    await mutation
      .mutateAsync({ id: payroll.id, body })
      .then(onClose)
      .catch(() => undefined)
  }
  return (
    <Dialog
      title="Konfirmasi Penggajian"
      description="Lengkapi data transaksi sebelum menandai gaji sudah dibayar."
      className="payroll"
      size="default"
      onDismiss={onClose}
      isPending={mutation.isPending}
      initialFocusSelector="#payroll-paid-at"
    >
      <DialogForm
        aria-busy={mutation.isPending}
        onSubmit={(event) => void submit(event)}
      >
        <DialogBody>
          <div className="rounded-md border p-4">
            <div className="mb-3 flex flex-wrap justify-between gap-2">
              <strong>{payroll.number}</strong>
              <PayrollBadge status={payroll.status} />
            </div>
            <p className="text-sm font-semibold">{payroll.tutorName}</p>
            <p className="mb-4 text-xs text-muted-foreground">
              {rangeLabel(payroll)}
            </p>
            <PayrollTable payroll={payroll} />
          </div>
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <legend className="sr-only">Informasi pembayaran</legend>
            <div className="payroll-field">
              <label htmlFor="payroll-paid-at">Tanggal Penggajian (WIB)</label>
              <Input
                id="payroll-paid-at"
                name="paidAt"
                type="datetime-local"
                required
                min={`${payroll.issuedDate}T00:00`}
                max={localNow()}
                defaultValue={localNow()}
              />
            </div>
            <div className="payroll-field">
              <label htmlFor="payroll-payment-method">Metode Penggajian</label>
              <Select
                id="payroll-payment-method"
                value={method}
                onChange={(e) =>
                  setMethod(
                    e.target.value === 'cash' ? 'cash' : 'bank_transfer',
                  )
                }
              >
                <option value="cash">Tunai</option>
                <option value="bank_transfer" disabled={!hasBank}>
                  Transfer Bank / E-Wallet
                  {hasBank
                    ? ` - ${payroll.snapshot.bankName} (${payroll.snapshot.accountNumber})`
                    : ' (rekening belum lengkap)'}
                </option>
              </Select>
            </div>
            <div className="payroll-field">
              <label htmlFor="payroll-payment-reference">
                Referensi Transaksi (Opsional)
              </label>
              <Input
                id="payroll-payment-reference"
                name="reference"
                maxLength={100}
                placeholder="Nomor referensi bank"
              />
            </div>
            <div className="payroll-field">
              <label htmlFor="payroll-payment-proof">
                Bukti Transfer / Penggajian (Opsional)
              </label>
              <div className="payroll-upload">
                <Input
                  id="payroll-payment-proof"
                  type="file"
                  accept="image/jpeg,image/png"
                  aria-describedby="payroll-proof-help"
                  aria-invalid={Boolean(fileError)}
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null
                    const invalid =
                      selected &&
                      (selected.size > 5 * 1024 * 1024 ||
                        !['image/jpeg', 'image/png'].includes(selected.type))
                    setFileError(
                      invalid ? 'Pilih gambar JPG/PNG maksimal 5 MB.' : '',
                    )
                    setFile(invalid ? null : selected)
                  }}
                />
                <p id="payroll-proof-help">Gambar JPG/PNG, maksimal 5 MB.</p>
                {fileError ? <p role="alert">{fileError}</p> : null}
              </div>
            </div>
            <div className="payroll-field">
              <label htmlFor="payroll-payment-note">
                Catatan Transaksi (Opsional)
              </label>
              <textarea
                id="payroll-payment-note"
                name="note"
                className="payroll-textarea"
                maxLength={1000}
                placeholder="Catatan pembayaran gaji"
              />
            </div>
          </fieldset>
          {mutation.isError ? <PayrollError error={mutation.error} /> : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Batal
          </DialogButton>
          <DialogButton
            type="submit"
            disabled={mutation.isPending || Boolean(fileError)}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Tandai Sudah Dibayar'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

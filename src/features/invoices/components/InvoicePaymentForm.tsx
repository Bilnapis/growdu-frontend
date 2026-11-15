import { useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { recordPayment, type InvoiceDetail } from '../api/invoices-api'
import { useInvoice, useInvoiceMutation } from '../hooks/use-invoices'
import { formText, billingToday } from '../invoice-format'
import { InvoiceBrief, InvoiceError, InvoiceLoading } from './InvoiceShared'
import '../invoices.css'

export function InvoicePaymentDialog({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const query = useInvoice(id)
  if (query.data && !query.isError && query.data.status !== 'paid') {
    return (
      <InvoicePaymentForm
        key={`${query.data.id}-${query.data.version}`}
        invoice={query.data}
        onClose={onClose}
      />
    )
  }
  return (
    <Dialog
      title="Konfirmasi Pembayaran Invoice"
      onDismiss={onClose}
      size="medium"
    >
      <DialogBody>
        {query.isPending ? (
          <InvoiceLoading />
        ) : query.isError || !query.data ? (
          <InvoiceError
            error={query.error}
            retry={() => void query.refetch()}
          />
        ) : query.data.status === 'paid' ? (
          <p role="status" className="text-sm text-muted-foreground">
            Invoice sudah lunas.
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

function InvoicePaymentForm({
  invoice,
  onClose,
}: {
  invoice: InvoiceDetail
  onClose: () => void
}) {
  const mutation = useInvoiceMutation(recordPayment)
  const [requestId] = useState(() => crypto.randomUUID())
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [defaultTime] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date())
    return `${billingToday()}T${parts}`
  })
  function selectFile(value: File | undefined) {
    if (mutation.isPending) return
    setFileError('')
    if (!value) {
      setFile(null)
      return
    }
    if (
      !['image/png', 'image/jpeg'].includes(value.type) ||
      value.size > 5 * 1024 * 1024
    ) {
      setFileError('Pilih gambar JPG atau PNG maksimal 5 MB.')
      setFile(null)
      return
    }
    setFile(value)
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending || fileError) return
    const body = new FormData(event.currentTarget)
    body.set('paidAt', `${formText(body, 'paidAt')}:00+07:00`)
    body.set('requestId', requestId)
    body.set('version', String(invoice.version))
    if (file) body.set('file', file)
    try {
      await mutation.mutateAsync({ id: invoice.id, body })
      onClose()
    } catch {
      /* The mutation error remains visible and the request ID is preserved for retries. */
    }
  }
  return (
    <Dialog
      title="Konfirmasi Pembayaran Invoice"
      description="Verifikasi pembayaran SPP siswa dan lengkapi data transaksi sebelum mengubah status menjadi Lunas."
      onDismiss={onClose}
      isPending={mutation.isPending}
      size="medium"
      initialFocusSelector="#payment-date"
    >
      <DialogForm
        aria-busy={mutation.isPending}
        onSubmit={(event) => void submit(event)}
      >
        <DialogBody>
          <InvoiceBrief invoice={invoice} />
          <fieldset className="invoice-fields" disabled={mutation.isPending}>
            <div className="invoice-field">
              <label htmlFor="payment-date">
                Tanggal Pembayaran (WIB){' '}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <Input
                id="payment-date"
                name="paidAt"
                type="datetime-local"
                min={`${invoice.issuedDate}T00:00`}
                max={`${billingToday()}T23:59`}
                required
                defaultValue={defaultTime}
              />
            </div>
            <div className="invoice-field">
              <label htmlFor="payment-method">
                Metode Pembayaran{' '}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <Select
                id="payment-method"
                name="method"
                required
                defaultValue={
                  invoice.snapshot.bankAccount ? 'bank_transfer' : 'cash'
                }
              >
                <option value="cash">Tunai</option>
                {invoice.snapshot.bankAccount ? (
                  <option value="bank_transfer">
                    Transfer Bank - {invoice.snapshot.bankAccount.bankName} (
                    {invoice.snapshot.bankAccount.accountNumber})
                  </option>
                ) : null}
              </Select>
            </div>
            <div className="invoice-field">
              <label htmlFor="payment-reference">
                No. Referensi Bank (Opsional)
              </label>
              <Input id="payment-reference" name="reference" maxLength={100} />
            </div>
            <div className="invoice-field">
              <label htmlFor="payment-proof">
                Bukti Transfer / Pembayaran (Opsional)
              </label>
              <label
                htmlFor="payment-proof"
                className={`invoice-upload ${isDragging ? 'ring-2 ring-primary' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  selectFile(event.dataTransfer.files[0])
                }}
              >
                <Upload size={20} aria-hidden="true" />
                <p>Klik atau seret file gambar JPG/PNG, maksimal 5 MB</p>
                <input
                  id="payment-proof"
                  type="file"
                  accept="image/png,image/jpeg"
                  aria-describedby="payment-proof-error"
                  onChange={(event) => {
                    selectFile(event.target.files?.[0])
                    event.target.value = ''
                  }}
                  className="sr-only"
                />
                {file ? <span className="break-all">{file.name}</span> : null}
              </label>
              {file || fileError ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="justify-self-start px-0"
                  onClick={() => {
                    setFile(null)
                    setFileError('')
                  }}
                >
                  Hapus bukti
                </Button>
              ) : null}
              <p
                id="payment-proof-error"
                role={fileError ? 'alert' : undefined}
                className="invoice-error-text"
              >
                {fileError}
              </p>
            </div>
            <div className="invoice-field">
              <label htmlFor="payment-note">Catatan Transaksi (Opsional)</label>
              <textarea
                id="payment-note"
                name="note"
                maxLength={1000}
                className="invoice-textarea"
              />
            </div>
          </fieldset>
          {mutation.isError ? <InvoiceError error={mutation.error} /> : null}
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
            {mutation.isPending ? 'Mencatat pembayaran...' : 'Tandai Lunas'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

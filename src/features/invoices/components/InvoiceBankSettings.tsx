import { formText } from '../invoice-format'
import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import {
  getPaymentAccount,
  savePaymentAccount,
  type BankAccount,
} from '../api/invoices-api'
import { useInvoiceMutation } from '../hooks/use-invoices'
import { InvoiceError } from './InvoiceShared'
import '../invoices.css'

export function InvoiceBankSettings() {
  const user = getStoredAuthUser()
  if (user?.role !== 'owner') return null
  return (
    <InvoiceBankSettingsContent tenantId={getStoredSelectedTenantId(user.id)} />
  )
}

function InvoiceBankSettingsContent({ tenantId }: { tenantId: string | null }) {
  const query = useQuery({
    queryKey: ['invoices', tenantId, 'payment-account'],
    queryFn: ({ signal }) => getPaymentAccount(signal),
  })
  return (
    <section className="tenant-settings-panel invoices mt-5">
      <h2 className="text-xl font-semibold">Rekening Pembayaran SPP</h2>
      <p className="my-3 text-sm text-muted-foreground">
        Rekening tujuan untuk invoice berikutnya. Invoice yang sudah terbit
        menyimpan rekening sebelumnya.
      </p>
      {query.isPending ? (
        <p role="status">Memuat rekening...</p>
      ) : query.isError ? (
        <InvoiceError error={query.error} retry={() => void query.refetch()} />
      ) : query.data ? (
        <InvoiceBankAccountForm
          key={JSON.stringify(query.data.bankAccount)}
          account={query.data.bankAccount}
        />
      ) : null}
    </section>
  )
}

export function InvoiceBankAccountForm({
  account,
  disabled = false,
  onSavingChange,
  onSaved,
}: {
  account: BankAccount | null
  disabled?: boolean
  onSavingChange?: (saving: boolean) => void
  onSaved?: () => void
}) {
  const mutation = useInvoiceMutation(savePaymentAccount)
  const [success, setSuccess] = useState(false)
  const [draft, setDraft] = useState<BankAccount>(
    account ?? {
      bankName: '',
      branch: '',
      accountNumber: '',
      accountHolder: '',
    },
  )
  async function save(accountValue: BankAccount | null) {
    if (mutation.isPending || disabled) return
    setSuccess(false)
    onSavingChange?.(true)
    try {
      await mutation.mutateAsync(accountValue)
      setSuccess(true)
      onSaved?.()
    } catch {
      setSuccess(false)
    } finally {
      onSavingChange?.(false)
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending || disabled) return
    const data = new FormData(event.currentTarget)
    const body: BankAccount = {
      bankName: formText(data, 'bankName').trim(),
      branch: draft.branch,
      accountNumber: formText(data, 'accountNumber').trim(),
      accountHolder: formText(data, 'accountHolder').trim(),
    }
    await save(body)
  }
  return (
    <form
      onSubmit={(event) => void submit(event)}
      aria-busy={mutation.isPending}
      onChange={() => setSuccess(false)}
    >
      <fieldset
        disabled={mutation.isPending || disabled}
        className="grid gap-4 sm:grid-cols-2"
      >
        <InvoiceBankAccountFields account={draft} onChange={setDraft} />
        <div className="invoice-actions sm:col-span-2 justify-end">
          {account ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void save(null)}
              disabled={mutation.isPending || disabled}
            >
              Hapus rekening untuk invoice baru
            </Button>
          ) : null}
          <Button type="submit" disabled={mutation.isPending || disabled}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Rekening'}
          </Button>
        </div>
      </fieldset>
      {mutation.isError ? <InvoiceError error={mutation.error} /> : null}
      {success && !onSaved ? (
        <p className="invoice-success" role="status">
          Rekening pembayaran tersimpan.
        </p>
      ) : null}
    </form>
  )
}

export function InvoiceBankAccountFields({
  account,
  onChange,
  required = true,
  fieldClassName,
}: {
  account: BankAccount
  onChange: (account: BankAccount) => void
  required?: boolean
  fieldClassName?: string
}) {
  return (
    <>
      {(
        [
          { name: 'bankName', label: 'Nama Bank', max: 100 },
          { name: 'accountNumber', label: 'Nomor Rekening', max: 40 },
          { name: 'accountHolder', label: 'Nama Pemilik Rekening', max: 150 },
        ] as const
      ).map((field) => (
        <div
          key={field.name}
          className={cn(
            'invoice-field min-w-0',
            field.name === 'accountHolder' && 'sm:col-span-2',
            fieldClassName,
          )}
        >
          <label htmlFor={`invoice-bank-${field.name}`}>{field.label}</label>
          <Input
            id={`invoice-bank-${field.name}`}
            name={field.name}
            value={account[field.name]}
            onChange={(event) =>
              onChange({ ...account, [field.name]: event.target.value })
            }
            maxLength={field.max}
            required={required}
            pattern={
              field.name === 'accountNumber' ? '[0-9 -]{5,40}' : undefined
            }
          />
        </div>
      ))}
    </>
  )
}

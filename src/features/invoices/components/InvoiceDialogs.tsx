import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormSection } from '@/components/ui/form-section'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { TablePagination } from '@/components/ui/table-pagination'
import { getStoredAuthUser } from '@/lib/auth-session'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogForm,
  DialogButton,
} from '@/components/ui/dialog'
import {
  generateInvoices,
  reversePayment,
  saveInvoiceItems,
  saveInvoiceSettings,
  savePaymentAccount,
  type BankAccount,
  type InvoiceDetail,
  type InvoiceItemInput,
  type InvoiceSettings,
  type InvoiceStudentOption,
} from '../api/invoices-api'
import {
  useInvoiceMutation,
  useInvoiceStudentOptions,
} from '../hooks/use-invoices'
import {
  formText,
  billingToday,
  dateLabel,
  periodLabel,
  rupiah,
} from '../invoice-format'
import { InvoiceBrief, InvoiceError } from './InvoiceShared'
import { InvoiceBankAccountFields } from './InvoiceBankSettings'

export function InvoiceSettingsDialog({
  settings,
  onClose,
}: {
  settings: InvoiceSettings
  onClose: () => void
}) {
  const isOwner = getStoredAuthUser()?.role === 'owner'
  const [bankDraft, setBankDraft] = useState<BankAccount>(
    settings.bankAccount ?? {
      bankName: '',
      branch: '',
      accountNumber: '',
      accountHolder: '',
    },
  )
  const [validationError, setValidationError] = useState('')
  const hasBankDetails = [
    bankDraft.bankName,
    bankDraft.accountNumber,
    bankDraft.accountHolder,
  ].some((value) => value.trim())
  const mutation = useInvoiceMutation(saveInvoiceSettings)
  const bankMutation = useInvoiceMutation(savePaymentAccount)
  const isPending = mutation.isPending || bankMutation.isPending
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return
    const form = new FormData(event.currentTarget)
    const bankAccount: BankAccount | null = hasBankDetails
      ? {
          bankName: bankDraft.bankName.trim(),
          branch: bankDraft.branch.trim(),
          accountNumber: bankDraft.accountNumber.trim(),
          accountHolder: bankDraft.accountHolder.trim(),
        }
      : null
    setValidationError('')
    mutation.reset()
    bankMutation.reset()
    if (
      isOwner &&
      bankAccount &&
      (!bankAccount.bankName ||
        !bankAccount.accountNumber ||
        !bankAccount.accountHolder)
    ) {
      setValidationError(
        'Lengkapi nama bank, nomor rekening, dan nama pemilik rekening.',
      )
      return
    }
    const bankChanged = bankAccount
      ? (
          ['bankName', 'branch', 'accountNumber', 'accountHolder'] as const
        ).some((key) => bankAccount[key] !== settings.bankAccount?.[key])
      : settings.bankAccount !== null
    try {
      await mutation.mutateAsync({
        dueDay: Number(form.get('dueDay')),
        graceDays: Number(form.get('graceDays')),
      })
      if (isOwner && bankChanged) {
        await bankMutation.mutateAsync(bankAccount)
      }
      onClose()
    } catch {
      // Keep the draft open so failed settings can be retried.
    }
  }
  return (
    <Dialog
      title="Pengaturan Invoice SPP"
      description="Atur jatuh tempo SPP, tenggang waktu penonaktifan siswa, dan rekening pembayaran."
      onDismiss={onClose}
      isPending={isPending}
      size="medium"
    >
      <DialogForm onSubmit={(event) => void submit(event)}>
        <DialogBody>
          <div className="space-y-3">
            <FormSection
              title="Jatuh Tempo & Tenggang"
              description="Atur tanggal jatuh tempo SPP setiap bulan dan tenggang waktu sebelum siswa dinonaktifkan."
            >
              <fieldset
                disabled={isPending}
                className="grid min-w-0 gap-6 text-[13px] leading-normal"
              >
                <legend className="sr-only">Jatuh Tempo & Tenggang</legend>
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_60px] items-center gap-x-4 gap-y-2 text-[13px]">
                  <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label htmlFor="invoice-due-day">
                      Tanggal jatuh tempo setiap bulan
                    </label>
                    <p id="invoice-due-day-help">
                      Tanggal jatuh tempo pembayaran SPP setiap bulan.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col items-end justify-end gap-1 text-muted-foreground">
                    <Input
                      id="invoice-due-day"
                      name="dueDay"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      required
                      defaultValue={settings.dueDay}
                      className="w-[60px] max-w-full text-center"
                      aria-describedby="invoice-due-day-help"
                    />
                  </div>
                </div>
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_60px] items-center gap-x-4 gap-y-2 text-[13px]">
                  <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label htmlFor="invoice-grace-days">
                      Tenggang waktu sebelum siswa dinonaktifkan
                    </label>
                    <p id="invoice-grace-days-help">
                      Jumlah hari setelah jatuh tempo sebelum siswa
                      dinonaktifkan.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col items-end justify-end gap-1 text-muted-foreground">
                    <Input
                      id="invoice-grace-days"
                      name="graceDays"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={90}
                      required
                      defaultValue={settings.graceDays}
                      className="w-[60px] max-w-full text-center"
                      aria-describedby="invoice-grace-days-help"
                    />
                  </div>
                </div>
              </fieldset>
              {mutation.isError ? (
                <InvoiceError error={mutation.error} />
              ) : null}
            </FormSection>
            <FormSection
              title="Rekening Pembayaran SPP"
              description="Rekening tujuan untuk invoice berikutnya. Invoice yang sudah terbit menyimpan rekening sebelumnya."
            >
              <div className="space-y-3.5">
                {isOwner ? (
                  <fieldset
                    disabled={isPending}
                    className="grid min-w-0 gap-3.5 md:grid-cols-3"
                  >
                    <legend className="sr-only">Rekening Pembayaran SPP</legend>
                    <InvoiceBankAccountFields
                      account={bankDraft}
                      fieldClassName="sm:col-span-1"
                      required={hasBankDetails}
                      onChange={(account) => {
                        setBankDraft(account)
                        setValidationError('')
                      }}
                    />
                    {settings.bankAccount && hasBankDetails ? (
                      <div className="invoice-actions justify-end md:col-span-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setBankDraft({
                              bankName: '',
                              branch: '',
                              accountNumber: '',
                              accountHolder: '',
                            })
                          }
                        >
                          Hapus rekening untuk invoice baru
                        </Button>
                      </div>
                    ) : null}
                  </fieldset>
                ) : (
                  <div className="space-y-3">
                    {settings.bankAccount ? (
                      <div className="invoice-bank">
                        <p>
                          {settings.bankAccount.bankName}
                          {settings.bankAccount.branch
                            ? ` · ${settings.bankAccount.branch}`
                            : ''}
                        </p>
                        <strong>{settings.bankAccount.accountNumber}</strong>
                        <p>a.n. {settings.bankAccount.accountHolder}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Rekening pembayaran belum diatur.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Rekening pembayaran hanya dapat diubah oleh Owner.
                    </p>
                  </div>
                )}
                {validationError ? (
                  <p role="alert" className="invoice-error-text">
                    {validationError}
                  </p>
                ) : null}
                {bankMutation.isError ? (
                  <div className="space-y-3">
                    <p role="status" className="text-sm text-muted-foreground">
                      Jatuh tempo sudah tersimpan. Rekening belum tersimpan;
                      klik simpan untuk mencoba kembali.
                    </p>
                    <InvoiceError error={bankMutation.error} />
                  </div>
                ) : null}
              </div>
            </FormSection>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            Batal
          </DialogButton>
          <DialogButton type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'simpan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

export function GenerateInvoicesDialog({
  settings,
  student,
  onClose,
  onGenerated,
}: {
  settings: InvoiceSettings
  student?: { id: string; name: string }
  onClose: () => void
  onGenerated: (message: string) => void
}) {
  const mutation = useInvoiceMutation(generateInvoices)
  const [scope, setScope] = useState<'all' | 'student'>(
    student ? 'student' : 'all',
  )
  const [selectedStudent, setSelectedStudent] =
    useState<InvoiceStudentOption | null>(null)
  const targetStudent = student ?? selectedStudent
  const today = billingToday(),
    period = today.slice(0, 7)
  const lastDay = new Date(
    Number(period.slice(0, 4)),
    Number(period.slice(5, 7)),
    0,
  ).getDate()
  const configured = `${period}-${String(Math.min(settings.dueDay, lastDay)).padStart(2, '0')}`
  const defaultDue = configured > today ? configured : today
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending || (scope === 'student' && !targetStudent)) return
    const dueDate = formText(new FormData(event.currentTarget), 'dueDate')
    try {
      const result = await mutation.mutateAsync({
        dueDate,
        ...(scope === 'student' && targetStudent
          ? { studentId: targetStudent.id }
          : {}),
      })
      onGenerated(
        scope === 'student' && targetStudent
          ? result.created > 0
            ? `Invoice untuk ${targetStudent.name} berhasil dibuat.`
            : `Invoice ${targetStudent.name} untuk ${periodLabel(period)} sudah tersedia.`
          : `${result.created} invoice dibuat; ${result.skippedExisting} sudah tersedia; ${result.skippedMissingFee} siswa belum memiliki tarif SPP.`,
      )
      onClose()
    } catch {
      /* The mutation error is rendered in the dialog. */
    }
  }
  return (
    <Dialog
      title="Generate Invoice Bulanan"
      description={
        student
          ? `Terbitkan invoice ${periodLabel(period)} hanya untuk ${student.name}. Invoice yang sudah ada akan dilewati.`
          : `Terbitkan invoice ${periodLabel(period)} untuk semua siswa aktif atau satu siswa tertentu. Invoice yang sudah ada akan dilewati.`
      }
      onDismiss={onClose}
      isPending={mutation.isPending}
      size="small"
    >
      <DialogForm onSubmit={(event) => void submit(event)}>
        <DialogBody>
          {student ? (
            <div className="invoice-brief">
              <p className="text-xs text-muted-foreground">
                Invoice hanya untuk siswa
              </p>
              <p className="mt-1 font-semibold">{student.name}</p>
            </div>
          ) : (
            <fieldset disabled={mutation.isPending} className="space-y-3">
              <legend className="mb-2 text-sm font-semibold">
                Buat invoice untuk
              </legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="generation-scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                />
                Semua siswa aktif
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="generation-scope"
                  value="student"
                  checked={scope === 'student'}
                  onChange={() => setScope('student')}
                />
                Siswa tertentu
              </label>
            </fieldset>
          )}
          {scope === 'student' && !student ? (
            <InvoiceStudentSelector
              selected={selectedStudent}
              onSelect={setSelectedStudent}
              disabled={mutation.isPending}
            />
          ) : null}
          <div className="invoice-field">
            <label htmlFor="generation-due">Jatuh tempo invoice baru</label>
            <Input
              id="generation-due"
              name="dueDate"
              type="date"
              min={today}
              defaultValue={defaultDue}
              required
              disabled={mutation.isPending}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Generate manual dapat menerbitkan tagihan bulan berjalan untuk siswa
            yang penagihan otomatisnya baru dimulai bulan depan. Siswa tanpa
            tarif dan siswa nonaktif dilewati.
          </p>
          {mutation.isError ? <InvoiceError error={mutation.error} /> : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </DialogButton>
          <DialogButton
            type="submit"
            disabled={
              mutation.isPending || (scope === 'student' && !targetStudent)
            }
          >
            {mutation.isPending ? 'Menerbitkan...' : 'Generate Invoice'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

function InvoiceStudentSelector({
  selected,
  onSelect,
  disabled,
}: {
  selected: InvoiceStudentOption | null
  onSelect: (student: InvoiceStudentOption | null) => void
  disabled: boolean
}) {
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' })
  const query = useInvoiceStudentOptions(filters)
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-3">
      <legend className="mb-2 text-sm font-semibold">Pilih siswa</legend>
      <DebouncedSearchInput
        aria-label="Cari siswa untuk invoice"
        placeholder="Cari nama atau nomor siswa..."
        value={filters.search}
        onSearch={(search) => {
          onSelect(null)
          setFilters({ ...filters, page: 1, search })
        }}
      />
      {query.isPending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Memuat siswa...
        </p>
      ) : query.isError ? (
        <InvoiceError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <label className="sr-only" htmlFor="generation-student">
            Siswa yang ditagih
          </label>
          <select
            id="generation-student"
            name="studentId"
            className="invoice-select w-full"
            required
            value={selected?.id ?? ''}
            onChange={(event) =>
              onSelect(
                query.data.data.find(
                  (candidate) => candidate.id === event.target.value,
                ) ?? null,
              )
            }
            aria-describedby="generation-student-help"
          >
            <option value="">Pilih siswa...</option>
            {query.data.data.map((candidate) => (
              <option
                key={candidate.id}
                value={candidate.id}
                disabled={candidate.monthlyFee === null}
              >
                {candidate.name} · {candidate.studentCode} ·{' '}
                {candidate.monthlyFee === null
                  ? 'Tarif SPP belum diatur'
                  : rupiah(candidate.monthlyFee)}
              </option>
            ))}
          </select>
          {query.data.meta.total > 0 ? (
            <TablePagination
              meta={query.data.meta}
              itemLabel="siswa"
              ariaLabel="Halaman pilihan siswa"
              onPageChange={(page) => {
                onSelect(null)
                setFilters({ ...filters, page })
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Tidak ada siswa aktif yang sesuai pencarian.
            </p>
          )}
        </>
      )}
      <p id="generation-student-help" className="text-xs text-muted-foreground">
        Siswa harus aktif dan memiliki tarif SPP. Invoice hanya dibuat untuk
        siswa yang dipilih.
      </p>
    </fieldset>
  )
}

type Adjustment = {
  key: string
  kind: 'charge' | 'discount'
  description: string
  amount: string
}
export function EditInvoiceDialog({
  invoice,
  onClose,
}: {
  invoice: InvoiceDetail
  onClose: () => void
}) {
  const [adjustments, setAdjustments] = useState<Adjustment[]>(() =>
    invoice.items
      .filter((item) => item.kind !== 'tuition')
      .map((item) => ({
        key: item.id,
        kind: item.kind === 'discount' ? 'discount' : 'charge',
        description: item.description,
        amount: String(item.unitAmount * item.quantity),
      })),
  )
  const tuition = invoice.items.find((item) => item.kind === 'tuition')
  const mutation = useInvoiceMutation(saveInvoiceItems)
  const [validationError, setValidationError] = useState('')
  const total =
    (tuition ? tuition.quantity * tuition.unitAmount : 0) +
    adjustments.reduce(
      (sum, item) =>
        sum + (item.kind === 'discount' ? -1 : 1) * Number(item.amount),
      0,
    )
  function update(key: string, values: Partial<Adjustment>) {
    setAdjustments((previous) =>
      previous.map((item) =>
        item.key === key ? { ...item, ...values } : item,
      ),
    )
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tuition || mutation.isPending) return
    setValidationError('')
    if (!Number.isSafeInteger(total) || total <= 0) {
      setValidationError('Total pembayaran harus lebih besar dari nol.')
      return
    }
    const items: InvoiceItemInput[] = [
      {
        kind: 'tuition',
        description: tuition.description,
        quantity: tuition.quantity,
        unitAmount: tuition.unitAmount,
      },
      ...adjustments.map((item) => ({
        kind: item.kind,
        description: item.description.trim(),
        quantity: 1,
        unitAmount: Number(item.amount),
      })),
    ]
    await mutation
      .mutateAsync({ id: invoice.id, version: invoice.version, items })
      .then(onClose)
      .catch(() => undefined)
  }
  return (
    <Dialog
      title="Ubah Rincian Tagihan"
      description="Perbarui potongan dan biaya tambahan sebelum invoice dilunasi."
      onDismiss={onClose}
      isPending={mutation.isPending}
      size="medium"
    >
      <DialogForm onSubmit={(event) => void submit(event)}>
        <DialogBody>
          <InvoiceBrief invoice={invoice} showTotal={false} />
          <fieldset disabled={mutation.isPending} className="invoice-fields">
            <div className="invoice-actions justify-between">
              <div>
                <h3 className="font-semibold text-sm">Item Tambahan</h3>
                <p className="text-xs text-muted-foreground">
                  Tambahan atau potongan nilai invoice.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={adjustments.length >= 99}
                onClick={() =>
                  setAdjustments((previous) => [
                    ...previous,
                    {
                      key: crypto.randomUUID(),
                      kind: 'charge',
                      description: '',
                      amount: '',
                    },
                  ])
                }
              >
                <Plus size={14} aria-hidden="true" />
                Tambah Item
              </Button>
            </div>
            {adjustments.map((item) => (
              <div key={item.key} className="invoice-adjustment">
                <div className="invoice-field">
                  <label htmlFor={`kind-${item.key}`}>Jenis</label>
                  <select
                    id={`kind-${item.key}`}
                    className="invoice-select"
                    value={item.kind}
                    onChange={(event) =>
                      update(item.key, {
                        kind:
                          event.target.value === 'discount'
                            ? 'discount'
                            : 'charge',
                      })
                    }
                  >
                    <option value="charge">Tambahan</option>
                    <option value="discount">Potongan</option>
                  </select>
                </div>
                <div className="invoice-field">
                  <label htmlFor={`description-${item.key}`}>Keterangan</label>
                  <Input
                    id={`description-${item.key}`}
                    required
                    maxLength={200}
                    value={item.description}
                    onChange={(event) =>
                      update(item.key, { description: event.target.value })
                    }
                  />
                </div>
                <div className="invoice-field">
                  <label htmlFor={`amount-${item.key}`}>Nominal (Rp)</label>
                  <Input
                    id={`amount-${item.key}`}
                    type="number"
                    min={1}
                    max={1_000_000_000}
                    step={1}
                    required
                    value={item.amount}
                    onChange={(event) =>
                      update(item.key, { amount: event.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Hapus ${item.description || 'item tambahan'}`}
                  onClick={() =>
                    setAdjustments((previous) =>
                      previous.filter((value) => value.key !== item.key),
                    )
                  }
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </div>
            ))}
          </fieldset>
          <div className="invoice-total">
            <span>Total Pembayaran:</span>
            <strong>{rupiah(Number.isFinite(total) ? total : 0)}</strong>
          </div>
          {validationError ? (
            <p role="alert" className="invoice-error-text">
              {validationError}
            </p>
          ) : null}
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
          <DialogButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

export function ReverseInvoiceDialog({
  invoice,
  onClose,
}: {
  invoice: InvoiceDetail
  onClose: () => void
}) {
  const payment = invoice.payments.find((item) => !item.reversedAt)
  const mutation = useInvoiceMutation(reversePayment)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!payment || mutation.isPending) return
    const reason = formText(new FormData(event.currentTarget), 'reason').trim()
    await mutation
      .mutateAsync({
        id: invoice.id,
        paymentId: payment.id,
        version: invoice.version,
        reason,
      })
      .then(onClose)
      .catch(() => undefined)
  }
  return (
    <Dialog
      title="Batalkan Pencatatan Pelunasan"
      description="Invoice akan kembali belum lunas. Status siswa dihitung ulang berdasarkan tunggakan. Riwayat pembayaran tetap tersimpan."
      onDismiss={onClose}
      isPending={mutation.isPending}
      size="small"
    >
      <DialogForm onSubmit={(event) => void submit(event)}>
        <DialogBody>
          <p className="text-sm">
            {invoice.number} · {rupiah(invoice.total)} ·{' '}
            {payment ? dateLabel(payment.paidAt) : ''}
          </p>
          <div className="invoice-field">
            <label htmlFor="reversal-reason">Alasan pembatalan</label>
            <textarea
              id="reversal-reason"
              name="reason"
              className="invoice-textarea"
              required
              minLength={3}
              maxLength={1000}
              disabled={mutation.isPending}
            />
          </div>
          {mutation.isError ? <InvoiceError error={mutation.error} /> : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Kembali
          </DialogButton>
          <DialogButton
            variant="destructive"
            type="submit"
            disabled={mutation.isPending || !payment}
          >
            {mutation.isPending ? 'Membatalkan...' : 'Batalkan pelunasan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

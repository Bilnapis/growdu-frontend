import { useId, useState, type FormEvent } from 'react'
import { InfoIcon, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { FormSection } from '@/components/ui/form-section'
import {
  generatePayroll,
  savePayrollItems,
  savePayrollSettings,
  reversePayrollPayment,
  type PayrollDetail,
  type PayrollSettings,
  type PayrollPeriod,
  type AdjustmentInput,
} from './api'
import {
  usePayrollMutation,
  usePayrollPeriods,
  usePayrollTutors,
} from './hooks'
import { dateLabel, decimalMinor, rangeLabel, rupiah, todayWib } from './format'
import { PayrollBadge, PayrollError } from './PayrollShared'

function PayrollPeriodPreview({
  title,
  period,
}: {
  title: string
  period: Pick<PayrollPeriod, 'startDate' | 'endDate' | 'payDate'>
}) {
  const titleId = useId()

  return (
    <section
      className="mt-4 grid gap-4 rounded-[var(--radius-lg)] bg-[var(--color-brand-50)] p-4 text-[13px] leading-normal"
      aria-labelledby={titleId}
    >
      <div className="flex items-center gap-2 text-primary-text [&_h3]:text-sm [&_h3]:font-semibold">
        <InfoIcon size={18} strokeWidth={2} aria-hidden="true" />
        <h3 id={titleId}>{title}</h3>
      </div>
      <dl className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4 [&_dt]:mb-1 [&_dt]:text-xs [&_dt]:text-[var(--color-neutral-600)] [&_dd]:font-semibold [&_dd]:[overflow-wrap:anywhere] [@container_(max-width:420px)]:grid-cols-1">
        <div>
          <dt>Periode penggajian</dt>
          <dd>{rangeLabel(period)}</dd>
        </div>
        <div>
          <dt>Tanggal penggajian</dt>
          <dd>{dateLabel(period.payDate)}</dd>
        </div>
      </dl>
    </section>
  )
}

function periodPreview(day: number, settings: PayrollSettings) {
  const today = todayWib()
  const existing = settings.nextPeriod
  const dateInMonth = (month: string) => {
    const last = new Date(
      Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0),
    ).getUTCDate()
    return `${month}-${String(Math.min(day, last)).padStart(2, '0')}`
  }
  if (existing) {
    return { ...existing, payDate: dateInMonth(existing.payDate.slice(0, 7)) }
  }
  let payDate = dateInMonth(today.slice(0, 7))
  if (payDate < today) {
    const next = new Date(
      Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 1),
    )
    payDate = dateInMonth(next.toISOString().slice(0, 7))
  }
  const end = new Date(`${payDate.slice(0, 7)}-01T00:00:00Z`)
  end.setUTCDate(0)
  const endDate = end.toISOString().slice(0, 10)
  return { startDate: `${endDate.slice(0, 7)}-01`, endDate, payDate }
}
export function PayrollSettingsDialog({
  settings,
  onClose,
}: {
  settings: PayrollSettings
  onClose: () => void
}) {
  const [day, setDay] = useState(String(settings.payday))
  const [enabled, setEnabled] = useState(
    settings.configured ? settings.enabled : true,
  )
  const mutation = usePayrollMutation(savePayrollSettings)
  const validDay = /^\d+$/.test(day) && Number(day) >= 1 && Number(day) <= 31
  const preview = validDay
    ? Number(day) === settings.payday && settings.nextPeriod
      ? settings.nextPeriod
      : periodPreview(Number(day), settings)
    : null
  function submit(event: FormEvent) {
    event.preventDefault()
    if (validDay)
      mutation.mutate({ payday: Number(day), enabled }, { onSuccess: onClose })
  }
  return (
    <Dialog
      id="payroll-settings-dialog"
      className="[container-type:inline-size] [&>header]:items-start [&_button]:h-auto [&_button]:min-h-9 [&_button]:whitespace-normal [&_button]:[overflow-wrap:anywhere] [&_button]:transition-[background-color,opacity] [&_button]:duration-[120ms] [&_button]:ease-out [&>header_button]:min-w-10 motion-safe:[&_footer_button]:transition-[background-color,opacity,scale] motion-safe:[&_footer_button]:duration-[120ms,120ms,150ms] motion-safe:[&_footer_button:not(:disabled):active]:[scale:0.96] [@media_(hover:none)]:[&_button:hover]:bg-[var(--color-bg)] [@media_(hover:none)]:[&_button:hover]:text-foreground [@media_(hover:none)]:[&_button[type=submit]:hover]:bg-primary [@media_(hover:none)]:[&_button[type=submit]:hover]:text-primary-foreground"
      title="Pengaturan Penggajian"
      size="medium"
      isPending={mutation.isPending}
      onDismiss={onClose}
    >
      <DialogForm onSubmit={submit}>
        <DialogBody>
          <div className="space-y-3">
            <FormSection
              title="Jadwal & Otomatisasi"
              description="Perhitungan mencakup tanggal 1 sampai hari terakhir bulan sebelumnya."
            >
              <div className="grid min-w-0 gap-6 text-[13px] leading-normal">
                <div className="grid min-w-0 grid-cols-2 items-center gap-x-4 gap-y-2 text-[13px]">
                  <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label htmlFor="payroll-day">
                      Tanggal penggajian setiap bulan
                    </label>
                    <p id="payroll-day-help">
                      Jika tanggal tidak tersedia, gunakan hari terakhir bulan.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col items-end justify-end gap-1 text-muted-foreground">
                    <Input
                      id="payroll-day"
                      className="w-[60px] max-w-full text-center"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      required
                      value={day}
                      aria-describedby="payroll-day-help payroll-day-validation"
                      aria-invalid={!validDay}
                      disabled={mutation.isPending}
                      onChange={(e) => setDay(e.target.value)}
                    />
                    {!validDay ? (
                      <p
                        id="payroll-day-validation"
                        className="col-span-full text-xs text-[var(--color-danger)]"
                        role="alert"
                      >
                        Masukkan tanggal antara 1 dan 31.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-2 items-center gap-x-4 gap-y-2 text-[13px]">
                  <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label
                      htmlFor="payroll-automation"
                      id="payroll-automation-label"
                    >
                      Generate penggajian otomatis
                    </label>
                    <p id="payroll-automation-help">
                      Buat penggajian otomatis pada tanggal yang ditentukan.
                    </p>
                  </div>
                  <input
                    id="payroll-automation"
                    className="h-6 w-10 justify-self-end cursor-pointer appearance-none rounded-full border border-[var(--color-neutral-500)] bg-[var(--color-neutral-500)] transition-colors duration-[120ms] ease-out before:my-0.5 before:ms-0.5 before:block before:size-[18px] before:rounded-full before:bg-[var(--color-surface)] before:shadow-[var(--shadow-sm)] before:content-[''] checked:border-primary-text checked:bg-primary-text checked:before:ms-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 motion-safe:before:transition-[margin-inline-start] motion-safe:before:duration-150 motion-safe:before:ease-out [@media_(forced-colors:active)]:appearance-auto [@media_(forced-colors:active)]:before:hidden"
                    type="checkbox"
                    role="switch"
                    aria-labelledby="payroll-automation-label"
                    aria-describedby="payroll-automation-help"
                    checked={enabled}
                    disabled={mutation.isPending}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                </div>
              </div>
              {preview ? (
                <PayrollPeriodPreview
                  title="Periode penggajian berikutnya"
                  period={preview}
                />
              ) : null}
              {mutation.isError ? (
                <PayrollError error={mutation.error} />
              ) : null}
            </FormSection>
          </div>
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
            disabled={!validDay || mutation.isPending}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}
function manualPeriodPreview(
  month: string,
  payday: number,
  periods: PayrollPeriod[],
) {
  const existing = periods.find((p) => p.startDate === `${month}-01`)
  if (existing) return existing
  const year = Number(month.slice(0, 4))
  const monthNumber = Number(month.slice(5, 7))
  const endDate = new Date(Date.UTC(year, monthNumber, 0))
    .toISOString()
    .slice(0, 10)
  const lastPayDay = new Date(Date.UTC(year, monthNumber + 1, 0)).getUTCDate()
  const payDate = new Date(
    Date.UTC(year, monthNumber, Math.min(payday, lastPayDay)),
  )
    .toISOString()
    .slice(0, 10)
  return { startDate: `${month}-01`, endDate, payDate }
}
export function GeneratePayrollDialog({
  settings,
  onClose,
  onGenerated,
}: {
  onClose: () => void
  onGenerated: (message: string) => void
  settings: PayrollSettings
}) {
  const periods = usePayrollPeriods()
  const today = todayWib()
  const lastClosedMonth = new Date(
    Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, 0),
  )
    .toISOString()
    .slice(0, 7)
  const [sessionMonth, setSessionMonth] = useState(lastClosedMonth)
  const [scope, setScope] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [tutorId, setTutorId] = useState('')
  const tutors = usePayrollTutors(search, page)
  const validMonth =
    /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(sessionMonth) &&
    sessionMonth <= lastClosedMonth
  const preview =
    validMonth && periods.data
      ? manualPeriodPreview(sessionMonth, settings.payday, periods.data)
      : null
  const mutation = usePayrollMutation(generatePayroll)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!validMonth || !preview || mutation.isPending) return
    mutation.mutate(
      { sessionMonth, ...(scope === 'one' ? { tutorId } : {}) },
      {
        onSuccess: (result) => {
          if (result.created === 0) return
          onGenerated(
            `${result.created} penggajian dibuat. ${result.skippedExisting} sudah tersedia, ${result.skippedMissingRate} tarif belum diatur, ${result.skippedNoSessions} tanpa sesi tersimpan.`,
          )
          onClose()
        },
      },
    )
  }
  return (
    <Dialog
      className="[container-type:inline-size]"
      title="Buat Penggajian"
      size="medium"
      isPending={mutation.isPending}
      onDismiss={onClose}
    >
      <DialogForm onSubmit={submit}>
        <DialogBody>
          <div className="space-y-3">
            <FormSection
              title="Periode Penggajian"
              description="Pilih bulan sesi mengajar yang akan dihitung."
            >
              {periods.isPending ? (
                <p role="status">Memuat periode...</p>
              ) : periods.isError ? (
                <PayrollError
                  error={periods.error}
                  retry={() => void periods.refetch()}
                />
              ) : (
                <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold">
                  <label htmlFor="generate-payroll-month">
                    Pilih Periode Penggajian
                  </label>
                  <Input
                    id="generate-payroll-month"
                    type="month"
                    required
                    min="1000-01"
                    max={lastClosedMonth}
                    value={sessionMonth}
                    disabled={mutation.isPending}
                    aria-invalid={!validMonth}
                    aria-describedby="generate-payroll-month-help"
                    onChange={(event) => setSessionMonth(event.target.value)}
                  />
                  {!validMonth ? (
                    <p
                      role="alert"
                      className="text-xs text-[var(--color-danger)]"
                    >
                      Pilih bulan sebelum bulan berjalan.
                    </p>
                  ) : null}
                  {preview ? (
                    <PayrollPeriodPreview
                      title="Preview periode penggajian"
                      period={preview}
                    />
                  ) : null}
                </div>
              )}
            </FormSection>
            <FormSection
              title="Penerima Penggajian"
              description="Buat penggajian untuk semua tentor atau satu tentor tertentu."
            >
              <div className="space-y-3.5">
                <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                  <label htmlFor="payroll-scope">Penerima penggajian</label>
                  <Select
                    id="payroll-scope"
                    value={scope}
                    disabled={mutation.isPending}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="all">
                      Semua tentor dengan presensi tersimpan
                    </option>
                    <option value="one">Pilih satu tentor</option>
                  </Select>
                </div>
                {scope === 'one' ? (
                  <div className="space-y-3">
                    <DebouncedSearchInput
                      aria-label="Cari tentor"
                      placeholder="Cari nama tentor..."
                      value={search}
                      onSearch={(value) => {
                        setSearch(value)
                        setPage(1)
                        setTutorId('')
                      }}
                    />
                    {tutors.isError ? (
                      <PayrollError
                        error={tutors.error}
                        retry={() => void tutors.refetch()}
                      />
                    ) : (
                      <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                        <label htmlFor="generate-payroll-tutor">Tentor</label>
                        <Select
                          id="generate-payroll-tutor"
                          required
                          value={tutorId}
                          disabled={tutors.isPending || mutation.isPending}
                          onChange={(e) => setTutorId(e.target.value)}
                        >
                          <option value="">
                            {tutors.isPending
                              ? 'Memuat tentor...'
                              : 'Pilih tentor'}
                          </option>
                          {tutors.data?.data.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                              {t.status === 'inactive'
                                ? ' (Nonaktif)'
                                : ''} ·{' '}
                              {Number(t.sessionRate)
                                ? `${rupiah(t.sessionRate)}/sesi`
                                : 'Tarif belum diatur'}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page <= 1 || mutation.isPending}
                        onClick={() => {
                          setPage((p) => p - 1)
                          setTutorId('')
                        }}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          !tutors.data ||
                          page >= tutors.data.meta.totalPages ||
                          mutation.isPending
                        }
                        onClick={() => {
                          setPage((p) => p + 1)
                          setTutorId('')
                        }}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Penggajian yang sudah tersedia tidak ditimpa. Gunakan Perbarui
                  dari Presensi untuk menghitung ulang rinciannya.
                </p>
              </div>
            </FormSection>
          </div>
          {mutation.isSuccess && mutation.data.created === 0 ? (
            <div
              role="status"
              className="rounded-[var(--radius-sm)] bg-[var(--color-warning-bg)] p-3 text-[13px] text-[var(--color-warning)] space-y-2"
            >
              <p className="font-semibold">Belum ada penggajian yang dibuat.</p>
              {mutation.data.skippedMissingRate > 0 ? (
                <p>
                  {mutation.data.skippedMissingRate} tentor memiliki presensi,
                  tetapi tarif per sesinya belum diatur. Isi tarif melalui
                  Tambah/Ubah Data Tentor, lalu buat ulang penggajian untuk
                  periode yang sama.
                </p>
              ) : null}
              {mutation.data.skippedNoSessions > 0 ? (
                <p>
                  {mutation.data.skippedNoSessions} tentor belum memiliki
                  presensi tersimpan pada periode ini. Simpan presensi sesi
                  mengajar pada periode yang dipilih, lalu coba lagi.
                </p>
              ) : null}
              {mutation.data.skippedExisting > 0 ? (
                <p>
                  {mutation.data.skippedExisting} penggajian sudah tersedia.
                  Tutup dialog dan periksa daftar penggajian beserta filternya.
                </p>
              ) : null}
            </div>
          ) : null}
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
            disabled={
              !validMonth ||
              !preview ||
              periods.isError ||
              (scope === 'one' && !tutorId) ||
              mutation.isPending
            }
          >
            {mutation.isPending ? 'Membuat...' : 'Buat Penggajian'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}
export function EditPayrollDialog({
  payroll,
  onClose,
}: {
  payroll: PayrollDetail
  onClose: () => void
}) {
  const [teaching, setTeaching] = useState(() =>
    payroll.items
      .filter((i) => i.kind === 'teaching')
      .map((i) => ({
        id: i.id,
        description: i.description,
        sourceCount: i.sourceCount,
        quantity: String(i.quantity),
        rate: i.rate,
        correctionReason: i.correctionReason ?? '',
      })),
  )
  const [extras, setExtras] = useState(() =>
    payroll.items
      .filter((i) => i.kind !== 'teaching')
      .map((i) => ({
        key: i.id,
        kind:
          i.kind === 'deduction'
            ? ('deduction' as const)
            : ('addition' as const),
        description: i.description,
        amount: i.rate,
      })),
  )
  const mutation = usePayrollMutation(savePayrollItems)
  const [validation, setValidation] = useState('')
  const teachingValues = teaching.map((i) => {
    const rate = decimalMinor(i.rate)
    return rate === null || !/^\d+$/.test(i.quantity)
      ? null
      : rate * Number(i.quantity)
  })
  const extraValues = extras.map((i) => {
    const value = decimalMinor(i.amount)
    return value === null ? null : value * (i.kind === 'deduction' ? -1 : 1)
  })
  const amounts = [...teachingValues, ...extraValues]
  const total = amounts.some((i) => i === null)
    ? null
    : amounts.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (total === null || total <= 0 || !Number.isSafeInteger(total)) {
      setValidation(
        'Periksa nominal dan jumlah sesi. Total gaji harus lebih dari nol.',
      )
      return
    }
    if (
      teaching.some(
        (i) =>
          Number(i.quantity) !== i.sourceCount &&
          i.correctionReason.trim().length < 3,
      )
    ) {
      setValidation('Isi alasan koreksi jumlah sesi, minimal 3 karakter.')
      return
    }
    setValidation('')
    mutation.mutate(
      {
        id: payroll.id,
        version: payroll.version,
        teaching: teaching.map(({ id, quantity, rate, correctionReason }) => ({
          id,
          quantity: Number(quantity),
          rate,
          correctionReason,
        })),
        adjustments: extras.map(
          ({ kind, description, amount }): AdjustmentInput => ({
            kind,
            description,
            amount,
          }),
        ),
      },
      { onSuccess: onClose },
    )
  }
  return (
    <Dialog
      title="Ubah Rincian Gaji"
      description="Perbarui jumlah sesi, tarif, tambahan, dan potongan sebelum pembayaran."
      size="default"
      isPending={mutation.isPending}
      onDismiss={onClose}
    >
      <DialogForm onSubmit={submit}>
        <DialogBody>
          <div className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
            <div className="min-w-0 space-y-1 break-words">
              <strong>{payroll.number}</strong>
              <p className="text-muted-foreground">
                {payroll.tutorName} · {rangeLabel(payroll)}
              </p>
            </div>
            <div className="shrink-0">
              <PayrollBadge status={payroll.status} />
            </div>
          </div>
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <legend className="sr-only">Rincian penggajian</legend>
            {teaching.map((item, index) => (
              <div key={item.id} className="space-y-2 rounded-md border p-3">
                <div className="grid grid-cols-1 gap-3 min-[641px]:grid-cols-3">
                  <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span className="font-semibold">Kelompok Belajar</span>
                    <strong>{item.description}</strong>
                  </div>
                  <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label htmlFor={`payroll-quantity-${index}`}>
                      Jumlah Sesi
                    </label>
                    <Input
                      id={`payroll-quantity-${index}`}
                      type="number"
                      min={0}
                      max={100000}
                      step={1}
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        setTeaching((values) =>
                          values.map((i) =>
                            i.id === item.id
                              ? { ...i, quantity: e.target.value }
                              : i,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label htmlFor={`payroll-rate-${index}`}>
                      Tarif per Sesi
                    </label>
                    <Input
                      id={`payroll-rate-${index}`}
                      leadingText="Rp"
                      isCurrency
                      allowCurrencyDecimals
                      inputMode="decimal"
                      required
                      value={item.rate}
                      onChange={(e) => {
                        const rate = e.target.value
                        setTeaching((values) =>
                          values.map((i) =>
                            i.id === item.id ? { ...i, rate } : i,
                          ),
                        )
                      }}
                    />
                  </div>
                </div>
                {Number(item.quantity) !== item.sourceCount ? (
                  <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <label htmlFor={`payroll-reason-${index}`}>
                      Alasan Koreksi Sesi
                    </label>
                    <Input
                      id={`payroll-reason-${index}`}
                      required
                      minLength={3}
                      maxLength={1000}
                      value={item.correctionReason}
                      onChange={(e) =>
                        setTeaching((values) =>
                          values.map((i) =>
                            i.id === item.id
                              ? { ...i, correctionReason: e.target.value }
                              : i,
                          ),
                        )
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
            <FormSection
              title="Item Tambahan"
              description="Bonus, tunjangan, atau potongan gaji."
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 self-end sm:self-auto"
                  disabled={extras.length >= 100}
                  onClick={() =>
                    setExtras((values) => [
                      ...values,
                      {
                        key: crypto.randomUUID(),
                        kind: 'addition',
                        description: '',
                        amount: '',
                      },
                    ])
                  }
                >
                  <Plus size={14} aria-hidden="true" />
                  Tambah Item
                </Button>
              }
            >
              {extras.map((item, index) => (
                <div
                  key={item.key}
                  className="mt-3 grid grid-cols-[1fr_auto] gap-3 rounded-md border p-3"
                >
                  <div className="grid grid-cols-1 gap-3 min-[641px]:grid-cols-3">
                    <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                      <label htmlFor={`extra-kind-${index}`}>Jenis</label>
                      <Select
                        id={`extra-kind-${index}`}
                        value={item.kind}
                        onChange={(e) =>
                          setExtras((values) =>
                            values.map((i) =>
                              i.key === item.key
                                ? {
                                    ...i,
                                    kind:
                                      e.target.value === 'deduction'
                                        ? 'deduction'
                                        : 'addition',
                                  }
                                : i,
                            ),
                          )
                        }
                      >
                        <option value="addition">Tambahan</option>
                        <option value="deduction">Potongan</option>
                      </Select>
                    </div>
                    <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                      <label htmlFor={`extra-label-${index}`}>Keterangan</label>
                      <Input
                        id={`extra-label-${index}`}
                        required
                        maxLength={200}
                        value={item.description}
                        onChange={(e) =>
                          setExtras((values) =>
                            values.map((i) =>
                              i.key === item.key
                                ? { ...i, description: e.target.value }
                                : i,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                      <label htmlFor={`extra-amount-${index}`}>Nominal</label>
                      <Input
                        id={`extra-amount-${index}`}
                        leadingText="Rp"
                        isCurrency
                        allowCurrencyDecimals
                        required
                        inputMode="decimal"
                        value={item.amount}
                        onChange={(e) => {
                          const amount = e.target.value
                          setExtras((values) =>
                            values.map((i) =>
                              i.key === item.key ? { ...i, amount } : i,
                            ),
                          )
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 self-end"
                    aria-label={`Hapus item ${index + 1}`}
                    onClick={() =>
                      setExtras((values) =>
                        values.filter((i) => i.key !== item.key),
                      )
                    }
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </FormSection>
          </fieldset>
          <div className="ms-auto mt-4 flex w-fit max-w-full items-center justify-between gap-4 rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] p-3 text-[13px] font-semibold [&_p]:font-bold [&_p]:text-primary">
            <span>Total Gaji:</span>
            <p>{total === null ? 'Rp. 0' : rupiah(total / 100)}</p>
          </div>
          {validation ? (
            <p
              role="alert"
              className="rounded-[var(--radius-sm)] bg-[var(--color-warning-bg)] p-3 text-[13px] text-[var(--color-warning)]"
            >
              {validation}
            </p>
          ) : null}
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
          <DialogButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}
export function ReversePayrollDialog({
  payroll,
  paymentId,
  onClose,
}: {
  payroll: PayrollDetail
  paymentId: string
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const mutation = usePayrollMutation(reversePayrollPayment)
  return (
    <Dialog
      title="Batalkan Pembayaran"
      description="Riwayat dan slip lama tetap tersimpan. Rincian penggajian dan presensi sumber dapat diperbaiki setelah pembatalan."
      size="small"
      isPending={mutation.isPending}
      onDismiss={onClose}
    >
      <DialogForm
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate(
            {
              id: payroll.id,
              paymentId,
              version: payroll.version,
              reason: reason.trim(),
            },
            { onSuccess: onClose },
          )
        }}
      >
        <DialogBody>
          <p className="text-sm font-semibold">
            {payroll.number} · {rupiah(payroll.total)}
          </p>
          <div className="grid min-w-0 gap-2 text-[13px] [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
            <label htmlFor="payroll-reversal-reason">Alasan Pembatalan</label>
            <textarea
              id="payroll-reversal-reason"
              required
              minLength={3}
              maxLength={1000}
              className="min-h-20 w-full rounded-[var(--radius-sm)] border border-border bg-[var(--color-surface)] p-3 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled={mutation.isPending}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {mutation.isError ? <PayrollError error={mutation.error} /> : null}
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
            type="submit"
            variant="destructive"
            disabled={reason.trim().length < 3 || mutation.isPending}
          >
            {mutation.isPending ? 'Membatalkan...' : 'Batalkan Pembayaran'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

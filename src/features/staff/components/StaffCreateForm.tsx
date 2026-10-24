import { useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { StaffCreateDialog } from './StaffCreateDialog'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStaffTenantId, getStaffError } from '@/features/staff/api/staff-api'
import { useCreateStaff } from '@/features/staff/hooks/use-staff'

const accountFields = [
  { id: 'name', label: 'Nama', placeholder: 'Masukkan nama lengkap pegawai', type: 'text', autoComplete: 'name' },
  { id: 'phoneNumber', label: 'Nomor HP', placeholder: '081234567890', type: 'tel', autoComplete: 'tel' },
  { id: 'email', label: 'Email', placeholder: 'nama@bimbelkit.com', type: 'email', autoComplete: 'email' },
  { id: 'password', label: 'Password', placeholder: 'Minimal 5 karakter', type: 'password', autoComplete: 'new-password' },
  { id: 'confirmation', label: 'Ulangi Password', placeholder: 'Ulangi password pegawai', type: 'password', autoComplete: 'new-password' },
] as const

type FieldId = (typeof accountFields)[number]['id']
type FormValues = Record<FieldId, string> & { address: string }

export function StaffCreateForm() {
  const navigate = useNavigate()
  const tenantId = getStaffTenantId()
  const createMutation = useCreateStaff(tenantId)
  const submittingRef = useRef(false)
  const [values, setValues] = useState<FormValues>({ phoneNumber: '', name: '', email: '', password: '', confirmation: '', address: '' })
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({})
  const [submissionMessage, setSubmissionMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  function closeForm() {
    if (submittingRef.current || createMutation.isPending) return
    void navigate('/staff', { replace: true })
  }

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, ...(field === 'password' ? { confirmation: undefined } : {}) }))
    setSubmissionMessage('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || createMutation.isPending || !tenantId) return
    const nextErrors: Partial<Record<FieldId, string>> = {}
    if (values.name.trim().length < 2 || values.name.trim().length > 150) nextErrors.name = 'Nama pegawai harus berisi 2–150 karakter.'
    if (values.phoneNumber.trim().length < 6 || values.phoneNumber.trim().length > 20) nextErrors.phoneNumber = 'Nomor HP harus berisi 6–20 karakter.'
    if (!values.email.trim() || !formRef.current?.querySelector<HTMLInputElement>('#staff-email')?.validity.valid) nextErrors.email = 'Masukkan alamat email yang valid.'
    if (values.password.length < 5 || values.password.length > 128) nextErrors.password = 'Password harus berisi 5–128 karakter.'
    if (!values.confirmation || values.confirmation !== values.password) nextErrors.confirmation = 'Ulangi password sesuai dengan password di atas.'
    setErrors(nextErrors)
    setSubmissionMessage('')
    const firstInvalidField = accountFields.find((field) => nextErrors[field.id])
    if (firstInvalidField) {
      formRef.current?.querySelector<HTMLInputElement>(`#staff-${firstInvalidField.id}`)?.focus()
      return
    }
    submittingRef.current = true
    createMutation.mutate({
      name: values.name.trim(),
      phoneNumber: values.phoneNumber.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      address: values.address.trim(),
    }, {
      onSuccess: () => {
        setValues((current) => ({ ...current, password: '', confirmation: '' }))
        void navigate('/staff', { replace: true, state: { staffCreated: true } })
      },
      onError: (error) => setSubmissionMessage(getStaffError(error)),
      onSettled: () => { submittingRef.current = false },
    })
  }

  return (
    <StaffCreateDialog isPending={createMutation.isPending} onDismiss={closeForm}>
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 id="staff-create-title" className="text-2xl font-bold leading-[1.3] tracking-tight">Tambah Pegawai</h1>
          <p id="staff-create-description" className="text-sm leading-[1.4] text-muted-foreground">Buat akun pegawai baru untuk mengakses aplikasi.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" disabled={createMutation.isPending} onClick={closeForm} aria-label="Tutup modal tambah pegawai"><X className="h-5 w-5" aria-hidden="true" /></Button>
      </header>

      {!tenantId ? <p role="alert" className="mt-4 text-sm text-destructive">Hanya pemilik bimbel yang dapat menambahkan pegawai. Pilih bimbel terlebih dahulu.</p> : null}
      <form aria-busy={createMutation.isPending} ref={formRef} noValidate onSubmit={handleSubmit} className="mt-[22px] space-y-[22px]">
        <fieldset disabled={createMutation.isPending || !tenantId} aria-labelledby="staff-account-title" className="min-w-0 space-y-[18px] rounded-xl border bg-card p-4 sm:p-5">
          <div className="space-y-1.5">
            <h2 id="staff-account-title" className="text-lg font-bold leading-[1.3]">Data akun pegawai</h2>
            <p className="text-[13px] leading-[1.4] text-muted-foreground">Isi informasi dasar untuk membuat akses login pegawai.</p>
          </div>
          <div className="grid gap-3.5 md:grid-cols-2">
            {accountFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`staff-${field.id}`} className="text-[13px] font-semibold">{field.label}</Label>
                <Input
                  id={`staff-${field.id}`}
                  name={field.id}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={values[field.id]}
                  onChange={(event) => updateField(field.id, event.target.value)}
                  required
                  maxLength={field.type === 'password' ? 128 : field.id === 'phoneNumber' ? 20 : 150}
                  minLength={field.type === 'password' ? 5 : undefined}
                  aria-invalid={Boolean(errors[field.id])}
                  aria-describedby={errors[field.id] ? `staff-${field.id}-error` : undefined}
                  className="rounded-lg bg-[var(--color-bg-light)] aria-[invalid=true]:border-destructive"
                />
                {errors[field.id] ? <p id={`staff-${field.id}-error`} className="text-xs text-destructive">{errors[field.id]}</p> : null}
              </div>
            ))}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-address" className="text-[13px] font-semibold">Alamat</Label>
              <textarea id="staff-address" name="address" maxLength={1000} autoComplete="street-address" value={values.address} onChange={(event) => updateField('address', event.target.value)} placeholder="Tulis alamat domisili pegawai" className="block min-h-28 w-full resize-y rounded-lg border border-input bg-[var(--color-bg-light)] p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
          </div>
        </fieldset>

        {submissionMessage ? <p role="alert" className="rounded-lg border border-[var(--color-info-border)] bg-[var(--color-info-bg)] p-4 text-sm text-[var(--color-info-text)]">{submissionMessage}</p> : null}

        <footer className="sticky -bottom-4 flex min-h-[60px] flex-wrap items-center justify-end gap-2.5 border-t bg-card py-3 sm:-bottom-6">
          <Button type="button" disabled={createMutation.isPending} variant="outline" className="h-11 rounded-lg px-[18px] font-bold" onClick={closeForm}>Batal</Button>
          <Button disabled={createMutation.isPending || !tenantId} type="submit" className="h-11 rounded-lg px-[18px] font-bold">{createMutation.isPending ? 'Menyimpan...' : 'Buat Akun'}</Button>
        </footer>
      </form>
    </StaffCreateDialog>
  )
}

import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import * as yup from 'yup'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StudentRegistrationInput } from '@/features/students/api/students-api'
import {
  useActiveParents,
  useCreateStudentRegistration,
} from '@/features/students/hooks/use-students'
import {
  getYupFieldErrors,
  getYupValidationMessage,
  type FormFieldErrors,
} from '@/lib/yup-validation'
import { ApiError } from '@/services/api-client'
import { StudentDialog } from './StudentDialog'

type StudentRegistrationForm = {
  name: string
  phoneNumber: string
  school: string
  educationLevel: string
  gender: '' | 'male' | 'female'
  address: string
  parentSource: 'new' | 'existing'
  existingParentId: string
  parentName: string
  parentPhoneNumber: string
  parentEmail: string
  status: 'active' | 'inactive'
  password: string
  passwordConfirmation: string
}

const initialForm: StudentRegistrationForm = {
  name: '',
  phoneNumber: '',
  school: '',
  educationLevel: '',
  gender: '',
  address: '',
  parentSource: 'new',
  existingParentId: '',
  parentName: '',
  parentPhoneNumber: '',
  parentEmail: '',
  status: 'active',
  password: '',
  passwordConfirmation: '',
}

const registrationSchema: yup.ObjectSchema<StudentRegistrationForm> = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, 'Nama siswa wajib diisi.')
      .required('Nama siswa wajib diisi.'),
    phoneNumber: yup
      .string()
      .trim()
      .test('optional-phone', 'Nomor HP siswa minimal 6 angka.', (value) =>
        value ? value.length >= 6 : true,
      )
      .defined(),
    school: yup.string().trim().required('Sekolah wajib diisi.'),
    educationLevel: yup.string().trim().required('Jenjang wajib dipilih.'),
    gender: yup
      .mixed<'male' | 'female' | ''>()
      .oneOf(['male', 'female'], 'Jenis kelamin wajib dipilih.')
      .required('Jenis kelamin wajib dipilih.'),
    address: yup.string().trim().required('Alamat siswa wajib diisi.'),
    parentSource: yup
      .mixed<'new' | 'existing'>()
      .oneOf(['new', 'existing'])
      .required(),
    existingParentId: yup
      .string()
      .defined()
      .when('parentSource', {
        is: 'existing',
        then: (schema) => schema.required('Pilih data orang tua.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    parentName: yup
      .string()
      .defined()
      .when('parentSource', {
        is: 'new',
        then: (schema) =>
          schema
            .trim()
            .min(2, 'Nama orang tua wajib diisi.')
            .required('Nama orang tua wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    parentPhoneNumber: yup
      .string()
      .defined()
      .when('parentSource', {
        is: 'new',
        then: (schema) =>
          schema
            .trim()
            .min(6, 'Nomor HP orang tua minimal 6 angka.')
            .required('Nomor HP orang tua wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    parentEmail: yup
      .string()
      .defined()
      .when('parentSource', {
        is: 'new',
        then: (schema) =>
          schema
            .trim()
            .email('Format email belum valid.')
            .required('Email orang tua wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    status: yup
      .mixed<'active' | 'inactive'>()
      .oneOf(['active', 'inactive'])
      .required(),
    password: yup
      .string()
      .defined()
      .when('parentSource', {
        is: 'new',
        then: (schema) =>
          schema
            .min(5, 'Kata sandi minimal 5 karakter.')
            .required('Kata sandi wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    passwordConfirmation: yup
      .string()
      .defined()
      .when('parentSource', {
        is: 'new',
        then: (schema) =>
          schema
            .oneOf([yup.ref('password')], 'Konfirmasi kata sandi tidak sama.')
            .required('Konfirmasi kata sandi wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
  })
  .required()

export function StudentCreateForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createMutation = useCreateStudentRegistration()
  const parentsQuery = useActiveParents(form.parentSource === 'existing')

  const validation = useMemo<{
    errors: FormFieldErrors<keyof StudentRegistrationForm>
    issues: string[]
  }>(() => {
    try {
      registrationSchema.validateSync(form, { abortEarly: false })
      return { errors: {}, issues: [] }
    } catch (error) {
      return {
        errors: getYupFieldErrors<keyof StudentRegistrationForm>(error),
        issues: error instanceof yup.ValidationError ? error.errors : [],
      }
    }
  }, [form])

  function updateField<K extends keyof StudentRegistrationForm>(
    field: K,
    value: StudentRegistrationForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    if (formError) setFormError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (createMutation.isPending) return
    setSubmitted(true)
    setFormError(null)

    let value: StudentRegistrationForm
    try {
      value = registrationSchema.validateSync(form, { abortEarly: false })
    } catch (error) {
      setFormError(
        getYupValidationMessage(error, 'Periksa kembali data siswa.'),
      )
      return
    }

    if (value.gender === '') {
      setFormError('Jenis kelamin wajib dipilih.')
      return
    }

    const base = {
      name: value.name,
      gender: value.gender,
      educationLevel: value.educationLevel,
      school: value.school,
      ...(value.phoneNumber
        ? { phoneNumber: normalizePhone(value.phoneNumber) }
        : {}),
      address: value.address,
      status: value.status,
      relationship: 'guardian' as const,
    }
    const input: StudentRegistrationInput =
      value.parentSource === 'new'
        ? {
            ...base,
            parentSource: 'new',
            newParent: {
              name: value.parentName,
              phoneNumber: normalizePhone(value.parentPhoneNumber),
              email: value.parentEmail,
              password: value.password,
            },
          }
        : {
            ...base,
            parentSource: 'existing',
            parentId: value.existingParentId,
          }

    createMutation.mutate(input, {
      onSuccess: onClose,
      onError: (error: unknown) => setFormError(getMutationError(error)),
    })
  }

  const visibleErrors = submitted ? validation.errors : {}
  const issueCount = submitted ? validation.issues.length : 0

  return (
    <StudentDialog
      title="Tambah Siswa"
      isPending={createMutation.isPending}
      onDismiss={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <fieldset disabled={createMutation.isPending} className="space-y-3">
          <FormSection
            title="Data Siswa"
            description="Identitas dasar yang dipakai pada kelompok belajar, invoice, dan laporan."
          >
            <div className="grid gap-3.5 md:grid-cols-2">
              <FormField
                id="student-name"
                label="Nama siswa"
                required
                value={form.name}
                error={visibleErrors.name}
                onChange={(value) => updateField('name', value)}
              />
              <FormField
                id="student-phone"
                label="Nomor HP siswa"
                value={form.phoneNumber}
                error={visibleErrors.phoneNumber}
                placeholder="Opsional"
                type="tel"
                isPhone
                onChange={(value) => updateField('phoneNumber', value)}
              />
              <FormField
                id="student-school"
                label="Sekolah"
                required
                value={form.school}
                error={visibleErrors.school}
                placeholder="SMP Negeri 2 Bandung"
                onChange={(value) => updateField('school', value)}
              />
              <SelectField
                id="student-level"
                label="Jenjang"
                required
                value={form.educationLevel}
                error={visibleErrors.educationLevel}
                onChange={(value) => updateField('educationLevel', value)}
                options={educationOptions}
                placeholder="Pilih jenjang"
              />
              <SelectField
                id="student-gender"
                label="Jenis kelamin"
                required
                value={form.gender}
                error={visibleErrors.gender}
                onChange={(value) => {
                  if (value === '' || value === 'male' || value === 'female') {
                    updateField('gender', value)
                  }
                }}
                options={[
                  { value: 'female', label: 'Perempuan' },
                  { value: 'male', label: 'Laki-laki' },
                ]}
                placeholder="Pilih jenis kelamin"
              />
              <FormField
                id="student-address"
                label="Alamat siswa"
                required
                value={form.address}
                error={visibleErrors.address}
                placeholder="Jl. Melati No. 12, Bandung"
                onChange={(value) => updateField('address', value)}
              />
            </div>
          </FormSection>

          <FormSection
            title="Data Orang Tua"
            description="Gunakan akun yang sudah ada untuk saudara kandung, atau isi data orang tua di bawah."
            action={
              <div className="flex flex-wrap gap-3 text-[13px] font-semibold">
                <ModeOption
                  label="Orang tua baru"
                  checked={form.parentSource === 'new'}
                  onChange={() => updateField('parentSource', 'new')}
                />
                <ModeOption
                  label="Gunakan data yang ada"
                  checked={form.parentSource === 'existing'}
                  onChange={() => updateField('parentSource', 'existing')}
                />
              </div>
            }
          >
            {form.parentSource === 'new' ? (
              <div className="grid gap-3.5 md:grid-cols-2">
                <FormField
                  id="parent-name"
                  label="Nama orang tua"
                  required
                  value={form.parentName}
                  error={visibleErrors.parentName}
                  onChange={(value) => updateField('parentName', value)}
                />
                <FormField
                  id="parent-phone"
                  label="Nomor HP orang tua"
                  required
                  value={form.parentPhoneNumber}
                  error={visibleErrors.parentPhoneNumber}
                  type="tel"
                  isPhone
                  onChange={(value) => updateField('parentPhoneNumber', value)}
                />
                <FormField
                  id="parent-email"
                  label="Email orang tua"
                  required
                  value={form.parentEmail}
                  error={visibleErrors.parentEmail}
                  type="email"
                  onChange={(value) => updateField('parentEmail', value)}
                />
                <SelectField
                  id="parent-status"
                  label="Status"
                  required
                  value={form.status}
                  onChange={(value) => {
                    if (value === 'active' || value === 'inactive') {
                      updateField('status', value)
                    }
                  }}
                  options={[
                    { value: 'active', label: 'Aktif' },
                    { value: 'inactive', label: 'Nonaktif' },
                  ]}
                />
                <PasswordField
                  id="parent-password"
                  label="Kata sandi"
                  value={form.password}
                  visible={showPassword}
                  error={visibleErrors.password}
                  onToggle={() => setShowPassword((current) => !current)}
                  onChange={(value) => updateField('password', value)}
                />
                <PasswordField
                  id="parent-password-confirmation"
                  label="Konfirmasi kata sandi"
                  value={form.passwordConfirmation}
                  visible={showConfirmation}
                  error={visibleErrors.passwordConfirmation}
                  onToggle={() => setShowConfirmation((current) => !current)}
                  onChange={(value) =>
                    updateField('passwordConfirmation', value)
                  }
                />
              </div>
            ) : (
              <div>
                <SelectField
                  id="existing-parent"
                  label="Data orang tua"
                  required
                  value={form.existingParentId}
                  error={visibleErrors.existingParentId}
                  disabled={parentsQuery.isPending || parentsQuery.isError}
                  onChange={(value) => updateField('existingParentId', value)}
                  options={(parentsQuery.data?.data ?? []).map((parent) => ({
                    value: parent.id,
                    label: `${parent.name} · ${parent.contactEmail}`,
                  }))}
                  placeholder={
                    parentsQuery.isPending
                      ? 'Memuat data orang tua...'
                      : parentsQuery.isError
                        ? 'Data orang tua gagal dimuat'
                        : 'Pilih orang tua'
                  }
                />
                {parentsQuery.data?.data.length === 0 ? (
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Belum ada data orang tua aktif. Pilih “Orang tua baru”.
                  </p>
                ) : null}
              </div>
            )}
          </FormSection>

          <FormSection
            title="Kelompok Awal"
            description="Siswa bisa disimpan tanpa kelompok lalu ditambahkan dari Kelompok Belajar."
          >
            <SelectField
              id="student-group"
              label="Kelompok aktif"
              value=""
              disabled
              onChange={() => undefined}
              options={[]}
              placeholder="Pilih kelompok"
            />
          </FormSection>
        </fieldset>

        {formError ? (
          <p
            role="alert"
            className="rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm font-medium text-[var(--color-danger)]"
          >
            {formError}
          </p>
        ) : null}

        <footer className="sticky -bottom-5 -mx-5 flex flex-col gap-3 border-t border-[var(--color-border)] bg-white px-5 pb-1 pt-4 sm:-bottom-6 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p
            className="text-xs font-medium text-[var(--color-muted)]"
            role="status"
          >
            {issueCount > 0
              ? `${issueCount} validasi perlu diperbaiki sebelum menyimpan.`
              : 'Data siswa dan orang tua akan disimpan bersamaan.'}
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              disabled={createMutation.isPending}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold disabled:opacity-50"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Siswa'}
            </button>
          </div>
        </footer>
      </form>
    </StudentDialog>
  )
}

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold leading-[1.35]">{title}</h2>
          <p className="mt-1 text-[13px] leading-[1.35] text-[var(--color-muted)]">
            {description}
          </p>
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  type = 'text',
  isPhone = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  type?: string
  isPhone?: boolean
}) {
  return (
    <div className="grid gap-[7px]">
      <FieldLabel id={id} label={label} required={required} />
      <Input
        id={id}
        value={value}
        type={type}
        isPhone={isPhone}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[42px] bg-white text-sm ${error ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError id={id} error={error} />
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  visible,
  error,
  onChange,
  onToggle,
}: {
  id: string
  label: string
  value: string
  visible: boolean
  error?: string
  onChange: (value: string) => void
  onToggle: () => void
}) {
  const Icon = visible ? EyeOff : Eye
  return (
    <div className="grid gap-[7px]">
      <FieldLabel id={id} label={label} required />
      <div className="relative">
        <Input
          id={id}
          value={value}
          type={visible ? 'text' : 'password'}
          placeholder={
            label === 'Kata sandi' ? 'Masukkan kata sandi' : 'Ulangi kata sandi'
          }
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-[42px] bg-white pr-10 text-sm ${error ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={
            visible
              ? `Sembunyikan ${label.toLowerCase()}`
              : `Tampilkan ${label.toLowerCase()}`
          }
          onClick={onToggle}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
      <FieldError id={id} error={error} />
    </div>
  )
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
}: {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="grid gap-[7px]">
      <FieldLabel id={id} label={label} required={required} />
      <select
        id={id}
        value={value}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[42px] w-full rounded-md border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--color-gray-50)] disabled:text-[var(--color-muted)] ${error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={id} error={error} />
    </div>
  )
}

function FieldLabel({
  id,
  label,
  required,
}: {
  id: string
  label: string
  required: boolean
}) {
  return (
    <Label
      htmlFor={id}
      className="flex items-center gap-1 text-[13px] font-bold"
    >
      {label}
      {required ? (
        <span className="text-[var(--color-danger)]" aria-hidden="true">
          *
        </span>
      ) : null}
    </Label>
  )
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p
      id={`${id}-error`}
      className="text-xs font-semibold text-[var(--color-danger)]"
    >
      {error}
    </p>
  ) : null
}

function ModeOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="parent-source"
        checked={checked}
        className="h-4 w-4 accent-[var(--color-primary)]"
        onChange={onChange}
      />
      {label}
    </label>
  )
}

const educationOptions = [
  ...Array.from({ length: 6 }, (_, index) => ({
    value: `SD Kelas ${index + 1}`,
    label: `SD Kelas ${index + 1}`,
  })),
  ...Array.from({ length: 3 }, (_, index) => ({
    value: `SMP Kelas ${index + 7}`,
    label: `SMP Kelas ${index + 7}`,
  })),
  ...Array.from({ length: 3 }, (_, index) => ({
    value: `SMA Kelas ${index + 10}`,
    label: `SMA Kelas ${index + 10}`,
  })),
]

function normalizePhone(value: string) {
  return `+62${value.replace(/\D/g, '').replace(/^(?:62|0+)/, '')}`
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Email orang tua sudah digunakan. Gunakan data orang tua yang sudah ada.'
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'Hanya pemilik bimbel yang dapat menambahkan siswa dan akun orang tua.'
  }
  return 'Data siswa belum dapat disimpan. Silakan coba lagi.'
}

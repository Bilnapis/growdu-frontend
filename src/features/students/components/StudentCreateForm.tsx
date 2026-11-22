import { type FormEvent, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import * as yup from 'yup'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FormSection } from '@/components/ui/form-section'
import { Label } from '@/components/ui/label'
import type {
  StudentListItem,
  StudentRegistrationInput,
  StudentRegistrationUpdateInput,
} from '@/features/students/api/students-api'
import {
  useActiveParents,
  useInitialStudyGroups,
  useCreateStudentRegistration,
  useUpdateStudentRegistration,
} from '@/features/students/hooks/use-students'
import {
  getYupFieldErrors,
  getYupValidationMessage,
  type FormFieldErrors,
} from '@/lib/yup-validation'
import { ApiError } from '@/services/api-client'
import { getStoredAuthUser } from '@/lib/auth-session'
import { useBillingProfile } from '@/features/invoices/hooks/use-invoices'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'

type StudentRegistrationForm = {
  studyGroupId: string
  monthlyFee: string
  editing: boolean
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

function getInitialForm(
  student?: StudentListItem,
  monthlyFee: number | null = null,
): StudentRegistrationForm {
  return {
    studyGroupId: '',
    monthlyFee: monthlyFee === null ? '' : String(monthlyFee),
    editing: Boolean(student),
    name: student?.name ?? '',
    phoneNumber: student ? normalizeEditablePhone(student.phoneNumber) : '',
    school: student?.school ?? '',
    educationLevel: student?.educationLevel ?? '',
    gender: student?.gender ?? '',
    address: student?.address ?? '',
    parentSource: student ? 'existing' : 'new',
    existingParentId: student?.primaryParent?.parentId ?? 'unlinked',
    parentName: student?.primaryParent?.parentName ?? '',
    parentPhoneNumber: student
      ? normalizeEditablePhone(student.primaryParent?.parentPhoneNumber ?? null)
      : '',
    parentEmail: student?.primaryParent?.parentContactEmail ?? '',
    status: student?.administrativeStatus ?? student?.status ?? 'active',
    password: '',
    passwordConfirmation: '',
  }
}

const registrationSchema: yup.ObjectSchema<StudentRegistrationForm> = yup
  .object({
    studyGroupId: yup
      .string()
      .defined()
      .when('status', {
        is: 'inactive',
        then: (schema) =>
          schema.oneOf([''], 'Aktifkan siswa sebelum memilih kelompok awal.'),
      }),
    monthlyFee: yup
      .string()
      .trim()
      .defined()
      .test(
        'monthly-fee',
        'Tarif SPP harus berupa rupiah bulat antara Rp1 dan Rp1.000.000.000.',
        (value) =>
          !value ||
          (/^\d+$/.test(value) &&
            Number(value) >= 1 &&
            Number(value) <= 1_000_000_000),
      ),
    editing: yup.boolean().defined(),
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
      .when(['parentSource', 'editing'], {
        is: (source: string, editing: boolean) =>
          source === 'existing' && !editing,
        then: (schema) => schema.required('Pilih data orang tua.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    parentName: yup
      .string()
      .defined()
      .when(['parentSource', 'editing'], {
        is: (source: string, editing: boolean) => source === 'new' || editing,
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
      .when(['parentSource', 'editing'], {
        is: (source: string, editing: boolean) => source === 'new' || editing,
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
      .when(['parentSource', 'editing'], {
        is: (source: string, editing: boolean) => source === 'new' || editing,
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
      .when(['parentSource', 'editing'], {
        is: (source: string, editing: boolean) => source === 'new' && !editing,
        then: (schema) =>
          schema
            .min(5, 'Kata sandi minimal 5 karakter.')
            .required('Kata sandi wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
    passwordConfirmation: yup
      .string()
      .defined()
      .when(['parentSource', 'editing'], {
        is: (source: string, editing: boolean) => source === 'new' && !editing,
        then: (schema) =>
          schema
            .oneOf([yup.ref('password')], 'Konfirmasi kata sandi tidak sama.')
            .required('Konfirmasi kata sandi wajib diisi.'),
        otherwise: (schema) => schema.default('').defined(),
      }),
  })
  .required()

export function StudentCreateForm({
  student,
  onClose,
}: {
  student?: StudentListItem
  onClose: () => void
}) {
  const canEditBilling = getStoredAuthUser()?.role === 'owner'
  const billingQuery = useBillingProfile(
    student?.id ?? '',
    Boolean(student) && canEditBilling,
  )
  if (student && canEditBilling && !billingQuery.data) {
    return (
      <Dialog title="Ubah Data Siswa" onDismiss={onClose}>
        <DialogBody>
          {billingQuery.isError ? (
            <div role="alert" className="space-y-3">
              <p className="text-sm">
                Data SPP siswa belum dapat dimuat. Muat ulang agar tarif yang
                tersimpan tetap terjaga.
              </p>
              <DialogButton
                variant="outline"
                onClick={() => void billingQuery.refetch()}
              >
                Muat ulang SPP
              </DialogButton>
            </div>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">
              Memuat data SPP siswa...
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogButton variant="outline" onClick={onClose}>
            Batal
          </DialogButton>
        </DialogFooter>
      </Dialog>
    )
  }
  return (
    <StudentRegistrationDialog
      student={student}
      onClose={onClose}
      canEditBilling={canEditBilling}
      initialMonthlyFee={billingQuery.data?.monthlyFee ?? null}
    />
  )
}

function StudentRegistrationDialog({
  student,
  onClose,
  canEditBilling,
  initialMonthlyFee,
}: {
  student?: StudentListItem
  onClose: () => void
  canEditBilling: boolean
  initialMonthlyFee: number | null
}) {
  const isEditing = Boolean(student)
  const [form, setForm] = useState(() =>
    getInitialForm(student, initialMonthlyFee),
  )
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createMutation = useCreateStudentRegistration()
  const updateMutation = useUpdateStudentRegistration()
  const isPending = createMutation.isPending || updateMutation.isPending
  const parentsQuery = useActiveParents(
    !isEditing && form.parentSource === 'existing',
  )
  const groupsQuery = useInitialStudyGroups(!isEditing)

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
    if (isPending) return
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
      address: value.address,
      status: value.status,
      ...(canEditBilling
        ? { monthlyFee: value.monthlyFee ? Number(value.monthlyFee) : null }
        : {}),
    }
    const phoneNumber = value.phoneNumber
      ? normalizePhone(value.phoneNumber)
      : null

    if (student) {
      const updateInput: StudentRegistrationUpdateInput = {
        ...base,
        phoneNumber,
        parent: {
          name: value.parentName,
          phoneNumber: normalizePhone(value.parentPhoneNumber),
          email: value.parentEmail,
        },
      }
      updateMutation.mutate(
        { id: student.id, input: updateInput },
        {
          onSuccess: onClose,
          onError: (error: unknown) =>
            setFormError(getMutationError(error, true)),
        },
      )
      return
    }

    const registrationBase = {
      ...base,
      ...(value.studyGroupId ? { studyGroupId: value.studyGroupId } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
    }

    const input: StudentRegistrationInput =
      value.parentSource === 'new'
        ? {
            ...registrationBase,
            relationship: 'guardian',
            parentSource: 'new',
            newParent: {
              name: value.parentName,
              phoneNumber: normalizePhone(value.parentPhoneNumber),
              email: value.parentEmail,
              password: value.password,
            },
          }
        : {
            ...registrationBase,
            relationship: 'guardian',
            parentSource: 'existing',
            parentId: value.existingParentId,
          }

    createMutation.mutate(input, {
      onSuccess: onClose,
      onError: (error: unknown) => setFormError(getMutationError(error, false)),
    })
  }

  const visibleErrors = submitted ? validation.errors : {}
  const issueCount = submitted ? validation.issues.length : 0

  return (
    <Dialog
      title={isEditing ? 'Ubah Data Siswa' : 'Tambah Siswa'}
      isPending={isPending}
      onDismiss={onClose}
    >
      <DialogForm onSubmit={handleSubmit} noValidate>
        <DialogBody>
          <fieldset disabled={isPending} className="space-y-3">
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
                    if (
                      value === '' ||
                      value === 'male' ||
                      value === 'female'
                    ) {
                      updateField('gender', value)
                    }
                  }}
                  options={[
                    { value: 'female', label: 'Perempuan' },
                    { value: 'male', label: 'Laki-laki' },
                  ]}
                  placeholder="Pilih jenis kelamin"
                />
                <SelectField
                  id="student-status"
                  label="Status siswa"
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
                <div className="md:col-span-2">
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
              </div>
            </FormSection>

            {canEditBilling ? (
              <FormSection
                title="Data SPP Bulanan"
                description="Atur tarif SPP bulanan siswa untuk pembuatan invoice.  Tarif baru mulai ditagih otomatis bulan berikutnya
                    dan perubahan tarif tidak mengubah invoice yang sudah terbit."
              >
                <FormField
                  id="student-monthly-fee-input"
                  label="Tarif SPP bulanan"
                  leadingText="Rp"
                  isCurrency
                  value={form.monthlyFee}
                  placeholder="100.000"
                  error={visibleErrors.monthlyFee}
                  onChange={(value) => updateField('monthlyFee', value)}
                />
              </FormSection>
            ) : null}

            <FormSection
              title="Data Orang Tua"
              description="Tambahkan orang tua baru atau gunakan data orang tua yang sudah terdaftar."
            >
              {!isEditing ? (
                <ParentSourceTabs
                  value={form.parentSource}
                  onChange={(value) => updateField('parentSource', value)}
                />
              ) : null}
              {isEditing ? (
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
                    onChange={(value) =>
                      updateField('parentPhoneNumber', value)
                    }
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
                </div>
              ) : form.parentSource === 'new' ? (
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
                    onChange={(value) =>
                      updateField('parentPhoneNumber', value)
                    }
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

            {!isEditing ? (
              <FormSection
                title="Kelompok Awal"
                description="Pilih kelompok yang sudah dibuat. Siswa juga bisa disimpan tanpa kelompok."
              >
                <SelectField
                  id="student-group"
                  label="Kelompok aktif"
                  value={form.studyGroupId}
                  error={visibleErrors.studyGroupId}
                  disabled={groupsQuery.isPending || groupsQuery.isError}
                  onChange={(value) => updateField('studyGroupId', value)}
                  options={(groupsQuery.data ?? []).map((group) => ({
                    value: group.id,
                    label: group.name,
                  }))}
                  placeholder={
                    groupsQuery.isPending
                      ? 'Memuat kelompok...'
                      : 'Tanpa kelompok'
                  }
                />
                {groupsQuery.isError ? (
                  <div role="alert" className="mt-2 space-y-2 text-sm">
                    <p>
                      Kelompok belum dapat dimuat. Coba lagi atau simpan tanpa
                      kelompok.
                    </p>
                    <DialogButton
                      variant="outline"
                      onClick={() => void groupsQuery.refetch()}
                    >
                      Muat ulang kelompok
                    </DialogButton>
                  </div>
                ) : groupsQuery.data?.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Belum ada kelompok aktif. Buat kelompok dari menu Kelompok
                    Belajar.
                  </p>
                ) : null}
              </FormSection>
            ) : null}
          </fieldset>

          {formError ? (
            <p
              role="alert"
              className="rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm font-medium text-[var(--color-danger)]"
            >
              {formError}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter
          description={
            issueCount > 0
              ? `${issueCount} validasi perlu diperbaiki sebelum menyimpan.`
              : 'Data siswa, orang tua, dan pengaturan SPP disimpan bersamaan.'
          }
        >
          <DialogButton
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            Batal
          </DialogButton>
          <DialogButton type="submit" disabled={isPending}>
            {isPending
              ? 'Menyimpan...'
              : isEditing
                ? 'Simpan Perubahan'
                : 'Simpan Siswa'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
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
  isCurrency = false,
  leadingText,
  disabled = false,
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
  isCurrency?: boolean
  leadingText?: string
  disabled?: boolean
}) {
  return (
    <div className="grid gap-[7px]">
      <FieldLabel id={id} label={label} required={required} />
      <Input
        id={id}
        value={value}
        type={type}
        isPhone={isPhone}
        isCurrency={isCurrency}
        leadingText={leadingText}
        disabled={disabled}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[42px] text-sm ${error ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
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
          className={`h-[42px] pr-10 text-sm ${error ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
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
      <Select
        id={id}
        value={value}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={placeholder}
        className="h-[42px] py-0 disabled:bg-[var(--color-gray-50)] disabled:text-[var(--color-muted)]"
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
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

function ParentSourceTabs({
  value,
  onChange,
}: {
  value: 'new' | 'existing'
  onChange: (value: 'new' | 'existing') => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Sumber data orang tua"
      className="mb-3.5 grid grid-cols-2 overflow-hidden rounded border border-[var(--color-border)] bg-white"
    >
      {(
        [
          ['new', 'Data baru'],
          ['existing', 'Data yang sudah ada'],
        ] as const
      ).map(([source, label]) => {
        const selected = value === source

        return (
          <button
            key={source}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`min-h-10 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
              selected
                ? 'rounded bg-primary text-white'
                : 'bg-white text-[var(--color-muted)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text)]'
            }`}
            onClick={() => onChange(source)}
          >
            {label}
          </button>
        )
      })}
    </div>
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

function normalizeEditablePhone(value: string | null) {
  return value?.replace(/\D/g, '').replace(/^(?:62|0+)/, '') ?? ''
}

function getMutationError(error: unknown, isEditing: boolean) {
  if (!isEditing && error instanceof ApiError && error.status === 409) {
    return 'Data belum dapat disimpan. Periksa apakah email orang tua sudah digunakan atau konfigurasi kelompok masih berlaku.'
  }
  if (error instanceof ApiError && error.status === 403) {
    return isEditing
      ? 'Anda tidak memiliki izin untuk mengubah data siswa.'
      : 'Hanya pemilik bimbel yang dapat menambahkan siswa dan akun orang tua.'
  }
  return isEditing
    ? 'Data siswa belum dapat diperbarui. Silakan coba lagi.'
    : 'Data siswa belum dapat disimpan. Silakan coba lagi.'
}

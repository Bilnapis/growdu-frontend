import { type FormEvent, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { clearAuthSession } from '@/lib/auth-session'
import { queryClient } from '@/lib/query-client'
import { clearSelectedTenant } from '@/lib/tenant-session'
import { getYupFieldErrors, type FormFieldErrors } from '@/lib/yup-validation'
import { ApiError } from '@/services/api-client'
import { useChangePassword } from '../hooks/use-change-password'

const fields = [
  {
    name: 'currentPassword',
    label: 'Kata Sandi Lama',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'Kata Sandi Baru',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmation',
    label: 'Konfirmasi Kata Sandi Baru',
    autoComplete: 'new-password',
  },
] as const

type Field = (typeof fields)[number]['name']
type PasswordForm = Record<Field, string>

const schema: yup.ObjectSchema<PasswordForm> = yup.object({
  currentPassword: yup
    .string()
    .required('Kata sandi lama wajib diisi.')
    .max(128, 'Kata sandi maksimal 128 karakter.'),
  newPassword: yup
    .string()
    .required('Kata sandi baru wajib diisi.')
    .min(5, 'Kata sandi baru minimal 5 karakter.')
    .max(128, 'Kata sandi maksimal 128 karakter.'),
  confirmation: yup
    .string()
    .required('Konfirmasi kata sandi baru wajib diisi.')
    .oneOf([yup.ref('newPassword')], 'Konfirmasi kata sandi baru belum sama.'),
})

export function TutorPasswordForm() {
  const navigate = useNavigate()
  const mutation = useChangePassword()
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmation: '',
  })
  const [visible, setVisible] = useState<Partial<Record<Field, boolean>>>({})
  const [errors, setErrors] = useState<FormFieldErrors<Field>>({})
  const wrongPassword =
    mutation.error instanceof ApiError &&
    mutation.error.status === 401 &&
    mutation.error.message === 'Current password is incorrect'
  const sessionExpired =
    mutation.error instanceof ApiError &&
    mutation.error.status === 401 &&
    !wrongPassword

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending || sessionExpired) return

    try {
      const input = schema.validateSync(form, { abortEarly: false })
      setErrors({})
      mutation.mutate(
        {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
        {
          onSuccess: () => {
            setForm({ currentPassword: '', newPassword: '', confirmation: '' })
            setVisible({})
            void navigate('/login', {
              replace: true,
              state: { passwordChanged: true },
            })
          },
        },
      )
    } catch (error) {
      setErrors(getYupFieldErrors<Field>(error))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="px-4 pt-4"
      aria-busy={mutation.isPending}
    >
      <fieldset disabled={mutation.isPending} className="grid min-w-0 gap-3">
        <legend className="sr-only">Ubah kata sandi akun tentor</legend>
        {fields.map((field) => {
          const id = `profile-${field.name}`
          const error =
            errors[field.name] ??
            (field.name === 'currentPassword' && wrongPassword
              ? 'Kata sandi lama tidak sesuai.'
              : undefined)
          const isVisible = Boolean(visible[field.name])
          return (
            <div key={field.name} className="grid min-w-0 gap-1.5">
              <label htmlFor={id} className="text-xs font-bold leading-4">
                {field.label}
                <span
                  className="ml-1 text-[var(--color-danger)]"
                  aria-hidden="true"
                >
                  *
                </span>
              </label>
              <div className="relative">
                <Input
                  id={id}
                  name={field.name}
                  type={isVisible ? 'text' : 'password'}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  required
                  minLength={field.name === 'currentPassword' ? 1 : 5}
                  maxLength={128}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                    setErrors((current) => ({
                      ...current,
                      [field.name]: undefined,
                      ...(field.name === 'newPassword'
                        ? { confirmation: undefined }
                        : {}),
                    }))
                    mutation.reset()
                  }}
                  className="h-[38px] bg-card pl-[11px] pr-11 text-sm"
                />
                <button
                  type="button"
                  aria-label={`${isVisible ? 'Sembunyikan' : 'Tampilkan'} ${field.label.toLowerCase()}`}
                  aria-pressed={isVisible}
                  aria-controls={id}
                  onClick={() =>
                    setVisible((current) => ({
                      ...current,
                      [field.name]: !current[field.name],
                    }))
                  }
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isVisible ? (
                    <Eye className="h-[17px] w-[17px]" aria-hidden="true" />
                  ) : (
                    <EyeOff className="h-[17px] w-[17px]" aria-hidden="true" />
                  )}
                </button>
              </div>
              {error ? (
                <p
                  id={`${id}-error`}
                  role="alert"
                  className="text-xs text-[var(--color-danger)]"
                >
                  {error}
                </p>
              ) : null}
            </div>
          )
        })}
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || sessionExpired}
          className="h-11 rounded-[7px] text-[13px] font-bold"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </fieldset>
      {mutation.isError && !wrongPassword ? (
        <div
          role="alert"
          className="mt-3 rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-xs text-[var(--color-danger)]"
        >
          <p>
            {sessionExpired
              ? 'Sesi Anda telah berakhir. Silakan masuk kembali.'
              : mutation.error instanceof ApiError &&
                  mutation.error.status === 403
                ? 'Anda tidak memiliki izin untuk mengubah kata sandi.'
                : 'Kata sandi belum dapat disimpan. Silakan coba lagi.'}
          </p>
          {sessionExpired ? (
            <Link
              to="/login"
              onClick={() => {
                clearAuthSession()
                clearSelectedTenant()
                queryClient.clear()
              }}
              className="mt-2 inline-block font-semibold underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Masuk kembali
            </Link>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}

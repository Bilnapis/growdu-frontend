import { type FormEvent, useState } from 'react'
import * as yup from 'yup'

import type { Tutor } from '@/features/tutors/api/tutors-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getYupFieldErrors, type FormFieldErrors } from '@/lib/yup-validation'
import { ApiError } from '@/services/api-client'
import type { TutorProfileInput } from '../api/tutor-profile-api'
import { useUpdateTutorProfile } from '../hooks/use-tutor-profile'

const fields = [
  {
    name: 'name',
    label: 'Nama',
    required: true,
    maxLength: 150,
    autoComplete: 'name',
  },
  {
    name: 'phoneNumber',
    label: 'Nomor HP',
    required: false,
    maxLength: 20,
    autoComplete: 'tel',
    type: 'tel',
  },
  {
    name: 'email',
    label: 'Email',
    required: true,
    maxLength: 150,
    autoComplete: 'email',
    type: 'email',
  },
  {
    name: 'address',
    label: 'Alamat',
    required: true,
    maxLength: 5000,
    autoComplete: 'street-address',
  },
  {
    name: 'expertise',
    label: 'Keahlian',
    required: true,
    maxLength: 100,
    autoComplete: 'off',
  },
  {
    name: 'education',
    label: 'Pendidikan',
    required: true,
    maxLength: 150,
    autoComplete: 'off',
  },
] as const

const schema: yup.ObjectSchema<TutorProfileInput> = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(150)
    .required('Nama wajib diisi.'),
  phoneNumber: yup
    .string()
    .trim()
    .max(20, 'Nomor HP maksimal 20 karakter.')
    .defined(),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Masukkan email yang valid.')
    .max(150)
    .required('Email wajib diisi.'),
  address: yup.string().trim().max(5000).required('Alamat wajib diisi.'),
  expertise: yup.string().trim().max(100).required('Keahlian wajib diisi.'),
  education: yup.string().trim().max(150).required('Pendidikan wajib diisi.'),
})

export function TutorProfileForm({ tutor }: { tutor: Tutor }) {
  const mutation = useUpdateTutorProfile()
  const [form, setForm] = useState<TutorProfileInput>(() => ({
    name: tutor.name,
    phoneNumber: tutor.phoneNumber,
    email: tutor.email ?? '',
    address: tutor.address ?? '',
    expertise: tutor.expertise ?? '',
    education: tutor.education ?? '',
  }))
  const [errors, setErrors] = useState<
    FormFieldErrors<keyof TutorProfileInput>
  >({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return

    try {
      const input = schema.validateSync(form, { abortEarly: false })
      setErrors({})
      mutation.mutate(input)
    } catch (error) {
      setErrors(getYupFieldErrors<keyof TutorProfileInput>(error))
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
        <legend className="sr-only">Data diri tentor</legend>
        {fields.map((field) => {
          const id = `profile-${field.name}`
          const error = errors[field.name]
          return (
            <div key={field.name} className="grid min-w-0 gap-1.5">
              <label htmlFor={id} className="text-xs font-bold leading-4">
                {field.label}
                {field.required ? (
                  <span
                    className="ml-1 text-[var(--color-danger)]"
                    aria-hidden="true"
                  >
                    *
                  </span>
                ) : null}
              </label>
              <Input
                id={id}
                name={field.name}
                type={'type' in field ? field.type : 'text'}
                autoComplete={field.autoComplete}
                value={form[field.name]}
                required={field.required}
                maxLength={field.maxLength}
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
                  }))
                  mutation.reset()
                }}
                className="h-[38px] bg-card px-[11px] text-[13px]"
              />
              {error ? (
                <p
                  id={`${id}-error`}
                  className="text-xs text-[var(--color-danger)]"
                  role="alert"
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
          disabled={mutation.isPending}
          className="mt-4"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </fieldset>
      {mutation.isError ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-xs text-[var(--color-danger)]"
        >
          {mutation.error instanceof ApiError && mutation.error.status === 409
            ? 'Email sudah digunakan. Silakan gunakan email lain.'
            : mutation.error instanceof ApiError &&
                mutation.error.status === 403
              ? 'Anda tidak memiliki izin untuk mengubah profil ini.'
              : 'Data diri belum dapat disimpan. Silakan coba lagi.'}
        </p>
      ) : null}
      {mutation.isSuccess ? (
        <p
          role="status"
          className="mt-3 rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-3 text-xs text-[var(--color-success)]"
        >
          Data diri berhasil diperbarui.
        </p>
      ) : null}
    </form>
  )
}

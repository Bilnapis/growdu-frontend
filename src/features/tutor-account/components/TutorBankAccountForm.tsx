import { type FormEvent, useState } from 'react'
import * as yup from 'yup'

import type { Tutor } from '@/features/tutors/api/tutors-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getYupFieldErrors, type FormFieldErrors } from '@/lib/yup-validation'
import { ApiError } from '@/services/api-client'
import type { TutorBankAccountInput } from '../api/tutor-profile-api'
import { useUpdateTutorBankAccount } from '../hooks/use-tutor-profile'

const fields = [
  { name: 'bankName', label: 'Nama Bank/E-Wallet', maxLength: 100 },
  { name: 'accountNumber', label: 'Nomor Rekening', maxLength: 50 },
  { name: 'accountName', label: 'Atas Nama', maxLength: 150 },
] as const

const schema: yup.ObjectSchema<TutorBankAccountInput> = yup.object({
  bankName: yup
    .string()
    .trim()
    .max(100, 'Nama bank maksimal 100 karakter.')
    .required('Nama Bank/E-Wallet wajib diisi.'),
  accountNumber: yup
    .string()
    .trim()
    .min(3, 'Nomor rekening minimal 3 karakter.')
    .max(50, 'Nomor rekening maksimal 50 karakter.')
    .required('Nomor rekening wajib diisi.'),
  accountName: yup
    .string()
    .trim()
    .min(2, 'Atas nama minimal 2 karakter.')
    .max(150, 'Atas nama maksimal 150 karakter.')
    .required('Atas nama wajib diisi.'),
})

export function TutorBankAccountForm({ tutor }: { tutor: Tutor }) {
  const mutation = useUpdateTutorBankAccount()
  const [form, setForm] = useState<TutorBankAccountInput>(() => ({
    bankName: tutor.bankName ?? '',
    accountNumber: tutor.accountNumber ?? '',
    accountName: tutor.accountName ?? '',
  }))
  const [errors, setErrors] = useState<
    FormFieldErrors<keyof TutorBankAccountInput>
  >({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return

    try {
      const input = schema.validateSync(form, { abortEarly: false })
      setErrors({})
      mutation.mutate(input)
    } catch (error) {
      setErrors(getYupFieldErrors<keyof TutorBankAccountInput>(error))
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
        <legend className="sr-only">Data rekening tentor</legend>
        {fields.map((field) => {
          const id = `profile-${field.name}`
          const error = errors[field.name]
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
              <Input
                id={id}
                name={field.name}
                type="text"
                inputMode={
                  field.name === 'accountNumber' ? 'numeric' : undefined
                }
                autoComplete="off"
                value={form[field.name]}
                required
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
          className="h-11 rounded-[7px] text-[13px] font-bold"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </fieldset>
      {mutation.isError ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-xs text-[var(--color-danger)]"
        >
          {mutation.error instanceof ApiError && mutation.error.status === 403
            ? 'Anda tidak memiliki izin untuk mengubah rekening ini.'
            : 'Data rekening belum dapat disimpan. Silakan coba lagi.'}
        </p>
      ) : null}
      {mutation.isSuccess ? (
        <p
          role="status"
          className="mt-3 rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-3 text-xs text-[var(--color-success)]"
        >
          Data rekening berhasil diperbarui.
        </p>
      ) : null}
    </form>
  )
}

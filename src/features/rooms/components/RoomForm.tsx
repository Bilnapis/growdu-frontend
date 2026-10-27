import { type FormEvent, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Room } from '@/features/rooms/api/rooms-api'
import { useCreateRoom, useUpdateRoom } from '@/features/rooms/hooks/use-rooms'
import {
  getYupFieldErrors,
  getYupValidationMessage,
  type FormFieldErrors,
} from '@/lib/yup-validation'
import { ApiError } from '@/services/api-client'
import { RoomDialog } from './RoomDialog'

type RoomFormValues = {
  name: string
  code: string
  capacity: string
}

const schema: yup.ObjectSchema<RoomFormValues> = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Nama ruangan minimal 2 karakter.')
    .max(150, 'Nama ruangan maksimal 150 karakter.')
    .required('Nama ruangan wajib diisi.'),
  code: yup
    .string()
    .trim()
    .min(1, 'Kode ruangan wajib diisi.')
    .max(30, 'Kode ruangan maksimal 30 karakter.')
    .required('Kode ruangan wajib diisi.'),
  capacity: yup
    .string()
    .required('Kapasitas wajib diisi.')
    .test(
      'capacity',
      'Kapasitas harus berupa bilangan bulat minimal 1.',
      (value) => {
        const number = Number(value)
        return Number.isInteger(number) && number >= 1 && number <= 65_535
      },
    ),
})

export function RoomForm({
  room,
  onClose,
}: {
  room?: Room
  onClose?: () => void
}) {
  const navigate = useNavigate()
  const create = useCreateRoom()
  const update = useUpdateRoom()
  const pending = create.isPending || update.isPending
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [values, setValues] = useState<RoomFormValues>(() => ({
    name: room?.name ?? '',
    code: room?.code ?? '',
    capacity: room ? String(room.capacity) : '',
  }))

  const validation = useMemo<{
    errors: FormFieldErrors<keyof RoomFormValues>
    valid: boolean
  }>(() => {
    try {
      schema.validateSync(values, { abortEarly: false })
      return { errors: {}, valid: true }
    } catch (error) {
      return {
        errors: getYupFieldErrors<keyof RoomFormValues>(error),
        valid: false,
      }
    }
  }, [values])

  function dismiss() {
    if (onClose) {
      onClose()
      return
    }
    void navigate('/rooms', { replace: true })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setSubmitted(true)
    setFormError(null)

    let input: RoomFormValues
    try {
      input = schema.validateSync(values, { abortEarly: false })
    } catch (error) {
      setFormError(
        getYupValidationMessage(error, 'Periksa kembali data ruangan.'),
      )
      return
    }

    const payload = {
      name: input.name,
      code: input.code.toLocaleUpperCase('id-ID'),
      capacity: Number(input.capacity),
    }
    const options = {
      onSuccess: () => {
        if (onClose) {
          onClose()
          return
        }
        void navigate('/rooms', {
          replace: true,
          state: {
            roomFlash: room
              ? 'Data ruangan berhasil diperbarui.'
              : 'Data ruangan berhasil disimpan.',
          },
        })
      },
      onError: (error: unknown) =>
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'Data ruangan belum dapat disimpan.',
        ),
    }

    if (room) update.mutate({ id: room.id, input: payload }, options)
    else create.mutate(payload, options)
  }

  function setField(field: keyof RoomFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFormError(null)
  }

  return (
    <RoomDialog
      isPending={pending}
      onDismiss={dismiss}
      labelledBy="room-form-title"
      describedBy="room-form-description"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
        <div>
          <h1 id="room-form-title" className="text-xl font-bold">
            {room ? 'Edit Ruangan' : 'Tambah Ruangan'}
          </h1>
          <p
            id="room-form-description"
            className="mt-1 text-[13px] text-muted-foreground"
          >
            {room
              ? `Perbarui informasi ${room.name} (${room.code}).`
              : 'Lengkapi informasi ruangan baru.'}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label="Tutup dialog ruangan"
          onClick={dismiss}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </header>

      <form onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid gap-5 px-5 py-6 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="room-name"
              label="Nama Ruangan"
              value={values.name}
              error={submitted ? validation.errors.name : undefined}
              placeholder="Ruang Galileo"
              onChange={(value) => setField('name', value)}
            />
            <FormField
              id="room-code"
              label="Kode Ruangan"
              value={values.code}
              error={submitted ? validation.errors.code : undefined}
              placeholder="R-01"
              onChange={(value) => setField('code', value)}
            />
          </div>
          <FormField
            id="room-capacity"
            label="Kapasitas Maksimal Siswa"
            value={values.capacity}
            error={submitted ? validation.errors.capacity : undefined}
            placeholder="12"
            type="number"
            onChange={(value) => setField('capacity', value)}
          />
          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]"
            >
              {formError}
            </p>
          ) : null}
        </fieldset>

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[13px] text-muted-foreground">
            {pending ? 'Menyimpan perubahan...' : 'Perubahan belum disimpan.'}
          </p>
          <div className="flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={dismiss}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!validation.valid || pending}>
              {pending
                ? 'Menyimpan...'
                : room
                  ? 'Simpan Perubahan'
                  : 'Simpan Ruangan'}
            </Button>
          </div>
        </footer>
      </form>
    </RoomDialog>
  )
}

function FormField({
  id,
  label,
  value,
  error,
  helper,
  placeholder,
  type = 'text',
  onChange,
}: {
  id: string
  label: string
  value: string
  error?: string
  helper?: string
  placeholder?: string
  type?: 'text' | 'number'
  onChange: (value: string) => void
}) {
  const descriptionId = error
    ? `${id}-error`
    : helper
      ? `${id}-helper`
      : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label} <span className="text-destructive">*</span>
      </Label>
      <Input
        id={id}
        type={type}
        min={type === 'number' ? 1 : undefined}
        max={type === 'number' ? 65_535 : undefined}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  )
}

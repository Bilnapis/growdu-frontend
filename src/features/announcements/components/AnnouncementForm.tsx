import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Announcement, AnnouncementTarget } from '../api/announcements-api'
import { useAnnouncementMutations } from '../hooks/use-announcements'
import {
  announcementErrorMessage,
  fromJakartaInput,
  isAnnouncementTarget,
  targetLabels,
  toJakartaInput,
} from '../utils/announcements'
import { AnnouncementDialog } from './AnnouncementDialog'

type FormValues = {
  title: string
  content: string
  targetRole: AnnouncementTarget
  startsAt: string
  endsAt: string
}

function validateForm(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {}
  if (!values.title.trim()) errors.title = 'Judul pengumuman wajib diisi.'
  else if (values.title.trim().length > 150)
    errors.title = 'Judul maksimal 150 karakter.'
  if (!values.content.trim()) errors.content = 'Isi pengumuman wajib diisi.'
  else if (values.content.trim().length > 10_000)
    errors.content = 'Isi maksimal 10.000 karakter.'
  const start = fromJakartaInput(values.startsAt)
  const end = fromJakartaInput(values.endsAt)
  if (values.startsAt && !start) errors.startsAt = 'Tanggal mulai tidak valid.'
  if (values.endsAt && !end) errors.endsAt = 'Tanggal berakhir tidak valid.'
  else if (end && (!start || end <= start))
    errors.endsAt = 'Berakhir harus setelah Mulai Tampil.'
  return errors
}

export function AnnouncementForm({
  announcement,
}: {
  announcement?: Announcement
}) {
  const navigate = useNavigate()
  const { search } = useLocation()
  const mutations = useAnnouncementMutations()
  const submitting = useRef(false)
  const [values, setValues] = useState<FormValues>(() => ({
    title: announcement?.title ?? '',
    content: announcement?.content ?? '',
    targetRole: announcement?.targetRole ?? 'all',
    startsAt: toJakartaInput(announcement?.startsAt ?? null),
    endsAt: toJakartaInput(announcement?.endsAt ?? null),
  }))
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = validateForm(values)
  const pending = mutations.create.isPending || mutations.update.isPending

  function dismiss() {
    void navigate(`/announcements${search}`, { replace: true })
  }
  function setField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setFormError(null)
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || submitting.current) return
    setSubmitted(true)
    if (Object.keys(errors).length) {
      window.requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      )
      return
    }
    submitting.current = true
    setFormError(null)
    const input = {
      title: values.title.trim(),
      content: values.content.trim(),
      targetRole: values.targetRole,
      startsAt:
        announcement &&
        values.startsAt === toJakartaInput(announcement.startsAt)
          ? announcement.startsAt
          : fromJakartaInput(values.startsAt),
      endsAt:
        announcement && values.endsAt === toJakartaInput(announcement.endsAt)
          ? announcement.endsAt
          : fromJakartaInput(values.endsAt),
    }
    const options = {
      onSuccess: () =>
        void navigate(`/announcements${search}`, {
          replace: true,
          state: {
            announcementFlash: announcement
              ? 'Pengumuman berhasil diperbarui.'
              : 'Pengumuman berhasil dibuat.',
          },
        }),
      onError: (error: unknown) =>
        setFormError(
          announcementErrorMessage(
            error,
            'Pengumuman gagal disimpan. Silakan coba lagi.',
          ),
        ),
      onSettled: () => {
        submitting.current = false
      },
    }
    if (announcement)
      mutations.update.mutate({ id: announcement.id, input }, options)
    else mutations.create.mutate(input, options)
  }

  return (
    <AnnouncementDialog
      pending={pending}
      onDismiss={dismiss}
      labelledBy="announcement-form-title"
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1
            id="announcement-form-title"
            className="text-xl font-extrabold leading-[1.3]"
          >
            {announcement ? 'Ubah Pengumuman' : 'Buat Pengumuman Baru'}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Isi detail pengumuman dan pilih target role dashboard.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={dismiss}
          aria-label="Tutup modal pengumuman"
          className="h-[34px] w-[34px] shrink-0 bg-muted"
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </Button>
      </header>
      <form ref={formRef} onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 gap-4">
          <Field
            id="announcement-title"
            label="Judul Pengumuman"
            error={submitted ? errors.title : undefined}
          >
            <Input
              id="announcement-title"
              required
              maxLength={150}
              autoFocus
              value={values.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Contoh: Libur Maulid Nabi"
              className="h-[42px] rounded-lg bg-card text-[13px]"
              aria-invalid={submitted && Boolean(errors.title)}
              aria-describedby={
                submitted && errors.title
                  ? 'announcement-title-error'
                  : undefined
              }
            />
          </Field>
          <Field
            id="announcement-content"
            label="Isi Pengumuman"
            error={submitted ? errors.content : undefined}
          >
            <textarea
              id="announcement-content"
              required
              maxLength={10_000}
              rows={5}
              value={values.content}
              onChange={(event) => setField('content', event.target.value)}
              placeholder="Tuliskan detail pengumuman, instruksi, dan tanggal penting..."
              className="min-h-[132px] w-full resize-y rounded-lg border border-input bg-card p-3 text-[13px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={submitted && Boolean(errors.content)}
              aria-describedby={
                submitted && errors.content
                  ? 'announcement-content-error'
                  : undefined
              }
            />
          </Field>
          <Field id="announcement-target" label="Target Role">
            <select
              id="announcement-target"
              value={values.targetRole}
              onChange={(event) => {
                if (isAnnouncementTarget(event.target.value))
                  setField('targetRole', event.target.value)
              }}
              className="h-[42px] w-full rounded-lg border border-input bg-card px-3 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(targetLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <Field
              id="announcement-start"
              label="Mulai Tampil"
              error={submitted ? errors.startsAt : undefined}
            >
              <Input
                id="announcement-start"
                type="datetime-local"
                value={values.startsAt}
                onChange={(event) => setField('startsAt', event.target.value)}
                className="h-[42px] min-w-0 rounded-lg bg-card text-[13px]"
                aria-invalid={submitted && Boolean(errors.startsAt)}
                aria-describedby={`announcement-schedule-help${submitted && errors.startsAt ? ' announcement-start-error' : ''}`}
              />
            </Field>
            <Field
              id="announcement-end"
              label="Berakhir"
              error={submitted ? errors.endsAt : undefined}
            >
              <Input
                id="announcement-end"
                type="datetime-local"
                value={values.endsAt}
                onChange={(event) => setField('endsAt', event.target.value)}
                className="h-[42px] min-w-0 rounded-lg bg-card text-[13px]"
                aria-invalid={submitted && Boolean(errors.endsAt)}
                aria-describedby={`announcement-schedule-help${submitted && errors.endsAt ? ' announcement-end-error' : ''}`}
              />
            </Field>
          </div>
          <p
            id="announcement-schedule-help"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            Waktu menggunakan WIB. Kosongkan tanggal untuk menyimpan Draft.
            Berakhir boleh dikosongkan agar tampil tanpa batas waktu.
          </p>
          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {formError}
            </p>
          ) : null}
          <footer className="flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={dismiss}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </footer>
        </fieldset>
      </form>
    </AnnouncementDialog>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid min-w-0 gap-[7px]">
      <Label htmlFor={id} className="text-[13px] font-bold">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

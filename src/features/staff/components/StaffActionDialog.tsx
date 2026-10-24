import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStaffError, type StaffMember } from '@/features/staff/api/staff-api'
import { useUpdateStaff } from '@/features/staff/hooks/use-staff'
import { StaffCreateDialog } from './StaffCreateDialog'

type Props = {
  staff: StaffMember
  mode: 'detail' | 'edit' | 'status'
  tenantId: string
  onClose: () => void
  onSuccess: () => void
}

export function StaffActionDialog({ staff, mode, tenantId, onClose, onSuccess }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const submittingRef = useRef(false)
  const mutation = useUpdateStaff(tenantId)
  const [values, setValues] = useState({ name: staff.name, email: staff.email, phoneNumber: normalizeEditablePhoneNumber(staff.phoneNumber), address: staff.address ?? '', password: '', confirmation: '' })
  const [error, setError] = useState('')
  const statusLabel = staff.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'
  const title = mode === 'detail' ? 'Detail Pegawai' : mode === 'edit' ? 'Ubah Data Pegawai' : `${statusLabel} Pegawai`

  useEffect(() => {
    if (mode === 'edit') return
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [mode])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || mutation.isPending) return
    if (mode === 'edit' && (values.name.trim().length < 2 || values.phoneNumber.trim().length < 6)) {
      setError('Nama minimal 2 karakter dan nomor HP minimal 6 karakter.')
      return
    }
    if (mode === 'edit' && values.password && values.password.length < 5) {
      setError('Kata sandi baru minimal 5 karakter.')
      return
    }
    if (mode === 'edit' && values.password !== values.confirmation) {
      setError('Ulangi kata sandi baru harus sama.')
      return
    }
    submittingRef.current = true
    setError('')
    mutation.mutate({
      id: staff.id,
      input: mode === 'status' ? { status: staff.status === 'active' ? 'inactive' : 'active' } : {
        name: values.name.trim(), email: values.email.trim().toLowerCase(), phoneNumber: formatIndonesianPhoneNumber(values.phoneNumber), address: values.address.trim(), ...(values.password ? { password: values.password } : {}),
      },
    }, {
      onSuccess,
      onError: (cause) => setError(getStaffError(cause)),
      onSettled: () => { submittingRef.current = false },
    })
  }

  if (mode === 'edit') {
    return (
      <StaffCreateDialog
        isPending={mutation.isPending}
        onDismiss={onClose}
        labelledBy="staff-edit-title"
        describedBy="staff-edit-description"
        initialFocusSelector="#staff-edit-name"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 id="staff-edit-title" className="text-2xl font-bold leading-[1.3] tracking-tight">Ubah Data Pegawai</h2>
            <p id="staff-edit-description" className="text-sm leading-[1.4] text-muted-foreground">Perbarui informasi akun pegawai.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" disabled={mutation.isPending} onClick={onClose} aria-label="Tutup modal ubah pegawai"><X className="h-5 w-5" aria-hidden="true" /></Button>
        </header>
        <form aria-busy={mutation.isPending} onSubmit={handleSubmit} className="mt-[22px] space-y-[22px]">
          <fieldset disabled={mutation.isPending} aria-labelledby="staff-edit-account-title" className="min-w-0 space-y-[18px] rounded-xl border bg-card p-4 sm:p-5">
            <div className="space-y-1.5">
              <h3 id="staff-edit-account-title" className="text-lg font-bold leading-[1.3]">Data akun pegawai</h3>
              <p className="text-[13px] leading-[1.4] text-muted-foreground">Perbarui informasi dasar akun pegawai.</p>
            </div>
            <div className="grid gap-3.5 md:grid-cols-2">
              {(['name', 'email', 'phoneNumber'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`staff-edit-${field}`} className="text-[13px] font-semibold">{field === 'name' ? 'Nama' : field === 'email' ? 'Email' : 'Nomor HP'}</Label>
                  <Input id={`staff-edit-${field}`} required type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'} isPhone={field === 'phoneNumber'} minLength={field === 'name' ? 2 : field === 'phoneNumber' ? 6 : undefined} maxLength={field === 'phoneNumber' ? 20 : 150} value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} className="rounded-lg bg-[var(--color-bg-light)]" />
                </div>
              ))}
              {(['password', 'confirmation'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`staff-edit-${field}`} className="text-[13px] font-semibold">{field === 'password' ? 'Kata Sandi Baru' : 'Ulangi Kata Sandi Baru'}</Label>
                  <Input id={`staff-edit-${field}`} type="password" autoComplete="new-password" minLength={5} maxLength={128} value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === 'password' ? 'Masukkan kata sandi baru' : 'Ulangi kata sandi baru'} className="rounded-lg bg-[var(--color-bg-light)]" />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="staff-edit-address" className="text-[13px] font-semibold">Alamat</Label>
                <textarea id="staff-edit-address" maxLength={1000} value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} className="block min-h-28 w-full resize-y rounded-lg border border-input bg-[var(--color-bg-light)] p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
            </div>
          </fieldset>
          {error ? <p role="alert" className="rounded-lg border border-[var(--color-info-border)] bg-[var(--color-info-bg)] p-4 text-sm text-[var(--color-info-text)]">{error}</p> : null}
          <footer className="sticky -bottom-4 flex min-h-[60px] flex-wrap items-center justify-end gap-2.5 border-t bg-card py-3 sm:-bottom-6">
            <Button type="button" disabled={mutation.isPending} variant="outline" className="h-11 rounded-lg px-[18px] font-bold" onClick={onClose}>Batal</Button>
            <Button disabled={mutation.isPending} type="submit" className="h-11 rounded-lg px-[18px] font-bold">{mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
          </footer>
        </form>
      </StaffCreateDialog>
    )
  }

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="staff-action-title" aria-busy={mutation.isPending} onCancel={(event) => { event.preventDefault(); if (!mutation.isPending) onClose() }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl border bg-card p-6 text-foreground shadow-md backdrop:bg-[var(--color-modal-overlay)]">
      <header className="mb-5 flex items-center justify-between gap-4">
        <h2 id="staff-action-title" className="text-xl font-bold">{title}</h2>
        <Button type="button" variant="ghost" size="icon" disabled={mutation.isPending} onClick={onClose} aria-label="Tutup dialog"><X className="h-5 w-5" aria-hidden="true" /></Button>
      </header>
      {mode === 'detail' ? (
        <>
          <dl className="space-y-4">
            {[['Nama', staff.name], ['Email', staff.email], ['Nomor HP', staff.phoneNumber], ['Alamat', staff.address || '—'], ['Status', staff.status === 'active' ? 'Aktif' : 'Nonaktif']].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">{value}</dd></div>)}
          </dl>
          <footer className="mt-6 flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Tutup</Button></footer>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-sm leading-6">{statusLabel} akun <strong>{staff.name}</strong>? {staff.status === 'active' ? 'Pegawai tidak dapat masuk dan sesi aktifnya akan dicabut.' : 'Pegawai dapat masuk kembali ke aplikasi.'}</p>
          {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
          <footer className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Batal</Button>
            <Button type="submit" variant={staff.status === 'active' ? 'destructive' : 'default'} disabled={mutation.isPending}>{mutation.isPending ? 'Menyimpan...' : statusLabel}</Button>
          </footer>
        </form>
      )}
    </dialog>, document.body,
  )
}

function formatIndonesianPhoneNumber(value: string) {
  return `+62${value.replace(/\D/g, '').replace(/^(?:62|0+)/, '')}`
}

function normalizeEditablePhoneNumber(value: string) {
  return value.replace(/\D/g, '').replace(/^(?:62|0+)/, '')
}

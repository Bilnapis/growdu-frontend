import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStaffError, type StaffMember } from '@/features/staff/api/staff-api'
import { useUpdateStaff } from '@/features/staff/hooks/use-staff'

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
  const [values, setValues] = useState({ name: staff.name, email: staff.email, phoneNumber: staff.phoneNumber, address: staff.address ?? '' })
  const [error, setError] = useState('')
  const statusLabel = staff.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'
  const title = mode === 'detail' ? 'Detail Pegawai' : mode === 'edit' ? 'Ubah Data Pegawai' : `${statusLabel} Pegawai`

  useEffect(() => {
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
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || mutation.isPending) return
    if (mode === 'edit' && (values.name.trim().length < 2 || values.phoneNumber.trim().length < 6)) {
      setError('Nama minimal 2 karakter dan nomor HP minimal 6 karakter.')
      return
    }
    submittingRef.current = true
    setError('')
    mutation.mutate({
      id: staff.id,
      input: mode === 'status' ? { status: staff.status === 'active' ? 'inactive' : 'active' } : {
        name: values.name.trim(), email: values.email.trim().toLowerCase(), phoneNumber: values.phoneNumber.trim(), address: values.address.trim(),
      },
    }, {
      onSuccess,
      onError: (cause) => setError(getStaffError(cause)),
      onSettled: () => { submittingRef.current = false },
    })
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
          {mode === 'status' ? <p className="text-sm leading-6">{statusLabel} akun <strong>{staff.name}</strong>? {staff.status === 'active' ? 'Pegawai tidak dapat masuk dan sesi aktifnya akan dicabut.' : 'Pegawai dapat masuk kembali ke aplikasi.'}</p> : (
            <fieldset disabled={mutation.isPending} className="space-y-4">
              {(['name', 'email', 'phoneNumber'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`staff-edit-${field}`}>{field === 'name' ? 'Nama' : field === 'email' ? 'Email' : 'Nomor HP'}</Label>
                  <Input id={`staff-edit-${field}`} required type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'} minLength={field === 'name' ? 2 : field === 'phoneNumber' ? 6 : undefined} maxLength={field === 'phoneNumber' ? 20 : 150} value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
                </div>
              ))}
              <div className="space-y-2"><Label htmlFor="staff-edit-address">Alamat</Label><textarea id="staff-edit-address" maxLength={1000} value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            </fieldset>
          )}
          {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
          <footer className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Batal</Button>
            <Button type="submit" variant={mode === 'status' && staff.status === 'active' ? 'destructive' : 'default'} disabled={mutation.isPending}>{mutation.isPending ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : statusLabel}</Button>
          </footer>
        </form>
      )}
    </dialog>, document.body,
  )
}

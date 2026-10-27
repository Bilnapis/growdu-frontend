import { useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStaffError, type StaffMember } from '../api/staff-api'
import { useStaffMember, useUpdateStaff } from '../hooks/use-staff'
import { StaffCreateDialog } from './StaffCreateDialog'
import { StaffMenuPermissionsFields } from './StaffMenuPermissionsFields'

type Props = {
  staff: StaffMember
  tenantId: string
  onClose: () => void
  onSuccess: () => void
}

const accountFields = [
  {
    id: 'name',
    label: 'Nama',
    type: 'text',
    placeholder: 'Masukkan nama lengkap pegawai',
  },
  {
    id: 'phoneNumber',
    label: 'Nomor HP',
    type: 'tel',
    placeholder: '81234567890',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'nama@bimbelkit.com',
  },
  {
    id: 'password',
    label: 'Kata Sandi Baru',
    type: 'password',
    placeholder: 'Kosongkan jika tidak diubah',
  },
  {
    id: 'confirmation',
    label: 'Ulangi Kata Sandi Baru',
    type: 'password',
    placeholder: 'Ulangi kata sandi baru',
  },
] as const

export function StaffEditDialog({
  staff,
  tenantId,
  onClose,
  onSuccess,
}: Props) {
  const staffQuery = useStaffMember(tenantId, staff.id)
  const mutation = useUpdateStaff(tenantId)

  return (
    <StaffCreateDialog
      isPending={mutation.isPending}
      onDismiss={onClose}
      labelledBy="staff-edit-title"
      describedBy="staff-edit-description"
      initialFocusSelector="#staff-edit-close"
      className="max-w-[1032px]"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h2
            id="staff-edit-title"
            className="text-2xl font-bold leading-[1.3] tracking-tight"
          >
            Ubah Data Pegawai
          </h2>
          <p
            id="staff-edit-description"
            className="text-sm leading-[1.4] text-muted-foreground"
          >
            Perbarui data akun dan hak akses menu pegawai.
          </p>
        </div>
        <Button
          id="staff-edit-close"
          type="button"
          variant="ghost"
          size="icon"
          disabled={mutation.isPending}
          onClick={onClose}
          aria-label="Tutup modal ubah pegawai"
          className="h-9 w-9 shrink-0 text-muted-foreground"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </header>
      {staffQuery.isPending ? (
        <p role="status" className="py-8 text-sm text-muted-foreground">
          Memuat data pegawai...
        </p>
      ) : staffQuery.isError ? (
        <div role="alert" className="space-y-3 py-6 text-sm">
          <p className="text-destructive">{getStaffError(staffQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void staffQuery.refetch()}
            disabled={staffQuery.isFetching}
          >
            Coba lagi
          </Button>
        </div>
      ) : (
        <StaffEditForm
          staff={staffQuery.data}
          mutation={mutation}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </StaffCreateDialog>
  )
}

function StaffEditForm({
  staff,
  mutation,
  onClose,
  onSuccess,
}: {
  staff: StaffMember
  mutation: ReturnType<typeof useUpdateStaff>
  onClose: () => void
  onSuccess: () => void
}) {
  const [values, setValues] = useState({
    name: staff.name,
    email: staff.email,
    phoneNumber: staff.phoneNumber.replace(/\D/g, '').replace(/^(?:62|0+)/, ''),
    address: staff.address ?? '',
    password: '',
    confirmation: '',
  })
  const [permissions, setPermissions] = useState(staff.menuPermissions)
  const [error, setError] = useState('')
  const submittingRef = useRef(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || mutation.isPending) return
    if (values.name.trim().length < 2 || values.phoneNumber.trim().length < 6) {
      setError('Nama minimal 2 karakter dan nomor HP minimal 6 karakter.')
      return
    }
    if (values.password && values.password.length < 5) {
      setError('Kata sandi baru minimal 5 karakter.')
      return
    }
    if (values.password !== values.confirmation) {
      setError('Ulangi kata sandi baru harus sama.')
      return
    }
    submittingRef.current = true
    setError('')
    mutation.mutate(
      {
        id: staff.id,
        input: {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phoneNumber: `+62${values.phoneNumber.replace(/\D/g, '').replace(/^(?:62|0+)/, '')}`,
          address: values.address.trim(),
          menuPermissions: permissions,
          ...(values.password ? { password: values.password } : {}),
        },
      },
      {
        onSuccess,
        onError: (cause) => setError(getStaffError(cause)),
        onSettled: () => {
          submittingRef.current = false
        },
      },
    )
  }

  return (
    <form
      aria-busy={mutation.isPending}
      onSubmit={handleSubmit}
      className="mt-[22px] space-y-[22px]"
    >
      <div className="grid items-stretch gap-[22px] md:grid-cols-2">
        <fieldset
          disabled={mutation.isPending}
          aria-labelledby="staff-edit-account-title"
          className="min-w-0 space-y-[18px] rounded-xl border bg-card p-4 sm:p-5"
        >
          <div className="space-y-1.5">
            <h3
              id="staff-edit-account-title"
              className="text-lg font-bold leading-[1.3]"
            >
              Data akun pegawai
            </h3>
            <p className="text-[13px] leading-[1.4] text-muted-foreground">
              Perbarui informasi dasar akun pegawai.
            </p>
          </div>
          <div className="grid gap-3.5">
            {accountFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label
                  htmlFor={`staff-edit-${field.id}`}
                  className="text-[13px] font-semibold"
                >
                  {field.label}
                </Label>
                <Input
                  id={`staff-edit-${field.id}`}
                  name={field.id}
                  type={field.type}
                  isPhone={field.id === 'phoneNumber'}
                  required={field.type !== 'password'}
                  autoComplete={
                    field.type === 'password'
                      ? 'new-password'
                      : field.id === 'phoneNumber'
                        ? 'tel'
                        : field.id
                  }
                  minLength={
                    field.type === 'password'
                      ? 5
                      : field.id === 'name'
                        ? 2
                        : field.id === 'phoneNumber'
                          ? 6
                          : undefined
                  }
                  maxLength={
                    field.type === 'password'
                      ? 128
                      : field.id === 'phoneNumber'
                        ? 20
                        : 150
                  }
                  placeholder={field.placeholder}
                  value={values[field.id]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.id]: event.target.value,
                    }))
                  }
                  className="rounded-lg bg-[var(--color-bg-light)]"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label
                htmlFor="staff-edit-address"
                className="text-[13px] font-semibold"
              >
                Alamat
              </Label>
              <textarea
                id="staff-edit-address"
                name="address"
                autoComplete="street-address"
                maxLength={1000}
                value={values.address}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                className="block min-h-28 w-full resize-y rounded-lg border border-input bg-[var(--color-bg-light)] p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </fieldset>
        <StaffMenuPermissionsFields
          value={permissions}
          onChange={setPermissions}
          disabled={mutation.isPending}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <footer className="sticky -bottom-4 flex min-h-[60px] flex-wrap items-center justify-end gap-2.5 border-t bg-card py-3 sm:-bottom-6">
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={onClose}
          className="h-11 rounded-lg px-[18px] font-bold"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 rounded-lg px-[18px] font-bold"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </footer>
    </form>
  )
}

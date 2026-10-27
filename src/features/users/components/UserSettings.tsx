import { type FormEvent, useState } from 'react'
import { CheckCircle2, KeyRound, Pencil, Search, UserRound, X } from 'lucide-react'
import * as yup from 'yup'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/services/api-client'
import { type ManagedUser, type UserRole, type UserStatus } from '@/features/users/api/users-api'
import { useResetUserPassword, useUpdateUser, useUsers } from '@/features/users/hooks/use-users'
import { getYupValidationMessage } from '@/lib/yup-validation'

type UserSettingsProps = {
  filters: {
    page: number
    search?: string
    role?: UserRole
    status?: UserStatus
  }
  onFiltersChange: (filters: UserSettingsProps['filters']) => void
}

const roleLabels: Record<UserRole, string> = {
  owner: 'Owner',
  operator: 'Operator',
  tutor: 'Tutor',
  parent: 'Orang tua',
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const userDetailsSchema = yup.object({
  email: yup.string().trim().email('Email wajib valid.').required('Email wajib diisi.'),
  status: yup
    .mixed<UserStatus>()
    .oneOf(['active', 'inactive'], 'Status akses tidak valid.')
    .required('Status akses wajib dipilih.'),
})

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .trim()
    .min(12, 'Kata sandi minimal 12 karakter.')
    .max(128, 'Kata sandi maksimal 128 karakter.')
    .required('Kata sandi baru wajib diisi.'),
})

export function UserSettings({ filters, onFiltersChange }: UserSettingsProps) {
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const usersQuery = useUsers({ ...filters, limit: 20 })

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const search = getFormValue(formData, 'search')
    const role = getOptionalRole(getFormValue(formData, 'role'))
    const status = getOptionalStatus(getFormValue(formData, 'status'))

    onFiltersChange({
      page: 1,
      ...(search ? { search } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-xl">Daftar pengguna</CardTitle>
          <CardDescription>
            Akses ini dikelola oleh owner dan perubahan diterapkan langsung ke akun pengguna.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]" onSubmit={handleFilterSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="user-search" className="sr-only">Cari pengguna</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input id="user-search" name="search" defaultValue={filters.search} placeholder="Cari email pengguna" className="pl-9" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-role" className="sr-only">Filter peran</Label>
              <select id="user-role" name="role" defaultValue={filters.role ?? ''} className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Semua peran</option>
                {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-status" className="sr-only">Filter status</Label>
              <select id="user-status" name="status" defaultValue={filters.status ?? ''} className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <Button type="submit">Terapkan</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {usersQuery.isPending ? <LoadingState /> : null}
          {usersQuery.isError ? <ErrorState /> : null}
          {usersQuery.data ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <caption className="sr-only">Daftar akun pengguna bimbel</caption>
                  <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3">Pengguna</th>
                      <th scope="col" className="px-6 py-3">Peran</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Login terakhir</th>
                      <th scope="col" className="px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersQuery.data.data.map((user) => (
                      <tr key={user.id} className="bg-card">
                        <td className="px-6 py-4 font-medium">{user.email}</td>
                        <td className="px-6 py-4 text-muted-foreground">{roleLabels[user.role]}</td>
                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(user.lastLoginAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                            <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {usersQuery.data.data.length === 0 ? <EmptyState /> : null}
              <Pagination
                page={usersQuery.data.meta.page}
                total={usersQuery.data.meta.total}
                totalPages={usersQuery.data.meta.totalPages}
                onPageChange={(page) => onFiltersChange({ ...filters, page })}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      {selectedUser ? <UserEditor user={selectedUser} onClose={() => setSelectedUser(null)} /> : null}
    </div>
  )
}

function UserEditor({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const updateMutation = useUpdateUser()
  const resetPasswordMutation = useResetUserPassword()
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    const formData = new FormData(event.currentTarget)
    let input: yup.InferType<typeof userDetailsSchema>

    try {
      input = userDetailsSchema.validateSync(
        {
          email: getFormValue(formData, 'email'),
          status: getFormValue(formData, 'status'),
        },
        { abortEarly: false },
      )
    } catch (error) {
      setFormError(getYupValidationMessage(error, 'Periksa kembali pengaturan akses.'))
      return
    }

    updateMutation.mutate(
      { id: user.id, input },
      {
        onSuccess: () => setSuccessMessage('Pengaturan akses berhasil disimpan.'),
        onError: (error) => setFormError(getMutationError(error)),
      },
    )
  }

  function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    let input: yup.InferType<typeof resetPasswordSchema>

    try {
      input = resetPasswordSchema.validateSync(
        {
          password: getFormValue(new FormData(event.currentTarget), 'password'),
        },
        { abortEarly: false },
      )
    } catch (error) {
      setFormError(getYupValidationMessage(error, 'Periksa kembali kata sandi baru.'))
      return
    }

    resetPasswordMutation.mutate(
      { id: user.id, password: input.password },
      {
        onSuccess: () => {
          event.currentTarget.reset()
          setSuccessMessage('Kata sandi berhasil direset. Pengguna perlu masuk kembali.')
        },
        onError: (error) => setFormError(getMutationError(error)),
      },
    )
  }

  const isPending = updateMutation.isPending || resetPasswordMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 p-0 sm:p-4" role="presentation">
      <section className="h-full w-full max-w-xl overflow-y-auto bg-background p-5 shadow-xl sm:rounded-lg sm:p-6" role="dialog" aria-modal="true" aria-labelledby="user-editor-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-text">Pengaturan pengguna</span>
            <h2 id="user-editor-title" className="mt-1 text-xl font-semibold">{user.email}</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Tutup pengaturan pengguna">
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleDetailsSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" name="email" type="email" defaultValue={user.email} autoComplete="email" required disabled={isPending} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status akses</Label>
            <select id="edit-status" name="status" defaultValue={user.status} className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" disabled={isPending}>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <Button type="submit" disabled={isPending}>{updateMutation.isPending ? 'Menyimpan...' : 'Simpan perubahan'}</Button>
        </form>

        <div className="mt-8 border-t pt-6">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 text-primary-text" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Reset kata sandi</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Minimal 12 karakter. Tindakan ini akan mengakhiri semua sesi aktif pengguna.</p>
            </div>
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleResetPassword}>
            <Label htmlFor="reset-password" className="sr-only">Kata sandi baru</Label>
            <Input id="reset-password" name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="Kata sandi baru" required disabled={isPending} />
            <Button type="submit" variant="outline" className="shrink-0" disabled={isPending}>{resetPasswordMutation.isPending ? 'Mereset...' : 'Reset kata sandi'}</Button>
          </form>
        </div>

        {formError ? <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{formError}</p> : null}
        {successMessage ? <p className="mt-5 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />{successMessage}</p> : null}
      </section>
    </div>
  )
}

function Pagination({ page, total, totalPages, onPageChange }: { page: number; total: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-sm">
      <span className="text-muted-foreground">{total} pengguna</span>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">Halaman {page} dari {totalPages}</span>
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Sebelumnya</Button>
        <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Berikutnya</Button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={status === 'active' ? 'success' : 'secondary'}>{status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge>
}

function LoadingState() {
  return <div className="grid min-h-64 place-items-center p-6 text-sm text-muted-foreground">Memuat pengguna...</div>
}

function ErrorState() {
  return <div className="grid min-h-64 place-items-center p-6 text-center"><div><UserRound className="mx-auto h-6 w-6 text-destructive" aria-hidden="true" /><p className="mt-3 font-medium">Data pengguna belum dapat dimuat.</p><p className="mt-1 text-sm text-muted-foreground">Coba muat ulang halaman atau periksa koneksi Anda.</p></div></div>
}

function EmptyState() {
  return <div className="grid min-h-48 place-items-center p-6 text-center"><div><UserRound className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" /><p className="mt-3 font-medium">Pengguna tidak ditemukan</p><p className="mt-1 text-sm text-muted-foreground">Ubah kata kunci atau filter untuk melihat akun lain.</p></div></div>
}

function formatDate(value: string | null) {
  if (!value) return 'Belum pernah masuk'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Tidak tersedia' : dateFormatter.format(date)
}

function getFormValue(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function getOptionalRole(value: string): UserRole | undefined {
  return ['owner', 'operator', 'tutor', 'parent'].includes(value) ? value as UserRole : undefined
}

function getOptionalStatus(value: string): UserStatus | undefined {
  return value === 'active' || value === 'inactive' ? value : undefined
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError) return error.message
  return 'Perubahan belum dapat disimpan. Silakan coba lagi.'
}

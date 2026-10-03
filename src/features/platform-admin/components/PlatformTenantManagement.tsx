import { type FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { Building2, Pencil, Search, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type CreatePlatformTenantInput,
  type PlatformManagedTenant,
  type PlatformTenantStatus,
} from '@/features/platform-admin/api/platform-admin-api'
import {
  useCreatePlatformTenant,
  useManagedPlatformTenants,
  usePlatformTenantOwners,
  useUpdatePlatformTenant,
} from '@/features/platform-admin/hooks/use-platform-users'
import { ApiError } from '@/services/api-client'

type PlatformTenantManagementProps = {
  filters: {
    page: number
    search?: string
    status?: PlatformTenantStatus
  }
  onFiltersChange: (filters: PlatformTenantManagementProps['filters']) => void
  isCreateDialogOpen: boolean
  onCreateDialogOpenChange: (isOpen: boolean) => void
}

export function PlatformTenantManagement({
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
}: PlatformTenantManagementProps) {
  const [selectedTenant, setSelectedTenant] =
    useState<PlatformManagedTenant | null>(null)
  const tenantsQuery = useManagedPlatformTenants({ ...filters, limit: 20 })

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const search = getRequiredFormValue(formData, 'search')
    const status = getTenantStatus(formData.get('status'))
    onFiltersChange({
      page: 1,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    })
  }

  if (tenantsQuery.isPending) return <LoadingState />
  if (tenantsQuery.isError) return <ErrorState />

  const tenants = tenantsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <form
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_auto]"
        onSubmit={handleFilterSubmit}
      >
        <div className="relative">
          <Label htmlFor="platform-tenant-search" className="sr-only">
            Cari bimbel
          </Label>
          <Search
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="platform-tenant-search"
            name="search"
            defaultValue={filters.search}
            placeholder="Cari bimbel atau owner"
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          aria-label="Filter status"
          className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
        <Button type="submit">Terapkan</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <caption className="sr-only">Daftar bimbel atau tenant</caption>
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-3">Bimbel</th>
                  <th scope="col" className="px-6 py-3">Owner</th>
                  <th scope="col" className="px-6 py-3">Kontak</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-card">
                    <td className="px-6 py-4 font-medium">{tenant.name}</td>
                    <td className="px-6 py-4">
                      <span className="block font-medium">{tenant.ownerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.ownerEmail}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {tenant.email ?? tenant.whatsappNumber ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tenants.length === 0 ? <EmptyState /> : null}
          {tenantsQuery.data ? (
            <Pagination
              page={tenantsQuery.data.meta.page}
              total={tenantsQuery.data.meta.total}
              totalPages={tenantsQuery.data.meta.totalPages}
              onPageChange={(page) => onFiltersChange({ ...filters, page })}
            />
          ) : null}
        </CardContent>
      </Card>

      {isCreateDialogOpen ? (
        <TenantFormDialog onClose={() => onCreateDialogOpenChange(false)} />
      ) : null}
      {selectedTenant ? (
        <TenantFormDialog
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      ) : null}
    </div>
  )
}

function Pagination({
  page,
  total,
  totalPages,
  onPageChange,
}: {
  page: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-sm">
      <span className="text-muted-foreground">{total} bimbel</span>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          Halaman {page} dari {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}

function TenantFormDialog({
  tenant,
  onClose,
}: {
  tenant?: PlatformManagedTenant
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const ownersQuery = usePlatformTenantOwners()
  const createMutation = useCreatePlatformTenant()
  const updateMutation = useUpdatePlatformTenant()
  const isEditing = tenant !== undefined
  const isPending = createMutation.isPending || updateMutation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const ownerId = getRequiredFormValue(formData, 'ownerId')
    if (!ownerId) {
      setError('Pilih owner untuk bimbel ini.')
      return
    }

    const input: CreatePlatformTenantInput = {
      ownerId,
      name: getRequiredFormValue(formData, 'name'),
      address: getNullableFormValue(formData, 'address'),
      whatsappNumber: getNullableFormValue(formData, 'whatsappNumber'),
      email: getNullableFormValue(formData, 'email'),
      logoUrl: getNullableFormValue(formData, 'logoUrl'),
      status: getStatus(formData.get('status')),
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: tenant.id, input },
        {
          onSuccess: onClose,
          onError: (mutationError) => setError(getErrorMessage(mutationError)),
        },
      )
      return
    }

    createMutation.mutate(input, {
      onSuccess: onClose,
      onError: (mutationError) => setError(getErrorMessage(mutationError)),
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
    >
      <section
        className="w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-tenant-dialog-title"
      >
        <div className="create-platform-user-modal-scroll max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="platform-tenant-dialog-title" className="text-xl font-semibold">
                {isEditing ? 'Edit bimbel' : 'Tambah bimbel'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {isEditing
                  ? 'Perbarui informasi dan status operasional bimbel.'
                  : 'Lengkapi data bimbel sebelum menambahkannya ke platform.'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isPending}
              aria-label="Tutup form bimbel"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="platform-tenant-owner">Owner</Label>
              <select
                id="platform-tenant-owner"
                name="ownerId"
                defaultValue={tenant?.ownerId ?? ''}
                required
                disabled={isPending || ownersQuery.isPending || ownersQuery.isError}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">
                  {ownersQuery.isPending
                    ? 'Memuat owner...'
                    : ownersQuery.isError
                      ? 'Owner tidak dapat dimuat'
                      : 'Pilih owner'}
                </option>
                {ownersQuery.data?.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
              {ownersQuery.data?.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Buat akun owner aktif terlebih dahulu dari menu Pengguna.
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="platform-tenant-name">Nama bimbel</Label>
              <Input
                id="platform-tenant-name"
                name="name"
                defaultValue={tenant?.name ?? ''}
                minLength={2}
                maxLength={150}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="platform-tenant-address">Alamat</Label>
              <textarea
                id="platform-tenant-address"
                name="address"
                defaultValue={tenant?.address ?? ''}
                maxLength={5000}
                disabled={isPending}
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="platform-tenant-whatsapp"
                  name="whatsappNumber"
                  type="tel"
                  defaultValue={tenant?.whatsappNumber ?? ''}
                  maxLength={20}
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-email">Email bimbel</Label>
                <Input
                  id="platform-tenant-email"
                  name="email"
                  type="email"
                  defaultValue={tenant?.email ?? ''}
                  maxLength={150}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-logo">URL logo</Label>
                <Input
                  id="platform-tenant-logo"
                  name="logoUrl"
                  type="url"
                  defaultValue={tenant?.logoUrl ?? ''}
                  maxLength={500}
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-status">Status</Label>
                <select
                  id="platform-tenant-status"
                  name="status"
                  defaultValue={tenant?.status ?? 'active'}
                  disabled={isPending}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            {error ? (
              <p
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={
                  isPending ||
                  ownersQuery.isPending ||
                  ownersQuery.isError ||
                  ownersQuery.data?.length === 0
                }
              >
                {isPending
                  ? 'Menyimpan...'
                  : isEditing
                    ? 'Simpan perubahan'
                    : 'Tambah bimbel'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>,
    document.body,
  )
}

function StatusBadge({ status }: { status: PlatformManagedTenant['status'] }) {
  return (
    <Badge variant={status === 'active' ? 'success' : 'secondary'}>
      {status === 'active' ? 'Aktif' : 'Nonaktif'}
    </Badge>
  )
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Memuat daftar bimbel...
      </CardContent>
    </Card>
  )
}

function ErrorState() {
  return (
    <Card>
      <CardContent className="grid min-h-64 place-items-center text-center">
        <div>
          <Building2 className="mx-auto h-6 w-6 text-destructive" aria-hidden="true" />
          <p className="mt-3 font-medium">Data bimbel belum dapat dimuat.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Periksa koneksi atau coba lagi.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-48 place-items-center p-6 text-center">
      <div>
        <Building2 className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-medium">Belum ada bimbel</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan bimbel pertama untuk mulai mengelolanya di platform.
        </p>
      </div>
    </div>
  )
}

function getRequiredFormValue(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function getNullableFormValue(formData: FormData, name: string) {
  const value = getRequiredFormValue(formData, name)
  return value || null
}

function getStatus(value: FormDataEntryValue | null): 'active' | 'inactive' {
  return value === 'inactive' ? 'inactive' : 'active'
}

function getTenantStatus(
  value: FormDataEntryValue | null,
): PlatformTenantStatus | undefined {
  if (value === 'active' || value === 'inactive') return value
  return undefined
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : 'Data bimbel belum dapat disimpan. Silakan coba lagi.'
}

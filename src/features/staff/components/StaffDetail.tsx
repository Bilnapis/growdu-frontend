import { useState } from 'react'
import {
  Pencil,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { StaffActionDialog } from '@/features/staff/components/StaffActionDialog'
import { getStaffError, getStaffTenantId } from '@/features/staff/api/staff-api'
import { useStaffMember } from '@/features/staff/hooks/use-staff'
import { ApiError } from '@/services/api-client'

export function StaffDetail({ id }: { id: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const tenantId = getStaffTenantId()
  const staffQuery = useStaffMember(tenantId, id)
  const staff = staffQuery.data
  const errorStatus = staffQuery.error instanceof ApiError ? staffQuery.error.status : null

  if (!tenantId) {
    return <p role="alert">Hanya pemilik bimbel yang dapat mengelola pegawai. Pilih bimbel terlebih dahulu.</p>
  }

  return (
    <section aria-labelledby="staff-detail-title" className="min-w-0 space-y-[18px]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="staff-detail-title" className="text-[28px] font-bold leading-[1.2] tracking-tight">Detail Pegawai</h1>
        {staff && !staffQuery.isError ? (
          <Button type="button" size="sm" className="h-[42px] rounded-lg px-[18px] text-sm font-bold" onClick={() => setIsEditing(true)}>
            <Pencil className="h-[17px] w-[17px]" aria-hidden="true" />
            Edit Pegawai
          </Button>
        ) : null}
      </header>

      {staffQuery.isPending ? (
        <p role="status" className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">Memuat detail pegawai...</p>
      ) : staffQuery.isError || !staff ? (
        <section role="alert" className="space-y-4 rounded-lg border bg-card p-6">
          <h2 className="font-semibold">{errorStatus === 404 ? 'Pegawai tidak ditemukan' : errorStatus === 401 || errorStatus === 403 ? 'Anda tidak memiliki akses ke data pegawai ini.' : getStaffError(staffQuery.error)}</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/staff">Kembali ke daftar pegawai</Link></Button>
            {errorStatus !== 404 && errorStatus !== 401 && errorStatus !== 403 ? <Button type="button" onClick={() => void staffQuery.refetch()} disabled={staffQuery.isFetching}>Coba lagi</Button> : null}
          </div>
        </section>
      ) : (
        <>
          <section aria-label="Profil pegawai" className="flex items-center gap-4 rounded-lg border bg-card p-5">
            <div aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-xl font-extrabold text-[var(--color-brand-700)]">
              {getInitials(staff.name)}
            </div>
            <div className="min-w-0 space-y-2">
              <h2 className="break-words text-xl font-bold leading-[1.35]">{staff.name}</h2>
              <StatusBadge status={staff.status} />
            </div>
          </section>

          <section aria-labelledby="staff-account-heading" className="rounded-lg border bg-card p-5">
            <div className="space-y-1">
              <h2 id="staff-account-heading" className="text-lg font-bold">Informasi akun</h2>
              <p className="text-[13px] leading-[1.35] text-muted-foreground">Informasi akun pegawai.</p>
            </div>
            <dl className="mt-4 grid gap-x-[14px] gap-y-5 sm:grid-cols-2">
              <DetailField label="Nama lengkap" value={staff.name} />
              <DetailField label="Email" value={staff.email} />
              <DetailField label="Nomor WhatsApp" value={staff.phoneNumber} />
              <DetailField label="Alamat" value={staff.address} />
            </dl>
          </section>
        </>
      )}

      {isEditing && staff ? <StaffActionDialog staff={staff} mode="edit" tenantId={tenantId} onClose={() => setIsEditing(false)} onSuccess={() => setIsEditing(false)} /> : null}
    </section>
  )
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-bold leading-[1.35] text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-line break-words text-sm font-semibold leading-[1.35]">{value?.trim() || 'Belum diisi'}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const active = status === 'active'

  return <span className={active ? 'inline-flex rounded-full bg-[var(--color-success-bg)] px-2.5 py-1 text-xs font-bold text-[var(--color-success)]' : 'inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground'}>{active ? 'Aktif' : 'Nonaktif'}</span>
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('').toLocaleUpperCase('id-ID') || 'PG'
}
import { type ReactNode } from 'react'
import { BookOpen, Pencil, UserX, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useTutor, useUpdateTutor } from '@/features/tutors/hooks/use-tutors'
import { ApiError } from '@/services/api-client'

export function TutorDetail({ id }: { id: string }) {
  const tutorQuery = useTutor(id)
  const updateMutation = useUpdateTutor()
  const tutor = tutorQuery.data
  const errorStatus = tutorQuery.error instanceof ApiError ? tutorQuery.error.status : null

  function deactivateTutor() {
    if (!tutor || updateMutation.isPending) return
    updateMutation.mutate({
      id: tutor.id,
      input: {
        name: tutor.name,
        phoneNumber: tutor.phoneNumber,
        sessionRate: tutor.sessionRate,
        status: 'inactive',
      },
    })
  }

  return (
    <div className="min-w-0 space-y-[18px] text-[var(--color-text)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-1 text-xs font-semibold text-[var(--color-muted)]">
            <Link to="/tutors" className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Data Tentor</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Detail Tentor</span>
          </nav>
          <h1 className="text-2xl font-bold leading-snug">Detail Tentor</h1>
        </div>
        {tutor && !tutorQuery.isError ? (
          <div className="flex flex-wrap gap-2.5">
            <Button size="sm" asChild>
              <Link to={`/tutors/${tutor.id}/edit`}><Pencil className="h-4 w-4" aria-hidden="true" /> Ubah Data</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
              disabled={tutor.status === 'inactive' || updateMutation.isPending}
              onClick={deactivateTutor}
            >
              <UserX className="h-4 w-4" aria-hidden="true" />
              {updateMutation.isPending ? 'Menonaktifkan...' : tutor.status === 'inactive' ? 'Tentor Nonaktif' : 'Nonaktifkan Tentor'}
            </Button>
          </div>
        ) : null}
      </header>

      {tutorQuery.isPending ? (
        <p role="status" className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">Memuat detail tentor...</p>
      ) : tutorQuery.isError || !tutor ? (
        <section role="alert" className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold">{errorStatus === 404 ? 'Tentor tidak ditemukan' : errorStatus === 401 || errorStatus === 403 ? 'Anda tidak memiliki akses ke data tentor ini.' : 'Detail tentor belum dapat dimuat.'}</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/tutors">Kembali ke Data Tentor</Link></Button>
            {errorStatus !== 404 && errorStatus !== 401 && errorStatus !== 403 ? (
              <Button onClick={() => void tutorQuery.refetch()} disabled={tutorQuery.isFetching}>Coba lagi</Button>
            ) : null}
          </div>
        </section>
      ) : (
        <>
          {updateMutation.isError ? <p role="alert" className="rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]">Tentor belum dapat dinonaktifkan. Silakan coba lagi.</p> : null}
          {updateMutation.isSuccess ? <p role="status" className="text-sm text-[var(--color-success)]">Tentor berhasil dinonaktifkan.</p> : null}
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="min-w-0 space-y-4">
              <section aria-label="Profil tentor" className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
                <div aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-xl font-extrabold text-[var(--color-brand-700)]">
                  {tutor.name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toLocaleUpperCase('id-ID')}
                </div>
                <div className="min-w-0 space-y-2">
                  <h2 className="break-words text-xl font-bold">{tutor.name}</h2>
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${tutor.status === 'active' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-muted text-muted-foreground'}`}>
                    {tutor.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </section>
              <DetailSection title="Informasi Tentor" description="Identitas tentor yang dipakai pada kelompok belajar dan laporan">
                <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <DetailField label="Nomor Handphone" value={tutor.phoneNumber} />
                  <DetailField label="Email" value={tutor.email} />
                  <DetailField label="Keahlian" value={tutor.expertise} />
                  <DetailField label="Pendidikan" value={tutor.education} />
                  <div className="sm:col-span-2"><DetailField label="Alamat" value={tutor.address} /></div>
                </dl>
              </DetailSection>
              <DetailSection title="Data Rekening" description="Dipakai untuk penggajian">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <DetailField label="Bank / E-Wallet" value={tutor.bankName} />
                  <DetailField label="Atas Nama" value={tutor.accountName} />
                  <DetailField label="Nomor Rekening" value={tutor.accountNumber} />
                </dl>
              </DetailSection>
            </div>
            <aside className="min-w-0 space-y-4" aria-label="Kelompok dan penggajian tentor">
              <DetailSection title="Kelompok aktif" description="Daftar penempatan tentor di kelompok belajar">
                <div className="rounded-md border border-border bg-[var(--color-bg)] p-4 text-sm text-muted-foreground">
                  <BookOpen className="mb-2 h-5 w-5" aria-hidden="true" />
                  Data kelompok belajar belum tersedia.
                </div>
              </DetailSection>
              <DetailSection title="Penggajian Terakhir" description="Ringkasan penggajian terbaru tentor untuk dicek sebelum membuka detail pembayaran.">
                <div className="rounded-md border border-border bg-[var(--color-bg)] p-4 text-sm text-muted-foreground">
                  <WalletCards className="mb-2 h-5 w-5" aria-hidden="true" />
                  Data penggajian belum tersedia.
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <WalletCards className="h-4 w-4" aria-hidden="true" /> Lihat Penggajian
                </Button>
              </DetailSection>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function DetailSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-[13px] leading-snug text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-line break-words text-sm font-semibold">{value?.trim() || 'Belum diisi'}</dd>
    </div>
  )
}

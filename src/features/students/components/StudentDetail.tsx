import { type ReactNode, useState } from 'react'
import {
  BookOpen,
  Pencil,
  ReceiptText,
  UserRoundX,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type { StudentListItem } from '@/features/students/api/students-api'
import {
  useStudent,
  useStudentParents,
  useUpdateStudent,
} from '@/features/students/hooks/use-students'
import { ApiError } from '@/services/api-client'
import { StudentCreateForm } from './StudentCreateForm'

export function StudentDetail({ id }: { id: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const studentQuery = useStudent(id)
  const parentsQuery = useStudentParents(id)
  const updateMutation = useUpdateStudent()
  const student = studentQuery.data
  const primaryParent = parentsQuery.data?.find((parent) => parent.isPrimary)
  const error = studentQuery.error ?? parentsQuery.error
  const errorStatus = error instanceof ApiError ? error.status : null
  const isPending = studentQuery.isPending || parentsQuery.isPending
  const isError = studentQuery.isError || parentsQuery.isError

  const editableStudent: StudentListItem | null = student
    ? { ...student, primaryParent: primaryParent ?? null }
    : null

  function deactivateStudent() {
    if (!student || updateMutation.isPending) return
    updateMutation.mutate({ id: student.id, input: { status: 'inactive' } })
  }

  function retry() {
    void Promise.all([studentQuery.refetch(), parentsQuery.refetch()])
  }

  return (
    <div className="min-w-0 space-y-[18px] text-[var(--color-text)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-1 text-xs font-semibold text-[var(--color-muted)]"
          >
            <Link
              to="/students"
              className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Data Siswa
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{student?.name ?? 'Detail Siswa'}</span>
          </nav>
          <h1 className="text-2xl font-bold leading-snug">Detail Siswa</h1>
        </div>

        {editableStudent && !isError ? (
          <div className="flex flex-wrap gap-2.5">
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Ubah Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
              disabled={
                editableStudent.status === 'inactive' ||
                updateMutation.isPending
              }
              onClick={deactivateStudent}
            >
              <UserRoundX className="h-4 w-4" aria-hidden="true" />
              {updateMutation.isPending
                ? 'Menonaktifkan...'
                : editableStudent.status === 'inactive'
                  ? 'Siswa Nonaktif'
                  : 'Nonaktifkan Siswa'}
            </Button>
          </div>
        ) : null}
      </header>

      {isPending ? (
        <StudentDetailLoading />
      ) : isError || !student ? (
        <StudentDetailError
          status={errorStatus}
          isFetching={studentQuery.isFetching || parentsQuery.isFetching}
          onRetry={retry}
        />
      ) : (
        <>
          {updateMutation.isError ? (
            <p
              role="alert"
              className="rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]"
            >
              Siswa belum dapat dinonaktifkan. Silakan coba lagi.
            </p>
          ) : null}
          {updateMutation.isSuccess ? (
            <p role="status" className="text-sm text-[var(--color-success)]">
              Siswa berhasil dinonaktifkan.
            </p>
          ) : null}

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="min-w-0 space-y-4">
              <section
                aria-label="Profil siswa"
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-5"
              >
                <div
                  aria-hidden="true"
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-xl font-extrabold text-[var(--color-brand-700)]"
                >
                  {getInitials(student.name)}
                </div>
                <div className="min-w-0 space-y-2">
                  <h2 className="break-words text-xl font-bold">
                    {student.name}
                  </h2>
                  <StatusBadge status={student.status} />
                </div>
              </section>

              <DetailSection
                title="Informasi Siswa"
                description="Identitas siswa yang dipakai pada kelompok belajar, invoice, dan laporan."
              >
                <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <DetailField label="Sekolah" value={student.school} />
                  <DetailField
                    label="Jenjang"
                    value={student.educationLevel}
                  />
                  <DetailField
                    label="Nomor HP siswa"
                    value={student.phoneNumber}
                  />
                  <DetailField
                    label="Jenis kelamin"
                    value={
                      student.gender === 'female' ? 'Perempuan' : 'Laki-laki'
                    }
                  />
                  <div className="sm:col-span-2">
                    <DetailField label="Alamat siswa" value={student.address} />
                  </div>
                </dl>
              </DetailSection>

              <DetailSection
                title="Data Orang Tua"
                description="Dipakai untuk invoice dan pengiriman laporan perkembangan."
              >
                <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <DetailField
                    label="Nama orang tua"
                    value={primaryParent?.parentName ?? null}
                  />
                  <DetailField
                    label="Nomor HP orang tua"
                    value={primaryParent?.parentPhoneNumber ?? null}
                  />
                  <div className="sm:col-span-2">
                    <DetailField
                      label="Email orang tua"
                      value={primaryParent?.parentContactEmail ?? null}
                    />
                  </div>
                </dl>
              </DetailSection>
            </div>

            <aside
              className="min-w-0 space-y-4"
              aria-label="Kelompok dan invoice siswa"
            >
              <DetailSection
                title="Kelompok aktif"
                description="Riwayat ringkas penempatan siswa."
              >
                <EmptyPanel
                  icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
                  message="Data kelompok belajar belum tersedia."
                />
              </DetailSection>

              <DetailSection
                title="Invoice SPP Terakhir"
                description="Ringkasan tagihan SPP terbaru siswa untuk dicek sebelum membuka detail invoice."
              >
                <EmptyPanel
                  icon={<ReceiptText className="h-5 w-5" aria-hidden="true" />}
                  message="Data invoice SPP belum tersedia."
                />
                <Button variant="outline" className="w-full" disabled>
                  <ReceiptText className="h-4 w-4" aria-hidden="true" />
                  Lihat Invoice SPP
                </Button>
              </DetailSection>
            </aside>
          </div>
        </>
      )}

      {isEditing && editableStudent ? (
        <StudentCreateForm
          student={editableStudent}
          onClose={() => setIsEditing(false)}
        />
      ) : null}
    </div>
  )
}

function DetailSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="space-y-4 rounded-lg border border-border bg-card p-5"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-[13px] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-line break-words text-sm font-semibold">
        {value?.trim() || 'Belum diisi'}
      </dd>
    </div>
  )
}

function StatusBadge({ status }: { status: StudentListItem['status'] }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
        status === 'active'
          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {status === 'active' ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}

function EmptyPanel({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="rounded-md border border-border bg-[var(--color-bg)] p-4 text-sm text-muted-foreground">
      <div className="mb-2">{icon}</div>
      {message}
    </div>
  )
}

function StudentDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat detail siswa"
      className="grid animate-pulse gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"
    >
      <div className="space-y-4">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-44 rounded-lg bg-muted" />
        <div className="h-56 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

function StudentDetailError({
  status,
  isFetching,
  onRetry,
}: {
  status: number | null
  isFetching: boolean
  onRetry: () => void
}) {
  const isForbidden = status === 401 || status === 403
  const message =
    status === 404
      ? 'Siswa tidak ditemukan.'
      : isForbidden
        ? 'Anda tidak memiliki akses ke data siswa ini.'
        : 'Detail siswa belum dapat dimuat.'

  return (
    <section
      role="alert"
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h2 className="font-semibold">{message}</h2>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/students">Kembali ke Data Siswa</Link>
        </Button>
        {status !== 404 && !isForbidden ? (
          <Button onClick={onRetry} disabled={isFetching}>
            {isFetching ? 'Memuat...' : 'Coba lagi'}
          </Button>
        ) : null}
      </div>
    </section>
  )
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase('id-ID')
}

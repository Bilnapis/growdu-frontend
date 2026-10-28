import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  UserRoundX,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { AddButton } from '@/components/ui/add-button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  EntityStatus,
  StudentListItem,
  StudentsFilters,
} from '@/features/students/api/students-api'
import {
  useStudents,
  useStudentsSummary,
  useUpdateStudent,
} from '@/features/students/hooks/use-students'
import { ApiError } from '@/services/api-client'
import { StudentCreateForm } from './StudentCreateForm'

type DialogState = { type: 'edit'; student: StudentListItem } | null

const pageSize = 5
const cellClass = 'px-[18px] py-3'

export function StudentManagement() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<StudentsFilters>({
    page: 1,
    limit: pageSize,
  })
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)
  const studentsQuery = useStudents(filters)
  const summaryQuery = useStudentsSummary()
  const updateMutation = useUpdateStudent()

  useEffect(() => {
    if (!menuId) return
    menuRef.current?.querySelector('button')?.focus()
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target) &&
        !menuTriggerRef.current?.contains(event.target)
      )
        setMenuId(null)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuId(null)
        menuTriggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [menuId])

  const summary = [
    [
      'Siswa Aktif',
      summaryQuery.data?.active,
      Users,
      'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    ],
    [
      'Nonaktif',
      summaryQuery.data?.inactive,
      UserRoundX,
      'bg-muted text-muted-foreground',
    ],
    [
      'Kontak Orang Tua Kosong',
      summaryQuery.data?.missingParentContact,
      Mail,
      'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    ],
    [
      'Belum Masuk Kelompok',
      summaryQuery.data?.withoutGroup,
      BookOpen,
      'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    ],
  ] as const

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const search = getFormValue(new FormData(event.currentTarget), 'search')
    setFilters((current) => ({
      ...current,
      page: 1,
      search: search || undefined,
    }))
  }

  function setStatus(value: string) {
    setFilters((current) => ({
      ...current,
      page: 1,
      status: value === 'active' || value === 'inactive' ? value : undefined,
    }))
  }

  function setEducationStage(value: string) {
    setFilters((current) => ({
      ...current,
      page: 1,
      educationStage:
        value === 'SD' || value === 'SMP' || value === 'SMA'
          ? value
          : undefined,
    }))
  }

  function resetFilters() {
    setFilters({ page: 1, limit: pageSize })
    setMenuId(null)
  }

  function toggleStatus(student: StudentListItem) {
    const status: EntityStatus =
      student.status === 'active' ? 'inactive' : 'active'
    setActionError('')
    updateMutation.mutate(
      { id: student.id, input: { status } },
      {
        onSuccess: () => {
          setNotice(
            `${student.name} berhasil ${status === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`,
          )
          setMenuId(null)
          menuTriggerRef.current?.focus()
        },
        onError: (error: unknown) => setActionError(getMutationError(error)),
      },
    )
  }

  const data = studentsQuery.data?.data ?? []
  const meta = studentsQuery.data?.meta

  return (
    <div className="min-w-0" aria-labelledby="students-title">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1
            id="students-title"
            className="text-[26px] font-bold leading-tight"
          >
            Data Siswa
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Kelola siswa aktif, kontak orang tua, dan status belajar.
          </p>
        </div>
        <AddButton onClick={() => void navigate('/students/new')}>
          Tambah Siswa
        </AddButton>
      </header>

      <section
        aria-label="Ringkasan siswa"
        aria-busy={summaryQuery.isPending}
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summary.map(([label, value, Icon, tone]) => (
          <Card key={label} className="p-4 shadow-none">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${tone}`}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <h2 className="text-xs font-bold text-muted-foreground">
                {label}
              </h2>
            </div>
            <p className="mt-1.5 text-[26px] font-bold leading-[1.3]">
              {value ?? '—'}
            </p>
          </Card>
        ))}
      </section>

      <p role="status" className="sr-only">
        {notice}
      </p>
      {notice ? <Notice tone="success">{notice}</Notice> : null}
      {actionError ? <Notice tone="error">{actionError}</Notice> : null}

      <Card className="mt-5 min-h-[560px] p-4 shadow-none sm:p-[18px]">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center"
          onSubmit={handleSearch}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="student-search" className="sr-only">
              Cari siswa
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]"
                aria-hidden="true"
              />
              <Input
                key={filters.search ?? 'empty-search'}
                id="student-search"
                name="search"
                defaultValue={filters.search}
                placeholder="Cari nama siswa, sekolah, atau orang tua"
                className="h-10 rounded-md border-[var(--color-border)] bg-[var(--color-gray-50)] pl-10 text-[13px] font-medium text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Label htmlFor="student-status" className="sr-only">
                Filter status siswa
              </Label>
              <select
                id="student-status"
                value={filters.status ?? ''}
                className="h-10 appearance-none rounded-md border border-[var(--color-border)] bg-white py-2 pl-3.5 pr-9 text-[13px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <SlidersHorizontal
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
                aria-hidden="true"
              />
            </div>
            <div className="relative">
              <Label htmlFor="student-stage" className="sr-only">
                Filter jenjang siswa
              </Label>
              <select
                id="student-stage"
                value={filters.educationStage ?? ''}
                className="h-10 appearance-none rounded-md border border-[var(--color-border)] bg-white py-2 pl-3.5 pr-9 text-[13px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(event) => setEducationStage(event.target.value)}
              >
                <option value="">Jenjang</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
                aria-hidden="true"
              />
            </div>
          </div>
        </form>

        {studentsQuery.isPending ? <StudentsLoadingState /> : null}
        {studentsQuery.isError ? (
          <StudentsErrorState onRetry={() => void studentsQuery.refetch()} />
        ) : null}
        {studentsQuery.data ? (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel siswa, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar siswa bimbel</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    {[
                      'Nama Siswa',
                      'Jenjang / Sekolah',
                      'Orang Tua',
                      'Kontak',
                      'Alamat',
                      'Kelompok',
                      'Status',
                      'Aksi',
                    ].map((label) => (
                      <th
                        scope="col"
                        key={label}
                        className={
                          label === 'Aksi'
                            ? 'px-3 font-bold'
                            : 'px-[18px] font-bold'
                        }
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((student) => (
                    <tr
                      key={student.id}
                      className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                    >
                      <th
                        scope="row"
                        className={`${cellClass} min-w-[135px] text-[13px] font-bold`}
                      >
                        {student.name}
                      </th>
                      <td
                        className={`${cellClass} min-w-[145px] whitespace-pre-line font-medium`}
                      >
                        {student.educationLevel} / {student.school}
                      </td>
                      <td
                        className={`${cellClass} min-w-[120px] whitespace-pre-line font-semibold`}
                      >
                        {student.primaryParent?.parentName ?? '-'}
                      </td>
                      <td
                        className={`${cellClass} min-w-[180px] whitespace-pre-line break-words font-medium`}
                      >
                        {student.primaryParent?.parentPhoneNumber ??
                          student.phoneNumber ??
                          '-'}
                        {student.primaryParent?.parentContactEmail ? (
                          <>
                            <br />
                            {student.primaryParent.parentContactEmail}
                          </>
                        ) : null}
                      </td>
                      <td
                        className={`${cellClass} min-w-[155px] max-w-[210px] font-medium`}
                      >
                        {student.address}
                      </td>
                      <td
                        className={`${cellClass} min-w-[100px] font-semibold`}
                      >
                        -
                      </td>
                      <td className={cellClass}>
                        <StudentStatusBadge student={student} />
                      </td>
                      <td className="relative px-3 py-3">
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-text"
                            aria-label={`Edit ${student.name}`}
                            onClick={() => setDialog({ type: 'edit', student })}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            aria-label={`Menu aksi ${student.name}`}
                            aria-expanded={menuId === student.id}
                            onClick={(event) => {
                              menuTriggerRef.current = event.currentTarget
                              setMenuId(
                                menuId === student.id ? null : student.id,
                              )
                            }}
                          >
                            <MoreHorizontal
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                        {menuId === student.id ? (
                          <div
                            ref={menuRef}
                            className="absolute right-2 top-14 z-10 w-[190px] space-y-1 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-md)]"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 w-full text-xs"
                              onClick={() => {
                                setMenuId(null)
                                void navigate(`/students/${student.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                              Lihat detail
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={updateMutation.isPending}
                              className="h-8 w-full border-[var(--color-danger-border)] text-xs text-destructive"
                              onClick={() => toggleStatus(student)}
                            >
                              <UserRoundX
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              {student.status === 'active'
                                ? 'Nonaktifkan siswa'
                                : 'Aktifkan siswa'}
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length === 0 ? (
              <StudentsEmptyState onReset={resetFilters} />
            ) : null}
            {meta && data.length > 0 ? (
              <StudentsPagination
                meta={meta}
                onPageChange={(page) =>
                  setFilters((current) => ({ ...current, page }))
                }
              />
            ) : null}
          </>
        ) : null}
      </Card>

      {dialog?.type === 'edit' ? (
        <StudentCreateForm
          student={dialog.student}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  )
}

function StudentStatusBadge({ student }: { student: StudentListItem }) {
  const incomplete =
    student.status === 'active' && !student.primaryParent?.parentContactEmail
  const tone =
    student.status === 'inactive'
      ? 'bg-muted text-muted-foreground'
      : incomplete
        ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
        : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-[5px] text-xs font-bold leading-[1.2] ${tone}`}
    >
      {student.status === 'inactive'
        ? 'Nonaktif'
        : incomplete
          ? 'Perlu Data'
          : 'Aktif'}
    </span>
  )
}

function Notice({
  tone,
  children,
}: {
  tone: 'success' | 'error'
  children: string
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mt-4 rounded-md px-4 py-3 text-sm ${tone === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'}`}
    >
      {children}
    </p>
  )
}

function StudentsLoadingState() {
  return (
    <div
      className="mt-4 space-y-3"
      aria-label="Memuat daftar siswa"
      role="status"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-[70px] animate-pulse rounded-md bg-muted"
        />
      ))}
    </div>
  )
}

function StudentsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center text-center" role="alert">
      <div>
        <h2 className="font-semibold">Data siswa gagal dimuat</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Periksa koneksi lalu coba lagi.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          Coba lagi
        </Button>
      </div>
    </div>
  )
}

function StudentsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="grid min-h-56 place-items-center text-center">
      <div>
        <Users
          className="mx-auto h-7 w-7 text-muted-foreground"
          aria-hidden="true"
        />
        <h2 className="mt-3 font-semibold">Siswa tidak ditemukan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Coba kata kunci lain atau ubah filter pencarian.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onReset}
        >
          Reset filter
        </Button>
      </div>
    </div>
  )
}

function StudentsPagination({
  meta,
  onPageChange,
}: {
  meta: { page: number; limit: number; total: number; totalPages: number }
  onPageChange: (page: number) => void
}) {
  const start = Math.min(
    Math.max(meta.page - 1, 1),
    Math.max(1, meta.totalPages - 2),
  )
  const pages = Array.from(
    { length: Math.min(3, meta.totalPages) },
    (_, index) => start + index,
  )
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 px-3 py-4 text-xs text-muted-foreground">
      <span>
        Menampilkan {(meta.page - 1) * meta.limit + 1}-
        {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} siswa
      </span>
      <nav aria-label="Halaman siswa" className="flex items-center gap-1.5">
        <PageButton
          label="Halaman sebelumnya"
          disabled={meta.page === 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </PageButton>
        {pages.map((page) => (
          <Button
            type="button"
            key={page}
            variant={page === meta.page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            aria-label={`Halaman ${page}`}
            aria-current={page === meta.page ? 'page' : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <PageButton
          label="Halaman berikutnya"
          disabled={meta.page === meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </PageButton>
      </nav>
    </footer>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-8 w-8"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function getFormValue(data: FormData, key: string) {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError && error.status === 403)
    return 'Anda tidak memiliki izin untuk mengubah data siswa.'
  return 'Data siswa belum dapat diperbarui. Silakan coba lagi.'
}

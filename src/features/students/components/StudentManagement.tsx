import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  BookOpen,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  UserRoundX,
  Users,
  UsersRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { AddButton } from '@/components/ui/add-button'
import { Card } from '@/components/ui/card'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { Label } from '@/components/ui/label'
import { SummaryCard, SummaryCardGrid } from '@/components/ui/summary-card'
import { TablePagination } from '@/components/ui/table-pagination'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
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
  const [searchResetKey, setSearchResetKey] = useState(0)
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
    ['Siswa Aktif', summaryQuery.data?.active, UsersRound, 'success'],
    ['Nonaktif', summaryQuery.data?.inactive, UserRoundX, 'muted'],
    [
      'Kontak Orang Tua Kosong',
      summaryQuery.data?.missingParentContact,
      Mail,
      'warning',
    ],
    [
      'Belum Masuk Kelompok',
      summaryQuery.data?.withoutGroup,
      BookOpen,
      'danger',
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
    setSearchResetKey((current) => current + 1)
    setMenuId(null)
  }

  function toggleStatus(student: StudentListItem) {
    const status: EntityStatus =
      student.administrativeStatus === 'active' ? 'inactive' : 'active'
    setActionError('')
    updateMutation.mutate(
      { id: student.id, input: { status } },
      {
        onSuccess: (updated) => {
          setNotice(
            updated.billingBlocked && status === 'active'
              ? `${student.name} masih nonaktif karena tunggakan SPP.`
              : `${student.name} berhasil ${status === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`,
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

      <SummaryCardGrid
        label="Ringkasan siswa"
        isLoading={summaryQuery.isPending}
      >
        {summary.map(([label, value, icon, tone]) => (
          <SummaryCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            tone={tone}
          />
        ))}
      </SummaryCardGrid>

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
            <DebouncedSearchInput
              key={searchResetKey}
              id="student-search"
              name="search"
              value={filters.search}
              onSearch={(search) =>
                setFilters((current) => ({
                  ...current,
                  page: 1,
                  search: search || undefined,
                }))
              }
              placeholder="Cari nama siswa, sekolah, atau orang tua"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Label htmlFor="student-status" className="sr-only">
                Filter status siswa
              </Label>
              <Select
                id="student-status"
                value={filters.status ?? ''}
                className="h-10 min-w-28 text-[13px] font-semibold"
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
            </div>
            <div className="relative">
              <Label htmlFor="student-stage" className="sr-only">
                Filter jenjang siswa
              </Label>
              <Select
                id="student-stage"
                value={filters.educationStage ?? ''}
                className="h-10 min-w-28 text-[13px] font-semibold"
                onChange={(event) => setEducationStage(event.target.value)}
              >
                <option value="">Jenjang</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </Select>
            </div>
          </div>
        </form>

        {studentsQuery.isError ? (
          <StudentsErrorState onRetry={() => void studentsQuery.refetch()} />
        ) : null}
        {studentsQuery.isPending || studentsQuery.data ? (
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
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={studentsQuery.isPending}
                >
                  {studentsQuery.isPending ? (
                    <TableSkeletonRows
                      columns={8}
                      rows={pageSize}
                      label="Memuat daftar siswa..."
                    />
                  ) : null}
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
            {studentsQuery.data && data.length === 0 ? (
              <StudentsEmptyState onReset={resetFilters} />
            ) : null}
            {meta && data.length > 0 ? (
              <TablePagination
                meta={meta}
                itemLabel="siswa"
                ariaLabel="Halaman siswa"
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

function getFormValue(data: FormData, key: string) {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError && error.status === 403)
    return 'Anda tidak memiliki izin untuk mengubah data siswa.'
  return 'Data siswa belum dapat diperbarui. Silakan coba lagi.'
}

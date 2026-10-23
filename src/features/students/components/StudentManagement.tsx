import { useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Upload,
  UserRoundX,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  demoStudents,
  getStudentStage,
  getStudentStatus,
  type Student,
  type StudentInput,
} from '../data/students'
import { StudentDialog } from './StudentDialog'
import { StudentForm, studentSelectClass } from './StudentForm'
import { StudentImport } from './StudentImport'

type DialogState =
  | { type: 'create' }
  | { type: 'import' }
  | { type: 'edit'; student: Student }
  | { type: 'detail'; student: Student }
  | null
const pageSize = 5
const cellClass = 'border-b border-[var(--color-neutral-100)] px-3 py-4'

export function StudentManagement() {
  const [students, setStudents] = useState(demoStudents)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [stage, setStage] = useState('')
  const [group, setGroup] = useState('')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!menuId) return
    menuRef.current?.querySelector('button')?.focus()
    function dismiss(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target) &&
        !menuTriggerRef.current?.contains(event.target)
      )
        setMenuId(null)
    }
    function escape(event: KeyboardEvent) {
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

  const groups = [
    ...new Set(students.map((student) => student.group).filter(Boolean)),
  ]
  const filtered = students.filter((student) => {
    const matchesSearch = [student.name, student.school, student.parent].some(
      (value) =>
        value
          .toLocaleLowerCase('id-ID')
          .includes(search.trim().toLocaleLowerCase('id-ID')),
    )
    return (
      matchesSearch &&
      (!status ||
        (status === 'active'
          ? student.active
          : getStudentStatus(student) === status)) &&
      (!stage || getStudentStage(student.level) === stage) &&
      (!group || (group === 'none' ? !student.group : student.group === group))
    )
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const summary = [
    {
      label: 'Siswa Aktif',
      value: students.filter((student) => student.active).length,
      icon: Users,
      tone: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    },
    {
      label: 'Nonaktif',
      value: students.filter((student) => !student.active).length,
      icon: UserRoundX,
      tone: 'bg-muted text-muted-foreground',
    },
    {
      label: 'Email Orang Tua Kosong',
      value: students.filter((student) => !student.email).length,
      icon: Mail,
      tone: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    },
    {
      label: 'Belum Masuk Kelompok',
      value: students.filter((student) => student.active && !student.group)
        .length,
      icon: BookOpen,
      tone: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    },
  ]

  function save(input: StudentInput) {
    if (dialog?.type === 'edit') {
      setStudents((current) =>
        current.map((student) =>
          student.id === dialog.student.id ? { ...student, ...input } : student,
        ),
      )
      setNotice(`Data ${input.name} berhasil diperbarui.`)
    } else {
      setStudents((current) => [
        { ...input, id: crypto.randomUUID() },
        ...current,
      ])
      resetFilters()
      setNotice(`${input.name} berhasil ditambahkan.`)
    }
    setDialog(null)
  }
  function resetFilters() {
    setSearch('')
    setStatus('')
    setStage('')
    setGroup('')
    setPage(1)
    setMenuId(null)
  }
  function openStudent(type: 'detail' | 'edit', student: Student) {
    menuTriggerRef.current?.focus()
    setMenuId(null)
    setDialog({ type, student })
  }

  return (
    <div className="min-w-0" aria-labelledby="students-title">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            id="students-title"
            className="text-[26px] font-bold leading-tight"
          >
            Data Siswa
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Kelola siswa aktif, kontak orang tua, dan status belajar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-card text-[13px] font-semibold"
            onClick={() => setDialog({ type: 'import' })}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </Button>
          <Button
            className="text-[13px] font-semibold"
            onClick={() => setDialog({ type: 'create' })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Siswa
          </Button>
        </div>
      </header>
      <section
        aria-label="Ringkasan siswa"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summary.map(({ label, value, icon: Icon, tone }) => (
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
              {value}
            </p>
          </Card>
        ))}
      </section>
      <p role="status" className="sr-only">
        {notice}
      </p>
      {notice ? (
        <p className="mt-4 rounded-md bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">
          {notice}
        </p>
      ) : null}
      <Card className="mt-5 min-h-[560px] p-4 shadow-none sm:p-[18px]">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative min-w-0 flex-1">
            <Label htmlFor="student-search" className="sr-only">
              Cari siswa
            </Label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="student-search"
              placeholder="Cari nama siswa, sekolah, atau orang tua"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
                setMenuId(null)
              }}
              className="bg-[var(--color-gray-50)] pl-10 text-[13px]"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <Label htmlFor="student-status-filter" className="sr-only">
                Filter status
              </Label>
              <select
                id="student-status-filter"
                value={status}
                className={studentSelectClass}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                  setMenuId(null)
                }}
              >
                <option value="">Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="incomplete">Perlu Data</option>
              </select>
            </div>
            <div>
              <Label htmlFor="student-stage-filter" className="sr-only">
                Filter jenjang
              </Label>
              <select
                id="student-stage-filter"
                value={stage}
                className={studentSelectClass}
                onChange={(event) => {
                  setStage(event.target.value)
                  setPage(1)
                  setMenuId(null)
                }}
              >
                <option value="">Jenjang</option>
                {['SD', 'SMP', 'SMA'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="student-group-filter" className="sr-only">
                Filter kelompok
              </Label>
              <select
                id="student-group-filter"
                value={group}
                className={studentSelectClass}
                onChange={(event) => {
                  setGroup(event.target.value)
                  setPage(1)
                  setMenuId(null)
                }}
              >
                <option value="">Kelompok</option>
                <option value="none">Belum masuk</option>
                {groups.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div
          className="mt-3.5 overflow-x-auto rounded-md focus-visible:ring-2 focus-visible:ring-ring"
          role="region"
          aria-label="Tabel siswa, geser untuk melihat semua kolom"
          tabIndex={0}
        >
          <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left text-xs leading-[1.4]">
            <caption className="sr-only">Daftar siswa bimbel</caption>
            <thead>
              <tr className="h-11 bg-[var(--color-gray-50)] text-muted-foreground">
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
                    className="px-3 font-bold first:rounded-l-md last:rounded-r-md"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((student) => (
                <tr key={student.id} className="h-[82px]">
                  <th
                    scope="row"
                    className={`${cellClass} min-w-[135px] text-[13px] font-bold`}
                  >
                    {student.name}
                  </th>
                  <td className={`${cellClass} min-w-[135px]`}>
                    Kelas {student.level} / {student.school}
                  </td>
                  <td className={`${cellClass} min-w-[100px]`}>
                    {student.parent}
                  </td>
                  <td className={`${cellClass} min-w-[160px] break-words`}>
                    {student.phone || '-'}
                    {student.email ? (
                      <>
                        <br />
                        {student.email}
                      </>
                    ) : null}
                  </td>
                  <td className={`${cellClass} min-w-[155px] max-w-[200px]`}>
                    {student.address || '-'}
                  </td>
                  <td className={`${cellClass} min-w-[100px] font-semibold`}>
                    {student.active ? student.group || '-' : 'Nonaktif'}
                  </td>
                  <td className={cellClass}>
                    <StudentStatusBadge student={student} />
                  </td>
                  <td className={`${cellClass} relative`}>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        aria-label={`Edit ${student.name}`}
                        onClick={() => setDialog({ type: 'edit', student })}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        aria-label={`Menu aksi ${student.name}`}
                        aria-expanded={menuId === student.id}
                        aria-controls={
                          menuId === student.id ? 'student-actions' : undefined
                        }
                        onClick={(event) => {
                          menuTriggerRef.current = event.currentTarget
                          setMenuId(menuId === student.id ? null : student.id)
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
                        id="student-actions"
                        ref={menuRef}
                        className="absolute right-2 top-14 z-10 w-[190px] space-y-1 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-md)]"
                        onBlur={(event) => {
                          if (
                            !event.currentTarget.contains(event.relatedTarget)
                          )
                            setMenuId(null)
                        }}
                      >
                        <Button
                          variant="outline"
                          className="h-8 w-full text-xs"
                          onClick={() => openStudent('detail', student)}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          Lihat detail
                        </Button>
                        <Button
                          className="h-8 w-full text-xs"
                          onClick={() => openStudent('edit', student)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Ubah data
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 w-full border-[var(--color-danger-border)] text-xs text-destructive"
                          onClick={() => {
                            setStudents((current) =>
                              current.map((item) =>
                                item.id === student.id
                                  ? { ...item, active: !item.active }
                                  : item,
                              ),
                            )
                            setNotice(
                              `${student.name} berhasil ${student.active ? 'dinonaktifkan' : 'diaktifkan'}.`,
                            )
                            setMenuId(null)
                            menuTriggerRef.current?.focus()
                          }}
                        >
                          <UserRoundX className="h-4 w-4" aria-hidden="true" />
                          {student.active
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
          {menuId ? <div className="h-28" aria-hidden="true" /> : null}
        </div>
        {!filtered.length ? (
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
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Reset filter
              </Button>
            </div>
          </div>
        ) : (
          <footer className="flex flex-wrap items-center justify-between gap-3 px-3 py-4 text-xs text-muted-foreground">
            <span>
              Menampilkan {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filtered.length)} dari{' '}
              {filtered.length} siswa
            </span>
            <nav
              aria-label="Halaman siswa"
              className="flex items-center gap-1.5"
            >
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Halaman sebelumnya"
                disabled={currentPage === 1}
                onClick={() => {
                  setPage(currentPage - 1)
                  setMenuId(null)
                }}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              {Array.from(
                { length: Math.min(3, totalPages) },
                (_, index) =>
                  Math.min(
                    Math.max(currentPage - 1, 1),
                    Math.max(1, totalPages - 2),
                  ) + index,
              ).map((number) => (
                <Button
                  key={number}
                  variant={number === currentPage ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Halaman ${number}`}
                  aria-current={number === currentPage ? 'page' : undefined}
                  onClick={() => {
                    setPage(number)
                    setMenuId(null)
                  }}
                >
                  {number}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Halaman berikutnya"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setPage(currentPage + 1)
                  setMenuId(null)
                }}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </nav>
          </footer>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Mode demo · Perubahan data akan direset saat meninggalkan atau memuat
        ulang halaman.
      </p>
      {dialog ? (
        <StudentDialog
          title={
            dialog.type === 'create'
              ? 'Tambah Siswa'
              : dialog.type === 'edit'
                ? 'Ubah Data Siswa'
                : dialog.type === 'import'
                  ? 'Import Siswa'
                  : 'Detail Siswa'
          }
          onDismiss={() => setDialog(null)}
        >
          {dialog.type === 'create' || dialog.type === 'edit' ? (
            <StudentForm
              student={dialog.type === 'edit' ? dialog.student : undefined}
              onSave={save}
              onCancel={() => setDialog(null)}
            />
          ) : dialog.type === 'import' ? (
            <StudentImport
              onImport={(inputs) => {
                setStudents((current) => [
                  ...inputs.map((input) => ({
                    ...input,
                    id: crypto.randomUUID(),
                  })),
                  ...current,
                ])
                resetFilters()
                setNotice(`${inputs.length} siswa berhasil diimpor.`)
                setDialog(null)
              }}
            />
          ) : (
            <>
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Nama siswa', dialog.student.name],
                  [
                    'Jenjang / Sekolah',
                    `Kelas ${dialog.student.level} / ${dialog.student.school}`,
                  ],
                  ['Orang tua', dialog.student.parent],
                  ['Telepon', dialog.student.phone],
                  ['Email', dialog.student.email],
                  ['Alamat', dialog.student.address],
                  ['Kelompok', dialog.student.group],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium">
                      {value || '-'}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="mb-1 text-xs text-muted-foreground">Status</dt>
                  <dd>
                    <StudentStatusBadge student={dialog.student} />
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    setDialog({ type: 'edit', student: dialog.student })
                  }
                >
                  Ubah data
                </Button>
              </div>
            </>
          )}
        </StudentDialog>
      ) : null}
    </div>
  )
}

function StudentStatusBadge({ student }: { student: Student }) {
  const status = getStudentStatus(student)
  const tone =
    status === 'active'
      ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
      : status === 'incomplete'
        ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
        : 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded px-2 py-1 text-[11px] font-bold ${tone}`}
    >
      {status === 'active'
        ? 'Aktif'
        : status === 'inactive'
          ? 'Nonaktif'
          : 'Perlu Data'}
    </span>
  )
}

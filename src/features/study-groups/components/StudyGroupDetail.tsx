import { CirclePlay, PauseCircle, Pencil, Search } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getConfigurations } from '@/features/study-groups/api/study-groups-api'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  useStudyGroup,
  useUpdateStudyGroupStatus,
  useStudyGroupStudents,
} from '@/features/study-groups/hooks/use-study-groups'
import { ApiError } from '@/services/api-client'

import './study-group-detail.css'

const dayNames = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

export function StudyGroupDetail({ id }: { id: string }) {
  const [studentSearch, setStudentSearch] = useState('')
  const detail = useStudyGroup(id)
  const history = useQuery({
    queryKey: ['configurations', id],
    queryFn: ({ signal }) => getConfigurations(id, signal),
  })
  const status = useUpdateStudyGroupStatus()
  const students = useStudyGroupStudents(id)
  const group = detail.data

  if (detail.isPending) {
    return <StudyGroupDetailSkeleton />
  }

  if (!group) {
    const code = detail.error instanceof ApiError ? detail.error.status : 0
    const message =
      code === 404
        ? 'Kelompok belajar tidak ditemukan.'
        : code === 401 || code === 403
          ? 'Anda tidak memiliki akses ke kelompok belajar ini.'
          : 'Detail kelompok belajar belum dapat dimuat.'

    return (
      <section
        role="alert"
        className="rounded-lg border border-border bg-card p-6"
      >
        <h1 className="text-lg font-bold">{message}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/study-groups">Kembali ke Kelompok Belajar</Link>
          </Button>
          {code !== 404 && code !== 401 && code !== 403 ? (
            <Button
              type="button"
              disabled={detail.isFetching}
              onClick={() => void detail.refetch()}
            >
              Coba lagi
            </Button>
          ) : null}
        </div>
      </section>
    )
  }

  const memberSet = new Set(group.studentIds)
  const members =
    students.data?.data.filter((student) => memberSet.has(student.id)) ?? []
  const normalizedSearch = studentSearch.trim().toLocaleLowerCase('id-ID')
  const visibleMembers = normalizedSearch
    ? members.filter((student) =>
        [student.name, student.school, student.educationLevel].some((value) =>
          value.toLocaleLowerCase('id-ID').includes(normalizedSearch),
        ),
      )
    : members

  return (
    <div className="study-group-detail min-w-0 space-y-5 text-[var(--color-text)]">
      <section
        className="rounded-lg border bg-card p-5"
        aria-labelledby="configuration-history"
      >
        <h2 id="configuration-history" className="font-bold">
          Riwayat Konfigurasi Kelompok
        </h2>
        {history.isPending ? <p role="status">Memuat riwayat...</p> : null}
        {history.isError ? (
          <p role="alert">Riwayat belum dapat dimuat.</p>
        ) : null}
        <ol className="mt-3 space-y-2">
          {history.data?.map((c) => (
            <li key={c.id} className="border-l-2 border-primary pl-3 text-sm">
              {c.effectiveFrom} – {c.effectiveUntil}
              {c.supersededAt ? ' (Digantikan revisi berikutnya)' : ''} ·{' '}
              {c.schedules.length} pola mingguan · {c.studentIds.length} siswa
            </li>
          ))}
        </ol>
      </section>
      <header className="study-group-detail__header">
        <div className="study-group-detail__header-copy">
          <h1 className="mt-[3px] break-words text-2xl font-bold leading-[1.35]">
            {group.name}
          </h1>
        </div>

        <div className="study-group-detail__actions">
          <Button
            asChild
            variant="outline"
            className="bg-white text-[13px] font-semibold"
          >
            <Link to={`/study-groups/${group.id}/edit`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--color-danger-border)] bg-white text-[13px] font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
            disabled={status.isPending}
            onClick={() => {
              if (window.confirm(`Ubah status ${group.name}?`)) {
                status.mutate({
                  id: group.id,
                  status: group.status === 'active' ? 'inactive' : 'active',
                })
              }
            }}
          >
            {group.status === 'active' ? (
              <PauseCircle className="h-4 w-4" aria-hidden="true" />
            ) : (
              <CirclePlay className="h-4 w-4" aria-hidden="true" />
            )}
            {status.isPending
              ? 'Menyimpan...'
              : group.status === 'active'
                ? 'Nonaktifkan'
                : 'Aktifkan'}
          </Button>
        </div>
      </header>

      {status.isError ? (
        <p
          role="alert"
          className="rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]"
        >
          Status kelompok belum dapat diubah. Silakan coba lagi.
        </p>
      ) : null}

      <div className="study-group-detail__body">
        <section className="study-group-detail__schedule-panel min-w-0 rounded-lg border border-border bg-card px-5 py-[18px]">
          <h2 className="text-base font-bold leading-[1.35]">
            Jadwal &amp; Tentor
          </h2>
          <p className="mt-1 text-xs font-medium leading-[1.35] text-[var(--color-muted)]">
            {scheduleSummary(group.schedules.length)}
          </p>

          {group.schedules.length > 0 ? (
            <div className="mt-3 space-y-3">
              {group.schedules.map((schedule, index) => (
                <article
                  className="rounded-lg border border-border bg-[var(--color-gray-50)] p-3"
                  key={schedule.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13px] font-bold leading-[1.35]">
                        Jadwal {index + 1}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold leading-[1.35] text-[var(--color-muted)]">
                        {dayNames[schedule.dayOfWeek - 1]
                          ? `${dayNames[schedule.dayOfWeek - 1]} · Setiap minggu`
                          : 'Hari belum ditentukan'}
                      </p>
                    </div>
                    {index > 0 ? (
                      <span className="inline-flex shrink-0 rounded-full border border-border bg-white px-2 py-1 text-[11px] font-bold leading-[1.35] text-[var(--color-muted)]">
                        Terjadwal
                      </span>
                    ) : null}
                  </div>

                  <dl className="mt-2.5 space-y-2.5">
                    <ScheduleItem label="Tentor" value={schedule.tutorName} />
                    <ScheduleItem
                      label="Ruangan"
                      value={formatRoom(schedule.roomName, schedule.roomCode)}
                    />
                    <ScheduleItem
                      label="Jam"
                      value={`${schedule.startTime} - ${schedule.endTime}`}
                    />
                  </dl>
                  <p className="mt-2.5 text-xs font-medium leading-[1.35] text-[var(--color-muted)]">
                    Presensi: -
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-border bg-[var(--color-gray-50)] p-4 text-sm text-[var(--color-muted)]">
              Jadwal belum ditentukan.
            </p>
          )}
        </section>

        <section className="study-group-detail__students-panel min-w-0 overflow-hidden rounded-lg border border-border bg-card">
          <div className="study-group-detail__students-header border-b border-border px-5 py-4">
            <h2 className="text-base font-bold leading-[1.3]">
              Daftar Siswa ({group.studentCount})
            </h2>
            <label className="study-group-detail__search">
              <span className="sr-only">Cari siswa dalam kelompok</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                type="search"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Cari siswa..."
                className="h-[34px] w-full rounded-md border border-border bg-white pl-8 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-gray-400)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </label>
          </div>

          {students.isPending ? (
            <StudentListSkeleton />
          ) : students.isError ? (
            <div className="p-6 text-sm" role="alert">
              <p className="text-[var(--color-danger)]">
                Daftar siswa belum dapat dimuat.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                disabled={students.isFetching}
                onClick={() => void students.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : visibleMembers.length > 0 ? (
            <ol aria-label="Daftar siswa dalam kelompok">
              {visibleMembers.map((student, index) => (
                <li
                  className="flex min-w-0 items-center border-b border-border px-3.5 py-2.5 last:border-b-0 odd:bg-white even:bg-[var(--color-bg-light)]"
                  key={student.id}
                >
                  <span className="w-[30px] shrink-0 text-xs font-medium text-[var(--color-muted)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[13px] font-semibold leading-[1.3]">
                      {student.name}
                    </p>
                    <p className="mt-0.5 break-words text-xs leading-[1.3] text-[var(--color-muted)]">
                      {student.school || 'Sekolah belum diisi'}{' '}
                      <span aria-hidden="true">·</span>{' '}
                      {student.educationLevel || 'Jenjang belum diisi'}
                    </p>
                  </div>
                  <span
                    className={
                      student.status === 'active'
                        ? 'inline-flex shrink-0 rounded-[5px] bg-[var(--color-success-bg)] px-2 py-[5px] text-[11px] font-bold leading-[1.3] text-[var(--color-success-text)]'
                        : 'inline-flex shrink-0 rounded-[5px] bg-[var(--color-gray-50)] px-2 py-[5px] text-[11px] font-bold leading-[1.3] text-[var(--color-muted)]'
                    }
                  >
                    {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="p-6 text-sm text-[var(--color-muted)]">
              {normalizedSearch
                ? 'Tidak ada siswa yang cocok dengan pencarian.'
                : 'Belum ada siswa peserta.'}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

function ScheduleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs font-semibold leading-[1.35] text-[var(--color-muted)]">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-xs font-bold leading-[1.35]">
        {value}
      </dd>
    </div>
  )
}

function StudyGroupDetailSkeleton() {
  return (
    <div
      className="min-w-0 space-y-5"
      role="status"
      aria-label="Memuat detail kelompok belajar"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-52 animate-pulse rounded bg-muted" />
          <div className="h-8 w-72 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="hidden gap-2.5 sm:flex">
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="grid gap-[18px] xl:grid-cols-[minmax(320px,440px)_minmax(0,1fr)]">
        <div className="h-[440px] animate-pulse rounded-lg border border-border bg-card" />
        <div className="h-[520px] animate-pulse rounded-lg border border-border bg-card" />
      </div>
    </div>
  )
}

function StudentListSkeleton() {
  return (
    <div aria-label="Memuat daftar siswa" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="flex items-center gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0"
          key={index}
        >
          <div className="h-3 w-[30px] animate-pulse rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 max-w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function scheduleSummary(scheduleCount: number) {
  if (scheduleCount === 0) return 'Kelompok belajar ini belum memiliki jadwal.'
  if (scheduleCount === 1) return 'Kelompok belajar ini memiliki satu jadwal.'
  return 'Kelompok belajar ini memiliki lebih dari satu jadwal.'
}

function formatRoom(roomName: string | null, roomCode: string | null) {
  if (!roomName && !roomCode) return 'Belum ditentukan'
  return roomCode ?? roomName ?? 'Belum ditentukan'
}

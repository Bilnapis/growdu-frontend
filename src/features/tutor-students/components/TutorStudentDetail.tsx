import { ArrowLeft, UsersRound } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ApiError } from '@/services/api-client'
import { useTutorStudent } from '../api/tutor-students-api'
import { tutorStudentsPath } from '../paths'

export function TutorStudentDetail({ studentId }: { studentId: string }) {
  const { search } = useLocation()
  const query = useTutorStudent(studentId)
  const student = query.data
  const notFound =
    !studentId ||
    (query.error instanceof ApiError && query.error.status === 404)
  const forbidden =
    query.error instanceof ApiError && query.error.status === 403
  const initials =
    student?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase('id-ID') || '?'

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="flex h-[52px] items-center gap-2.5 border-b bg-card px-4">
          <Link
            to={`${tutorStudentsPath}${search}`}
            aria-label="Kembali ke daftar siswa"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="flex-1 text-center text-base font-bold">
            Detail Siswa
          </h1>
        </header>

        <div
          className="grid gap-3 px-4 py-3.5"
          aria-busy={query.isPending && Boolean(studentId)}
        >
          {notFound || query.isError ? (
            <section
              className="rounded-lg border bg-card p-5 text-center"
              role="alert"
            >
              <h2 className="text-sm font-bold">
                {notFound
                  ? 'Siswa tidak ditemukan'
                  : forbidden
                    ? 'Akses siswa tidak tersedia'
                    : 'Detail siswa tidak dapat dimuat'}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {notFound
                  ? 'Siswa tidak tersedia dalam kelompok belajar yang Anda ajar.'
                  : forbidden
                    ? 'Akun Anda tidak memiliki akses ke detail ini.'
                    : 'Periksa koneksi Anda, lalu coba lagi.'}
              </p>
              {!notFound && !forbidden ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => void query.refetch()}
                >
                  Coba lagi
                </Button>
              ) : null}
            </section>
          ) : query.isPending ? (
            <div role="status" className="grid gap-3">
              <span className="sr-only">Memuat detail siswa</span>
              <div className="h-[236px] rounded-lg border bg-card motion-safe:animate-pulse" />
              <div className="h-[98px] rounded-lg border bg-card motion-safe:animate-pulse" />
            </div>
          ) : student ? (
            <>
              <section
                aria-labelledby="tutor-student-information"
                className="grid gap-3"
              >
                <h2
                  id="tutor-student-information"
                  className="text-[13px] font-bold"
                >
                  Informasi Siswa
                </h2>
                <div className="grid gap-3 rounded-[10px] border bg-card p-3.5">
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[17px] font-bold text-primary"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    <h3 className="max-w-full break-words text-center text-[15px] font-bold">
                      {student.name}
                    </h3>
                  </div>
                  <dl className="grid gap-3 text-[11px]">
                    <StudentInformation
                      label="Sekolah"
                      value={student.school || 'Belum dicantumkan'}
                    />
                    <StudentInformation
                      label="Kelas"
                      value={student.educationLevel || 'Belum dicantumkan'}
                    />
                    <StudentInformation
                      label="Jenis Kelamin"
                      value={
                        student.gender === 'male' ? 'Laki-laki' : 'Perempuan'
                      }
                    />
                  </dl>
                </div>
              </section>

              <section
                aria-labelledby="tutor-student-groups"
                className="grid gap-3"
              >
                <h2 id="tutor-student-groups" className="text-[13px] font-bold">
                  Kelompok Belajar
                </h2>
                {student.studyGroups.length ? (
                  <ul className="grid gap-2.5 rounded-lg border bg-card p-3">
                    {student.studyGroups.map((group) => (
                      <li
                        key={group.id}
                        className="flex min-w-0 items-center gap-2.5 text-xs"
                      >
                        <UsersRound
                          className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 break-words">
                          {group.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
                    Belum ada kelompok belajar.
                  </p>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}

function StudentInformation({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold">{value}</dd>
    </div>
  )
}

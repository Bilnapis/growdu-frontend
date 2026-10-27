import { UsersRound } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { tutorStudentPath } from '../paths'

import { type TutorStudent } from '../api/tutor-students-api'

export function TutorStudentCard({ student }: { student: TutorStudent }) {
  const { search } = useLocation()

  return (
    <article className="grid min-w-0 gap-3 rounded-lg border bg-card p-3">
      <header className="grid gap-1 border-b pb-3">
        <h2 className="break-words text-sm font-bold">{student.name}</h2>
        <p className="break-words text-[11px] text-muted-foreground">
          {student.school || 'Sekolah belum dicantumkan'}
        </p>
      </header>

      <div className="flex items-center gap-2.5">
        <UsersRound
          className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground">Kelompok Belajar</p>
          <p className="mt-0.5 break-words text-[13px] font-bold">
            {student.studyGroups.map((group) => group.name).join(', ')}
          </p>
        </div>
      </div>

      <Link
        to={`${tutorStudentPath(student.id)}${search}`}
        className="flex h-[38px] items-center justify-center rounded-md border bg-card text-[13px] font-semibold text-primary-text hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Lihat siswa ${student.name}`}
      >
        Lihat Siswa
      </Link>
    </article>
  )
}

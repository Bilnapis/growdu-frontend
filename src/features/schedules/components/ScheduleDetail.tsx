import { type FormEvent, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CalendarClock,
  Check,
  CheckCheck,
  MessageCircle,
  Pencil,
  RefreshCw,
  Repeat2,
  Search,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type { ScheduleListItem } from '@/features/schedules/api/schedules-api'
import { useSchedule } from '@/features/schedules/hooks/use-schedules'
import type { Tutor } from '@/features/tutors/api/tutors-api'
import { useTutors } from '@/features/tutors/hooks/use-tutors'
import { cn } from '@/lib/utils'

const dayNames = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const

type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha'

type AttendanceStudent = {
  id: number
  name: string
  school: string
  note: string
  status: AttendanceStatus
}

const initialStudents: AttendanceStudent[] = [
  {
    id: 1,
    name: 'Nadia Putri',
    school: 'SMA Harapan Bangsa',
    note: '',
    status: 'Hadir',
  },
  {
    id: 2,
    name: 'Raka Pratama',
    school: 'SMP Negeri 1',
    note: '',
    status: 'Hadir',
  },
  {
    id: 3,
    name: 'Alya Safira',
    school: 'SMA Negeri 3',
    note: '',
    status: 'Hadir',
  },
  {
    id: 4,
    name: 'Dito Mahendra',
    school: 'SMP Negeri 1',
    note: 'Acara keluarga ke luar kota — izin via WA orang tua.',
    status: 'Izin',
  },
  {
    id: 5,
    name: 'Mira Santoso',
    school: 'SMA Negeri 3',
    note: '',
    status: 'Hadir',
  },
  {
    id: 6,
    name: 'Rizky Adi',
    school: 'SMP Negeri 1',
    note: 'Demam, orang tua mengirim surat dokter.',
    status: 'Sakit',
  },
  {
    id: 7,
    name: 'Salsabila Nur',
    school: 'SMA Harapan Bangsa',
    note: '',
    status: 'Hadir',
  },
  {
    id: 8,
    name: 'Fajar Ramadhan',
    school: 'SMP Negeri 1',
    note: 'Tidak hadir tanpa keterangan sampai sesi dimulai.',
    status: 'Alpha',
  },
]

export function ScheduleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const scheduleQuery = useSchedule(id)
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState(
    'Persamaan Linier Dua Variabel (SPLDV) - Bagian 2 (Metode Eliminasi & Substitusi)',
  )
  const [sessionNote, setSessionNote] = useState(
    'Seluruh siswa telah menyelesaikan 8 soal latihan mandiri dengan skor rata-rata 85. PR halaman 48 dikumpulkan pada sesi Senin depan.',
  )
  const [selectedStudent, setSelectedStudent] =
    useState<AttendanceStudent | null>(null)
  const [isTutorDialogOpen, setIsTutorDialogOpen] = useState(false)
  const [dummyTutor, setDummyTutor] = useState<{
    id: string
    name: string
  } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (scheduleQuery.isPending) {
    return <ScheduleDetailSkeleton />
  }

  if (scheduleQuery.isError) {
    return (
      <ScheduleDetailMessage
        title="Detail jadwal tidak dapat dimuat"
        description="Terjadi kendala saat mengambil data jadwal. Silakan coba lagi."
        actionLabel="Coba lagi"
        onAction={() => void scheduleQuery.refetch()}
      />
    )
  }

  if (!scheduleQuery.data) {
    return (
      <ScheduleDetailMessage
        title="Jadwal tidak ditemukan"
        description="Sesi yang Anda cari tidak tersedia atau telah dihapus."
        actionLabel="Kembali ke jadwal"
        onAction={() => void navigate('/schedule')}
      />
    )
  }

  const schedule = scheduleQuery.data
  const tutorName = dummyTutor?.name ?? schedule.tutorName
  const tutorId = dummyTutor?.id ?? schedule.tutorId
  const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
  const visibleStudents = normalizedSearch
    ? students.filter((student) =>
        `${student.name} ${student.school}`
          .toLocaleLowerCase('id-ID')
          .includes(normalizedSearch),
      )
    : students
  const attendanceSummary = getAttendanceSummary(students)

  function handleMaterialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('Materi dan catatan tersimpan untuk demo ini.')
  }

  function markAllPresent() {
    setStudents((current) =>
      current.map((student) => ({ ...student, status: 'Hadir', note: '' })),
    )
    setNotice('Semua siswa ditandai hadir untuk demo ini.')
  }

  function saveAttendance(nextStudent: AttendanceStudent) {
    setStudents((current) =>
      current.map((student) =>
        student.id === nextStudent.id ? nextStudent : student,
      ),
    )
    setSelectedStudent(null)
    setNotice(`Presensi ${nextStudent.name} diperbarui untuk demo ini.`)
  }

  function saveTutor(nextTutor: Tutor, reason: string) {
    setDummyTutor({ id: nextTutor.id, name: nextTutor.name })
    setIsTutorDialogOpen(false)
    setNotice(
      `Tentor diganti menjadi ${nextTutor.name} untuk demo ini.${reason ? ` Alasan: ${reason}` : ''}`,
    )
  }

  return (
    <div className="min-w-0" aria-labelledby="schedule-detail-title">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            <Link
              to="/schedule"
              className="hover:text-foreground hover:underline"
            >
              Jadwal Belajar
            </Link>{' '}
            / Detail Sesi #{shortId(schedule.id)}
          </p>
          <h1
            id="schedule-detail-title"
            className="mt-1 truncate text-2xl font-bold leading-[1.3] text-foreground"
          >
            {schedule.studyGroupName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void navigate(-1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
            onClick={() =>
              setNotice('Pembatalan sesi hanya simulasi pada demo ini.')
            }
          >
            <Ban className="h-4 w-4" aria-hidden="true" />
            Batalkan Sesi
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setNotice('Reschedule hanya simulasi pada demo ini.')
            }
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Reschedule
          </Button>
        </div>
      </header>

      {notice ? (
        <div
          className="mt-4 flex items-center justify-between gap-3 rounded-md border border-[var(--color-info-border)] bg-[var(--color-info-bg)] px-4 py-3 text-[13px] font-semibold text-[var(--color-info-text)]"
          role="status"
        >
          <span>{notice}</span>
          <button
            type="button"
            className="rounded p-1 hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup pemberitahuan"
            onClick={() => setNotice(null)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="mt-[18px] grid min-w-0 gap-[18px] xl:grid-cols-[minmax(0,780px)_minmax(280px,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <SessionInformation schedule={schedule} tutorName={tutorName} />

          <form
            className="rounded-lg border border-border bg-card p-[18px]"
            onSubmit={handleMaterialSubmit}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">
                Materi &amp; Catatan Sesi Pertemuan
              </h2>
              <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Demo
              </span>
            </div>
            <label
              className="mt-3 block text-xs font-bold"
              htmlFor="session-topic"
            >
              Topik <span aria-hidden="true">*</span>
            </label>
            <input
              id="session-topic"
              className="mt-[7px] min-h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-xs leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
            <label
              className="mt-3 block text-xs font-bold"
              htmlFor="session-note"
            >
              Catatan Tentor
            </label>
            <textarea
              id="session-note"
              className="mt-[7px] min-h-[84px] w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-xs leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={sessionNote}
              onChange={(event) => setSessionNote(event.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button type="submit" size="sm">
                <Check className="h-4 w-4" aria-hidden="true" />
                Simpan Catatan
              </Button>
            </div>
          </form>

          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Data Presensi Siswa</h2>
                <span className="rounded-md bg-[var(--color-primary-soft)] px-2 py-1 text-[11px] font-bold text-primary">
                  {students.length} Siswa
                </span>
              </div>
              <Button
                size="sm"
                className="h-8 text-[13px]"
                onClick={markAllPresent}
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Tandai Semua Hadir
              </Button>
            </div>

            <div className="border-b border-border px-5 py-3">
              <label className="relative block" htmlFor="attendance-search">
                <span className="sr-only">Cari nama siswa atau sekolah</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="attendance-search"
                  type="search"
                  className="h-10 w-full rounded-md border border-input bg-[var(--color-gray-50)] pl-10 pr-3 text-[13px] font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Cari nama siswa atau sekolah..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>

            <div className="overflow-x-auto px-5 pb-3">
              <table className="w-full min-w-[700px] table-fixed text-left text-xs">
                <caption className="sr-only">
                  Data presensi siswa pada sesi ini
                </caption>
                <thead className="bg-[var(--color-gray-50)] text-[11px] font-semibold text-muted-foreground">
                  <tr>
                    <th className="w-12 px-4 py-2.5" scope="col">
                      No
                    </th>
                    <th className="w-[22%] px-3 py-2.5" scope="col">
                      Siswa
                    </th>
                    <th className="w-[21%] px-3 py-2.5" scope="col">
                      Sekolah
                    </th>
                    <th className="px-3 py-2.5" scope="col">
                      Keterangan
                    </th>
                    <th className="w-24 px-3 py-2.5" scope="col">
                      Presensi
                    </th>
                    <th className="w-20 px-3 py-2.5 text-right" scope="col">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((student, index) => (
                    <AttendanceRow
                      key={student.id}
                      index={index + 1}
                      student={student}
                      onEdit={setSelectedStudent}
                    />
                  ))}
                </tbody>
              </table>
              {visibleStudents.length === 0 ? (
                <p className="py-10 text-center text-[13px] text-muted-foreground">
                  Tidak ada siswa yang cocok dengan pencarian.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <AttendanceSummary summary={attendanceSummary} />
          <TutorCard
            tutorName={tutorName}
            onChangeTutor={() => setIsTutorDialogOpen(true)}
          />
        </aside>
      </div>

      {selectedStudent ? (
        <AttendanceDialog
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSave={saveAttendance}
        />
      ) : null}

      {isTutorDialogOpen ? (
        <TutorDialog
          currentTutorId={tutorId}
          currentTutor={tutorName}
          subject={schedule.subject ?? 'mata pelajaran ini'}
          onClose={() => setIsTutorDialogOpen(false)}
          onSave={saveTutor}
        />
      ) : null}
    </div>
  )
}

function SessionInformation({
  schedule,
  tutorName,
}: {
  schedule: ScheduleListItem
  tutorName: string
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-base font-bold">Informasi Sesi Pertemuan</h2>
      <dl className="mt-3.5 grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <InformationItem label="Tentor Pengajar" value={tutorName} />
        <InformationItem
          label="Mata Pelajaran"
          value={schedule.subject ?? 'Belum ditentukan'}
        />
        <InformationItem
          label="Waktu & Durasi"
          value={`${dayNames[schedule.dayOfWeek - 1] ?? '—'}, ${shortTime(schedule.startTime)} - ${shortTime(schedule.endTime)} (${getDuration(schedule.startTime, schedule.endTime)} Menit)`}
          emphasized
        />
        <InformationItem label="Alokasi Ruangan" value={roomLabel(schedule)} />
      </dl>
    </section>
  )
}

function InformationItem({
  label,
  value,
  emphasized = false,
}: {
  label: string
  value: string
  emphasized?: boolean
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 text-[13px] font-semibold',
          emphasized && 'font-bold',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function AttendanceRow({
  student,
  index,
  onEdit,
}: {
  student: AttendanceStudent
  index: number
  onEdit: (student: AttendanceStudent) => void
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-muted-foreground">{index}</td>
      <th className="px-3 py-3 text-[13px] font-semibold" scope="row">
        {student.name}
      </th>
      <td className="px-3 py-3 text-muted-foreground">{student.school}</td>
      <td className="px-3 py-3 text-[11px] leading-[1.4] text-muted-foreground">
        {student.note || '—'}
      </td>
      <td className="px-3 py-3">
        <AttendanceBadge status={student.status} />
      </td>
      <td className="px-3 py-3 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[11px] font-semibold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => onEdit(student)}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Ubah
        </button>
      </td>
    </tr>
  )
}

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const classes: Record<AttendanceStatus, string> = {
    Hadir:
      'border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]',
    Izin: 'border-[var(--color-info-border)] bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
    Sakit:
      'border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    Alpha:
      'border-[var(--color-danger-soft)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-1 text-[10px] font-bold',
        classes[status],
      )}
    >
      {status}
    </span>
  )
}

function AttendanceSummary({
  summary,
}: {
  summary: Record<AttendanceStatus, number>
}) {
  const items: { label: AttendanceStatus; classes: string }[] = [
    {
      label: 'Hadir',
      classes: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    },
    { label: 'Izin', classes: 'bg-[var(--color-primary-soft)] text-primary' },
    {
      label: 'Sakit',
      classes: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    },
    {
      label: 'Alpha',
      classes: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    },
  ]

  return (
    <section className="rounded-lg border border-border bg-card p-[18px]">
      <h2 className="text-sm font-bold">Ringkasan Presensi Sesi Ini</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn('rounded-md p-2.5 text-center', item.classes)}
          >
            <p className="text-lg font-bold leading-[1.3]">
              {summary[item.label]}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TutorCard({
  tutorName,
  onChangeTutor,
}: {
  tutorName: string
  onChangeTutor: () => void
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-[18px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">Tentor Pengajar</h2>
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Demo
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {getInitials(tutorName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold">{tutorName}</p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            +62 812-3456-7890
          </p>
        </div>
      </div>
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-success)] text-[13px] font-semibold text-[var(--color-success)] hover:bg-[var(--color-success-bg)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Hubungi via WhatsApp
      </a>
      <Button
        variant="outline"
        className="mt-2 w-full text-[13px]"
        onClick={onChangeTutor}
      >
        <Repeat2 className="h-4 w-4" aria-hidden="true" />
        Ganti Tentor
      </Button>
    </section>
  )
}

function AttendanceDialog({
  student,
  onClose,
  onSave,
}: {
  student: AttendanceStudent
  onClose: () => void
  onSave: (student: AttendanceStudent) => void
}) {
  const [status, setStatus] = useState(student.status)
  const [note, setNote] = useState(student.note)

  return (
    <DialogShell title={`Ubah Presensi ${student.name}`} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave({ ...student, status, note: note.trim() })
        }}
      >
        <label className="block text-xs font-bold" htmlFor="attendance-status">
          Status presensi
        </label>
        <select
          id="attendance-status"
          className="mt-2 h-10 w-full rounded-md border border-input bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as AttendanceStatus)
          }
        >
          {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as const).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label
          className="mt-4 block text-xs font-bold"
          htmlFor="attendance-note"
        >
          Keterangan
        </label>
        <textarea
          id="attendance-note"
          className="mt-2 min-h-24 w-full resize-y rounded-md border border-input bg-card p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="Tambahkan keterangan bila diperlukan"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">Simpan Presensi</Button>
        </div>
      </form>
    </DialogShell>
  )
}

function TutorDialog({
  currentTutorId,
  currentTutor,
  subject,
  onClose,
  onSave,
}: {
  currentTutorId: string
  currentTutor: string
  subject: string
  onClose: () => void
  onSave: (tutor: Tutor, reason: string) => void
}) {
  const tutorsQuery = useTutors({
    page: 1,
    limit: 100,
    status: 'active',
  })
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('')
  const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
  const availableTutors =
    tutorsQuery.data?.data.filter((tutor) => tutor.id !== currentTutorId) ?? []
  const visibleTutors = normalizedSearch
    ? availableTutors.filter((tutor) =>
        `${tutor.name} ${tutor.expertise ?? ''}`
          .toLocaleLowerCase('id-ID')
          .includes(normalizedSearch),
      )
    : availableTutors
  const selectedTutor =
    visibleTutors.find((tutor) => tutor.id === selectedTutorId) ??
    visibleTutors[0] ??
    null
  const effectiveSelectedTutorId = selectedTutor?.id ?? null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[var(--color-modal-overlay)] p-4"
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <section
        className="my-auto w-full max-w-[600px] rounded-xl border border-border bg-card p-5 shadow-md sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutor-dialog-title"
        aria-describedby="tutor-dialog-description"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="tutor-dialog-title"
              className="text-xl font-extrabold leading-[1.3]"
            >
              Ganti Tentor
            </h2>
            <p
              id="tutor-dialog-description"
              className="mt-1 text-[13px] font-medium leading-[1.35] text-muted-foreground"
            >
              Pilih tentor pengganti untuk sesi {subject} hari ini.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup dialog ganti tentor"
            onClick={onClose}
          >
            <X className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-[18px] flex items-center gap-3 rounded-lg border border-border bg-[var(--color-gray-50)] p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {getInitials(currentTutor)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Tentor saat ini
            </p>
            <p className="mt-0.5 truncate text-sm font-extrabold">
              {currentTutor}
            </p>
          </div>
        </div>

        <label className="relative mt-[18px] block" htmlFor="tutor-search">
          <span className="sr-only">Cari nama tentor atau mata pelajaran</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="tutor-search"
            type="search"
            className="h-10 w-full rounded-md border border-input bg-[var(--color-gray-50)] pl-[38px] pr-3 text-[13px] font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="Cari nama tentor atau mata pelajaran..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <fieldset
          className="mt-[18px] grid gap-2.5"
          aria-busy={tutorsQuery.isPending}
        >
          <legend className="sr-only">Pilih tentor pengganti</legend>
          {tutorsQuery.isPending
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none"
                />
              ))
            : visibleTutors.map((tutor) => {
                const isSelected = effectiveSelectedTutorId === tutor.id

                return (
                  <label
                    key={tutor.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                      isSelected
                        ? 'border-primary bg-[var(--color-primary-soft)]'
                        : 'border-border bg-card hover:bg-accent',
                    )}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="tutor"
                      value={tutor.id}
                      checked={isSelected}
                      onChange={() => setSelectedTutorId(tutor.id)}
                    />
                    <span
                      className={cn(
                        'grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full text-[13px] font-bold text-white',
                        isSelected ? 'bg-primary' : 'bg-muted-foreground',
                      )}
                      aria-hidden="true"
                    >
                      {getInitials(tutor.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-extrabold">
                        {tutor.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                        {tutor.expertise ?? 'Keahlian belum dicantumkan'} ·{' '}
                        {tutor.phoneNumber}
                      </span>
                    </span>
                    {isSelected ? (
                      <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground">
                        Dipilih
                      </span>
                    ) : null}
                  </label>
                )
              })}
        </fieldset>

        {tutorsQuery.isError ? (
          <div
            className="mt-[18px] flex items-start gap-3 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger)]"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold">
                Daftar tentor tidak dapat dimuat.
              </p>
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2"
                onClick={() => void tutorsQuery.refetch()}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Coba lagi
              </button>
            </div>
          </div>
        ) : null}

        {!tutorsQuery.isPending &&
        !tutorsQuery.isError &&
        visibleTutors.length === 0 ? (
          <p className="mt-[18px] rounded-lg border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
            {normalizedSearch
              ? 'Tidak ada tentor yang cocok dengan pencarian.'
              : 'Belum ada tentor aktif lain yang dapat dipilih.'}
          </p>
        ) : null}

        <label
          className="mt-[18px] block text-xs font-bold"
          htmlFor="tutor-replacement-reason"
        >
          Alasan penggantian
        </label>
        <textarea
          id="tutor-replacement-reason"
          className="mt-1.5 min-h-[72px] w-full resize-y rounded-md border border-input bg-card p-3 text-[13px] font-medium leading-[1.35] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="Contoh: tentor utama berhalangan hadir"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        <div className="mt-[18px] flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
          <Button
            variant="outline"
            className="h-9 px-3.5 text-[13px] font-bold"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            className="h-9 px-3.5 text-[13px] font-bold"
            disabled={!selectedTutor || tutorsQuery.isPending}
            onClick={() => {
              if (selectedTutor) onSave(selectedTutor, reason.trim())
            }}
          >
            Simpan Perubahan
          </Button>
        </div>
      </section>
    </div>
  )
}

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-modal-overlay)] p-4"
      role="presentation"
    >
      <section
        className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-dialog-title"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="schedule-dialog-title" className="text-base font-bold">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup dialog"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function ScheduleDetailMessage({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <section className="mx-auto mt-16 max-w-lg rounded-lg border border-border bg-card p-8 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  )
}

function ScheduleDetailSkeleton() {
  return (
    <div
      className="animate-pulse motion-reduce:animate-none"
      aria-label="Memuat detail jadwal"
      role="status"
    >
      <div className="h-8 w-72 rounded bg-muted" />
      <div className="mt-5 grid gap-[18px] xl:grid-cols-[minmax(0,780px)_minmax(280px,1fr)]">
        <div className="grid gap-4">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
          <div className="h-96 rounded-lg bg-muted" />
        </div>
        <div className="grid content-start gap-4">
          <div className="h-32 rounded-lg bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}

function getAttendanceSummary(students: AttendanceStudent[]) {
  return students.reduce<Record<AttendanceStatus, number>>(
    (summary, student) => ({
      ...summary,
      [student.status]: summary[student.status] + 1,
    }),
    { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 },
  )
}

function getDuration(startTime: string, endTime: string) {
  const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number)
  const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number)
  return endHour * 60 + endMinute - (startHour * 60 + startMinute)
}

function shortTime(value: string) {
  return value.slice(0, 5)
}

function shortId(value: string) {
  return value.slice(0, 8).toLocaleUpperCase('id-ID')
}

function roomLabel(schedule: ScheduleListItem) {
  if (!schedule.roomName && !schedule.roomCode) return 'Belum dialokasikan'
  if (schedule.roomName && schedule.roomCode) {
    return `${schedule.roomName} (${schedule.roomCode})`
  }
  return schedule.roomName ?? schedule.roomCode ?? 'Belum dialokasikan'
}

function getInitials(value: string) {
  return value
    .replace(/^(pak|bu|kak)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('id-ID')
}

import { DetailBackLink } from '@/components/ui/detail-back-link'
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import {
  Ban,
  CalendarClock,
  CheckCheck,
  Edit3,
  MessageCircle,
  Repeat2,
  Search,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TableRowActions } from '@/components/ui/table-row-actions'
import { Input } from '@/components/ui/input'
import { useSchedulingOptions } from './use-scheduling-options'
import { ApiError } from '@/services/api-client'
import {
  sessionDateLabel,
  useOverrideSession,
  useSession,
  type AttendanceStatus,
  type ClassSession,
} from './api'

const attendanceLabels: Record<AttendanceStatus, string> = {
  present: 'Hadir',
  excused: 'Izin',
  sick: 'Sakit',
  absent: 'Alpha',
}

const attendanceStyles: Record<AttendanceStatus, string> = {
  present: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  excused: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  sick: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  absent: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
}

export function SessionDetailPage() {
  const { id = '' } = useParams()
  const query = useSession(id)

  if (query.isPending) return <SessionDetailSkeleton />

  if (query.isError) {
    const forbidden =
      query.error instanceof ApiError && query.error.status === 403

    return (
      <div
        className="grid min-h-72 place-items-center rounded-lg border bg-card p-8 text-center"
        role="alert"
      >
        <div>
          <h1 className="text-lg font-bold">
            {forbidden ? 'Akses sesi ditolak' : 'Sesi tidak dapat dimuat'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {forbidden
              ? 'Anda tidak memiliki akses ke detail sesi ini.'
              : 'Periksa koneksi Anda, lalu coba kembali.'}
          </p>
          {!forbidden ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void query.refetch()}
            >
              Coba lagi
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <SessionDetail
      key={`${query.data.id}:${query.data.version}`}
      session={query.data}
    />
  )
}

function SessionDetail({ session }: { session: ClassSession }) {
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'cancel' | 'reschedule' | null>(null)
  const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
  const students = normalizedSearch
    ? session.students.filter((student) =>
        `${student.name} ${student.school}`
          .toLocaleLowerCase('id-ID')
          .includes(normalizedSearch),
      )
    : session.students
  const counts = countAttendance(session)
  const canChange = session.status === 'scheduled' && !session.lockedAt
  const recordPath = `/schedule/${session.id}/record?step=attendance`

  return (
    <div className="mx-auto w-full min-w-0">
      <DetailBackLink to="/schedule">Kembali ke daftar jadwal</DetailBackLink>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {session.studyGroupName}
            </h1>
            <SessionStatus session={session} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canChange ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-[var(--color-danger-border)] text-destructive hover:bg-[var(--color-danger-bg)] hover:text-destructive"
                onClick={() => setDialog('cancel')}
              >
                <Ban className="h-4 w-4" aria-hidden="true" />
                Batalkan Sesi
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDialog('reschedule')}
              >
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Reschedule
              </Button>
            </>
          ) : null}
        </div>
      </header>

      <div className="mt-[18px] grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
        <div className="grid min-w-0 gap-4">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-base font-bold">Informasi Sesi Pertemuan</h2>
            <dl className="mt-3.5 grid gap-y-4 sm:grid-cols-2 lg:grid-cols-4 ">
              <DetailItem label="Tentor Pengajar" value={session.tutorName} />
              <DetailItem
                label="Mata Pelajaran"
                value={session.subject ?? 'Belum ditentukan'}
              />
              <DetailItem label="Ruangan" value={roomLabel(session)} />
              <DetailItem
                label="Waktu & Durasi"
                value={`${sessionDateLabel(session.sessionDate)}, ${session.startTime}–${session.endTime} (${sessionDuration(session)} menit)`}
                emphasized
              />
            </dl>
          </section>

          <section className="rounded-lg border bg-card p-[18px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">
                Materi &amp; Catatan Sesi Pertemuan
              </h2>
              <Button asChild size="sm" variant="ghost" className="h-8 px-2">
                <Link to={`/schedule/${session.id}/record?step=notes`}>
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Ubah
                </Link>
              </Button>
            </div>
            <ReadonlyField label="Topik" value={session.topic} />
            <ReadonlyField
              label="Catatan Tentor"
              value={session.tutorNote}
              multiline
            />
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Data Presensi Siswa</h2>
                <span className="rounded-md bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary-text">
                  {session.students.length} Siswa
                </span>
              </div>
              {!session.lockedAt && session.status !== 'cancelled' ? (
                <Button asChild size="sm" className="h-8 text-xs">
                  <Link to={`${recordPath}&markAll=1`}>
                    <CheckCheck className="h-4 w-4" aria-hidden="true" />
                    Tandai Semua Hadir
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="border-b px-5 py-3">
              <div className="relative">
                <label className="sr-only" htmlFor="student-search">
                  Cari nama siswa atau sekolah
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="student-search"
                  type="search"
                  value={search}
                  className="h-10 pl-10 text-xs"
                  placeholder="Cari nama siswa atau sekolah..."
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <AttendanceTable students={students} recordPath={recordPath} />
          </section>
        </div>

        <aside className="grid w-full min-w-0 max-w-[360px] gap-4">
          <section className="rounded-lg border bg-card p-[18px]">
            <h2 className="text-sm font-bold">Ringkasan Presensi Sesi Ini</h2>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <AttendanceSummary
                label="Hadir"
                value={counts.present}
                status="present"
              />
              <AttendanceSummary
                label="Izin"
                value={counts.excused}
                status="excused"
              />
              <AttendanceSummary
                label="Sakit"
                value={counts.sick}
                status="sick"
              />
              <AttendanceSummary
                label="Alpha"
                value={counts.absent}
                status="absent"
              />
            </div>
            {counts.pending > 0 ? (
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {counts.pending} siswa belum diisi presensinya.
              </p>
            ) : null}
          </section>

          <TutorCard
            session={session}
            onChangeTutor={() => setDialog('reschedule')}
          />
        </aside>
      </div>

      {dialog ? (
        <SessionOverrideDialog
          mode={dialog}
          session={session}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  )
}

function DetailItem({
  label,
  value,
  emphasized = false,
  className = '',
}: {
  label: string
  value: string
  emphasized?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`mt-0.5 text-[13px] ${emphasized ? 'font-bold' : 'font-semibold'}`}
      >
        {value}
      </dd>
    </div>
  )
}

function ReadonlyField({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string | null
  multiline?: boolean
}) {
  return (
    <div className="mt-2">
      <p className="text-xs font-bold">{label}</p>
      <p
        className={`mt-1.5 whitespace-pre-wrap rounded-md border px-3 py-2.5 text-xs leading-5 ${multiline ? 'min-h-[62px]' : ''} ${value ? '' : 'text-muted-foreground'}`}
      >
        {value || 'Belum diisi'}
      </p>
    </div>
  )
}

function AttendanceTable({
  students,
  recordPath,
}: {
  students: ClassSession['students']
  recordPath: string
}) {
  if (!students.length) {
    return (
      <p
        className="px-5 py-10 text-center text-sm text-muted-foreground"
        role="status"
      >
        Tidak ada siswa yang cocok dengan pencarian.
      </p>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto px-5 pb-4 md:block">
        <table className="w-full min-w-[700px] table-fixed text-left text-[11px]">
          <caption className="sr-only">
            Data presensi siswa pada sesi ini
          </caption>
          <thead className="bg-[var(--color-gray-50)] text-muted-foreground">
            <tr>
              <TableHeading className="w-12">No</TableHeading>
              <TableHeading className="w-[21%]">Siswa</TableHeading>
              <TableHeading className="w-[20%]">Sekolah</TableHeading>
              <TableHeading>Keterangan</TableHeading>
              <TableHeading className="w-24">Presensi</TableHeading>
              <TableHeading className="w-20">Aksi</TableHeading>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.studentId}
                className={index % 2 ? 'bg-[var(--color-bg-light)]' : ''}
              >
                <td className="px-4 py-2.5 text-muted-foreground">
                  {index + 1}
                </td>
                <th className="px-4 py-2.5 text-xs font-bold" scope="row">
                  {student.name}
                </th>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {student.school}
                </td>
                <td className="px-4 py-2.5 leading-4 text-muted-foreground">
                  {student.note || '—'}
                </td>
                <td className="px-4 py-2.5">
                  <AttendanceBadge status={student.status} />
                </td>
                <td className="px-4 py-2.5">
                  <TableRowActions
                    label={`presensi ${student.name}`}
                    actions={[
                      { label: 'Ubah presensi', icon: Edit3, to: recordPath },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2.5 p-4 md:hidden">
        {students.map((student) => (
          <article key={student.studentId} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold">{student.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {student.school}
                </p>
              </div>
              <AttendanceBadge status={student.status} />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {student.note || 'Tidak ada keterangan.'}
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2 h-8">
              <Link to={recordPath}>
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" /> Ubah
                presensi
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </>
  )
}

function TableHeading({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th className={`px-4 py-2.5 font-semibold ${className}`}>{children}</th>
  )
}

function AttendanceBadge({ status }: { status: AttendanceStatus | null }) {
  if (!status) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
        Belum diisi
      </span>
    )
  }
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold ${attendanceStyles[status]}`}
    >
      {attendanceLabels[status]}
    </span>
  )
}

function AttendanceSummary({
  label,
  value,
  status,
}: {
  label: string
  value: number
  status: AttendanceStatus
}) {
  return (
    <div className={`rounded-md p-2.5 text-center ${attendanceStyles[status]}`}>
      <strong className="block text-lg leading-none">{value}</strong>
      <span className="mt-1 block text-[10px] font-semibold">{label}</span>
    </div>
  )
}

function TutorCard({
  session,
  onChangeTutor,
}: {
  session: ClassSession
  onChangeTutor: () => void
}) {
  const whatsappUrl = toWhatsappUrl(session.tutorPhoneNumber)
  return (
    <section className="rounded-lg border bg-card p-[18px]">
      <h2 className="text-sm font-bold">Tentor Pengajar</h2>
      <div className="mt-3 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
        >
          {initials(session.tutorName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{session.tutorName}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {session.tutorPhoneNumber || 'Nomor telepon belum tersedia'}
          </p>
        </div>
      </div>
      {whatsappUrl ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-3 w-full border-[var(--color-success-border)] text-[var(--color-success)] hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success)]"
        >
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Hubungi via
            WhatsApp
          </a>
        </Button>
      ) : null}
      {session.status === 'scheduled' && !session.lockedAt ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onClick={onChangeTutor}
        >
          <Repeat2 className="h-4 w-4" aria-hidden="true" /> Ganti Tentor
        </Button>
      ) : null}
    </section>
  )
}

function SessionOverrideDialog({
  mode,
  session,
  onClose,
}: {
  mode: 'cancel' | 'reschedule'
  session: ClassSession
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [date, setDate] = useState(session.sessionDate)
  const [start, setStart] = useState(session.startTime)
  const [end, setEnd] = useState(session.endTime)
  const [tutor, setTutor] = useState(session.tutorId)
  const [room, setRoom] = useState(session.roomId ?? '')
  const [reason, setReason] = useState('')
  const mutation = useOverrideSession(session.id)
  const tutors = useSchedulingOptions('tutors')
  const rooms = useSchedulingOptions('rooms')

  useEffect(() => {
    const dialogElement = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialogElement?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialogElement?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (mutation.isPending || !reason.trim()) return
    mutation.mutate(
      mode === 'cancel'
        ? { version: session.version, reason, status: 'cancelled' }
        : {
            version: session.version,
            reason,
            sessionDate: date,
            startTime: start,
            endTime: end,
            tutorId: tutor,
            roomId: room || undefined,
          },
      { onSuccess: onClose },
    )
  }

  const conflict =
    mutation.error instanceof ApiError && mutation.error.status === 409
  const title = mode === 'cancel' ? 'Batalkan sesi' : 'Reschedule sesi'

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="session-override-title"
      aria-describedby="session-override-description"
      aria-busy={mutation.isPending}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl border-0 bg-card p-0 text-foreground shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)]"
      onCancel={(event) => {
        event.preventDefault()
        if (!mutation.isPending) onClose()
      }}
    >
      <form onSubmit={submit}>
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="session-override-title" className="text-lg font-bold">
              {title}
            </h2>
            <p
              id="session-override-description"
              className="mt-1 text-sm text-muted-foreground"
            >
              {mode === 'cancel'
                ? 'Sesi yang dibatalkan tidak dapat diisi presensinya.'
                : 'Perubahan hanya berlaku untuk sesi pertemuan ini.'}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Tutup dialog"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {mode === 'reschedule' ? (
            <>
              <FormField label="Tanggal" htmlFor="override-date">
                <Input
                  id="override-date"
                  required
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </FormField>
              <FormField label="Tentor" htmlFor="override-tutor">
                <select
                  id="override-tutor"
                  className="h-11 w-full rounded-md border border-input bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={tutor}
                  onChange={(event) => setTutor(event.target.value)}
                >
                  <option value={session.tutorId}>{session.tutorName}</option>
                  {tutors.data?.data
                    .filter((item) => item.id !== session.tutorId)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </FormField>
              <FormField label="Jam mulai" htmlFor="override-start">
                <Input
                  id="override-start"
                  required
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </FormField>
              <FormField label="Jam selesai" htmlFor="override-end">
                <Input
                  id="override-end"
                  required
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </FormField>
              <FormField
                label="Ruangan"
                htmlFor="override-room"
                className="sm:col-span-2"
              >
                <select
                  id="override-room"
                  className="h-11 w-full rounded-md border border-input bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                >
                  <option value={session.roomId ?? ''}>
                    {session.roomName ?? 'Belum ditentukan'}
                  </option>
                  {rooms.data?.data
                    .filter((item) => item.id !== session.roomId)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.capacity} siswa
                      </option>
                    ))}
                </select>
              </FormField>
            </>
          ) : null}

          <FormField
            label={mode === 'cancel' ? 'Alasan pembatalan' : 'Alasan perubahan'}
            htmlFor="override-reason"
            className="sm:col-span-2"
          >
            <textarea
              id="override-reason"
              required
              autoFocus
              maxLength={1000}
              value={reason}
              className="min-h-24 w-full rounded-md border border-input bg-[var(--color-surface)] p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => setReason(event.target.value)}
            />
          </FormField>
          {mutation.isError ? (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {conflict
                ? 'Sesi berubah atau jadwal bentrok. Tutup dialog, muat ulang, lalu periksa kembali.'
                : 'Perubahan belum tersimpan. Silakan coba kembali.'}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant={mode === 'cancel' ? 'destructive' : 'default'}
            disabled={mutation.isPending || !reason.trim()}
          >
            {mutation.isPending ? 'Menyimpan...' : title}
          </Button>
        </div>
      </form>
    </dialog>,
    document.body,
  )
}

function FormField({
  label,
  htmlFor,
  className = '',
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-bold" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

function SessionStatus({ session }: { session: ClassSession }) {
  const styles = {
    scheduled: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
    completed: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    cancelled: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  }
  const labels = {
    scheduled: 'Terjadwal',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return (
    <span
      className={`rounded-md px-2 py-1 text-[11px] font-bold ${styles[session.status]}`}
    >
      {labels[session.status]}
      {session.lockedAt ? ' · Terkunci' : ''}
    </span>
  )
}

function SessionDetailSkeleton() {
  return (
    <div
      className="mx-auto w-full min-w-0 animate-pulse"
      aria-busy="true"
      aria-label="Memuat detail sesi"
    >
      <div className="h-4 w-56 rounded bg-muted" />
      <div className="mt-2 h-8 w-72 rounded bg-muted" />
      <div className="mt-5 grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
        <div className="grid min-w-0 gap-4">
          <div className="h-40 rounded-lg border bg-card" />
          <div className="h-52 rounded-lg border bg-card" />
          <div className="h-96 rounded-lg border bg-card" />
        </div>
        <div className="grid w-full min-w-0 max-w-[360px] content-start gap-4">
          <div className="h-36 rounded-lg border bg-card" />
          <div className="h-52 rounded-lg border bg-card" />
        </div>
      </div>
      <span className="sr-only" role="status">
        Memuat sesi...
      </span>
    </div>
  )
}

function countAttendance(session: ClassSession) {
  const counts = { present: 0, excused: 0, sick: 0, absent: 0, pending: 0 }
  for (const student of session.students) {
    if (student.status) counts[student.status] += 1
    else counts.pending += 1
  }
  return counts
}

function sessionDuration(session: ClassSession) {
  const [startHour, startMinute] = session.startTime.split(':').map(Number)
  const [endHour, endMinute] = session.endTime.split(':').map(Number)
  return Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute)
}

function roomLabel(session: ClassSession) {
  if (!session.roomName) return 'Belum ada ruangan'
  const code = session.roomCode ? ` (${session.roomCode})` : ''
  return `${session.roomName}${code}`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function toWhatsappUrl(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '')
  if (!digits) return null
  const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${international}`
}

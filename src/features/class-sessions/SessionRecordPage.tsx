import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { ArrowLeft, CheckCheck, CircleCheckBig } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/services/api-client'
import { getStoredAuthUser } from '@/lib/auth-session'
import {
  useSession,
  useSaveSession,
  sessionDateLabel,
  type ClassSession,
  type AttendanceStatus,
  type SessionRecord,
} from './api'

const statuses: {
  value: AttendanceStatus
  label: string
  selectedClassName: string
}[] = [
  {
    value: 'present',
    label: 'Hadir',
    selectedClassName:
      'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]',
  },
  {
    value: 'excused',
    label: 'Izin',
    selectedClassName:
      'border-primary bg-[var(--color-primary-soft)] text-primary',
  },
  {
    value: 'sick',
    label: 'Sakit',
    selectedClassName:
      'border-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  },
  {
    value: 'absent',
    label: 'Alpha',
    selectedClassName:
      'border-[var(--color-danger)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  },
]
const fieldClass =
  'mt-[7px] w-full resize-none rounded-md border bg-card p-3 text-xs font-normal leading-[1.5] focus-visible:ring-2 focus-visible:ring-ring'
export function SessionRecordPage() {
  const { sessionId = '', id = '' } = useParams()
  const query = useSession(sessionId || id)
  const [reload, setReload] = useState(0)
  if (query.isPending)
    return (
      <p className="p-6" role="status">
        Memuat sesi...
      </p>
    )
  if (query.isError)
    return (
      <div className="p-6" role="alert">
        <p>
          {query.error instanceof ApiError && query.error.status === 403
            ? 'Anda tidak ditugaskan pada sesi ini.'
            : 'Sesi tidak dapat dimuat.'}
        </p>
        <Button onClick={() => void query.refetch()}>Coba lagi</Button>
      </div>
    )
  return (
    <SessionRecordForm
      key={query.data.id + ':' + reload}
      session={query.data}
      onReload={() => {
        void query.refetch().then(() => setReload((n) => n + 1))
      }}
    />
  )
}
export function SessionRecordForm({
  session,
  onReload,
}: {
  session: ClassSession
  onReload: () => void
}) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const backTo =
    getStoredAuthUser()?.role === 'tutor'
      ? '/tutor/sessions'
      : `/schedule/${session.id}`
  const step = params.get('step') === 'notes' ? 'notes' : 'attendance'
  const markAll = params.get('markAll') === '1'
  const [students, setStudents] = useState(() =>
    markAll
      ? session.students.map((student) => ({
          ...student,
          status: 'present' as const,
        }))
      : session.students,
  )
  const [topic, setTopic] = useState(session.topic ?? '')
  const [note, setNote] = useState(session.tutorNote ?? '')
  const [dirty, setDirty] = useState(markAll)
  const [saved, setSaved] = useState(false)
  const [version] = useState(session.version)
  const mutation = useSaveSession(session.id)
  const leaveDialog = useRef<HTMLDialogElement>(null)
  const successDialog = useRef<HTMLDialogElement>(null)
  const readonly = !!session.lockedAt || session.status === 'cancelled'
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (blocker.state === 'blocked') leaveDialog.current?.showModal()
    else leaveDialog.current?.close()
  }, [blocker.state])
  useEffect(() => {
    const currentDialog = successDialog.current

    if (saved && !currentDialog?.open) currentDialog?.showModal()
  }, [saved])
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  const count = students.filter((s) => s.status !== null).length
  function update(studentId: string, status: AttendanceStatus) {
    setStudents((current) =>
      current.map((s) => (s.studentId === studentId ? { ...s, status } : s)),
    )
    setDirty(true)
    setSaved(false)
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (
      readonly ||
      mutation.isPending ||
      !topic.trim() ||
      !students.length ||
      count !== students.length
    )
      return
    const attendance: SessionRecord['attendance'] = []
    for (const student of students) {
      if (!student.status) return
      attendance.push({
        studentId: student.studentId,
        status: student.status,
        note: student.note ?? '',
      })
    }
    mutation.mutate(
      { version, topic: topic.trim(), tutorNote: note, attendance },
      {
        onSuccess: () => {
          setDirty(false)
          setSaved(true)
        },
      },
    )
  }
  const forbidden =
    mutation.error instanceof ApiError && mutation.error.status === 403
  const conflict =
    mutation.error instanceof ApiError && mutation.error.status === 409
  return (
    <main className="min-h-dvh bg-background pb-28 text-foreground">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="border-b bg-card px-[18px] pb-3.5 pt-4">
          <div className="flex items-center gap-2">
            {step === 'notes' ? (
              <button
                type="button"
                aria-label="Kembali ke pengisian presensi"
                className="rounded p-2 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setParams({ step: 'attendance' })}
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <Link
                to={backTo}
                aria-label="Kembali ke jadwal"
                className="rounded p-2 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft size={16} />
              </Link>
            )}
            <h1 className="flex-1 text-center text-base font-bold leading-[1.3]">
              {step === 'attendance'
                ? 'Isi Presensi'
                : 'Materi & Catatan Sesi Pertemuan'}
            </h1>
          </div>
          <h2 className="mt-3 text-base font-bold leading-[1.3]">
            {session.studyGroupName}
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-[1.3] text-muted-foreground">
            {sessionDateLabel(session.sessionDate)}{' '}
            {formatSessionTime(session.startTime)} -{' '}
            {formatSessionTime(session.endTime)} •{' '}
            {session.roomName ?? 'Ruang belum ditentukan'}
          </p>
        </header>
        {readonly ? (
          <p role="status" className="m-3 rounded border p-3 text-sm">
            {session.status === 'cancelled'
              ? 'Sesi dibatalkan.'
              : 'Sesi terkunci untuk penggajian.'}
          </p>
        ) : null}
        <form onSubmit={submit} className="p-3.5">
          {step === 'attendance' ? (
            <>
              <div className="mb-3.5 flex items-center justify-between gap-2">
                <p className="rounded-md px-2.5 py-1.5 text-xs font-extrabold leading-[1.3] text-muted-foreground">
                  {students.length} siswa
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-[34px] px-4 text-[13px] font-semibold"
                  disabled={
                    readonly || mutation.isPending || saved || !students.length
                  }
                  onClick={() => {
                    setStudents((current) =>
                      current.map((s) => ({ ...s, status: 'present' })),
                    )
                    setDirty(true)
                  }}
                >
                  <CheckCheck size={16} />
                  Tandai Semua Hadir
                </Button>
              </div>
              {!students.length ? (
                <p role="status">
                  Belum ada siswa pada sesi ini. Hubungi admin.
                </p>
              ) : null}
              <div className="grid gap-2.5">
                {students.map((student) => (
                  <article
                    key={student.studentId}
                    className="rounded-lg border bg-card p-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-[15px] font-extrabold text-primary"
                      >
                        {student.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold leading-[1.3]">
                          {student.name}
                        </h3>
                        <p className="mt-0.5 truncate text-xs font-medium leading-[1.3] text-muted-foreground">
                          {student.school} - {student.educationLevel}
                        </p>
                      </div>
                    </div>
                    <fieldset
                      disabled={readonly || mutation.isPending || saved}
                      className="mt-3.5 grid grid-cols-4 gap-1.5 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <legend className="sr-only">
                        Presensi {student.name}
                      </legend>
                      {statuses.map((option) => (
                        <label
                          key={option.value}
                          className={
                            'flex h-[26px] cursor-pointer items-center justify-center rounded-md border px-2 text-xs font-extrabold leading-[1.3] transition-colors ' +
                            (student.status === option.value
                              ? option.selectedClassName
                              : 'border-input bg-card text-muted-foreground hover:bg-accent')
                          }
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name={'status-' + student.studentId}
                            value={option.value}
                            checked={student.status === option.value}
                            onChange={() =>
                              update(student.studentId, option.value)
                            }
                          />
                          {option.label}
                        </label>
                      ))}
                    </fieldset>
                    {student.status && student.status !== 'present' ? (
                      <label className="mt-3.5 block">
                        <span className="sr-only">
                          Keterangan{' '}
                          {
                            statuses.find((s) => s.value === student.status)
                              ?.label
                          }{' '}
                          untuk {student.name}
                        </span>
                        <input
                          maxLength={1000}
                          disabled={readonly || mutation.isPending || saved}
                          className="h-[38px] w-full rounded-md border bg-card px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          value={student.note ?? ''}
                          placeholder={`Tulis keterangan ${statuses
                            .find((status) => status.value === student.status)
                            ?.label.toLowerCase()}...`}
                          onChange={(event) => {
                            setStudents((current) =>
                              current.map((s) =>
                                s.studentId === student.studentId
                                  ? { ...s, note: event.target.value }
                                  : s,
                              ),
                            )
                            setDirty(true)
                          }}
                        />
                      </label>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="grid gap-3">
              <label className="block text-xs font-bold leading-[1.35]">
                Topik *
                <textarea
                  required
                  rows={2}
                  maxLength={2000}
                  disabled={readonly || mutation.isPending || saved}
                  className={fieldClass}
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value)
                    setDirty(true)
                  }}
                />
              </label>
              <label className="block text-xs font-bold leading-[1.35]">
                Catatan Tentor
                <textarea
                  rows={3}
                  maxLength={10000}
                  disabled={readonly || mutation.isPending || saved}
                  className={fieldClass}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value)
                    setDirty(true)
                  }}
                />
              </label>
            </div>
          )}
          {mutation.isError ? (
            <div
              role="alert"
              className="mt-3 rounded border p-3 text-sm text-destructive"
            >
              <p>
                {conflict
                  ? 'Sesi berubah atau terkunci. Muat ulang untuk memeriksa data terbaru.'
                  : forbidden
                    ? 'Anda tidak lagi ditugaskan pada sesi ini. Hubungi admin.'
                    : 'Data belum tersimpan. Periksa koneksi dan coba lagi.'}
              </p>
              {conflict ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (
                      !dirty ||
                      window.confirm(
                        'Buang perubahan lokal dan muat ulang sesi?',
                      )
                    ) {
                      setDirty(false)
                      onReload()
                    }
                  }}
                >
                  Muat ulang
                </Button>
              ) : null}
            </div>
          ) : null}
          <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[390px] -translate-x-1/2 border-t bg-card p-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full">
              {step === 'attendance' ? (
                <>
                  <p className="mb-2.5 text-[13px] font-bold leading-[1.3]">
                    {count}/{students.length} siswa sudah diisi
                  </p>
                  <Button
                    type="button"
                    className="h-[38px] w-full text-[13px] font-semibold"
                    disabled={
                      !readonly &&
                      (!students.length || count !== students.length)
                    }
                    onClick={() => setParams({ step: 'notes' })}
                  >
                    Lanjut
                  </Button>
                </>
              ) : (
                <Button
                  type="submit"
                  className="h-10 w-full text-[13px] font-bold"
                  disabled={
                    readonly ||
                    mutation.isPending ||
                    saved ||
                    !topic.trim() ||
                    !students.length ||
                    count !== students.length
                  }
                >
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              )}
            </div>
          </footer>
        </form>
      </div>
      <dialog
        ref={leaveDialog}
        onCancel={() => blocker.state === 'blocked' && blocker.reset()}
        aria-labelledby="leave-session"
        className="max-w-[calc(100%-2rem)] rounded-lg border bg-card p-6 text-foreground backdrop:bg-[var(--color-modal-overlay)]"
      >
        <div>
          <h2 id="leave-session" className="font-bold">
            Perubahan belum disimpan
          </h2>
          <p className="my-3">Keluar dan buang perubahan?</p>
          <Button
            autoFocus
            onClick={() => blocker.state === 'blocked' && blocker.reset()}
          >
            Tetap di sini
          </Button>
          <Button
            variant="outline"
            onClick={() => blocker.state === 'blocked' && blocker.proceed()}
          >
            Keluar
          </Button>
        </div>
      </dialog>
      {saved ? (
        <dialog
          ref={successDialog}
          aria-labelledby="save-success-title"
          aria-describedby="save-success-description"
          onCancel={(event) => event.preventDefault()}
          className="w-[calc(100%-2rem)] max-w-[358px] rounded-xl border bg-card p-6 text-center text-foreground shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)]"
        >
          <div className="session-success-icon relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
            <CircleCheckBig
              className="session-success-check h-6 w-6"
              aria-hidden="true"
            />
          </div>
          <h2 id="save-success-title" className="mt-4 text-base font-bold">
            Pengisian berhasil disimpan
          </h2>
          <p
            id="save-success-description"
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          >
            Data presensi, materi, dan catatan sesi telah berhasil disimpan.
          </p>
          <Button
            autoFocus
            type="button"
            className="mt-5 w-full"
            onClick={() => {
              successDialog.current?.close()
              void navigate(backTo)
            }}
          >
            Kembali ke Jadwal
          </Button>
        </dialog>
      ) : null}
    </main>
  )
}

function formatSessionTime(value: string) {
  return value.slice(0, 5)
}

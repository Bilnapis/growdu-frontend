import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { ArrowLeft, CheckCheck } from 'lucide-react'
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

const statuses: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Hadir' },
  { value: 'excused', label: 'Izin' },
  { value: 'sick', label: 'Sakit' },
  { value: 'absent', label: 'Alpha' },
]
const fieldClass =
  'mt-2 w-full rounded-md border bg-card p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring'
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
  const dialog = useRef<HTMLDialogElement>(null)
  const readonly = !!session.lockedAt || session.status === 'cancelled'
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (blocker.state === 'blocked') dialog.current?.showModal()
    else dialog.current?.close()
  }, [blocker.state])
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
    <main className="min-h-dvh bg-background pb-36 text-foreground">
      <div className="mx-auto max-w-[430px]">
        <header className="border-b bg-card px-[18px] py-4">
          <div className="flex items-center gap-2">
            <Link
              to={backTo}
              aria-label="Kembali ke jadwal"
              className="rounded p-2 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="flex-1 text-center text-base font-bold">
              {step === 'attendance'
                ? 'Isi Presensi'
                : 'Materi & Catatan Sesi Pertemuan'}
            </h1>
          </div>
          <h2 className="mt-3 font-bold">{session.studyGroupName}</h2>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {sessionDateLabel(session.sessionDate)} {session.startTime} –{' '}
            {session.endTime} • {session.roomName ?? 'Ruang belum ditentukan'}
          </p>
        </header>
        {readonly ? (
          <p role="status" className="m-3 rounded border p-3 text-sm">
            {session.status === 'cancelled'
              ? 'Sesi dibatalkan.'
              : 'Sesi terkunci untuk penggajian.'}
          </p>
        ) : null}
        {saved ? (
          <div role="status" className="m-3 rounded border bg-card p-3">
            <p>Presensi dan catatan berhasil disimpan.</p>
            <Button className="mt-2" onClick={() => void navigate(backTo)}>
              Kembali ke jadwal
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSaved(false)
                onReload()
              }}
            >
              Muat data terbaru
            </Button>
          </div>
        ) : null}
        <form onSubmit={submit} className="p-3.5">
          {step === 'attendance' ? (
            <>
              <div className="mb-3.5 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {students.length} siswa
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary"
                      >
                        {student.name.slice(0, 1)}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold">{student.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {student.school} · {student.educationLevel}
                        </p>
                      </div>
                    </div>
                    <fieldset
                      disabled={readonly || mutation.isPending || saved}
                      className="mt-3.5 grid grid-cols-4 gap-1.5"
                    >
                      <legend className="sr-only">
                        Presensi {student.name}
                      </legend>
                      {statuses.map((option) => (
                        <label
                          key={option.value}
                          className={
                            'flex min-h-11 cursor-pointer items-center justify-center rounded-md border text-xs font-semibold focus-within:ring-2 focus-within:ring-ring ' +
                            (student.status === option.value
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'text-muted-foreground')
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
                      <label className="mt-2 block text-xs">
                        Keterangan{' '}
                        {
                          statuses.find((s) => s.value === student.status)
                            ?.label
                        }
                        <input
                          maxLength={1000}
                          disabled={readonly || mutation.isPending || saved}
                          className={fieldClass}
                          value={student.note ?? ''}
                          placeholder="Tulis keterangan..."
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
            <>
              <label className="block text-xs font-bold">
                Topik *
                <textarea
                  required
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
              <label className="mt-3 block text-xs font-bold">
                Catatan Tentor
                <textarea
                  maxLength={10000}
                  disabled={readonly || mutation.isPending || saved}
                  className={fieldClass + ' min-h-32'}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value)
                    setDirty(true)
                  }}
                />
              </label>
            </>
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
          <footer className="fixed inset-x-0 bottom-0 border-t bg-card p-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-[402px]">
              {step === 'attendance' ? (
                <>
                  <p className="mb-2 text-sm font-semibold">
                    {count}/{students.length} siswa sudah diisi
                  </p>
                  <Button
                    type="button"
                    className="w-full"
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setParams({ step: 'attendance' })}
                  >
                    Kembali
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      readonly ||
                      mutation.isPending ||
                      saved ||
                      mutation.isPending ||
                      !topic.trim() ||
                      !students.length ||
                      count !== students.length
                    }
                  >
                    {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              )}
            </div>
          </footer>
        </form>
      </div>
      <dialog
        ref={dialog}
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
    </main>
  )
}

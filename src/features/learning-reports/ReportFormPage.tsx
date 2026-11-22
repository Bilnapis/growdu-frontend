import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Link,
  Navigate,
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  createReport,
  publishReport,
  saveReport,
  type ReportContent,
  type ReportContribution,
  type ReportGroupDetail,
} from './api'
import { monthLabel, reportBase, validPeriod } from './format'
import {
  useReportGroup,
  useReportGroupOptions,
  useReportMutation,
} from './hooks'
import {
  AttendanceSummary,
  ReportBack,
  ReportError,
  ReportLoading,
  ReportPanel,
  ReportShell,
} from './ReportShared'
import { ReportSelectionFields } from './ReportSelectionFields'
import { ApiError } from '@/services/api-client'
import { ReportStudentNotes } from './ReportStudentNotes'

export function ReportFormPage() {
  const { groupId: routeGroupId = '' } = useParams()
  const [params] = useSearchParams()
  const period = validPeriod(params.get('period'))
  const options = useReportGroupOptions(period, !routeGroupId)
  const groupId = routeGroupId || options.data?.pages[0]?.data[0]?.id || ''
  const query = useReportGroup(groupId, period)
  const navigate = useNavigate()
  const [editorReset, setEditorReset] = useState(0)
  const [reloading, setReloading] = useState(false)
  if (!routeGroupId && groupId)
    return (
      <Navigate
        replace
        to={reportBase() + '/' + groupId + '/edit?period=' + period}
      />
    )
  if (!groupId && !options.isPending)
    return (
      <ReportShell title="Isi Laporan Kelompok" form>
        <ReportBack period={period} />
        <header className="lr-heading">
          <h1>Buat Laporan Kelompok</h1>
        </header>
        <ReportPanel
          title="Kelompok & periode"
          description="Pilih periode yang memiliki sesi belajar."
        >
          <div className="lr-fields">
            <ReportSelectionFields
              period={period}
              onChange={(id, month) => {
                void navigate(
                  reportBase() +
                    (id ? '/' + id + '/edit' : '/new') +
                    '?period=' +
                    month,
                )
              }}
            />
          </div>
          {options.isError ? (
            <ReportError
              error={options.error}
              retry={() => void options.refetch()}
            />
          ) : (
            <p className="lr-help">
              Belum ada kelompok dengan sesi pada periode ini. Pilih bulan lain
              atau tambahkan sesi melalui menu Jadwal.
            </p>
          )}
        </ReportPanel>
      </ReportShell>
    )
  if (!query.data)
    return (
      <ReportShell title="Isi Laporan Kelompok" form>
        {query.isError ? (
          <ReportPanel
            title="Kelompok & periode"
            description="Pilih kelompok yang tersedia pada periode laporan."
          >
            <div className="lr-fields">
              <ReportSelectionFields
                period={period}
                onChange={(id, month) => {
                  void navigate(
                    reportBase() +
                      (id ? '/' + id + '/edit' : '/new') +
                      '?period=' +
                      month,
                  )
                }}
              />
            </div>
            <ReportError
              error={query.error}
              retry={() => void query.refetch()}
            />
          </ReportPanel>
        ) : (
          <ReportLoading />
        )}
      </ReportShell>
    )
  const group = query.data
  const reload = () => {
    if (reloading) return
    setReloading(true)
    void query
      .refetch()
      .then((result) => {
        if (!result.isError) setEditorReset((value) => value + 1)
      })
      .finally(() => setReloading(false))
  }
  return (
    <ReportShell title="Isi Laporan Kelompok" form>
      {query.isError ? (
        <ReportError error={query.error} retry={() => void query.refetch()} />
      ) : null}
      <ReportEditor
        key={
          groupId +
          ':' +
          period +
          ':' +
          (params.get('tutor') ?? '') +
          ':' +
          editorReset
        }
        group={group}
        tutorId={params.get('tutor')}
        onReload={reload}
        reloading={reloading}
      />
    </ReportShell>
  )
}
function ReportEditor({
  group,
  tutorId,
  onReload,
  reloading,
}: {
  group: ReportGroupDetail
  tutorId: string | null
  onReload: () => void
  reloading: boolean
}) {
  // Preserve the editing baseline when a background refresh observes a publication.
  const [initial] = useState(
    () =>
      group.contributions.find((c) => c.tutorId === tutorId && c.canEdit) ??
      group.contributions.find((c) => c.canEdit),
  )
  const current = group.contributions.find(
    (c) => c.tutorId === initial?.tutorId,
  )
  const selected =
    initial && (initial.draft || !initial.published)
      ? {
          ...initial,
          live: current?.live ?? initial.live,
          attendance: current?.attendance ?? initial.attendance,
        }
      : current
  const period = group.period
  const navigate = useNavigate()
  return selected && (selected.draft || !selected.published) ? (
    <ReportForm
      group={group}
      contribution={selected}
      onReload={onReload}
      reloading={reloading}
    />
  ) : (
    <>
      <ReportBack period={period} />
      <header className="lr-heading">
        <div>
          <h1>{group.name}</h1>
          <p>{monthLabel(period)}</p>
        </div>
      </header>
      <ReportPanel
        title="Kelompok & periode"
        description="Pilih kelompok, periode, dan tentor di dalam form."
      >
        <div className="lr-fields">
          <ReportSelectionFields
            group={group}
            period={period}
            tutorId={selected?.tutorId}
            onChange={(id, month, tutor) => {
              void navigate(
                reportBase() +
                  '/' +
                  id +
                  '/edit?period=' +
                  month +
                  (tutor ? '&tutor=' + tutor : ''),
              )
            }}
          />
        </div>
        <p className="lr-help">
          {selected?.published
            ? 'Laporan tentor ini sudah terbit. Admin dapat membuka revisi melalui detail laporan.'
            : 'Tidak ada penugasan tentor yang dapat Anda isi pada periode ini.'}
        </p>
        <Button asChild variant="outline">
          <Link to={reportBase() + '/' + group.id + '?period=' + period}>
            Lihat detail laporan
          </Link>
        </Button>
      </ReportPanel>
    </>
  )
}
function ReportForm({
  group,
  contribution,
  onReload,
  reloading,
}: {
  group: ReportGroupDetail
  contribution: ReportContribution
  onReload: () => void
  reloading: boolean
}) {
  const draft = contribution.draft
  const [content, setContent] = useState<ReportContent>(
    () =>
      draft?.content ?? {
        material: '',
        progress: '',
        followUp: '',
        parentNote: '',
      },
  )
  const [notes, setNotes] = useState(() => draft?.notes ?? [])
  const [version, setVersion] = useState(contribution.version)
  const [reportId, setReportId] = useState(contribution.id)
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      content: draft?.content ?? {
        material: '',
        progress: '',
        followUp: '',
        parentNote: '',
      },
      notes: draft?.notes ?? [],
    }),
  )
  const [pendingNote, setPendingNote] = useState(false)
  const [validation, setValidation] = useState('')
  const [saved, setSaved] = useState(false)
  const safeLeave = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const navigate = useNavigate()
  const serialized = JSON.stringify({ content, notes })
  const dirty = serialized !== baseline || pendingNote
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !safeLeave.current &&
      dirty &&
      currentLocation.pathname + currentLocation.search !==
        nextLocation.pathname + nextLocation.search,
  )
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      if (!safeLeave.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  const mutation = useReportMutation(async (intent: 'save' | 'publish') => {
    let id = reportId
    let saveVersion = version
    if (!id) {
      const created = await createReport({
        studyGroupId: group.id,
        period: group.period,
        tutorId: contribution.tutorId,
      })
      if (created.version !== 1)
        throw new ApiError('Laporan telah berubah. Muat ulang data.', 409)
      id = created.id
      saveVersion = created.version
      setReportId(id)
      setVersion(saveVersion)
    }
    const result = await saveReport({
      id,
      version: saveVersion,
      ...content,
      notes,
    })
    setVersion(result.version)
    setBaseline(serialized)
    setSaved(true)
    if (intent === 'publish') {
      const published = await publishReport(result)
      if (mounted.current) {
        safeLeave.current = true
        void navigate(reportBase() + '/' + group.id + '?period=' + group.period)
      }
      return published
    }
    return result
  })
  const students = [
    ...new Map(
      (contribution.live?.sessions ?? [])
        .flatMap((s) => s.students)
        .map((student) => [student.id, student]),
    ).values(),
  ]
  const sessions = contribution.live?.sessions ?? []
  const attendanceComplete =
    sessions.length > 0 &&
    sessions.every(
      (s) =>
        s.status === 'completed' &&
        s.students.length > 0 &&
        s.students.every((student) => student.status !== null),
    )
  const publishable =
    attendanceComplete &&
    Boolean(
      content.material.trim() &&
      content.progress.trim() &&
      content.followUp.trim(),
    )
  function submit(intent: 'save' | 'publish', event?: FormEvent) {
    event?.preventDefault()
    if (mutation.isPending || reloading) return
    if (pendingNote) {
      setValidation(
        'Klik Tambah catatan siswa atau kosongkan catatan yang belum ditambahkan.',
      )
      return
    }
    if (notes.some((note) => !note.note.trim())) {
      setValidation(
        'Isi catatan siswa yang kosong atau hapus catatan tersebut.',
      )
      return
    }
    if (
      intent === 'publish' &&
      !window.confirm(
        'Terbitkan laporan ' +
          monthLabel(group.period) +
          '? Perubahan setelah terbit memerlukan revisi yang dibuka admin.',
      )
    )
      return
    setValidation('')
    setSaved(false)
    mutation.mutate(intent)
  }
  function move(groupId: string, period: string, tutorId?: string) {
    void navigate(
      reportBase() +
        '/' +
        groupId +
        '/edit?period=' +
        period +
        (tutorId ? '&tutor=' + tutorId : ''),
    )
  }
  return (
    <form
      aria-busy={mutation.isPending || reloading}
      onSubmit={(event) => submit('save', event)}
    >
      <ReportBack period={group.period} />
      <header className="lr-heading">
        <div>
          <h1>
            {contribution.revising
              ? 'Revisi Laporan Kelompok'
              : 'Buat Laporan Kelompok'}
          </h1>
          <p>
            Isi evaluasi untuk seluruh anggota kelompok dalam satu formulir.
          </p>
        </div>
      </header>
      <div className="lr-columns">
        <ReportPanel
          title="Kelompok & periode"
          description="Lengkapi kelompok, periode, dan evaluasi. Bagian bertanda * wajib saat diterbitkan."
        >
          <fieldset
            disabled={mutation.isPending || reloading}
            className="lr-fields"
          >
            <ReportSelectionFields
              group={group}
              period={group.period}
              tutorId={contribution.tutorId}
              onChange={move}
            />
            <p className="lr-help">
              {students.length} siswa · {contribution.live?.subject} ·{' '}
              {sessions.length} pertemuan pada {monthLabel(group.period)}
            </p>
            {(
              [
                { key: 'material', label: 'Materi pembelajaran bulan ini *' },
                {
                  key: 'progress',
                  label: 'Perkembangan & penguasaan konsep kelompok *',
                },
                {
                  key: 'followUp',
                  label: 'Hal yang perlu ditingkatkan & tindak lanjut *',
                },
                {
                  key: 'parentNote',
                  label: 'Catatan untuk orang tua (opsional)',
                },
              ] as const
            ).map((field) => (
              <div className="lr-field" key={field.key}>
                <label htmlFor={'report-' + field.key}>{field.label}</label>
                <textarea
                  id={'report-' + field.key}
                  rows={5}
                  maxLength={field.key === 'parentNote' ? 5000 : 10000}
                  value={content[field.key]}
                  onChange={(event) => {
                    setContent((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                    setSaved(false)
                  }}
                />
              </div>
            ))}
          </fieldset>
        </ReportPanel>
        <aside className="lr-sidebar">
          <ReportPanel
            title="Catatan per siswa"
            description="Opsional. Catatan khusus hanya disertakan pada PDF siswa yang dituju."
          >
            <ReportStudentNotes
              students={students}
              notes={notes}
              onChange={setNotes}
              onPendingChange={setPendingNote}
              disabled={mutation.isPending || reloading}
            />
          </ReportPanel>
          <ReportPanel
            title="Ringkasan Presensi"
            description={'Rekap sesi tentor selama ' + monthLabel(group.period)}
          >
            <AttendanceSummary value={contribution.attendance} />
          </ReportPanel>
        </aside>
      </div>
      <footer className="lr-form-actions">
        <div>
          {!attendanceComplete ? (
            <p>Lengkapi presensi seluruh sesi sebelum menerbitkan.</p>
          ) : (
            <p>Draft dapat disimpan sebelum seluruh evaluasi diisi.</p>
          )}
          {saved && !dirty ? (
            <p role="status">Draft berhasil disimpan.</p>
          ) : null}
        </div>
        <div className="lr-actions">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending || reloading}
            onClick={() => {
              void navigate(
                reportBase() + '/' + group.id + '?period=' + group.period,
              )
            }}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="outline"
            disabled={mutation.isPending || reloading}
          >
            {mutation.isPending ? 'Memproses...' : 'Simpan draft'}
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || reloading || !publishable}
            onClick={() => submit('publish')}
          >
            Terbitkan
          </Button>
        </div>
        {validation ? <p role="alert">{validation}</p> : null}
        {mutation.isError ? (
          <ReportError
            error={mutation.error}
            retry={() => {
              if (
                !dirty ||
                window.confirm(
                  'Muat ulang data dan tinggalkan perubahan yang belum disimpan?',
                )
              )
                onReload()
            }}
          />
        ) : null}
      </footer>
      {blocker.state === 'blocked' ? (
        <Dialog
          title="Tinggalkan perubahan?"
          description="Ada perubahan laporan yang belum disimpan."
          size="small"
          onDismiss={() => blocker.reset()}
        >
          <DialogBody>
            <p>Perubahan yang belum disimpan akan hilang.</p>
          </DialogBody>
          <DialogFooter>
            <DialogButton variant="outline" onClick={() => blocker.reset()}>
              Tetap mengisi
            </DialogButton>
            <DialogButton onClick={() => blocker.proceed()}>
              Tinggalkan
            </DialogButton>
          </DialogFooter>
        </Dialog>
      ) : null}
    </form>
  )
}

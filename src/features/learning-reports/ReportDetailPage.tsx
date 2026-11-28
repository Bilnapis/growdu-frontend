import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { getStoredAuthUser } from '@/lib/auth-session'
import {
  createReport,
  reviseReport,
  type ReportContribution,
  type ReportGroupDetail,
} from './api'
import { useReportGroup, useReportMutation } from './hooks'
import { dateLabel, monthLabel, reportBase, validPeriod } from './format'
import {
  AttendanceSummary,
  ReportBack,
  ReportBadge,
  ReportError,
  ReportLoading,
  ReportPanel,
  ReportPdfButton,
  ReportShell,
} from './ReportShared'

export function StartReportButton({
  group,
  contribution,
}: {
  group: ReportGroupDetail
  contribution: ReportContribution
}) {
  const navigate = useNavigate()
  const mutation = useReportMutation(createReport)
  return (
    <div>
      <Button
        disabled={mutation.isPending || !contribution.live?.sessions.length}
        onClick={() =>
          mutation.mutate(
            {
              studyGroupId: group.id,
              period: group.period,
              tutorId: contribution.tutorId,
            },
            {
              onSuccess: () => {
                void navigate(
                  reportBase() +
                    '/' +
                    group.id +
                    '/edit?period=' +
                    group.period +
                    '&tutor=' +
                    contribution.tutorId,
                )
              },
            },
          )
        }
      >
        {mutation.isPending ? 'Menyiapkan draft...' : 'Mulai draft'}
      </Button>
      {mutation.isError ? <ReportError error={mutation.error} /> : null}
    </div>
  )
}
function ReportRevisionDialog({
  contribution,
  onClose,
}: {
  contribution: ReportContribution
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const mutation = useReportMutation(reviseReport)
  return (
    <Dialog
      title="Buka Revisi Laporan"
      description="Versi terbit tetap tersedia sampai revisi baru diterbitkan."
      size="small"
      isPending={mutation.isPending}
      onDismiss={onClose}
    >
      <DialogForm
        onSubmit={(event) => {
          event.preventDefault()
          if (contribution.id)
            mutation.mutate(
              {
                id: contribution.id,
                version: contribution.version,
                reason: reason.trim(),
              },
              { onSuccess: onClose },
            )
        }}
      >
        <DialogBody>
          <p className="mb-4 text-sm font-semibold">{contribution.tutorName}</p>
          <div className="lr-field">
            <label htmlFor="report-revision-reason">Alasan revisi</label>
            <textarea
              id="report-revision-reason"
              required
              minLength={3}
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          {mutation.isError ? <ReportError error={mutation.error} /> : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Batal
          </DialogButton>
          <DialogButton
            type="submit"
            disabled={mutation.isPending || reason.trim().length < 3}
          >
            {mutation.isPending ? 'Membuka revisi...' : 'Buka revisi'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}
export function ReportDetailPage() {
  const { groupId = '' } = useParams()
  const [params] = useSearchParams()
  const period = validPeriod(params.get('period'))
  const query = useReportGroup(groupId, period)
  const [revision, setRevision] = useState<ReportContribution | null>(null)
  const [studentId, setStudentId] = useState('')
  const admin = getStoredAuthUser()?.role !== 'tutor'
  if (query.isPending)
    return (
      <ReportShell title="Detail Laporan">
        <ReportLoading />
      </ReportShell>
    )
  if (query.isError)
    return (
      <ReportShell title="Detail Laporan">
        <ReportError error={query.error} retry={() => void query.refetch()} />
      </ReportShell>
    )
  const group = query.data
  const students = [
    ...new Map(
      group.contributions
        .flatMap(
          (c) =>
            c.published?.snapshot?.sessions.flatMap((s) => s.students) ?? [],
        )
        .map((student) => [student.id, student]),
    ).values(),
  ]
  const notes = group.contributions.flatMap(
    (c) =>
      c.published?.notes.map((note) => ({
        ...note,
        tutorId: c.tutorId,
        tutorName: c.published?.snapshot?.tutorName ?? c.tutorName,
        studentName:
          c.published?.snapshot?.sessions
            .flatMap((s) => s.students)
            .find((s) => s.id === note.studentId)?.name ?? 'Siswa',
      })) ?? [],
  )
  return (
    <ReportShell title="Detail Laporan Kelompok">
      <div>
        <ReportBack period={period} />
        <header className="lr-heading">
          <div>
            <h1>Detail Laporan Kelompok</h1>
            <p>
              Laporan perkembangan dari setiap tentor untuk seluruh anggota
              kelompok.
            </p>
          </div>
          {group.published ? (
            <ReportPdfButton groupId={groupId} period={period} />
          ) : null}
        </header>
      </div>
      <section className="lr-metadata">
        <div>
          <span>Kelompok Belajar</span>
          <strong>{group.name}</strong>
        </div>
        <div>
          <span>Periode</span>
          <strong>{monthLabel(period)}</strong>
        </div>
        <div>
          <span>Cakupan</span>
          <strong>
            {group.studentCount} siswa · {group.sessionCount} sesi ·{' '}
            {group.required} tentor
          </strong>
        </div>
        <div>
          <span>Status</span>
          <ReportBadge status={group.status} />
          <small>
            {group.published}/{group.required} tentor terbit
          </small>
        </div>
      </section>
      <div className="lr-columns">
        <ReportPanel
          title="Laporan Perkembangan per Tentor"
          description="Materi, capaian, dan tindak lanjut yang diisi oleh masing-masing tentor."
        >
          <div className="lr-contributions">
            {group.contributions.map((contribution) => (
              <article className="lr-contribution" key={contribution.tutorId}>
                <div className="lr-row">
                  <div>
                    <h3>
                      {contribution.published?.snapshot?.tutorName ??
                        contribution.tutorName}
                    </h3>
                    <p>
                      {contribution.published?.snapshot?.subject ??
                        contribution.live?.subject}{' '}
                      · {contribution.attendance.sessions} pertemuan
                    </p>
                  </div>
                  <ReportBadge
                    status={
                      contribution.published
                        ? 'published'
                        : contribution.draft
                          ? 'draft'
                          : 'unfilled'
                    }
                  />
                </div>
                {contribution.revising ? (
                  <p className="lr-notice">
                    Revisi berlangsung. Versi terbit sebelumnya tetap tersedia.
                  </p>
                ) : null}
                {contribution.sourceChanged ? (
                  <p className="lr-notice">
                    Data sesi atau identitas berubah setelah terbit. Admin dapat
                    membuka revisi untuk memperbarui laporan.
                  </p>
                ) : null}
                {contribution.published ? (
                  <>
                    <p className="lr-help">
                      Versi {contribution.published.number} · Diterbitkan{' '}
                      {contribution.published.publishedAt
                        ? dateLabel(contribution.published.publishedAt)
                        : ''}
                    </p>
                    {(
                      [
                        [
                          'Materi pembelajaran',
                          contribution.published.content.material,
                        ],
                        [
                          'Perkembangan & penguasaan konsep',
                          contribution.published.content.progress,
                        ],
                        [
                          'Hal yang perlu ditingkatkan & tindak lanjut',
                          contribution.published.content.followUp,
                        ],
                        [
                          'Catatan untuk orang tua',
                          contribution.published.content.parentNote,
                        ],
                      ] as const
                    )
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div className="lr-readonly-field" key={label}>
                          <h4>{label}</h4>
                          <p>{value}</p>
                        </div>
                      ))}
                  </>
                ) : (
                  <p className="lr-help">
                    Laporan tentor ini belum diterbitkan.
                  </p>
                )}
                {contribution.canEdit ? (
                  <div className="lr-actions">
                    {contribution.draft ? (
                      <Button asChild variant="outline">
                        <Link
                          to={
                            reportBase() +
                            '/' +
                            groupId +
                            '/edit?period=' +
                            period +
                            '&tutor=' +
                            contribution.tutorId
                          }
                        >
                          {contribution.revising
                            ? 'Isi revisi'
                            : 'Lanjutkan draft'}
                        </Link>
                      </Button>
                    ) : !contribution.published ? (
                      <StartReportButton
                        group={group}
                        contribution={contribution}
                      />
                    ) : null}
                    {admin &&
                    contribution.published &&
                    !contribution.revising ? (
                      <Button
                        variant="outline"
                        onClick={() => setRevision(contribution)}
                      >
                        Buka revisi
                      </Button>
                    ) : null}
                  </div>
                ) : null}
                {contribution.history.length ? (
                  <details className="lr-history">
                    <summary>
                      Riwayat laporan ({contribution.history.length} versi)
                    </summary>
                    {contribution.history.map((item) => (
                      <p key={item.number}>
                        Versi {item.number} ·{' '}
                        {item.publishedAt ? dateLabel(item.publishedAt) : ''}
                      </p>
                    ))}
                    {contribution.events
                      .filter((item) => item.reason)
                      .map((item, index) => (
                        <p key={index}>
                          Revisi {item.revision}: {item.reason}
                        </p>
                      ))}
                  </details>
                ) : null}
              </article>
            ))}
          </div>
          {!group.contributions.length ? (
            <p>Belum ada sesi atau laporan pada periode ini.</p>
          ) : null}
        </ReportPanel>
        <aside className="lr-sidebar">
          <ReportPanel
            title="Catatan per siswa"
            description="Catatan hanya disertakan pada PDF siswa yang bersangkutan."
          >
            {notes.length ? (
              notes.map((note) => (
                <article
                  className="lr-note-card"
                  key={note.tutorId + note.studentId}
                >
                  <h3>{note.studentName}</h3>
                  <p>{note.note}</p>
                  <small>Oleh {note.tutorName}</small>
                </article>
              ))
            ) : (
              <p className="lr-help">
                Belum ada catatan khusus yang diterbitkan.
              </p>
            )}
          </ReportPanel>
          {students.length ? (
            <ReportPanel
              title="PDF per siswa"
              description="Evaluasi umum, presensi, dan catatan khusus siswa terpilih."
            >
              <div className="lr-field">
                <label htmlFor="report-pdf-student">Pilih siswa</label>
                <Select
                  id="report-pdf-student"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                >
                  <option value="">Pilih siswa...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} · {student.school} ·{' '}
                      {student.educationLevel}
                    </option>
                  ))}
                </Select>
              </div>
              {students.some((student) => student.id === studentId) ? (
                <ReportPdfButton
                  groupId={groupId}
                  period={period}
                  studentId={studentId}
                />
              ) : null}
            </ReportPanel>
          ) : null}
          {group.contributions
            .filter((c) => c.canEdit)
            .map((c) => (
              <ReportPanel
                key={c.tutorId}
                title={'Presensi · ' + c.tutorName}
                description="Data sesi saat ini. PDF menggunakan presensi saat laporan diterbitkan."
              >
                <AttendanceSummary value={c.attendance} />
              </ReportPanel>
            ))}
        </aside>
      </div>
      {revision ? (
        <ReportRevisionDialog
          contribution={revision}
          onClose={() => setRevision(null)}
        />
      ) : null}
    </ReportShell>
  )
}

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TutorPageHeader } from '@/components/TutorPageHeader'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getReportPdf, type ReportAttendance, type ReportStatus } from './api'
import { reportBase, reportError, reportLabels } from './format'
import './reports.css'

export function ReportShell({
  title,
  children,
  form = false,
}: {
  title: string
  children: ReactNode
  form?: boolean
}) {
  const tutor = getStoredAuthUser()?.role === 'tutor'
  return tutor ? (
    <main className="min-h-dvh bg-background">
      <TutorPageHeader title={title} backTo="/tutor/dashboard" />
      <div
        className={
          'learning-reports lr-tutor' + (form ? ' lr-form-content' : '')
        }
      >
        {children}
      </div>
    </main>
  ) : (
    <div className="learning-reports">{children}</div>
  )
}
export function ReportPanel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="lr-panel">
      <header>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </section>
  )
}
export function ReportBadge({ status }: { status: ReportStatus }) {
  return <span className={'lr-badge lr-' + status}>{reportLabels[status]}</span>
}
export function ReportError({
  error,
  retry,
}: {
  error: unknown
  retry?: () => void
}) {
  return (
    <div role="alert" className="lr-feedback">
      <p>{reportError(error)}</p>
      {retry ? (
        <Button type="button" variant="outline" onClick={retry}>
          Muat ulang
        </Button>
      ) : null}
    </div>
  )
}
export function ReportLoading() {
  return (
    <div role="status" className="lr-empty">
      <FileText aria-hidden="true" />
      <p>Memuat laporan perkembangan...</p>
    </div>
  )
}
export function AttendanceSummary({ value }: { value: ReportAttendance }) {
  return (
    <div className="lr-attendance">
      <div className="lr-row">
        <strong>Total {value.sessions} sesi</strong>
        <span>
          {value.percentage === null
            ? 'Belum ada presensi'
            : value.percentage.toLocaleString('id-ID') + '% hadir'}
        </span>
      </div>
      <progress
        aria-label="Persentase kehadiran"
        max={100}
        value={value.percentage ?? 0}
      />
      <div className="lr-counts">
        {(
          [
            ['Hadir', value.present],
            ['Izin', value.excused],
            ['Sakit', value.sick],
            ['Alpa', value.absent],
          ] as const
        ).map(([label, count]) => (
          <div key={label}>
            <strong>{count}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p>
        {value.present} kehadiran dari {value.recorded} presensi tercatat.
      </p>
      {value.pending ? (
        <p role="status">
          {value.pending} presensi siswa belum dicatat. Lengkapi melalui menu
          Jadwal sebelum menerbitkan.
        </p>
      ) : null}
    </div>
  )
}
export function ReportBack({ period }: { period: string }) {
  return (
    <Link className="lr-back" to={reportBase() + '?period=' + period}>
      ← Kembali ke daftar laporan
    </Link>
  )
}
export function ReportPdfButton({
  groupId,
  period,
  studentId,
}: {
  groupId: string
  period: string
  studentId?: string
}) {
  const mutation = useMutation({
    mutationFn: (request: {
      groupId: string
      period: string
      studentId?: string
    }) => getReportPdf(request.groupId, request.period, request.studentId),
    retry: false,
    onSuccess: (blob, request) => {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download =
        'laporan-' +
        request.period +
        '-' +
        (request.studentId ?? request.groupId) +
        '.pdf'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
  })
  return (
    <div>
      <Button
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ groupId, period, studentId })}
      >
        <Download size={16} aria-hidden="true" />
        {mutation.isPending
          ? 'Menyiapkan PDF...'
          : studentId
            ? 'Unduh PDF siswa'
            : 'Unduh PDF kelompok'}
      </Button>
      {mutation.isError ? <ReportError error={mutation.error} /> : null}
    </div>
  )
}

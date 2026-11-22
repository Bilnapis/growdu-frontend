import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCheck, FileText, Plus, Settings, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TablePagination } from '@/components/ui/table-pagination'
import { getStoredAuthUser } from '@/lib/auth-session'
import { generateReports, type ReportGroup } from './api'
import { isReportStatus, monthLabel, reportBase, validPeriod } from './format'
import {
  useReportGroups,
  useReportMutation,
  useReportSettings,
  useReportSummary,
} from './hooks'
import {
  ReportBadge,
  ReportError,
  ReportLoading,
  ReportShell,
} from './ReportShared'
import { ReportSettingsDialog } from './ReportSettingsDialog'

function ReportRowActions({ group }: { group: ReportGroup }) {
  return (
    <div className="lr-actions">
      <Button asChild variant="outline" size="sm">
        <Link to={reportBase() + '/' + group.id + '?period=' + group.period}>
          Lihat detail
        </Link>
      </Button>
    </div>
  )
}
export function ReportsListPage() {
  const [params, setParams] = useSearchParams()
  const period = validPeriod(params.get('period'))
  const rawStatus = params.get('status')
  const parsedPage = Number(params.get('page'))
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const list = useReportGroups({
    period,
    page,
    limit: 12,
    search: params.get('search') || undefined,
    status: isReportStatus(rawStatus) ? rawStatus : undefined,
  })
  const summary = useReportSummary(period)
  const admin = getStoredAuthUser()?.role !== 'tutor'
  const settings = useReportSettings(admin)
  const [showSettings, setShowSettings] = useState(false)
  const generation = useReportMutation(generateReports)
  function filter(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '1')
      return next
    })
  }
  return (
    <ReportShell title="Laporan Kelompok">
      <header className="lr-heading">
        <div>
          <h1>Laporan Perkembangan Belajar</h1>
          <p>
            Kelola materi, capaian, dan tindak lanjut belajar untuk setiap
            kelompok.
          </p>
        </div>
        <div className="lr-actions">
          {admin ? (
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings size={16} aria-hidden="true" />
              Pengaturan
            </Button>
          ) : null}
          <Button asChild>
            <Link to={reportBase() + '/new?period=' + period}>
              <Plus size={16} aria-hidden="true" />
              Buat laporan
            </Link>
          </Button>
        </div>
      </header>
      {summary.data ? (
        <div className="lr-metrics">
          {[
            [
              'Total Kelompok',
              summary.data.total + ' Kelompok',
              'Pada periode ' + monthLabel(period),
            ],
            [
              'Laporan Terbit',
              summary.data.published + ' Laporan',
              'Seluruh tentor sudah menerbitkan',
            ],
            [
              'Perlu Diselesaikan',
              summary.data.pending + ' Kelompok',
              'Belum diisi, draft, atau terbit sebagian',
            ],
          ].map(([label, value, description], index) => {
            const MetricIcon =
              index === 0 ? UsersRound : index === 1 ? CheckCheck : FileText
            return (
              <section className="lr-metric" key={String(label)}>
                <div>
                  <MetricIcon size={17} aria-hidden="true" />
                  <span>{String(label)}</span>
                </div>
                <strong>{String(value)}</strong>
                <p>{String(description)}</p>
              </section>
            )
          })}
        </div>
      ) : null}
      {summary.isError ? (
        <ReportError
          error={summary.error}
          retry={() => void summary.refetch()}
        />
      ) : null}
      <section className="lr-panel">
        <div className="lr-filters">
          <div className="lr-field">
            <label htmlFor="reports-search">Cari kelompok atau tentor</label>
            <Input
              id="reports-search"
              type="search"
              placeholder="Cari kelompok belajar atau tentor..."
              value={params.get('search') ?? ''}
              onChange={(event) => filter('search', event.target.value)}
              maxLength={100}
            />
          </div>
          <div className="lr-field">
            <label htmlFor="reports-period">Periode laporan</label>
            <Input
              id="reports-period"
              type="month"
              min="2000-01"
              max="2099-12"
              value={period}
              onChange={(event) => {
                if (event.target.value) filter('period', event.target.value)
              }}
            />
          </div>
          <div className="lr-field">
            <label htmlFor="reports-status">Status</label>
            <Select
              id="reports-status"
              value={rawStatus ?? ''}
              onChange={(event) => filter('status', event.target.value)}
            >
              <option value="">Semua status</option>
              <option value="unfilled">Belum diisi</option>
              <option value="draft">Draft</option>
              <option value="partially_published">Terbit sebagian</option>
              <option value="published">Terbit</option>
            </Select>
          </div>
        </div>
        <p className="lr-help">
          Satu laporan kelompok per periode, dengan evaluasi dari masing-masing
          tentor.
        </p>
        {list.isPending ? (
          <ReportLoading />
        ) : list.isError ? (
          <ReportError error={list.error} retry={() => void list.refetch()} />
        ) : !list.data.data.length ? (
          <div className="lr-empty">
            <FileText aria-hidden="true" />
            <h2>Belum ada kelompok pada pilihan ini</h2>
            <p>
              Periksa filter dan periode. Kelompok muncul setelah memiliki sesi
              belajar pada bulan tersebut.
            </p>
          </div>
        ) : (
          <>
            <div className="lr-table-wrap">
              <table className="lr-table">
                <thead>
                  <tr>
                    {[
                      'Periode',
                      'Kelompok Belajar',
                      'Anggota',
                      'Tentor',
                      'Status Laporan',
                      'Aksi',
                    ].map((label) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.data.data.map((group) => (
                    <tr key={group.id}>
                      <td>{monthLabel(group.period)}</td>
                      <td>
                        <strong>{group.name}</strong>
                        <small>{group.sessionCount} pertemuan</small>
                      </td>
                      <td>{group.studentCount} siswa</td>
                      <td>{group.tutorNames}</td>
                      <td>
                        <ReportBadge status={group.status} />
                        <small>
                          {group.published}/{group.required} tentor terbit
                        </small>
                      </td>
                      <td>
                        <ReportRowActions group={group} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lr-mobile-cards">
              {list.data.data.map((group) => (
                <article key={group.id} className="lr-group-card">
                  <h2>{group.name}</h2>
                  <p>
                    {group.studentCount} siswa · {group.tutorNames}
                  </p>
                  <div className="lr-row">
                    <ReportBadge status={group.status} />
                    <small>
                      {group.published}/{group.required} tentor
                    </small>
                  </div>
                  <ReportRowActions group={group} />
                </article>
              ))}
            </div>
            <TablePagination
              meta={list.data.meta}
              itemLabel="kelompok belajar"
              ariaLabel="Halaman laporan"
              onPageChange={(value) =>
                setParams((current) => {
                  const next = new URLSearchParams(current)
                  next.set('page', String(value))
                  return next
                })
              }
            />
          </>
        )}
      </section>
      {admin ? (
        <div className="lr-automation">
          <div>
            <strong>Draft otomatis bulanan</strong>
            {settings.data ? (
              <p>
                {settings.data.enabled
                  ? 'Setiap tanggal ' +
                    settings.data.generationDay +
                    ' pukul 00.00 WIB untuk laporan bulan sebelumnya.'
                  : 'Otomatisasi sedang dinonaktifkan.'}
              </p>
            ) : null}
            <p>
              Buat draft periode hanya menambahkan laporan yang belum tersedia.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={generation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  'Buat seluruh draft yang belum tersedia untuk ' +
                    monthLabel(period) +
                    '?',
                )
              )
                generation.mutate(period)
            }}
          >
            {generation.isPending ? 'Membuat draft...' : 'Buat draft periode'}
          </Button>
        </div>
      ) : null}
      {generation.isSuccess ? (
        <p role="status" className="lr-feedback">
          {generation.data.created} draft dibuat. {generation.data.skipped}{' '}
          laporan sudah tersedia dan dilewati.
        </p>
      ) : null}
      {generation.isError ? <ReportError error={generation.error} /> : null}
      {admin && settings.isError ? (
        <ReportError
          error={settings.error}
          retry={() => void settings.refetch()}
        />
      ) : null}
      {showSettings && settings.data ? (
        <ReportSettingsDialog
          settings={settings.data}
          onClose={() => setShowSettings(false)}
        />
      ) : null}
      {showSettings && settings.isPending ? <ReportLoading /> : null}
    </ReportShell>
  )
}

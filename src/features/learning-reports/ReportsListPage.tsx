import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CheckCheck,
  Eye,
  FileText,
  Plus,
  Settings,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { TablePagination } from '@/components/ui/table-pagination'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
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

const pageSize = 12
const cellClass = 'px-[18px] py-3'
const secondaryClass = 'mt-1 block text-xs font-medium text-muted-foreground'

function ReportRowActions({ group }: { group: ReportGroup }) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-primary-text"
    >
      <Link
        to={reportBase() + '/' + group.id + '?period=' + group.period}
        aria-label={`Lihat detail laporan ${group.name}`}
        title={`Lihat detail laporan ${group.name}`}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
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
    limit: pageSize,
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
      <Card className="min-w-0 min-h-[560px] p-4 shadow-none sm:p-[18px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <Label htmlFor="reports-search" className="sr-only">
              Cari kelompok atau tentor
            </Label>
            <DebouncedSearchInput
              id="reports-search"
              placeholder="Cari kelompok belajar atau tentor..."
              value={params.get('search') ?? ''}
              onSearch={(search) => filter('search', search)}
              maxLength={100}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:flex">
            <div className="min-w-0 md:flex-none">
              <Label htmlFor="reports-period" className="sr-only">
                Periode laporan
              </Label>
              <Input
                id="reports-period"
                type="month"
                className="h-10 text-[13px] font-semibold"
                min="2000-01"
                max="2099-12"
                value={period}
                onChange={(event) => {
                  if (event.target.value) filter('period', event.target.value)
                }}
              />
            </div>
            <div className="min-w-0 md:min-w-40 md:flex-none">
              <Label htmlFor="reports-status" className="sr-only">
                Status laporan
              </Label>
              <Select
                id="reports-status"
                className="h-10 text-[13px] font-semibold"
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
        </div>
        <p className="lr-help">
          Satu laporan kelompok per periode, dengan evaluasi dari masing-masing
          tentor.
        </p>
        {list.isError ? (
          <ReportError error={list.error} retry={() => void list.refetch()} />
        ) : null}
        {list.isPending || list.data ? (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel laporan, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="lr-list-table w-full min-w-[900px] border-collapse text-left text-[13px]">
                <caption className="sr-only">
                  Daftar laporan perkembangan belajar kelompok
                </caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    {[
                      'Periode',
                      'Kelompok Belajar',
                      'Anggota',
                      'Tentor',
                      'Status Laporan',
                      'Aksi',
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className={
                          label === 'Aksi'
                            ? 'px-3 font-bold'
                            : 'px-[18px] font-bold'
                        }
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={list.isPending}
                >
                  {list.isPending ? (
                    <TableSkeletonRows
                      columns={6}
                      rows={pageSize}
                      label="Memuat daftar laporan..."
                    />
                  ) : null}
                  {list.data?.data.map((group) => (
                    <tr
                      key={group.id}
                      className="h-[70px] bg-card text-[13px] font-medium leading-[1.3] text-foreground"
                    >
                      <td className={`${cellClass} whitespace-nowrap`}>
                        {monthLabel(group.period)}
                      </td>
                      <th
                        scope="row"
                        className={`${cellClass} min-w-[180px] font-bold`}
                      >
                        {group.name}
                        <small className={secondaryClass}>
                          {group.sessionCount} pertemuan
                        </small>
                      </th>
                      <td className={`${cellClass} whitespace-nowrap`}>
                        {group.studentCount} siswa
                      </td>
                      <td
                        className={`${cellClass} min-w-[160px] max-w-[240px] break-words`}
                      >
                        {group.tutorNames}
                      </td>
                      <td className={cellClass}>
                        <ReportBadge status={group.status} />
                        <small className={secondaryClass}>
                          {group.published}/{group.required} tentor terbit
                        </small>
                      </td>
                      <td className="px-3 py-3">
                        <ReportRowActions group={group} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.data && list.data.data.length === 0 ? (
              <div className="lr-empty">
                <FileText aria-hidden="true" />
                <h2>Belum ada kelompok pada pilihan ini</h2>
                <p>
                  Periksa filter dan periode. Kelompok muncul setelah memiliki
                  sesi belajar pada bulan tersebut.
                </p>
              </div>
            ) : null}
            {list.data && list.data.data.length > 0 ? (
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
            ) : null}
          </>
        ) : null}
      </Card>
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

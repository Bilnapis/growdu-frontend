import { useRef, useState } from 'react'
import { Megaphone, Pencil, Trash2 } from 'lucide-react'
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TableRowActions } from '@/components/ui/table-row-actions'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import { TablePagination } from '@/components/ui/table-pagination'
import type { Announcement, AnnouncementStatus } from '../api/announcements-api'
import {
  useAnnouncementMutations,
  useAnnouncements,
} from '../hooks/use-announcements'
import {
  announcementErrorMessage,
  formatAnnouncementDate,
  isAnnouncementTarget,
  targetLabels,
} from '../utils/announcements'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { AddButton } from '@/components/ui/add-button'

const PAGE_SIZE = 5

const statusLabels: Record<AnnouncementStatus, string> = {
  active: 'Aktif',
  scheduled: 'Terjadwal',
  draft: 'Draft',
  expired: 'Berakhir',
}
const statusColors: Record<AnnouncementStatus, string> = {
  active: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  scheduled: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  draft: 'bg-muted text-muted-foreground',
  expired: 'bg-muted text-muted-foreground',
}

export function AnnouncementManagement() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationSearch = location.search
  const state: unknown = location.state
  const targetRef = useRef<HTMLSelectElement>(null)
  const pageValue = Number(params.get('page') ?? 1)
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const search = params.get('search')?.trim().slice(0, 100) || undefined
  const requestedTarget = params.get('targetRole')
  const targetRole = isAnnouncementTarget(requestedTarget)
    ? requestedTarget
    : undefined
  const query = useAnnouncements({ page, limit: PAGE_SIZE, search, targetRole })
  const [deleting, setDeleting] = useState<Announcement | null>(null)
  const flash =
    typeof state === 'object' &&
    state !== null &&
    'announcementFlash' in state &&
    typeof state.announcementFlash === 'string'
      ? state.announcementFlash
      : null

  function setFilter(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[26px] font-bold leading-tight tracking-normal text-[var(--color-text)]">
            Pengumuman
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Buat pengumuman untuk Admin, Tentor, Siswa/Wali, atau Semua role
          </p>
        </div>
        <AddButton
          onClick={() => void navigate(`/announcements/new${locationSearch}`)}
        >
          Buat Pengumuman
        </AddButton>
      </header>
      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-3 text-sm text-[var(--color-success)]"
        >
          {flash}
        </p>
      ) : null}
      <section
        aria-label="Daftar pengumuman"
        aria-busy={query.isPending}
        className="mt-5 min-h-[560px] rounded-lg border bg-card p-4 text-card-foreground shadow-none sm:p-[18px]"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <AnnouncementSearch
            initialValue={search ?? ''}
            onSearch={(value) => setFilter('search', value)}
          />
          <label className="sr-only" htmlFor="announcement-role-filter">
            Filter target role
          </label>
          <select
            ref={targetRef}
            id="announcement-role-filter"
            value={targetRole ?? ''}
            onChange={(event) => setFilter('targetRole', event.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Semua target</option>
            {Object.entries(targetLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {query.isError ? (
          <div role="alert" className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {announcementErrorMessage(query.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void query.refetch()}
            >
              Coba lagi
            </Button>
          </div>
        ) : !query.isPending && !query.data?.data.length ? (
          <div className="py-16 text-center">
            <Megaphone
              className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="font-bold">
              {search || targetRole || page > 1
                ? 'Pengumuman tidak ditemukan'
                : 'Belum ada pengumuman'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {search || targetRole
                ? 'Coba ubah pencarian atau filter target.'
                : 'Buat pengumuman pertama untuk bimbel Anda.'}
            </p>
            {page > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setFilter('page', '1')}
              >
                Kembali ke halaman pertama
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel pengumuman, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar pengumuman bimbel</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    <th scope="col" className="px-[18px] font-bold">
                      Judul
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Target
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Status
                    </th>
                    <th scope="col" className="px-[18px] font-bold">
                      Tampil
                    </th>
                    <th scope="col" className="px-3 font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={query.isPending}
                >
                  {query.isPending ? (
                    <TableSkeletonRows
                      columns={5}
                      rows={PAGE_SIZE}
                      label="Memuat daftar pengumuman..."
                    />
                  ) : null}
                  {query.data?.data.map((announcement) => (
                    <tr
                      key={announcement.id}
                      className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                    >
                      <th
                        scope="row"
                        className="min-w-[300px] max-w-[380px] px-[18px] py-3 font-normal"
                      >
                        <p className="break-words font-bold">
                          {announcement.title}
                        </p>
                        <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">
                          {announcement.content}
                        </p>
                      </th>
                      <td className="min-w-[120px] px-[18px] py-3 font-semibold">
                        {targetLabels[announcement.targetRole]}
                      </td>
                      <td className="px-[18px] py-3">
                        <Status status={announcement.status} />
                      </td>
                      <td className="min-w-[240px] px-[18px] py-3 font-medium">
                        <Schedule announcement={announcement} />
                      </td>
                      <td className="relative px-3 py-3">
                        <Actions
                          announcement={announcement}
                          search={locationSearch}
                          onDelete={() => {
                            setDeleting(announcement)
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {query.data && query.data.data.length > 0 ? (
          <TablePagination
            meta={query.data.meta}
            itemLabel="pengumuman"
            ariaLabel="Halaman pengumuman"
            onPageChange={(value) => setFilter('page', String(value))}
          />
        ) : null}
      </section>
      {deleting ? (
        <DeleteAnnouncement
          announcement={deleting}
          onDismiss={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null)
            const next = new URLSearchParams(params)
            if (query.data?.data.length === 1 && page > 1)
              next.set('page', String(page - 1))
            void navigate(
              { pathname: '/announcements', search: next.toString() },
              {
                replace: true,
                state: { announcementFlash: 'Pengumuman berhasil dihapus.' },
              },
            )
          }}
        />
      ) : null}
    </div>
  )
}

function AnnouncementSearch({
  initialValue,
  onSearch,
}: {
  initialValue: string
  onSearch: (value: string) => void
}) {
  return (
    <div className="min-w-0 flex-1">
      <label className="sr-only" htmlFor="announcement-search">
        Cari judul pengumuman
      </label>
      <DebouncedSearchInput
        id="announcement-search"
        maxLength={100}
        value={initialValue}
        placeholder="Cari judul pengumuman..."
        onSearch={onSearch}
      />
    </div>
  )
}

function Status({ status }: { status: AnnouncementStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

function Schedule({ announcement }: { announcement: Announcement }) {
  return (
    <>
      <p>Mulai: {formatAnnouncementDate(announcement.startsAt)}</p>
      <p>Akhir: {formatAnnouncementDate(announcement.endsAt)}</p>
    </>
  )
}

function Actions({
  announcement,
  search,
  onDelete,
}: {
  announcement: Announcement
  search: string
  onDelete: () => void
}) {
  return (
    <TableRowActions
      label={announcement.title}
      actions={[
        {
          label: 'Ubah data',
          icon: Pencil,
          to: `/announcements/${announcement.id}/edit${search}`,
        },
        { label: 'Hapus', icon: Trash2, tone: 'danger', onSelect: onDelete },
      ]}
    />
  )
}

function DeleteAnnouncement({
  announcement,
  onDismiss,
  onDeleted,
}: {
  announcement: Announcement
  onDismiss: () => void
  onDeleted: () => void
}) {
  const { remove } = useAnnouncementMutations()
  const submitting = useRef(false)
  return (
    <Dialog
      title="Hapus Pengumuman?"
      isPending={remove.isPending}
      onDismiss={onDismiss}
      returnFocusSelector="[data-announcement-trigger]"
    >
      <DialogForm
        onSubmit={(event) => {
          event.preventDefault()
          if (submitting.current || remove.isPending) return
          submitting.current = true
          remove.mutate(announcement.id, {
            onSuccess: onDeleted,
            onSettled: () => {
              submitting.current = false
            },
          })
        }}
      >
        <DialogBody>
          <p className="mt-3 break-words text-sm text-muted-foreground">
            Pengumuman “{announcement.title}” akan dihapus permanen dan tidak
            lagi tampil di dashboard penerima.
          </p>
          {remove.isError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {announcementErrorMessage(
                remove.error,
                'Pengumuman gagal dihapus. Silakan coba lagi.',
              )}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            disabled={remove.isPending}
            onClick={onDismiss}
            autoFocus
          >
            Batal
          </DialogButton>
          <DialogButton
            type="submit"
            variant="destructive"
            disabled={remove.isPending}
          >
            {remove.isPending ? 'Menghapus...' : 'Hapus Pengumuman'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}

import { useRef, useState } from 'react'
import { Megaphone, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
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
import { AnnouncementDialog } from './AnnouncementDialog'
import { AnnouncementPagination } from './AnnouncementPagination'
import { AddButton } from '@/components/ui/add-button'

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
  const query = useAnnouncements({ page, limit: 5, search, targetRole })
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
        <div>
          <h1 className="text-[26px] font-extrabold leading-[1.3]">
            Pengumuman
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
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
        className="min-h-[32rem] rounded-lg border bg-card p-[18px]"
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
        {query.isPending ? (
          <div role="status" className="mt-4 grid gap-3">
            <span className="sr-only">Memuat daftar pengumuman...</span>
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : query.isError ? (
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
        ) : !query.data?.data.length ? (
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
            <div className="mt-[14px] hidden md:block">
              <table className="w-full table-fixed text-left text-[13px]">
                <caption className="sr-only">Daftar pengumuman bimbel</caption>
                <thead className="h-[42px] bg-background text-xs text-muted-foreground">
                  <tr>
                    <th
                      scope="col"
                      className="w-[40%] rounded-l-md px-3 font-bold"
                    >
                      Judul
                    </th>
                    <th scope="col" className="w-[13%] px-3 font-bold">
                      Target
                    </th>
                    <th scope="col" className="w-[13%] px-3 font-bold">
                      Status
                    </th>
                    <th scope="col" className="w-[26%] px-3 font-bold">
                      Tampil
                    </th>
                    <th
                      scope="col"
                      className="w-[8%] rounded-r-md px-3 font-bold"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((announcement) => (
                    <tr
                      key={announcement.id}
                      className="h-[96px] border-b last:border-b-0"
                    >
                      <th scope="row" className="px-3 py-4 font-normal">
                        <p className="break-words font-bold">
                          {announcement.title}
                        </p>
                        <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">
                          {announcement.content}
                        </p>
                      </th>
                      <td className="px-3 py-4 font-semibold">
                        {targetLabels[announcement.targetRole]}
                      </td>
                      <td className="px-3 py-4">
                        <Status status={announcement.status} />
                      </td>
                      <td className="px-3 py-4 text-xs leading-relaxed text-muted-foreground">
                        <Schedule announcement={announcement} />
                      </td>
                      <td className="px-3 py-4">
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
            <div className="mt-4 grid gap-3 md:hidden">
              {query.data.data.map((announcement) => (
                <article
                  key={announcement.id}
                  className="min-w-0 rounded-lg border p-4"
                >
                  <header className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words text-sm font-bold">
                      {announcement.title}
                    </h2>
                    <Actions
                      announcement={announcement}
                      search={locationSearch}
                      onDelete={() => {
                        setDeleting(announcement)
                      }}
                    />
                  </header>
                  <p className="mt-2 line-clamp-2 break-words text-[13px] text-muted-foreground">
                    {announcement.content}
                  </p>
                  <div className="my-3 flex items-center gap-3 text-xs">
                    <span className="font-semibold">
                      {targetLabels[announcement.targetRole]}
                    </span>
                    <Status status={announcement.status} />
                  </div>
                  <div className="text-xs leading-relaxed text-muted-foreground">
                    <Schedule announcement={announcement} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        {query.data ? (
          <>
            <div className="mt-4 text-xs text-muted-foreground">
              {query.data.meta.total} pengumuman
            </div>
            <AnnouncementPagination
              page={page}
              totalPages={query.data.meta.totalPages}
              onChange={(value) => setFilter('page', String(value))}
            />
          </>
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
    <details
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.currentTarget.open = false
          event.currentTarget.querySelector('summary')?.focus()
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          event.currentTarget.open = false
      }}
    >
      <summary
        aria-label={`Aksi ${announcement.title}`}
        className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 grid w-40 rounded-lg border bg-card p-1 shadow-md">
        <Link
          to={`/announcements/${announcement.id}/edit${search}`}
          onClick={(event) => {
            const details = event.currentTarget.closest('details')
            details?.querySelector('summary')?.focus()
            details?.removeAttribute('open')
          }}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Ubah
        </Link>
        <button
          type="button"
          onClick={(event) => {
            const details = event.currentTarget.closest('details')
            details?.querySelector('summary')?.focus()
            details?.removeAttribute('open')
            onDelete()
          }}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Hapus
        </button>
      </div>
    </details>
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
    <AnnouncementDialog
      pending={remove.isPending}
      onDismiss={onDismiss}
      labelledBy="announcement-delete-title"
    >
      <h2 id="announcement-delete-title" className="text-xl font-bold">
        Hapus Pengumuman?
      </h2>
      <p className="mt-3 break-words text-sm text-muted-foreground">
        Pengumuman “{announcement.title}” akan dihapus permanen dan tidak lagi
        tampil di dashboard penerima.
      </p>
      {remove.isError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {announcementErrorMessage(
            remove.error,
            'Pengumuman gagal dihapus. Silakan coba lagi.',
          )}
        </p>
      ) : null}
      <footer className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={remove.isPending}
          onClick={onDismiss}
          autoFocus
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={remove.isPending}
          onClick={() => {
            if (submitting.current) return
            submitting.current = true
            remove.mutate(announcement.id, {
              onSuccess: onDeleted,
              onSettled: () => {
                submitting.current = false
              },
            })
          }}
        >
          {remove.isPending ? 'Menghapus...' : 'Hapus Pengumuman'}
        </Button>
      </footer>
    </AnnouncementDialog>
  )
}

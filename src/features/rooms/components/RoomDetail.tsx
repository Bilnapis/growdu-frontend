import { DetailBackLink } from '@/components/ui/detail-back-link'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RoomSchedule } from '@/features/rooms/api/rooms-api'
import { useRoom } from '@/features/rooms/hooks/use-rooms'
import { ApiError } from '@/services/api-client'
import { RoomActionDialog } from './RoomActionDialog'
import { RoomForm } from './RoomForm'

const dayNames = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

export function RoomDetail({ id }: { id: string }) {
  const query = useRoom(id)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  if (query.isPending) {
    return (
      <div
        className="space-y-5"
        role="status"
        aria-label="Memuat detail ruangan"
      >
        <div className="h-[68px] animate-pulse rounded-lg bg-muted" />
        <div className="w-full max-w-[840px] space-y-5">
          <div className="h-[88px] animate-pulse rounded-lg bg-muted" />
          <div className="h-[260px] animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (!query.data) {
    const status = query.error instanceof ApiError ? query.error.status : 0
    return (
      <section
        role="alert"
        className="max-w-[840px] rounded-lg border border-[var(--color-border)] bg-white p-6"
      >
        <h1 className="text-xl font-bold">
          {status === 404
            ? 'Ruangan tidak ditemukan.'
            : status === 401 || status === 403
              ? 'Anda tidak memiliki akses ke ruangan ini.'
              : 'Detail ruangan belum dapat dimuat.'}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/rooms">Kembali ke Data Ruangan</Link>
          </Button>
          {status !== 404 && status !== 401 && status !== 403 ? (
            <Button onClick={() => void query.refetch()}>Coba lagi</Button>
          ) : null}
        </div>
      </section>
    )
  }

  const room = query.data
  return (
    <div className="min-w-0 space-y-5 text-[var(--color-text)]">
      <div>
        <DetailBackLink to="/rooms">Kembali ke data ruangan</DetailBackLink>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-[1.35]">
              Detail Ruangan: {room.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Hapus
            </Button>
          </div>
        </header>
      </div>

      <div className="w-full max-w-[840px] space-y-5">
        <section
          aria-label="Profil ruangan"
          className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-white p-5"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold leading-[1.35]">
                {room.name} ({room.code})
              </h2>
              <Badge
                variant={room.status === 'active' ? 'success' : 'secondary'}
              >
                {room.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
            <p className="mt-1 text-[13px] leading-[1.35] text-[var(--color-muted)]">
              Kapasitas: {room.capacity} Siswa
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
          <h2 className="text-base font-bold leading-[1.35]">
            Kelompok Belajar di Ruangan Ini ({room.studyGroups.length} Kelompok)
          </h2>
          {room.studyGroups.length === 0 ? (
            <p className="mt-3.5 rounded-md bg-[var(--color-gray-50)] px-3.5 py-4 text-[13px] text-[var(--color-muted)]">
              Belum ada kelompok belajar aktif yang menggunakan ruangan ini.
            </p>
          ) : (
            <div className="mt-3.5 space-y-2">
              {room.studyGroups.map((group) => (
                <article
                  key={group.id}
                  className="flex flex-col gap-2 rounded-md bg-[var(--color-gray-50)] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-[1.35]">
                      {group.name}
                    </h3>
                    <p className="mt-0.5 break-words text-xs leading-[1.35] text-[var(--color-muted)]">
                      {formatSchedules(group.schedules)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold leading-[1.35]">
                    {group.studentCount} / {room.capacity} Siswa
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {editOpen ? (
        <RoomForm room={room} onClose={() => setEditOpen(false)} />
      ) : null}

      {deleteOpen ? (
        <RoomActionDialog
          room={room}
          action="delete"
          onClose={() => setDeleteOpen(false)}
        />
      ) : null}
    </div>
  )
}

function formatSchedules(schedules: RoomSchedule[]) {
  if (schedules.length === 0) return 'Jadwal belum tersedia'

  const grouped = new Map<
    string,
    { tutorName: string; startTime: string; endTime: string; days: number[] }
  >()

  for (const schedule of schedules) {
    const key = `${schedule.tutorId}-${schedule.startTime}-${schedule.endTime}`
    const current = grouped.get(key)
    if (current) {
      current.days.push(schedule.dayOfWeek)
      continue
    }
    grouped.set(key, {
      tutorName: schedule.tutorName,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      days: [schedule.dayOfWeek],
    })
  }

  return [...grouped.values()]
    .map(({ tutorName, startTime, endTime, days }) => {
      const scheduleDays = [...new Set(days)]
        .sort((first, second) => first - second)
        .map((day) => dayNames[day - 1] ?? 'Hari tidak diketahui')
        .join(' & ')
      return `Tentor: ${tutorName} · ${scheduleDays} (${startTime} - ${endTime})`
    })
    .join(' · ')
}

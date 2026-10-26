import { CalendarDays, DoorOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  sessionDateLabel,
  type SessionListItem,
} from '@/features/class-sessions/api'

type TutorScheduleCardProps = {
  session: SessionListItem
}

export function TutorScheduleCard({ session }: TutorScheduleCardProps) {
  const status = getScheduleStatus(session.status)
  const actionLabel =
    session.status === 'completed' ||
    session.status === 'cancelled' ||
    session.lockedAt
      ? 'Lihat Sesi'
      : 'Mulai Presensi'

  return (
    <article className="rounded-xl bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold">
            {session.studyGroupName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {sessionDateLabel(session.sessionDate)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="my-3.5 border-t" />

      <div className="grid gap-3">
        <ScheduleInfo
          icon={CalendarDays}
          label="Waktu"
          value={`${formatTime(session.startTime)} – ${formatTime(session.endTime)} WIB`}
        />
        <ScheduleInfo
          icon={DoorOpen}
          label="Ruang"
          value={`${session.roomName ?? 'Belum ditentukan'} • ${session.studentCount} siswa`}
        />
      </div>

      <Button asChild size="sm" className="mt-4 w-full">
        <Link
          to={`/tutor/sessions/${session.id}/record?step=attendance`}
          aria-label={`${actionLabel} untuk ${session.studyGroupName}`}
        >
          {actionLabel}
        </Link>
      </Button>
    </article>
  )
}

function ScheduleInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex gap-2">
      <Icon
        className="mt-0.5 h-[18px] w-[18px] shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-semibold">{value}</p>
      </div>
    </div>
  )
}

function getScheduleStatus(status: 'scheduled' | 'completed' | 'cancelled') {
  if (status === 'completed') {
    return {
      label: 'Selesai',
      className: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    }
  }

  if (status === 'cancelled') {
    return {
      label: 'Dibatalkan',
      className: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    }
  }

  return {
    label: 'Belum selesai',
    className: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  }
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTutors } from '@/features/tutors/hooks/use-tutors'
import { useRooms } from '@/features/rooms/hooks/use-rooms'
import { ApiError } from '@/services/api-client'
import {
  useSession,
  useOverrideSession,
  sessionDateLabel,
  type ClassSession,
} from './api'

export function SessionDetailPage() {
  const { id = '' } = useParams()
  const query = useSession(id)
  if (query.isPending) return <p role="status">Memuat sesi...</p>
  if (query.isError)
    return (
      <div role="alert">
        Sesi tidak dapat dimuat.
        <Button onClick={() => void query.refetch()}>Coba lagi</Button>
      </div>
    )
  return (
    <SessionDetail
      key={query.data.id + ':' + query.data.version}
      session={query.data}
    />
  )
}
function SessionDetail({ session: s }: { session: ClassSession }) {
  const [date, setDate] = useState(s.sessionDate),
    [start, setStart] = useState(s.startTime),
    [end, setEnd] = useState(s.endTime)
  const [tutor, setTutor] = useState(s.tutorId),
    [room, setRoom] = useState(s.roomId ?? ''),
    [reason, setReason] = useState('')
  const [cancel, setCancel] = useState(false)
  const mutation = useOverrideSession(s.id)
  const tutors = useTutors({ page: 1, limit: 100, status: 'active' })
  const rooms = useRooms({ page: 1, limit: 100, status: 'active' })
  function submit(e: FormEvent) {
    e.preventDefault()
    if (mutation.isPending) return
    mutation.mutate({
      version: s.version,
      reason,
      sessionDate: date,
      startTime: start,
      endTime: end,
      tutorId: tutor,
      roomId: room || undefined,
      ...(cancel ? { status: 'cancelled' as const } : {}),
    })
  }
  return (
    <div className="space-y-5">
      <Link to="/schedule" className="underline">
        Kembali ke jadwal
      </Link>
      <h1 className="text-2xl font-bold">{s.studyGroupName}</h1>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-bold">Informasi Sesi Pertemuan</h2>
        <p className="mt-2">
          {sessionDateLabel(s.sessionDate)} · {s.startTime}–{s.endTime} WIB
        </p>
        <p>
          {s.tutorName} · {s.roomName ?? 'Belum ada ruangan'}
        </p>
        <p className="mt-2">
          {s.status === 'completed'
            ? 'Presensi tersimpan'
            : s.status === 'cancelled'
              ? 'Dibatalkan'
              : 'Belum presensi'}
          {s.lockedAt ? ' · Terkunci' : ''}
        </p>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-bold">Materi & Catatan Sesi Pertemuan</h2>
        <p className="mt-3 whitespace-pre-wrap">
          {s.topic ?? 'Belum ada topik'}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {s.tutorNote ?? 'Belum ada catatan'}
        </p>
        <Button asChild className="mt-4">
          <Link to={`/schedule/${s.id}/record?step=attendance`}>
            {s.status === 'completed'
              ? 'Koreksi Presensi & Catatan'
              : 'Isi Presensi & Catatan'}
          </Link>
        </Button>
      </section>
      <section className="overflow-x-auto rounded-lg border bg-card p-5">
        <h2 className="mb-3 font-bold">Data Presensi Siswa</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-2">Siswa</th>
              <th className="p-2">Sekolah</th>
              <th className="p-2">Presensi</th>
              <th className="p-2">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {s.students.map((student) => (
              <tr key={student.studentId} className="border-t">
                <th className="p-2 font-medium" scope="row">
                  {student.name}
                </th>
                <td className="p-2">{student.school}</td>
                <td className="p-2">
                  {student.status
                    ? {
                        present: 'Hadir',
                        excused: 'Izin',
                        sick: 'Sakit',
                        absent: 'Alpha',
                      }[student.status]
                    : 'Belum diisi'}
                </td>
                <td className="p-2">{student.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {s.status === 'scheduled' && !s.lockedAt ? (
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-lg border bg-card p-5 sm:grid-cols-2"
        >
          <h2 className="font-bold sm:col-span-2">Ubah satu sesi</h2>
          <label>
            Tanggal
            <input
              required
              className="mt-1 block w-full rounded border p-2"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Tentor
            <select
              className="mt-1 block w-full rounded border p-2"
              value={tutor}
              onChange={(e) => setTutor(e.target.value)}
            >
              <option value={s.tutorId}>{s.tutorName}</option>
              {tutors.data?.data
                .filter((t) => t.id !== s.tutorId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Jam mulai
            <input
              required
              className="mt-1 block w-full rounded border p-2"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Jam selesai
            <input
              required
              className="mt-1 block w-full rounded border p-2"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <label>
            Ruangan
            <select
              className="mt-1 block w-full rounded border p-2"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value={s.roomId ?? ''}>
                {s.roomName ?? 'Belum ditentukan'}
              </option>
              {rooms.data?.data
                .filter((r) => r.id !== s.roomId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cancel}
              onChange={(e) => setCancel(e.target.checked)}
            />
            Batalkan sesi ini
          </label>
          <label className="sm:col-span-2">
            Alasan perubahan
            <textarea
              required
              maxLength={1000}
              className="mt-1 block w-full rounded border p-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          {mutation.isError ? (
            <p role="alert" className="text-destructive sm:col-span-2">
              {mutation.error instanceof ApiError &&
              mutation.error.status === 409
                ? 'Sesi berubah atau jadwal bentrok. Muat ulang dan periksa tanggal.'
                : 'Perubahan belum tersimpan.'}
            </p>
          ) : null}
          <Button disabled={mutation.isPending || !reason.trim()} type="submit">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      ) : null}
    </div>
  )
}

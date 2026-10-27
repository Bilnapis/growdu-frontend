import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Info, Plus, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import './study-group-form.css'
import type { StudyGroup } from '@/features/study-groups/api/study-groups-api'
import {
  useCreateStudyGroup,
  useUpdateStudyGroup,
  useStudyGroupOptions,
} from '@/features/study-groups/hooks/use-study-groups'
import { ApiError } from '@/services/api-client'
import { todayInJakarta, shiftDate } from '@/features/class-sessions/api'

type ScheduleDraft = {
  id?: string
  tutorId: string
  roomId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}
const days = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const

const newSchedule = (): ScheduleDraft => ({
  tutorId: '',
  roomId: '',
  dayOfWeek: 1,
  startTime: '15:00',
  endTime: '16:00',
})
export function StudyGroupForm({ group }: { group?: StudyGroup }) {
  const navigate = useNavigate()
  const [name, setName] = useState(group?.name ?? '')
  const [effectiveFrom, setEffectiveFrom] = useState(todayInJakarta())
  const [effectiveUntil, setEffectiveUntil] = useState(
    shiftDate(todayInJakarta(), 180),
  )
  const [schedules, setSchedules] = useState<ScheduleDraft[]>(
    group?.schedules.map(
      ({ id, tutorId, roomId, dayOfWeek, startTime, endTime }) => ({
        id,
        tutorId,
        roomId: roomId ?? '',
        dayOfWeek,
        startTime,
        endTime,
      }),
    ) ?? [newSchedule()],
  )
  const [studentIds, setStudentIds] = useState<string[]>(
    group?.studentIds ?? [],
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerStudentIds, setPickerStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [educationStage, setEducationStage] = useState('all')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const studentSearchRef = useRef<HTMLInputElement>(null)
  const tutors = useStudyGroupOptions('tutors')
  const rooms = useStudyGroupOptions('rooms')
  const students = useStudyGroupOptions('students')
  const create = useCreateStudyGroup()
  const update = useUpdateStudyGroup()
  const pending = create.isPending || update.isPending
  const invalid =
    !name.trim() ||
    !effectiveFrom ||
    !effectiveUntil ||
    effectiveFrom > effectiveUntil ||
    schedules.length === 0 ||
    schedules.some(
      (s) =>
        !s.tutorId ||
        !s.roomId ||
        !s.startTime ||
        !s.endTime ||
        s.startTime >= s.endTime,
    ) ||
    schedules.some((schedule, index) =>
      findScheduleConflict(schedule, index, schedules),
    )
  const pickerStudents =
    students.data?.data.filter(
      (student) =>
        `${student.name} ${student.school}`
          .toLocaleLowerCase('id')
          .includes(studentSearch.toLocaleLowerCase('id')) &&
        (educationStage === 'all' ||
          student.educationLevel
            .toLocaleUpperCase('id')
            .startsWith(educationStage)),
    ) ?? []
  useEffect(() => {
    if (!pickerOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    studentSearchRef.current?.focus()
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [pickerOpen])

  function openStudentPicker() {
    setPickerStudentIds(studentIds)
    setStudentSearch('')
    setEducationStage('all')
    setPickerOpen(true)
  }

  function togglePickerStudent(studentId: string) {
    setPickerStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    )
  }
  function changeSchedule(index: number, patch: Partial<ScheduleDraft>) {
    setSchedules((current) =>
      current.map((schedule, itemIndex) =>
        itemIndex === index ? { ...schedule, ...patch } : schedule,
      ),
    )
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (invalid || pending) return
    const payload = {
      name: name.trim(),
      schedules,
      studentIds,
      effectiveFrom,
      effectiveUntil,
    }
    const options = {
      onSuccess: (saved: StudyGroup) =>
        void navigate(`/study-groups/${saved.id}`),
      onError: (reason: unknown) =>
        setError(
          reason instanceof ApiError
            ? reason.message
            : 'Kelompok belajar belum dapat disimpan.',
        ),
    }
    if (group) update.mutate({ id: group.id, input: payload }, options)
    else create.mutate(payload, options)
  }
  return (
    <div className="study-group-form">
      <header>
        <h1>
          {group ? 'Ubah Data Kelompok Belajar' : 'Tambah Kelompok Belajar'}
        </h1>
      </header>
      <form onSubmit={submit} noValidate aria-busy={pending}>
        <div className="study-group-form__column">
          <section
            className="study-group-form__section"
            aria-labelledby="group-information"
          >
            <h2 id="group-information">
              {group ? 'Informasi Kelompok' : '1. Informasi Kelompok'}
            </h2>
            <Field label="Nama Kelompok" required>
              <Input
                id="group-name"
                value={name}
                placeholder="Kelas 8A Matematika"
                onChange={(event) => setName(event.target.value)}
                required
                aria-invalid={submitted && !name.trim()}
                aria-describedby={
                  submitted && !name.trim() ? 'group-name-error' : undefined
                }
              />
            </Field>
            {submitted && !name.trim() ? (
              <p
                id="group-name-error"
                className="study-group-form__error"
                role="alert"
              >
                Nama kelompok wajib diisi.
              </p>
            ) : null}
          </section>
          <section
            className="study-group-form__section"
            aria-labelledby="group-schedules"
          >
            <h2 id="group-schedules">2. Jadwal &amp; Tentor</h2>
            <p className="study-group-form__hint">
              Satu jadwal berisi tentor, ruangan, hari belajar, jam mulai, dan
              jam selesai. Tambahkan jadwal lain bila kelompok belajar diajar di
              hari/tentor/jam/ruangan berbeda.
            </p>
            <fieldset className="study-group-form__period">
              <legend>Periode Belajar</legend>
              <p className="study-group-form__hint">
                Tentukan rentang tanggal aktif untuk kelompok belajar ini.
              </p>
              <div className="study-group-form__row">
                <Field label="Tanggal Mulai" required>
                  <Input
                    required
                    type="date"
                    value={effectiveFrom}
                    aria-invalid={
                      submitted &&
                      (!effectiveFrom || effectiveFrom > effectiveUntil)
                    }
                    onChange={(event) => setEffectiveFrom(event.target.value)}
                  />
                </Field>
                <Field label="Tanggal Selesai" required>
                  <Input
                    required
                    type="date"
                    min={effectiveFrom}
                    value={effectiveUntil}
                    aria-invalid={
                      submitted &&
                      (!effectiveUntil || effectiveFrom > effectiveUntil)
                    }
                    onChange={(event) => setEffectiveUntil(event.target.value)}
                  />
                </Field>
              </div>
              {submitted &&
              (!effectiveFrom ||
                !effectiveUntil ||
                effectiveFrom > effectiveUntil) ? (
                <p className="study-group-form__error" role="alert">
                  Pilih rentang tanggal belajar yang valid.
                </p>
              ) : null}
            </fieldset>
            {tutors.isPending ? (
              <p role="status" className="study-group-form__hint">
                Memuat tentor...
              </p>
            ) : tutors.isError ? (
              <p role="alert" className="study-group-form__error">
                Data tentor belum dapat dimuat.{' '}
                <button type="button" onClick={() => void tutors.refetch()}>
                  Coba lagi
                </button>
              </p>
            ) : tutors.data.data.length === 0 ? (
              <p className="study-group-form__hint">Belum ada tentor aktif.</p>
            ) : null}
            {rooms.isPending ? (
              <p role="status" className="study-group-form__hint">
                Memuat ruangan...
              </p>
            ) : rooms.isError ? (
              <p role="alert" className="study-group-form__error">
                Data ruangan belum dapat dimuat.{' '}
                <button type="button" onClick={() => void rooms.refetch()}>
                  Coba lagi
                </button>
              </p>
            ) : rooms.data.data.length === 0 ? (
              <p className="study-group-form__hint">
                Belum ada ruangan aktif. Tambahkan ruangan terlebih dahulu.
              </p>
            ) : null}
            {schedules.map((schedule, index) => {
              const scheduleInvalid =
                submitted &&
                (!schedule.tutorId ||
                  !schedule.roomId ||
                  !schedule.startTime ||
                  !schedule.endTime ||
                  schedule.startTime >= schedule.endTime)
              const errorId = `schedule-error-${index}`
              const conflict = findScheduleConflict(schedule, index, schedules)
              const tutorName =
                tutors.data?.data.find((tutor) => tutor.id === schedule.tutorId)
                  ?.name ??
                group?.schedules.find(
                  (item) => item.tutorId === schedule.tutorId,
                )?.tutorName ??
                'Tentor terpilih'
              return (
                <fieldset
                  className={`study-group-form__schedule${conflict ? ' study-group-form__schedule--conflict' : ''}`}
                  key={schedule.id ?? index}
                  aria-describedby={scheduleInvalid ? errorId : undefined}
                >
                  <legend className="sr-only">Jadwal {index + 1}</legend>
                  <div className="study-group-form__toolbar">
                    <div>
                      <h3 aria-hidden="true">Jadwal {index + 1}</h3>
                      {group ? (
                        <p className="study-group-form__schedule-caption">
                          {index === 0
                            ? 'Jadwal utama kelompok'
                            : 'Jadwal tambahan'}
                        </p>
                      ) : null}
                    </div>
                    {schedules.length > 1 ? (
                      <Button
                        className="study-group-form__remove"
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Hapus jadwal ${index + 1}`}
                        onClick={() =>
                          setSchedules((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 aria-hidden="true" />
                        Hapus
                      </Button>
                    ) : null}
                  </div>
                  <div className="study-group-form__row">
                    <Field label="Tentor" required>
                      <select
                        required
                        value={schedule.tutorId}
                        disabled={tutors.isPending}
                        aria-invalid={submitted && !schedule.tutorId}
                        aria-describedby={scheduleInvalid ? errorId : undefined}
                        onChange={(event) =>
                          changeSchedule(index, { tutorId: event.target.value })
                        }
                      >
                        <option value="">Pilih tentor</option>
                        {schedule.tutorId &&
                        !tutors.data?.data.some(
                          (tutor) => tutor.id === schedule.tutorId,
                        ) ? (
                          <option value={schedule.tutorId}>
                            {group?.schedules.find(
                              (item) => item.tutorId === schedule.tutorId,
                            )?.tutorName ?? 'Tentor terpilih'}
                          </option>
                        ) : null}
                        {tutors.data?.data.map((tutor) => (
                          <option value={tutor.id} key={tutor.id}>
                            {tutor.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Ruangan" required>
                      <select
                        required
                        value={schedule.roomId}
                        disabled={rooms.isPending}
                        aria-invalid={submitted && !schedule.roomId}
                        aria-describedby={scheduleInvalid ? errorId : undefined}
                        onChange={(event) =>
                          changeSchedule(index, { roomId: event.target.value })
                        }
                      >
                        <option value="">Pilih ruangan</option>
                        {schedule.roomId &&
                        !rooms.data?.data.some(
                          (room) => room.id === schedule.roomId,
                        ) ? (
                          <option value={schedule.roomId}>
                            {group?.schedules.find(
                              (item) => item.roomId === schedule.roomId,
                            )?.roomName ?? 'Ruangan terpilih'}
                          </option>
                        ) : null}
                        {rooms.data?.data.map((room) => (
                          <option value={room.id} key={room.id}>
                            {room.name} ({room.code}) · {room.capacity} siswa
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="study-group-form__row">
                    <Field label="Hari Belajar" required>
                      <select
                        required
                        value={schedule.dayOfWeek}
                        onChange={(event) =>
                          changeSchedule(index, {
                            dayOfWeek: Number(event.target.value),
                          })
                        }
                      >
                        {days.map((day, dayIndex) => (
                          <option value={dayIndex + 1} key={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="study-group-form__times">
                      <Field label="Jam Mulai" required>
                        <Input
                          required
                          type="time"
                          value={schedule.startTime}
                          aria-invalid={scheduleInvalid}
                          aria-describedby={
                            scheduleInvalid ? errorId : undefined
                          }
                          onChange={(event) =>
                            changeSchedule(index, {
                              startTime: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Jam Selesai" required>
                        <Input
                          required
                          type="time"
                          value={schedule.endTime}
                          aria-invalid={scheduleInvalid}
                          aria-describedby={
                            scheduleInvalid ? errorId : undefined
                          }
                          onChange={(event) =>
                            changeSchedule(index, {
                              endTime: event.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  </div>
                  {scheduleInvalid ? (
                    <p
                      id={errorId}
                      role="alert"
                      className="study-group-form__error"
                    >
                      Pilih tentor dan ruangan, lalu pastikan jam selesai
                      setelah jam mulai.
                    </p>
                  ) : null}
                  {conflict ? (
                    <p className="study-group-form__conflict" role="alert">
                      <AlertCircle aria-hidden="true" />
                      <span>
                        Bentrok: {tutorName} sudah memiliki jadwal pada{' '}
                        {days[schedule.dayOfWeek - 1]}, {schedule.startTime} -{' '}
                        {schedule.endTime}.
                      </span>
                    </p>
                  ) : null}
                </fieldset>
              )
            })}
            <Button
              className="study-group-form__add-schedule"
              type="button"
              variant="outline"
              onClick={() =>
                setSchedules((current) => [...current, newSchedule()])
              }
            >
              <Plus aria-hidden="true" />
              Tambah Jadwal &amp; Tentor
            </Button>
          </section>
          <section
            className="study-group-form__section study-group-form__students"
            aria-labelledby="group-students"
          >
            <div className="study-group-form__toolbar">
              <div className="study-group-form__student-title">
                <h2 id="group-students">
                  {group ? 'Pilih Siswa Peserta' : '3. Pilih Siswa Peserta'}
                </h2>
                <span className="study-group-form__badge" role="status">
                  {studentIds.length} siswa terpilih
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                aria-expanded={pickerOpen}
                aria-controls="group-student-picker"
                onClick={openStudentPicker}
              >
                <Plus aria-hidden="true" />
                Tambah Siswa
              </Button>
            </div>
            {students.isPending ? (
              <p role="status" className="study-group-form__hint">
                Memuat siswa...
              </p>
            ) : students.isError ? (
              <p role="alert" className="study-group-form__error">
                Data siswa belum dapat dimuat.{' '}
                <button type="button" onClick={() => void students.refetch()}>
                  Coba lagi
                </button>
              </p>
            ) : null}
            <div className="study-group-form__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nama Siswa</th>
                    <th scope="col">Jenjang / Sekolah</th>
                    <th scope="col">Alamat</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {studentIds.map((id) => {
                    const student = students.data?.data.find(
                      (item) => item.id === id,
                    )
                    return (
                      <tr key={id}>
                        <td>
                          {student?.name ??
                            'Siswa terpilih (detail belum tersedia)'}
                        </td>
                        <td>
                          {student
                            ? `${student.educationLevel} / ${student.school}`
                            : '—'}
                        </td>
                        <td>{student?.address ?? '—'}</td>
                        <td>
                          <Button
                            className="study-group-form__remove"
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Hapus ${student?.name ?? 'siswa'} dari peserta`}
                            onClick={() =>
                              setStudentIds((current) =>
                                current.filter((studentId) => studentId !== id),
                              )
                            }
                          >
                            <Trash2 aria-hidden="true" />
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {studentIds.length === 0 ? (
                <p className="study-group-form__empty">
                  Belum ada siswa terpilih. Tambahkan siswa untuk mengisi
                  peserta kelompok.
                </p>
              ) : null}
            </div>
            {!group ? (
              <p className="study-group-form__capacity">
                <Info aria-hidden="true" />
                <span>
                  Kapasitas ideal kelompok belajar: 4 - 8 siswa. Klik tombol “+
                  Tambah Siswa” untuk menambah peserta.
                </span>
              </p>
            ) : null}
          </section>
          {error ? (
            <p role="alert" className="study-group-form__error">
              {error}
            </p>
          ) : null}
        </div>
        <footer className="study-group-form__footer">
          <p>
            {pending ? 'Menyimpan perubahan...' : 'Perubahan belum disimpan.'}
          </p>
          <div>
            <Button asChild variant="outline">
              <Link to={group ? `/study-groups/${group.id}` : '/study-groups'}>
                <X aria-hidden="true" />
                Batal
              </Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? 'Menyimpan...'
                : group
                  ? 'Simpan Perubahan'
                  : 'Simpan Kelompok'}
            </Button>
          </div>
        </footer>
      </form>
      {pickerOpen ? (
        <div
          className="study-group-form__modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPickerOpen(false)
          }}
        >
          <section
            id="group-student-picker"
            className="study-group-form__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-picker-title"
            aria-describedby="student-picker-description"
          >
            <header className="study-group-form__modal-header">
              <div>
                <h2 id="student-picker-title">Pilih Siswa Peserta</h2>
                <p id="student-picker-description">
                  Silahkan pilih siswa dengan menekan tombol centang
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Tutup pilih siswa"
                onClick={() => setPickerOpen(false)}
              >
                <X aria-hidden="true" />
              </Button>
            </header>
            <div className="study-group-form__modal-toolbar">
              <label className="study-group-form__search">
                <Search aria-hidden="true" />
                <span className="sr-only">Cari siswa</span>
                <input
                  ref={studentSearchRef}
                  type="search"
                  value={studentSearch}
                  placeholder="Cari nama siswa, sekolah, atau alamat"
                  onChange={(event) => setStudentSearch(event.target.value)}
                />
              </label>
              <label className="sr-only" htmlFor="student-education-stage">
                Filter jenjang
              </label>
              <select
                id="student-education-stage"
                className="study-group-form__modal-filter"
                value={educationStage}
                onChange={(event) => setEducationStage(event.target.value)}
              >
                <option value="all">Semua Jenjang</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
            </div>
            {students.isPending ? (
              <p role="status" className="study-group-form__modal-message">
                Memuat data siswa...
              </p>
            ) : students.isError ? (
              <p
                role="alert"
                className="study-group-form__modal-message study-group-form__error"
              >
                Data siswa belum dapat dimuat.{' '}
                <button type="button" onClick={() => void students.refetch()}>
                  Coba lagi
                </button>
              </p>
            ) : (
              <div className="study-group-form__modal-table-wrap">
                <table className="study-group-form__modal-table">
                  <thead>
                    <tr>
                      <th scope="col">
                        <input
                          type="checkbox"
                          aria-label="Pilih semua siswa yang ditampilkan"
                          checked={
                            pickerStudents.length > 0 &&
                            pickerStudents.every((student) =>
                              pickerStudentIds.includes(student.id),
                            )
                          }
                          onChange={(event) =>
                            setPickerStudentIds((current) => {
                              const visibleIds = pickerStudents.map(
                                (student) => student.id,
                              )
                              return event.target.checked
                                ? [...new Set([...current, ...visibleIds])]
                                : current.filter(
                                    (id) => !visibleIds.includes(id),
                                  )
                            })
                          }
                        />
                      </th>
                      <th scope="col">Nama Siswa</th>
                      <th scope="col">Jenjang / Sekolah</th>
                      <th scope="col">Alamat</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickerStudents.map((student) => {
                      const isSelected = pickerStudentIds.includes(student.id)
                      return (
                        <tr key={student.id} data-selected={isSelected}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              aria-label={`Pilih ${student.name}`}
                              onChange={() => togglePickerStudent(student.id)}
                            />
                          </td>
                          <td>{student.name}</td>
                          <td>
                            {student.educationLevel} / {student.school}
                          </td>
                          <td>{student.address}</td>
                          <td>
                            <span className="study-group-form__status">
                              Aktif
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {pickerStudents.length === 0 ? (
                  <p className="study-group-form__modal-message">
                    Tidak ada siswa yang sesuai dengan pencarian atau filter.
                  </p>
                ) : null}
              </div>
            )}
            <footer className="study-group-form__modal-footer">
              <p>{pickerStudentIds.length} siswa terpilih untuk ditambahkan</p>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPickerOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={students.isPending || students.isError}
                  onClick={() => {
                    setStudentIds(pickerStudentIds)
                    setPickerOpen(false)
                  }}
                >
                  Tambahkan Siswa
                </Button>
              </div>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="study-group-form__field">
      <span>
        {label}
        {required ? (
          <span className="study-group-form__required" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  )
}

function findScheduleConflict(
  schedule: ScheduleDraft,
  index: number,
  schedules: ScheduleDraft[],
) {
  if (!schedule.tutorId || !schedule.startTime || !schedule.endTime) {
    return false
  }

  return schedules.some(
    (other, otherIndex) =>
      otherIndex !== index &&
      other.tutorId === schedule.tutorId &&
      other.dayOfWeek === schedule.dayOfWeek &&
      schedule.startTime < other.endTime &&
      schedule.endTime > other.startTime,
  )
}

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { ReportNote, ReportStudent } from './api'

export function ReportStudentNotes({
  students,
  notes,
  onChange,
  onPendingChange,
  disabled,
}: {
  students: ReportStudent[]
  notes: ReportNote[]
  onChange: (notes: ReportNote[]) => void
  onPendingChange: (pending: boolean) => void
  disabled: boolean
}) {
  const [studentId, setStudentId] = useState('')
  const [text, setText] = useState('')
  const available = students.filter(
    (student) => !notes.some((note) => note.studentId === student.id),
  )
  return (
    <fieldset className="lr-fields" disabled={disabled}>
      <legend className="sr-only">Catatan khusus per siswa</legend>
      <div className="lr-field">
        <label htmlFor="report-note-student">Nama siswa</label>
        <Select
          id="report-note-student"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
        >
          <option value="">Pilih siswa...</option>
          {available.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} · {student.school} · {student.educationLevel}
            </option>
          ))}
        </Select>
      </div>
      <div className="lr-field">
        <label htmlFor="report-new-note">Catatan khusus</label>
        <textarea
          id="report-new-note"
          rows={4}
          maxLength={5000}
          placeholder="Isi catatan khusus untuk siswa terpilih."
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            onPendingChange(Boolean(event.target.value.trim()))
          }}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={!studentId || !text.trim() || notes.length >= 500}
        onClick={() => {
          onChange([...notes, { studentId, note: text.trim() }])
          setStudentId('')
          setText('')
          onPendingChange(false)
        }}
      >
        <Plus size={15} aria-hidden="true" />
        Tambah catatan siswa
      </Button>
      <hr />
      <h3>Catatan yang dibuat</h3>
      {notes.map((note, index) => (
        <div className="lr-note-card" key={note.studentId}>
          <div className="lr-row">
            <label htmlFor={'report-note-' + index}>
              {students.find((student) => student.id === note.studentId)
                ?.name ?? 'Siswa tidak lagi berada dalam sesi ini'}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={
                'Hapus catatan ' +
                (students.find((student) => student.id === note.studentId)
                  ?.name ?? 'siswa')
              }
              onClick={() =>
                onChange(
                  notes.filter((item) => item.studentId !== note.studentId),
                )
              }
            >
              <Trash2 size={15} aria-hidden="true" />
              Hapus
            </Button>
          </div>
          <textarea
            id={'report-note-' + index}
            rows={4}
            maxLength={5000}
            value={note.note}
            onChange={(event) =>
              onChange(
                notes.map((item) =>
                  item.studentId === note.studentId
                    ? { ...item, note: event.target.value }
                    : item,
                ),
              )
            }
          />
        </div>
      ))}
    </fieldset>
  )
}

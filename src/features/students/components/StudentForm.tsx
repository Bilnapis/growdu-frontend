import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Student, StudentInput } from '../data/students'

const fields = [
  { name: 'name', label: 'Nama siswa', required: true },
  { name: 'school', label: 'Sekolah', required: true },
  { name: 'parent', label: 'Nama orang tua', required: true },
  { name: 'phone', label: 'Nomor telepon', type: 'tel' },
  { name: 'email', label: 'Email orang tua', type: 'email' },
  { name: 'group', label: 'Kelompok belajar' },
  { name: 'address', label: 'Alamat' },
] as const

export const studentSelectClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function StudentForm({
  student,
  onSave,
  onCancel,
}: {
  student?: Student
  onSave: (input: StudentInput) => void
  onCancel: () => void
}) {
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (key: string) => {
      const entry = data.get(key)
      return typeof entry === 'string' ? entry.trim() : ''
    }
    if (!value('name') || !value('school') || !value('parent')) {
      setError('Nama siswa, sekolah, dan nama orang tua wajib diisi.')
      return
    }
    onSave({
      name: value('name'),
      school: value('school'),
      parent: value('parent'),
      phone: value('phone'),
      email: value('email'),
      address: value('address'),
      group: value('group'),
      level: value('level'),
      active: value('active') === 'true',
    })
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-5"
      aria-describedby={error ? 'student-form-error' : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.name === 'address' ? 'sm:col-span-2' : ''}
          >
            <Label htmlFor={`student-${field.name}`}>
              {field.label}
              {'required' in field ? ' *' : ''}
            </Label>
            <Input
              className="mt-1.5"
              id={`student-${field.name}`}
              name={field.name}
              defaultValue={student?.[field.name] ?? ''}
              required={'required' in field}
              type={'type' in field ? field.type : 'text'}
              maxLength={field.name === 'address' ? 300 : 150}
            />
          </div>
        ))}
        <div>
          <Label htmlFor="student-level">Kelas</Label>
          <select
            id="student-level"
            name="level"
            className={`mt-1.5 ${studentSelectClass}`}
            defaultValue={student?.level ?? '8'}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                Kelas {index + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="student-active">Status</Label>
          <select
            id="student-active"
            name="active"
            className={`mt-1.5 ${studentSelectClass}`}
            defaultValue={String(student?.active ?? true)}
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>
      {error ? (
        <p
          id="student-form-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Data demo hanya disimpan selama halaman ini dibuka.
      </p>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">Simpan siswa</Button>
      </footer>
    </form>
  )
}

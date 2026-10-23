import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StudentInput } from '../data/students'

const header = 'name,level,school,parent,phone,email,address,group,active'
const template = `${header}\nSiswa Contoh,8,SMP 3,Ibu Contoh,081200000000,contoh@example.com,"Jl. Melati, Bandung",Kelas 8A,true\n`

// Supports quoted commas, escaped quotes, CRLF, and newlines in CSV fields.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"'
        i++
      } else quoted = !quoted
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(field.trim())
      field = ''
      if (char === '\n') {
        if (row.some(Boolean)) rows.push(row)
        row = []
      }
    } else if (char !== '\r') field += char
  }
  if (quoted) throw new Error('Tanda kutip pada CSV belum ditutup.')
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

export function StudentImport({
  onImport,
}: {
  onImport: (students: StudentInput[]) => void
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const file = new FormData(event.currentTarget).get('file')
    if (!(file instanceof File) || !file.size) {
      setError('Pilih file CSV terlebih dahulu.')
      return
    }
    if (file.size > 1_000_000) {
      setError('Ukuran file maksimal 1 MB.')
      return
    }
    setPending(true)
    setError('')
    try {
      const [columns, ...rows] = parseCsv(
        (await file.text()).replace(/^\uFEFF/, ''),
      )
      if (columns?.join(',') !== header)
        throw new Error('Kolom CSV harus mengikuti template yang tersedia.')
      if (!rows.length || rows.length > 500)
        throw new Error('File harus berisi 1 sampai 500 siswa.')
      const students = rows.map((row, index): StudentInput => {
        const [
          name,
          level,
          school,
          parent,
          phone,
          email,
          address,
          group,
          active,
        ] = row
        if (
          row.length !== 9 ||
          !name ||
          !school ||
          !parent ||
          !/^(?:[1-9]|1[0-2])$/.test(level) ||
          !['true', 'false'].includes(active) ||
          (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
          row.some((field) => field.length > 300)
        ) {
          throw new Error(
            `Data baris ${index + 2} tidak valid. Periksa kolom wajib, kelas (1–12), email, dan status (true/false).`,
          )
        }
        return {
          name,
          level,
          school,
          parent,
          phone,
          email,
          address,
          group,
          active: active === 'true',
        }
      })
      onImport(students)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'File CSV tidak dapat dibaca.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
      className="space-y-4"
      aria-busy={pending}
    >
      <p className="text-sm text-muted-foreground">
        Import maksimal 500 siswa menggunakan template CSV. Data hanya disimpan
        sementara pada halaman ini.
      </p>
      <Button asChild variant="outline">
        <a
          download="template-siswa.csv"
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`}
        >
          Unduh template CSV
        </a>
      </Button>
      <div>
        <Label htmlFor="student-csv">File CSV (maksimal 1 MB)</Label>
        <Input
          id="student-csv"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          disabled={pending}
          className="mt-2"
          aria-describedby={error ? 'student-import-error' : undefined}
        />
      </div>
      {error ? (
        <p
          id="student-import-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Mengimpor...' : 'Import siswa'}
        </Button>
      </div>
    </form>
  )
}

import { type FormEvent, useState } from 'react'
import { Search, UsersRound } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'
import { ApiError } from '@/services/api-client'
import { useTutorStudents } from '../api/tutor-students-api'
import { TutorStudentCard } from './TutorStudentCard'

export function TutorStudents() {
  const [params, setParams] = useSearchParams()
  const search = (params.get('search') ?? '').slice(0, 100)
  const pageValue = Number(params.get('page') ?? 1)
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const [searchText, setSearchText] = useState(search)
  const query = useTutorStudents(page, search)
  const forbidden =
    query.error instanceof ApiError && query.error.status === 403

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = new URLSearchParams()
    if (searchText.trim()) next.set('search', searchText.trim())
    setParams(next)
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  return (
    <main className="min-h-dvh bg-background pb-[82px] text-foreground">
      <div className="mx-auto w-full max-w-[390px] py-3">
        <header className="grid gap-2.5 px-4 pb-3">
          <h1 className="text-lg font-bold leading-[1.3]">Siswa Saya</h1>
          <form role="search" onSubmit={submitSearch}>
            <label htmlFor="tutor-student-search" className="sr-only">
              Cari nama siswa
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="tutor-student-search"
                type="search"
                maxLength={100}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Cari nama siswa"
                className="h-9 bg-[var(--color-gray-50)] pl-8 text-[11px] font-normal"
              />
            </div>
            <button type="submit" className="sr-only">
              Cari siswa
            </button>
          </form>
        </header>

        <section
          className="grid gap-2.5 px-4"
          aria-label="Daftar siswa saya"
          aria-busy={query.isPending}
        >
          {query.isPending ? (
            <div role="status" className="grid gap-2.5">
              <span className="sr-only">Memuat siswa</span>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[180px] rounded-lg border bg-card motion-safe:animate-pulse"
                />
              ))}
            </div>
          ) : query.isError ? (
            <div
              className="rounded-lg border bg-card p-5 text-center"
              role="alert"
            >
              <h2 className="text-sm font-bold">
                {forbidden
                  ? 'Akses siswa tidak tersedia'
                  : 'Siswa tidak dapat dimuat'}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {forbidden
                  ? 'Akun Anda tidak memiliki akses ke daftar ini.'
                  : 'Periksa koneksi Anda, lalu coba lagi.'}
              </p>
              {!forbidden ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => void query.refetch()}
                >
                  Coba lagi
                </Button>
              ) : null}
            </div>
          ) : query.data?.data.length === 0 ? (
            <div
              className="rounded-lg border bg-card p-5 text-center"
              role="status"
            >
              <UsersRound
                className="mx-auto h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-sm font-bold">
                {search ? 'Siswa tidak ditemukan' : 'Belum ada siswa'}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {search
                  ? 'Coba cari dengan nama siswa yang lain.'
                  : 'Siswa akan muncul setelah terdaftar di kelompok belajar yang Anda ajar.'}
              </p>
              {search || page > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchText('')
                    setParams({})
                  }}
                >
                  Tampilkan semua siswa
                </Button>
              ) : null}
            </div>
          ) : (
            query.data?.data.map((student) => (
              <TutorStudentCard key={student.id} student={student} />
            ))
          )}
        </section>

        {!query.isError && query.data && query.data.meta.totalPages > 1 ? (
          <nav
            aria-label="Halaman daftar siswa"
            className="mt-4 flex items-center justify-between gap-2 px-4"
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {page} / {query.data.meta.totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= query.data.meta.totalPages}
              onClick={() => changePage(page + 1)}
            >
              Berikutnya
            </Button>
          </nav>
        ) : null}
      </div>
      <TutorBottomNavigation />
    </main>
  )
}

import { useSearchParams } from 'react-router-dom'

import { UserSettings } from '@/features/users/components/UserSettings'
import { type UserRole, type UserStatus } from '@/features/users/api/users-api'

export function UserSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = {
    page: getPage(searchParams.get('page')),
    ...(searchParams.get('search') ? { search: searchParams.get('search') ?? undefined } : {}),
    ...(getRole(searchParams.get('role')) ? { role: getRole(searchParams.get('role')) } : {}),
    ...(getStatus(searchParams.get('status')) ? { status: getStatus(searchParams.get('status')) } : {}),
  }

  function handleFiltersChange(nextFilters: typeof filters) {
    const nextSearchParams = new URLSearchParams()
    if (nextFilters.page > 1) nextSearchParams.set('page', String(nextFilters.page))
    if (nextFilters.search) nextSearchParams.set('search', nextFilters.search)
    if (nextFilters.role) nextSearchParams.set('role', nextFilters.role)
    if (nextFilters.status) nextSearchParams.set('status', nextFilters.status)
    setSearchParams(nextSearchParams)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">Akses & keamanan</span>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pengaturan pengguna</h1>
      <p className="mt-2 max-w-2xl leading-6 text-muted-foreground">Kelola akun pada tenant Anda, termasuk status akses dan kredensial pengguna.</p>
      <div className="mt-8"><UserSettings filters={filters} onFiltersChange={handleFiltersChange} /></div>
    </div>
  )
}

function getPage(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function getRole(value: string | null): UserRole | undefined {
  if (value === 'owner' || value === 'operator' || value === 'tutor' || value === 'parent') return value
  return undefined
}

function getStatus(value: string | null): UserStatus | undefined {
  if (value === 'active' || value === 'inactive') return value
  return undefined
}

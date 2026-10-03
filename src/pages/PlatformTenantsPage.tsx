import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { type PlatformTenantStatus } from '@/features/platform-admin/api/platform-admin-api'
import { PlatformTenantManagement } from '@/features/platform-admin/components/PlatformTenantManagement'

export function PlatformTenantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const status = getStatus(searchParams.get('status'))
  const search = searchParams.get('search')
  const filters = {
    page: getPage(searchParams.get('page')),
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
  }

  function handleFiltersChange(nextFilters: typeof filters) {
    const nextSearchParams = new URLSearchParams()
    if (nextFilters.page > 1) {
      nextSearchParams.set('page', String(nextFilters.page))
    }
    if (nextFilters.search) nextSearchParams.set('search', nextFilters.search)
    if (nextFilters.status) nextSearchParams.set('status', nextFilters.status)
    setSearchParams(nextSearchParams)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Manajemen bimbel / tenant
          </h1>
          <p className="mt-2 max-w-2xl leading-6 text-muted-foreground">
            Pantau daftar bimbel dan status operasionalnya di platform.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah bimbel
        </Button>
      </div>
      <div className="mt-8">
        <PlatformTenantManagement
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isCreateDialogOpen={isCreateDialogOpen}
          onCreateDialogOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  )
}

function getPage(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function getStatus(value: string | null): PlatformTenantStatus | undefined {
  if (value === 'active' || value === 'inactive') return value
  return undefined
}

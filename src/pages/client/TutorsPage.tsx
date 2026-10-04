import { useState } from 'react'

import type { TutorStatus } from '@/features/tutors/api/tutors-api'
import { TutorManagement } from '@/features/tutors/components/TutorManagement'

type TutorsPageFilters = {
  page: number
  search?: string
  status?: TutorStatus
}

export function TutorsPage() {
  const [filters, setFilters] = useState<TutorsPageFilters>({ page: 1 })

  return <TutorManagement filters={filters} onFiltersChange={setFilters} />
}

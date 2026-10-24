import { useSearchParams } from 'react-router-dom'
import type { EntityStatus } from '@/features/students/api/students-api'
import { StudyGroupManagement } from '@/features/study-groups/components/StudyGroupManagement'
export function StudyGroupsPage() { 
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page') ?? '1')); 
    const rawStatus = params.get('status'); 
    const status: EntityStatus | undefined = rawStatus === 'active' || rawStatus === 'inactive' ? rawStatus : undefined; 
    return <StudyGroupManagement filters={{ page, limit: 20, ...(params.get('search') ? { search: params.get('search')! } : {}), ...(status ? { status } : {}) }} onFiltersChange={(filters) => { const next = new URLSearchParams(); next.set('page', String(filters.page)); if (filters.search) next.set('search', filters.search); if (filters.status) next.set('status', filters.status); setParams(next) }} /> }

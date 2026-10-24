import { useParams } from 'react-router-dom'

import { StaffDetail } from '@/features/staff/components/StaffDetail'

export function StaffDetailPage() {
  const { id = '' } = useParams()

  return <StaffDetail key={id} id={id} />
}

import { useParams } from 'react-router-dom'

import { StudentDetail } from '@/features/students/components/StudentDetail'

export function StudentDetailPage() {
  const { id = '' } = useParams()

  return <StudentDetail key={id} id={id} />
}

import { useParams } from 'react-router-dom'

import { TutorDetail } from '@/features/tutors/components/TutorDetail'

export function TutorDetailPage() {
  const { id = '' } = useParams()

  return <TutorDetail key={id} id={id} />
}

import { useParams } from 'react-router-dom'

import { TutorStudentDetail } from '@/features/tutor-students/components/TutorStudentDetail'

export function TutorStudentDetailPage() {
  const { studentId = '' } = useParams<{ studentId: string }>()

  return <TutorStudentDetail studentId={studentId} />
}

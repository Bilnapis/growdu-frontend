import { useParams } from 'react-router-dom'
import { StudyGroupDetail } from '@/features/study-groups/components/StudyGroupDetail'
export function StudyGroupDetailPage() { const { id = '' } = useParams(); return <StudyGroupDetail id={id} /> }

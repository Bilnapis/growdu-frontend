import { useParams } from 'react-router-dom'
import { StudyGroupForm } from '@/features/study-groups/components/StudyGroupForm'
import { useStudyGroup } from '@/features/study-groups/hooks/use-study-groups'
export function StudyGroupFormPage() { const { id } = useParams(); const detail = useStudyGroup(id ?? ''); if (!id) return <StudyGroupForm />; if (detail.isPending) return <p role="status">Memuat kelompok belajar...</p>; if (!detail.data) return <p role="alert">Kelompok belajar tidak ditemukan.</p>; return <StudyGroupForm group={detail.data} /> }

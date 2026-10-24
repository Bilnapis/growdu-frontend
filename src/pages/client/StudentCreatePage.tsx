import { useNavigate } from 'react-router-dom'

import { StudentCreateForm } from '@/features/students/components/StudentCreateForm'

export function StudentCreatePage() {
  const navigate = useNavigate()
  const close = () => void navigate('/students', { replace: true })

  return <StudentCreateForm onClose={close} />
}

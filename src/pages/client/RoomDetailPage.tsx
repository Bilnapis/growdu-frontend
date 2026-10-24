import { useParams } from 'react-router-dom'
import { RoomDetail } from '@/features/rooms/components/RoomDetail'

export function RoomDetailPage() {
  const { id = '' } = useParams()
  return <RoomDetail key={id} id={id} />
}

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SetupCardProps {
  title: string
  description: string
  status?: 'ready' | 'next'
}

export function SetupCard({
  title,
  description,
  status = 'ready',
}: SetupCardProps) {
  const statusLabel = status === 'ready' ? 'Siap' : 'Berikutnya'
  const statusVariant = status === 'ready' ? 'success' : 'warning'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-6">{title}</CardTitle>
          <Badge className="shrink-0" variant={statusVariant}>
            {statusLabel}
          </Badge>
        </div>
        <CardDescription className="pt-1 leading-6">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

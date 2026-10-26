import { Plus } from 'lucide-react'
import { type ReactNode } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AddButtonProps = Omit<ButtonProps, 'asChild' | 'children'> & {
  children: ReactNode
}

export function AddButton({ children, className, ...props }: AddButtonProps) {
  return (
    <Button className={cn('text-[13px] font-semibold', className)} {...props}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      {children}
    </Button>
  )
}

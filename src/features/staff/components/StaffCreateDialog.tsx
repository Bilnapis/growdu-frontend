import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type StaffCreateDialogProps = {
  children: ReactNode
  isPending: boolean
  onDismiss: () => void
  labelledBy?: string
  describedBy?: string
  initialFocusSelector?: string
  className?: string
}

export function StaffCreateDialog({
  children,
  isPending,
  onDismiss,
  labelledBy = 'staff-create-title',
  describedBy = 'staff-create-description',
  initialFocusSelector = '#staff-name',
  className,
}: StaffCreateDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    dialog
      ?.querySelector<HTMLElement>(initialFocusSelector)
      ?.focus({ preventScroll: true })
    if (dialog) dialog.scrollTop = 0
    document.body.style.overflow = 'hidden'

    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [initialFocusSelector])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-busy={isPending}
      className={cn(
        'fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[840px] overflow-y-auto rounded-xl border-0 bg-card p-4 text-foreground shadow-md backdrop:bg-[var(--color-modal-overlay)] sm:p-6',
        className,
      )}
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) onDismiss()
      }}
    >
      {children}
    </dialog>,
    document.body,
  )
}

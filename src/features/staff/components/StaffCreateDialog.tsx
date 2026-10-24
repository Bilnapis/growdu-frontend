import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type StaffCreateDialogProps = {
  children: ReactNode
  isPending: boolean
  onDismiss: () => void
}

export function StaffCreateDialog({ children, isPending, onDismiss }: StaffCreateDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    dialog?.querySelector<HTMLInputElement>('#staff-name')?.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="staff-create-title"
      aria-describedby="staff-create-description"
      aria-busy={isPending}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[840px] overflow-y-auto rounded-xl border-0 bg-card p-4 text-foreground shadow-md backdrop:bg-[var(--color-modal-overlay)] sm:p-6"
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

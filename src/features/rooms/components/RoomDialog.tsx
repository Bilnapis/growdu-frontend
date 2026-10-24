import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function RoomDialog({
  children,
  isPending,
  onDismiss,
  labelledBy,
  describedBy,
}: {
  children: ReactNode
  isPending: boolean
  onDismiss: () => void
  labelledBy: string
  describedBy?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
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
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-busy={isPending}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[740px] overflow-y-auto rounded-xl border-0 bg-card p-0 text-foreground shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)]"
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

import { useEffect, useRef, type ReactNode } from 'react'

type TutorDialogProps = {
  children: ReactNode
  isPending: boolean
  onDismiss: () => void
}

export function TutorDialog({ children, isPending, onDismiss }: TutorDialogProps) {
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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tutor-form-title"
      aria-busy={isPending}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[840px] overflow-y-auto rounded-[var(--radius-lg)] border-0 bg-[var(--color-surface)] p-4 text-[var(--color-text)] shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)] sm:p-6"
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) onDismiss()
      }}
    >
      {children}
    </dialog>
  )
}

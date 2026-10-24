import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function StudentDialog({
  title,
  children,
  onDismiss,
  isPending = false,
}: {
  title: string
  children: ReactNode
  onDismiss: () => void
  isPending?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby="student-dialog-title"
      aria-busy={isPending}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[840px] overflow-y-auto rounded-xl border-0 bg-card p-5 text-foreground shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)] sm:p-6"
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) onDismiss()
      }}
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 id="student-dialog-title" className="text-xl font-bold">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Tutup dialog"
          onClick={onDismiss}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </header>
      {children}
    </dialog>,
    document.body,
  )
}

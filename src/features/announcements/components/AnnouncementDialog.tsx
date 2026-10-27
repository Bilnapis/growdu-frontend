import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function AnnouncementDialog({
  children,
  pending = false,
  onDismiss,
  labelledBy,
}: {
  children: ReactNode
  pending?: boolean
  onDismiss: () => void
  labelledBy: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        previousFocus.getClientRects().length
      )
        previousFocus.focus()
      else
        document
          .querySelector<HTMLElement>('[data-announcement-trigger]')
          ?.focus()
    }
  }, [])

  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-busy={pending}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] overflow-y-auto rounded-xl border bg-card p-6 text-foreground shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)]"
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onDismiss()
      }}
    >
      {children}
    </dialog>,
    document.body,
  )
}

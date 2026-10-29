import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { Button, type ButtonProps } from '@/components/ui/button'

let openDialogCount = 0
let previousBodyOverflow = ''

type DialogProps = {
  id?: string
  title: string
  description?: string
  children: ReactNode
  isPending?: boolean
  onDismiss: () => void
  initialFocusSelector?: string
  returnFocusSelector?: string
}

export function Dialog({
  id,
  title,
  description,
  children,
  isPending = false,
  onDismiss,
  initialFocusSelector,
  returnFocusSelector,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    dialog?.showModal()
    if (initialFocusSelector) {
      dialog
        ?.querySelector<HTMLElement>(initialFocusSelector)
        ?.focus({ preventScroll: true })
    }
    if (openDialogCount === 0) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openDialogCount += 1

    return () => {
      dialog?.close()
      openDialogCount -= 1
      if (openDialogCount === 0) {
        document.body.style.overflow = previousBodyOverflow
      }
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        previousFocus.getClientRects().length
      ) {
        previousFocus.focus({ preventScroll: true })
      } else if (returnFocusSelector) {
        document.querySelector<HTMLElement>(returnFocusSelector)?.focus()
      }
    }
  }, [initialFocusSelector, returnFocusSelector])

  return createPortal(
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={isPending}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[840px] overflow-hidden rounded-xl border-0 bg-card p-0 text-foreground shadow-[var(--shadow-md)] backdrop:bg-[var(--color-modal-overlay)] open:flex open:flex-col"
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) onDismiss()
      }}
      onClick={(event) => {
        if (isPending || event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          onDismiss()
        }
      }}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-[13px] text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
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

type DialogFormProps = Omit<
  ComponentPropsWithoutRef<'form'>,
  'className' | 'style'
>

export const DialogForm = forwardRef<HTMLFormElement, DialogFormProps>(
  (props, ref) => (
    <form {...props} ref={ref} className="flex min-h-0 flex-col" />
  ),
)
DialogForm.displayName = 'DialogForm'

export function DialogBody({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 min-w-0 space-y-4 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6 sm:pb-6">
      {children}
    </div>
  )
}

export function DialogFooter({
  description,
  children,
}: {
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <footer className="flex shrink-0 flex-col gap-3 border-t border-[var(--color-border)] bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {description ? (
        <p className="text-xs font-medium text-muted-foreground" role="status">
          {description}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2.5 sm:ml-auto">
        {children}
      </div>
    </footer>
  )
}

export function DialogButton({
  type = 'button',
  ...props
}: Omit<ButtonProps, 'className' | 'style' | 'size' | 'asChild'>) {
  return (
    <Button
      {...props}
      type={type}
      size="sm"
      className="px-4 text-[13px] font-semibold"
    />
  )
}

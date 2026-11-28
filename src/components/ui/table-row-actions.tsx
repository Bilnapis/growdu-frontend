import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, type LucideIcon } from 'lucide-react'
import { Link, type To } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TableRowAction = {
  label: string
  icon: LucideIcon
  tone?: 'neutral' | 'danger' | 'success'
} & (
  | { to: To; onSelect?: never; disabled?: never }
  | { to?: never; onSelect: () => void; disabled?: boolean }
)

const actionTones = {
  neutral: 'border-[var(--color-border)] text-[var(--color-text)]',
  danger: 'border-[var(--color-danger-border)] text-[var(--color-danger)]',
  success: 'border-[var(--color-success-border)] text-[var(--color-success)]',
}

export function TableRowActions({
  label,
  actions,
}: {
  label: string
  actions: readonly TableRowAction[]
}) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const isOpen = portalTarget !== null
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useLayoutEffect(() => {
    if (!isOpen) return
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const bounds = trigger.getBoundingClientRect()
    const { width, height } = panel.getBoundingClientRect()
    const top =
      bounds.bottom + height + 8 > window.innerHeight
        ? bounds.top - height - 8
        : bounds.bottom + 8

    panel.style.left = `${Math.max(8, Math.min(bounds.right - width, window.innerWidth - width - 8))}px`
    panel.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`
    panel.querySelector<HTMLElement>('a, button:not(:disabled)')?.focus({
      preventScroll: true,
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function close() {
      setPortalTarget(null)
    }

    function onPointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !panelRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        close()
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        triggerRef.current?.focus({ preventScroll: true })
      }
    }

    function onScroll(event: Event) {
      if (
        event.target instanceof Node &&
        panelRef.current?.contains(event.target)
      ) {
        return
      }
      close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [isOpen])

  function closeAfterSelection() {
    setPortalTarget(null)
    triggerRef.current?.focus({ preventScroll: true })
  }

  if (actions.length === 0) return null

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label={`Menu aksi ${label}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={(event) => {
          const container =
            event.currentTarget.closest('dialog') ?? document.body
          setPortalTarget((current) => (current ? null : container))
        }}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </Button>
      {portalTarget
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="group"
              aria-label={`Aksi ${label}`}
              className="fixed z-50 grid max-h-[calc(100dvh-16px)] w-[180px] max-w-[calc(100vw-16px)] gap-1 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_8px_24px_rgb(15_23_42_/_10%)]"
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget) &&
                  !triggerRef.current?.contains(event.relatedTarget)
                ) {
                  setPortalTarget(null)
                }
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Tab') return
                const controls =
                  event.currentTarget.querySelectorAll<HTMLElement>(
                    'a, button:not(:disabled)',
                  )
                const boundary = event.shiftKey
                  ? controls[0]
                  : controls[controls.length - 1]
                if (document.activeElement !== boundary) return
                if (event.shiftKey) event.preventDefault()
                closeAfterSelection()
              }}
            >
              {actions.map((action) => {
                const Icon = action.icon
                const className = cn(
                  'flex w-full items-center justify-center gap-2 rounded-md border bg-[var(--color-surface)] px-4 py-2 text-center text-[13px] font-semibold leading-[1.3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  actionTones[action.tone ?? 'neutral'],
                )
                const content = (
                  <>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{action.label}</span>
                  </>
                )

                return action.to !== undefined ? (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={className}
                    onClick={closeAfterSelection}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    className={className}
                    disabled={action.disabled}
                    onClick={() => {
                      closeAfterSelection()
                      action.onSelect()
                    }}
                  >
                    {content}
                  </button>
                )
              })}
            </div>,
            portalTarget,
          )
        : null}
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PayrollRow } from './api'

export function PayrollRowActions({ payroll }: { payroll: PayrollRow }) {
  const [position, setPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!position) return
    panel.current?.querySelector('a')?.focus({ preventScroll: true })
    const pointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !panel.current?.contains(event.target) &&
        !trigger.current?.contains(event.target)
      )
        setPosition(null)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPosition(null)
        trigger.current?.focus()
      }
    }
    const close = () => setPosition(null)
    document.addEventListener('pointerdown', pointer)
    document.addEventListener('keydown', key)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('pointerdown', pointer)
      document.removeEventListener('keydown', key)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [position])
  return (
    <>
      <Button
        ref={trigger}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Aksi ${payroll.number}`}
        aria-expanded={Boolean(position)}
        aria-controls={position ? `payroll-actions-${payroll.id}` : undefined}
        onClick={() => {
          const bounds = trigger.current?.getBoundingClientRect()
          if (!bounds || position) {
            setPosition(null)
            return
          }
          setPosition({
            top: Math.max(
              8,
              Math.min(bounds.bottom + 4, window.innerHeight - 110),
            ),
            left: Math.max(
              8,
              Math.min(bounds.right - 176, window.innerWidth - 184),
            ),
          })
        }}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </Button>
      {position
        ? createPortal(
            <div
              ref={panel}
              role="group"
              id={`payroll-actions-${payroll.id}`}
              aria-label={`Aksi ${payroll.number}`}
              style={position}
              className="fixed z-50 grid w-44 gap-1 rounded-md border bg-card p-2 shadow-[var(--shadow-md)]"
              onBlur={(event) => {
                if (
                  event.relatedTarget instanceof Node &&
                  !event.currentTarget.contains(event.relatedTarget) &&
                  event.relatedTarget !== trigger.current
                )
                  setPosition(null)
              }}
            >
              <Button asChild size="sm" variant="outline">
                <Link to={`/payroll/${payroll.id}`}>
                  <Eye size={15} aria-hidden="true" />
                  Lihat Detail
                </Link>
              </Button>
              {payroll.status !== 'paid' ? (
                <Button asChild size="sm">
                  <Link to={`/payroll/${payroll.id}?action=payment`}>
                    <Wallet size={15} aria-hidden="true" />
                    Bayar Gaji
                  </Link>
                </Button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

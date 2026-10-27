import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Eye, MoreHorizontal, Pencil, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StaffMember } from '@/features/staff/api/staff-api'

type Action = 'detail' | 'edit' | 'status'

export function StaffRowActions({
  staff,
  onAction,
}: {
  staff: StaffMember
  onAction: (action: Action) => void
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  useEffect(() => {
    if (!position) return
    panelRef.current?.querySelector('button')?.focus()
    function close() {
      setPosition(null)
    }
    function onPointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !panelRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      )
        close()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [position])

  function select(action: Action) {
    setPosition(null)
    triggerRef.current?.focus()
    onAction(action)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary-text"
        onClick={() => onAction('edit')}
        aria-label={`Edit ${staff.name}`}
      >
        <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
      </Button>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label={`Menu aksi ${staff.name}`}
        aria-expanded={Boolean(position)}
        aria-controls={position ? `staff-actions-${staff.id}` : undefined}
        onClick={() => {
          const rect = triggerRef.current?.getBoundingClientRect()
          if (!rect) return
          setPosition((current) =>
            current
              ? null
              : {
                  left: Math.max(
                    8,
                    Math.min(rect.right - 200, window.innerWidth - 208),
                  ),
                  top: Math.max(
                    8,
                    rect.bottom + 160 > window.innerHeight
                      ? rect.top - 152
                      : rect.bottom + 8,
                  ),
                },
          )
        }}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
      </Button>
      {position
        ? createPortal(
            <div
              ref={panelRef}
              id={`staff-actions-${staff.id}`}
              role="group"
              aria-label={`Aksi ${staff.name}`}
              style={position}
              className="fixed z-30 w-[200px] space-y-1 rounded-lg border bg-card p-2 shadow-md"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setPosition(null)
              }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full text-[13px]"
                onClick={() => select('detail')}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Lihat detail
              </Button>
              <Button
                type="button"
                className="w-full text-[13px]"
                onClick={() => select('edit')}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Ubah data & hak akses
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-[13px] text-destructive"
                onClick={() => select('status')}
              >
                {staff.status === 'active' ? (
                  <UserX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {staff.status === 'active'
                  ? 'Nonaktifkan pegawai'
                  : 'Aktifkan pegawai'}
              </Button>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

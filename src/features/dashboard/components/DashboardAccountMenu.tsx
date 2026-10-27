import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserRoundPen } from 'lucide-react'

import { Button } from '@/components/ui/button'

type DashboardAccountMenuProps = {
  accountName: string
  isLoggingOut: boolean
  onLogout: () => void
}

export function DashboardAccountMenu({
  accountName,
  isLoggingOut,
  onLogout,
}: DashboardAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const triggerId = useId()
  const initials = accountName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join('')
    .toLocaleUpperCase('id-ID')

  useEffect(() => {
    if (!isOpen) return

    menuRef.current
      ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      ?.focus()

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      setIsOpen(false)
      triggerRef.current?.focus()
      return
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()

    if (!isOpen) {
      setIsOpen(true)
      return
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)',
      ) ?? [],
    )
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement,
    )
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (currentIndex +
              (event.key === 'ArrowDown' ? 1 : -1) +
              items.length) %
            items.length
    items[nextIndex]?.focus()
  }

  return (
    <div
      ref={containerRef}
      className="relative min-w-0"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
    >
      <Button
        ref={triggerRef}
        id={triggerId}
        type="button"
        variant="ghost"
        size="sm"
        className="max-w-full gap-2.5 px-0 hover:bg-transparent"
        aria-label={`Menu akun ${accountName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        disabled={isLoggingOut}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-xs font-semibold text-[var(--color-brand-800)]"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="max-w-[min(12rem,45vw)] truncate text-sm font-medium leading-5">
          {isLoggingOut ? 'Keluar...' : accountName}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </Button>

      {isOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="absolute right-0 top-full z-30 mt-[7px] w-60 max-w-[calc(100vw-2.5rem)] space-y-0.5 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-[var(--shadow-md)]"
        >
          <Button
            type="button"
            role="menuitem"
            variant="ghost"
            tabIndex={-1}
            className="w-full justify-start gap-2.5 px-2.5"
            disabled
            aria-label="Ubah data profil akun (belum tersedia)"
          >
            <UserRoundPen className="h-4 w-4" aria-hidden="true" />
            Ubah data
          </Button>
          <div role="separator" className="h-px bg-border" />
          <Button
            type="button"
            role="menuitem"
            variant="ghost"
            tabIndex={-1}
            className="w-full justify-start gap-2.5 px-2.5 text-destructive hover:bg-[var(--color-danger-bg)] hover:text-destructive"
            disabled={isLoggingOut}
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {isLoggingOut ? 'Keluar...' : 'Keluar'}
          </Button>
        </div>
      ) : null}
      {isLoggingOut ? (
        <span role="status" className="sr-only">
          Sedang keluar dari akun...
        </span>
      ) : null}
    </div>
  )
}

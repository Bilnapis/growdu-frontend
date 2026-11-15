import { useEffect, useRef, type InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from './input'

type DebouncedSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: string
  onSearch: (value: string) => void
}

export function DebouncedSearchInput({
  value = '',
  onSearch,
  onKeyDown,
  className,
  ...props
}: DebouncedSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onSearchRef = useRef(onSearch)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    clearTimeout(timer.current)
    if (inputRef.current && inputRef.current.value.trim() !== value) {
      inputRef.current.value = value
    }
  }, [value])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]"
        aria-hidden="true"
      />
      <Input
        {...props}
        ref={inputRef}
        type="search"
        className={cn(
          'h-10 rounded-md border-[var(--color-border)] pl-10 text-[13px] font-medium text-[var(--color-text)] placeholder:text-[var(--color-muted)]',
          className,
        )}
        defaultValue={value}
        onChange={(event) => {
          clearTimeout(timer.current)
          const search = event.target.value.trim()
          if (search !== value) {
            timer.current = setTimeout(() => onSearchRef.current(search), 300)
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (
            !event.defaultPrevented &&
            event.key === 'Enter' &&
            !event.nativeEvent.isComposing
          ) {
            clearTimeout(timer.current)
            const search = event.currentTarget.value.trim()
            if (!event.currentTarget.form && search !== value) {
              onSearchRef.current(search)
            }
          }
        }}
      />
    </div>
  )
}

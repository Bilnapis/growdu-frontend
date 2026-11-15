import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SelectHTMLAttributes,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string
}

type SelectOption = {
  label: string
  disabled: boolean
  group: string | null
}

type OpenMenu = {
  options: SelectOption[]
  activeIndex: number
}

function readOptions(select: HTMLSelectElement): SelectOption[] {
  return Array.from(select.options, (option) => ({
    label: option.label,
    disabled: option.matches(':disabled'),
    group:
      option.parentElement instanceof HTMLOptGroupElement
        ? option.parentElement.label
        : null,
  }))
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      placeholder,
      multiple,
      size,
      onChange,
      onPointerDown,
      onClick,
      onKeyDown,
      onBlur,
      onFocus,
      onInvalid,
      style,
      ...props
    },
    ref,
  ) => {
    const selectRef = useRef<HTMLSelectElement | null>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef({ text: '', time: 0 })
    const listId = useId()
    const [menu, setMenu] = useState<OpenMenu | null>(null)
    const [selectedLabel, setSelectedLabel] = useState(placeholder ?? '')
    const [fieldLabel, setFieldLabel] = useState('')
    const [validationMessage, setValidationMessage] = useState('')
    const showChevron = !multiple && (size === undefined || size <= 1)
    const customPopup =
      showChevron &&
      typeof HTMLElement !== 'undefined' &&
      'showPopover' in HTMLElement.prototype
    const isOpen = customPopup && menu !== null
    const activeIndex = menu?.activeIndex ?? -1
    const selectClassName = cn(
      'peer h-11 w-full min-w-0 rounded-md border border-input bg-[var(--color-surface)] px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
      className,
    )

    useLayoutEffect(() => {
      const select = selectRef.current
      if (!select) return
      setSelectedLabel(select.selectedOptions[0]?.label ?? placeholder ?? '')
      setFieldLabel(
        Array.from(select.labels ?? [], (label) =>
          label.textContent?.trim(),
        ).join(' '),
      )
    }, [props.value, props.defaultValue, children, placeholder])

    useEffect(() => {
      const select = selectRef.current
      const form = select?.form
      if (!select || !form) return
      const reset = () =>
        queueMicrotask(() => {
          if (!select.isConnected) return
          setSelectedLabel(select.selectedOptions[0]?.label ?? '')
          setValidationMessage('')
          setMenu(null)
        })
      form.addEventListener('reset', reset)
      return () => form.removeEventListener('reset', reset)
    }, [props.form])

    function openMenu(edge?: 'first' | 'last') {
      const select = selectRef.current
      if (!select || select.matches(':disabled')) return
      const options = readOptions(select)
      const enabled = options.flatMap((option, index) =>
        option.disabled ? [] : [index],
      )
      const selected = options[select.selectedIndex]
      const activeIndex =
        edge === 'last'
          ? (enabled[enabled.length - 1] ?? -1)
          : edge === 'first' || !selected || selected.disabled
            ? (enabled[0] ?? -1)
            : select.selectedIndex
      searchRef.current = { text: '', time: 0 }
      setMenu({ options, activeIndex })
    }

    function chooseOption(index: number) {
      const select = selectRef.current
      const option = select?.options[index]
      if (
        !select ||
        select.matches(':disabled') ||
        !option ||
        option.matches(':disabled')
      )
        return
      select.selectedIndex = index
      select.dispatchEvent(new Event('change', { bubbles: true }))
      setMenu(null)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLSelectElement>) {
      onKeyDown?.(event)
      if (
        event.defaultPrevented ||
        !customPopup ||
        event.currentTarget.matches(':disabled')
      )
        return

      if (event.key === 'Escape' && menu) {
        event.preventDefault()
        event.stopPropagation()
        setMenu(null)
      } else if (event.key === 'Tab') {
        if (menu && menu.activeIndex >= 0) chooseOption(menu.activeIndex)
        else setMenu(null)
      } else if (
        event.key === 'Enter' ||
        (event.key === ' ' && Date.now() - searchRef.current.time > 700)
      ) {
        event.preventDefault()
        if (menu) chooseOption(menu.activeIndex)
        else openMenu()
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        openMenu(event.key === 'Home' ? 'first' : 'last')
      } else if (
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)
      ) {
        event.preventDefault()
        if (event.altKey && event.key === 'ArrowDown') {
          if (!menu) openMenu()
          return
        }
        if (event.altKey && event.key === 'ArrowUp') {
          if (menu) chooseOption(menu.activeIndex)
          return
        }
        if (!menu) {
          openMenu()
          return
        }
        const enabled = menu.options.flatMap((option, index) =>
          option.disabled ? [] : [index],
        )
        const direction =
          event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1
        const step = event.key.startsWith('Page') ? 10 : 1
        const position = enabled.indexOf(menu.activeIndex)
        const next = Math.max(
          0,
          Math.min(enabled.length - 1, position + direction * step),
        )
        setMenu({ ...menu, activeIndex: enabled[next] ?? -1 })
      } else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault()
        const options = menu?.options ?? readOptions(event.currentTarget)
        const now = Date.now()
        const previous =
          now - searchRef.current.time <= 700 ? searchRef.current.text : ''
        const text = (previous + event.key).toLocaleLowerCase()
        searchRef.current = { text, time: now }
        const repeated = Array.from(text).every(
          (character) => character === text[0],
        )
        const query = repeated ? event.key.toLocaleLowerCase() : text
        const current = menu?.activeIndex ?? event.currentTarget.selectedIndex
        const start = current + (repeated || !previous ? 1 : 0)
        const index = Array.from(
          { length: options.length },
          (_, offset) => (start + offset + options.length) % options.length,
        ).find(
          (candidate) =>
            !options[candidate].disabled &&
            options[candidate].label
              .trim()
              .toLocaleLowerCase()
              .startsWith(query),
        )
        setMenu({ options, activeIndex: index ?? menu?.activeIndex ?? current })
      }
    }

    useEffect(() => {
      const select = selectRef.current
      if (!select) return
      // Read the committed option nodes when asynchronous choices change.
      setMenu((current) => {
        if (!current || select.matches(':disabled')) return null
        return {
          options: readOptions(select),
          activeIndex: select.selectedIndex,
        }
      })
    }, [children, placeholder, props.disabled])

    useLayoutEffect(() => {
      const select = triggerRef.current
      const panel = panelRef.current
      if (!isOpen || !select || !panel) return

      function positionPanel() {
        if (!select || !panel) return
        const bounds = select.getBoundingClientRect()
        const width = Math.min(bounds.width, window.innerWidth - 16)
        const top = bounds.bottom + 4
        Object.assign(panel.style, {
          top: `${top}px`,
          left: `${Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8))}px`,
          width: `${width}px`,
          maxHeight: `${Math.max(40, Math.min(240, window.innerHeight - top - 8))}px`,
        })
      }
      positionPanel()
      panel.showPopover()
      const observer = new ResizeObserver(positionPanel)
      observer.observe(select)
      const dismiss = (event: PointerEvent) => {
        if (
          event.target instanceof Node &&
          !wrapperRef.current?.contains(event.target)
        )
          setMenu(null)
      }
      const scroll = (event: Event) => {
        if (event.target instanceof Node && !panel.contains(event.target))
          setMenu(null)
      }
      document.addEventListener('pointerdown', dismiss, true)
      window.addEventListener('resize', positionPanel)
      window.addEventListener('scroll', scroll, true)
      return () => {
        panel.hidePopover()
        observer.disconnect()
        document.removeEventListener('pointerdown', dismiss, true)
        window.removeEventListener('resize', positionPanel)
        window.removeEventListener('scroll', scroll, true)
      }
    }, [isOpen])

    useEffect(() => {
      if (isOpen)
        document
          .getElementById(`${listId}-${activeIndex}`)
          ?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex, isOpen, listId])

    return (
      <div ref={wrapperRef} className="relative min-w-0">
        <select
          {...props}
          multiple={multiple}
          size={size}
          ref={(select) => {
            selectRef.current = select
            if (typeof ref === 'function') ref(select)
            else if (ref) ref.current = select
          }}
          tabIndex={customPopup ? -1 : props.tabIndex}
          aria-hidden={customPopup ? true : props['aria-hidden']}
          className={
            customPopup
              ? 'sr-only'
              : cn(
                  selectClassName,
                  showChevron &&
                    'appearance-none pe-10 forced-colors:appearance-auto',
                )
          }
          style={customPopup ? undefined : style}
          onPointerDown={onPointerDown}
          onClick={(event) => {
            onClick?.(event)
            if (!customPopup) return
            const cancelled = event.defaultPrevented
            event.preventDefault()
            if (cancelled) return
            triggerRef.current?.focus({ preventScroll: true })
            if (menu) setMenu(null)
            else openMenu()
          }}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            onFocus?.(event)
            if (customPopup && document.activeElement === event.currentTarget)
              triggerRef.current?.focus({ preventScroll: true })
          }}
          onInvalid={(event) => {
            onInvalid?.(event)
            if (!customPopup || event.defaultPrevented) return
            event.preventDefault()
            setValidationMessage(event.currentTarget.validationMessage)
            const firstInvalid = event.currentTarget.form?.querySelector(
              'input:invalid, select:invalid, textarea:invalid',
            )
            if (!firstInvalid || firstInvalid === event.currentTarget)
              triggerRef.current?.focus()
          }}
          onBlur={(event) => {
            onBlur?.(event)
            setMenu(null)
          }}
          onChange={(event) => {
            setMenu(null)
            setValidationMessage('')
            onChange?.(event)
            const select = event.currentTarget
            queueMicrotask(() => {
              if (select.isConnected)
                setSelectedLabel(select.selectedOptions[0]?.label ?? '')
            })
          }}
        >
          {placeholder !== undefined ? (
            <option value="">{placeholder}</option>
          ) : null}
          {children}
        </select>
        {customPopup ? (
          <button
            ref={triggerRef}
            id={`${listId}-trigger`}
            type="button"
            role="combobox"
            disabled={props.disabled}
            tabIndex={props.tabIndex}
            autoFocus={props.autoFocus}
            title={props.title}
            dir={props.dir}
            style={style}
            aria-label={props['aria-label'] ?? (fieldLabel || undefined)}
            aria-labelledby={props['aria-labelledby']}
            aria-describedby={
              [
                props['aria-describedby'],
                validationMessage ? `${listId}-error` : undefined,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-invalid={validationMessage ? true : props['aria-invalid']}
            aria-required={props.required || props['aria-required']}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listId : undefined}
            aria-activedescendant={
              isOpen && activeIndex >= 0
                ? `${listId}-${activeIndex}`
                : undefined
            }
            className={cn(
              selectClassName,
              'flex items-center justify-between gap-3 text-start',
            )}
            onPointerDown={(event) => {
              if (!onPointerDown || !selectRef.current) return
              const forwarded = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                button: event.button,
                pointerType: event.pointerType,
              })
              event.stopPropagation()
              if (!selectRef.current.dispatchEvent(forwarded))
                event.preventDefault()
            }}
            onClick={(event) => {
              event.stopPropagation()
              selectRef.current?.click()
            }}
            onKeyDown={(event) => {
              event.stopPropagation()
              const forwarded = new window.KeyboardEvent('keydown', {
                key: event.key,
                code: event.code,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
                bubbles: true,
                cancelable: true,
              })
              if (!selectRef.current?.dispatchEvent(forwarded))
                event.preventDefault()
            }}
            onFocus={(event) => {
              if (onFocus)
                selectRef.current?.dispatchEvent(
                  new FocusEvent('focusin', {
                    bubbles: true,
                    relatedTarget: event.relatedTarget,
                  }),
                )
            }}
            onBlur={(event) => {
              if (onBlur)
                selectRef.current?.dispatchEvent(
                  new FocusEvent('focusout', {
                    bubbles: true,
                    relatedTarget: event.relatedTarget,
                  }),
                )
              setMenu(null)
            }}
          >
            <span className="min-w-0 truncate">{selectedLabel}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </button>
        ) : showChevron ? (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-disabled:opacity-50 forced-colors:hidden"
          />
        ) : null}
        {customPopup ? (
          <div
            ref={(panel) => {
              panelRef.current = panel
              if (panel && !panel.hasAttribute('popover')) {
                panel.setAttribute('popover', 'manual')
              }
            }}
            id={listId}
            role="listbox"
            aria-label={props['aria-label'] ?? (fieldLabel || 'Pilihan')}
            aria-labelledby={props['aria-labelledby']}
            dir={props.dir}
            className="fixed inset-auto m-0 overflow-y-auto overscroll-contain rounded-md border border-input bg-[var(--color-surface)] p-1 text-sm font-normal text-foreground shadow-[var(--shadow-md)]"
            onMouseDown={(event) => {
              if (event.target !== event.currentTarget) event.preventDefault()
            }}
          >
            {menu?.options.length === 0 ? (
              <p className="px-3 py-2 text-muted-foreground">
                Tidak ada pilihan tersedia.
              </p>
            ) : null}
            {menu?.options.map((option, index) => (
              <div key={index}>
                {option.group &&
                option.group !== menu.options[index - 1]?.group ? (
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    {option.group}
                  </p>
                ) : null}
                <div
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === selectRef.current?.selectedIndex}
                  aria-disabled={option.disabled || undefined}
                  className={cn(
                    'flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-start',
                    (menu.activeIndex === index ||
                      index === selectRef.current?.selectedIndex) &&
                      !option.disabled &&
                      'bg-[var(--color-primary-soft)] text-primary-text',
                    option.disabled && 'cursor-not-allowed opacity-50',
                  )}
                  onPointerMove={(event) => {
                    if (
                      event.pointerType !== 'touch' &&
                      !option.disabled &&
                      menu.activeIndex !== index
                    )
                      setMenu({ ...menu, activeIndex: index })
                  }}
                  onClick={() => chooseOption(index)}
                >
                  <span className="min-w-0 break-words">{option.label}</span>
                  {index === selectRef.current?.selectedIndex ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {validationMessage ? (
          <p
            id={`${listId}-error`}
            role="alert"
            className="mt-1 text-xs text-destructive"
          >
            {validationMessage}
          </p>
        ) : null}
      </div>
    )
  },
)
Select.displayName = 'Select'

export { Select }

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  forwardRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'
import {
  formatCurrencyValue,
  getCurrencyCaretPosition,
  normalizeCurrencyValue,
} from './currency-input'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  isPhone?: boolean
  /** Shows thousands separators while onChange and FormData receive digits only. */
  isCurrency?: boolean
  leadingText?: string
}

const inputClassName =
  'flex h-11 w-full rounded-md border border-input bg-[var(--color-surface)] px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

function normalizePhoneValue(value: string) {
  return value.replace(/\D/g, '').replace(/^0+/, '')
}

function normalizePhoneInputValue(
  value: InputHTMLAttributes<HTMLInputElement>['value'],
) {
  if (value === undefined) {
    return undefined
  }

  return normalizePhoneValue(String(value))
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      isPhone = false,
      isCurrency = false,
      leadingText,
      onChange,
      value,
      defaultValue,
      disabled,
      name,
      ...props
    },
    ref,
  ) => {
    const [currencyValue, setCurrencyValue] = useState(() =>
      normalizeCurrencyValue(defaultValue),
    )
    const rawCurrencyValue =
      value === undefined ? currencyValue : normalizeCurrencyValue(value)
    const isPhoneInput = isPhone && !isCurrency

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.currentTarget.value = normalizePhoneValue(event.currentTarget.value)
      onChange?.(event)
    }

    const handleCurrencyChange = (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget
      const rawValue = normalizeCurrencyValue(input.value)
      const caret = getCurrencyCaretPosition(input.value, input.selectionStart)
      if (value === undefined) setCurrencyValue(rawValue)
      input.value = rawValue
      try {
        onChange?.(event)
      } finally {
        input.value = formatCurrencyValue(rawValue)
        input.setSelectionRange(caret, caret)
      }
    }

    const inputProps: InputHTMLAttributes<HTMLInputElement> = {
      ...props,
      name: isCurrency ? undefined : name,
      type: isCurrency || isPhoneInput ? 'text' : type,
      inputMode: isCurrency
        ? 'numeric'
        : (props.inputMode ?? (isPhoneInput ? 'numeric' : undefined)),
      pattern: isCurrency
        ? '[0-9]{1,3}(\\.[0-9]{3})*'
        : (props.pattern ?? (isPhoneInput ? '[0-9]*' : undefined)),
      value: isCurrency
        ? formatCurrencyValue(rawCurrencyValue)
        : isPhoneInput
          ? normalizePhoneInputValue(value)
          : value,
      defaultValue: isCurrency
        ? undefined
        : isPhoneInput
          ? normalizePhoneInputValue(defaultValue)
          : defaultValue,
      disabled,
      onChange: isCurrency
        ? handleCurrencyChange
        : isPhoneInput
          ? handlePhoneChange
          : onChange,
    }

    const hiddenCurrencyInput =
      isCurrency && name ? (
        <input
          type="hidden"
          name={name}
          value={rawCurrencyValue}
          disabled={disabled}
          form={props.form}
        />
      ) : null

    if (isPhoneInput || leadingText) {
      return (
        <div
          className={cn(
            inputClassName,
            'items-center gap-2 px-3 py-0 focus-within:ring-2 focus-within:ring-ring focus-within:ring',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <span className="shrink-0 text-sm text-foreground">
            {isPhoneInput ? '+62' : leadingText}
          </span>
          <input
            {...inputProps}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            ref={ref}
          />
          {hiddenCurrencyInput}
        </div>
      )
    }

    return (
      <>
        <input
          {...inputProps}
          className={cn(inputClassName, className)}
          ref={ref}
        />
        {hiddenCurrencyInput}
      </>
    )
  },
)
Input.displayName = 'Input'

export { Input }

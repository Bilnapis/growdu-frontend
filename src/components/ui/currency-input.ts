type CurrencyValue = string | number | readonly string[] | undefined

export function normalizeCurrencyValue(
  value: CurrencyValue,
  allowDecimals = false,
): string {
  if (allowDecimals) {
    const [whole = '', fraction] = String(value ?? '').split('.')
    const digits = whole.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    return fraction === undefined
      ? digits
      : `${digits || '0'}.${fraction.replace(/\D/g, '').slice(0, 2)}`
  }
  return String(value ?? '')
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
}

export function formatCurrencyValue(
  value: CurrencyValue,
  allowDecimals = false,
) {
  const [whole = '', fraction] = normalizeCurrencyValue(
    value,
    allowDecimals,
  ).split('.')
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return fraction === undefined || fraction === '00'
    ? formattedWhole
    : `${formattedWhole},${fraction}`
}

export function getCurrencyCaretPosition(
  inputValue: string,
  selectionStart: number | null,
) {
  const digits = inputValue.replace(/\D/g, '')
  const rawValue = normalizeCurrencyValue(inputValue)
  const formatted = formatCurrencyValue(rawValue)
  const digitsBeforeCaret = inputValue
    .slice(0, selectionStart ?? inputValue.length)
    .replace(/\D/g, '').length
  const targetDigit = Math.max(
    0,
    digitsBeforeCaret - (digits.length - rawValue.length),
  )

  if (targetDigit === 0) return 0

  let digitCount = 0
  for (let index = 0; index < formatted.length; index += 1) {
    if (formatted[index] !== '.') digitCount += 1
    if (digitCount === targetDigit) return index + 1
  }
  return formatted.length
}

export function normalizeCurrencyInputValue(
  value: string,
  allowDecimals = false,
) {
  return normalizeCurrencyValue(
    allowDecimals ? value.replace(/\./g, '').replace(',', '.') : value,
    allowDecimals,
  )
}

export function getDecimalCurrencyCaretPosition(
  inputValue: string,
  selectionStart: number | null,
) {
  const rawValue = normalizeCurrencyInputValue(inputValue, true)
  const formatted = formatCurrencyValue(rawValue, true)
  const caret = selectionStart ?? inputValue.length
  const commaIndex = inputValue.indexOf(',')
  if (commaIndex >= 0 && caret > commaIndex) {
    const formattedCommaIndex = formatted.indexOf(',')
    if (formattedCommaIndex < 0) return formatted.length
    const fractionalDigits = inputValue
      .slice(commaIndex + 1, caret)
      .replace(/\D/g, '').length
    return Math.min(
      formatted.length,
      formattedCommaIndex + 1 + fractionalDigits,
    )
  }
  return getCurrencyCaretPosition(inputValue.split(',')[0] ?? '', caret)
}

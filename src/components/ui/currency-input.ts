type CurrencyValue = string | number | readonly string[] | undefined

export function normalizeCurrencyValue(value: CurrencyValue) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
}

export function formatCurrencyValue(value: CurrencyValue) {
  return normalizeCurrencyValue(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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

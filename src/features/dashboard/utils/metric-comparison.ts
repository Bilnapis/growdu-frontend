const numberFormatter = new Intl.NumberFormat('id-ID')

export function previousMonthDate(date: string) {
  const value = new Date(`${date}T00:00:00Z`)
  const day = value.getUTCDate()
  value.setUTCDate(1)
  value.setUTCDate(0)
  value.setUTCDate(Math.min(day, value.getUTCDate()))
  return value.toISOString().slice(0, 10)
}

export function formatMetricComparison(
  current: number | undefined,
  previous: number | null | undefined,
) {
  if (current === undefined || previous == null) {
    return 'Data bulan lalu belum tersedia'
  }

  const difference = current - previous

  if (difference === 0) {
    return 'Tidak berubah dibandingkan bulan lalu'
  }

  const direction = difference > 0 ? 'Naik' : 'Turun'
  return `${direction} ${numberFormatter.format(Math.abs(difference))} dibandingkan bulan lalu`
}

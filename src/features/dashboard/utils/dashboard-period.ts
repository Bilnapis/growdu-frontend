import { previousMonthDate } from './metric-comparison'

export function dashboardMonthRange(month: string) {
  const next = new Date(`${month}-01T00:00:00Z`)
  next.setUTCMonth(next.getUTCMonth() + 1)
  next.setUTCDate(0)
  return { from: `${month}-01`, to: next.toISOString().slice(0, 10) }
}

export function previousDashboardMonth(month: string) {
  return previousMonthDate(`${month}-01`).slice(0, 7)
}

export function dashboardMonthLabel(month: string) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${month}-01T00:00:00+07:00`))
}

export function isDashboardMonth(value: string, currentMonth: string) {
  return /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value) && value <= currentMonth
}

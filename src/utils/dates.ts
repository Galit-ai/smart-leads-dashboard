/** התאריך של היום בפורמט YYYY-MM-DD, לפי השעון המקומי */
export function today(): string {
  return toDateString(new Date())
}

export function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

/** כמה ימים עברו מ-from ועד to (שלילי אם from בעתיד) */
export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime()
  const b = new Date(`${to}T00:00:00`).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function formatDate(date: string): string {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

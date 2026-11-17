export function isoDate(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)) // Monday
  return x
}
export function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export function currentSeason(d = new Date()) {
  const m = d.getMonth()
  return m < 2 || m === 11 ? 'winter' : m < 5 ? 'spring' : m < 8 ? 'summer' : 'autumn'
}

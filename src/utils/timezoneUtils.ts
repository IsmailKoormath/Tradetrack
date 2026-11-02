const cache = new Map<string, Intl.DateTimeFormat>()
const dtf = (tz: string) => {
  let f = cache.get(tz)
  if (!f) { f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }); cache.set(tz, f) }
  return f
}
const parts = (ms: number, tz: string) => { const o: Record<string, string> = {}; for (const p of dtf(tz).formatToParts(ms)) o[p.type] = p.value; return o }
const offsetMs = (ms: number, tz: string) => {
  const p = parts(ms, tz)
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000
}
/** UTC instant -> wall-clock day and time in the given timezone. */
export function utcToZoned(iso: string, tz: string) {
  const p = parts(Date.parse(iso), tz)
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}
/** Wall-clock date/time typed in the given timezone -> UTC instant (second pass handles DST edges). */
export function zonedToUtc(date: string, time: string, tz: string): string {
  const [y, m, d] = date.split('-').map(Number), [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const first = guess - offsetMs(guess, tz)
  return new Date(guess - offsetMs(first, tz)).toISOString()
}

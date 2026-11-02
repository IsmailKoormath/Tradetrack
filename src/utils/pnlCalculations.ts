import type { LocalTrade, Trade } from '../types/trade'
/** Integer-cent arithmetic avoids float drift when summing money. */
const cents = (n: number) => Math.round(n * 100)
export const sumPnl = (ts: Trade[]) => ts.reduce((s, x) => s + cents(x.pnl), 0) / 100
export function dailyTotals(ts: LocalTrade[]): Map<string, { pnl: number; count: number }> {
  const m = new Map<string, { pnl: number; count: number }>()
  for (const x of ts) { const d = m.get(x.date) ?? { pnl: 0, count: 0 }; d.pnl = (cents(d.pnl) + cents(x.pnl)) / 100; d.count++; m.set(x.date, d) }
  return m
}
export function monthStats(ts: Trade[]) {
  const wins = ts.filter(x => x.pnl > 0).length, losses = ts.filter(x => x.pnl < 0).length
  const closed = wins + losses
  return { net: sumPnl(ts), count: ts.length, wins, losses, winRate: closed ? (wins / closed) * 100 : 0 }
}
export const fmt = (n: number) => (n > 0 ? '+' : n < 0 ? '-' : '') + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 })

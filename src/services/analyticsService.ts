/** Pure statistics over already-filtered rows. Amounts are in one currency; math is done in integer cents. */
export interface Row { id: string; date: string; timestamp: string; accountId: string; symbol: string; pnl: number }
const c = (n: number) => Math.round(n * 100), r = (n: number) => n / 100
export function computeAnalytics(rows: Row[]) {
  const sorted = [...rows].sort((a, b) => a.timestamp.localeCompare(b.timestamp)) // chronological, for drawdown
  let gp = 0, gl = 0, wins = 0, losses = 0, flat = 0, bestW = 0, worstL = 0, eq = 0, peak = 0, dd = 0
  const days = new Map<string, { pnl: number; trades: number }>(), months = new Map<string, number>(), accts = new Map<string, number>()
  for (const t of sorted) {
    const p = c(t.pnl)
    if (p > 0) { wins++; gp += p; bestW = Math.max(bestW, p) } else if (p < 0) { losses++; gl += p; worstL = Math.min(worstL, p) } else flat++
    eq += p; peak = Math.max(peak, eq); dd = Math.max(dd, peak - eq)
    const d = days.get(t.date) ?? { pnl: 0, trades: 0 }; d.pnl += p; d.trades++; days.set(t.date, d)
    months.set(t.date.slice(0, 7), (months.get(t.date.slice(0, 7)) ?? 0) + p)
    accts.set(t.accountId, (accts.get(t.accountId) ?? 0) + p)
  }
  const daily = [...days].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, pnl: r(v.pnl), trades: v.trades }))
  let run = 0
  const equity = daily.map(d => { run = Math.round((run + d.pnl) * 100) / 100; return { date: d.date, equity: run } })
  return {
    net: r(eq), count: sorted.length, wins, losses, flat,
    winRate: sorted.length ? (wins / sorted.length) * 100 : 0, // every saved trade has a realized P&L, so all are closed
    winningDays: daily.filter(d => d.pnl > 0).length, losingDays: daily.filter(d => d.pnl < 0).length, tradingDays: daily.length,
    avgWin: wins ? r(gp / wins) : 0, avgLoss: losses ? r(gl / losses) : 0, largestWin: r(bestW), largestLoss: r(worstL),
    profitFactor: gl === 0 ? (gp > 0 ? Infinity : 0) : gp / Math.abs(gl), // no division by zero
    maxDrawdown: r(dd), avgPerDay: daily.length ? sorted.length / daily.length : 0,
    daily, equity,
    monthly: [...months].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, pnl: r(v) })),
    accounts: [...accts].map(([accountId, v]) => ({ accountId, pnl: r(v) })),
  }
}

import { fmt } from '../../utils/pnlCalculations'
import type { monthStats } from '../../utils/pnlCalculations'
export default function Summary({ s, currency }: { s: ReturnType<typeof monthStats>; currency: string }) {
  const color = s.net > 0 ? 'text-profit' : s.net < 0 ? 'text-loss' : 'text-flat'
  return (
    <section className="grid grid-cols-2 gap-4 px-1">
      <div><p className="text-dim">Monthly Net P&L</p><p className={`text-3xl font-semibold mt-1 ${color}`}>{fmt(s.net)} {currency}</p></div>
      <div><p className="text-dim">Total Trades</p><p className="text-3xl font-semibold mt-1">{s.count}</p></div>
      <p className="col-span-2 text-sm text-dim">{s.wins} wins, {s.losses} losses, {s.winRate.toFixed(0)}% win rate</p>
    </section>
  )
}

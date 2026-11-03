import { useMemo, useState } from 'react'
import type { Store } from '../hooks/useStore'
import { computeAnalytics, type Row } from '../services/analyticsService'
import { convert } from '../utils/currencyUtils'
import { utcToZoned } from '../utils/timezoneUtils'
import { fmt } from '../utils/pnlCalculations'
import { AccountChart, DailyChart, EquityChart, MonthlyChart, WinLossChart } from '../components/analytics/Charts'
const field = 'bg-bg2 border border-line rounded-lg px-2 py-1.5 text-sm w-full'
const tone = (n: number) => (n > 0 ? 'text-profit' : n < 0 ? 'text-loss' : 'text-ink')
export default function Analytics({ store }: { store: Store }) {
  const { trades, accounts, pref } = store
  const [accountId, setAccountId] = useState('all'), [symbol, setSymbol] = useState('all'), [from, setFrom] = useState(''), [to, setTo] = useState('')
  const sel = accounts.find(a => a.id === accountId)
  const view = pref !== 'native' ? pref : sel ? sel.currency : 'USD' // never mix currencies unconverted
  const symbols = useMemo(() => [...new Set(trades.map(t => t.symbol))].sort(), [trades])
  const rows = useMemo<Row[]>(() => trades.flatMap(t => {
    const a = accounts.find(x => x.id === t.accountId)
    if (!a || (sel && a.id !== sel.id) || (symbol !== 'all' && t.symbol !== symbol)) return []
    const { date } = utcToZoned(t.timestamp, a.timezone)
    if ((from && date < from) || (to && date > to)) return []
    return [{ id: t.id, date, timestamp: t.timestamp, accountId: a.id, symbol: t.symbol, pnl: convert(t.pnl, a.currency, view) }]
  }), [trades, accounts, sel, symbol, from, to, view])
  const s = useMemo(() => computeAnalytics(rows), [rows])
  const stats: [string, string, string?][] = [
    ['Net P&L', `${fmt(s.net)} ${view}`, tone(s.net)], ['Total trades', String(s.count)], ['Win rate', `${s.winRate.toFixed(1)}%`],
    ['Winning days', String(s.winningDays), 'text-profit'], ['Losing days', String(s.losingDays), 'text-loss'], ['Trades per day', s.avgPerDay.toFixed(1)],
    ['Avg winning trade', fmt(s.avgWin), 'text-profit'], ['Avg losing trade', fmt(s.avgLoss), 'text-loss'],
    ['Largest win', fmt(s.largestWin), 'text-profit'], ['Largest loss', fmt(s.largestLoss), 'text-loss'],
    ['Profit factor', s.profitFactor === Infinity ? '∞' : s.profitFactor.toFixed(2)], ['Max drawdown', s.maxDrawdown ? fmt(-s.maxDrawdown) : '0', s.maxDrawdown ? 'text-loss' : undefined]]
  const names = new Map(accounts.map(a => [a.id, a.name]))
  return (
    <main className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <h1 className="text-lg font-semibold mb-4">Analytics</h1>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <label className="text-xs text-dim">Account<select className={field} value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="all">All accounts</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label className="text-xs text-dim">Symbol<select className={field} value={symbol} onChange={e => setSymbol(e.target.value)}>
          <option value="all">All symbols</option>{symbols.map(x => <option key={x}>{x}</option>)}</select></label>
        <label className="text-xs text-dim">From<input type="date" className={field} value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label className="text-xs text-dim">To<input type="date" className={field} value={to} onChange={e => setTo(e.target.value)} /></label>
      </div>
      <p className="text-xs text-dim mb-4">Amounts in {view}{!sel && pref === 'native' ? ' (all accounts combined, 100 USC = 1 USD)' : ''}. Days follow each account's broker timezone.</p>
      {s.count === 0 ? <p className="py-16 text-center text-dim text-sm">No trades match these filters.</p> : (<>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {stats.map(([label, value, cls]) => <div key={label} className="rounded-xl bg-card border border-line p-3">
            <p className="text-xs text-dim">{label}</p><p className={`text-lg font-semibold mt-0.5 ${cls ?? ''}`}>{value}</p></div>)}
        </div>
        <div className="space-y-3 mt-4">
          <MonthlyChart data={s.monthly} /><DailyChart data={s.daily} /><EquityChart data={s.equity} />
          <WinLossChart wins={s.wins} losses={s.losses} flat={s.flat} />
          <AccountChart data={s.accounts.map(a => ({ name: names.get(a.accountId) ?? '?', pnl: a.pnl }))} />
        </div>
      </>)}
    </main>
  )
}

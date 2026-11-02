import { useMemo, useState } from 'react'
import { addMonths, parseISO, subMonths } from 'date-fns'
import Header from '../components/layout/Header'
import Summary from '../components/dashboard/Summary'
import Calendar from '../components/calendar/Calendar'
import DayDetails from '../components/calendar/DayDetails'
import QuickActions from '../components/dashboard/QuickActions'
import TradeForm from '../components/trades/TradeForm'
import AccountsPanel from '../components/accounts/AccountsPanel'
import { useAccounts } from '../hooks/useAccounts'
import { useTrades } from '../hooks/useTrades'
import { usePreferences } from '../hooks/usePreferences'
import { dailyTotals, monthStats } from '../utils/pnlCalculations'
import { dayKey, monthKey } from '../utils/dateUtils'
import { convert } from '../utils/currencyUtils'
import { utcToZoned } from '../utils/timezoneUtils'
import type { Account, LocalTrade, Trade } from '../types/trade'
import { put } from '../database/indexedDB'
import { startFresh, type LoadedData } from '../services/storageService'

type FormState = { trade?: LocalTrade; date: string } | null
export default function Dashboard({ initial }: { initial: LoadedData }) {
  const { trades, add, update, remove, removeByAccount, reset: resetTrades } = useTrades(initial.trades)
  const { accounts, save: saveAccount, remove: removeAccount, reset: resetAccounts } = useAccounts(initial.accounts)
  const { pref, setPref } = usePreferences()
  const [managing, setManaging] = useState(false)
  const [accountId, setAccountId] = useState(accounts[0].id)
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(null)
  const [demo, setDemo] = useState(initial.demo)
  const [confirmClear, setConfirmClear] = useState(false)
  const account = accounts.find(a => a.id === accountId) ?? accounts[0]
  const tzOf = (id: string) => accounts.find(a => a.id === id)?.timezone ?? 'UTC'
  const deleteAccount = (id: string) => { removeByAccount(id); removeAccount(id); if (id === accountId) setAccountId(accounts.find(a => a.id !== id)!.id) }
  const clearDemo = async () => {
    const fresh: Account = { id: crypto.randomUUID(), name: 'My Account', broker: 'Other', type: 'Standard', currency: 'USD', timezone: 'UTC', createdAt: Date.now() }
    try { await startFresh(fresh) } catch (e) { console.error(e) }
    resetTrades(); resetAccounts([fresh]); setAccountId(fresh.id); setDemo(false); setConfirmClear(false); setSelected(null)
  }
  // Days are derived from each trade's UTC timestamp in its account's broker timezone.
  const localTrades = useMemo<LocalTrade[]>(() => trades.map(t => ({ ...t, ...utcToZoned(t.timestamp, tzOf(t.accountId)) })), [trades, accounts]) // eslint-disable-line react-hooks/exhaustive-deps
  const monthTrades = useMemo(() => localTrades.filter(t => t.accountId === account.id && t.date.startsWith(monthKey(month))), [localTrades, account.id, month])
  const viewCurrency = pref === 'native' ? account.currency : pref
  const rate = convert(1, account.currency, viewCurrency)
  const totals = useMemo(() => new Map([...dailyTotals(monthTrades)].map(([k, v]) => [k, { ...v, pnl: v.pnl * rate }])), [monthTrades, rate])
  const stats = monthStats(monthTrades)
  const save = (t: Trade, file?: File) => {
    form?.trade ? update(t) : add(t)
    if (file) put('screenshots', { id: t.id, blob: file }).catch(console.error)
    setAccountId(t.accountId); setMonth(parseISO(utcToZoned(t.timestamp, tzOf(t.accountId)).date)) // jump to where the saved trade lives
    setForm(null)
  }
  return (
    <main className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <Header account={account} accounts={accounts} onAccount={setAccountId} month={month}
        onPrev={() => setMonth(subMonths(month, 1))} onNext={() => setMonth(addMonths(month, 1))} onManage={() => setManaging(true)} />
      {!initial.persistent && <p className="mb-4 rounded-lg border border-line bg-card p-3 text-xs text-loss">Storage is unavailable in this browser mode, so changes won't be saved after you close the tab.</p>}
      {demo && <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-card p-3 text-xs text-dim">
        <span>{confirmClear ? 'Delete ALL trades and accounts?' : "You're viewing demo data."}</span>
        {confirmClear ? <span className="flex gap-3"><button onClick={clearDemo} className="font-semibold text-loss">Delete all</button><button onClick={() => setConfirmClear(false)}>Cancel</button></span>
          : <button onClick={() => setConfirmClear(true)} className="font-semibold text-ink whitespace-nowrap">Clear and start fresh</button>}
      </div>}
      <div className="space-y-8">
        <Summary s={{ ...stats, net: stats.net * rate }} currency={viewCurrency} />
        <Calendar month={month} totals={totals} selected={selected} onSelect={setSelected} />
      </div>
      <QuickActions currency={viewCurrency} onAdd={() => setForm({ date: dayKey(new Date()) })} />
      {selected && <DayDetails date={selected} trades={monthTrades.filter(t => t.date === selected)} currency={viewCurrency} rate={rate}
        onClose={() => setSelected(null)} onAdd={() => setForm({ date: selected })} onEdit={t => setForm({ trade: t, date: t.date })} onDelete={remove} />}
      {managing && <AccountsPanel accounts={accounts} trades={trades} activeId={account.id} onSwitch={setAccountId} onSave={saveAccount}
        onDelete={deleteAccount} pref={pref} onPref={setPref} onClose={() => setManaging(false)} />}
      {form && <TradeForm key={form.trade?.id ?? 'new'} accounts={accounts} trade={form.trade} defaultDate={form.date}
        defaultAccountId={account.id} onSave={save} onClose={() => setForm(null)} />}
    </main>
  )
}

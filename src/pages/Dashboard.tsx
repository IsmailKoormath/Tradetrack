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
import { dailyTotals, monthStats } from '../utils/pnlCalculations'
import { dayKey, monthKey } from '../utils/dateUtils'
import type { Trade } from '../types/trade'

type FormState = { trade?: Trade; date: string } | null
export default function Dashboard() {
  const { trades, add, update, remove, removeByAccount } = useTrades()
  const { accounts, save: saveAccount, remove: removeAccount } = useAccounts()
  const [managing, setManaging] = useState(false)
  const [accountId, setAccountId] = useState(accounts[0].id)
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(null)
  const account = accounts.find(a => a.id === accountId) ?? accounts[0]
  const deleteAccount = (id: string) => { removeByAccount(id); removeAccount(id); if (id === accountId) setAccountId(accounts.find(a => a.id !== id)!.id) }
  const monthTrades = useMemo(() => trades.filter(t => t.accountId === account.id && t.date.startsWith(monthKey(month))), [trades, account.id, month])
  const totals = useMemo(() => dailyTotals(monthTrades), [monthTrades])
  const save = (t: Trade) => {
    form?.trade ? update(t) : add(t)
    setAccountId(t.accountId); setMonth(parseISO(t.date)) // jump to where the saved trade lives
    setForm(null)
  }
  return (
    <main className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <Header account={account} accounts={accounts} onAccount={setAccountId} month={month}
        onPrev={() => setMonth(subMonths(month, 1))} onNext={() => setMonth(addMonths(month, 1))} onManage={() => setManaging(true)} />
      <div className="space-y-8">
        <Summary s={monthStats(monthTrades)} currency={account.currency} />
        <Calendar month={month} totals={totals} selected={selected} onSelect={setSelected} />
      </div>
      <QuickActions currency={account.currency} onAdd={() => setForm({ date: dayKey(new Date()) })} />
      {selected && <DayDetails date={selected} trades={monthTrades.filter(t => t.date === selected)} currency={account.currency}
        onClose={() => setSelected(null)} onAdd={() => setForm({ date: selected })} onEdit={t => setForm({ trade: t, date: t.date })} onDelete={remove} />}
      {managing && <AccountsPanel accounts={accounts} trades={trades} activeId={account.id} onSwitch={setAccountId} onSave={saveAccount} onDelete={deleteAccount} onClose={() => setManaging(false)} />}
      {form && <TradeForm key={form.trade?.id ?? 'new'} accounts={accounts} trade={form.trade} defaultDate={form.date}
        defaultAccountId={accountId} onSave={save} onClose={() => setForm(null)} />}
    </main>
  )
}

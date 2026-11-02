import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Account, Trade } from '../../types/trade'
import { accountNet, convert, totalsByCurrency } from '../../utils/currencyUtils'
import { fmt } from '../../utils/pnlCalculations'
import type { DisplayPref } from '../../utils/currencyUtils'
import AccountForm from './AccountForm'
interface P { accounts: Account[]; trades: Trade[]; activeId: string; onSwitch: (id: string) => void; onSave: (a: Account) => void; onDelete: (id: string) => void; pref: DisplayPref; onPref: (p: DisplayPref) => void; onClose: () => void }
const tone = (n: number) => (n > 0 ? 'text-profit' : n < 0 ? 'text-loss' : 'text-flat')
export default function AccountsPanel({ accounts, trades, activeId, onSwitch, onSave, onDelete, pref, onPref, onClose }: P) {
  const target = pref === 'native' ? 'USD' : pref
  const combined = accounts.reduce((s, a) => s + convert(accountNet(trades, a.id), a.currency, target), 0)
  const [editing, setEditing] = useState<Account | 'new' | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const totals = Object.entries(totalsByCurrency(trades, accounts))
  return (
    <div className="fixed inset-0 z-20 bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-card border border-line rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center"><h3 className="font-semibold">Accounts</h3>
          <button aria-label="Close" onClick={onClose} className="p-1 text-dim"><X size={18} /></button></div>
        <div className="mt-3 rounded-lg bg-bg2 border border-line p-3">
          <p className="text-xs text-dim">All-time net, kept separate by currency</p>
          <div className="flex gap-6 mt-1">{totals.map(([c, v]) => <span key={c} className={`font-semibold ${tone(v ?? 0)}`}>{fmt(v ?? 0)} {c}</span>)}</div>
          <p className="mt-2 text-xs text-dim">Combined in {target}: <span className={`font-semibold ${tone(combined)}`}>{fmt(combined)}</span> (100 USC = 1 USD)</p>
          <label className="flex items-center justify-between mt-2 text-xs text-dim">Display currency
            <select value={pref} onChange={e => onPref(e.target.value as DisplayPref)} className="bg-card border border-line rounded px-2 py-1 text-ink">
              <option value="native">Each account's own</option><option value="USD">USD</option><option value="USC">USC (cent)</option></select></label>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {accounts.map(a => {
            const net = accountNet(trades, a.id), count = trades.filter(t => t.accountId === a.id).length
            return (
              <li key={a.id} className="py-3">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0"><p className="text-sm font-medium truncate">{a.name} {a.id === activeId && <Check size={14} className="inline text-profit" />}</p>
                    <p className="text-xs text-dim">{a.broker}, {a.type}, {a.timezone}</p></div>
                  <p className={`text-sm font-semibold whitespace-nowrap ${tone(net)}`}>{fmt(net)} {a.currency}</p>
                </div>
                <div className="flex justify-end items-center gap-3 mt-1">
                  {confirm === a.id ? (<>
                    <span className="text-xs text-dim">Delete account and its {count} trades?</span>
                    <button onClick={() => { onDelete(a.id); setConfirm(null) }} className="text-xs text-loss font-semibold">Delete</button>
                    <button onClick={() => setConfirm(null)} className="text-xs text-dim">Keep</button>
                  </>) : (<>
                    {a.id !== activeId && <button onClick={() => { onSwitch(a.id); onClose() }} className="text-xs font-semibold">Switch</button>}
                    <button aria-label="Edit account" onClick={() => setEditing(a)} className="p-1 text-dim hover:text-ink"><Pencil size={15} /></button>
                    <button aria-label="Delete account" disabled={accounts.length === 1} onClick={() => setConfirm(a.id)} className="p-1 text-dim hover:text-loss disabled:opacity-30"><Trash2 size={15} /></button>
                  </>)}
                </div>
              </li>)
          })}
        </ul>
        <button onClick={() => setEditing('new')} className="w-full mt-3 py-2.5 rounded-lg border border-line text-sm font-semibold flex items-center justify-center gap-2 hover:border-flat"><Plus size={16} /> New account</button>
      </div>
      {editing && <AccountForm key={editing === 'new' ? 'new' : editing.id} account={editing === 'new' ? undefined : editing}
        onSave={a => { onSave(a); if (editing === 'new') onSwitch(a.id); setEditing(null) }} onClose={() => setEditing(null)} />}
    </div>
  )
}

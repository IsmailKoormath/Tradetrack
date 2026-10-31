import { ChevronLeft, ChevronRight, Settings, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import type { Account } from '../../types/trade'
interface P { account: Account; accounts: Account[]; onAccount: (id: string) => void; month: Date; onPrev: () => void; onNext: () => void; onManage: () => void }
export default function Header({ account, accounts, onAccount, month, onPrev, onNext, onManage }: P) {
  return (
    <header className="flex items-center justify-between gap-3 pb-4">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-lg font-semibold">TradeTrack</h1>
        <select aria-label="Trading account" value={account.id} onChange={e => onAccount(e.target.value)}
          className="bg-bg2 border border-line rounded-lg text-sm text-dim px-2 py-1 max-w-[9rem] truncate">
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <span className="text-xs font-semibold rounded-full bg-card border border-line px-2 py-0.5">{account.currency}</span>
      </div>
      <div className="flex items-center gap-1">
        <button aria-label="Previous month" onClick={onPrev} className="p-2 text-dim hover:text-ink"><ChevronLeft size={18} /></button>
        <span className="text-sm text-dim w-24 text-center hidden sm:block">{format(month, 'MMM yyyy')}</span>
        <button aria-label="Next month" onClick={onNext} className="p-2 text-dim hover:text-ink"><ChevronRight size={18} /></button>
        <button aria-label="Manage accounts" onClick={onManage} className="p-2 text-dim hover:text-ink"><Wallet size={18} /></button>
        <button aria-label="Settings" className="p-2 text-dim hover:text-ink"><Settings size={18} /></button>
      </div>
    </header>
  )
}

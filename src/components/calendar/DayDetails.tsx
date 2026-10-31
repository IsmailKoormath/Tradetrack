import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Trade } from '../../types/trade'
import { fmt, sumPnl } from '../../utils/pnlCalculations'
interface P { date: string; trades: Trade[]; currency: string; onClose: () => void; onAdd: () => void; onEdit: (t: Trade) => void; onDelete: (id: string) => void }
export default function DayDetails({ date, trades, currency, onClose, onAdd, onEdit, onDelete }: P) {
  const [confirm, setConfirm] = useState<string | null>(null)
  const sorted = [...trades].sort((a, b) => a.time.localeCompare(b.time))
  const net = sumPnl(trades), profit = sumPnl(trades.filter(t => t.pnl > 0)), loss = sumPnl(trades.filter(t => t.pnl < 0))
  return (
    <div className="fixed inset-0 z-20 bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-card border border-line rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div><h3 className="font-semibold">{format(parseISO(date), 'EEEE, d MMMM yyyy')}</h3>
            <p className={`text-2xl font-semibold mt-1 ${net > 0 ? 'text-profit' : net < 0 ? 'text-loss' : 'text-flat'}`}>{fmt(net)} {currency}</p></div>
          <button aria-label="Close" onClick={onClose} className="p-1 text-dim"><X size={18} /></button>
        </div>
        <p className="text-sm text-dim mt-2">{trades.length} trades, profit {fmt(profit)}, loss {fmt(loss)}</p>
        <ul className="mt-4 divide-y divide-line">
          {sorted.length === 0 && <li className="py-6 text-center text-dim text-sm">No trades on this day. Add the first one.</li>}
          {sorted.map(t => (
            <li key={t.id} className="py-3 text-sm">
              <div className="flex justify-between gap-2">
                <span>{t.time} {t.symbol} <span className="text-dim">{t.direction} {t.lots} lot</span></span>
                <span className={t.pnl >= 0 ? 'text-profit' : 'text-loss'}>{fmt(t.pnl)}</span>
              </div>
              {t.notes && <p className="text-xs text-dim mt-1">{t.notes}</p>}
              <div className="flex justify-end items-center gap-3 mt-1">
                {confirm === t.id ? (<>
                  <span className="text-xs text-dim">Delete this trade?</span>
                  <button onClick={() => { onDelete(t.id); setConfirm(null) }} className="text-xs text-loss font-semibold">Delete</button>
                  <button onClick={() => setConfirm(null)} className="text-xs text-dim">Keep</button>
                </>) : (<>
                  <button aria-label="Edit trade" onClick={() => onEdit(t)} className="p-1 text-dim hover:text-ink"><Pencil size={15} /></button>
                  <button aria-label="Delete trade" onClick={() => setConfirm(t.id)} className="p-1 text-dim hover:text-loss"><Trash2 size={15} /></button>
                </>)}
              </div>
            </li>))}
        </ul>
        <button onClick={onAdd} className="w-full mt-4 py-2.5 rounded-lg border border-line text-sm font-semibold flex items-center justify-center gap-2 hover:border-flat">
          <Plus size={16} /> Add trade</button>
      </div>
    </div>
  )
}

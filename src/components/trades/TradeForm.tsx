import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { zonedToUtc } from '../../utils/timezoneUtils'
import type { Account, LocalTrade, Trade } from '../../types/trade'

const optNum = z.string().refine(v => v.trim() === '' || Number.isFinite(Number(v)), 'Enter a number')
const schema = z.object({
  accountId: z.string().min(1, 'Choose an account'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time'),
  symbol: z.string().trim().min(3, 'Enter a symbol, e.g. XAUUSD'),
  direction: z.enum(['BUY', 'SELL']),
  entry: optNum, exit: optNum,
  lots: z.string().refine(v => Number(v) > 0, 'Lot size must be above 0'),
  pnl: z.string().refine(v => v.trim() !== '' && Number.isFinite(Number(v)), 'Enter profit or loss, e.g. 120 or -45'),
  session: z.string(), strategy: z.string(), notes: z.string(),
})
type Values = z.infer<typeof schema>
const num = (v: string) => (v.trim() === '' ? undefined : Number(v))
const input = 'w-full bg-bg2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dim'

interface P { accounts: Account[]; trade?: LocalTrade; defaultDate: string; defaultAccountId: string; onSave: (t: Trade, file?: File) => void; onClose: () => void }
export default function TradeForm({ accounts, trade, defaultDate, defaultAccountId, onSave, onClose }: P) {
  const [file, setFile] = useState<File>()
  const [fileErr, setFileErr] = useState('')
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: trade ? {
      accountId: trade.accountId, date: trade.date, time: trade.time, symbol: trade.symbol, direction: trade.direction,
      entry: trade.entry?.toString() ?? '', exit: trade.exit?.toString() ?? '', lots: String(trade.lots), pnl: String(trade.pnl),
      session: trade.session ?? '', strategy: trade.strategy ?? '', notes: trade.notes ?? '',
    } : { accountId: defaultAccountId, date: defaultDate, time: '09:00', symbol: 'XAUUSD', direction: 'BUY',
      entry: '', exit: '', lots: '0.10', pnl: '', session: '', strategy: '', notes: '' },
  })
  const acct = accounts.find(a => a.id === watch('accountId'))
  const currency = acct?.currency
  const submit = (v: Values) => onSave({
    id: trade?.id ?? crypto.randomUUID(), accountId: v.accountId, timestamp: zonedToUtc(v.date, v.time, acct?.timezone ?? 'UTC'),
    symbol: v.symbol.trim().toUpperCase(), direction: v.direction, lots: Number(v.lots),
    entry: num(v.entry), exit: num(v.exit), pnl: Number(v.pnl),
    session: v.session || undefined, strategy: v.strategy.trim() || undefined, notes: v.notes.trim() || undefined,
    hasScreenshot: file ? true : trade?.hasScreenshot,
  }, file)
  const Err = ({ k }: { k: keyof Values }) => errors[k] ? <p className="text-xs text-loss mt-1">{errors[k]?.message}</p> : null
  const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block"><span className="text-xs text-dim">{t}</span>{children}</label>
  return (
    <div className="fixed inset-0 z-30 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form onSubmit={handleSubmit(submit)} onClick={e => e.stopPropagation()} noValidate
        className="w-full sm:max-w-lg bg-card border border-line rounded-t-2xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{trade ? 'Edit trade' : 'Add trade'}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1 text-dim"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><L t="Trading account"><select className={input} {...register('accountId')}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}</select></L><Err k="accountId" /></div>
          <div><L t="Date"><input type="date" className={input} {...register('date')} /></L><Err k="date" /></div>
          <div><L t={`Time (${acct?.timezone ?? "UTC"})`}><input type="time" className={input} {...register('time')} /></L><Err k="time" /></div>
          <div><L t="Symbol"><input className={`${input} uppercase`} {...register('symbol')} /></L><Err k="symbol" /></div>
          <div><L t="Direction"><select className={input} {...register('direction')}><option>BUY</option><option>SELL</option></select></L></div>
          <div><L t="Entry price (optional)"><input inputMode="decimal" className={input} {...register('entry')} /></L><Err k="entry" /></div>
          <div><L t="Exit price (optional)"><input inputMode="decimal" className={input} {...register('exit')} /></L><Err k="exit" /></div>
          <div><L t="Lot size"><input inputMode="decimal" className={input} {...register('lots')} /></L><Err k="lots" /></div>
          <div><L t={`Profit / loss${currency ? ` (${currency})` : ''}`}><input placeholder="e.g. 120 or -45" className={input} {...register('pnl')} /></L><Err k="pnl" /></div>
          <div><L t="Session (optional)"><select className={input} {...register('session')}>
            <option value="">None</option><option>Asian</option><option>London</option><option>New York</option></select></L></div>
          <div><L t="Strategy (optional)"><input className={input} {...register('strategy')} /></L></div>
          <div className="col-span-2"><L t="Notes"><textarea rows={2} className={input} {...register('notes')} /></L></div>
          <div className="col-span-2"><L t="Screenshot (optional)"><input type="file" accept="image/*" className={`${input} file:mr-3 file:border-0 file:bg-card file:text-ink`}
            onChange={e => { const f = e.target.files?.[0]; if (f && f.size > 5_000_000) { setFileErr('Image must be under 5 MB'); setFile(undefined); e.target.value = '' } else { setFileErr(''); setFile(f) } }} /></L>
            {fileErr && <p className="text-xs text-loss mt-1">{fileErr}</p>}
            {trade?.hasScreenshot && !file && <p className="text-xs text-dim mt-1">A screenshot is attached. Choose a file to replace it.</p>}</div>
        </div>
        <button className="w-full mt-5 py-2.5 rounded-lg bg-ink text-bg font-semibold text-sm">{trade ? 'Save changes' : 'Add trade'}</button>
      </form>
    </div>
  )
}

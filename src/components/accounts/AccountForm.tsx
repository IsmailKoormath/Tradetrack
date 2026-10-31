import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Account } from '../../types/trade'
const schema = z.object({
  name: z.string().trim().min(1, 'Enter an account name'),
  broker: z.string().trim().min(1, 'Enter a broker, or "Other"'),
  type: z.enum(['Standard', 'Cent', 'ECN', 'Demo', 'Other']),
  currency: z.enum(['USC', 'USD']),
  timezone: z.string().min(1),
})
type Values = z.infer<typeof schema>
const TZ = ['UTC', 'Asia/Kolkata', 'Europe/London', 'Europe/Athens', 'America/New_York', 'Asia/Tokyo']
const input = 'w-full bg-bg2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dim'
export default function AccountForm({ account, onSave, onClose }: { account?: Account; onSave: (a: Account) => void; onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: account ?? { name: '', broker: '', type: 'Standard', currency: 'USD', timezone: 'UTC' },
  })
  const L = ({ t, e, children }: { t: string; e?: string; children: React.ReactNode }) =>
    <label className="block"><span className="text-xs text-dim">{t}</span>{children}{e && <p className="text-xs text-loss mt-1">{e}</p>}</label>
  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form noValidate onClick={e => e.stopPropagation()} onSubmit={handleSubmit(v => onSave({ id: account?.id ?? crypto.randomUUID(), ...v }))}
        className="w-full sm:max-w-md bg-card border border-line rounded-t-2xl sm:rounded-2xl p-5" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">{account ? 'Edit account' : 'New account'}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1 text-dim"><X size={18} /></button></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><L t="Account name" e={errors.name?.message}><input className={input} {...register('name')} /></L></div>
          <L t="Broker" e={errors.broker?.message}><input className={input} {...register('broker')} /></L>
          <L t="Account type"><select className={input} {...register('type')}>{['Standard', 'Cent', 'ECN', 'Demo', 'Other'].map(t => <option key={t}>{t}</option>)}</select></L>
          <L t="Currency"><select className={input} {...register('currency')}><option value="USC">USC (cent)</option><option value="USD">USD</option></select></L>
          <L t="Broker timezone"><select className={input} {...register('timezone')}>{TZ.map(t => <option key={t}>{t}</option>)}</select></L>
        </div>
        <button className="w-full mt-5 py-2.5 rounded-lg bg-ink text-bg font-semibold text-sm">{account ? 'Save changes' : 'Create account'}</button>
      </form>
    </div>
  )
}

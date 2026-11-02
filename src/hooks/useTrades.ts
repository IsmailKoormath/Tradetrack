import { useState } from 'react'
import type { Trade } from '../types/trade'
import { del, put } from '../database/indexedDB'
const persist = (p: Promise<unknown>) => p.catch(e => console.error('TradeTrack storage error', e))
/** React state is a mirror; IndexedDB is the source of truth. */
export function useTrades(initial: Trade[]) {
  const [trades, setTrades] = useState<Trade[]>(initial)
  const add = (t: Trade) => { setTrades(p => [...p, t]); persist(put('trades', t)) }
  const update = (t: Trade) => { setTrades(p => p.map(x => (x.id === t.id ? t : x))); persist(put('trades', t)) }
  const remove = (id: string) => { setTrades(p => p.filter(x => x.id !== id)); persist(Promise.all([del('trades', id), del('screenshots', id)])) }
  const removeByAccount = (accountId: string) => {
    const ids = trades.filter(x => x.accountId === accountId).map(x => x.id)
    setTrades(p => p.filter(x => x.accountId !== accountId))
    persist(Promise.all(ids.flatMap(id => [del('trades', id), del('screenshots', id)])))
  }
  const reset = () => setTrades([])
  return { trades, add, update, remove, removeByAccount, reset }
}

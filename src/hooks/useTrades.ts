import { useCallback, useState } from 'react'
import type { Trade } from '../types/trade'
import { trades as seed } from '../data/sample'
/** State lives here so Phase 7 can swap in IndexedDB without touching components. */
export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(seed)
  const add = useCallback((t: Trade) => setTrades(p => [...p, t]), [])
  const update = useCallback((t: Trade) => setTrades(p => p.map(x => (x.id === t.id ? t : x))), [])
  const remove = useCallback((id: string) => setTrades(p => p.filter(x => x.id !== id)), [])
  const removeByAccount = useCallback((accountId: string) => setTrades(p => p.filter(x => x.accountId !== accountId)), [])
  return { trades, add, update, remove, removeByAccount }
}

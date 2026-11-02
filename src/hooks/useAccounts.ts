import { useState } from 'react'
import type { Account } from '../types/trade'
import { del, put } from '../database/indexedDB'
const persist = (p: Promise<unknown>) => p.catch(e => console.error('TradeTrack storage error', e))
export function useAccounts(initial: Account[]) {
  const [accounts, setAccounts] = useState<Account[]>(initial)
  const save = (a: Account) => { setAccounts(p => (p.some(x => x.id === a.id) ? p.map(x => (x.id === a.id ? a : x)) : [...p, a])); persist(put('accounts', a)) }
  const remove = (id: string) => { if (accounts.length <= 1) return; setAccounts(p => p.filter(x => x.id !== id)); persist(del('accounts', id)) }
  const reset = (list: Account[]) => setAccounts(list)
  return { accounts, save, remove, reset }
}

import { useCallback, useState } from 'react'
import type { Account } from '../types/trade'
import { accounts as seed } from '../data/sample'
export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(seed)
  const save = useCallback((a: Account) => setAccounts(p => (p.some(x => x.id === a.id) ? p.map(x => (x.id === a.id ? a : x)) : [...p, a])), [])
  const remove = useCallback((id: string) => setAccounts(p => (p.length > 1 ? p.filter(x => x.id !== id) : p)), [])
  return { accounts, save, remove }
}

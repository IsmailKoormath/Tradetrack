import { useState } from 'react'
import { useAccounts } from './useAccounts'
import { usePreferences } from './usePreferences'
import { useTrades } from './useTrades'
import type { LoadedData } from '../services/storageService'
/** One shared store so every page sees the same trades, accounts and preferences. */
export function useStore(initial: LoadedData) {
  const t = useTrades(initial.trades), a = useAccounts(initial.accounts), p = usePreferences()
  const [accountId, setAccountId] = useState(initial.accounts[0].id)
  const [demo, setDemo] = useState(initial.demo)
  return { ...t, resetTrades: t.reset, accounts: a.accounts, saveAccount: a.save, removeAccount: a.remove, resetAccounts: a.reset,
    pref: p.pref, setPref: p.setPref, accountId, setAccountId, demo, setDemo, persistent: initial.persistent }
}
export type Store = ReturnType<typeof useStore>

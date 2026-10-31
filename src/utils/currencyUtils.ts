import type { Account, Currency, Trade } from '../types/trade'
import { sumPnl } from './pnlCalculations'
/** Original P&L is never converted. Totals are kept per currency so USC and USD are never silently added together. */
export function totalsByCurrency(trades: Trade[], accounts: Account[]): Partial<Record<Currency, number>> {
  const out: Partial<Record<Currency, number>> = {}
  for (const a of accounts) {
    const own = trades.filter(t => t.accountId === a.id)
    out[a.currency] = sumPnl([...own, ...(out[a.currency] !== undefined ? [{ pnl: out[a.currency]! } as Trade] : [])])
  }
  return out
}
export const accountNet = (trades: Trade[], id: string) => sumPnl(trades.filter(t => t.accountId === id))

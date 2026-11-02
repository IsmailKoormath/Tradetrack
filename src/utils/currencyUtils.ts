import type { Account, Currency, Trade } from '../types/trade'
import { sumPnl } from './pnlCalculations'
export type DisplayPref = 'native' | Currency
/** Fixed peg: 100 USC = 1 USD. Conversion is for display only; stored P&L is never changed. */
const PER_USD: Record<Currency, number> = { USD: 1, USC: 100 }
export const convert = (amount: number, from: Currency, to: Currency) =>
  from === to ? amount : Math.round((amount / PER_USD[from]) * PER_USD[to] * 1e4) / 1e4
export const accountNet = (trades: Trade[], id: string) => sumPnl(trades.filter(t => t.accountId === id))
/** Per-currency totals, never mixed. */
export function totalsByCurrency(trades: Trade[], accounts: Account[]): Partial<Record<Currency, number>> {
  const out: Partial<Record<Currency, number>> = {}
  for (const a of accounts) out[a.currency] = Math.round(((out[a.currency] ?? 0) + accountNet(trades, a.id)) * 100) / 100
  return out
}

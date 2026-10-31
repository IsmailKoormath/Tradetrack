export type Currency = 'USC' | 'USD'
export interface Account { id: string; name: string; broker: string; type: 'Standard' | 'Cent' | 'ECN' | 'Demo' | 'Other'; currency: Currency; timezone: string }
export interface Trade {
  id: string; accountId: string
  /** Broker-local trading day, yyyy-MM-dd (timezone logic arrives in Phase 6) */
  date: string; time: string
  symbol: string; direction: 'BUY' | 'SELL'; lots: number
  entry?: number; exit?: number
  /** Realized P&L entered by the trader, in the account's own currency. Never derived from prices. */
  pnl: number
  session?: string; strategy?: string; notes?: string
}

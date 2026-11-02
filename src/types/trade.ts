export type Currency = 'USC' | 'USD'
export interface Account { id: string; name: string; broker: string; type: 'Standard' | 'Cent' | 'ECN' | 'Demo' | 'Other'; currency: Currency; timezone: string; createdAt?: number }
export interface Trade {
  id: string; accountId: string
  /** The exact UTC instant (ISO 8601). Never rewritten when an account timezone changes. */
  timestamp: string
  symbol: string; direction: 'BUY' | 'SELL'; lots: number
  entry?: number; exit?: number
  /** Realized P&L entered by the trader, in the account's own currency. Never derived from prices. */
  pnl: number
  session?: string; strategy?: string; notes?: string; hasScreenshot?: boolean
}
/** A trade with its day and time as seen in the account's broker timezone (derived, never stored). */
export type LocalTrade = Trade & { date: string; time: string }

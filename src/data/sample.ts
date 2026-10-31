import type { Account, Trade } from '../types/trade'
export const accounts: Account[] = [
  { id: 'a1', name: 'Main Gold Account', broker: 'Exness', type: 'Standard', currency: 'USC', timezone: 'UTC' },
  { id: 'a2', name: 'Demo Account', broker: 'Other', type: 'Demo', currency: 'USD', timezone: 'UTC' },
]
let n = 0
const t = (date: string, time: string, symbol: string, direction: 'BUY' | 'SELL', lots: number, pnl: number, accountId = 'a1'): Trade =>
  ({ id: `t${++n}`, accountId, date, time, symbol, direction, lots, pnl })
export const trades: Trade[] = [
  t('2026-10-03', '09:15', 'XAUUSD', 'BUY', 0.1, 80), t('2026-10-03', '14:40', 'XAUUSD', 'SELL', 0.1, 40),
  t('2026-10-06', '10:05', 'EURUSD', 'SELL', 0.2, -45),
  t('2026-10-08', '08:30', 'XAUUSD', 'BUY', 0.1, 150), t('2026-10-08', '16:10', 'GBPUSD', 'SELL', 0.1, -30),
  t('2026-10-13', '11:20', 'XAUUSD', 'BUY', 0.1, 120),
  t('2026-10-16', '13:00', 'BTCUSD', 'SELL', 0.05, -45),
  t('2026-10-20', '09:45', 'XAUUSD', 'BUY', 0.1, 70), t('2026-10-20', '15:25', 'EURUSD', 'BUY', 0.1, 50),
  t('2026-10-07', '12:00', 'XAUUSD', 'BUY', 0.5, 22, 'a2'),
]

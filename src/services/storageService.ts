import { accounts as sampleAccounts, trades as sampleTrades } from '../data/sample'
import { clear, get, getAll, put, putMany } from '../database/indexedDB'
import type { Account, Trade } from '../types/trade'
export interface LoadedData { accounts: Account[]; trades: Trade[]; demo: boolean; persistent: boolean }
type Meta = { key: string; value: boolean }
/** Seeds demo data on the very first launch, then loads everything from IndexedDB. */
export async function loadAll(): Promise<LoadedData> {
  try {
    if (!(await get<Meta>('meta', 'seeded'))) {
      await putMany('accounts', sampleAccounts); await putMany('trades', sampleTrades)
      await putMany('meta', [{ key: 'seeded', value: true }, { key: 'demo', value: true }])
    }
    const [accounts, trades, demo] = await Promise.all([getAll<Account>('accounts'), getAll<Trade>('trades'), get<Meta>('meta', 'demo')])
    return { accounts: accounts.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)), trades, demo: !!demo?.value, persistent: true }
  } catch (e) {
    console.error('TradeTrack: storage unavailable, running without persistence', e)
    return { accounts: sampleAccounts, trades: sampleTrades, demo: true, persistent: false }
  }
}
export async function startFresh(first: Account) {
  await Promise.all([clear('accounts'), clear('trades'), clear('screenshots')])
  await put('accounts', first)
  await put('meta', { key: 'demo', value: false })
}

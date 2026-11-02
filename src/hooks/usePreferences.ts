import { useState } from 'react'
import type { DisplayPref } from '../utils/currencyUtils'
const KEY = 'tradetrack:displayCurrency'
const read = (): DisplayPref => { try { const v = localStorage.getItem(KEY); return v === 'USD' || v === 'USC' ? v : 'native' } catch { return 'native' } }
export function usePreferences() {
  const [pref, set] = useState<DisplayPref>(read)
  const setPref = (p: DisplayPref) => { set(p); try { localStorage.setItem(KEY, p) } catch { /* storage unavailable */ } }
  return { pref, setPref }
}

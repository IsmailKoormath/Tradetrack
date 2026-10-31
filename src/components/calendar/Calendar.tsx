import { format, isSameMonth, isToday } from 'date-fns'
import { dayKey, monthGrid } from '../../utils/dateUtils'
import { fmt } from '../../utils/pnlCalculations'
const HEAD = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
interface P { month: Date; totals: Map<string, { pnl: number; count: number }>; selected: string | null; onSelect: (k: string) => void }
export default function Calendar({ month, totals, selected, onSelect }: P) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 px-1">{format(month, 'MMMM yyyy')}</h2>
      <div className="grid grid-cols-7 text-center text-sm text-dim mb-2">{HEAD.map((h, i) => <div key={i}>{h}</div>)}</div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {monthGrid(month).map(d => {
          if (!isSameMonth(d, month)) return <div key={dayKey(d)} />
          const k = dayKey(d), t = totals.get(k)
          const tone = !t || t.pnl === 0 ? 'bg-transparent' : t.pnl > 0 ? 'bg-[#06170e]' : 'bg-[#250707]'
          const txt = !t || t.pnl === 0 ? 'text-flat' : t.pnl > 0 ? 'text-profit' : 'text-loss'
          return (
            <button key={k} onClick={() => onSelect(k)} aria-label={`${format(d, 'PPP')}${t ? ` ${fmt(t.pnl)}` : ''}`}
              className={`h-14 sm:h-16 rounded-lg flex flex-col items-center justify-center ${tone}
              ${isToday(d) ? 'ring-1 ring-dim' : ''} ${selected === k ? 'outline outline-1 outline-ink' : ''}`}>
              <span className="text-[15px]">{d.getDate()}</span>
              {t && <span className={`text-[11px] ${txt}`}>{fmt(t.pnl)}</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

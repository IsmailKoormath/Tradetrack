import { BarChart3, CalendarDays } from 'lucide-react'
export type View = 'calendar' | 'analytics'
const tabs = [{ id: 'calendar', label: 'Calendar', Icon: CalendarDays }, { id: 'analytics', label: 'Analytics', Icon: BarChart3 }] as const
export default function BottomNav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-bg border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-3xl grid grid-cols-2">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onChange(id)} aria-current={view === id} className={`flex flex-col items-center gap-1 py-2.5 text-xs ${view === id ? 'text-ink' : 'text-flat'}`}>
            <Icon size={20} />{label}</button>))}
      </div>
    </nav>
  )
}

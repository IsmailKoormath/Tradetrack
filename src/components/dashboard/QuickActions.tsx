import { BarChart3, Download, FileUp, PlusCircle } from 'lucide-react'
const items = [{ label: 'Add Trade', Icon: PlusCircle }, { label: 'Import CSV', Icon: FileUp }, { label: 'Export', Icon: Download }, { label: 'Analytics', Icon: BarChart3 }]
export default function QuickActions({ currency, onAdd, onAnalytics }: { currency: string; onAdd: () => void; onAnalytics: () => void }) {
  return (
    <section className="border-t border-line pt-5 mt-8">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <span className="text-xs font-semibold rounded-full bg-card border border-line px-2.5 py-1">{currency}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map(({ label, Icon }) => (
          <button key={label} onClick={label === 'Add Trade' ? onAdd : label === 'Analytics' ? onAnalytics : undefined} className="flex flex-col items-center gap-2 py-4 rounded-xl bg-card border border-line hover:border-flat">
            <Icon size={22} /><span className="text-xs">{label}</span></button>))}
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import BottomNav, { type View } from './components/layout/BottomNav'
import { useStore } from './hooks/useStore'
import { loadAll, type LoadedData } from './services/storageService'
function Shell({ data }: { data: LoadedData }) {
  const store = useStore(data)
  const [view, setView] = useState<View>('calendar')
  return (<>
    <div hidden={view !== 'calendar'}><Dashboard store={store} onNavigate={setView} /></div>
    {view === 'analytics' && <Analytics store={store} />}
    <BottomNav view={view} onChange={setView} />
  </>)
}
export default function App() {
  const [data, setData] = useState<LoadedData | null>(null)
  useEffect(() => { loadAll().then(setData) }, [])
  return data ? <Shell data={data} /> : <p className="p-8 text-dim">Loading…</p>
}

import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import { loadAll, type LoadedData } from './services/storageService'
export default function App() {
  const [data, setData] = useState<LoadedData | null>(null)
  useEffect(() => { loadAll().then(setData) }, [])
  if (!data) return <p className="p-8 text-dim">Loading…</p>
  return <Dashboard initial={data} />
}

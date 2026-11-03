import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fmt } from '../../utils/pnlCalculations'
const G = '#22c55e', R = '#ef4444'
const tip = { contentStyle: { background: '#101010', border: '1px solid #1f1f1f', borderRadius: 8, color: '#f5f5f5', fontSize: 12 }, labelStyle: { color: '#a3a3a3' }, cursor: { fill: 'rgba(255,255,255,0.04)' } }
const axis = { tick: { fill: '#737373', fontSize: 11 }, axisLine: false, tickLine: false } as const
const Card = ({ title, children }: { title: string; children: React.ReactNode }) =>
  <section className="rounded-xl bg-card border border-line p-4"><h3 className="text-sm text-dim mb-3">{title}</h3><div className="h-56">{children}</div></section>
type Pt = { pnl: number; trades?: number; [k: string]: unknown }
function PnlBars({ title, data, x }: { title: string; data: Pt[]; x: string }) {
  return (
    <Card title={title}><ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}><CartesianGrid stroke="#1f1f1f" vertical={false} />
        <XAxis dataKey={x} {...axis} tickFormatter={(d: string) => (x === 'date' ? d.slice(5) : d)} minTickGap={20} /><YAxis {...axis} width={48} />
        <Tooltip {...tip} formatter={(v, _n, p) => [p.payload.trades !== undefined ? `${fmt(Number(v))} (${p.payload.trades} trades)` : fmt(Number(v)), 'P&L']} />
        <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>{data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? G : R} />)}</Bar>
      </BarChart></ResponsiveContainer></Card>)
}
export const MonthlyChart = (p: { data: Pt[] }) => <PnlBars title="Monthly P&L" data={p.data} x="month" />
export const DailyChart = (p: { data: Pt[] }) => <PnlBars title="Daily P&L" data={p.data} x="date" />
export const AccountChart = (p: { data: Pt[] }) => <PnlBars title="Account-wise performance" data={p.data} x="name" />
export function EquityChart({ data }: { data: { date: string; equity: number }[] }) {
  return (
    <Card title="Equity curve"><ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}><CartesianGrid stroke="#1f1f1f" vertical={false} />
        <XAxis dataKey="date" {...axis} tickFormatter={(d: string) => d.slice(5)} minTickGap={20} /><YAxis {...axis} width={48} />
        <Tooltip {...tip} formatter={v => [fmt(Number(v)), 'Equity']} />
        <Line type="monotone" dataKey="equity" stroke={G} strokeWidth={2} dot={false} />
      </LineChart></ResponsiveContainer></Card>)
}
export function WinLossChart({ wins, losses, flat }: { wins: number; losses: number; flat: number }) {
  const data = [{ name: 'Winning', value: wins, fill: G }, { name: 'Losing', value: losses, fill: R }, { name: 'Breakeven', value: flat, fill: '#737373' }].filter(d => d.value > 0)
  return (
    <Card title="Winning vs losing trades"><ResponsiveContainer width="100%" height="100%">
      <PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" stroke="none">{data.map(d => <Cell key={d.name} fill={d.fill} />)}</Pie>
        <Tooltip {...tip} /><Legend wrapperStyle={{ color: '#a3a3a3', fontSize: 12 }} /></PieChart></ResponsiveContainer></Card>)
}

import { eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek, format } from 'date-fns'
export const monthKey = (d: Date) => format(d, 'yyyy-MM')
export const dayKey = (d: Date) => format(d, 'yyyy-MM-dd')
/** Monday-first grid of full weeks covering the month. */
export const monthGrid = (d: Date) =>
  eachDayOfInterval({ start: startOfWeek(startOfMonth(d), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(d), { weekStartsOn: 1 }) })

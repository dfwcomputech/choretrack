import type { ChoreItem } from '../dashboard/types'

interface ChildChoreCalendarProps {
  chores: ChoreItem[]
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const parseDueDate = (dueDate: string | null) => {
  if (!dueDate) return null
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

export default function ChildChoreCalendar({ chores }: ChildChoreCalendarProps) {
  const now = new Date()
  const year = now.getFullYear()
  const monthIndex = now.getMonth()
  const month = monthIndex + 1
  const monthName = now.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  const firstDayOffset = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const choresByDay = chores.reduce<Record<number, ChoreItem[]>>((acc, chore) => {
    const parsed = parseDueDate(chore.dueDate)
    if (!parsed) return acc
    if (parsed.year !== year || parsed.month !== month) return acc
    const dayChores = acc[parsed.day] ?? []
    dayChores.push(chore)
    acc[parsed.day] = dayChores
    return acc
  }, {})

  const cells: Array<{ key: string; day?: number }> = [
    ...Array.from({ length: firstDayOffset }, (_, index) => ({ key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 })),
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">{monthName} Calendar</h2>
      <p className="mt-1 text-sm text-slate-600">See what is due each day this month.</p>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <p key={label} className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
        ))}

        {cells.map((cell) => {
          if (!cell.day) return <div key={cell.key} className="min-h-24 rounded-xl bg-slate-50/40" />

          const dayChores = choresByDay[cell.day] ?? []
          return (
            <article key={cell.key} className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <p className="text-xs font-bold text-slate-700">{cell.day}</p>
              <ul className="mt-1 space-y-1">
                {dayChores.slice(0, 3).map((chore) => {
                  const completed = chore.status === 'COMPLETED' || chore.completed
                  return (
                    <li key={chore.id} className={`truncate rounded px-2 py-1 text-[11px] font-semibold ${completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`} title={`${chore.title} (${completed ? 'Completed' : 'Pending'})`}>
                      {chore.title}
                    </li>
                  )
                })}
                {dayChores.length > 3 ? <li className="text-[11px] font-semibold text-slate-500">+{dayChores.length - 3} more</li> : null}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}

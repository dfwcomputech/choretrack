import type { ChoreItem } from '../dashboard/types'

interface ChildChoreSectionProps {
  chores: ChoreItem[]
  completingChoreId: string | null
  onComplete: (choreId: string) => void
}

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) return 'No due date'
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return dueDate
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return dueDate
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parsedDate)
}

export default function ChildChoreSection({ chores, completingChoreId, onComplete }: ChildChoreSectionProps) {
  const pendingChores = chores.filter((chore) => chore.status !== 'COMPLETED' && !chore.completed)
  const completedChores = chores.filter((chore) => chore.status === 'COMPLETED' || chore.completed)

  const renderChore = (chore: ChoreItem, completed: boolean) => (
    <li key={chore.id} className={`rounded-2xl border p-4 ${completed ? 'border-emerald-200 bg-emerald-50' : 'border-primary-100 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-base font-semibold ${completed ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>{chore.title}</p>
          <p className="mt-1 text-sm text-slate-600">Due {formatDueDate(chore.dueDate)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{completed ? 'Completed' : 'Pending'}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-700">+{chore.points}</p>
          {!completed ? (
            <button
              type="button"
              onClick={() => onComplete(chore.id)}
              disabled={completingChoreId === chore.id}
              className="mt-2 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {completingChoreId === chore.id ? 'Completing...' : 'Complete'}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )

  const pendingContent =
    pendingChores.length === 0 ? (
      <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">No pending chores. Nice work!</li>
    ) : (
      pendingChores.map((chore) => renderChore(chore, false))
    )

  const completedContent =
    completedChores.length === 0 ? (
      <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">Complete chores to build your streak!</li>
    ) : (
      completedChores.map((chore) => renderChore(chore, true))
    )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Chore Missions</h2>
      <p className="mt-1 text-sm text-slate-600">Finish chores to unlock your next Battle Pass reward.</p>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary-700">Pending ({pendingChores.length})</h3>
          <ul className="mt-3 space-y-3">{pendingContent}</ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-700">Completed ({completedChores.length})</h3>
          <ul className="mt-3 space-y-3">{completedContent}</ul>
        </div>
      </div>
    </section>
  )
}

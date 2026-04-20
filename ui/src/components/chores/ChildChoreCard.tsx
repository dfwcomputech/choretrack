import type { ChoreItem } from '../dashboard/types'

interface ChildChoreCardProps {
  chore: ChoreItem
  isCompleting: boolean
  onComplete: (choreId: string) => void
}

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) return 'No due date'
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return dueDate
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return dueDate
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(parsedDate)
}

export default function ChildChoreCard({ chore, isCompleting, onComplete }: ChildChoreCardProps) {
  const isCompleted = chore.status === 'COMPLETED' || chore.completed

  return (
    <li
      className={`rounded-2xl border px-4 py-4 ${
        isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
      }`}
      aria-label={`${chore.title} chore`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xl font-semibold ${isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>{chore.title}</p>
          {chore.description ? <p className="mt-1 text-sm text-slate-600">{chore.description}</p> : null}
          <p className="mt-2 text-xs text-slate-500">Due: {formatDueDate(chore.dueDate)}</p>
          <p className="text-xs text-slate-500">Status: {isCompleted ? 'Completed' : 'Pending'}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-emerald-700">+{chore.points}</p>
          {isCompleted ? (
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Completed</span>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(chore.id)}
              disabled={isCompleting}
              aria-disabled={isCompleting}
              className="mt-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isCompleting ? 'Completing...' : 'Complete Chore'}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

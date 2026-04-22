import type { ChoreItem } from '../dashboard/types'
import { useTranslation } from 'react-i18next'

interface ChildChoreSectionProps {
  chores: ChoreItem[]
  completingChoreId: string | null
  revertingChoreId: string | null
  onComplete: (choreId: string) => void
  onRevert: (choreId: string) => void
}

const formatDueDate = (dueDate: string | null, t: (key: string) => string) => {
  if (!dueDate) return t('chores.noDueDate')
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return dueDate
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return dueDate
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parsedDate)
}

const currentUtcDate = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ChildChoreSection({ chores, completingChoreId, revertingChoreId, onComplete, onRevert }: ChildChoreSectionProps) {
  const { t } = useTranslation()
  const today = currentUtcDate()
  const pendingChores = chores.filter((chore) => chore.status !== 'COMPLETED' && !chore.completed)
  const completedChores = chores.filter((chore) => chore.status === 'COMPLETED' || chore.completed)

  const renderChore = (chore: ChoreItem, completed: boolean) => {
    const canCompleteToday = chore.dueDate != null && chore.dueDate === today
    const completeDisabled = completingChoreId === chore.id || !canCompleteToday

    return (
    <li key={chore.id} className={`rounded-2xl border p-4 ${completed ? 'border-emerald-200 bg-emerald-50' : 'border-primary-100 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-base font-semibold ${completed ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>{chore.title}</p>
          <p className="mt-1 text-sm text-slate-600">{t('chores.due')} {formatDueDate(chore.dueDate, t)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{completed ? t('common.completed') : t('common.pending')}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-700">+{chore.points}</p>
          {!completed ? (
            <button
              type="button"
              onClick={() => onComplete(chore.id)}
              disabled={completeDisabled}
              className="mt-2 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {completingChoreId === chore.id ? t('chores.completing') : t('common.complete')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRevert(chore.id)}
              disabled={revertingChoreId === chore.id}
              className="mt-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
            >
              {revertingChoreId === chore.id ? t('children.moving') : t('children.moveToPending')}
            </button>
          )}
          {!completed && !canCompleteToday ? (
            <p className="mt-2 text-[11px] text-slate-500">{t('children.completeOnlyToday')}</p>
          ) : null}
        </div>
      </div>
    </li>
  )}

  const pendingContent =
    pendingChores.length === 0 ? (
      <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">{t('children.noPendingChores')}</li>
    ) : (
      pendingChores.map((chore) => renderChore(chore, false))
    )

  const completedContent =
    completedChores.length === 0 ? (
      <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">{t('children.noCompletedChores')}</li>
    ) : (
      completedChores.map((chore) => renderChore(chore, true))
    )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">{t('children.choreMissions')}</h2>
      <p className="mt-1 text-sm text-slate-600">{t('children.choreMissionsSubtitle')}</p>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary-700">{t('common.pending')} ({pendingChores.length})</h3>
          <ul className="mt-3 space-y-3">{pendingContent}</ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-700">{t('common.completed')} ({completedChores.length})</h3>
          <ul className="mt-3 space-y-3">{completedContent}</ul>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChoreItem } from '../dashboard/types'
import { formatDueDate } from '../../utils/dateFormatters'

interface ChildChoreGroupProps {
  title: string
  icon: string
  chores: ChoreItem[]
  onToggleChore: (id: string) => void
  onEditChore: (chore: ChoreItem) => void
  onDeleteChore: (chore: ChoreItem) => void
  onAddChore: () => void
  addLabel: string
  defaultCollapsed?: boolean
  hideTitleBar?: boolean
}


export default function ChildChoreGroup({
  title,
  icon,
  chores,
  onToggleChore,
  onEditChore,
  onDeleteChore,
  onAddChore,
  addLabel,
  defaultCollapsed = false,
  hideTitleBar = false,
}: ChildChoreGroupProps) {
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60">
      {!hideTitleBar ? (
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={!isCollapsed}
        >
          <div className="flex items-center gap-2">
            <span aria-hidden="true">{icon}</span>
            <span className="text-base font-semibold text-slate-800">{title}</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">{chores.length}</span>
          </div>
          <span className="text-slate-400 transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▾
          </span>
        </button>
      ) : null}

      {hideTitleBar || !isCollapsed ? (
        <div className={hideTitleBar ? 'px-4 pb-4 pt-3' : 'border-t border-slate-200 px-4 pb-4 pt-3'}>
          <ul className="space-y-2">
            {chores.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm text-slate-500">
                {t('chores.noChoresForChild')}
              </li>
            ) : null}
            {chores.map((chore) => (
              <li
                key={chore.id}
                className={`rounded-xl border px-3 py-2.5 ${
                  chore.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${chore.completed ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>
                      {chore.title}
                      {chore.recurring ? (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700" title="Daily recurring chore">
                          🔁
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('chores.due')}: {formatDueDate(chore.dueDate, t)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-bold text-emerald-700">+{chore.points}</p>
                    <div className="flex flex-wrap justify-end gap-2 text-xs font-medium">
                      <button type="button" onClick={() => onToggleChore(chore.id)} className="text-primary-700 hover:underline">
                        {chore.completed ? t('chores.markPending') : t('chores.markComplete')}
                      </button>
                      <button type="button" onClick={() => onEditChore(chore)} className="text-blue-700 hover:underline">
                        {t('common.edit')}
                      </button>
                      <button type="button" onClick={() => onDeleteChore(chore)} className="text-red-700 hover:underline">
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onAddChore}
            className="mt-3 w-full rounded-xl border border-dashed border-primary-300 bg-primary-50 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
          >
            + {addLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}

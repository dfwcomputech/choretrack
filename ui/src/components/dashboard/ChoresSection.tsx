import type { ChoreItem, KidAccount } from './types'
import { useTranslation } from 'react-i18next'

interface ChoresSectionProps {
  chores: ChoreItem[]
  kids: KidAccount[]
  onToggleChore: (id: string) => void
  onEditChore: (chore: ChoreItem) => void
  onDeleteChore: (chore: ChoreItem) => void
  onAddChore: () => void
}

const formatStatus = (status: ChoreItem['status'], t: (key: string) => string) => (status === 'COMPLETED' ? t('common.completed') : t('common.pending'))

const formatDueDate = (dueDate: string | null, t: (key: string) => string) => {
  if (!dueDate) return t('chores.noDueDate')
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!year || !month || !day) return dueDate
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC' }).format(parsedDate)
}

export default function ChoresSection({ chores, kids, onToggleChore, onEditChore, onDeleteChore, onAddChore }: ChoresSectionProps) {
  const { t } = useTranslation()
  const getKid = (id: string) => kids.find((kid) => kid.id === id)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">{t('dashboard.nav.chores')}</h2>
        <button
          type="button"
          onClick={onAddChore}
          className="rounded-xl bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-700 hover:bg-primary-200"
        >
          + {t('chores.addChore')}
        </button>
      </div>
      <ul className="space-y-3">
        {chores.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">
            {t('chores.empty')}
          </li>
        ) : null}
        {chores.map((chore) => {
          const kid = getKid(chore.childId)
          return (
            <li
              key={chore.id}
              className={`rounded-2xl border px-4 py-3 ${
                chore.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{kid?.avatar ?? '🧒'}</span>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{chore.title}</p>
                     <p className="text-base text-slate-600">{kid?.name ?? chore.assignedChildName ?? t('chores.unassigned')}</p>
                     <p className="text-xs text-slate-500">{t('chores.due')}: {formatDueDate(chore.dueDate, t)}</p>
                     <p className="text-xs text-slate-500">{t('chores.status')}: {formatStatus(chore.status, t)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-emerald-700">+{chore.points}</p>
                  <div className="mt-1 flex flex-wrap justify-end gap-2 text-sm font-medium">
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
          )
        })}
      </ul>
    </section>
  )
}

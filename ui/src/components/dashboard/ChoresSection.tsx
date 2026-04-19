import type { ChoreItem, KidAccount } from './types'

interface ChoresSectionProps {
  chores: ChoreItem[]
  kids: KidAccount[]
  onToggleChore: (id: string) => void
  onAddChore: () => void
}

export default function ChoresSection({ chores, kids, onToggleChore, onAddChore }: ChoresSectionProps) {
  const getKid = (id: string) => kids.find((kid) => kid.id === id)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Chores</h2>
        <button
          type="button"
          onClick={onAddChore}
          className="rounded-xl bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-700 hover:bg-primary-200"
        >
          + Add Chore
        </button>
      </div>
      <ul className="space-y-3">
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
                    <p className="text-base text-slate-600">{kid?.name ?? 'Unassigned'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-emerald-700">+{chore.points}</p>
                  <button
                    type="button"
                    onClick={() => onToggleChore(chore.id)}
                    className="text-sm font-medium text-primary-700 hover:underline"
                  >
                    {chore.completed ? 'Mark pending' : 'Mark complete'}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

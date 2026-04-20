import type { ChoreItem } from '../dashboard/types'
import ChildChoreCard from './ChildChoreCard'

interface ChildChoreListProps {
  chores: ChoreItem[]
  completingChoreId: string | null
  onComplete: (choreId: string) => void
}

export default function ChildChoreList({ chores, completingChoreId, onComplete }: ChildChoreListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-3xl font-bold text-slate-900">Your Chores</h2>
      <ul className="mt-4 space-y-3">
        {chores.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">
            You are all caught up. No assigned chores right now.
          </li>
        ) : null}
        {chores.map((chore) => (
          <ChildChoreCard key={chore.id} chore={chore} isCompleting={completingChoreId === chore.id} onComplete={onComplete} />
        ))}
      </ul>
    </section>
  )
}

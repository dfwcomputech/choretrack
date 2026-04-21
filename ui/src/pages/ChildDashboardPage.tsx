import BattlePassSection from '../components/child-dashboard/BattlePassSection'
import ChildChoreCalendar from '../components/child-dashboard/ChildChoreCalendar'
import ChildChoreSection from '../components/child-dashboard/ChildChoreSection'
import type { ChoreItem } from '../components/dashboard/types'

interface ChildDashboardPageProps {
  childName: string
  points: number
  level: number
  nextLevelPoints: number
  completedChildChoreCount: number
  pendingChildChoreCount: number
  childCompletionErrorMessage: string
  chores: ChoreItem[]
  completingChoreId: string | null
  onCompleteChore: (choreId: string) => void
}

const childRewardMilestones = [
  { id: 'sticker-pack', title: 'Sticker Pack', description: 'Decorate your chore board with shiny stickers.', icon: '✨', pointsRequired: 30 },
  { id: 'movie-night', title: 'Movie Night Pick', description: 'Choose the family movie this week.', icon: '🍿', pointsRequired: 60 },
  { id: 'dessert-choice', title: 'Dessert Choice', description: 'Pick your favorite dessert for tonight.', icon: '🍨', pointsRequired: 90 },
  { id: 'extra-playtime', title: 'Extra Playtime', description: 'Get 30 bonus minutes for your favorite game.', icon: '🎮', pointsRequired: 120 },
]

export default function ChildDashboardPage({
  childName,
  points,
  level,
  nextLevelPoints,
  completedChildChoreCount,
  pendingChildChoreCount,
  childCompletionErrorMessage,
  chores,
  completingChoreId,
  onCompleteChore,
}: ChildDashboardPageProps) {
  return (
    <>
      <section className="rounded-3xl border border-primary-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">Kid dashboard</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Hi {childName}! 🚀</h2>
            <p className="mt-2 text-slate-600">Complete chores, earn points, and unlock awesome rewards.</p>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-primary-50 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-primary-700">Points</dt>
              <dd className="mt-1 text-lg font-bold text-primary-900">{points}</dd>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Done</dt>
              <dd className="mt-1 text-lg font-bold text-emerald-900">{completedChildChoreCount}</dd>
            </div>
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Pending</dt>
              <dd className="mt-1 text-lg font-bold text-amber-900">{pendingChildChoreCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      <BattlePassSection points={points} currentLevel={level} nextLevelPoints={nextLevelPoints} milestones={childRewardMilestones} />

      {childCompletionErrorMessage ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {childCompletionErrorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_1fr]">
        <ChildChoreSection chores={chores} completingChoreId={completingChoreId} onComplete={onCompleteChore} />
        <ChildChoreCalendar chores={chores} />
      </div>
    </>
  )
}

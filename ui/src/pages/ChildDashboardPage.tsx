import { useMemo } from 'react'
import BattlePassSection, { type RewardMilestone } from '../components/child-dashboard/BattlePassSection'
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
  revertingChoreId: string | null
  onCompleteChore: (choreId: string) => void
  onRevertChore: (choreId: string) => void
}

const STORAGE_KEY = 'choretrack.parent.season-pass'

const parseSeasonPassMilestones = (): RewardMilestone[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        const record = entry as Partial<RewardMilestone>
        if (typeof record.id !== 'string' || !record.id.trim()) return null
        if (typeof record.title !== 'string' || !record.title.trim()) return null
        if (typeof record.description !== 'string') return null
        if (typeof record.icon !== 'string' || !record.icon.trim()) return null
        if (typeof record.pointsRequired !== 'number' || !Number.isFinite(record.pointsRequired)) return null
        return {
          id: record.id,
          title: record.title,
          description: record.description,
          icon: record.icon,
          pointsRequired: record.pointsRequired,
        }
      })
      .filter((entry): entry is RewardMilestone => Boolean(entry))
      .sort((a, b) => a.pointsRequired - b.pointsRequired)
  } catch {
    return []
  }
}

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
  revertingChoreId,
  onCompleteChore,
  onRevertChore,
}: ChildDashboardPageProps) {
  const childRewardMilestones = useMemo(() => parseSeasonPassMilestones(), [])

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
        <ChildChoreSection
          chores={chores}
          completingChoreId={completingChoreId}
          revertingChoreId={revertingChoreId}
          onComplete={onCompleteChore}
          onRevert={onRevertChore}
        />
        <ChildChoreCalendar chores={chores} />
      </div>
    </>
  )
}

import type { RewardItem } from './types'

interface RewardsSectionProps {
  rewards: RewardItem[]
  level: number
  points: number
  nextLevelPoints: number
  onAddReward: () => void
}

export default function RewardsSection({ rewards, level, points, nextLevelPoints, onAddReward }: RewardsSectionProps) {
  const progress = Math.min((points / nextLevelPoints) * 100, 100)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Rewards</h2>
        <button
          type="button"
          onClick={onAddReward}
          className="rounded-xl bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-700 hover:bg-primary-200"
        >
          + Add Reward
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-primary-100 bg-primary-50 p-4">
        <p className="text-2xl font-semibold text-slate-900">
          Level {level} Progress <span className="text-slate-500">{points} / {nextLevelPoints} pts</span>
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-primary-200">
          <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ul className="space-y-3">
        {rewards.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">
            No rewards created yet.
          </li>
        ) : null}
        {rewards.map((reward) => (
          <li key={reward.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{reward.icon}</span>
              <p className="text-xl font-semibold text-slate-900">{reward.name}</p>
            </div>
            <p className="text-xl font-bold text-primary-700">{reward.pointsCost} pts</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

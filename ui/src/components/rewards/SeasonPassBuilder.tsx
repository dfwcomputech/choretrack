import { useMemo } from 'react'
import { Save } from 'lucide-react'
import type { RewardItem } from '../dashboard/types'

export interface SeasonPassMilestone {
  id: string
  pointsRequired: number
  rewards: RewardItem[]
}

interface SeasonPassBuilderProps {
  rewards: RewardItem[]
  milestones: SeasonPassMilestone[]
  onSave: () => void
}

export default function SeasonPassBuilder({ rewards, milestones, onSave }: SeasonPassBuilderProps) {
  const milestoneCount = milestones.length
  const rewardCount = rewards.length
  const multiOptionCount = useMemo(() => milestones.filter((milestone) => milestone.rewards.length > 1).length, [milestones])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Season Pass Builder</h2>
          <p className="text-sm text-slate-600">
            Milestones are automatically grouped by reward points ({rewardCount} rewards across {milestoneCount} milestones).
          </p>
          {multiOptionCount > 0 ? (
            <p className="mt-1 text-xs font-medium text-primary-700">{multiOptionCount} milestone(s) currently offer a “Choose 1 reward” option.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Save className="h-4 w-4" /> Save Season Pass
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">
          Add rewards first to build your season pass.
        </div>
      ) : (
        <ul className="space-y-3">
          {milestones.map((milestone, index) => (
            <li key={milestone.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-800">Level {index + 1}</p>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">{milestone.pointsRequired} pts</span>
                  {milestone.rewards.length > 1 ? (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">Choose 1 ({milestone.rewards.length} options)</span>
                  ) : null}
                </div>
                <ul className="space-y-2">
                  {milestone.rewards.map((reward) => (
                    <li key={reward.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="font-semibold text-slate-800">
                        {reward.icon} {reward.name}
                      </p>
                      <p className="text-sm text-slate-600">{reward.description || 'Season Pass reward'}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

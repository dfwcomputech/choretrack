import { ArrowDown, ArrowUp, Save } from 'lucide-react'
import type { RewardItem } from '../dashboard/types'

export interface SeasonPassEntry {
  level: number
  rewardId: string
}

interface SeasonPassBuilderProps {
  rewards: RewardItem[]
  seasonPassEntries: SeasonPassEntry[]
  onChange: (entries: SeasonPassEntry[]) => void
  onSave: () => void
}

export default function SeasonPassBuilder({ rewards, seasonPassEntries, onChange, onSave }: SeasonPassBuilderProps) {
  const updateRewardForLevel = (level: number, rewardId: string) => {
    onChange(seasonPassEntries.map((entry) => (entry.level === level ? { ...entry, rewardId } : entry)))
  }

  const moveLevel = (index: number, direction: -1 | 1) => {
    const destinationIndex = index + direction
    if (destinationIndex < 0 || destinationIndex >= seasonPassEntries.length) return

    const reordered = [...seasonPassEntries]
    const [movedEntry] = reordered.splice(index, 1)
    reordered.splice(destinationIndex, 0, movedEntry)

    onChange(
      reordered.map((entry, levelIndex) => ({
        ...entry,
        level: levelIndex + 1,
      })),
    )
  }

  const addLevel = () => {
    if (rewards.length === 0) return
    const defaultRewardId = rewards[0].id
    onChange([...seasonPassEntries, { level: seasonPassEntries.length + 1, rewardId: defaultRewardId }])
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Season Pass Builder</h2>
          <p className="text-sm text-slate-600">Assign rewards to levels and define the progression order.</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Save className="h-4 w-4" /> Save Season Pass
        </button>
      </div>

      {seasonPassEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">
          Add rewards first to build your season pass.
        </div>
      ) : (
        <ul className="space-y-3">
          {seasonPassEntries.map((entry, index) => (
            <li key={entry.level} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-800">Level {entry.level}</p>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:max-w-xs"
                  value={entry.rewardId}
                  onChange={(event) => updateRewardForLevel(entry.level, event.target.value)}
                >
                  {rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.name} ({reward.pointsCost} pts)
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-white"
                    onClick={() => moveLevel(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move level ${entry.level} up`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-white"
                    onClick={() => moveLevel(index, 1)}
                    disabled={index === seasonPassEntries.length - 1}
                    aria-label={`Move level ${entry.level} down`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addLevel}
        disabled={rewards.length === 0}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        + Add Level
      </button>
    </section>
  )
}

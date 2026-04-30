import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChoreItem, KidAccount, RewardItem } from '../dashboard/types'
import ChildChoreGroup from './ChildChoreGroup'
import ChildRewardGroup from './ChildRewardGroup'

interface ParentChildSectionProps {
  kid: KidAccount
  chores: ChoreItem[]
  rewards: RewardItem[]
  points: number
  level: number
  onAddChore: (childId: string) => void
  onToggleChore: (id: string) => void
  onEditChore: (chore: ChoreItem) => void
  onDeleteChore: (chore: ChoreItem) => void
  onAddReward: () => void
  onEditReward: (reward: RewardItem) => void
  onDeleteReward: (reward: RewardItem) => void
}

export default function ParentChildSection({
  kid,
  chores,
  rewards,
  points,
  level,
  onAddChore,
  onToggleChore,
  onEditChore,
  onDeleteChore,
  onAddReward,
  onEditReward,
  onDeleteReward,
}: ParentChildSectionProps) {
  const { t } = useTranslation()
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false)

  const dailyChores = chores.filter((chore) => chore.recurring)
  const upcomingChores = chores.filter((chore) => !chore.recurring)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsSectionCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left"
        aria-expanded={!isSectionCollapsed}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            {kid.avatar}
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{kid.name}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>@{kid.username}</span>
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                {t('common.levelWithCount', { count: level })}
              </span>
              <span className="font-medium text-emerald-700">{points} {t('common.pts')}</span>
            </div>
          </div>
        </div>
        <span className="text-slate-400 transition-transform" style={{ transform: isSectionCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {!isSectionCollapsed ? (
        <div className="border-t border-slate-100 px-6 pb-6 pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <ChildChoreGroup
                title={t('chores.dailyChores')}
                icon="🔁"
                chores={dailyChores}
                onToggleChore={onToggleChore}
                onEditChore={onEditChore}
                onDeleteChore={onDeleteChore}
                onAddChore={() => onAddChore(kid.id)}
                addLabel={t('chores.addChore')}
              />
              <ChildChoreGroup
                title={t('chores.upcomingChores')}
                icon="📅"
                chores={upcomingChores}
                onToggleChore={onToggleChore}
                onEditChore={onEditChore}
                onDeleteChore={onDeleteChore}
                onAddChore={() => onAddChore(kid.id)}
                addLabel={t('chores.addChore')}
              />
            </div>
            <div>
              <ChildRewardGroup
                rewards={rewards}
                onAddReward={onAddReward}
                onEditReward={onEditReward}
                onDeleteReward={onDeleteReward}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

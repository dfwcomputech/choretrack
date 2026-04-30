import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RewardItem } from '../dashboard/types'

interface ChildRewardGroupProps {
  rewards: RewardItem[]
  onAddReward: () => void
  onEditReward: (reward: RewardItem) => void
  onDeleteReward: (reward: RewardItem) => void
  defaultCollapsed?: boolean
}

export default function ChildRewardGroup({
  rewards,
  onAddReward,
  onEditReward,
  onDeleteReward,
  defaultCollapsed = false,
}: ChildRewardGroupProps) {
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true">🎁</span>
          <span className="text-base font-semibold text-slate-800">{t('dashboard.nav.rewards')}</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">{rewards.length}</span>
        </div>
        <span className="text-slate-400 transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {!isCollapsed ? (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3">
          <ul className="space-y-2">
            {rewards.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm text-slate-500">
                {t('rewards.empty')}
              </li>
            ) : null}
            {rewards.map((reward) => (
              <li key={reward.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xl" aria-hidden="true">
                      {reward.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{reward.name}</p>
                      {reward.description ? <p className="text-xs text-slate-500">{reward.description}</p> : null}
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-primary-700">{reward.pointsCost} {t('common.pts')}</p>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEditReward(reward)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteReward(reward)}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onAddReward}
            className="mt-3 w-full rounded-xl border border-dashed border-primary-300 bg-primary-50 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
          >
            + {t('rewards.addReward')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

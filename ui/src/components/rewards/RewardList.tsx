import type { RewardItem } from '../dashboard/types'
import { useTranslation } from 'react-i18next'

interface RewardListProps {
  rewards: RewardItem[]
  onAddReward: () => void
  onEditReward: (reward: RewardItem) => void
  onDeleteReward: (reward: RewardItem) => void
}

export default function RewardList({ rewards, onAddReward, onEditReward, onDeleteReward }: RewardListProps) {
  const { t } = useTranslation()
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">{t('rewards.managementTitle')}</h2>
        <button
          type="button"
          onClick={onAddReward}
          className="rounded-xl bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-200"
        >
          + {t('rewards.addReward')}
        </button>
      </div>

      <ul className="space-y-3">
        {rewards.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">{t('rewards.empty')}</li>
        ) : null}
        {rewards.map((reward) => (
          <li key={reward.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {reward.icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{reward.name}</p>
                  {reward.description ? <p className="text-sm text-slate-600">{reward.description}</p> : null}
                  {reward.category ? <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{reward.category}</span> : null}
                </div>
              </div>
              <p className="font-bold text-primary-700">{reward.pointsCost} {t('common.pts')}</p>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEditReward(reward)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                onClick={() => onDeleteReward(reward)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                {t('common.delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RewardItem } from '../dashboard/types'
import SeasonTemplateModal from './SeasonTemplateModal'

export interface SeasonPassMilestone {
  id: string
  pointsRequired: number
  rewards: RewardItem[]
}

interface SeasonPassBuilderProps {
  rewards: RewardItem[]
  milestones: SeasonPassMilestone[]
  onSave: () => void
  onApplyTemplate: (rewards: RewardItem[]) => void
}

export default function SeasonPassBuilder({ rewards, milestones, onSave, onApplyTemplate }: SeasonPassBuilderProps) {
  const { t } = useTranslation()
  const milestoneCount = milestones.length
  const rewardCount = rewards.length
  const multiOptionCount = useMemo(() => milestones.filter((milestone) => milestone.rewards.length > 1).length, [milestones])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  return (
    <>
      <SeasonTemplateModal
        isOpen={isTemplateModalOpen}
        hasExistingRewards={rewards.length > 0}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplied={(appliedRewards) => {
          onApplyTemplate(appliedRewards)
          setIsTemplateModalOpen(false)
        }}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('seasonPass.builderTitle')}</h2>
            <p className="text-sm text-slate-600">
              {t('seasonPass.builderSubtitle', { rewards: rewardCount, milestones: milestoneCount })}
            </p>
            {multiOptionCount > 0 ? (
              <p className="mt-1 text-xs font-medium text-primary-700">{t('seasonPass.multiOptionSummary', { count: multiOptionCount })}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
            >
              {t('seasonTemplates.chooseTemplate')}
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Save className="h-4 w-4" /> {t('seasonPass.save')}
            </button>
          </div>
        </div>

        {milestones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-600">
            {t('seasonPass.addRewardsFirst')}
          </div>
        ) : (
          <ul className="space-y-3">
            {milestones.map((milestone, index) => (
              <li key={milestone.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">{t('common.levelWithCount', { count: index + 1 })}</p>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">{milestone.pointsRequired} {t('common.pts')}</span>
                    {milestone.rewards.length > 1 ? (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">{t('seasonPass.chooseOneOptions', { count: milestone.rewards.length })}</span>
                    ) : null}
                  </div>
                  <ul className="space-y-2">
                    {milestone.rewards.map((reward) => (
                      <li key={reward.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="font-semibold text-slate-800">
                          {reward.icon} {reward.name}
                        </p>
                        <p className="text-sm text-slate-600">{reward.description || t('seasonPass.defaultRewardDescription')}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

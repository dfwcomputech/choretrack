import { useTranslation } from 'react-i18next'

export interface MilestoneRewardOption {
  id: string
  title: string
  description: string
  icon: string
}

export interface RewardMilestone {
  id: string
  pointsRequired: number
  rewards: MilestoneRewardOption[]
}

interface BattlePassSectionProps {
  points: number
  currentLevel: number
  nextLevelPoints: number
  milestones: RewardMilestone[]
}

const toPercent = (points: number, nextLevelPoints: number) => {
  if (nextLevelPoints <= 0) return 0
  return Math.max(0, Math.min((points / nextLevelPoints) * 100, 100))
}

const formatNextMilestoneLabel = (milestone: RewardMilestone | null, t: (key: string, options?: Record<string, unknown>) => string) => {
  if (!milestone) return t('battlePass.allUnlocked')
  if (milestone.rewards.length > 1) {
    return t('battlePass.chooseRewardOptions', { count: milestone.rewards.length })
  }
  return `${milestone.rewards[0]?.icon ?? '🎁'} ${milestone.rewards[0]?.title ?? t('battlePass.reward')}`
}

export default function BattlePassSection({ points, currentLevel, nextLevelPoints, milestones }: BattlePassSectionProps) {
  const { t } = useTranslation()
  if (milestones.length === 0) {
    return (
      <section className="overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-6 text-white shadow-lg lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100">{t('battlePass.title')}</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('common.levelWithCount', { count: currentLevel })}</h2>
        <p className="mt-2 text-primary-100">{t('battlePass.pointsEarned', { points })}</p>
        <div className="mt-6 rounded-2xl border border-dashed border-white/40 bg-white/10 px-4 py-6 text-sm text-primary-100">
          {t('battlePass.noSeasonPass')}
        </div>
      </section>
    )
  }

  const progressPercent = toPercent(points, nextLevelPoints)
  const sortedMilestones = [...milestones].sort((a, b) => a.pointsRequired - b.pointsRequired)
  const nextMilestone = sortedMilestones.find((milestone) => points < milestone.pointsRequired) ?? null
  const activeMilestoneId = nextMilestone?.id ?? sortedMilestones[sortedMilestones.length - 1]?.id ?? ''
  const nextMilestoneLabel = formatNextMilestoneLabel(nextMilestone, t)

  return (
    <section className="overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-6 text-white shadow-lg lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100">{t('battlePass.title')}</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('common.levelWithCount', { count: currentLevel })}</h2>
          <p className="mt-2 text-primary-100">
            {t('battlePass.pointsToLevel', { points, nextLevelPoints, nextLevel: currentLevel + 1 })}
          </p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">{t('battlePass.nextUnlock')}</p>
          <p className="mt-1 text-lg font-bold">{nextMilestoneLabel}</p>
        </div>
      </div>

      <div className="mt-6">
        <div
          className="relative h-5 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-label={t('battlePass.progressAriaLabel')}
          aria-valuemin={0}
          aria-valuemax={nextLevelPoints}
          aria-valuenow={Math.min(Math.max(points, 0), nextLevelPoints)}
        >
          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-300" style={{ width: `${progressPercent}%` }} />
          <div
            className="absolute top-1/2 h-7 w-7 -translate-y-1/2 -translate-x-1/2 rounded-full border-4 border-white bg-amber-300 shadow-md"
            style={{ left: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-sm font-medium text-primary-100">{t('battlePass.pointsUntilNextLevel', { points: Math.max(nextLevelPoints - points, 0) })}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sortedMilestones.map((milestone) => {
          const unlocked = points >= milestone.pointsRequired
          const isActive = milestone.id === activeMilestoneId
          const primaryReward = milestone.rewards[0]
          return (
            <article
              key={milestone.id}
              className={`rounded-2xl border p-4 transition ${
                unlocked
                  ? 'border-emerald-300 bg-emerald-50/95 text-emerald-900'
                  : isActive
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-white/20 bg-white/10 text-white'
              }`}
            >
              <p className="text-2xl">{primaryReward?.icon ?? '🎁'}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide">{t('battlePass.unlockAtPoints', { points: milestone.pointsRequired })}</p>
              <h3 className="mt-1 text-lg font-bold">{primaryReward?.title ?? t('seasonPass.defaultRewardName')}</h3>
              <p className="mt-1 text-sm opacity-90">{primaryReward?.description || t('seasonPass.defaultRewardDescription')}</p>
              {milestone.rewards.length > 1 ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide">
                  {t('battlePass.chooseRewardOptionsAvailable', { count: milestone.rewards.length })}
                </p>
              ) : null}
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide">{unlocked ? t('battlePass.unlocked') : t('battlePass.locked')}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

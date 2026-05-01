import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import KinSection from '../components/dashboard/KinSection'
import type { ChoreItem, KidAccount, RewardItem } from '../components/dashboard/types'
import Sidebar from '../components/layout/Sidebar'
import KinProgressSection, { type ChildProgressSummary } from '../components/parent/KinProgressSection'
import ParentChildSection from '../components/parent/ParentChildSection'
import RewardList from '../components/rewards/RewardList'
import SeasonPassBuilder, { type SeasonPassMilestone } from '../components/rewards/SeasonPassBuilder'

const LEVEL_SIZE = 100
const STORAGE_KEY = 'choretrack.parent.season-pass'

interface ParentDashboardPageProps {
  parentName: string
  accountType?: string
  kids: KidAccount[]
  chores: ChoreItem[]
  rewards: RewardItem[]
  activeNav: string
  onNavChange: (id: string) => void
  onAddChore: (childId?: string) => void
  onToggleChore: (id: string) => void
  onEditChore: (chore: ChoreItem) => void
  onDeleteChore: (chore: ChoreItem) => void
  onAddReward: () => void
  onEditReward: (reward: RewardItem) => void
  onDeleteReward: (reward: RewardItem) => void
  onAddChild: () => void
  onEditChild: (kid: KidAccount) => void
  onDeleteChild: (kid: KidAccount) => void
}

interface StoredSeasonPassReward {
  id: string
  title: string
  description: string
  icon: string
}

interface StoredSeasonPassMilestone {
  id: string
  level: number
  pointsRequired: number
  rewards: StoredSeasonPassReward[]
}

const buildSeasonPassMilestones = (rewards: RewardItem[]): SeasonPassMilestone[] => {
  const sortedRewards = [...rewards].sort((a, b) => {
    if (a.pointsCost !== b.pointsCost) return a.pointsCost - b.pointsCost
    return a.name.localeCompare(b.name)
  })

  return sortedRewards.reduce<SeasonPassMilestone[]>((milestones, reward) => {
    const lastMilestone = milestones[milestones.length - 1]
    if (lastMilestone && lastMilestone.pointsRequired === reward.pointsCost) {
      lastMilestone.rewards.push(reward)
      return milestones
    }

    milestones.push({
      id: `milestone-${reward.pointsCost}-${milestones.length + 1}`,
      pointsRequired: reward.pointsCost,
      rewards: [reward],
    })
    return milestones
  }, [])
}

export default function ParentDashboardPage({
  parentName,
  accountType,
  kids,
  chores,
  rewards,
  activeNav,
  onNavChange,
  onAddChore,
  onToggleChore,
  onEditChore,
  onDeleteChore,
  onAddReward,
  onEditReward,
  onDeleteReward,
  onAddChild,
  onEditChild,
  onDeleteChild,
}: ParentDashboardPageProps) {
  const { t } = useTranslation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [seasonPassMessage, setSeasonPassMessage] = useState('')

  useEffect(() => {
    if (!seasonPassMessage) return
    const timeout = window.setTimeout(() => setSeasonPassMessage(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [seasonPassMessage])

  const seasonPassMilestones = useMemo(() => buildSeasonPassMilestones(rewards), [rewards])

  const childProgress: ChildProgressSummary[] = useMemo(() => {
    return kids.map((kid) => {
      const completedPoints = chores
        .filter((chore) => chore.childId === kid.id && (chore.status === 'COMPLETED' || chore.completed))
        .reduce((total, chore) => total + chore.points, 0)

      const currentLevel = Math.max(1, Math.floor(completedPoints / LEVEL_SIZE) + 1)
      const progressToNextLevel = ((completedPoints % LEVEL_SIZE) / LEVEL_SIZE) * 100
      const nextMilestone =
        seasonPassMilestones.find((milestone) => completedPoints < milestone.pointsRequired) ??
        (seasonPassMilestones.length > 0 ? seasonPassMilestones[seasonPassMilestones.length - 1] : null)
      const nextRewardName = nextMilestone
        ? nextMilestone.rewards.length > 1
          ? t('seasonPass.chooseOneOfRewards', { count: nextMilestone.rewards.length })
          : nextMilestone.rewards[0]?.name ?? t('seasonPass.defaultRewardName')
        : t('seasonPass.noneAssigned')

      return {
        id: kid.id,
        name: kid.name,
        avatar: kid.avatar,
        points: completedPoints,
        level: currentLevel,
        progressToNextLevel,
        nextRewardName,
      }
    })
  }, [chores, kids, seasonPassMilestones, t])

  const handleSaveSeasonPass = () => {
    const storedSeasonPass: StoredSeasonPassMilestone[] = seasonPassMilestones.map((milestone, index) => ({
      id: milestone.id,
      level: index + 1,
      pointsRequired: milestone.pointsRequired,
      rewards: milestone.rewards.map((reward) => ({
        id: reward.id,
        title: reward.name,
        description: reward.description || t('seasonPass.defaultRewardDescription'),
        icon: reward.icon,
      })),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSeasonPass))
    setSeasonPassMessage(t('seasonPass.saved'))
  }

  const dashboardContent = (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('dashboard.welcomeBack', { name: parentName })}</h1>
        <p className="mt-3 text-base text-slate-600">{t('dashboard.parentSummary')}</p>
      </section>
      <KinProgressSection childrenProgress={childProgress} />
      {kids.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
          {t('dashboard.noChildrenYet')}
        </div>
      ) : (
        <div className="space-y-6">
          {kids.map((kid) => {
            const kidChores = chores.filter((chore) => chore.childId === kid.id)
            const progress = childProgress.find((p) => p.id === kid.id)
            return (
              <ParentChildSection
                key={kid.id}
                kid={kid}
                chores={kidChores}
                points={progress?.points ?? 0}
                level={progress?.level ?? 1}
                onAddChore={onAddChore}
                onToggleChore={onToggleChore}
                onEditChore={onEditChore}
                onDeleteChore={onDeleteChore}
              />
            )
          })}
        </div>
      )}
    </div>
  )

  const navContentMap: Record<string, ReactElement> = {
    dashboard: dashboardContent,
    kin: (
      <div className="space-y-6">
        <KinSection parentName={parentName} kids={kids} onAddChild={onAddChild} onEditChild={onEditChild} onDeleteChild={onDeleteChild} />
        <KinProgressSection childrenProgress={childProgress} />
      </div>
    ),
    chores: (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900">{t('dashboard.nav.chores')}</h2>
            <button
              type="button"
              onClick={() => onAddChore()}
              className="rounded-xl bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-700 hover:bg-primary-200"
            >
              + {t('chores.addChore')}
            </button>
          </div>
        </section>
        {kids.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
            {t('dashboard.noChildrenYet')}
          </div>
        ) : (
          kids.map((kid) => {
            const kidChores = chores.filter((chore) => chore.childId === kid.id)
            const progress = childProgress.find((p) => p.id === kid.id)
            return (
              <ParentChildSection
                key={kid.id}
                kid={kid}
                chores={kidChores}
                points={progress?.points ?? 0}
                level={progress?.level ?? 1}
                onAddChore={onAddChore}
                onToggleChore={onToggleChore}
                onEditChore={onEditChore}
                onDeleteChore={onDeleteChore}
              />
            )
          })
        )}
      </div>
    ),
    rewards: (
      <div className="space-y-6">
        <RewardList rewards={rewards} onAddReward={onAddReward} onEditReward={onEditReward} onDeleteReward={onDeleteReward} />
        <SeasonPassBuilder rewards={rewards} milestones={seasonPassMilestones} onSave={handleSaveSeasonPass} />
      </div>
    ),
    settings: (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.nav.settings')}</h2>
        {accountType ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{t('accountType.label')}:</span>
              <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                {t(`accountType.${accountType}`, accountType)}
              </span>
            </div>
            {accountType === 'FREE' ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">{t('accountType.upgradeHint')}</p>
                <button
                  type="button"
                  className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                  disabled
                  title={t('accountType.upgradeLabel')}
                >
                  {t('accountType.upgradeLabel')}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t('dashboard.settingsSoon')}</p>
        )}
      </section>
    ),
  }

  return (
    <>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <Sidebar
          activeNav={activeNav}
          onNavChange={onNavChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((previous) => !previous)}
        />

        <div className="space-y-6">{navContentMap[activeNav] ?? dashboardContent}</div>
      </div>

      {seasonPassMessage ? (
        <div role="status" className="fixed bottom-4 right-4 z-40 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-md">
          {seasonPassMessage}
        </div>
      ) : null}
    </>
  )
}

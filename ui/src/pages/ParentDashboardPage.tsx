import { useEffect, useMemo, useState, type ReactElement } from 'react'
import ChoresSection from '../components/dashboard/ChoresSection'
import KinSection from '../components/dashboard/KinSection'
import type { ChoreItem, KidAccount, RewardItem } from '../components/dashboard/types'
import Sidebar from '../components/layout/Sidebar'
import KinProgressSection, { type ChildProgressSummary } from '../components/parent/KinProgressSection'
import RewardList from '../components/rewards/RewardList'
import SeasonPassBuilder, { type SeasonPassMilestone } from '../components/rewards/SeasonPassBuilder'

const LEVEL_SIZE = 100
const STORAGE_KEY = 'choretrack.parent.season-pass'

interface ParentDashboardPageProps {
  parentName: string
  kids: KidAccount[]
  chores: ChoreItem[]
  rewards: RewardItem[]
  activeNav: string
  onNavChange: (id: string) => void
  onAddChore: () => void
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
      id: `milestone-${reward.pointsCost}`,
      pointsRequired: reward.pointsCost,
      rewards: [reward],
    })
    return milestones
  }, [])
}

export default function ParentDashboardPage({
  parentName,
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
          ? `Choose 1 of ${nextMilestone.rewards.length} rewards`
          : nextMilestone.rewards[0]?.name ?? 'Season reward'
        : 'No season reward assigned'

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
  }, [chores, kids, seasonPassMilestones])

  const handleSaveSeasonPass = () => {
    const storedSeasonPass: StoredSeasonPassMilestone[] = seasonPassMilestones.map((milestone, index) => ({
      id: milestone.id,
      level: index + 1,
      pointsRequired: milestone.pointsRequired,
      rewards: milestone.rewards.map((reward) => ({
        id: reward.id,
        title: reward.name,
        description: reward.description || 'Season Pass reward',
        icon: reward.icon,
      })),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSeasonPass))
    setSeasonPassMessage('Season Pass saved successfully.')
  }

  const dashboardContent = (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome back, {parentName}</h1>
        <p className="mt-3 text-base text-slate-600">Track each child's progress, chores, and rewards from your dashboard.</p>
      </section>
      <KinProgressSection childrenProgress={childProgress} />
      <div className="grid gap-6 xl:grid-cols-2">
        <RewardList rewards={rewards} onAddReward={onAddReward} onEditReward={onEditReward} onDeleteReward={onDeleteReward} />
        <SeasonPassBuilder rewards={rewards} milestones={seasonPassMilestones} onSave={handleSaveSeasonPass} />
      </div>
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
      <ChoresSection
        chores={chores}
        kids={kids}
        onToggleChore={onToggleChore}
        onEditChore={onEditChore}
        onDeleteChore={onDeleteChore}
        onAddChore={onAddChore}
      />
    ),
    rewards: (
      <div className="space-y-6">
        <RewardList rewards={rewards} onAddReward={onAddReward} onEditReward={onEditReward} onDeleteReward={onDeleteReward} />
        <SeasonPassBuilder rewards={rewards} milestones={seasonPassMilestones} onSave={handleSaveSeasonPass} />
      </div>
    ),
    settings: (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="mt-2 text-sm text-slate-600">More parent settings are coming soon.</p>
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

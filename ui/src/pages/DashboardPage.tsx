import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import DashboardHeader from '../components/layout/DashboardHeader'
import DashboardSidebar from '../components/layout/DashboardSidebar'
import OverviewSection from '../components/dashboard/OverviewSection'
import ChoresSection from '../components/dashboard/ChoresSection'
import RewardsSection from '../components/dashboard/RewardsSection'
import KinSection from '../components/dashboard/KinSection'
import BattlePassTrack from '../components/dashboard/BattlePassTrack'
import type { ChoreItem, KidAccount, RewardItem } from '../components/dashboard/types'

interface DashboardState {
  registered?: boolean
  username?: string
  firstName?: string
}

interface DemoDashboardResponse {
  parent?: { name?: string }
  children?: Array<{ id?: string; name?: string; username?: string; avatar?: string }>
  chores?: Array<{ id?: string; title?: string; childId?: string; points?: number; completed?: boolean }>
  rewards?: Array<{ id?: string; name?: string; pointsCost?: number; icon?: string }>
  progress?: { level?: number; points?: number; nextLevelPoints?: number }
}

const toUsernameFallback = (value: string, id: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || id.toLowerCase()
}

const defaultParentName = 'Angie'

const defaultKids: KidAccount[] = [
  { id: 'child-preston', name: 'Preston', avatar: '🧒', username: 'preston' },
  { id: 'child-rylan', name: 'Rylan', avatar: '👦', username: 'rylan' },
  { id: 'child-karla', name: 'Karla', avatar: '👧', username: 'karla' },
]

const defaultChores: ChoreItem[] = [
  { id: 'chore-1', title: 'Pick up the trash', childId: 'child-preston', points: 25, completed: true },
  { id: 'chore-2', title: 'Clean Cracker cage', childId: 'child-karla', points: 30, completed: false },
  { id: 'chore-3', title: 'Feed Jessie', childId: 'child-rylan', points: 15, completed: true },
  { id: 'chore-4', title: 'Feed Hunter', childId: 'child-preston', points: 15, completed: false },
  { id: 'chore-5', title: 'Clean your room', childId: 'child-karla', points: 20, completed: true },
  { id: 'chore-6', title: 'Wash your dishes', childId: 'child-rylan', points: 10, completed: false },
  { id: 'chore-7', title: 'Wash your clothes', childId: 'child-preston', points: 20, completed: false },
]

const defaultRewards: RewardItem[] = [
  { id: 'reward-1', name: 'Get Icecream', pointsCost: 40, icon: '🍨' },
  { id: 'reward-2', name: 'Go to the movies', pointsCost: 90, icon: '🎬' },
  { id: 'reward-3', name: 'Extra gaming time', pointsCost: 60, icon: '🎮' },
  { id: 'reward-4', name: 'Extra tablet time', pointsCost: 50, icon: '📱' },
  { id: 'reward-5', name: 'Buy one thing from Amazon', pointsCost: 150, icon: '📦' },
]

export default function DashboardPage() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as DashboardState | null) ?? null
  const [demoParentName, setDemoParentName] = useState(defaultParentName)
  const parentName = state?.firstName?.trim() || state?.username?.trim() || demoParentName
  const [activeNav, setActiveNav] = useState('chores')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false)
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false)
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)

  const [kids, setKids] = useState<KidAccount[]>(defaultKids)
  const [chores, setChores] = useState<ChoreItem[]>(defaultChores)
  const [rewards, setRewards] = useState<RewardItem[]>(defaultRewards)
  const [basePoints, setBasePoints] = useState(160)
  const points = basePoints + chores.filter((chore) => chore.completed).reduce((total, chore) => total + chore.points, 0)
  const [level, setLevel] = useState(3)
  const [nextLevelPoints, setNextLevelPoints] = useState(300)

  const [newChore, setNewChore] = useState({ title: '', childId: kids[0]?.id ?? '', points: 10 })
  const [newReward, setNewReward] = useState({ name: '', pointsCost: 100 })
  const [newChild, setNewChild] = useState({ name: '', username: '', password: '' })

  useEffect(() => {
    const abortController = new AbortController()

    const loadDemoDashboard = async () => {
      try {
        const response = await fetch('/api/demo/dashboard', {
          signal: abortController.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!response.ok) return

        const data = (await response.json()) as DemoDashboardResponse
        const mappedKids = (data.children ?? [])
          .map((child): KidAccount | null => {
            if (!child.id || !child.name) return null
            return {
              id: child.id,
              name: child.name,
              username: child.username?.trim() || toUsernameFallback(child.name, child.id),
              avatar: child.avatar || '🧒',
            }
          })
          .filter((child): child is KidAccount => child !== null)
        const mappedChores = (data.chores ?? [])
          .map((chore): ChoreItem | null => {
            if (!chore.id || !chore.title || !chore.childId || !Number.isFinite(chore.points)) return null
            return {
              id: chore.id,
              title: chore.title,
              childId: chore.childId,
              points: Number(chore.points),
              completed: Boolean(chore.completed),
            }
          })
          .filter((chore): chore is ChoreItem => chore !== null)
        const mappedRewards = (data.rewards ?? [])
          .map((reward): RewardItem | null => {
            if (!reward.id || !reward.name || !Number.isFinite(reward.pointsCost)) return null
            return {
              id: reward.id,
              name: reward.name,
              pointsCost: Number(reward.pointsCost),
              icon: reward.icon || '🎁',
            }
          })
          .filter((reward): reward is RewardItem => reward !== null)

        if (mappedKids.length > 0) setKids(mappedKids)
        if (mappedChores.length > 0) {
          setChores(mappedChores)
          const completedPoints = mappedChores.filter((chore) => chore.completed).reduce((total, chore) => total + chore.points, 0)
          const progressPointsFromApi = Number.isFinite(data.progress?.points) ? Number(data.progress?.points) : completedPoints
          const basePointsFromProgress = progressPointsFromApi >= completedPoints ? progressPointsFromApi - completedPoints : 0
          setBasePoints(Math.max(basePointsFromProgress, 0))
        }
        if (mappedRewards.length > 0) setRewards(mappedRewards)
        if (data.parent?.name?.trim()) setDemoParentName(data.parent.name.trim())
        if (Number.isFinite(data.progress?.level)) setLevel(Math.max(Number(data.progress?.level), 1))
        if (Number.isFinite(data.progress?.nextLevelPoints)) setNextLevelPoints(Math.max(Number(data.progress?.nextLevelPoints), 1))
      } catch {
        return
      }
    }

    void loadDemoDashboard()
    return () => abortController.abort()
  }, [token])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleToggleChore = (id: string) => {
    setChores((prev) =>
      prev.map((chore) => {
        if (chore.id !== id) return chore
        return { ...chore, completed: !chore.completed }
      }),
    )
  }

  const handleCreateChore = () => {
    if (!newChore.title.trim() || !newChore.childId.trim() || kids.length === 0) return
    setChores((prev) => [
      {
        id: crypto.randomUUID(),
        title: newChore.title.trim(),
        childId: newChore.childId,
        points: newChore.points,
        completed: false,
      },
      ...prev,
    ])
    setNewChore({ title: '', childId: kids[0]?.id ?? '', points: 10 })
    setIsAddChoreOpen(false)
  }

  const handleCreateReward = () => {
    if (!newReward.name.trim()) return
    setRewards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newReward.name.trim(),
        pointsCost: newReward.pointsCost,
        icon: '🎁',
      },
    ])
    setNewReward({ name: '', pointsCost: 100 })
    setIsAddRewardOpen(false)
  }

  const handleCreateChild = () => {
    if (!newChild.name.trim() || !newChild.username.trim()) return
    const childId = crypto.randomUUID()
    setKids((prev) => [
      ...prev,
      {
        id: childId,
        name: newChild.name.trim(),
        username: newChild.username.trim(),
        avatar: '🧒',
      },
    ])
    setNewChore((prev) => (prev.childId ? prev : { ...prev, childId }))
    setNewChild({ name: '', username: '', password: '' })
    setIsAddChildOpen(false)
  }

  const modalClassName =
    'fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/40">
      <DashboardHeader
        isProfileOpen={isProfileOpen}
        onToggleProfile={() => setIsProfileOpen((prev) => !prev)}
        parentName={parentName}
        onLogout={() => void handleLogout()}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <DashboardSidebar activeNav={activeNav} onNavChange={setActiveNav} onAddChore={() => setIsAddChoreOpen(true)} />

        <div className="space-y-6">
          {state?.registered ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
              Account created successfully. Welcome, {parentName}!
            </div>
          ) : null}
          <OverviewSection parentName={parentName} level={level} points={points} nextLevelPoints={nextLevelPoints} />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-1">
              <ChoresSection chores={chores} kids={kids} onToggleChore={handleToggleChore} onAddChore={() => setIsAddChoreOpen(true)} />
            </div>
            <div className="space-y-6 xl:col-span-1">
              <RewardsSection
                rewards={rewards}
                level={level}
                points={points}
                nextLevelPoints={nextLevelPoints}
                onAddReward={() => setIsAddRewardOpen(true)}
              />
            </div>
            <div className="space-y-6 xl:col-span-1">
              <KinSection parentName={parentName} kids={kids} onAddChild={() => setIsAddChildOpen(true)} />
            </div>
          </div>

          <BattlePassTrack
            points={points}
            currentLevel={level}
            nextLevel={level + 1}
            currentLevelTargetPoints={nextLevelPoints}
          />
        </div>
      </div>

      {isAddChoreOpen ? (
        <div className={modalClassName}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900">Assign Chore</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-600">
                Chore
                <input
                  value={newChore.title}
                  onChange={(event) => setNewChore((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Take out trash"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-600">
                Child
                <select
                  value={newChore.childId}
                  onChange={(event) => setNewChore((prev) => ({ ...prev, childId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {kids.map((kid) => (
                    <option key={kid.id} value={kid.id}>
                      {kid.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-600">
                Points
                <input
                  type="number"
                  min={1}
                  value={newChore.points}
                  onChange={(event) => {
                    const parsed = Number(event.target.value)
                    const nextPoints = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1
                    setNewChore((prev) => ({ ...prev, points: nextPoints }))
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddChoreOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateChore}
                disabled={kids.length === 0}
                className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Add Chore
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAddRewardOpen ? (
        <div className={modalClassName}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900">Create Reward</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-600">
                Reward Name
                <input
                  value={newReward.name}
                  onChange={(event) => setNewReward((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Weekend Adventure"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-600">
                Point Value
                <input
                  type="number"
                  min={1}
                  value={newReward.pointsCost}
                  onChange={(event) => {
                    const parsed = Number(event.target.value)
                    const nextCost = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1
                    setNewReward((prev) => ({ ...prev, pointsCost: nextCost }))
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddRewardOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
                Cancel
              </button>
              <button type="button" onClick={handleCreateReward} className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white">
                Add Reward
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAddChildOpen ? (
        <div className={modalClassName}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900">Create Child Account</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-600">
                Name
                <input
                  value={newChild.name}
                  onChange={(event) => setNewChild((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Avery"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-600">
                Username
                <input
                  value={newChild.username}
                  onChange={(event) => setNewChild((prev) => ({ ...prev, username: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="avery123"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-600">
                Password
                <input
                  type="password"
                  value={newChild.password}
                  onChange={(event) => setNewChild((prev) => ({ ...prev, password: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="••••••••"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddChildOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
                Cancel
              </button>
              <button type="button" onClick={handleCreateChild} className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white">
                Add Child
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

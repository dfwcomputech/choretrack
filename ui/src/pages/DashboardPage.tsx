import { useState } from 'react'
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

export default function DashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as DashboardState | null) ?? null
  const parentName = state?.firstName?.trim() || state?.username?.trim() || 'Danielle Parent'
  const [activeNav, setActiveNav] = useState('chores')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false)
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false)
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)

  const [kids, setKids] = useState<KidAccount[]>([
    { id: 'emma', name: 'Emma', avatar: '👧', username: 'emma' },
    { id: 'liam', name: 'Liam', avatar: '🧒', username: 'liam' },
    { id: 'noah', name: 'Noah', avatar: '👦', username: 'noah' },
  ])

  const [chores, setChores] = useState<ChoreItem[]>([
    { id: '1', title: 'Take out trash', childId: 'emma', points: 20, completed: true },
    { id: '2', title: 'Water the plants', childId: 'liam', points: 10, completed: false },
    { id: '3', title: 'Clean bedroom', childId: 'emma', points: 15, completed: true },
    { id: '4', title: 'Feed the dog', childId: 'noah', points: 12, completed: false },
    { id: '5', title: 'Set the table', childId: 'liam', points: 10, completed: true },
  ])

  const [rewards, setRewards] = useState<RewardItem[]>([
    { id: 'r1', name: 'Extra Screen Time', pointsCost: 150, icon: '📱' },
    { id: 'r2', name: 'Allowance Boost', pointsCost: 300, icon: '💰' },
    { id: 'r3', name: 'Family Movie Night', pointsCost: 500, icon: '🎬' },
    { id: 'r4', name: 'Arcade Trip', pointsCost: 650, icon: '🕹️' },
  ])

  const seedPoints = 202
  const points = seedPoints + chores.filter((chore) => chore.completed).reduce((total, chore) => total + chore.points, 0)
  const level = 3
  const nextLevelPoints = 300

  const [newChore, setNewChore] = useState({ title: '', childId: 'emma', points: 10 })
  const [newReward, setNewReward] = useState({ name: '', pointsCost: 100 })
  const [newChild, setNewChild] = useState({ name: '', username: '', password: '' })

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
    if (!newChore.title.trim()) return
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
    setKids((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newChild.name.trim(),
        username: newChild.username.trim(),
        avatar: '🧒',
      },
    ])
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

          <BattlePassTrack points={points} />
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
                  onChange={(event) => setNewChore((prev) => ({ ...prev, points: Number(event.target.value) || 1 }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddChoreOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
                Cancel
              </button>
              <button type="button" onClick={handleCreateChore} className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white">
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
                  onChange={(event) => setNewReward((prev) => ({ ...prev, pointsCost: Number(event.target.value) || 1 }))}
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

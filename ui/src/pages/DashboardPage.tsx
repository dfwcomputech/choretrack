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
import AddChildAccountForm from '../components/children/AddChildAccountForm'
import EditChildAccountForm from '../components/children/EditChildAccountForm'
import DeleteChildAccountDialog from '../components/children/DeleteChildAccountDialog'
import type { ChoreItem, KidAccount, RewardItem } from '../components/dashboard/types'
import {
  ChildServiceError,
  createChildAccount,
  deleteChildAccount,
  listChildAccounts,
  updateChildAccount,
  type CreateChildAccountPayload,
  type UpdateChildAccountPayload,
} from '../services/childService'

interface DashboardState {
  registered?: boolean
  username?: string
  firstName?: string
}

const fallbackParentName = 'Parent'

const deriveNameParts = (kid: KidAccount) => {
  const fallbackParts = kid.name.trim().split(/\s+/).filter(Boolean)
  const firstName = kid.firstName?.trim() || fallbackParts[0] || ''
  const lastName = kid.lastName?.trim() || fallbackParts.slice(1).join(' ')
  const displayName = kid.displayName?.trim() || kid.name.trim()
  return { firstName, lastName, displayName }
}

const toKidAccount = (child: {
  id: string
  username: string
  firstName: string
  lastName: string
  displayName: string
}) => {
  const displayName = child.displayName?.trim() || [child.firstName?.trim(), child.lastName?.trim()].filter(Boolean).join(' ') || child.username
  return {
    id: child.id,
    name: displayName,
    username: child.username,
    avatar: '🧒',
    firstName: child.firstName,
    lastName: child.lastName,
    displayName: child.displayName,
  }
}

export default function DashboardPage() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as DashboardState | null) ?? null
  const parentName = state?.firstName?.trim() || state?.username?.trim() || fallbackParentName
  const [activeNav, setActiveNav] = useState('chores')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false)
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false)
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)

  const [kids, setKids] = useState<KidAccount[]>([])
  const [chores, setChores] = useState<ChoreItem[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const basePoints = 0
  const points = basePoints + chores.filter((chore) => chore.completed).reduce((total, chore) => total + chore.points, 0)
  const level = 1
  const nextLevelPoints = 100

  const [newChore, setNewChore] = useState({ title: '', childId: kids[0]?.id ?? '', points: 10 })
  const [newReward, setNewReward] = useState({ name: '', pointsCost: 100 })
  const [isCreatingChild, setIsCreatingChild] = useState(false)
  const [createChildErrorMessage, setCreateChildErrorMessage] = useState('')
  const [createChildFieldErrors, setCreateChildFieldErrors] = useState<Record<string, string>>({})
  const [isEditChildOpen, setIsEditChildOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<KidAccount | null>(null)
  const [isUpdatingChild, setIsUpdatingChild] = useState(false)
  const [updateChildErrorMessage, setUpdateChildErrorMessage] = useState('')
  const [updateChildFieldErrors, setUpdateChildFieldErrors] = useState<Record<string, string>>({})
  const [isDeleteChildOpen, setIsDeleteChildOpen] = useState(false)
  const [isDeletingChild, setIsDeletingChild] = useState(false)
  const [deleteChildErrorMessage, setDeleteChildErrorMessage] = useState('')
  const [childSuccessMessage, setChildSuccessMessage] = useState('')
  const [addChildFormKey, setAddChildFormKey] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()

    const loadChildren = async () => {
      if (!token.trim()) return
      try {
        const children = await listChildAccounts(token)
        if (abortController.signal.aborted) return
        const mappedKids = children.map(toKidAccount)
        setKids(mappedKids)
        setNewChore((currentChore) => {
          const hasSelectedChild = mappedKids.some((kid) => kid.id === currentChore.childId)
          if (hasSelectedChild) return currentChore
          return { ...currentChore, childId: mappedKids[0]?.id ?? '' }
        })
      } catch {
        return
      }
    }

    void loadChildren()
    return () => abortController.abort()
  }, [token])

  useEffect(() => {
    if (!childSuccessMessage) return
    const timeoutId = window.setTimeout(() => {
      setChildSuccessMessage('')
    }, 4000)
    return () => window.clearTimeout(timeoutId)
  }, [childSuccessMessage])

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

  const openAddChildDialog = () => {
    setChildSuccessMessage('')
    setCreateChildErrorMessage('')
    setCreateChildFieldErrors({})
    setAddChildFormKey((prev) => prev + 1)
    setIsAddChildOpen(true)
  }

  const closeAddChildDialog = () => {
    if (isCreatingChild) return
    setCreateChildErrorMessage('')
    setCreateChildFieldErrors({})
    setIsAddChildOpen(false)
  }

  const handleCreateChild = async (payload: CreateChildAccountPayload) => {
    setCreateChildErrorMessage('')
    setCreateChildFieldErrors({})
    setIsCreatingChild(true)
    try {
      const child = await createChildAccount(payload, token)
      const mappedKid = toKidAccount(child)
      setKids((prev) => [...prev, mappedKid])
      setNewChore((prev) => (prev.childId ? prev : { ...prev, childId: child.id }))
      setChildSuccessMessage(`${mappedKid.name} has been added to your family.`)
      setIsAddChildOpen(false)
    } catch (error) {
      if (error instanceof ChildServiceError) {
        setCreateChildErrorMessage(error.message)
        setCreateChildFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to create child account', error)
      setCreateChildErrorMessage('Unable to create child account. Please try again.')
    } finally {
      setIsCreatingChild(false)
    }
  }

  const openEditChildDialog = (kid: KidAccount) => {
    setChildSuccessMessage('')
    setUpdateChildErrorMessage('')
    setUpdateChildFieldErrors({})
    setSelectedChild(kid)
    setIsEditChildOpen(true)
  }

  const closeEditChildDialog = () => {
    if (isUpdatingChild) return
    setUpdateChildErrorMessage('')
    setUpdateChildFieldErrors({})
    setIsEditChildOpen(false)
    setSelectedChild(null)
  }

  const handleUpdateChild = async (payload: UpdateChildAccountPayload) => {
    if (!selectedChild) return
    setUpdateChildErrorMessage('')
    setUpdateChildFieldErrors({})
    setIsUpdatingChild(true)
    try {
      const updatedChild = await updateChildAccount(selectedChild.id, payload, token)
      const mappedKid = toKidAccount(updatedChild)
      setKids((prev) => prev.map((kid) => (kid.id === selectedChild.id ? mappedKid : kid)))
      setChildSuccessMessage(`${mappedKid.name} has been updated.`)
      setIsEditChildOpen(false)
      setSelectedChild(null)
    } catch (error) {
      if (error instanceof ChildServiceError) {
        setUpdateChildErrorMessage(error.message)
        setUpdateChildFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to update child account', error)
      setUpdateChildErrorMessage('Unable to update child account. Please try again.')
    } finally {
      setIsUpdatingChild(false)
    }
  }

  const openDeleteChildDialog = (kid: KidAccount) => {
    setChildSuccessMessage('')
    setDeleteChildErrorMessage('')
    setSelectedChild(kid)
    setIsDeleteChildOpen(true)
  }

  const closeDeleteChildDialog = () => {
    if (isDeletingChild) return
    setDeleteChildErrorMessage('')
    setIsDeleteChildOpen(false)
    setSelectedChild(null)
  }

  const handleDeleteChild = async () => {
    if (!selectedChild) return
    setDeleteChildErrorMessage('')
    setIsDeletingChild(true)
    try {
      await deleteChildAccount(selectedChild.id, token)
      const deletedChildId = selectedChild.id
      setKids((prev) => {
        const remainingKids = prev.filter((kid) => kid.id !== selectedChild.id)
        const nextDefaultChildId = remainingKids[0]?.id ?? ''
        setNewChore((currentChore) =>
          currentChore.childId === deletedChildId ? { ...currentChore, childId: nextDefaultChildId } : currentChore,
        )
        return remainingKids
      })
      setChildSuccessMessage(`${selectedChild.name} has been removed from your dashboard.`)
      setIsDeleteChildOpen(false)
      setSelectedChild(null)
    } catch (error) {
      if (error instanceof ChildServiceError) {
        setDeleteChildErrorMessage(error.message)
        return
      }
      console.error('Failed to delete child account', error)
      setDeleteChildErrorMessage('Unable to remove child account. Please try again.')
    } finally {
      setIsDeletingChild(false)
    }
  }

  const modalClassName =
    'fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4'
  const selectedChildNameParts = selectedChild ? deriveNameParts(selectedChild) : null

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
              <KinSection
                parentName={parentName}
                kids={kids}
                onAddChild={openAddChildDialog}
                onEditChild={openEditChildDialog}
                onDeleteChild={openDeleteChildDialog}
              />
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
        <AddChildAccountForm
          key={addChildFormKey}
          isOpen={isAddChildOpen}
          isSubmitting={isCreatingChild}
          errorMessage={createChildErrorMessage}
          fieldErrors={createChildFieldErrors}
          onClose={closeAddChildDialog}
          onSubmit={handleCreateChild}
        />
      ) : null}

      {isEditChildOpen && selectedChild ? (
        <EditChildAccountForm
          isOpen={isEditChildOpen}
          isSubmitting={isUpdatingChild}
          errorMessage={updateChildErrorMessage}
          fieldErrors={updateChildFieldErrors}
          initialValues={{
            username: selectedChild.username,
            firstName: selectedChildNameParts?.firstName ?? '',
            lastName: selectedChildNameParts?.lastName ?? '',
            displayName: selectedChildNameParts?.displayName ?? '',
          }}
          onClose={closeEditChildDialog}
          onSubmit={handleUpdateChild}
        />
      ) : null}

      {isDeleteChildOpen && selectedChild ? (
        <DeleteChildAccountDialog
          isOpen={isDeleteChildOpen}
          childName={selectedChild.name}
          isDeleting={isDeletingChild}
          errorMessage={deleteChildErrorMessage}
          onClose={closeDeleteChildDialog}
          onConfirm={handleDeleteChild}
        />
      ) : null}

      {childSuccessMessage ? (
        <div className="fixed bottom-4 right-4 z-40 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-md">
          {childSuccessMessage}
        </div>
      ) : null}
    </main>
  )
}

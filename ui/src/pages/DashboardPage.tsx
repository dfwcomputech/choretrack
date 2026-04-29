import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import DashboardHeader from '../components/layout/DashboardHeader'
import OverviewSection from '../components/dashboard/OverviewSection'
import AddChildAccountForm from '../components/children/AddChildAccountForm'
import EditChildAccountForm from '../components/children/EditChildAccountForm'
import DeleteChildAccountDialog from '../components/children/DeleteChildAccountDialog'
import AddChoreForm from '../components/chores/AddChoreForm'
import EditChoreForm from '../components/chores/EditChoreForm'
import DeleteChoreDialog from '../components/chores/DeleteChoreDialog'
import AddRewardForm from '../components/rewards/AddRewardForm'
import EditRewardForm from '../components/rewards/EditRewardForm'
import DeleteRewardDialog from '../components/rewards/DeleteRewardDialog'
import ChildDashboardPage from './ChildDashboardPage'
import ParentDashboardPage from './ParentDashboardPage'
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
import {
  ChoreServiceError,
  createChore,
  deleteChore,
  completeChore,
  revertChoreToPending,
  listChores,
  updateChore,
  type ChoreResponse,
  type CreateChorePayload,
  type UpdateChorePayload,
} from '../services/choreService'
import {
  RewardServiceError,
  createReward,
  deleteReward,
  listRewards,
  updateReward,
  type CreateRewardPayload,
  type RewardResponse,
  type UpdateRewardPayload,
} from '../services/rewardService'
import { getParentAccount } from '../services/authService'

interface DashboardState {
  registered?: boolean
  username?: string
  firstName?: string
}

interface JwtPayload {
  sub?: string
}

const BASE64_PADDING_MULTIPLE = 4
const buildDefaultRewards = (t: (key: string) => string): RewardItem[] => [
  {
    id: 'local-reward-icecream',
    name: t('rewards.defaultRewards.icecream.name'),
    description: t('rewards.defaultRewards.icecream.description'),
    pointsCost: 80,
    category: 'FUN',
    active: true,
    icon: '🍦',
  },
  {
    id: 'local-reward-gaming-time',
    name: t('rewards.defaultRewards.gaming.name'),
    description: t('rewards.defaultRewards.gaming.description'),
    pointsCost: 120,
    category: 'GAMING',
    active: true,
    icon: '🎮',
  },
  {
    id: 'local-reward-movies',
    name: t('rewards.defaultRewards.movies.name'),
    description: t('rewards.defaultRewards.movies.description'),
    pointsCost: 200,
    category: 'OUTING',
    active: true,
    icon: '🎬',
  },
]

const getAssignedChildName = (chores: ChoreItem[]) => {
  const choreWithName = chores.find((chore) => Boolean(chore.assignedChildName?.trim()))
  return choreWithName?.assignedChildName?.trim() ?? ''
}

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

const toChoreItem = (chore: ChoreResponse): ChoreItem => ({
  id: chore.id,
  title: chore.title,
  description: chore.description ?? '',
  childId: chore.assignedChildId,
  assignedChildName: chore.assignedChildName,
  points: chore.points,
  dueDate: chore.dueDate,
  status: chore.status,
  completed: chore.status === 'COMPLETED',
})

const toRewardItem = (reward: RewardResponse): RewardItem => ({
  id: reward.id,
  name: reward.name,
  description: reward.description ?? '',
  pointsCost: reward.pointCost,
  category: reward.category ?? '',
  active: reward.active,
  icon: '🎁',
})

const getTokenSubject = (token: string): string => {
  if (!token.trim()) return ''

  const tokenParts = token.split('.')
  if (tokenParts.length !== 3) return ''
  const [, payload] = tokenParts
  if (!payload) return ''

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / BASE64_PADDING_MULTIPLE) * BASE64_PADDING_MULTIPLE,
      '=',
    )
    const decodedPayload = JSON.parse(atob(paddedPayload)) as JwtPayload
    return decodedPayload.sub?.trim() ?? ''
  } catch {
    return ''
  }
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as DashboardState | null) ?? null
  // Token verification is enforced by backend APIs; this is only a UI fallback for displaying a name.
  const tokenSubject = useMemo(() => getTokenSubject(token), [token])
  const parentName = state?.firstName?.trim() || state?.username?.trim() || tokenSubject || t('dashboard.fallbackParentName')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false)
  const [isEditChoreOpen, setIsEditChoreOpen] = useState(false)
  const [isDeleteChoreOpen, setIsDeleteChoreOpen] = useState(false)
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false)
  const [isEditRewardOpen, setIsEditRewardOpen] = useState(false)
  const [isDeleteRewardOpen, setIsDeleteRewardOpen] = useState(false)
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)

  const [kids, setKids] = useState<KidAccount[]>([])
  const [chores, setChores] = useState<ChoreItem[]>([])
  const [selectedChore, setSelectedChore] = useState<ChoreItem | null>(null)
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [isUsingLocalRewards, setIsUsingLocalRewards] = useState(false)
  const level = 1
  const nextLevelPoints = 100

  const [isCreatingChore, setIsCreatingChore] = useState(false)
  const [createChoreErrorMessage, setCreateChoreErrorMessage] = useState('')
  const [createChoreFieldErrors, setCreateChoreFieldErrors] = useState<Record<string, string>>({})
  const [isUpdatingChore, setIsUpdatingChore] = useState(false)
  const [updateChoreErrorMessage, setUpdateChoreErrorMessage] = useState('')
  const [updateChoreFieldErrors, setUpdateChoreFieldErrors] = useState<Record<string, string>>({})
  const [isDeletingChore, setIsDeletingChore] = useState(false)
  const [deleteChoreErrorMessage, setDeleteChoreErrorMessage] = useState('')
  const [choreSuccessMessage, setChoreSuccessMessage] = useState('')
  const [isCreatingReward, setIsCreatingReward] = useState(false)
  const [createRewardErrorMessage, setCreateRewardErrorMessage] = useState('')
  const [createRewardFieldErrors, setCreateRewardFieldErrors] = useState<Record<string, string>>({})
  const [isUpdatingReward, setIsUpdatingReward] = useState(false)
  const [updateRewardErrorMessage, setUpdateRewardErrorMessage] = useState('')
  const [updateRewardFieldErrors, setUpdateRewardFieldErrors] = useState<Record<string, string>>({})
  const [isDeletingReward, setIsDeletingReward] = useState(false)
  const [deleteRewardErrorMessage, setDeleteRewardErrorMessage] = useState('')
  const [rewardSuccessMessage, setRewardSuccessMessage] = useState('')
  const [addRewardFormKey, setAddRewardFormKey] = useState(0)
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
  const [isChildView, setIsChildView] = useState(false)
  const [childCurrentPoints, setChildCurrentPoints] = useState<number | null>(null)
  const [completingChoreId, setCompletingChoreId] = useState<string | null>(null)
  const [revertingChoreId, setRevertingChoreId] = useState<string | null>(null)
  const [childCompletionErrorMessage, setChildCompletionErrorMessage] = useState('')
  const [childCompletionSuccessMessage, setChildCompletionSuccessMessage] = useState('')
  const [isRedirectingForUnauthorized, setIsRedirectingForUnauthorized] = useState(false)
  const [parentAccountType, setParentAccountType] = useState<string>('')
  const defaultRewards = useMemo(() => buildDefaultRewards((key) => t(key)), [t])

  const visibleChores = chores
  const completedChildChoreCount = visibleChores.filter((chore) => chore.status === 'COMPLETED' || chore.completed).length
  const pendingChildChoreCount = visibleChores.length - completedChildChoreCount
  const earnedPointsFromChores = visibleChores
    .filter((chore) => chore.status === 'COMPLETED' || chore.completed)
    .reduce((total, chore) => total + chore.points, 0)
  const points = isChildView ? (childCurrentPoints ?? earnedPointsFromChores) : earnedPointsFromChores
  const childAssignedName = getAssignedChildName(visibleChores)
  const childName = childAssignedName || state?.firstName?.trim() || state?.username?.trim() || tokenSubject || t('dashboard.fallbackChildName')

  const handleUnauthorized = useCallback(async () => {
    if (isRedirectingForUnauthorized) return
    setIsRedirectingForUnauthorized(true)
    await logout()
    navigate('/', { replace: true })
  }, [isRedirectingForUnauthorized, logout, navigate])

  useEffect(() => {
    let cancelled = false

    const loadParentAccount = async () => {
      if (!token.trim()) return
      const account = await getParentAccount(token)
      if (!cancelled && account) {
        setParentAccountType(account.accountType)
      }
    }

    void loadParentAccount()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    const abortController = new AbortController()

    const loadChildren = async () => {
      if (!token.trim()) return
      try {
        const children = await listChildAccounts(token)
        if (abortController.signal.aborted) return
        setIsChildView(false)
        setKids(children.map(toKidAccount))
      } catch (error) {
        if (abortController.signal.aborted) return
        if (error instanceof ChildServiceError && error.status === 401) {
          await handleUnauthorized()
          return
        }
        if (error instanceof ChildServiceError && error.status === 403) {
          setIsChildView(true)
          setKids([])
          return
        }
        return
      }
    }

    void loadChildren()
    return () => abortController.abort()
  }, [handleUnauthorized, token])

  useEffect(() => {
    const abortController = new AbortController()

    const loadRewards = async () => {
      if (isChildView) {
        setRewards([])
        setIsUsingLocalRewards(false)
        return
      }
      if (!token.trim()) return
      try {
        const loadedRewards = await listRewards(token)
        if (abortController.signal.aborted) return
        if (loadedRewards.length === 0) {
          setRewards(defaultRewards)
          setIsUsingLocalRewards(true)
          return
        }
        setRewards(loadedRewards.map(toRewardItem))
        setIsUsingLocalRewards(false)
      } catch (error) {
        if (abortController.signal.aborted) return
        if (error instanceof RewardServiceError && error.status === 401) {
          await handleUnauthorized()
          return
        }
        setRewards(defaultRewards)
        setIsUsingLocalRewards(true)
        return
      }
    }

    void loadRewards()
    return () => abortController.abort()
  }, [defaultRewards, handleUnauthorized, isChildView, token])

  useEffect(() => {
    const abortController = new AbortController()

    const loadChores = async () => {
      if (!token.trim()) return
      try {
        const loadedChores = await listChores(token)
        if (abortController.signal.aborted) return
        setChores(loadedChores.map(toChoreItem))
      } catch (error) {
        if (abortController.signal.aborted) return
        if (error instanceof ChoreServiceError && error.status === 401) {
          await handleUnauthorized()
          return
        }
        return
      }
    }

    void loadChores()
    return () => abortController.abort()
  }, [handleUnauthorized, token])

  useEffect(() => {
    if (!childSuccessMessage) return
    const timeoutId = window.setTimeout(() => {
      setChildSuccessMessage('')
    }, 4000)
    return () => window.clearTimeout(timeoutId)
  }, [childSuccessMessage])

  useEffect(() => {
    if (!choreSuccessMessage) return
    const timeoutId = window.setTimeout(() => {
      setChoreSuccessMessage('')
    }, 4000)
    return () => window.clearTimeout(timeoutId)
  }, [choreSuccessMessage])

  useEffect(() => {
    if (!rewardSuccessMessage) return
    const timeoutId = window.setTimeout(() => {
      setRewardSuccessMessage('')
    }, 4000)
    return () => window.clearTimeout(timeoutId)
  }, [rewardSuccessMessage])

  useEffect(() => {
    if (!childCompletionSuccessMessage) return
    const timeoutId = window.setTimeout(() => {
      setChildCompletionSuccessMessage('')
    }, 4000)
    return () => window.clearTimeout(timeoutId)
  }, [childCompletionSuccessMessage])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleToggleChore = (id: string) => {
    setChores((prev) =>
      prev.map((chore) => {
        if (chore.id !== id) return chore
        const nextCompleted = !chore.completed
        return { ...chore, completed: nextCompleted, status: nextCompleted ? 'COMPLETED' : 'PENDING' }
      }),
    )
  }

  const handleCompleteChildChore = async (choreId: string) => {
    if (completingChoreId || revertingChoreId) return
    setChildCompletionErrorMessage('')
    setChildCompletionSuccessMessage('')
    setCompletingChoreId(choreId)
    try {
      const completion = await completeChore(choreId, token)
      setChores((prev) =>
        prev.map((chore) =>
          chore.id === choreId
            ? {
                ...chore,
                status: completion.status,
                completed: completion.status === 'COMPLETED',
              }
            : chore,
        ),
      )
      setChildCurrentPoints(completion.childCurrentPoints)
      setChildCompletionSuccessMessage(t('dashboard.success.childChoreCompleted', { points: completion.pointsAwarded }))
    } catch (error) {
      if (error instanceof ChoreServiceError) {
        setChildCompletionErrorMessage(error.message)
      } else {
        console.error('Failed to complete chore', error)
        setChildCompletionErrorMessage(t('dashboard.errors.completeChoreFailed'))
      }
    } finally {
      setCompletingChoreId(null)
    }
  }

  const handleRevertChildChore = async (choreId: string) => {
    if (completingChoreId || revertingChoreId) return
    setChildCompletionErrorMessage('')
    setChildCompletionSuccessMessage('')
    setRevertingChoreId(choreId)
    try {
      const reverted = await revertChoreToPending(choreId, token)
      setChores((prev) =>
        prev.map((chore) =>
          chore.id === choreId
            ? {
                ...chore,
                status: reverted.status,
                completed: reverted.status === 'COMPLETED',
              }
            : chore,
        ),
      )
      setChildCurrentPoints(reverted.childCurrentPoints)
      const pointsRemoved = Math.abs(reverted.pointsAwarded)
      setChildCompletionSuccessMessage(
        pointsRemoved > 0
          ? t('dashboard.success.childChoreRevertedWithPoints', { pointsRemoved })
          : t('dashboard.success.childChoreReverted'),
      )
    } catch (error) {
      if (error instanceof ChoreServiceError) {
        setChildCompletionErrorMessage(error.message)
      } else {
        console.error('Failed to revert chore', error)
        setChildCompletionErrorMessage(t('dashboard.errors.revertChoreFailed'))
      }
    } finally {
      setRevertingChoreId(null)
    }
  }

  const openAddChoreDialog = () => {
    setChoreSuccessMessage('')
    setCreateChoreErrorMessage('')
    setCreateChoreFieldErrors({})
    setIsAddChoreOpen(true)
  }

  const closeAddChoreDialog = () => {
    if (isCreatingChore) return
    setCreateChoreErrorMessage('')
    setCreateChoreFieldErrors({})
    setIsAddChoreOpen(false)
  }

  const handleCreateChore = async (payload: CreateChorePayload) => {
    setCreateChoreErrorMessage('')
    setCreateChoreFieldErrors({})
    setIsCreatingChore(true)
    try {
      await createChore(payload, token)
      const refreshedChores = await listChores(token)
      setChores(refreshedChores.map(toChoreItem))
      setChoreSuccessMessage(t('dashboard.success.choreCreated'))
      setIsAddChoreOpen(false)
    } catch (error) {
      if (error instanceof ChoreServiceError) {
        setCreateChoreErrorMessage(error.message)
        setCreateChoreFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to create chore', error)
      setCreateChoreErrorMessage(t('dashboard.errors.createChoreFailed'))
    } finally {
      setIsCreatingChore(false)
    }
  }

  const openEditChoreDialog = (chore: ChoreItem) => {
    setChoreSuccessMessage('')
    setUpdateChoreErrorMessage('')
    setUpdateChoreFieldErrors({})
    setSelectedChore(chore)
    setIsEditChoreOpen(true)
  }

  const closeEditChoreDialog = () => {
    if (isUpdatingChore) return
    setUpdateChoreErrorMessage('')
    setUpdateChoreFieldErrors({})
    setIsEditChoreOpen(false)
    setSelectedChore(null)
  }

  const handleUpdateChore = async (payload: UpdateChorePayload) => {
    if (!selectedChore) return
    setUpdateChoreErrorMessage('')
    setUpdateChoreFieldErrors({})
    setIsUpdatingChore(true)
    try {
      await updateChore(selectedChore.id, payload, token)
      const refreshedChores = await listChores(token)
      setChores(refreshedChores.map(toChoreItem))
      setChoreSuccessMessage(t('dashboard.success.choreUpdated'))
      setIsEditChoreOpen(false)
      setSelectedChore(null)
    } catch (error) {
      if (error instanceof ChoreServiceError) {
        setUpdateChoreErrorMessage(error.message)
        setUpdateChoreFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to update chore', error)
      setUpdateChoreErrorMessage(t('dashboard.errors.updateChoreFailed'))
    } finally {
      setIsUpdatingChore(false)
    }
  }

  const openDeleteChoreDialog = (chore: ChoreItem) => {
    setChoreSuccessMessage('')
    setDeleteChoreErrorMessage('')
    setSelectedChore(chore)
    setIsDeleteChoreOpen(true)
  }

  const closeDeleteChoreDialog = () => {
    if (isDeletingChore) return
    setDeleteChoreErrorMessage('')
    setIsDeleteChoreOpen(false)
    setSelectedChore(null)
  }

  const handleDeleteChore = async () => {
    if (!selectedChore) return
    setDeleteChoreErrorMessage('')
    setIsDeletingChore(true)
    try {
      const deletedChoreId = selectedChore.id
      await deleteChore(deletedChoreId, token)
      setChores((prev) => prev.filter((chore) => chore.id !== deletedChoreId))
      setChoreSuccessMessage(t('dashboard.success.choreDeleted'))
      setIsDeleteChoreOpen(false)
      setSelectedChore(null)
    } catch (error) {
      if (error instanceof ChoreServiceError) {
        setDeleteChoreErrorMessage(error.message)
        return
      }
      console.error('Failed to delete chore', error)
      setDeleteChoreErrorMessage(t('dashboard.errors.deleteChoreFailed'))
    } finally {
      setIsDeletingChore(false)
    }
  }

  const openAddRewardDialog = () => {
    setRewardSuccessMessage('')
    setCreateRewardErrorMessage('')
    setCreateRewardFieldErrors({})
    setAddRewardFormKey((prev) => prev + 1)
    setIsAddRewardOpen(true)
  }

  const closeAddRewardDialog = () => {
    if (isCreatingReward) return
    setCreateRewardErrorMessage('')
    setCreateRewardFieldErrors({})
    setIsAddRewardOpen(false)
  }

  const handleCreateReward = async (payload: CreateRewardPayload) => {
    if (isUsingLocalRewards) {
      const localRewardId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `local-reward-${crypto.randomUUID()}`
          : `local-reward-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`
      setRewards((prev) => [
        {
          id: localRewardId,
          name: payload.name,
          description: payload.description ?? '',
          pointsCost: payload.pointCost,
          category: payload.category ?? '',
          active: payload.active ?? true,
          icon: '🎁',
        },
        ...prev,
      ])
      setRewardSuccessMessage(t('dashboard.success.rewardCreated'))
      setIsAddRewardOpen(false)
      return
    }

    setCreateRewardErrorMessage('')
    setCreateRewardFieldErrors({})
    setIsCreatingReward(true)
    try {
      const createdReward = await createReward(payload, token)
      setRewards((prev) => [toRewardItem(createdReward), ...prev])
      setRewardSuccessMessage(t('dashboard.success.rewardCreated'))
      setIsAddRewardOpen(false)
    } catch (error) {
      if (error instanceof RewardServiceError) {
        setCreateRewardErrorMessage(error.message)
        setCreateRewardFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to create reward', error)
      setCreateRewardErrorMessage(t('dashboard.errors.createRewardFailed'))
    } finally {
      setIsCreatingReward(false)
    }
  }

  const openEditRewardDialog = (reward: RewardItem) => {
    setRewardSuccessMessage('')
    setUpdateRewardErrorMessage('')
    setUpdateRewardFieldErrors({})
    setSelectedReward(reward)
    setIsEditRewardOpen(true)
  }

  const closeEditRewardDialog = () => {
    if (isUpdatingReward) return
    setUpdateRewardErrorMessage('')
    setUpdateRewardFieldErrors({})
    setIsEditRewardOpen(false)
    setSelectedReward(null)
  }

  const handleUpdateReward = async (payload: UpdateRewardPayload) => {
    if (!selectedReward) return

    if (isUsingLocalRewards || selectedReward.id.startsWith('local-reward-')) {
      setRewards((prev) =>
        prev.map((reward) =>
          reward.id === selectedReward.id
            ? {
                ...reward,
                name: payload.name,
                description: payload.description ?? '',
                pointsCost: payload.pointCost,
                category: payload.category ?? '',
                active: payload.active,
              }
            : reward,
        ),
      )
      setRewardSuccessMessage(t('dashboard.success.rewardUpdated'))
      setIsEditRewardOpen(false)
      setSelectedReward(null)
      return
    }

    setUpdateRewardErrorMessage('')
    setUpdateRewardFieldErrors({})
    setIsUpdatingReward(true)
    try {
      const updatedReward = await updateReward(selectedReward.id, payload, token)
      setRewards((prev) => prev.map((reward) => (reward.id === selectedReward.id ? toRewardItem(updatedReward) : reward)))
      setRewardSuccessMessage(t('dashboard.success.rewardUpdated'))
      setIsEditRewardOpen(false)
      setSelectedReward(null)
    } catch (error) {
      if (error instanceof RewardServiceError) {
        setUpdateRewardErrorMessage(error.message)
        setUpdateRewardFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to update reward', error)
      setUpdateRewardErrorMessage(t('dashboard.errors.updateRewardFailed'))
    } finally {
      setIsUpdatingReward(false)
    }
  }

  const openDeleteRewardDialog = (reward: RewardItem) => {
    setRewardSuccessMessage('')
    setDeleteRewardErrorMessage('')
    setSelectedReward(reward)
    setIsDeleteRewardOpen(true)
  }

  const closeDeleteRewardDialog = () => {
    if (isDeletingReward) return
    setDeleteRewardErrorMessage('')
    setIsDeleteRewardOpen(false)
    setSelectedReward(null)
  }

  const handleDeleteReward = async () => {
    if (!selectedReward) return

    if (isUsingLocalRewards || selectedReward.id.startsWith('local-reward-')) {
      setRewards((prev) => prev.filter((reward) => reward.id !== selectedReward.id))
      setRewardSuccessMessage(t('dashboard.success.rewardDeleted'))
      setIsDeleteRewardOpen(false)
      setSelectedReward(null)
      return
    }

    setDeleteRewardErrorMessage('')
    setIsDeletingReward(true)
    try {
      const deletedRewardId = selectedReward.id
      await deleteReward(deletedRewardId, token)
      setRewards((prev) => prev.filter((reward) => reward.id !== deletedRewardId))
      setRewardSuccessMessage(t('dashboard.success.rewardDeleted'))
      setIsDeleteRewardOpen(false)
      setSelectedReward(null)
    } catch (error) {
      if (error instanceof RewardServiceError) {
        setDeleteRewardErrorMessage(error.message)
        return
      }
      console.error('Failed to delete reward', error)
      setDeleteRewardErrorMessage(t('dashboard.errors.deleteRewardFailed'))
    } finally {
      setIsDeletingReward(false)
    }
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
      setChildSuccessMessage(t('dashboard.success.childAdded', { name: mappedKid.name }))
      setIsAddChildOpen(false)
    } catch (error) {
      if (error instanceof ChildServiceError) {
        setCreateChildErrorMessage(error.message)
        setCreateChildFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to create child account', error)
      setCreateChildErrorMessage(t('dashboard.errors.createChildFailed'))
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
      setChildSuccessMessage(t('dashboard.success.childUpdated', { name: mappedKid.name }))
      setIsEditChildOpen(false)
      setSelectedChild(null)
    } catch (error) {
      if (error instanceof ChildServiceError) {
        setUpdateChildErrorMessage(error.message)
        setUpdateChildFieldErrors(error.fieldErrors)
        return
      }
      console.error('Failed to update child account', error)
      setUpdateChildErrorMessage(t('dashboard.errors.updateChildFailed'))
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
      setKids((prev) => prev.filter((kid) => kid.id !== selectedChild.id))
      setChildSuccessMessage(t('dashboard.success.childRemoved', { name: selectedChild.name }))
      setIsDeleteChildOpen(false)
      setSelectedChild(null)
    } catch (error) {
      if (error instanceof ChildServiceError) {
        setDeleteChildErrorMessage(error.message)
        return
      }
      console.error('Failed to delete child account', error)
      setDeleteChildErrorMessage(t('dashboard.errors.deleteChildFailed'))
    } finally {
      setIsDeletingChild(false)
    }
  }

  const selectedChildNameParts = selectedChild ? deriveNameParts(selectedChild) : null

  if (isRedirectingForUnauthorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/40">
      <DashboardHeader
        isProfileOpen={isProfileOpen}
        onToggleProfile={() => setIsProfileOpen((prev) => !prev)}
        accountName={isChildView ? childName : parentName}
        accountLabel={isChildView ? t('dashboard.childRole') : t('dashboard.parentRole')}
        accountAvatar={isChildView ? '🧒' : '👩'}
        onLogout={() => void handleLogout()}
      />

      {state?.registered ? (
        <div className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {t('dashboard.success.accountCreatedWelcome', { name: isChildView ? childName : parentName })}
          </div>
        </div>
      ) : null}

      {isChildView ? (
        <div className="mx-auto w-full max-w-[1600px] gap-6 px-4 py-6 sm:px-6 xl:px-10">
          <div className="space-y-6">
            <OverviewSection parentName={childName} level={level} points={points} nextLevelPoints={nextLevelPoints} />
            <ChildDashboardPage
              childName={childName}
              points={points}
              level={level}
              nextLevelPoints={nextLevelPoints}
              completedChildChoreCount={completedChildChoreCount}
              pendingChildChoreCount={pendingChildChoreCount}
              childCompletionErrorMessage={childCompletionErrorMessage}
              chores={visibleChores}
              completingChoreId={completingChoreId}
              revertingChoreId={revertingChoreId}
              onCompleteChore={handleCompleteChildChore}
              onRevertChore={handleRevertChildChore}
            />
          </div>
        </div>
      ) : (
        <ParentDashboardPage
          parentName={parentName}
          accountType={parentAccountType}
          kids={kids}
          chores={chores}
          rewards={rewards}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onAddChore={openAddChoreDialog}
          onToggleChore={handleToggleChore}
          onEditChore={openEditChoreDialog}
          onDeleteChore={openDeleteChoreDialog}
          onAddReward={openAddRewardDialog}
          onEditReward={openEditRewardDialog}
          onDeleteReward={openDeleteRewardDialog}
          onAddChild={openAddChildDialog}
          onEditChild={openEditChildDialog}
          onDeleteChild={openDeleteChildDialog}
        />
      )}

      {isAddChoreOpen ? (
        <AddChoreForm
          isOpen={isAddChoreOpen}
          isSubmitting={isCreatingChore}
          kids={kids}
          errorMessage={createChoreErrorMessage}
          fieldErrors={createChoreFieldErrors}
          onClose={closeAddChoreDialog}
          onSubmit={handleCreateChore}
        />
      ) : null}

      {isEditChoreOpen && selectedChore ? (
        <EditChoreForm
          key={selectedChore.id}
          isOpen={isEditChoreOpen}
          isSubmitting={isUpdatingChore}
          kids={kids}
          errorMessage={updateChoreErrorMessage}
          fieldErrors={updateChoreFieldErrors}
          initialValues={{
            title: selectedChore.title,
            description: selectedChore.description,
            points: selectedChore.points,
            assignedChildId: selectedChore.childId,
            dueDate: selectedChore.dueDate ?? '',
            status: selectedChore.status,
          }}
          onClose={closeEditChoreDialog}
          onSubmit={handleUpdateChore}
        />
      ) : null}

      {isDeleteChoreOpen && selectedChore ? (
        <DeleteChoreDialog
          isOpen={isDeleteChoreOpen}
          choreTitle={selectedChore.title}
          isDeleting={isDeletingChore}
          errorMessage={deleteChoreErrorMessage}
          onClose={closeDeleteChoreDialog}
          onConfirm={handleDeleteChore}
        />
      ) : null}

      {isAddRewardOpen ? (
        <AddRewardForm
          key={addRewardFormKey}
          isOpen={isAddRewardOpen}
          isSubmitting={isCreatingReward}
          errorMessage={createRewardErrorMessage}
          fieldErrors={createRewardFieldErrors}
          onClose={closeAddRewardDialog}
          onSubmit={handleCreateReward}
        />
      ) : null}

      {isEditRewardOpen && selectedReward ? (
        <EditRewardForm
          key={selectedReward.id}
          isOpen={isEditRewardOpen}
          isSubmitting={isUpdatingReward}
          errorMessage={updateRewardErrorMessage}
          fieldErrors={updateRewardFieldErrors}
          initialValues={{
            name: selectedReward.name,
            description: selectedReward.description,
            pointCost: selectedReward.pointsCost,
            category: selectedReward.category,
            active: selectedReward.active,
          }}
          onClose={closeEditRewardDialog}
          onSubmit={handleUpdateReward}
        />
      ) : null}

      {isDeleteRewardOpen && selectedReward ? (
        <DeleteRewardDialog
          isOpen={isDeleteRewardOpen}
          rewardName={selectedReward.name}
          isDeleting={isDeletingReward}
          errorMessage={deleteRewardErrorMessage}
          onClose={closeDeleteRewardDialog}
          onConfirm={handleDeleteReward}
        />
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

      {childCompletionSuccessMessage ? (
        <div role="status" className="fixed bottom-4 right-4 z-40 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-md">
          {childCompletionSuccessMessage}
        </div>
      ) : null}

      {choreSuccessMessage ? (
        <div role="status" className="fixed bottom-20 right-4 z-40 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-md">
          {choreSuccessMessage}
        </div>
      ) : null}

      {rewardSuccessMessage ? (
        <div className="fixed bottom-36 right-4 z-40 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-md">
          {rewardSuccessMessage}
        </div>
      ) : null}
    </main>
  )
}

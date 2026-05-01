import type { ChoreRecurrencePayload } from '../../services/choreService'

export interface KidAccount {
  id: string
  name: string
  avatar: string
  username: string
  firstName?: string
  lastName?: string
  displayName?: string
}

export interface ChoreItem {
  id: string
  title: string
  description: string
  childId: string
  assignedChildName?: string
  points: number
  dueDate: string | null
  status: 'PENDING' | 'COMPLETED'
  completed: boolean
  recurring: boolean
  recurrenceSeriesId?: string | null
  recurrence?: ChoreRecurrencePayload | null
}

export interface RewardItem {
  id: string
  name: string
  description: string
  pointsCost: number
  category: string
  active: boolean
  icon: string
}

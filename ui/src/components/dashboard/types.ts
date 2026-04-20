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
  childId: string
  points: number
  completed: boolean
}

export interface RewardItem {
  id: string
  name: string
  pointsCost: number
  icon: string
}

export const formatDueDate = (dueDate: string | null, t: (key: string) => string): string => {
  if (!dueDate) return t('chores.noDueDate')
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!year || !month || !day) return dueDate
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC' }).format(parsedDate)
}

export const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type ChoreDateCategory = 'today' | 'upcoming' | 'past'

export const classifyChoreDate = (dueDate: string | null): ChoreDateCategory => {
  if (!dueDate) return 'today'
  const today = getTodayDateString()
  if (dueDate === today) return 'today'
  if (dueDate > today) return 'upcoming'
  return 'past'
}

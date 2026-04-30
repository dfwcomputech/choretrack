export const formatDueDate = (dueDate: string | null, t: (key: string) => string): string => {
  if (!dueDate) return t('chores.noDueDate')
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!year || !month || !day) return dueDate
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC' }).format(parsedDate)
}

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface ChildDaySwipeNavigatorProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

const addDays = (date: string, days: number) => {
  const [year, month, day] = date.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return date
  const next = new Date(Date.UTC(year, month - 1, day))
  next.setUTCDate(next.getUTCDate() + days)
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`
}

const formatSelectedDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return date
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  )
}

export default function ChildDaySwipeNavigator({ selectedDate, onDateChange }: ChildDaySwipeNavigatorProps) {
  const { t } = useTranslation()
  const touchStartX = useRef<number | null>(null)

  const changeDay = (days: number) => onDateChange(addDays(selectedDate, days))

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current
        const endX = event.changedTouches[0]?.clientX
        touchStartX.current = null
        if (startX == null || endX == null) return
        const delta = endX - startX
        if (Math.abs(delta) < 40) return
        changeDay(delta < 0 ? 1 : -1)
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => changeDay(-1)}
        >
          {t('children.previousDay')}
        </button>
        <p className="text-center text-sm font-bold text-slate-900">
          {t('children.selectedDay', { day: formatSelectedDate(selectedDate) })}
        </p>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => changeDay(1)}
        >
          {t('children.nextDay')}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">{t('children.swipeHint')}</p>
    </section>
  )
}

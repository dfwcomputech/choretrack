import { useTranslation } from 'react-i18next'

interface OverviewSectionProps {
  parentName: string
  level: number
  points: number
  nextLevelPoints: number
}

export default function OverviewSection({ parentName, level, points, nextLevelPoints }: OverviewSectionProps) {
  const { t } = useTranslation()
  const progress = Math.min((points / nextLevelPoints) * 100, 100)
  const pointsRemaining = Math.max(nextLevelPoints - points, 0)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('dashboard.welcomeBack', { name: parentName })}</h1>
      <p className="mt-4 text-3xl font-semibold text-slate-800">
        {t('common.levelWithCount', { count: level })} <span className="text-slate-500">— {points} / {nextLevelPoints} {t('common.pts')}</span>
      </p>
      <div className="mt-4 h-4 overflow-hidden rounded-full bg-primary-100">
        <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xl text-slate-600">{t('dashboard.pointsToNextLevel', { points: pointsRemaining, level: level + 1 })} 🎉</p>
    </section>
  )
}

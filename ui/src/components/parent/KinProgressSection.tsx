import ChildBattlePassCard from './ChildBattlePassCard'
import { useTranslation } from 'react-i18next'

export interface ChildProgressSummary {
  id: string
  name: string
  avatar: string
  points: number
  level: number
  progressToNextLevel: number
  nextRewardName: string
}

interface KinProgressSectionProps {
  childrenProgress: ChildProgressSummary[]
}

export default function KinProgressSection({ childrenProgress }: KinProgressSectionProps) {
  const { t } = useTranslation()
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">{t('children.progressTitle')}</h2>
        <p className="text-sm text-slate-600">{t('children.progressSubtitle')}</p>
      </div>

      {childrenProgress.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-600">
          {t('children.progressEmpty')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {childrenProgress.map((childProgress) => (
            <ChildBattlePassCard
              key={childProgress.id}
              childName={childProgress.name}
              childAvatar={childProgress.avatar}
              points={childProgress.points}
              level={childProgress.level}
              progressToNextLevel={childProgress.progressToNextLevel}
              nextRewardName={childProgress.nextRewardName}
            />
          ))}
        </div>
      )}
    </section>
  )
}

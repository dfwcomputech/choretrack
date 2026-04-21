interface ChildBattlePassCardProps {
  childName: string
  childAvatar: string
  points: number
  level: number
  progressToNextLevel: number
  nextRewardName: string
}

export default function ChildBattlePassCard({
  childName,
  childAvatar,
  points,
  level,
  progressToNextLevel,
  nextRewardName,
}: ChildBattlePassCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {childAvatar}
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{childName}</h3>
            <p className="text-sm text-slate-600">Level {level}</p>
          </div>
        </div>
        <p className="text-lg font-semibold text-primary-700">{points} pts</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${progressToNextLevel}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-600">Progress to next level: {Math.round(progressToNextLevel)}%</p>
      <p className="mt-1 text-sm text-slate-700">
        Next reward: <span className="font-semibold text-slate-900">{nextRewardName}</span>
      </p>
    </article>
  )
}

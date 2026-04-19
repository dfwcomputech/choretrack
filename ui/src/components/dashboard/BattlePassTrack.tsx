interface BattlePassTrackProps {
  points: number
}

const startPoints = 150
const endPoints = 400

export default function BattlePassTrack({ points }: BattlePassTrackProps) {
  const clamped = Math.max(startPoints, Math.min(points, endPoints))
  const progress = ((clamped - startPoints) / (endPoints - startPoints)) * 100

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">Battle Pass track for earning and redeeming rewards</h3>
      <div className="mt-4 relative">
        <div className="h-3 rounded-full bg-slate-200" />
        <div
          className="absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-300"
          style={{ width: `${progress}%` }}
        />
        <div className="mt-4 flex items-center justify-between text-3xl">
          <span>📦</span>
          <span>🎁</span>
          <span>🏆</span>
        </div>
        <div className="mt-3 grid grid-cols-3 text-center text-lg font-semibold text-slate-700">
          <p>Level 2</p>
          <p>{points} / 300 pts</p>
          <p>Level 4</p>
        </div>
      </div>
    </section>
  )
}

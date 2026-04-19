import type { KidAccount } from './types'

interface KinSectionProps {
  parentName: string
  kids: KidAccount[]
  onAddChild: () => void
}

export default function KinSection({ parentName, kids, onAddChild }: KinSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Kin</h2>
        <button
          type="button"
          onClick={onAddChild}
          className="rounded-xl bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-700 hover:bg-primary-200"
        >
          + Add Child Account
        </button>
      </div>

      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👩</span>
            <div>
              <p className="text-xl font-semibold text-slate-900">{parentName}</p>
              <p className="text-slate-600">(parent)</p>
            </div>
          </div>
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-white">
            Dashboard
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {kids.map((kid) => (
          <li key={kid.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{kid.avatar}</span>
                <div>
                  <p className="text-xl font-semibold text-slate-900">{kid.name}</p>
                  <p className="text-slate-600">@{kid.username}</p>
                </div>
              </div>
              <button type="button" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Login Info
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

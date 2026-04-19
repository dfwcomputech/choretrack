import { CheckSquare, Gift, Settings, Users } from 'lucide-react'

const navItems = [
  { id: 'chores', label: 'Chores', icon: CheckSquare },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'kin', label: 'Kin', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface DashboardSidebarProps {
  activeNav: string
  onNavChange: (id: string) => void
  onAddChore: () => void
}

export default function DashboardSidebar({ activeNav, onNavChange, onAddChore }: DashboardSidebarProps) {
  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
      <nav className="space-y-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavChange(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium transition ${
              activeNav === id ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="my-5 border-t border-slate-100" />

      <button
        type="button"
        onClick={onAddChore}
        className="w-full rounded-xl bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow hover:bg-primary-700"
      >
        + Add Chore
      </button>
    </aside>
  )
}

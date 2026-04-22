import { BarChart3, CheckSquare, ChevronLeft, ChevronRight, Gift, Settings, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const navItems = [
  { id: 'dashboard', labelKey: 'dashboard.nav.dashboard', icon: BarChart3 },
  { id: 'kin', labelKey: 'dashboard.nav.kin', icon: Users },
  { id: 'chores', labelKey: 'dashboard.nav.chores', icon: CheckSquare },
  { id: 'rewards', labelKey: 'dashboard.nav.rewards', icon: Gift },
  { id: 'settings', labelKey: 'dashboard.nav.settings', icon: Settings },
] as const

interface SidebarProps {
  activeNav: string
  onNavChange: (id: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ activeNav, onNavChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { t } = useTranslation()
  return (
    <aside
      className={`w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-sm transition-all lg:sticky lg:top-24 lg:h-fit ${
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-2">
        <p className={`text-xs font-semibold uppercase tracking-wide text-slate-500 ${isCollapsed ? 'lg:hidden' : ''}`}>{t('dashboard.parentMenu')}</p>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          aria-label={isCollapsed ? t('dashboard.expandSidebar') : t('dashboard.collapseSidebar')}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavChange(id)}
            className={`flex w-full items-center rounded-xl px-3 py-3 text-left font-medium transition ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${activeNav === id ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title={isCollapsed ? t(labelKey) : undefined}
          >
            <Icon className="h-5 w-5" />
            <span className={isCollapsed ? 'lg:hidden' : ''}>{t(labelKey)}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

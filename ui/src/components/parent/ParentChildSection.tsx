import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChoreItem, KidAccount } from '../dashboard/types'
import { classifyChoreDate, type ChoreDateCategory } from '../../utils/dateFormatters'
import ChildChoreGroup from './ChildChoreGroup'

interface ParentChildSectionProps {
  kid: KidAccount
  chores: ChoreItem[]
  points: number
  level: number
  onAddChore: (childId?: string) => void
  onToggleChore: (id: string) => void
  onEditChore: (chore: ChoreItem) => void
  onDeleteChore: (chore: ChoreItem) => void
}

const TABS: { key: ChoreDateCategory; icon: string; labelKey: string }[] = [
  { key: 'today', icon: '🔁', labelKey: 'chores.tabs.today' },
  { key: 'upcoming', icon: '📅', labelKey: 'chores.tabs.upcoming' },
  { key: 'past', icon: '🕐', labelKey: 'chores.tabs.past' },
]

export default function ParentChildSection({
  kid,
  chores,
  points,
  level,
  onAddChore,
  onToggleChore,
  onEditChore,
  onDeleteChore,
}: ParentChildSectionProps) {
  const { t } = useTranslation()
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<ChoreDateCategory>('today')

  const todayChores = chores.filter((chore) => classifyChoreDate(chore.dueDate) === 'today')
  const upcomingChores = chores.filter((chore) => classifyChoreDate(chore.dueDate) === 'upcoming')
  const pastChores = chores.filter((chore) => classifyChoreDate(chore.dueDate) === 'past')

  const choreCounts: Record<ChoreDateCategory, number> = {
    today: todayChores.length,
    upcoming: upcomingChores.length,
    past: pastChores.length,
  }

  const choresByTab: Record<ChoreDateCategory, ChoreItem[]> = {
    today: todayChores,
    upcoming: upcomingChores,
    past: pastChores,
  }

  const activeChores = choresByTab[activeTab]
  const activeTabConfig = TABS.find((tab) => tab.key === activeTab) ?? TABS[0]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsSectionCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left"
        aria-expanded={!isSectionCollapsed}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            {kid.avatar}
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{kid.name}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>@{kid.username}</span>
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                {t('common.levelWithCount', { count: level })}
              </span>
              <span className="font-medium text-emerald-700">{points} {t('common.pts')}</span>
            </div>
          </div>
        </div>
        <span className="text-slate-400 transition-transform" style={{ transform: isSectionCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {!isSectionCollapsed ? (
        <div className="border-t border-slate-100 px-6 pb-6 pt-4">
          <div className="mb-4 flex gap-1 rounded-2xl bg-slate-100 p-1" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{t(tab.labelKey)}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {choreCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <ChildChoreGroup
            title={t(activeTabConfig.labelKey)}
            icon={activeTabConfig.icon}
            chores={activeChores}
            onToggleChore={onToggleChore}
            onEditChore={onEditChore}
            onDeleteChore={onDeleteChore}
            onAddChore={() => onAddChore(kid.id)}
            addLabel={t('chores.addChore')}
            hideTitleBar
          />
        </div>
      ) : null}
    </section>
  )
}

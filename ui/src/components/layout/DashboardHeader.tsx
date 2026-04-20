import { ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'

interface DashboardHeaderProps {
  isProfileOpen: boolean
  onToggleProfile: () => void
  accountName: string
  accountLabel?: string
  accountAvatar?: string
  onLogout: () => void
}

export default function DashboardHeader({
  isProfileOpen,
  onToggleProfile,
  accountName,
  accountLabel = 'Parent',
  accountAvatar = '👩',
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary-100 px-2 py-1 text-2xl">🏠</span>
          <div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">ChoreTrack</p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleProfile}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {accountLabel}
            <ChevronDown className="h-4 w-4" />
          </button>

          {isProfileOpen ? (
            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <span className="text-2xl">{accountAvatar}</span>
                <p className="font-semibold text-slate-900">{accountName}</p>
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

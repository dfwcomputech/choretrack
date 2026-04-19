import { Link, useLocation } from 'react-router-dom'

interface DashboardState {
  registered?: boolean
  username?: string
  firstName?: string
}

export default function DashboardPage() {
  const location = useLocation()
  const state = (location.state as DashboardState | null) ?? null
  const displayName = state?.firstName?.trim() || state?.username?.trim() || 'there'

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        {state?.registered ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            Account created successfully. Welcome, {displayName}!
          </div>
        ) : null}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-3 text-gray-600">
            Your account is ready. This is a placeholder dashboard and will be expanded with chore tracking features.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/app"
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Open chores app
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Return to landing page
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

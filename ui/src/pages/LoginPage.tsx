import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../context/useAuth'

interface LoginLocationState {
  registered?: boolean
  username?: string
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LoginLocationState | null) ?? null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link to="/" className="text-primary-700 font-semibold hover:text-primary-800">
            ← Back to landing page
          </Link>
          <p className="text-sm text-gray-600">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
              Create account
            </Link>
          </p>
        </div>

        {state?.registered ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Account created successfully. Please log in to continue.
          </div>
        ) : null}

        <LoginForm
          initialIdentifier={state?.username ?? ''}
          onSuccess={() => {
            navigate('/dashboard', { replace: true })
          }}
        />
      </div>
    </main>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm'
import type { RegistrationResponse } from '../services/authService'

export default function RegisterPage() {
  const navigate = useNavigate()

  const handleSuccess = (registration: RegistrationResponse) => {
    navigate('/dashboard', {
      replace: true,
      state: {
        registered: true,
        username: registration.username,
        firstName: registration.firstName,
      },
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link to="/" className="text-primary-700 font-semibold hover:text-primary-800">
            ← Back to landing page
          </Link>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Log in
            </Link>
          </p>
        </div>
        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
}

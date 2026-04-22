import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RegisterForm from '../components/auth/RegisterForm'
import type { RegistrationResponse } from '../services/authService'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSuccess = (registration: RegistrationResponse) => {
    navigate('/login', {
      replace: true,
      state: {
        registered: true,
        username: registration.username,
      },
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link to="/" className="text-primary-700 font-semibold hover:text-primary-800">
            ← {t('auth.backToLanding')}
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
                {t('auth.logIn')}
              </Link>
            </p>
            <LanguageSwitcher className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors" />
          </div>
        </div>
        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
}

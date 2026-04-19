import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AuthServiceError } from '../../services/authService'
import { useAuth } from '../../context/useAuth'

interface LoginFormProps {
  onSuccess: () => void
  initialIdentifier?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginForm({ onSuccess, initialIdentifier = '' }: LoginFormProps) {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState(initialIdentifier)
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasErrors = useMemo(() => Object.keys(fieldErrors).length > 0, [fieldErrors])

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    const trimmedIdentifier = identifier.trim()

    if (!trimmedIdentifier) {
      errors.identifier = 'Username or email is required.'
    } else if (trimmedIdentifier.includes('@') && !emailPattern.test(trimmedIdentifier)) {
      errors.identifier = 'Enter a valid email address.'
    }

    if (!password.trim()) {
      errors.password = 'Password is required.'
    }

    return errors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validate()
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await login({ username: identifier.trim(), password })
      setPassword('')
      onSuccess()
    } catch (error) {
      if (error instanceof AuthServiceError) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Unable to login right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const identifierDescribedBy = fieldErrors.identifier ? 'identifier-error' : undefined
  const passwordDescribedBy = fieldErrors.password ? 'password-error' : undefined

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Log in to ChoreTrack</h1>
      <p className="text-sm text-gray-600">Welcome back! Enter your account details to continue.</p>

      <div>
        <label htmlFor="identifier" className="block mb-1.5 text-sm font-medium text-gray-700">
          Username or email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          value={identifier}
          onChange={(event) => {
            setIdentifier(event.target.value)
            if (fieldErrors.identifier) {
              setFieldErrors((previous) => {
                const next = { ...previous }
                delete next.identifier
                return next
              })
            }
          }}
          aria-invalid={fieldErrors.identifier ? 'true' : 'false'}
          aria-describedby={identifierDescribedBy}
          autoComplete="username"
          className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
            fieldErrors.identifier
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
              : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
          }`}
        />
        {fieldErrors.identifier ? (
          <p id="identifier-error" role="alert" className="mt-1 text-xs text-red-600">
            {fieldErrors.identifier}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (fieldErrors.password) {
              setFieldErrors((previous) => {
                const next = { ...previous }
                delete next.password
                return next
              })
            }
          }}
          aria-invalid={fieldErrors.password ? 'true' : 'false'}
          aria-describedby={passwordDescribedBy}
          autoComplete="current-password"
          className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
            fieldErrors.password
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
              : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
          }`}
        />
        {fieldErrors.password ? (
          <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-lg text-white font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      {hasErrors ? <p className="text-xs text-gray-500">Please fix the highlighted fields.</p> : null}
    </form>
  )
}

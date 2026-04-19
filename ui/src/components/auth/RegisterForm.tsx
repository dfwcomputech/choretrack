import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AuthServiceError, registerUser, type RegistrationResponse } from '../../services/authService'

type FormValues = {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

interface RegisterFormProps {
  onSuccess: (response: RegistrationResponse) => void
}

const initialValues: FormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const minimumPasswordLength = 8

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasErrors = useMemo(() => Object.keys(fieldErrors).length > 0, [fieldErrors])

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!values.username.trim()) {
      errors.username = 'Username is required.'
    }
    if (!values.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!emailPattern.test(values.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!values.password) {
      errors.password = 'Password is required.'
    } else if (values.password.length < minimumPasswordLength) {
      errors.password = `Password must be at least ${minimumPasswordLength} characters.`
    }
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.'
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords must match.'
    }
    if (!values.firstName.trim()) {
      errors.firstName = 'First name is required.'
    }
    if (!values.lastName.trim()) {
      errors.lastName = 'Last name is required.'
    }
    return errors
  }

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous
      }
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    setSuccessMessage('')

    const nextErrors = validate()
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await registerUser({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      })
      setSuccessMessage('Account created successfully. Redirecting to your dashboard...')
      onSuccess(response)
    } catch (error) {
      if (error instanceof AuthServiceError) {
        if (Object.keys(error.fieldErrors).length > 0) {
          setFieldErrors((previous) => ({ ...previous, ...error.fieldErrors }))
        }
        setSubmitError(error.message)
      } else {
        setSubmitError('Unable to create your account right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="text-sm text-gray-600">Get started with ChoreTrack in less than a minute.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="First name"
          id="firstName"
          value={values.firstName}
          onChange={(value) => updateValue('firstName', value)}
          error={fieldErrors.firstName}
          autoComplete="given-name"
        />
        <InputField
          label="Last name"
          id="lastName"
          value={values.lastName}
          onChange={(value) => updateValue('lastName', value)}
          error={fieldErrors.lastName}
          autoComplete="family-name"
        />
      </div>

      <InputField
        label="Username"
        id="username"
        value={values.username}
        onChange={(value) => updateValue('username', value)}
        error={fieldErrors.username}
        autoComplete="username"
      />
      <InputField
        label="Email"
        id="email"
        type="email"
        value={values.email}
        onChange={(value) => updateValue('email', value)}
        error={fieldErrors.email}
        autoComplete="email"
      />
      <InputField
        label="Password"
        id="password"
        type="password"
        value={values.password}
        onChange={(value) => updateValue('password', value)}
        error={fieldErrors.password}
        autoComplete="new-password"
      />
      <InputField
        label="Confirm password"
        id="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={(value) => updateValue('confirmPassword', value)}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}
      {successMessage ? (
        <p role="status" className="text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-lg text-white font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
      {hasErrors ? <p className="text-xs text-gray-500">Please fix the highlighted fields.</p> : null}
    </form>
  )
}

interface InputFieldProps {
  label: string
  id: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete?: string
}

function InputField({ label, id, type = 'text', value, onChange, error, autoComplete }: InputFieldProps) {
  const describedBy = error ? `${id}-error` : undefined

  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
            : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
        }`}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

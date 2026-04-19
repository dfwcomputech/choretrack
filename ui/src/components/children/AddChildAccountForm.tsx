import { useState } from 'react'
import type { CreateChildAccountPayload } from '../../services/childService'

interface AddChildAccountFormProps {
  isOpen: boolean
  isSubmitting: boolean
  errorMessage: string
  fieldErrors: Record<string, string>
  onClose: () => void
  onSubmit: (payload: CreateChildAccountPayload) => Promise<void>
}

const usernamePattern = /^[A-Za-z0-9_]+$/

export default function AddChildAccountForm({
  isOpen,
  isSubmitting,
  errorMessage,
  fieldErrors,
  onClose,
  onSubmit,
}: AddChildAccountFormProps) {
  const [formValues, setFormValues] = useState<CreateChildAccountPayload>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    displayName: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleInputChange = (field: keyof CreateChildAccountPayload, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setValidationErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formValues.username.trim()) {
      nextErrors.username = 'Username is required.'
    } else if (!usernamePattern.test(formValues.username.trim())) {
      nextErrors.username = 'Username can only include letters, numbers, and underscores.'
    }
    if (!formValues.password) {
      nextErrors.password = 'Password is required.'
    } else if (formValues.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (!formValues.firstName.trim()) {
      nextErrors.firstName = 'First name is required.'
    }
    setValidationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({
      username: formValues.username.trim(),
      password: formValues.password,
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      displayName: formValues.displayName.trim(),
    })
  }

  const modalClassName = 'fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4'
  const mergedFieldErrors = { ...validationErrors, ...fieldErrors }

  return (
    <div className={modalClassName}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-slate-900">Create Child Account</h3>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold text-slate-600">
              Username
              <input
                value={formValues.username}
                onChange={(event) => handleInputChange('username', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="avery123"
                autoComplete="username"
                aria-invalid={Boolean(mergedFieldErrors.username)}
              />
              {mergedFieldErrors.username ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.username}</p> : null}
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Password
              <input
                type="password"
                value={formValues.password}
                onChange={(event) => handleInputChange('password', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={Boolean(mergedFieldErrors.password)}
              />
              {mergedFieldErrors.password ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.password}</p> : null}
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              First Name
              <input
                value={formValues.firstName}
                onChange={(event) => handleInputChange('firstName', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Avery"
                autoComplete="given-name"
                aria-invalid={Boolean(mergedFieldErrors.firstName)}
              />
              {mergedFieldErrors.firstName ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.firstName}</p> : null}
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Last Name
              <input
                value={formValues.lastName}
                onChange={(event) => handleInputChange('lastName', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Johnson"
                autoComplete="family-name"
                aria-invalid={Boolean(mergedFieldErrors.lastName)}
              />
              {mergedFieldErrors.lastName ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.lastName}</p> : null}
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Display Name
              <input
                value={formValues.displayName}
                onChange={(event) => handleInputChange('displayName', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Avery J"
                autoComplete="name"
                aria-invalid={Boolean(mergedFieldErrors.displayName)}
              />
              {mergedFieldErrors.displayName ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.displayName}</p> : null}
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Creating...' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

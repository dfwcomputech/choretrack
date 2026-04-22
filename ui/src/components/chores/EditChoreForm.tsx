import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { KidAccount } from '../dashboard/types'
import type { ChoreStatus, UpdateChorePayload } from '../../services/choreService'

interface EditChoreFormProps {
  isOpen: boolean
  isSubmitting: boolean
  kids: KidAccount[]
  errorMessage: string
  fieldErrors: Record<string, string>
  initialValues: {
    title: string
    description: string
    points: number
    assignedChildId: string
    dueDate: string
    status: ChoreStatus
  }
  onClose: () => void
  onSubmit: (payload: UpdateChorePayload) => Promise<void>
}

interface ChoreFormValues {
  title: string
  description: string
  points: number
  assignedChildId: string
  dueDate: string
  status: ChoreStatus
}

export default function EditChoreForm({
  isOpen,
  isSubmitting,
  kids,
  errorMessage,
  fieldErrors,
  initialValues,
  onClose,
  onSubmit,
}: EditChoreFormProps) {
  const { t } = useTranslation()
  const [formValues, setFormValues] = useState<ChoreFormValues>(initialValues)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null
  const selectedChildId = kids.some((kid) => kid.id === formValues.assignedChildId) ? formValues.assignedChildId : (kids[0]?.id ?? '')

  const handleInputChange = <T extends keyof ChoreFormValues>(field: T, value: ChoreFormValues[T]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setValidationErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formValues.title.trim()) {
      nextErrors.title = t('chores.validation.titleRequired')
    }
    if (!Number.isFinite(formValues.points) || formValues.points <= 0) {
      nextErrors.points = t('chores.validation.pointsPositive')
    }
    if (!selectedChildId.trim()) {
      nextErrors.assignedChildId = t('chores.validation.assignedChildRequired')
    } else if (!kids.some((kid) => kid.id === selectedChildId)) {
      nextErrors.assignedChildId = t('chores.validation.assignedChildInvalid')
    }
    setValidationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      points: formValues.points,
      assignedChildId: selectedChildId,
      dueDate: formValues.dueDate || undefined,
      status: formValues.status,
    })
  }

  const mergedFieldErrors = { ...validationErrors, ...fieldErrors }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-slate-900">{t('chores.editChore')}</h3>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="mt-4 space-y-3">
            <label htmlFor="edit-chore-title" className="block text-sm font-semibold text-slate-600">
              {t('chores.title')}
              <input
                id="edit-chore-title"
                value={formValues.title}
                onChange={(event) => handleInputChange('title', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                aria-invalid={Boolean(mergedFieldErrors.title)}
              />
              {mergedFieldErrors.title ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.title}</p> : null}
            </label>
            <label htmlFor="edit-chore-description" className="block text-sm font-semibold text-slate-600">
              {t('chores.description')}
              <textarea
                id="edit-chore-description"
                value={formValues.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
              />
            </label>
            <label htmlFor="edit-chore-child" className="block text-sm font-semibold text-slate-600">
              {t('chores.assignedChild')}
              <select
                id="edit-chore-child"
                value={selectedChildId}
                onChange={(event) => handleInputChange('assignedChildId', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                aria-invalid={Boolean(mergedFieldErrors.assignedChildId)}
              >
                <option value="" disabled>
                  {t('chores.selectChild')}
                </option>
                {kids.map((kid) => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name}
                  </option>
                ))}
              </select>
              {mergedFieldErrors.assignedChildId ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.assignedChildId}</p> : null}
            </label>
            <label htmlFor="edit-chore-points" className="block text-sm font-semibold text-slate-600">
              {t('common.points')}
              <input
                id="edit-chore-points"
                type="number"
                min={1}
                value={formValues.points}
                onChange={(event) => {
                  const parsed = Number(event.target.value)
                  handleInputChange('points', Number.isFinite(parsed) ? parsed : 0)
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                aria-invalid={Boolean(mergedFieldErrors.points)}
              />
              {mergedFieldErrors.points ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.points}</p> : null}
            </label>
            <label htmlFor="edit-chore-due-date" className="block text-sm font-semibold text-slate-600">
              {t('chores.dueDate')}
              <input
                id="edit-chore-due-date"
                type="date"
                value={formValues.dueDate}
                onChange={(event) => handleInputChange('dueDate', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label htmlFor="edit-chore-status" className="block text-sm font-semibold text-slate-600">
              {t('chores.status')}
              <select
                id="edit-chore-status"
                value={formValues.status}
                onChange={(event) => handleInputChange('status', event.target.value as ChoreStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="PENDING">{t('common.pending')}</option>
                <option value="COMPLETED">{t('common.completed')}</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || kids.length === 0}
              className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

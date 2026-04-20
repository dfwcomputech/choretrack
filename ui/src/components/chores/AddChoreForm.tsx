import { useState } from 'react'
import type { KidAccount } from '../dashboard/types'
import type { CreateChorePayload } from '../../services/choreService'

interface AddChoreFormProps {
  isOpen: boolean
  isSubmitting: boolean
  kids: KidAccount[]
  errorMessage: string
  fieldErrors: Record<string, string>
  onClose: () => void
  onSubmit: (payload: CreateChorePayload) => Promise<void>
}

interface ChoreFormValues {
  title: string
  description: string
  points: number
  assignedChildId: string
  dueDate: string
  status: 'PENDING' | 'COMPLETED'
}

export default function AddChoreForm({ isOpen, isSubmitting, kids, errorMessage, fieldErrors, onClose, onSubmit }: AddChoreFormProps) {
  const [formValues, setFormValues] = useState<ChoreFormValues>({
    title: '',
    description: '',
    points: 10,
    assignedChildId: kids[0]?.id ?? '',
    dueDate: '',
    status: 'PENDING',
  })
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
      nextErrors.title = 'Title is required.'
    }
    if (!Number.isFinite(formValues.points) || formValues.points <= 0) {
      nextErrors.points = 'Points must be positive.'
    }
    if (!selectedChildId.trim()) {
      nextErrors.assignedChildId = 'Assigned child is required.'
    } else if (!kids.some((kid) => kid.id === selectedChildId)) {
      nextErrors.assignedChildId = 'Please select a valid child account.'
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
        <h3 className="text-2xl font-bold text-slate-900">Add Chore</h3>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="mt-4 space-y-3">
            <label htmlFor="add-chore-title" className="block text-sm font-semibold text-slate-600">
              Title
              <input
                id="add-chore-title"
                value={formValues.title}
                onChange={(event) => handleInputChange('title', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Take out trash"
                aria-invalid={Boolean(mergedFieldErrors.title)}
              />
              {mergedFieldErrors.title ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.title}</p> : null}
            </label>
            <label htmlFor="add-chore-description" className="block text-sm font-semibold text-slate-600">
              Description
              <textarea
                id="add-chore-description"
                value={formValues.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
                placeholder="Empty dishwasher and wipe counters"
              />
            </label>
            <label htmlFor="add-chore-child" className="block text-sm font-semibold text-slate-600">
              Assigned Child
              <select
                id="add-chore-child"
                value={selectedChildId}
                onChange={(event) => handleInputChange('assignedChildId', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                aria-invalid={Boolean(mergedFieldErrors.assignedChildId)}
              >
                <option value="" disabled>
                  Select a child
                </option>
                {kids.map((kid) => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name}
                  </option>
                ))}
              </select>
              {mergedFieldErrors.assignedChildId ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.assignedChildId}</p> : null}
            </label>
            <label htmlFor="add-chore-points" className="block text-sm font-semibold text-slate-600">
              Points
              <input
                id="add-chore-points"
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
            <label htmlFor="add-chore-due-date" className="block text-sm font-semibold text-slate-600">
              Due Date
              <input
                id="add-chore-due-date"
                type="date"
                value={formValues.dueDate}
                onChange={(event) => handleInputChange('dueDate', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label htmlFor="add-chore-status" className="block text-sm font-semibold text-slate-600">
              Status
              <select
                id="add-chore-status"
                value={formValues.status}
                onChange={(event) => handleInputChange('status', event.target.value as ChoreFormValues['status'])}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || kids.length === 0}
              className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Adding...' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

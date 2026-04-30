import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { KidAccount } from '../dashboard/types'
import type { CreateChorePayload, RecurrenceDayOfWeek } from '../../services/choreService'
import ChoreLibraryModal from './ChoreLibraryModal'
import type { ChoreTemplateResponse } from '../../services/libraryService'

interface AddChoreFormProps {
  isOpen: boolean
  isSubmitting: boolean
  kids: KidAccount[]
  errorMessage: string
  fieldErrors: Record<string, string>
  prefill?: ChoreTemplateResponse | null
  defaultChildId?: string
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
  repeatDaily: boolean
  recurrenceStartDate: string
  recurrenceEndDate: string
  recurrenceDaysOfWeek: RecurrenceDayOfWeek[]
  recurrenceTimeOfDay: string
}

const recurrenceDayOptions: Array<{ value: RecurrenceDayOfWeek; label: string }> = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
]

export default function AddChoreForm({ isOpen, isSubmitting, kids, errorMessage, fieldErrors, prefill, defaultChildId, onClose, onSubmit }: AddChoreFormProps) {
  const { t } = useTranslation()
  const [formValues, setFormValues] = useState<ChoreFormValues>({
    title: '',
    description: '',
    points: 10,
    assignedChildId: defaultChildId ?? kids[0]?.id ?? '',
    dueDate: '',
    status: 'PENDING',
    repeatDaily: false,
    recurrenceStartDate: '',
    recurrenceEndDate: '',
    recurrenceDaysOfWeek: [],
    recurrenceTimeOfDay: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  useEffect(() => {
    if (isOpen && prefill) {
      setFormValues((prev) => ({
        ...prev,
        title: prefill.title,
        description: prefill.description ?? '',
        points: prefill.suggestedPoints,
      }))
    }
  }, [isOpen, prefill])

  if (!isOpen) return null
  const selectedChildId = kids.some((kid) => kid.id === formValues.assignedChildId) ? formValues.assignedChildId : (kids[0]?.id ?? '')

  const handleInputChange = <T extends keyof ChoreFormValues>(field: T, value: ChoreFormValues[T]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setValidationErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const toggleRecurrenceDay = (day: RecurrenceDayOfWeek) => {
    const nextDays = formValues.recurrenceDaysOfWeek.includes(day)
      ? formValues.recurrenceDaysOfWeek.filter((selectedDay) => selectedDay !== day)
      : [...formValues.recurrenceDaysOfWeek, day]
    handleInputChange('recurrenceDaysOfWeek', nextDays)
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
    if (formValues.repeatDaily) {
      if (!formValues.recurrenceStartDate) {
        nextErrors.recurrenceStartDate = t('chores.validation.recurrenceStartDateRequired')
      }
      if (!formValues.recurrenceEndDate) {
        nextErrors.recurrenceEndDate = t('chores.validation.recurrenceEndDateRequired')
      }
      if (
        formValues.recurrenceStartDate &&
        formValues.recurrenceEndDate &&
        formValues.recurrenceEndDate < formValues.recurrenceStartDate
      ) {
        nextErrors.recurrenceEndDate = t('chores.validation.recurrenceEndDateAfterStart')
      }
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
      dueDate: formValues.repeatDaily ? formValues.recurrenceStartDate || undefined : formValues.dueDate || undefined,
      status: formValues.status,
      recurrence: formValues.repeatDaily
        ? {
            type: 'DAILY',
            startDate: formValues.recurrenceStartDate,
            endDate: formValues.recurrenceEndDate,
            daysOfWeek: formValues.recurrenceDaysOfWeek.length > 0 ? formValues.recurrenceDaysOfWeek : undefined,
            timeOfDay: formValues.recurrenceTimeOfDay.trim() || undefined,
          }
        : undefined,
    })
  }

  const mergedFieldErrors = { ...validationErrors, ...fieldErrors }

  const handleSelectFromLibrary = (template: ChoreTemplateResponse) => {
    setFormValues((prev) => ({
      ...prev,
      title: template.title,
      description: template.description ?? '',
      points: template.suggestedPoints,
    }))
    setValidationErrors({})
  }

  return (
    <>
      <ChoreLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectFromLibrary}
      />
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 sm:items-center">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-bold text-slate-900">{t('chores.addChore')}</h3>
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="shrink-0 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            {t('library.browseLibrary')}
          </button>
        </div>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="mt-4 space-y-3">
            <label htmlFor="add-chore-title" className="block text-sm font-semibold text-slate-600">
              {t('chores.title')}
              <input
                id="add-chore-title"
                value={formValues.title}
                onChange={(event) => handleInputChange('title', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder={t('chores.placeholders.title')}
                aria-invalid={Boolean(mergedFieldErrors.title)}
              />
              {mergedFieldErrors.title ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.title}</p> : null}
            </label>
            <label htmlFor="add-chore-description" className="block text-sm font-semibold text-slate-600">
              {t('chores.description')}
              <textarea
                id="add-chore-description"
                value={formValues.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
                placeholder={t('chores.placeholders.description')}
              />
            </label>
            <label htmlFor="add-chore-child" className="block text-sm font-semibold text-slate-600">
              {t('chores.assignedChild')}
              <select
                id="add-chore-child"
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
            <label htmlFor="add-chore-points" className="block text-sm font-semibold text-slate-600">
              {t('common.points')}
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

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formValues.repeatDaily}
                onChange={(event) => handleInputChange('repeatDaily', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {t('chores.repeatDaily')}
            </label>

            {formValues.repeatDaily ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="add-chore-recurrence-start-date" className="block text-sm font-semibold text-slate-600">
                  {t('chores.recurrenceStartDate')}
                  <input
                    id="add-chore-recurrence-start-date"
                    type="date"
                    value={formValues.recurrenceStartDate}
                    onChange={(event) => handleInputChange('recurrenceStartDate', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    aria-invalid={Boolean(mergedFieldErrors.recurrenceStartDate)}
                  />
                  {mergedFieldErrors.recurrenceStartDate ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.recurrenceStartDate}</p> : null}
                </label>
                <label htmlFor="add-chore-recurrence-end-date" className="block text-sm font-semibold text-slate-600">
                  {t('chores.recurrenceEndDate')}
                  <input
                    id="add-chore-recurrence-end-date"
                    type="date"
                    value={formValues.recurrenceEndDate}
                    onChange={(event) => handleInputChange('recurrenceEndDate', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    aria-invalid={Boolean(mergedFieldErrors.recurrenceEndDate)}
                  />
                  {mergedFieldErrors.recurrenceEndDate ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.recurrenceEndDate}</p> : null}
                </label>
                <div>
                  <p className="text-sm font-semibold text-slate-600">{t('chores.recurrenceDaysOfWeek')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recurrenceDayOptions.map((day) => {
                      const selected = formValues.recurrenceDaysOfWeek.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleRecurrenceDay(day.value)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${selected ? 'border-primary-600 bg-primary-100 text-primary-800' : 'border-slate-300 bg-white text-slate-700'}`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <label htmlFor="add-chore-recurrence-time" className="block text-sm font-semibold text-slate-600">
                  {t('chores.recurrenceTimeOfDay')}
                  <input
                    id="add-chore-recurrence-time"
                    value={formValues.recurrenceTimeOfDay}
                    onChange={(event) => handleInputChange('recurrenceTimeOfDay', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder={t('chores.placeholders.recurrenceTimeOfDay')}
                  />
                </label>
              </div>
            ) : (
              <label htmlFor="add-chore-due-date" className="block text-sm font-semibold text-slate-600">
                {t('chores.dueDate')}
                <input
                  id="add-chore-due-date"
                  type="date"
                  value={formValues.dueDate}
                  onChange={(event) => handleInputChange('dueDate', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            )}

            <label htmlFor="add-chore-status" className="block text-sm font-semibold text-slate-600">
              {t('chores.status')}
              <select
                id="add-chore-status"
                value={formValues.status}
                onChange={(event) => handleInputChange('status', event.target.value as ChoreFormValues['status'])}
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
              {isSubmitting ? t('common.adding') : t('chores.addChore')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
